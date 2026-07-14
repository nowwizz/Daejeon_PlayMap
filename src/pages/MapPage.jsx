import { defineComponent, onMounted, onBeforeUnmount, ref } from 'vue'
import { useAppStore } from '../store/useAppStore.js'
import { CATEGORIES } from '../theme.js'
import SearchBar from '../components/SearchBar.jsx'
import PlaceSheet from '../components/PlaceSheet.jsx'

export default defineComponent({
  name: 'MapPage',

  setup() {
    const { state, openPlace, collapseSheet } = useAppStore()

    const mapContainer = ref(null)

    let map = null
    let resizeObserver = null
    let clusterer = null

    const loadKakaoMapScript = () => {
      return new Promise((resolve, reject) => {
        // 이미 SDK가 로드된 경우
        if (window.kakao?.maps) {
          window.kakao.maps.load(resolve)
          return
        }

        // 다른 컴포넌트에서 스크립트를 추가한 경우
        const existingScript = document.querySelector(
          'script[data-kakao-map-sdk]'
        )

        if (existingScript) {
          existingScript.addEventListener('load', () => {
            window.kakao.maps.load(resolve)
          })
          existingScript.addEventListener('error', reject)
          return
        }

        const appKey = import.meta.env.VITE_KAKAO_MAP_KEY

        if (!appKey) {
          reject(new Error('VITE_KAKAO_MAP_KEY가 설정되지 않았습니다.'))
          return
        }

        const script = document.createElement('script')

        script.dataset.kakaoMapSdk = 'true'
        script.src =
          `https://dapi.kakao.com/v2/maps/sdk.js` +
          `?appkey=${import.meta.env.VITE_KAKAO_MAP_KEY}` +
          `&autoload=false` +
          `&libraries=clusterer`

        script.onload = () => {
          window.kakao.maps.load(resolve)
        }

        script.onerror = () => {
          reject(new Error('카카오맵 SDK를 불러오지 못했습니다.'))
        }

        document.head.appendChild(script)
      })
    }

    const createMap = () => {
      const kakao = window.kakao

      // 대전광역시청 부근 좌표
      const daejeonCenter = new kakao.maps.LatLng(
        36.3504119,
        127.3845475
      )

      map = new kakao.maps.Map(mapContainer.value, {
        center: daejeonCenter,

        // 숫자가 클수록 더 넓은 지역을 보여줌
        level: 8
      })

      // 대전 전체가 들어오도록 대략적인 경계 설정
      const bounds = new kakao.maps.LatLngBounds()

      // 남서쪽
      bounds.extend(
        new kakao.maps.LatLng(36.1833, 127.2464)
      )

      // 북동쪽
      bounds.extend(
        new kakao.maps.LatLng(36.4908, 127.5597)
      )

      map.setBounds(bounds)

      // 지도 확대·축소 버튼
      const zoomControl = new kakao.maps.ZoomControl()

      map.addControl(
        zoomControl,
        kakao.maps.ControlPosition.RIGHT
      )

      // 부모 크기가 바뀌면 지도 크기도 재계산
      resizeObserver = new ResizeObserver(() => {
        if (!map || !mapContainer.value) return

        map.relayout()
      })

      resizeObserver.observe(mapContainer.value)
    }

    const loadPlaces = async () => {
      const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/locations/all`
      )

      if (!response.ok) {
          throw new Error("장소 조회 실패")
      }

      return await response.json()
    }

    const createPlaceClusters = (places) => {
        const kakao = window.kakao

        const markers = places.map(place => {
            return new kakao.maps.Marker({
                position: new kakao.maps.LatLng(
                    Number(place.mapy),
                    Number(place.mapx)
                ),
                title: place.title
            })
        })

    clusterer = new kakao.maps.MarkerClusterer({
        map,
        markers,
        averageCenter: true,
        minLevel: 7
    })
}

    onMounted(async () => {
      try {
        await loadKakaoMapScript()

        createMap()

        const places = await loadPlaces()

        createPlaceClusters(places)
      } catch (error) {
        console.error('카카오맵 초기화 실패:', error)
      }
    })

    onBeforeUnmount(() => {
      resizeObserver?.disconnect()
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
            {CATEGORIES.map((cat) => (
              <div
                key={cat}
                onClick={() => {
                  state.categoryFilter = cat
                }}
                style={{
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background .2s ease, color .2s ease',
                  background:
                    state.categoryFilter === cat
                      ? '#00B398'
                      : '#f2f2f2',
                  color:
                    state.categoryFilter === cat
                      ? '#fff'
                      : '#444'
                }}
              >
                {cat}
              </div>
            ))}
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
            {/* 실제 카카오맵이 들어가는 영역 */}
            <div
              ref={mapContainer}
              onClick={collapseSheet}
              style={{
                position: 'absolute',
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