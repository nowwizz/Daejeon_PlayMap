import {
  defineComponent,
  ref,
  computed,
  nextTick,
  watch,
  onBeforeUnmount,
} from "vue";

function renderInlineMarkdown(text, onImageLoad) {
  const parts = text
    .split(/(\*\*[^*]+\*\*|!\[[^\]]*\]\([^)]+\))/g)
    .filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }

    const imageMatch = part.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      const [, alt, src] = imageMatch;
      return (
        <img
          key={index}
          src={src}
          alt={alt}
          onLoad={onImageLoad}
          style={{
            display: "block",
            maxWidth: "100%",
            width: "200px",
            borderRadius: "10px",
            marginTop: "6px",
            objectFit: "cover",
          }}
        />
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function renderMarkdown(text, onImageLoad) {
  const lines = text.split(/\n/);
  const elements = [];
  let inCodeBlock = false;
  let codeLines = [];

  const flushCodeBlock = () => {
    if (!codeLines.length) return;
    elements.push(
      <pre
        style={{
          margin: "6px 0 0",
          padding: "8px 10px",
          background: "rgba(0,0,0,0.06)",
          borderRadius: "8px",
          overflowX: "auto",
          fontSize: "12px",
          whiteSpace: "pre-wrap",
        }}
      >
        {codeLines.join("\n")}
      </pre>,
    );
    codeLines = [];
  };

  lines.forEach((line, index) => {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        flushCodeBlock();
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    const trimmed = line.trim();

    if (/^#{1,3}\s+/.test(trimmed)) {
      const level = trimmed.match(/^#+/)[0].length;
      const content = trimmed.replace(/^#{1,3}\s+/, "");
      const style =
        level === 1
          ? { fontSize: "14px", fontWeight: 800, margin: "6px 0 2px" }
          : level === 2
            ? { fontSize: "13px", fontWeight: 700, margin: "5px 0 2px" }
            : { fontSize: "12.5px", fontWeight: 700, margin: "4px 0 2px" };
      elements.push(
        <div style={style}>{renderInlineMarkdown(content, onImageLoad)}</div>,
      );
      return;
    }

    if (/^\s*[-*]\s+/.test(trimmed)) {
      elements.push(
        <div style={{ margin: "4px 0 0", paddingLeft: "12px" }}>
          •{" "}
          {renderInlineMarkdown(
            trimmed.replace(/^\s*[-*]\s+/, ""),
            onImageLoad,
          )}
        </div>,
      );
      return;
    }

    if (/^\s*\d+\.\s+/.test(trimmed)) {
      elements.push(
        <div style={{ margin: "4px 0 0", paddingLeft: "12px" }}>
          {renderInlineMarkdown(
            trimmed.replace(/^\s*\d+\.\s+/, ""),
            onImageLoad,
          )}
        </div>,
      );
      return;
    }

    if (trimmed) {
      elements.push(
        <div style={{ margin: "2px 0 0" }}>
          {renderInlineMarkdown(trimmed, onImageLoad)}
        </div>,
      );
    } else if (index < lines.length - 1) {
      elements.push(<div style={{ height: "6px" }} />);
    }
  });

  if (inCodeBlock) flushCodeBlock();
  return elements;
}
function formatSourceName(name) {
  return name.replace(/\.[a-zA-Z0-9]{1,5}$/, "");
}

import { useAppStore } from "../store/useAppStore.js";
import { THEME } from "../theme.js";
import aiCharImg from "../assets/AIChar.png";

export default defineComponent({
  name: "ChatModal",
  setup() {
    const { state, toggleChat, sendChat } = useAppStore();
    const chatInputFocused = ref(false);
    const isClosing = ref(false);
    const messageListRef = ref(null);
    const dotCount = ref(1);
    let dotInterval = null;

    const isWaitingForResponse = computed(() =>
      state.chatMessages.some((msg) => msg.from === "bot" && msg.text === ""),
    );

    watch(
      isWaitingForResponse,
      (waiting) => {
        if (waiting) {
          dotCount.value = 1;
          if (!dotInterval) {
            dotInterval = setInterval(() => {
              dotCount.value = (dotCount.value % 3) + 1;
            }, 400);
          }
        } else if (dotInterval) {
          clearInterval(dotInterval);
          dotInterval = null;
        }
      },
      { immediate: true },
    );

    let scrollAnimId = null;

    onBeforeUnmount(() => {
      if (dotInterval) clearInterval(dotInterval);
      if (scrollAnimId) cancelAnimationFrame(scrollAnimId);
    });

    const scrollToBottom = () => {
      nextTick(() => {
        if (!messageListRef.value) return;
        const container = messageListRef.value;

        if (scrollAnimId) {
          cancelAnimationFrame(scrollAnimId);
          scrollAnimId = null;
        }

        const start = container.scrollTop;
        const end = container.scrollHeight;
        const duration = 1400;
        const startTime = performance.now();
        const c1 = 1.2;
        const c3 = c1 + 1;
        const easeOutBack = (t) =>
          1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);

        const step = (now) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const ease = easeOutBack(progress);
          container.scrollTop = start + (end - start) * ease;

          if (progress < 1) {
            scrollAnimId = requestAnimationFrame(step);
          } else {
            scrollAnimId = null;
          }
        };

        scrollAnimId = requestAnimationFrame(step);
      });
    };

    watch(
      () => state.chatOpen,
      (open) => {
        if (open) scrollToBottom();
      },
    );

    watch(
      () => state.chatMessages.length,
      () => {
        scrollToBottom();
      },
    );

    watch(
      () => state.chatStreaming,
      (streaming) => {
        if (!streaming) scrollToBottom();
      },
    );

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
                  fontSize: "20px",
                  fontWeight: 300,
                  padding: "5px",
                  color: "#333333",
                  fontFamily: "MitmiFont, Pretendard, sans-serif",
                }}
              >
                AI 도우미 <span style={{ color: "#f0cd06" }}>꿈돌이</span>
              </div>
              <div
                onClick={closeChat}
                style={{ cursor: "pointer", color: "#888", fontSize: "13px" }}
              >
                닫기
              </div>
            </div>
            <div
              ref={messageListRef}
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
                      src={aiCharImg}
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
                      whiteSpace: "normal",
                    }}
                  >
                    {msg.from === "bot" ? (
                      msg.text === "" ? (
                        <span style={{ fontWeight: 700, letterSpacing: "2px" }}>
                          {Array.from(
                            { length: dotCount.value },
                            () => ".",
                          ).join(" ")}
                        </span>
                      ) : (
                        renderMarkdown(msg.text, scrollToBottom)
                      )
                    ) : (
                      msg.text
                    )}
                    {msg.from === "bot" &&
                      msg.sources &&
                      msg.sources.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "4px",
                            marginTop: "8px",
                          }}
                        >
                          {msg.sources.map((src, si) => (
                            <span
                              key={si}
                              style={{
                                fontSize: "10px",
                                fontWeight: 600,
                                padding: "7px 9px 6px 6px",
                                borderRadius: "999px",
                                background: "#fff",
                                border: "1px solid #FFE59A",
                                color: "#a3821f",
                                whiteSpace: "nowrap",
                                lineHeight: 1,
                              }}
                            >
                              📄{formatSourceName(src)}
                            </span>
                          ))}
                        </div>
                      )}
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
                  background: "#f1e07a",
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
