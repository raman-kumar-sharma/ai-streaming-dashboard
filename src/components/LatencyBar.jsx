import React from 'react'

export function LatencyBar({ calls }) {
  if (!calls.length) return <EmptyState msg="No calls yet" />
  const vals = calls.filter(c=>c.latencyMs).map(c=>c.latencyMs)
  const max = Math.max(...vals, 1)

  return (
    <div>
      {calls.slice(0,10).map((c,i) => (
        <div key={c.id} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
          <div style={{ width:120, fontSize:11, color:'#555', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {c.prompt}
          </div>
          <div style={{ flex:1, height:18, background:'#1a1a1e', borderRadius:4, overflow:'hidden' }}>
            <div style={{
              width: c.latencyMs ? `${(c.latencyMs/max)*100}%` : '0%',
              height:'100%', borderRadius:4,
              background: c.status==='error' ? '#7f1d1d' : c.latencyMs>3000?'#d97706':'#2563eb',
              transition:'width 0.3s', minWidth:2,
            }} />
          </div>
          <div style={{ width:60, fontSize:11, color:'#666', textAlign:'right' }}>
            {c.latencyMs ? `${c.latencyMs}ms` : c.status}
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ msg }) {
  return <div style={{ color:'#444', fontSize:13, textAlign:'center', padding:'20px 0' }}>{msg}</div>
}
