import React from 'react'

export function MetricCard({ label, value, unit='', accent=false }) {
  return (
    <div style={{ background:'#131316', border:`1px solid ${accent?'#1d4ed8':'#1e1e22'}`,
      borderRadius:12, padding:'14px 18px' }}>
      <div style={{ fontSize:12, color:'#555', marginBottom:6, textTransform:'uppercase',
        letterSpacing:'0.07em', fontWeight:600 }}>{label}</div>
      <div style={{ fontSize:28, fontWeight:600, color: accent?'#60a5fa':'#e5e5e5', lineHeight:1 }}>
        {value}<span style={{ fontSize:14, color:'#555', marginLeft:4 }}>{unit}</span>
      </div>
    </div>
  )
}
