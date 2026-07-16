import { defineComponent, ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { THEME } from "../theme.js";
import logoCharImg from "../assets/logoChar.png";

export default defineComponent({
  name: "LoadingScreen",
  setup() {
    const route = useRoute();
    const isMapRoute = computed(() => route.name === "map");
    const visible = ref(false);
    const isClosing = ref(false);
    let started = false;

    watch(
      isMapRoute,
      (isMap) => {
        if (!isMap || started) return;
        started = true;
        visible.value = true;
        setTimeout(() => {
          isClosing.value = true;
          setTimeout(() => {
            visible.value = false;
          }, 400);
        }, 2000);
      },
      { immediate: true },
    );

    return () =>
      visible.value && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 100,
            background: THEME.main,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            animation: isClosing.value ? "fadeOut .4s ease forwards" : "none",
          }}
        >
          <img src={logoCharImg} alt="" style={{ width: "96px" }} />
          <div
            style={{
              fontFamily: "MitmiFont, Pretendard, sans-serif",
              fontSize: "30px",
              fontWeight: 300,
              color: "#fff",
              letterSpacing: "-0.02em",
            }}
          >
            어디 가유 ?
          </div>
        </div>
      );
  },
});
