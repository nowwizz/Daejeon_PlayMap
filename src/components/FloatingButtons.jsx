import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import { THEME } from '../theme.js'
import { useAppStore } from '../store/useAppStore.js'

// AI 아바타 이미지는 uploads/Group 1.png (귀여운 노란 얼굴)을 src/assets/ai-avatar.png로 옮겨서 사용하세요.
export default defineComponent({
  name: 'FloatingButtons',
  setup() {
    const route = useRoute()
    const { toggleChat, toggleNewPost } = useAppStore()
    const aiHover = ref(false)
    const writeHover = ref(false)
    
    return () => (
      <div style={{ position: 'absolute', right: '16px', bottom: '78px', display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center', zIndex: 15 }}>
        {route.name === 'community' && (
          <div
            onClick={toggleNewPost}
            onMouseenter={() => writeHover.value = true}
            onMouseleave={() => writeHover.value = false}
            style={{
              width: '50px', height: '50px', borderRadius: '50%', background: THEME.main, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '19px', fontWeight: 800,
              cursor: 'pointer', boxShadow: '0 8px 20px -6px rgba(0,0,0,0.5)', transition: 'transform .15s ease',
              transform: writeHover.value ? 'scale(1.08)' : 'scale(1)'
            }}
          >✎</div>
        )}
        <div
          onClick={toggleChat}
          onMouseenter={() => aiHover.value = true}
          onMouseleave={() => aiHover.value = false}
          style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            cursor: 'pointer',
            boxShadow: '0 8px 20px -6px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            transition: 'transform .15s ease',
            transform: aiHover.value ? 'scale(1.08)' : 'scale(1)'
          }}
        >
          <img src="/src/assets/ai-avatar.png" alt="AI 챗봇" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      </div>
    )
  }
})
