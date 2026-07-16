import {
  defineComponent,
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useRoute } from "vue-router";
import { useAppStore } from "../store/useAppStore.js";
import { THEME, POST_CATEGORIES, postCatStyle } from "../theme.js";
import searchIconImg from "../assets/search.png";

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
    const { state, loadPosts, setCategoryFilter, loadAllLocations } =
      useAppStore();
    const showMapSuggestions = ref(false);
    const searchFieldRef = ref(null);

    const runSearch = () => {
      if (route.name === "community") loadPosts();
    };

    const mapSuggestions = computed(() => {
      const q = state.searchQuery.trim();
      if (!q || route.name !== "map") return [];
      return state.allLocations
        .filter((loc) => loc.title.includes(q))
        .slice(0, 6);
    });

    const selectMapSuggestion = (loc) => {
      state.searchQuery = loc.title;
      showMapSuggestions.value = false;
      props.onSearch?.(loc.title);
    };

    const handleDocumentMouseDown = (e) => {
      if (searchFieldRef.value && !searchFieldRef.value.contains(e.target)) {
        showMapSuggestions.value = false;
      }
    };

    onMounted(() => {
      loadAllLocations();
      document.addEventListener("mousedown", handleDocumentMouseDown);
    });
    onBeforeUnmount(() => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    });

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
        <div
          ref={searchFieldRef}
          style={{ display: "flex", gap: "8px", position: "relative" }}
        >
          <input
            value={state.searchQuery}
            onInput={(e) => {
              state.searchQuery = e.target.value;
              showMapSuggestions.value = true;
            }}
            placeholder={
              route.name === "map" ? "놀거리, 지역 검색" : "게시글 검색"
            }
            onKeydown={(e) => {
              if (e.key !== "Enter") return;
              if (route.name === "map") {
                e.preventDefault();
                showMapSuggestions.value = false;
                props.onSearch?.(state.searchQuery);
              } else if (route.name === "community") {
                runSearch();
              }
            }}
            autoComplete="off"
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
              showMapSuggestions.value = true;
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
                border: "none",
              }}
            >
              <img
                src={searchIconImg}
                alt=""
                style={{ width: "30px", padding: "3px 0 0 0" }}
              />
            </button>
          )}
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
                src={searchIconImg}
                alt=""
                style={{ width: "30px", padding: "3px 0 0 0" }}
              />
            </div>
          )}
          {showMapSuggestions.value && mapSuggestions.value.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                right: 0,
                background: "#fff",
                border: "1px solid #e5e5e5",
                borderRadius: "10px",
                boxShadow: "0 8px 20px -8px rgba(0,0,0,0.25)",
                overflow: "hidden",
                zIndex: 6,
                animation: "popIn .15s ease",
                transformOrigin: "top",
              }}
            >
              {mapSuggestions.value.map((loc, index) => (
                <div
                  key={loc.contentid}
                  onClick={() => selectMapSuggestion(loc)}
                  style={{
                    padding: "9px 12px",
                    cursor: "pointer",
                    borderTop: index > 0 ? "1px solid #eee" : "none",
                  }}
                >
                  <div style={{ fontSize: "12.5px", fontWeight: 700 }}>
                    {loc.title}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#999",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {loc.addr1} {loc.addr2}
                  </div>
                </div>
              ))}
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
