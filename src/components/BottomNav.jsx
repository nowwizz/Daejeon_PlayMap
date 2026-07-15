import { defineComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { THEME } from '../theme.js'

const ITEMS = [ { key: 'map', label: '지도' }, { key: 'community', label: '정보 공유' } ]

export default defineComponent({
  name: 'BottomNav',
  setup() {
    const route = useRoute()
    const router = useRouter()
    return () => (
      <div style={{ flexShrink: 0, display: 'flex', borderTop: '1px solid #eee', background: '#fff' }}>
        {ITEMS.map(item => {
          const active = route.name === item.key
          return (
            <div key={item.key} onClick={() => router.push(`/${item.key}`)} style={{
              flex: 1, textAlign: 'center', padding: '24px 0 20px', fontSize: '12.5px', cursor: 'pointer',
              transition: 'color .2s ease, background-color .2s ease, border-color .2s ease',
              color: active ? THEME.main : '#888', fontWeight: active ? 700 : 500,
              borderTop: active ? `2px solid ${THEME.main}` : '2px solid transparent',
              background: active ? '#E1F6F1' : 'transparent'
            }}>{item.label}</div>
          )
        })}
      </div>
    )
  }
})
