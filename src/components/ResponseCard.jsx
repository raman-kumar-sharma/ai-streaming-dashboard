import React from 'react'
import { TypingDots } from './TypingDots.jsx'

/**
 * ResponseCard — wraps AI response with metadata strip.
 * states: loading | streaming | success | error
 */
export function ResponseCard({ state = 'idle', content = '', model, tokens, latencyMs }) {
  const borderColor = state === 'error' ? '#7f1d1d' : state === 'success' ? '#1a3a1a' : '#222'

  return (
    <div style={{ background:'#131316', border:`1px solid ${borderColor}`, borderRadius:12, overflow:'hidden' }}>
      <div style={{ padding:'12px 16px', minHeight:52, fontSize:14, lineHeight:1.7, color:'#e5e5e5', whiteSpace:'pre-wrap' }}>
        {state === 'loading' && <TypingDots />}
        {state === 'error'   && <span style={{ color:'#ef4444' }}>{content || 'An error occurred.'}</span>}
        {(state === 'streaming' || state === 'success') && content}
        {state === 'streaming' && <span style={{ opacity:0.4 }}>▋</span>}
      </div>

      {(model || tokens || latencyMs) && (
        <div className="response-meta" style={{ borderTop:'1px solid #1e1e22', padding:'6px 16px', display:'flex', gap:16,
          fontSize:11, color:'#555' }}>
          {model    && <span>model: {model}</span>}
          {tokens   && <span>tokens: {tokens}</span>}
          {latencyMs && <span>latency: {latencyMs}ms</span>}
        </div>
      )}
    </div>
  )
}
