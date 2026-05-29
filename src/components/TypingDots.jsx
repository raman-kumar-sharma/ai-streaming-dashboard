import React from 'react'

export function TypingDots({ size = 7, color = '#555', gap = 5 }) {
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap, height:20 }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width:size, height:size, borderRadius:'50%', background:color,
          animation:`typingDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          display:'inline-block',
        }} />
      ))}
      <style>{`
        @keyframes typingDot {
          0%,80%,100%{transform:scale(0.7);opacity:0.4}
          40%{transform:scale(1);opacity:1}
        }
      `}</style>
    </span>
  )
}
