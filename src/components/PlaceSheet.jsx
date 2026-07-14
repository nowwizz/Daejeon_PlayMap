import { defineComponent } from 'vue'
import { useAppStore } from '../store/useAppStore.js'
import { catStyle } from '../theme.js'

export default defineComponent({
  name: 'PlaceSheet',
  setup() {
    const { state, filteredPlaces, openPlace, toggleSheet } = useAppStore()
    return () => (
      <div style={{
        position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fff', borderRadius: '16px 16px 0 0',
        boxShadow: '0 -8px 24px -10px rgba(0,0,0,0.3)', height: state.sheetExpanded ? '75%' : '64px',
        transition: 'height .25s ease', display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        <div onClick={toggleSheet} style={{ flexShrink: 0, padding: '12px 16px', cursor: 'pointer', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '4px', background: '#ccc' }} />
        </div>
        <div style={state.sheetExpanded
          ? { flex: 1, overflowY: 'auto', padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }
          : { height: 0, overflow: 'hidden', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
        </div>
      </div>
    )
  }
})
