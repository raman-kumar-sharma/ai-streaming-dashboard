import React from 'react'
import { useChatStore } from '../store/chatStore.js'

export function SessionSidebar() {
  const sessions      = useChatStore(s => s.sessions)
  const active        = useChatStore(s => s.activeSession)
  const switchSession = useChatStore(s => s.switchSession)
  const createSession = useChatStore(s => s.createSession)

  const ids = Object.keys(sessions)

  return (
    <div style={{ width:200, borderRight:'1px solid #1e1e22', padding:'16px 12px', flexShrink:0 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
        <span style={{ fontSize:12, color:'#555', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>Sessions</span>
        <button type="button" onClick={() => createSession()} style={iconBtn} title="New session">+</button>
      </div>
      {ids.length === 0 && (
        <div style={{ fontSize:12, color:'#444' }}>No sessions yet</div>
      )}
      {ids.map(id => {
        const msgs = sessions[id].messages
        const label = msgs.find(m => m.role === 'user')?.content?.slice(0, 22) || 'New chat'
        return (
          <button key={id} type="button" onClick={() => switchSession(id)}
            style={{ width:'100%', textAlign:'left', padding:'8px 10px', borderRadius:8, cursor:'pointer', marginBottom:4,
              background: active === id ? '#1e1e22' : 'transparent',
              border: active === id ? '1px solid #2a2a2a' : '1px solid transparent',
              fontSize:13, color: active === id ? '#e5e5e5' : '#666',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {label}
          </button>
        )
      })}
    </div>
  )
}

const iconBtn = { background:'transparent', border:'1px solid #2a2a2a', borderRadius:6,
  color:'#666', cursor:'pointer', width:24, height:24, fontSize:16, lineHeight:'22px', padding:0 }
