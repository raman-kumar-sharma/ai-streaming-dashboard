import React from 'react'
import { useChatStore } from '../store/chatStore.js'

export function FeedbackButtons({ msgId }) {
  const fb  = useChatStore(s => s.getSession().feedback[msgId])
  const set = useChatStore(s => s.setFeedback)

  return (
    <div style={{ display:'flex', gap:4, marginTop:4 }}>
      {[['👍', 'up'], ['👎', 'down']].map(([icon, val]) => (
        <button key={val} onClick={() => set(msgId, fb === val ? null : val)}
          title={val === 'up' ? 'Helpful' : 'Not helpful'}
          style={{
            background: fb === val ? (val === 'up' ? '#1a3a1a' : '#1a0a0a') : 'transparent',
            border: `1px solid ${fb === val ? (val === 'up' ? '#15803d' : '#7f1d1d') : '#2a2a2a'}`,
            borderRadius: 6, padding:'3px 8px', cursor:'pointer', fontSize:14,
            transition:'all 0.15s',
          }}>
          {icon}
        </button>
      ))}
      {fb && <span style={{ fontSize:12, color:'#555', alignSelf:'center' }}>Feedback saved</span>}
    </div>
  )
}
