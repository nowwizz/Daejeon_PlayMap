import {
  defineComponent,
  onMounted,
  onBeforeUnmount,
  ref,
  computed,
  Transition,
} from "vue";
import { useAppStore } from "../store/useAppStore.js";
import { THEME, postCatStyle } from "../theme.js";
import SearchBar from "../components/SearchBar.jsx";

export default defineComponent({
  name: "CommunityPage",
  setup() {
    const {
      state,
      visiblePosts,
      toggleLike,
      openDetail,
      loadPosts,
      toggleSortMenu,
      selectSort,
      loadAllLocations,
    } = useAppStore();

    const topPosts = computed(() =>
      [...state.posts]
        .sort((a, b) => b.likes - a.likes || b.views - a.views)
        .slice(0, 5),
    );

    const tickerIndex = ref(0);
    const expanded = ref(false);
    let tickerTimer = null;

    const stopTicker = () => {
      if (tickerTimer) {
        clearInterval(tickerTimer);
        tickerTimer = null;
      }
    };
    const startTicker = () => {
      stopTicker();
      tickerTimer = setInterval(() => {
        if (topPosts.value.length === 0) return;
        tickerIndex.value = (tickerIndex.value + 1) % topPosts.value.length;
      }, 2500);
    };
    const toggleExpanded = () => {
      expanded.value = !expanded.value;
      if (expanded.value) {
        stopTicker();
      } else {
        tickerIndex.value = 0;
        startTicker();
      }
    };

    onMounted(() => {
      loadPosts();
      loadAllLocations();
      startTicker();
    });
    onBeforeUnmount(() => {
      stopTicker();
    });

    return () => (
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px 20px 24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <SearchBar />
        <div style={{ animation: "fadeIn .25s ease" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <div style={{ fontSize: "12.5px", color: "#888" }}>
              게시글 {state.posts.length}개
            </div>
            <div style={{ position: "relative" }}>
              <div
                onClick={toggleSortMenu}
                style={{
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#666",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {state.sortMode === "latest"
                  ? "최신순"
                  : state.sortMode === "popular"
                    ? "좋아요순"
                    : "조회수순"}{" "}
                ▾
              </div>
              {state.sortMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "22px",
                    right: 0,
                    background: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "10px",
                    boxShadow: "0 8px 20px -8px rgba(0,0,0,0.25)",
                    overflow: "hidden",
                    zIndex: 5,
                    width: "104px",
                    animation: "popIn .15s ease",
                    transformOrigin: "top right",
                  }}
                >
                  <div
                    onClick={() => selectSort("latest")}
                    style={{
                      padding: "9px 12px",
                      fontSize: "12.5px",
                      cursor: "pointer",
                    }}
                  >
                    최신순
                  </div>
                  <div
                    onClick={() => selectSort("popular")}
                    style={{
                      padding: "9px 12px",
                      fontSize: "12.5px",
                      cursor: "pointer",
                      borderTop: "1px solid #eee",
                    }}
                  >
                    좋아요순
                  </div>
                  <div
                    onClick={() => selectSort("views")}
                    style={{
                      padding: "9px 12px",
                      fontSize: "12.5px",
                      cursor: "pointer",
                      borderTop: "1px solid #eee",
                    }}
                  >
                    조회수순
                  </div>
                </div>
              )}
            </div>
          </div>

          {topPosts.value.length > 0 && (
            <div
              style={{
                border: "1px solid rgb(240, 170, 170)",
                borderRadius: "14px",
                background: "#ffdddd",
                marginBottom: "12px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    color: THEME.main,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    padding: "0 0 1px 0",
                  }}
                >
                  🔥 오늘의 인기글
                </div>
                {!expanded.value && (
                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      height: "18px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Transition name="ticker">
                      <div
                        key={
                          topPosts.value[
                            tickerIndex.value % topPosts.value.length
                          ].id
                        }
                        onClick={() =>
                          openDetail(
                            topPosts.value[
                              tickerIndex.value % topPosts.value.length
                            ].id,
                          )
                        }
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          cursor: "pointer",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            minWidth: 0,
                          }}
                        >
                          {
                            topPosts.value[
                              tickerIndex.value % topPosts.value.length
                            ].title
                          }
                        </span>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 500,
                            padding: "2px 7px",
                            borderRadius: "6px",
                            flexShrink: 0,
                            background: postCatStyle(
                              topPosts.value[
                                tickerIndex.value % topPosts.value.length
                              ].category,
                            ).bg,
                            color: postCatStyle(
                              topPosts.value[
                                tickerIndex.value % topPosts.value.length
                              ].category,
                            ).fg,
                          }}
                        >
                          {
                            topPosts.value[
                              tickerIndex.value % topPosts.value.length
                            ].category
                          }
                        </span>
                      </div>
                    </Transition>
                  </div>
                )}
                <div
                  onClick={toggleExpanded}
                  style={{
                    flexShrink: 0,
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "20px",
                    color: "#b37f7f",
                    marginLeft: "auto",
                    transition: "transform .2s ease",
                    transform: expanded.value
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                  }}
                >
                  ▾
                </div>
              </div>
              {expanded.value && (
                <div>
                  {topPosts.value.map((post, i) => (
                    <div
                      key={post.id}
                      onClick={() => openDetail(post.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "3px 12px 9px 12px",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 800,
                          color: "#ccc",
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          minWidth: 0,
                          fontSize: "12.5px",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {post.title}
                      </div>
                      <div
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 500,
                          padding: "2px 7px",
                          borderRadius: "6px",
                          flexShrink: 0,
                          background: postCatStyle(post.category).bg,
                          color: postCatStyle(post.category).fg,
                        }}
                      >
                        {post.category}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {visiblePosts.value.map((post) => (
              <div
                key={post.id}
                onClick={() => openDetail(post.id)}
                style={{
                  borderRadius: "14px",
                  padding: "14px",
                  background: "#9cd1c93a",
                  cursor: "pointer",
                  transition: "transform .16s ease, box-shadow .16s ease",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-2px) scale(1.01)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 10px rgba(0,0,0,0.04)";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "8px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "14px" }}>
                        {post.title}
                      </div>
                      <div
                        style={{
                          fontSize: "10.5px",
                          fontWeight: 500,
                          padding: "4px 8px",
                          borderRadius: "7px",
                          lineHeight: 1,
                          whiteSpace: "nowrap",
                          background: postCatStyle(post.category).bg,
                          color: postCatStyle(post.category).fg,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {post.category}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: THEME.main,
                        fontWeight: 600,
                        marginTop: "2px",
                      }}
                    >
                      {post.place}
                    </div>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(post.id);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      flexShrink: 0,
                      cursor: "pointer",
                      transition: "transform .15s ease",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "14px",
                        color: post.isLiked ? "#E23670" : "#c7c7c7",
                        transition: "color .15s ease",
                        animation: post.animating
                          ? "heartPulse .5s ease"
                          : "none",
                      }}
                    >
                      ♥
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: post.isLiked ? "#E23670" : "#888",
                      }}
                    >
                      {post.likes}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    lineHeight: 1.5,
                    color: "#555",
                    margin: "8px 0",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {post.content}
                </div>
                <div style={{ fontSize: "11px", color: "#999" }}>
                  {post.date}
                  　조회수 {post.views}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
});
