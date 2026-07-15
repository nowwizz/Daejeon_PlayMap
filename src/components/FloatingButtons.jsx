import { defineComponent, ref } from "vue";
import { useRoute } from "vue-router";
import { THEME } from "../theme.js";
import { useAppStore } from "../store/useAppStore.js";
import aiAvatarImg from "../assets/ai-avatar.png";
export default defineComponent({
  name: "FloatingButtons",
  setup() {
    const route = useRoute();
    const { toggleChat, toggleNewPost } = useAppStore();
    const aiHover = ref(false);
    const writeHover = ref(false);

    return () => (
      <div
        style={{
          position: "absolute",
          right: "16px",
          bottom: "78px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          alignItems: "center",
          zIndex: 15,
        }}
      >
        {route.name === "community" && (
          <div
            onClick={toggleNewPost}
            onMouseenter={() => (writeHover.value = true)}
            onMouseleave={() => (writeHover.value = false)}
            style={{
              width: "54px",
              height: "54px",
              borderRadius: "50%",
              background: THEME.main,
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 800,
              cursor: "pointer",
              border: "none",
              boxShadow: "0 8px 20px -6px rgba(0,0,0,0.5)",
              transition: "transform .15s ease",
              transform: writeHover.value ? "scale(1.08)" : "scale(1)",
            }}
          >
            ✏️
          </div>
        )}
        <div
          onClick={toggleChat}
          onMouseenter={() => (aiHover.value = true)}
          onMouseleave={() => (aiHover.value = false)}
          style={{
            width: "54px",
            height: "54px",
            borderRadius: "50%",
            cursor: "pointer",
            border: "none",
            boxShadow: "0 8px 20px -6px rgba(0,0,0,0.5)",
            overflow: "hidden",
            transition: "transform .15s ease",
            transform: aiHover.value ? "scale(1.08)" : "scale(1)",
          }}
        >
          <img
            src={aiAvatarImg}
            alt="AI 챗봇"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>
      </div>
    );
  },
});
