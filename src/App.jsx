import React, { useState, useEffect, useRef } from 'react'
import { useChatStore } from './store/chatStore.js'
import { useMetrics } from './hooks/useMetrics.js'
import { MessageBubble } from './components/MessageBubble.jsx'
import { ResponseCard } from './components/ResponseCard.jsx'
import { PromptInput } from './components/PromptInput.jsx'
import { FeedbackButtons } from './components/FeedbackButtons.jsx'
import { SessionSidebar } from './components/SessionSidebar.jsx'
import { ErrorUI, RetryBanner } from './components/ErrorUI.jsx'
import { MetricCard } from './components/MetricCard.jsx'
import { LatencyBar } from './components/LatencyBar.jsx'
import { CallLog } from './components/CallLog.jsx'

const TABS = ['Chat', 'Dashboard']

const PROMPTS = [
  'Summarise quantum entanglement in 2 sentences.',
  'What is the time complexity of QuickSort?',
  'List 3 benefits of TypeScript.',
  'Define idempotency.',
]

export default function App() {
  const [tab, setTab] = useState('Chat')

  useEffect(() => {
    const { sessions, createSession } = useChatStore.getState()
    if (Object.keys(sessions).length === 0) createSession()
  }, [])

  return (
    <div className="app-root" style={{ display:'flex', flexDirection:'column', height:'100vh' }}>
      <header className="app-header" style={{ borderBottom:'1px solid #1e1e22', padding:'0 20px',
        display:'flex', alignItems:'center', flexShrink:0 }}>
        <span style={{ fontWeight:700, fontSize:15, marginRight:24, color:'#e5e5e5' }}>StreamDesk</span>
        {TABS.map(t => (
          <button key={t} type="button" onClick={() => setTab(t)}
            style={{ background:'transparent', border:'none', padding:'14px 16px', cursor:'pointer',
              fontSize:14, color: tab === t ? '#e5e5e5' : '#555', fontWeight: tab === t ? 600 : 400,
              borderBottom: tab === t ? '2px solid #2563eb' : '2px solid transparent', marginBottom:-1 }}>
            {t}
          </button>
        ))}
      </header>
      <div style={{ flex:1, overflow:'hidden' }}>
        {tab === 'Chat' && <ChatTab />}
        {tab === 'Dashboard' && <DashTab />}
      </div>
    </div>
  )
}

