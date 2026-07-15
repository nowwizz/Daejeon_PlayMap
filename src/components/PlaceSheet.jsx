import { defineComponent, nextTick, ref, watch } from 'vue'
import { useAppStore } from '../store/useAppStore.js'
import { catStyle } from '../theme.js'

const NEARBY_CATEGORY_CONFIG = [
  {
    id: 'restaurants',
    label: '음식점',
    keys: ['nearby_restaurants', 'nearby_foods', 'nearby_food']
  },
  {
    id: 'accommodations',
    label: '숙소',
    keys: ['nearby_accommodations', 'nearby_hotels', 'nearby_accommodation']
  },
  {
    id: 'touristSpots',
    label: '관광지',
    keys: ['nearby_tourist_spots', 'nearby_tours', 'nearby_attractions']
  },
  {
    id: 'festivals',
    label: '축제',
    keys: ['nearby_festivals', 'nearby_festival', 'nearby_events']
  }
]

export default defineComponent({
  name: 'PlaceSheet',
  setup() {
    const { state, filteredPlaces, openPlace, toggleSheet, openPlaceFromNeighbor } = useAppStore()
    const selectedTab = ref('restaurants')
    const sheetContentRef = ref(null)

    const getNearbyItems = (detail, keys) => {
      for (const key of keys) {
        if (Array.isArray(detail?.[key])) {
          return detail[key].slice(0, 4)
        }
      }

      return []
    }

    const getNearbyCategories = (detail) => {
      return NEARBY_CATEGORY_CONFIG
        .map((category) => ({
          ...category,
          items: getNearbyItems(detail, category.keys)
        }))
        .filter((category) => category.items.length > 0)
    }
    
    const isFoodDetail = (detail) => {
      return String(detail?.contenttypename ?? '').includes('음식점')
    }

    const isTourDetail = (detail) => {
      return String(detail?.contenttypename ?? '').includes('관광지')
    }

    const isCultureDetail = (detail) => {
      return String(detail?.contenttypename ?? '').includes('문화시설')
    }

    const isLeportsDetail = (detail) => {
      return String(detail?.contenttypename ?? '').includes('레포츠')
    }

    const isFestivalDetail = (detail) => {
      return String(detail?.contenttypename ?? '').includes('축제')
    }

    const shouldHideTypeField = (detail, key) => {
      const normalizedKey = String(key).toLowerCase()

      if (['eventstartdate', 'eventenddate'].includes(normalizedKey)) {
        return true
      }

      if (isFoodDetail(detail) && ['kidsfacility', 'chkcreditcardfood', 'packing', 'smoking'].includes(normalizedKey)) {
        return true
      }

      if (isTourDetail(detail) && ['heritage1', 'heritage2', 'heritage3', 'chkbabycarriage', 'chkcreditcard'].includes(normalizedKey)) {
        return true
      }

      if (isCultureDetail(detail) && ['usefee', 'usefeeculture', 'chkbabycarriageculture'].includes(normalizedKey)) {
        return true
      }

      if (isLeportsDetail(detail) && ['accomcountleports', 'expagerangeleports', 'expagerangeleprots', 'chkcreditcardleports', 'parkingfeeleports'].includes(normalizedKey)) {
        return true
      }

      if (isFestivalDetail(detail) && ['sponsor1', 'sponsor1tel', 'sponser1tel', 'sponsor2', 'eventplace', 'program', 'progresstype', 'festivaltype'].includes(normalizedKey)) {
        return true
      }

      return false
    }

    const getSortedTypeFieldEntries = (detail) => {
      const entries = Object.entries(detail?.type_fields ?? {})
        .filter(([key]) => !shouldHideTypeField(detail, key))

      if (!isTourDetail(detail)) {
        return entries
      }

      const tourPriority = {
        infocenter: 1,
        parking: 2,
        restdate: 3,
        usetime: 4
      }

      return entries.sort(([a], [b]) => {
        const aKey = String(a).toLowerCase()
        const bKey = String(b).toLowerCase()
        const aPriority = tourPriority[aKey] ?? 999
        const bPriority = tourPriority[bKey] ?? 999

        if (aPriority !== bPriority) {
          return aPriority - bPriority
        }

        return aKey.localeCompare(bKey)
      })
    }

    const translateFieldName = (key) => {
      const translations = {
        'distance': '이동거리',
        'taketime': '영업시간',
        'opentimefood': '영업시간',
        'parkingfood': '🅿️',
        'parking': '🅿️',
        'usetime': '이용시간',
        'chkbabycarriage': '유모차 대여',
        'chkpet': '반려동물 동반',
        'chkkidszone': '어린이 영역',
        'infocenter': '📞',
        'infocenterfood': '📞',
        'infocenterculture': '📞',
        'infocenterleports': '📞',
        'infocenterfestival': '📞',
        'opendate': '개장일',
        'restdate': '휴무일',
        'restdatefood': '휴무일',
        'restdateculture': '휴무일',
        'restdateleports': '휴무일',
        'usetimeleports': '영업시간',
        'usetimeleprots': '영업시간',
        'usetimeculture': '영업시간',
        'playtime': '영업시간',
        'usetiefestival': '이용료',
        'usetimefestival': '이용료',
        'parkingculture': '🅿️',
        'firstmenu': '🍽️',
        'treatmenu': '👍'
      }
      return translations[key.toLowerCase()] || key
    }
    
    const closePlaceDetail = () => {
      state.selectedPlaceDetail = null
      state.sheetExpanded = false
      selectedTab.value = 'restaurants'
    }

    watch(
      () => state.selectedPlaceDetail,
      async (detail) => {
        if (!detail) {
          return
        }

        await nextTick()

        if (sheetContentRef.value) {
          sheetContentRef.value.scrollTop = 0
        }
      }
    )

    return () => (
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fff', borderRadius: '16px 16px 0 0',
        boxShadow: '0 -8px 24px -10px rgba(0,0,0,0.3)', height: state.sheetExpanded ? 'calc(100% * 0.75)' : '64px',
        transition: 'height .25s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10
      }}>
        <div onClick={toggleSheet} style={{ flexShrink: 0, padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '4px', background: '#ccc' }} />
        </div>
        <div ref={sheetContentRef} style={state.sheetExpanded
          ? { flex: 1, overflowY: 'auto', padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }
          : { height: 0, overflow: 'hidden', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {state.selectedPlaceDetail ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                <button 
                  onClick={closePlaceDetail}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    padding: '0',
                    marginRight: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px'
                  }}
                  title="닫기"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
              </div>

              <div style={{ fontSize: '20px', fontWeight: 800 }}>
                {state.selectedPlaceDetail.title}
              </div>

              <div style={{ marginTop: '5px', fontSize: '12px', fontWeight: 700, color: '#00B398' }}>
                {state.selectedPlaceDetail.contenttypename}
              </div>

              {(state.selectedPlaceDetail.firstimage || state.selectedPlaceDetail.firstimage2) && (
                <div style={{ marginTop: '12px', borderRadius: '12px', overflow: 'hidden' }}>
                  <img 
                    src={state.selectedPlaceDetail.firstimage ?? state.selectedPlaceDetail.firstimage2} 
                    alt={state.selectedPlaceDetail.title}
                    style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                  />
                </div>
              )}

              {!state.selectedPlaceDetail.firstimage && !state.selectedPlaceDetail.firstimage2 && (
                <div style={{ marginTop: '12px', padding: '40px 16px', background: '#f5f5f5', borderRadius: '12px', textAlign: 'center', color: '#999', fontSize: '13px' }}>
                  사진이 없어요
                </div>
              )}

              <div style={{ marginTop: '12px', fontSize: '13px', color: '#666' }}>
                <div><strong>주소</strong></div>
                <div style={{ marginTop: '4px' }}>
                  {state.selectedPlaceDetail.addr1}
                  {state.selectedPlaceDetail.addr2 ? ` ${state.selectedPlaceDetail.addr2}` : ''}
                </div>
              </div>

              {state.selectedPlaceDetail.tel && (
                <div style={{ marginTop: '12px', fontSize: '13px' }}>
                  <div>
                    <strong>{isFestivalDetail(state.selectedPlaceDetail) ? '📞' : '연락처'}</strong>
                    {' '}
                    {state.selectedPlaceDetail.tel}
                  </div>
                </div>
              )}

              {getSortedTypeFieldEntries(state.selectedPlaceDetail).length > 0 && (
                <div style={{ marginTop: '12px', fontSize: '13px' }}>
                  {getSortedTypeFieldEntries(state.selectedPlaceDetail)
                    .map(([key, value]) => (
                      <div key={key} style={{ marginBottom: '6px' }}>
                        <strong>{translateFieldName(key)}</strong>: {value}
                      </div>
                    ))}
                </div>
              )}

              {(() => {
                const nearbyCategories = getNearbyCategories(
                  state.selectedPlaceDetail
                )

                if (nearbyCategories.length === 0) {
                  return null
                }

                const activeCategory =
                  nearbyCategories.find(
                    (category) => category.id === selectedTab.value
                  ) ?? nearbyCategories[0]

                return (
                  <div style={{ marginTop: '18px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', borderBottom: '1px solid #eee', overflowX: 'auto' }}>
                      {nearbyCategories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => { selectedTab.value = category.id }}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '8px 12px',
                            fontSize: '13px',
                            fontWeight: selectedTab.value === category.id ? 700 : 500,
                            cursor: 'pointer',
                            color: selectedTab.value === category.id ? '#00B398' : '#999',
                            borderBottom: selectedTab.value === category.id ? '2px solid #00B398' : 'none',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {category.label} ({category.items.length})
                        </button>
                      ))}
                    </div>

                    <div>
                      {activeCategory.items.map((item) => (
                        <div key={`${activeCategory.id}-${item.contentid}`} onClick={() => openPlaceFromNeighbor(item.contentid)} style={{ padding: '12px', marginBottom: '8px', border: '1px solid #eee', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f9f9f9'} onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>
                          <div style={{ fontSize: '13px', fontWeight: 700 }}>
                            {item.title}
                          </div>
                          <div style={{ marginTop: '4px', fontSize: '12px', color: '#777' }}>
                            {item.addr1}
                          </div>
                          {(item.distance_km || item.distance) && (
                            <div style={{ marginTop: '4px', fontSize: '12px', color: '#00B398', fontWeight: 700 }}>
                              약 {item.distance_km ?? item.distance}km
                            </div>
                          )}
                          {item.opentimefood && (
                            <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                              <strong>영업시간</strong>: {item.opentimefood}
                            </div>
                          )}
                          {item.parkingfood && (
                            <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
                              주차 가능
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </div>
          ) : (
            <>
              {filteredPlaces.value.map(place => {
                const s = catStyle(place.category)
                return (
                  <div key={place.id} onClick={() => openPlace(place.id)} style={{ display: 'flex', gap: '12px', border: '1px solid #eee', borderRadius: '14px', padding: '10px', cursor: 'pointer', background: '#fff', flexShrink: 0 }}>
                    <div style={{ width: '56px', height: '56px', flexShrink: 0, borderRadius: '10px', background: 'repeating-linear-gradient(45deg,#eee,#eee 6px,#f8f8f8 6px,#f8f8f8 12px)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontWeight: 700, fontSize: '14px' }}>{place.name}</div>
                        <div style={{ fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px', whiteSpace: 'nowrap', background: s.bg, color: s.fg }}>{place.category}</div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#888', marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{place.area} · {place.desc}</div>
                    </div>
                  </div>
                )
              })}
              {filteredPlaces.value.length === 0 && (
                <div style={{ textAlign: 'center', padding: '16px 0', color: '#999', fontSize: '13px' }}>조건에 맞는 놀거리가 없어요</div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }
})
