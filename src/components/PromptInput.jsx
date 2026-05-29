import React, { useRef, useEffect } from 'react'

/**
 * PromptInput — submit or stop while streaming (p01 + p03).
 */
export function PromptInput({
  onSubmit,
  onStop,
  streaming = false,
  disabled = false,
  maxChars = 4000,
  placeholder = 'Ask anything…',
}) {
  const ref = useRef(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  })

  const submit = () => {
    const val = ref.current?.value.trim()
    if (!val || disabled || streaming) return
    onSubmit(val)
    ref.current.value = ''
    ref.current.style.height = 'auto'
  }

  const count = ref.current?.value.length ?? 0
  const near  = count > maxChars * 0.85
  const locked = disabled || streaming

  return (
    <div style={{ position:'relative' }}>
      <textarea
        ref={ref}
        disabled={locked}
        placeholder={streaming ? 'Streaming…' : placeholder}
        maxLength={maxChars}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (!streaming) submit() } }}
        style={{
          width:'100%', background:'#1a1a1e', border:`1px solid ${locked ? '#222' : '#333'}`,
          borderRadius:12, color: locked ? '#555' : '#e5e5e5', padding:'12px 50px 12px 14px',
          fontSize:14, resize:'none', outline:'none', lineHeight:1.6,
          minHeight:48, maxHeight:200, overflow:'auto',
        }}
      />
      {near && !streaming && (
        <span style={{ position:'absolute', bottom:10, left:14, fontSize:11, color: count >= maxChars ? '#ef4444' : '#888' }}>
          {count}/{maxChars}
        </span>
      )}
      {streaming ? (
        <button
          type="button"
          onClick={onStop}
          style={{
            position:'absolute', right:10, bottom:9,
            height:30, borderRadius:8, border:'none', cursor:'pointer',
            background:'#7f1d1d', color:'#fff', padding:'0 12px', fontSize:13, fontWeight:500,
          }}
        >
          Stop
        </button>
      ) : (
        <button
          type="button"
          onClick={submit}
          disabled={disabled}
          style={{
            position:'absolute', right:10, bottom:9,
            width:30, height:30, borderRadius:'50%', border:'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            background: disabled ? '#1e1e22' : '#2563eb',
            color: disabled ? '#444' : '#fff',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:15,
          }}
        >
          ↑
        </button>
      )}
    </div>
  )
}
