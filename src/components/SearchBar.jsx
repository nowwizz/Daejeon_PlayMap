import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "../store/useAppStore.js";
import { POST_CATEGORIES, postCatStyle } from "../theme.js";

export default defineComponent({
  name: "SearchBar",

  props: {
    onSearch: {
      type: Function,
      default: null,
    },
  },

  setup(props) {
    const route = useRoute();
    const { state, toggleSortMenu, selectSort, setCategoryFilter } =
      useAppStore();
    const sortFocused = ref(false);

    return () => (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          marginBottom: "14px",
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: "8px", position: "relative" }}>
          <input
            value={state.searchQuery}
            onInput={(e) => {
              state.searchQuery = e.target.value;
            }}
            onKeydown={(e) => {
              if (route.name === "map" && e.key === "Enter") {
                e.preventDefault();
                props.onSearch?.(state.searchQuery);
              }
            }}
            placeholder={
              route.name === "map" ? "놀거리, 지역 검색" : "게시글 검색"
            }
            style={{
              flex: 1,
              padding: "11px 14px",
              borderRadius: "11px",
              border: "1px solid #e5e5e5",
              background: "#f7f7f7",
              fontSize: "14px",
              outline: "none",
              transition:
                "border-color .15s ease, box-shadow .15s ease, background-color .15s ease",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#00B398";
              e.target.style.boxShadow = "0 0 0 3px rgba(0, 179, 152, 0.15)";
              e.target.style.backgroundColor = "#ffffff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e5e5";
              e.target.style.boxShadow = "none";
              e.target.style.backgroundColor = "#f7f7f7";
            }}
          />
          {route.name === "map" && (
            <button
              type="button"
              onClick={() => {
                props.onSearch?.(state.searchQuery);
              }}
              style={{
                padding: "0 16px",
                border: "none",
                borderRadius: "11px",
                background: "#00B398",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              검색
            </button>
          )}
          {route.name === "community" && (
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div
                tabIndex={0}
                onClick={toggleSortMenu}
                onFocus={() => {
                  sortFocused.value = true;
                }}
                onBlur={() => {
                  sortFocused.value = false;
                }}
                style={{
                  minWidth: "70px",
                  padding: "11px 2px 11px 6px",
                  borderRadius: "11px",
                  border: sortFocused.value
                    ? "1px solid #00B398"
                    : "1px solid #e5e5e5",
                  background: "#fff",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  color: "#555",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  textAlign: "center",
                  transition:
                    "border-color .15s ease, box-shadow .15s ease, background-color .15s ease",
                  boxShadow: sortFocused.value
                    ? "0 0 0 3px rgba(0, 179, 152, 0.15)"
                    : "none",
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
                    top: "44px",
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
          )}
        </div>
        {route.name === "community" && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {["전체", ...POST_CATEGORIES].map((category) => {
              const isActive = state.categoryFilter === category;
              const style = postCatStyle(
                category === "전체" ? "자유" : category,
              );
              const isAll = category === "전체";
              return (
                <div
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  style={{
                    padding: "6px 10px",
                    borderRadius: "999px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    background: isActive
                      ? style.bg
                      : isAll
                        ? "#f4f4f4"
                        : "#fff",
                    color: isActive ? style.fg : isAll ? "#666" : "#555",
                    border: isActive
                      ? `1px solid ${style.fg}`
                      : "1px solid #e5e5e5",
                    boxShadow: isActive ? `0 2px 8px -4px ${style.fg}` : "none",
                  }}
                >
                  {category}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  },
});