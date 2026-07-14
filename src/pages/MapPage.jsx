import {
  defineComponent,
  onMounted,
  onBeforeUnmount,
  ref
} from 'vue'

import { useAppStore } from '../store/useAppStore.js'
import { CATEGORIES } from '../theme.js'
import SearchBar from '../components/SearchBar.jsx'
import PlaceSheet from '../components/PlaceSheet.jsx'

const CATEGORY_CONTENT_TYPE = {
  전체: null,
  관광지: '12',
  여행코스: '25',
  음식점: '39',
  축제공연행사: '15'
}

const CATEGORY_MARKER = {
  '12': {
    emoji: '📸',
    color:  '#E08A2E'
  },
  '25': {
    emoji: '🗺️',
    color: '#00B398'
  },
  '39': {
    emoji: '🍴',
    color: '#E27DA0'
  },
  '15': {
    emoji: '🎉',
    color: '#8A6A00'
  }
}

const DEFAULT_MARKER = {
  emoji: '📍',
  color: '#00B398'
}


export default defineComponent({
  name: 'MapPage',

  setup() {
    const {
      state,
      openPlace,
      collapseSheet
    } = useAppStore()

    const mapContainer = ref(null)

    let map = null
    let resizeObserver = null
    let clusterer = null

    const loadKakaoMapScript = () => {
      return new Promise((resolve, reject) => {
        if (window.kakao?.maps) {
          window.kakao.maps.load(resolve)
          return
        }

        const existingScript =
          document.querySelector(
            'script[data-kakao-map-sdk]'
          )

        if (existingScript) {
          existingScript.addEventListener(
            'load',
            () => {
              window.kakao.maps.load(resolve)
            }
          )

          existingScript.addEventListener(
            'error',
            reject
          )

          return
        }

        const appKey =
          import.meta.env.VITE_KAKAO_MAP_KEY

        if (!appKey) {
          reject(
            new Error(
              'VITE_KAKAO_MAP_KEY가 설정되지 않았습니다.'
            )
          )
          return
        }

        const script =
          document.createElement('script')

        script.dataset.kakaoMapSdk = 'true'

        script.src =
          `https://dapi.kakao.com/v2/maps/sdk.js` +
          `?appkey=${appKey}` +
          `&autoload=false` +
          `&libraries=clusterer`

        script.onload = () => {
          window.kakao.maps.load(resolve)
        }

        script.onerror = () => {
          reject(
            new Error(
              '카카오맵 SDK를 불러오지 못했습니다.'
            )
          )
        }

        document.head.appendChild(script)
      })
    }

    const createMap = () => {
      const kakao = window.kakao

      const daejeonCenter =
        new kakao.maps.LatLng(
          36.3504119,
          127.3845475
        )

      map = new kakao.maps.Map(
        mapContainer.value,
        {
          center: daejeonCenter,
          level: 8
        }
      )

      const bounds =
        new kakao.maps.LatLngBounds()

      bounds.extend(
        new kakao.maps.LatLng(
          36.1833,
          127.2464
        )
      )

      bounds.extend(
        new kakao.maps.LatLng(
          36.4908,
          127.5597
        )
      )

      map.setBounds(bounds)

      const zoomControl =
        new kakao.maps.ZoomControl()

      map.addControl(
        zoomControl,
        kakao.maps.ControlPosition.RIGHT
      )

      resizeObserver =
        new ResizeObserver(() => {
          if (
            !map ||
            !mapContainer.value
          ) {
            return
          }

          map.relayout()
        })

      resizeObserver.observe(
        mapContainer.value
      )
    }

    const loadAllPlaces = async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/locations/all`
      )

      if (!response.ok) {
        throw new Error(
          `전체 장소 조회 실패: ${response.status}`
        )
      }

      return await response.json()
    }

    const loadCategoryPlaces = async (
      contenttypeid
    ) => {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/locations` +
          `?contenttypeid=${encodeURIComponent(
            contenttypeid
          )}`
      )

      if (!response.ok) {
        throw new Error(
          `카테고리 장소 조회 실패: ${response.status}`
        )
      }

      return await response.json()
    }

    const loadPlacesByCategory = async (
      category
    ) => {
      const contenttypeid =
        CATEGORY_CONTENT_TYPE[category]

      if (contenttypeid === null) {
        return await loadAllPlaces()
      }

      return await loadCategoryPlaces(
        contenttypeid
      )
    }

    const clearPlaceClusters = () => {
      if (!clusterer) {
        return
      }

      clusterer.clear()
      clusterer.setMap(null)
      clusterer = null
    }

    const createPlaceClusters = (
      places
    ) => {
      const kakao = window.kakao

      clearPlaceClusters()

      const markers = places
        .filter((place) => {
          const latitude =
            Number(place.mapy)

          const longitude =
            Number(place.mapx)

          return (
            Number.isFinite(latitude) &&
            Number.isFinite(longitude)
          )
        })
        .map((place) => {
          const markerImage =
            createEmojiMarkerImage(
              kakao,
              place.contenttypeid
            )

          return new kakao.maps.Marker({
            position:
              new kakao.maps.LatLng(
                Number(place.mapy),
                Number(place.mapx)
              ),
            title: place.title,
            image: markerImage
          })
        })

      clusterer =
        new kakao.maps.MarkerClusterer({
          map,
          markers,
          averageCenter: true,
          minLevel: 7
        })
    }

    const createEmojiMarkerImage = (
      kakao,
      contenttypeid
    ) => {

      const marker =
        CATEGORY_MARKER[String(contenttypeid)]
        ?? DEFAULT_MARKER

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
          stroke="white"
          stroke-width="2"/>

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
      `

      return new kakao.maps.MarkerImage(
        "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(svg),

        new kakao.maps.Size(48,56),

        {
          offset:
            new kakao.maps.Point(24,56)
        }
      )
    }

    const changeCategory = async (
      category
    ) => {
      try {
        state.categoryFilter =
          category

        const places =
          await loadPlacesByCategory(
            category
          )

        createPlaceClusters(
          places
        )

        console.log(
          `[${category}] 장소 개수:`,
          places.length
        )
      } catch (error) {
        console.error(
          `[${category}] 장소 조회 실패:`,
          error
        )
      }
    }

    onMounted(async () => {
      try {
        await loadKakaoMapScript()

        createMap()

        const places =
          await loadAllPlaces()

        state.categoryFilter =
          '전체'

        createPlaceClusters(
          places
        )

        console.log(
          '[전체] 장소 개수:',
          places.length
        )
      } catch (error) {
        console.error(
          '카카오맵 초기화 실패:',
          error
        )
      }
    })

    onBeforeUnmount(() => {
      resizeObserver?.disconnect()
      clearPlaceClusters()
    })

    return () => (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '14px 20px 14px',
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        <SearchBar />

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            animation: 'fadeIn .25s ease'
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '6px',
              marginBottom: '12px',
              flexShrink: 0
            }}
          >
            {CATEGORIES.map(
              (cat) => (
                <div
                  key={cat}
                  onClick={() => {
                    changeCategory(cat)
                  }}
                  style={{
                    padding:
                      '8px 14px',
                    borderRadius:
                      '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    whiteSpace:
                      'nowrap',
                    cursor:
                      'pointer',
                    flexShrink: 0,
                    transition:
                      'background .2s ease, color .2s ease',
                    background:
                      state.categoryFilter ===
                      cat
                        ? '#00B398'
                        : '#f2f2f2',
                    color:
                      state.categoryFilter ===
                      cat
                        ? '#fff'
                        : '#444'
                  }}
                >
                  {cat}
                </div>
              )
            )}
          </div>

          <div
            style={{
              position: 'relative',
              width: '100%',
              flex: 1,
              minHeight: 0,
              borderRadius: '16px',
              overflow: 'hidden'
            }}
          >
            <div
              ref={mapContainer}
              onClick={
                collapseSheet
              }
              style={{
                position:
                  'absolute',
                inset: 0,
                width: '100%',
                height: '100%'
              }}
            />

            <PlaceSheet />
          </div>
        </div>
      </div>
    )
  }
})