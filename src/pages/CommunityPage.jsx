import { defineComponent, onMounted } from "vue";
import { useAppStore } from "../store/useAppStore.js";
import { THEME, postCatStyle } from "../theme.js";
import SearchBar from "../components/SearchBar.jsx";

export default defineComponent({
  name: "CommunityPage",
  setup() {
    const { state, visiblePosts, toggleLike, openDetail, loadPosts } = useAppStore();

    onMounted(() => {
      loadPosts();
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
            style={{ fontSize: "12.5px", color: "#888", marginBottom: "12px" }}
          >
            게시글 {state.posts.length}개
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {visiblePosts.value.map((post) => (
              <div
                key={post.id}
                onClick={() => openDetail(post.id)}
                style={{
                  border: "1px solid #eee",
                  borderRadius: "14px",
                  padding: "14px",
                  background: "#fff",
                  cursor: "pointer",
                  transition: "transform .16s ease, box-shadow .16s ease",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px) scale(1.01)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.04)";
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
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "20px",
                          whiteSpace: "nowrap",
                          background: postCatStyle(post.category).bg,
                          color: postCatStyle(post.category).fg,
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
                    <div style={{ fontSize: "14px", color: "#E23670" }}>♥</div>
                    <div style={{ fontSize: "12px", color: "#888" }}>
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
                  익명 · {post.date} · 조회수 {post.views}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  },
});
