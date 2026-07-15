import {
  defineComponent,
  computed,
  onMounted,
  onBeforeUnmount,
  ref,
} from "vue";
import { useAppStore } from "../store/useAppStore.js";
import { THEME, POST_CATEGORIES, postCatStyle } from "../theme.js";

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: "1px solid #ddd",
  fontSize: "13px",
  outline: "none",
  fontFamily: "inherit",
};
const textareaStyle = { ...inputStyle, minHeight: "80px", resize: "vertical" };

function toggleNewPost() {
  state.newPostOpen = !state.newPostOpen;
  state.newTitle = "";
  state.newPlace = "";
  state.newContent = "";
  state.newPassword = "";
  state.newCategory = "";
}

export default defineComponent({
  name: "NewPostModal",
  setup() {
    const { state, toggleNewPost, submitPost, loadAllLocations, setNewPlace } =
      useAppStore();
    const showSuggestions = ref(false);
    const placeFieldRef = ref(null);

    const handleDocumentMouseDown = (e) => {
      if (placeFieldRef.value && !placeFieldRef.value.contains(e.target)) {
        showSuggestions.value = false;
      }
    };

    onMounted(() => {
      loadAllLocations();
      document.addEventListener("mousedown", handleDocumentMouseDown);
    });

    onBeforeUnmount(() => {
      document.removeEventListener("mousedown", handleDocumentMouseDown);
    });

    const suggestions = computed(() => {
      const q = state.newPlace.trim();
      if (!q || state.newPlaceContentId) return [];
      return state.allLocations
        .filter((loc) => loc.title.includes(q))
        .slice(0, 6);
    });

    return () =>
      state.newPostOpen && (
        <div
          onClick={toggleNewPost}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 22,
            padding: "20px",
            animation: "fadeIn .2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              width: "100%",
              borderRadius: "18px",
              padding: "20px",
              maxHeight: "82%",
              overflowY: "auto",
              animation: "popIn .22s cubic-bezier(.22,1,.36,1)",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: 800,
                marginBottom: "12px",
              }}
            >
              글 작성
            </div>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <input
                value={state.newTitle}
                onInput={(e) => {
                  state.newTitle = e.target.value;
                }}
                placeholder="제목"
                style={inputStyle}
              />
              <div ref={placeFieldRef} style={{ position: "relative" }}>
                <input
                  value={state.newPlace}
                  onInput={(e) => {
                    state.newPlace = e.target.value;
                    state.newPlaceContentId = null;
                    showSuggestions.value = true;
                  }}
                  onFocus={() => {
                    showSuggestions.value = true;
                  }}
                  placeholder="장소 (놀거리 검색)"
                  autoComplete="off"
                  style={inputStyle}
                />
                {showSuggestions.value && suggestions.value.length > 0 && (
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
                      zIndex: 5,
                      animation: "popIn .15s ease",
                      transformOrigin: "top",
                    }}
                  >
                    {suggestions.value.map((loc, index) => (
                      <div
                        key={loc.contentid}
                        onClick={() => {
                          setNewPlace(loc);
                          showSuggestions.value = false;
                        }}
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
              <select
                value={state.newCategory}
                onChange={(e) => {
                  state.newCategory = e.target.value;
                }}
                style={inputStyle}
              >
                <option value="" disabled hidden>
                  카테고리 선택
                </option>
                {POST_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <textarea
                value={state.newContent}
                onInput={(e) => {
                  state.newContent = e.target.value;
                }}
                placeholder="내용"
                style={textareaStyle}
              />
              <input
                value={state.newPassword}
                onInput={(e) => {
                  state.newPassword = e.target.value;
                }}
                type="password"
                autoComplete="new-password"
                name="new-post-password"
                inputMode="text"
                placeholder="비밀번호 (수정/삭제 시 필요)"
                style={inputStyle}
              />
              <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                <div
                  onClick={submitPost}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "11px",
                    borderRadius: "10px",
                    background: THEME.main,
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  완료
                </div>
                <div
                  onClick={toggleNewPost}
                  style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "11px",
                    borderRadius: "10px",
                    background: "#eee",
                    fontSize: "13px",
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  취소
                </div>
              </div>
            </div>
          </div>
        </div>
      );
  },
});
