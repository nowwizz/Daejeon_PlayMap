import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '../store/useAppStore.js'

export default defineComponent({
  name: 'SearchBar',

  props: {
    onSearch: {
      type: Function,
      default: null
    }
  },
  setup(props) {
    const route = useRoute()
    const { state, toggleSortMenu, selectSort } = useAppStore()
    return () => (
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', position: 'relative', flexShrink: 0 }}>
        <input
          value={state.searchQuery}
          onInput={e => { state.searchQuery = e.target.value }}
          onKeydown={e => {
            if (route.name === 'map' && e.key === 'Enter') {
              e.preventDefault()
              props.onSearch?.(state.searchQuery)
            }
          }}
          placeholder={route.name === 'map' ? '놀거리, 지역 검색' : '게시글 검색'}
          style={{ flex: 1, padding: '11px 14px', borderRadius: '11px', border: '1px solid #e5e5e5', background: '#f7f7f7', fontSize: '14px', outline: 'none' }}
        />
        {route.name === 'map' && (
          <button
            type="button"
            onClick={() => {
              props.onSearch?.(
                state.searchQuery
              )
            }}
            style={{
              padding: '0 16px',
              border: 'none',
              borderRadius: '11px',
              background: '#00B398',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            검색
          </button>
        )}
        {route.name === 'community' && (
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div onClick={toggleSortMenu} style={{ padding: '11px 12px', borderRadius: '11px', border: '1px solid #e5e5e5', background: '#fff', fontSize: '12.5px', fontWeight: 600, color: '#555', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {state.sortMode === 'latest' ? '최신' : '인기'} ▾
            </div>
            {state.sortMenuOpen && (
              <div style={{ position: 'absolute', top: '44px', right: 0, background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px', boxShadow: '0 8px 20px -8px rgba(0,0,0,0.25)', overflow: 'hidden', zIndex: 5, width: '88px', animation: 'popIn .15s ease', transformOrigin: 'top right' }}>
                <div onClick={() => selectSort('latest')} style={{ padding: '9px 12px', fontSize: '12.5px', cursor: 'pointer' }}>최신순</div>
                <div onClick={() => selectSort('popular')} style={{ padding: '9px 12px', fontSize: '12.5px', cursor: 'pointer', borderTop: '1px solid #eee' }}>인기순</div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
})
