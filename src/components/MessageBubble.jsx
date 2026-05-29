import React from 'react'
import { TypingDots } from './TypingDots.jsx'

/**
 * MessageBubble — handles user | assistant | error roles.
 * States: idle | streaming | error
 */
export function MessageBubble({ role = 'assistant', content = '', state = 'idle' }) {
  const isUser  = role === 'user'
  const isError = role === 'error' || state === 'error'

  const bg = isUser ? '#2563eb' : isError ? '#1a0a0a' : '#1e1e22'
  const border = isError ? '1px solid #7f1d1d' : 'none'
  const align = isUser ? 'flex-end' : 'flex-start'
  const radius = isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px'

  return (
    <div style={{ display:'flex', justifyContent:align, marginBottom:12 }}>
      {!isUser && (
        <div style={{ width:28, height:28, borderRadius:'50%', background:'#2a2a2a',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:13, marginRight:8, flexShrink:0, marginTop:2 }}>
          {isError ? '⚠' : 'AI'}
        </div>
      )}
      <div style={{ maxWidth:'72%', padding:'10px 14px', borderRadius:radius,
        background:bg, border, color:'#e5e5e5', fontSize:14, lineHeight:1.65,
        whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
        {state === 'loading' && !content ? <TypingDots /> : content}
        {state === 'streaming' && <span style={{ opacity:0.5 }}>▋</span>}
      </div>
    </div>
  )
}
