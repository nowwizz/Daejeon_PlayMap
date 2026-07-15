import { defineComponent } from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "../store/useAppStore.js";
import { THEME, POST_CATEGORIES, postCatStyle } from "../theme.js";

export default defineComponent({
  name: "SearchBar",
  setup() {
    const route = useRoute();
    const { state, loadPosts, setCategoryFilter } = useAppStore();

    const runSearch = () => {
      if (route.name === "community") loadPosts();
    };

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
            placeholder={
              route.name === "map" ? "놀거리, 지역 검색" : "게시글 검색"
            }
            onKeydown={(e) => {
              if (e.key === "Enter") runSearch();
            }}
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
          {route.name === "community" && (
            <div
              onClick={runSearch}
              style={{
                flexShrink: 0,
                width: "44px",
                borderRadius: "12px",
                background: THEME.main,
                color: "#fff",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <img
                src="/src/assets/search.png"
                alt=""
                style={{ width: "30px", padding: "3px 0 0 0" }}
              />
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
                    borderRadius: "15px",
                    fontSize: "11.5px",
                    fontWeight: 700,
                    lineHeight: 1,
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