function ChatTab() {
  const send       = useChatStore(s => s.send)
  const stop       = useChatStore(s => s.stop)
  const streaming  = useChatStore(s => s.streaming)
  const error      = useChatStore(s => s.error)
  const retryInfo  = useChatStore(s => s.retryInfo)
  const lastPrompt = useChatStore(s => s.lastPrompt)
  const clearError = useChatStore(s => s.clearError)
  const msgs       = useChatStore(s => s.getSession().messages)
  const clear      = useChatStore(s => s.clearSession)
  const bottomRef  = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  return (
    <div className="chat-layout" style={{ display:'flex', height:'100%' }}>
      <SessionSidebar />
      <div className="chat-main" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div className="chat-toolbar" style={{ padding:'12px 16px', borderBottom:'1px solid #1e1e22', display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontWeight:600, fontSize:14 }}>Streaming Chat</span>
          <button type="button" onClick={() => clear()} style={ghostBtn}>Clear</button>
        </div>

        <div className="chat-messages" style={{ flex:1, overflowY:'auto', padding:'16px' }}>
          {msgs.length === 0 && (
            <div style={{ textAlign:'center', color:'#444', fontSize:14, marginTop:60 }}>Start a conversation</div>
          )}
          {msgs.map(m => (
            <div key={m.id} style={{ marginBottom:16 }}>
              {m.role === 'user' ? (
                <MessageBubble role="user" content={m.content} state="idle" />
              ) : (
                <ResponseCard
                  state={m.error ? 'error' : m.streaming ? (m.content ? 'streaming' : 'loading') : 'success'}
                  content={m.content}
                  model={m.model}
                  tokens={m.tokens}
                  latencyMs={m.latencyMs}
                />
              )}
              {m.role === 'assistant' && !m.streaming && !m.error && (
                <div style={{ paddingLeft:4, marginTop:4 }}>
                  <FeedbackButtons msgId={m.id} />
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="chat-input-area" style={{ padding:'12px 16px', borderTop:'1px solid #1e1e22' }}>
          {retryInfo && <RetryBanner info={retryInfo} />}
          {error && (
            <div style={{ marginBottom:12 }}>
              <ErrorUI
                error={error}
                onRetry={() => { clearError(); if (lastPrompt) send(lastPrompt) }}
                onDismiss={clearError}
              />
            </div>
          )}
          <PromptInput onSubmit={send} onStop={stop} streaming={streaming} />
        </div>
      </div>
    </div>
  )
}

function DashTab() {
  const { calls, stats, streaming, error, retryInfo, run, clearError } = useMetrics()
  const [input, setInput] = useState('')

  const submit = (text) => {
    const prompt = text || input
    if (!prompt.trim()) return
    run(prompt)
    setInput('')
  }

  return (
    <div className="dash-tab" style={{ maxWidth:900, margin:'0 auto', padding:'24px 20px', overflowY:'auto', height:'100%' }}>
      <div style={{ marginBottom:20 }}>
        <h2 style={{ fontSize:18, fontWeight:600, marginBottom:4 }}>AI Dashboard</h2>
        <p style={{ color:'#555', fontSize:13 }}>Token usage · Latency · Call log</p>
      </div>

      <div className="dash-prompt-row" style={{ display:'flex', gap:8, marginBottom:12 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          placeholder="Custom prompt…"
          style={{ flex:1, background:'#1a1a1e', border:'1px solid #2a2a2a', borderRadius:8,
            color:'#e5e5e5', padding:'9px 12px', fontSize:13, outline:'none' }}
        />
        <button type="button" onClick={() => submit()} disabled={streaming}
          style={{ background: streaming ? '#1a1a1e' : '#2563eb', color: streaming ? '#444' : '#fff',
            border:'none', borderRadius:8, padding:'0 16px', cursor: streaming ? 'not-allowed' : 'pointer', fontSize:13 }}>
          {streaming ? '…' : 'Run'}
        </button>
      </div>

      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
        {PROMPTS.map(p => (
          <button key={p} type="button" onClick={() => submit(p)} disabled={streaming}
            style={{ background:'#1a1a1e', border:'1px solid #222', borderRadius:6,
              color:'#666', padding:'5px 10px', cursor:'pointer', fontSize:12 }}>
            {p.slice(0, 28)}…
          </button>
        ))}
      </div>

      {retryInfo && <RetryBanner info={retryInfo} />}
      {error && (
        <div style={{ marginBottom:16 }}>
          <ErrorUI error={error} onRetry={() => { clearError(); if (input) run(input) }} onDismiss={clearError} />
        </div>
      )}

      <div className="dash-metrics" style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10, marginBottom:20 }}>
        <MetricCard label="Total calls" value={stats.total} accent />
        <MetricCard label="Success" value={stats.success} />
        <MetricCard label="Avg latency" value={stats.avgLatency} unit="ms" />
        <MetricCard label="Total tokens" value={stats.totalTokens} />
      </div>

      <div className="dash-panels" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
        <Panel title="Latency (last 10)"><LatencyBar calls={calls} /></Panel>
        <Panel title="Call log"><CallLog calls={calls} /></Panel>
      </div>
    </div>
  )
}

function Panel({ title, children }) {
  return (
    <div style={{ background:'#131316', border:'1px solid #1e1e22', borderRadius:12, padding:'16px' }}>
      <div style={{ fontSize:12, fontWeight:600, color:'#555', textTransform:'uppercase',
        letterSpacing:'0.07em', marginBottom:14 }}>{title}</div>
      {children}
    </div>
  )
}

const ghostBtn = { background:'transparent', color:'#555', border:'1px solid #2a2a2a',
  borderRadius:6, padding:'4px 10px', cursor:'pointer', fontSize:13 }
