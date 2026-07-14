import { defineComponent } from 'vue'
import { useAppStore } from '../store/useAppStore.js'
import { THEME } from '../theme.js'

export default defineComponent({
  name: 'PlaceDetailModal',
  setup() {
    const { selectedPlace, nearbyPlaces, closePlace, openPlace } = useAppStore()
    return () => selectedPlace.value && (
      <div onClick={closePlace} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', zIndex: 20, animation: 'fadeIn .2s ease' }}>
        <div onClick={e => e.stopPropagation()} style={{ background: '#fff', width: '100%', borderRadius: '20px 20px 0 0', padding: '20px', maxHeight: '72%', overflowY: 'auto', animation: 'slideUp .28s cubic-bezier(.22,1,.36,1)' }}>
          <div style={{ height: '140px', borderRadius: '14px', background: 'repeating-linear-gradient(45deg,#eee,#eee 10px,#f8f8f8 10px,#f8f8f8 20px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: '11px', color: '#999' }}>
            PHOTO · {selectedPlace.value.name}
          </div>
          <div style={{ fontSize: '19px', fontWeight: 800, margin: '14px 0 4px' }}>{selectedPlace.value.name}</div>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>{selectedPlace.value.area} · {selectedPlace.value.category}</div>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>주소 · {selectedPlace.value.address}</div>
          <div style={{ fontSize: '14px', lineHeight: 1.6, color: '#444', marginBottom: '18px' }}>{selectedPlace.value.desc}</div>

          <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px' }}>근처 추천 장소</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
            {nearbyPlaces.value.map(np => (
              <div key={np.id} onClick={() => openPlace(np.id)} style={{ display: 'flex', gap: '12px', border: '1px solid #eee', borderRadius: '12px', padding: '9px', cursor: 'pointer' }}>
                <div style={{ width: '48px', height: '48px', flexShrink: 0, borderRadius: '8px', background: 'repeating-linear-gradient(45deg,#eee,#eee 6px,#f8f8f8 6px,#f8f8f8 12px)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '13px' }}>{np.name}</div>
                  <div style={{ fontSize: '11.5px', color: '#888', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{np.address}</div>
                </div>
              </div>
            ))}
          </div>

          <div onClick={closePlace} style={{ textAlign: 'center', padding: '12px', borderRadius: '12px', background: THEME.main, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>닫기</div>
        </div>
      </div>
    )
  }
})
