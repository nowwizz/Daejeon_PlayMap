import { defineComponent, watch } from 'vue'
import { useAppStore } from '../store/useAppStore.js'
import { catStyle } from '../theme.js'

export default defineComponent({
  name: 'PlaceSheet',
  setup() {
    const { state, filteredPlaces, openPlace, toggleSheet } = useAppStore()
    
    watch(() => state.selectedPlaceDetail, (newVal) => {
      console.log('PlaceSheet: selectedPlaceDetail updated:', newVal)
    })

    watch(() => state.sheetExpanded, (newVal) => {
      console.log('PlaceSheet: sheetExpanded updated:', newVal)
    })

    return () => (
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fff', borderRadius: '16px 16px 0 0',
        boxShadow: '0 -8px 24px -10px rgba(0,0,0,0.3)', height: state.sheetExpanded ? 'calc(100% * 0.75)' : '64px',
        transition: 'height .25s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10
      }}>
        <div onClick={toggleSheet} style={{ flexShrink: 0, padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '4px', background: '#ccc' }} />
        </div>
        <div style={state.sheetExpanded
          ? { flex: 1, overflowY: 'auto', padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }
          : { height: 0, overflow: 'hidden', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {state.selectedPlaceDetail ? (
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800 }}>
                {state.selectedPlaceDetail.title}
              </div>

              <div style={{ marginTop: '5px', fontSize: '12px', fontWeight: 700, color: '#00B398' }}>
                {state.selectedPlaceDetail.contenttypename}
              </div>

              <div style={{ marginTop: '10px', fontSize: '13px', color: '#666' }}>
                {state.selectedPlaceDetail.addr1}
                {state.selectedPlaceDetail.addr2 ? ` ${state.selectedPlaceDetail.addr2}` : ''}
              </div>

              {state.selectedPlaceDetail.tel && (
                <div style={{ marginTop: '12px', fontSize: '13px' }}>
                  <strong>전화번호</strong>
                  {' · '}
                  {state.selectedPlaceDetail.tel}
                </div>
              )}

              {state.selectedPlaceDetail.zipcode && (
                <div style={{ marginTop: '6px', fontSize: '13px' }}>
                  <strong>우편번호</strong>
                  {' · '}
                  {state.selectedPlaceDetail.zipcode}
                </div>
              )}

              {Object.keys(state.selectedPlaceDetail.type_fields ?? {}).length > 0 && (
                <div style={{ marginTop: '18px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px' }}>
                    이용 정보
                  </div>
                  {Object.entries(state.selectedPlaceDetail.type_fields ?? {}).map(([key, value]) => (
                    <div key={key} style={{ padding: '10px', marginBottom: '6px', borderRadius: '10px', background: '#f7f7f7', fontSize: '13px' }}>
                      <strong>{key}</strong>
                      {' · '}
                      {value}
                    </div>
                  ))}
                </div>
              )}

              {state.selectedPlaceDetail.detail_info?.length > 0 && (
                <div style={{ marginTop: '18px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px' }}>
                    상세 안내
                  </div>
                  {state.selectedPlaceDetail.detail_info.map((info) => (
                    <div key={info.serialnum} style={{ padding: '12px', marginBottom: '8px', border: '1px solid #eee', borderRadius: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>
                        {info.infoname}
                      </div>
                      <div style={{ marginTop: '5px', fontSize: '12px', color: '#666', lineHeight: 1.5 }}>
                        {info.infotext}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {state.selectedPlaceDetail.nearby_restaurants?.length > 0 && (
                <div style={{ marginTop: '18px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '8px' }}>
                    주변 음식점
                  </div>
                  {state.selectedPlaceDetail.nearby_restaurants.map((restaurant) => (
                    <div key={restaurant.contentid} style={{ padding: '12px', marginBottom: '8px', border: '1px solid #eee', borderRadius: '12px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700 }}>
                        {restaurant.title}
                      </div>
                      <div style={{ marginTop: '4px', fontSize: '12px', color: '#777' }}>
                        {restaurant.addr1}
                      </div>
                      <div style={{ marginTop: '4px', fontSize: '12px', color: '#00B398', fontWeight: 700 }}>
                        약 {restaurant.distance_km}km
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
