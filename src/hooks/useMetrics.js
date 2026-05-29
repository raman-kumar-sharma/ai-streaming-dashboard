import { useState, useCallback } from 'react'
import { callAI, AIError, MODEL } from '../lib/aiClient.js'

export function useMetrics() {
  const [calls, setCalls]       = useState([])
  const [streaming, setStream]  = useState(false)
  const [error, setError]       = useState(null)
  const [retryInfo, setRetry]   = useState(null)

  const run = useCallback(async (prompt) => {
    if (!prompt?.trim()) return
    const start = Date.now()
    setStream(true)
    setError(null)
    setRetry(null)

    const entry = {
      id: crypto.randomUUID(),
      prompt: prompt.slice(0, 60),
      ts: start,
      status: 'pending',
      latencyMs: null,
      inputTokens: null,
      outputTokens: null,
      response: '',
      model: MODEL,
    }
    setCalls(prev => [entry, ...prev].slice(0, 20))

    try {
      const { text, usage } = await callAI([{ role: 'user', content: prompt }], {
        onRetry: (info) => setRetry(info),
      })

      const latencyMs = Date.now() - start
      setCalls(prev => prev.map(c => c.id === entry.id ? {
        ...c,
        status: 'success',
        latencyMs,
        inputTokens: usage?.input_tokens,
        outputTokens: usage?.output_tokens,
        response: text,
      } : c))
    } catch (e) {
      const err = e instanceof AIError ? e : new AIError(e.message)
      setError(err)
      setCalls(prev => prev.map(c => c.id === entry.id ? {
        ...c,
        status: 'error',
        latencyMs: Date.now() - start,
        response: err.message,
      } : c))
    } finally {
      setStream(false)
      setRetry(null)
    }
  }, [])

  const clearError = () => setError(null)

  const stats = {
    total: calls.length,
    success: calls.filter(c => c.status === 'success').length,
    errors: calls.filter(c => c.status === 'error').length,
    avgLatency: calls.filter(c => c.latencyMs).length
      ? Math.round(calls.filter(c => c.latencyMs).reduce((a, c) => a + c.latencyMs, 0) / calls.filter(c => c.latencyMs).length)
      : 0,
    totalTokens: calls.reduce((a, c) => a + (c.inputTokens ?? 0) + (c.outputTokens ?? 0), 0),
  }

  return { calls, stats, streaming, error, retryInfo, run, clearError }
}
