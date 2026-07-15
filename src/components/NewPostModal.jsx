import { defineComponent } from "vue";
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
    const { state, toggleNewPost, submitPost } = useAppStore();
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
              <input
                value={state.newPlace}
                onInput={(e) => {
                  state.newPlace = e.target.value;
                }}
                placeholder="장소"
                style={inputStyle}
              />
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
