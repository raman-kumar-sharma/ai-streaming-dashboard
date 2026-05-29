import React from 'react'

const icons = {
  network: '🔌',
  timeout: '⏱',
  ratelimit: '🚦',
  server: '🔥',
  default: '⚠️',
}

function classify(error) {
  if (!error) return 'default'
  const msg = error.message?.toLowerCase() ?? ''
  if (error.status === 429 || msg.includes('rate')) return 'ratelimit'
  if (msg.includes('timeout') || msg.includes('timed out')) return 'timeout'
  if (error.status >= 500) return 'server'
  if (msg.includes('network') || msg.includes('fetch')) return 'network'
  return 'default'
}

export function ErrorUI({ error, onRetry, onDismiss }) {
  if (!error) return null
  const kind = classify(error)
  return (
    <div style={{ background:'#1a0a0a', border:'1px solid #7f1d1d', borderRadius:10,
      padding:'14px 16px', display:'flex', gap:12, alignItems:'flex-start' }}>
      <span style={{ fontSize:20 }}>{icons[kind]}</span>
      <div style={{ flex:1 }}>
        <div style={{ fontWeight:600, fontSize:14, color:'#fca5a5', marginBottom:4 }}>
          {kind === 'ratelimit' ? 'Rate limited' : kind === 'timeout' ? 'Request timed out' : 'Something went wrong'}
        </div>
        <div style={{ fontSize:13, color:'#888' }}>{error.message}</div>
        {error.status && <div style={{ fontSize:12, color:'#555', marginTop:4 }}>Status: {error.status}</div>}
      </div>
      <div style={{ display:'flex', gap:8 }}>
        {onRetry && <button type="button" onClick={onRetry} style={btn('#2563eb')}>Retry</button>}
        {onDismiss && <button type="button" onClick={onDismiss} style={btn('#333')}>Dismiss</button>}
      </div>
    </div>
  )
}

export function RetryBanner({ info }) {
  if (!info) return null
  return (
    <div style={{ background:'#1a1500', border:'1px solid #854d0e', borderRadius:8,
      padding:'8px 14px', fontSize:13, color:'#fbbf24', display:'flex', gap:8, marginBottom:12 }}>
      <span>↻</span>
      <span>Retry {info.attempt} — waiting {Math.round(info.delay)}ms ({info.reason})</span>
    </div>
  )
}

const btn = (bg) => ({ background:bg, color:'#fff', border:'none', borderRadius:6,
  padding:'5px 12px', cursor:'pointer', fontSize:13, fontWeight:500 })
