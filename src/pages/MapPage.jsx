import { defineComponent, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useAppStore } from "../store/useAppStore.js";
import { CATEGORIES, THEME } from "../theme.js";
import SearchBar from "../components/SearchBar.jsx";
import PlaceSheet from "../components/PlaceSheet.jsx";

const CATEGORY_CONTENT_TYPE = {
  전체: null,
  관광지: "12",
  여행코스: "25",
  음식점: "39",
  축제: "15",
  숙박: "32",
};

const CATEGORY_MARKER = {
  12: {
    emoji: "📸",
    color: "#E08A2E",
  },
  25: {
    emoji: "🗺️",
    color: "#00B398",
  },
  39: {
    emoji: "🍴",
    color: "#E27DA0",
  },
  15: {
    emoji: "🎉",
    color: "#8A6A00",
  },
  32: {
    emoji: "🏡",
    color: "#c596f7",
  },
};

const DEFAULT_MARKER = {
  emoji: "📍",
  color: "#00B398",
};

const HIDDEN_CONTENT_TYPE_IDS = ["25"];

// 카카오 클러스터러 기본 스타일(스프라이트 배경 등)은 그대로 두고 폰트/글자색만 덧씌웁니다.
// 클러스터 라벨은 CSS class 없이 인라인 style로만 그려지기 때문에(clusterer.js DEFAULT_STYLES 참고),
// styles 옵션으로 넘겨야만 실제로 적용됩니다.
const CLUSTER_SPRITE_URL =
  "https://i1.daumcdn.net/localimg/localimages/07/mapjsapi/cluster.png";

const CLUSTER_STYLES = [52, 56, 66, 78, 90].map((size, index) => ({
  width: `${size}px`,
  height: `${size}px`,
  lineHeight: `${index + size}px`,
  fontSize: `${index * 2 + 17}px`,
  background: `url(${CLUSTER_SPRITE_URL})`,
  backgroundPosition: `0 ${-90 * index}px`,
  textAlign: "center",
  fontWeight: 500,
  fontFamily: "IncheonEducationHimchan, Pretendard, sans-serif",
  color: "#414141",
}));

