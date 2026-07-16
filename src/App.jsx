import { defineComponent } from "vue";
import { RouterView, useRoute } from "vue-router";
import { THEME } from "./theme.js";
import BottomNav from "./components/BottomNav.jsx";
import FloatingButtons from "./components/FloatingButtons.jsx";
import PlaceDetailModal from "./components/PlaceDetailModal.jsx";
import PostDetailModal from "./components/PostDetailModal.jsx";
import NewPostModal from "./components/NewPostModal.jsx";
import ChatModal from "./components/ChatModal.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import logoCharImg from "./assets/logoChar.png";

const TITLES = {
  map: "지도에서 놀거리를 찾아보세요",
  community: "익명 정보 커뮤니티",
};

export default defineComponent({
  name: "App",
  setup() {
    const route = useRoute();
    return () => (
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          background: "#f2f2f2",
          display: "flex",
          justifyContent: "center",
          padding: "20px 10px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "430px",
            height: "min(860px, 92vh)",
            background: "#fff",
            borderRadius: "26px",
            boxShadow:
              "0 24px 60px -24px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.06)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              flexShrink: 0,
              padding: "12px 16px 9px",
              background: THEME.main,
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <div
              style={{
                fontSize: "28px",
                fontWeight: 300,
                color: "#fff",
                letterSpacing: "-0.02em",
                fontFamily: "MitmiFont, Pretendard, sans-serif",
                display: "flex",
                alignItems: "center",
                lineHeight: 1,
              }}
            >
              <img
                src={logoCharImg}
                alt=""
                style={{ width: "35px", margin: "0 5px 5px 0" }}
              />
              어디 가유 ?
            </div>
          </div>

          <RouterView />

          <FloatingButtons />
          <BottomNav />

          <PlaceDetailModal />
          <PostDetailModal />
          <NewPostModal />
          <ChatModal />

          <LoadingScreen />
        </div>
      </div>
    );
  },
});
