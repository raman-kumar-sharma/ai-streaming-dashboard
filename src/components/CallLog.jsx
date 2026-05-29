import React, { useState } from 'react'

export function CallLog({ calls }) {
  const [open, setOpen] = useState(null)
  return (
    <div>
      {calls.length === 0 && <div style={{ color:'#444', fontSize:13, padding:'12px 0' }}>No calls recorded</div>}
      {calls.map(c => (
        <div key={c.id} style={{ borderBottom:'1px solid #1a1a1a', padding:'10px 0' }}>
          <div style={{ display:'flex', gap:10, alignItems:'center', cursor:'pointer' }}
            onClick={() => setOpen(open===c.id ? null : c.id)}>
            <span style={{ fontSize:11, width:8, height:8, borderRadius:'50%', background:
              c.status==='success'?'#16a34a':c.status==='error'?'#ef4444':'#d97706', flexShrink:0 }} />
            <span style={{ flex:1, fontSize:13, color:'#bbb', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {c.prompt}
            </span>
            <span style={{ fontSize:11, color:'#555' }}>{c.latencyMs ? c.latencyMs+'ms' : '…'}</span>
            <span style={{ fontSize:11, color:'#555' }}>
              {c.inputTokens ? `↑${c.inputTokens} ↓${c.outputTokens}` : ''}
            </span>
          </div>
          {open === c.id && (
            <div style={{ marginTop:8, padding:'10px 12px', background:'#131316', borderRadius:8,
              fontSize:12, color:'#888', whiteSpace:'pre-wrap', maxHeight:120, overflowY:'auto' }}>
              {c.response}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
