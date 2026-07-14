import { defineComponent } from 'vue'
import { useAppStore } from '../store/useAppStore.js'
import { CATEGORIES, catStyle } from '../theme.js'
import SearchBar from '../components/SearchBar.jsx'
import PlaceSheet from '../components/PlaceSheet.jsx'

export default defineComponent({
  name: 'MapPage',
  setup() {
    const { state, filteredPlaces, openPlace, collapseSheet } = useAppStore()
    return () => (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '14px 20px 14px', minHeight: 0, overflow: 'hidden' }}>
        <SearchBar />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, animation: 'fadeIn .25s ease' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '12px', flexShrink: 0 }}>
            {CATEGORIES.map(cat => (
              <div key={cat} onClick={() => { state.categoryFilter = cat }} style={{
                padding: '8px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap', cursor: 'pointer', flexShrink: 0,
                transition: 'background .2s ease, color .2s ease',
                background: state.categoryFilter === cat ? '#00B398' : '#f2f2f2',
                color: state.categoryFilter === cat ? '#fff' : '#444'
              }}>{cat}</div>
            ))}
          </div>
          <div style={{ position: 'relative', width: '100%', flex: 1, minHeight: 0, borderRadius: '16px', overflow: 'hidden' }}>
            <div onClick={collapseSheet} style={{
              position: 'absolute', inset: 0, cursor: 'pointer',
              background: 'repeating-linear-gradient(0deg,#eee,#eee 1px,#f8f8f8 1px,#f8f8f8 26px),repeating-linear-gradient(90deg,#eee,#eee 1px,#f8f8f8 1px,#f8f8f8 26px)'
            }}>
              <div style={{ position: 'absolute', top: '8px', left: '10px', fontFamily: 'monospace', fontSize: '10px', color: '#999' }}>MAP PLACEHOLDER · 대전광역시</div>
              {filteredPlaces.value.map(p => {
                const s = catStyle(p.category)
                return (
                  <div key={p.id} onClick={() => openPlace(p.id)} style={{
                    position: 'absolute', left: `${p.x}%`, top: `${p.y}%`, width: '16px', height: '16px', borderRadius: '50%',
                    background: s.dot, border: '2px solid #fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)', transform: 'translate(-50%,-50%)', cursor: 'pointer'
                  }} />
                )
              })}
            </div>
            <PlaceSheet />
          </div>
        </div>
      </div>
    )
  }
})
