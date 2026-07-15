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

export default defineComponent({
  name: "PostDetailModal",
  setup() {
    const {
      state,
      detailPost,
      closeDetail,
      toggleLike,
      startEdit,
      startDelete,
      cancelAction,
      confirmEdit,
      confirmDelete,
    } = useAppStore();
    return () =>
      detailPost.value && (
        <div
          onClick={closeDetail}
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
            {state.postActionType === null && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "10px",
                    marginBottom: "10px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ fontSize: "17px", fontWeight: 800 }}>
                      {detailPost.value.title}
                    </div>
                    <div
                      style={{
                        fontSize: "10.5px",
                        fontWeight: 500,
                        padding: "4px 8px",
                        borderRadius: "7px",
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                        background: postCatStyle(detailPost.value.category).bg,
                        color: postCatStyle(detailPost.value.category).fg,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {detailPost.value.category}
                    </div>
                  </div>
                  <div
                    onClick={() => toggleLike(detailPost.value.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      flexShrink: 0,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "16px",
                        color: detailPost.value.isLiked ? "#E23670" : "#c7c7c7",
                        transition: "color .15s ease",
                        animation: detailPost.value.animating
                          ? "heartPulse .5s ease"
                          : "none",
                      }}
                    >
                      ♥
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: detailPost.value.isLiked ? "#E23670" : "#888",
                      }}
                    >
                      {detailPost.value.likes}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontSize: "12.5px",
                    fontWeight: 700,
                    color: THEME.main,
                    marginBottom: "10px",
                  }}
                >
                  {detailPost.value.place}
                </div>
                <div
                  style={{
                    fontSize: "14px",
                    lineHeight: 1.6,
                    color: "#444",
                    marginBottom: "60px",
                  }}
                >
                  {detailPost.value.content}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#999",
                    marginBottom: "10px",
                  }}
                >
                  {detailPost.value.date}
                  　조회수 {detailPost.value.views}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", gap: "10px" }}>
                    <div
                      onClick={startEdit}
                      style={{
                        flex: 1,
                        minWidth: "60px",
                        textAlign: "center",
                        padding: "11px",
                        borderRadius: "10px",
                        background: "#8cbad8",
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                        color: "#fff",
                      }}
                    >
                      수정
                    </div>
                    <div
                      onClick={startDelete}
                      style={{
                        flex: 1,
                        minWidth: "60px",
                        textAlign: "center",
                        padding: "11px",
                        borderRadius: "10px",
                        background: "#e46e6e",
                        fontSize: "13px",
                        fontWeight: 500,
                        cursor: "pointer",
                        color: "#fff",
                      }}
                    >
                      삭제
                    </div>
                  </div>
                  <div
                    onClick={closeDetail}
                    style={{
                      flex: 1,
                      maxWidth: "60px",
                      textAlign: "center",
                      padding: "11px",
                      borderRadius: "10px",
                      background: THEME.main,
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 500,
                      cursor: "pointer",
                    }}
                  >
                    닫기
                  </div>
                </div>
              </div>
            )}

            {state.postActionType === "edit" && (
              <div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    marginBottom: "12px",
                  }}
                >
                  글 수정
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <input
                    value={state.editTitle}
                    onInput={(e) => {
                      state.editTitle = e.target.value;
                    }}
                    placeholder="제목"
                    style={inputStyle}
                  />
                  <input
                    value={state.editPlace}
                    onInput={(e) => {
                      state.editPlace = e.target.value;
                    }}
                    placeholder="장소"
                    style={inputStyle}
                  />
                  <select
                    value={state.editCategory}
                    onChange={(e) => {
                      state.editCategory = e.target.value;
                    }}
                    style={inputStyle}
                  >
                    {POST_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <textarea
                    value={state.editContent}
                    onInput={(e) => {
                      state.editContent = e.target.value;
                    }}
                    placeholder="내용"
                    style={textareaStyle}
                  />
                  <input
                    value={state.actionPassword}
                    onInput={(e) => {
                      state.actionPassword = e.target.value;
                    }}
                    type="password"
                    autoComplete="new-password"
                    name="edit-post-password"
                    inputMode="text"
                    placeholder="비밀번호 확인"
                    style={inputStyle}
                  />
                  {state.actionError && (
                    <div style={{ fontSize: "12px", color: "#c0392b" }}>
                      비밀번호가 일치하지 않아요
                    </div>
                  )}
                  <div
                    style={{ display: "flex", gap: "8px", marginTop: "4px" }}
                  >
                    <div
                      onClick={confirmEdit}
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
                      저장
                    </div>
                    <div
                      onClick={cancelAction}
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
            )}

            {state.postActionType === "delete" && (
              <div>
                <div
                  style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    marginBottom: "12px",
                  }}
                >
                  게시글 삭제
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#555",
                    marginBottom: "10px",
                  }}
                >
                  삭제하려면 비밀번호를 입력하세요
                </div>
                <input
                  value={state.actionPassword}
                  onInput={(e) => {
                    state.actionPassword = e.target.value;
                  }}
                  type="password"
                  autoComplete="new-password"
                  name="delete-post-password"
                  inputMode="text"
                  placeholder="비밀번호"
                  style={inputStyle}
                />
                {state.actionError && (
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#c0392b",
                      marginTop: "6px",
                    }}
                  >
                    비밀번호가 일치하지 않아요
                  </div>
                )}
                <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <div
                    onClick={confirmDelete}
                    style={{
                      flex: 1,
                      textAlign: "center",
                      padding: "11px",
                      borderRadius: "10px",
                      background: "#c0392b",
                      color: "#fff",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    삭제
                  </div>
                  <div
                    onClick={cancelAction}
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
            )}
          </div>
        </div>
      );
  },
});
