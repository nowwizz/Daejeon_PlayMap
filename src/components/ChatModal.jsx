import { defineComponent, ref } from "vue";
import { useAppStore } from "../store/useAppStore.js";
import { THEME } from "../theme.js";

export default defineComponent({
  name: "ChatModal",
  setup() {
    const { state, toggleChat, sendChat } = useAppStore();
    const chatInputFocused = ref(false);
    const isClosing = ref(false);

    const onKeyDown = (e) => {
      if (e.key === "Enter") sendChat();
    };

    const closeChat = () => {
      if (!state.chatOpen) return;
      isClosing.value = true;
      setTimeout(() => {
        toggleChat();
        isClosing.value = false;
      }, 220);
    };

    return () =>
      (state.chatOpen || isClosing.value) && (
        <div
          onClick={closeChat}
          style={{
            position: "absolute",
            inset: 0,
            background: isClosing.value ? "rgba(0,0,0,0)" : "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "flex-end",
            zIndex: 25,
            animation: isClosing.value
              ? "fadeOut .22s ease forwards"
              : "fadeIn .2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              width: "100%",
              height: "68%",
              borderRadius: "20px 20px 0 0",
              padding: "16px 20px 20px",
              display: "flex",
              flexDirection: "column",
              animation: isClosing.value
                ? "slideDown .22s cubic-bezier(.22,1,.36,1) forwards"
                : "slideUp .3s cubic-bezier(.22,1,.36,1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexShrink: 0,
                marginBottom: "12px",
              }}
            >
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 800,
                  padding: "5px",
                  color: "#333333",
                }}
              >
                AI <span style={{ color: "#f0cd06" }}>꿈돌이</span>
              </div>
              <div
                onClick={closeChat}
                style={{ cursor: "pointer", color: "#888", fontSize: "13px" }}
              >
                닫기
              </div>
            </div>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {state.chatMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent:
                      msg.from === "bot" ? "flex-start" : "flex-end",
                    alignItems: "flex-end",
                    gap: "8px",
                  }}
                >
                  {msg.from === "bot" && (
                    <img
                      src="/src/assets/AIChar.png"
                      alt="AI 캐릭터"
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        objectFit: "cover",
                      }}
                    />
                  )}
                  <div
                    style={{
                      maxWidth: "78%",
                      padding: "10px 14px",
                      fontSize: "13px",
                      lineHeight: 1.5,
                      background:
                        msg.from === "bot" ? THEME.subLight : THEME.main,
                      color: msg.from === "bot" ? "#5b4300" : "#fff",
                      border: msg.from === "bot" ? "1px solid #FFE59A" : "none",
                      borderRadius:
                        msg.from === "bot"
                          ? "16px 16px 16px 4px"
                          : "16px 16px 4px 16px",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div
              style={{
                display: "flex",
                gap: "8px",
                marginTop: "10px",
                flexShrink: 0,
              }}
            >
              <input
                value={state.chatInput}
                onInput={(e) => {
                  state.chatInput = e.target.value;
                }}
                onFocus={() => {
                  chatInputFocused.value = true;
                }}
                onBlur={() => {
                  chatInputFocused.value = false;
                }}
                onKeydown={onKeyDown}
                placeholder="질문을 입력하세요"
                style={{
                  flex: 1,
                  padding: "12px 14px",
                  borderRadius: "12px",
                  border: chatInputFocused.value
                    ? "1px solid #00B398"
                    : "1px solid #e5e5e5",
                  background: chatInputFocused.value ? "#ffffff" : "#f7f7f7",
                  fontSize: "14px",
                  outline: "none",
                  fontFamily: "inherit",
                  transition:
                    "border-color .15s ease, box-shadow .15s ease, background-color .15s ease",
                  boxShadow: chatInputFocused.value
                    ? "0 0 0 3px rgba(0, 179, 152, 0.15)"
                    : "none",
                }}
              />
              <div
                onClick={sendChat}
                style={{
                  padding: "12px 15px",
                  borderRadius: "13px",
                  background: THEME.sub,
                  color: "#5b4300",
                  fontWeight: 700,
                  fontSize: "15px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                ↑
              </div>
            </div>
          </div>
        </div>
      );
  },
});