export default defineComponent({
  name: "MapPage",

  setup() {
    const {
      state,
      openPlaceDetail,
      collapseSheet,
      setMapCenter,
      setMapPlaces,
    } = useAppStore();

    const route = useRoute();
    const router = useRouter();

    const mapContainer = ref(null);
    const allPlaces = ref([]);

    let map = null;
    let resizeObserver = null;
    let clusterer = null;
    let lastMapLevel = null;
    let placeMarkers = [];
    let selectedMarkerEntry = null;

    const filterHiddenCategories = (places) => {
      return (places ?? []).filter(
        (place) =>
          !HIDDEN_CONTENT_TYPE_IDS.includes(String(place.contenttypeid ?? "")),
      );
    };

    const loadKakaoMapScript = () => {
      return new Promise((resolve, reject) => {
        if (window.kakao?.maps) {
          window.kakao.maps.load(resolve);
          return;
        }

        const existingScript = document.querySelector(
          "script[data-kakao-map-sdk]",
        );

        if (existingScript) {
          existingScript.addEventListener("load", () => {
            window.kakao.maps.load(resolve);
          });

          existingScript.addEventListener("error", reject);

          return;
        }

        const appKey = import.meta.env.VITE_KAKAO_MAP_KEY;

        if (!appKey) {
          reject(new Error("VITE_KAKAO_MAP_KEY가 설정되지 않았습니다."));
          return;
        }

        const script = document.createElement("script");

        script.dataset.kakaoMapSdk = "true";

        script.src =
          `https://dapi.kakao.com/v2/maps/sdk.js` +
          `?appkey=${appKey}` +
          `&autoload=false` +
          `&libraries=clusterer`;

        script.onload = () => {
          window.kakao.maps.load(resolve);
        };

        script.onerror = () => {
          reject(new Error("카카오맵 SDK를 불러오지 못했습니다."));
        };

        document.head.appendChild(script);
      });
    };

    const createMap = () => {
      const kakao = window.kakao;

      const daejeonCenter = new kakao.maps.LatLng(36.3504119, 127.3845475);

      map = new kakao.maps.Map(mapContainer.value, {
        center: daejeonCenter,
        level: 8,
      });

      setMapCenter(daejeonCenter.getLat(), daejeonCenter.getLng());

      const bounds = new kakao.maps.LatLngBounds();

      bounds.extend(new kakao.maps.LatLng(36.1833, 127.2464));

      bounds.extend(new kakao.maps.LatLng(36.4908, 127.5597));

      map.setBounds(bounds);

      const mapCenter = map.getCenter();
      setMapCenter(mapCenter.getLat(), mapCenter.getLng());

      lastMapLevel = map.getLevel();

      kakao.maps.event.addListener(map, "idle", () => {
        const center = map.getCenter();
        setMapCenter(center.getLat(), center.getLng());
      });

      kakao.maps.event.addListener(map, "zoom_changed", () => {
        const currentLevel = map.getLevel();
        const isZoomOut = lastMapLevel !== null && currentLevel > lastMapLevel;

        if (isZoomOut && state.selectedPlaceDetail) {
          state.selectedPlaceDetail = null;
          state.selectedNeighborPlace = null;
        }

        lastMapLevel = currentLevel;
      });

      const zoomControl = new kakao.maps.ZoomControl();

      map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

      resizeObserver = new ResizeObserver(() => {
        if (!map || !mapContainer.value) {
          return;
        }
        map.relayout();
      });

      resizeObserver.observe(mapContainer.value);
    };

    const loadAllPlaces = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/locations/all`,
      );

      if (!response.ok) {
        throw new Error(`전체 장소 조회 실패: ${response.status}`);
      }

      return await response.json();
    };

    const loadCategoryPlaces = async (contenttypeid) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/locations` +
          `?contenttypeid=${encodeURIComponent(contenttypeid)}`,
      );

      if (!response.ok) {
        throw new Error(`카테고리 장소 조회 실패: ${response.status}`);
      }

      return await response.json();
    };
    const loadPlaceDetail = async (contentid) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}` +
          `/locations/${encodeURIComponent(contentid)}`,
      );

      if (!response.ok) {
        throw new Error(`장소 상세 조회 실패: ${response.status}`);
      }

      return await response.json();
    };

    const loadPlacesByCategory = async (category) => {
      const contenttypeid = CATEGORY_CONTENT_TYPE[category];

      if (contenttypeid === null) {
        return await loadAllPlaces();
      }

      return await loadCategoryPlaces(contenttypeid);
    };

    const clearPlaceClusters = () => {
      placeMarkers = [];
      selectedMarkerEntry = null;

      if (!clusterer) {
        return;
      }

      clusterer.clear();
      clusterer.setMap(null);
      clusterer = null;
    };

    const highlightMarkerByContentId = (contentid) => {
      const kakao = window.kakao;

      if (selectedMarkerEntry) {
        selectedMarkerEntry.marker.setImage(
          createEmojiMarkerImage(kakao, selectedMarkerEntry.contenttypeid),
        );
        selectedMarkerEntry = null;
      }

      const entry = placeMarkers.find(
        (item) => String(item.contentid) === String(contentid),
      );

      if (!entry) return;

      entry.marker.setImage(
        createEmojiMarkerImage(kakao, entry.contenttypeid, true),
      );
      selectedMarkerEntry = entry;
    };

    const clearMarkerHighlight = () => {
      if (!selectedMarkerEntry) return;

      selectedMarkerEntry.marker.setImage(
        createEmojiMarkerImage(window.kakao, selectedMarkerEntry.contenttypeid),
      );
      selectedMarkerEntry = null;
    };

    const createPlaceClusters = (places) => {
      const kakao = window.kakao;

      clearPlaceClusters();

      const markers = filterHiddenCategories(places)
        .filter((place) => {
          const latitude = Number(place.mapy);

          const longitude = Number(place.mapx);

          return Number.isFinite(latitude) && Number.isFinite(longitude);
        })
        .map((place) => {
          const markerImage = createEmojiMarkerImage(
            kakao,
            place.contenttypeid,
          );

          const marker = new kakao.maps.Marker({
            position: new kakao.maps.LatLng(
              Number(place.mapy),
              Number(place.mapx),
            ),
            title: place.title,
            image: markerImage,
          });

          kakao.maps.event.addListener(marker, "click", async () => {
            try {
              const detail = await loadPlaceDetail(place.contentid);

              openPlaceDetail(detail);
              moveMapToPlace(detail);
              highlightMarkerByContentId(place.contentid);

              console.log("상세정보 조회 성공:", detail);
            } catch (error) {
              console.error("장소 상세 조회 실패:", error);
            }
          });

          placeMarkers.push({
            marker,
            contentid: place.contentid,
            contenttypeid: place.contenttypeid,
          });

          return marker;
        });

      clusterer = new kakao.maps.MarkerClusterer({
        map,
        markers,
        averageCenter: true,
        minLevel: 7,
        styles: CLUSTER_STYLES,
      });
    };

    const createEmojiMarkerImage = (kakao, contenttypeid, isSelected) => {
      const marker = CATEGORY_MARKER[String(contenttypeid)] ?? DEFAULT_MARKER;
      const strokeColor = isSelected ? THEME.main : "white";
      const strokeWidth = isSelected ? 4 : 2;

      const svg = `
      <svg xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="56">

        <path
          d="M24 2
            C12 2 3 11 3 23
            C3 38 24 54 24 54
            C24 54 45 38 45 23
            C45 11 36 2 24 2Z"

          fill="${marker.color}"
          stroke="${strokeColor}"
          stroke-width="${strokeWidth}"/>

        <circle
          cx="24"
          cy="23"
          r="15"
          fill="white"/>

        <text
          x="24"
          y="29"
          text-anchor="middle"
          font-size="20">

          ${marker.emoji}

        </text>

      </svg>
      `;

      return new kakao.maps.MarkerImage(
        "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),

        new kakao.maps.Size(48, 56),

        {
          offset: new kakao.maps.Point(24, 56),
        },
      );
    };

    const moveMapToPlace = (place) => {
      if (!map) {
        return;
      }

      const latitude = Number(place.mapy);

      const longitude = Number(place.mapx);

      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        console.error("장소 좌표가 올바르지 않습니다.", place);
        return;
      }

      const position = new window.kakao.maps.LatLng(latitude, longitude);
      const kakao = window.kakao;

      map.setLevel(3);

      const containerHeight = mapContainer.value?.clientHeight ?? 0;

      if (containerHeight > 0) {
        const projection = map.getProjection();
        const point = projection.pointFromCoords(position);
        // 장소 상세 시트가 하단을 크게 덮으므로, 핀이 화면 중앙보다 위쪽에 오도록 보정합니다.
        const offsetY = containerHeight * 0.32;
        const shiftedPoint = new kakao.maps.Point(point.x, point.y + offsetY);
        const targetLatLng = projection.coordsFromPoint(shiftedPoint);

        map.panTo(targetLatLng);
      } else {
        map.panTo(position);
      }
    };

    const searchPlace = async (keyword) => {
      const trimmedKeyword = keyword.trim().toLowerCase();

      if (!trimmedKeyword) {
        console.warn("검색어를 입력해주세요.");
        return;
      }

      const foundPlace = allPlaces.value.find((place) => {
        const title = String(place.title ?? "").toLowerCase();

        const addr1 = String(place.addr1 ?? "").toLowerCase();

        const addr2 = String(place.addr2 ?? "").toLowerCase();

        return (
          title.includes(trimmedKeyword) ||
          addr1.includes(trimmedKeyword) ||
          addr2.includes(trimmedKeyword)
        );
      });

      if (!foundPlace) {
        console.warn("검색 결과가 없습니다:", keyword);
        return;
      }

      moveMapToPlace(foundPlace);
      highlightMarkerByContentId(foundPlace.contentid);

      try {
        const detail = await loadPlaceDetail(foundPlace.contentid);

        openPlaceDetail(detail);
      } catch (error) {
        console.error("검색 장소 상세 조회 실패:", error);
      }

      console.log("검색된 장소:", foundPlace);
    };

    const changeCategory = async (category) => {
      try {
        state.selectedPlaceDetail = null;
        collapseSheet();

        state.categoryFilter = category;

        const places = await loadPlacesByCategory(category);

        const visiblePlaces = filterHiddenCategories(places);

        allPlaces.value = visiblePlaces;

        setMapPlaces(visiblePlaces);

        createPlaceClusters(visiblePlaces);

        console.log(`[${category}] 장소 개수:`, visiblePlaces.length);
      } catch (error) {
        console.error(`[${category}] 장소 조회 실패:`, error);
      }
    };

    const handleQueryPlace = async (contentId) => {
      if (!contentId) return;

      try {
        const detail = await loadPlaceDetail(contentId);

        openPlaceDetail(detail);
        moveMapToPlace(detail);
        highlightMarkerByContentId(contentId);
      } catch (error) {
        console.error("공유된 장소 조회 실패:", error);
      }

      router.replace({ name: "map" });
    };

    onMounted(async () => {
      try {
        await loadKakaoMapScript();

        createMap();

        const places = await loadAllPlaces();

        const visiblePlaces = filterHiddenCategories(places);

        allPlaces.value = visiblePlaces;

        setMapPlaces(visiblePlaces);

        state.categoryFilter = "전체";

        createPlaceClusters(visiblePlaces);

        console.log("[전체] 장소 개수:", visiblePlaces.length);

        await handleQueryPlace(route.query.place);
      } catch (error) {
        console.error("카카오맵 초기화 실패:", error);
      }
    });

    watch(
      () => state.selectedNeighborPlace,
      async (newVal) => {
        if (!newVal) return;

        try {
          const detail = await loadPlaceDetail(newVal);
          openPlaceDetail(detail);
          moveMapToPlace(detail);
          highlightMarkerByContentId(newVal);
          state.selectedNeighborPlace = null;
        } catch (error) {
          console.error("이웃 장소 상세 조회 실패:", error);
        }
      },
    );

    watch(
      () => state.selectedPlaceDetail,
      (detail) => {
        if (!detail) clearMarkerHighlight();
      },
    );

    watch(
      () => route.query.place,
      (contentId) => {
        if (contentId) handleQueryPlace(contentId);
      },
    );

    onBeforeUnmount(() => {
      resizeObserver?.disconnect();
      clearPlaceClusters();
    });

    return () => (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "14px 20px 14px",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <SearchBar onSearch={searchPlace} />

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            animation: "fadeIn .25s ease",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "8px",
              overflowX: "auto",
              paddingBottom: "6px",
              marginBottom: "12px",
              flexShrink: 0,
              justifyContent: "center",
            }}
          >
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                onClick={() => {
                  changeCategory(cat);
                }}
                style={{
                  padding: "9px 0",
                  borderRadius: "15px",
                  border: "0px",
                  fontSize: "12px",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  flex: "1 0 72px",
                  maxWidth: "71px",
                  textAlign: "center",
                  transition: "background .2s ease, color .2s ease",
                  background:
                    state.categoryFilter === cat ? "#00B398" : "#52968c2f",
                  color: state.categoryFilter === cat ? "#fff" : "#4b4a4a",
                }}
              >
                {cat}
              </div>
            ))}
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
              flex: 1,
              minHeight: 0,
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            <div
              ref={mapContainer}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                zIndex: 1,
              }}
            />

            <PlaceSheet />
          </div>
        </div>
      </div>
    );
  },
});
