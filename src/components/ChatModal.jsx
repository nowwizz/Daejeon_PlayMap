import { defineComponent } from 'vue'
import { useAppStore } from '../store/useAppStore.js'
import { THEME } from '../theme.js'

export default defineComponent({
  name: 'ChatModal',
  setup() {
    const { state, toggleChat, sendChat } = useAppStore()
    const onKeyDown = (e) => { if (e.key === 'Enter') sendChat() }
    return () => state.chatOpen && (
      <div onClick={toggleChat} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', zIndex: 25, animation: 'fadeIn .2s ease' }}>
        <div onClick={e => e.stopPropagation()} style={{ background: '#fff', width: '100%', height: '68%', borderRadius: '20px 20px 0 0', padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', animation: 'slideUp .3s cubic-bezier(.22,1,.36,1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, marginBottom: '12px' }}>
            <div style={{ fontSize: '15px', fontWeight: 800 }}>AI 챗봇</div>
            <div onClick={toggleChat} style={{ cursor: 'pointer', color: '#888', fontSize: '13px' }}>닫기</div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {state.chatMessages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'bot' ? 'flex-start' : 'flex-end' }}>
                <div style={{
                  maxWidth: '78%', padding: '10px 14px', fontSize: '13px', lineHeight: 1.5,
                  background: msg.from === 'bot' ? THEME.subLight : THEME.main,
                  color: msg.from === 'bot' ? '#5b4300' : '#fff',
                  border: msg.from === 'bot' ? '1px solid #FFE59A' : 'none',
                  borderRadius: msg.from === 'bot' ? '16px 16px 16px 4px' : '16px 16px 4px 16px'
                }}>{msg.text}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexShrink: 0 }}>
            <input
              value={state.chatInput}
              onInput={e => { state.chatInput = e.target.value }}
              onKeydown={onKeyDown}
              placeholder="질문을 입력하세요"
              style={{ flex: 1, padding: '12px 14px', borderRadius: '12px', border: '1px solid #e5e5e5', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
            />
            <div onClick={sendChat} style={{ padding: '12px 18px', borderRadius: '12px', background: THEME.sub, color: '#5b4300', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>↑</div>
          </div>
        </div>
      </div>
    )
  }
})
