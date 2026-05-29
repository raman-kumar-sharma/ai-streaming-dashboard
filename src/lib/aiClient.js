const API = 'https://api.anthropic.com/v1/messages'
export const MODEL = 'claude-haiku-4-5-20251001'

export class AIError extends Error {
  constructor(message, { status, retryable = false } = {}) {
    super(message)
    this.name = 'AIError'
    this.status = status
    this.retryable = retryable
  }
}

function isRetryable(status) {
  return [429, 500, 502, 503, 529].includes(status)
}

async function parseError(res) {
  try {
    const body = await res.json()
    return body?.error?.message ?? `HTTP ${res.status}`
  } catch {
    return `HTTP ${res.status}`
  }
}

function headers() {
  return {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

function anyAbort(signals) {
  const ctrl = new AbortController()
  for (const s of signals) {
    if (s.aborted) { ctrl.abort(s.reason); break }
    s.addEventListener('abort', () => ctrl.abort(s.reason), { once: true })
  }
  return ctrl.signal
}

async function withRetry(run, { maxRetries = 3, baseDelay = 1000, onRetry } = {}) {
  let attempt = 0
  while (true) {
    try {
      return await run(attempt)
    } catch (e) {
      if (e.name === 'AbortError') throw e
      if (e instanceof AIError && e.retryable && attempt < maxRetries) {
        attempt++
        const delay = baseDelay * 2 ** (attempt - 1) + Math.random() * 200
        onRetry?.({ attempt, delay, reason: e.message })
        await sleep(delay)
        continue
      }
      throw e
    }
  }
}

/** Non-streaming call with retry + timeout (p02) */
export async function callAI(messages, {
  maxRetries = 3,
  baseDelay  = 1000,
  timeoutMs  = 30_000,
  signal,
  onRetry,
} = {}) {
  return withRetry(async () => {
    const ctrl = new AbortController()
    const timer = setTimeout(
      () => ctrl.abort(new AIError('Request timed out', { retryable: true })),
      timeoutMs,
    )
    const linked = signal ? [ctrl.signal, signal] : [ctrl.signal]

    try {
      const res = await fetch(API, {
        method: 'POST',
        signal: anyAbort(linked),
        headers: headers(),
        body: JSON.stringify({ model: MODEL, max_tokens: 1024, messages }),
      })

      clearTimeout(timer)

      if (!res.ok) {
        const msg = await parseError(res)
        throw new AIError(msg, { status: res.status, retryable: isRetryable(res.status) })
      }

      const data = await res.json()
      return {
        text: data.content?.[0]?.text ?? '',
        usage: data.usage,
      }
    } catch (e) {
      clearTimeout(timer)
      if (e instanceof AIError) throw e
      if (e.name === 'AbortError') {
        if (signal?.aborted) throw new AIError('Cancelled by user', { retryable: false })
        throw new AIError('Request timed out', { retryable: true })
      }
      throw new AIError(e.message, { retryable: false })
    }
  }, { maxRetries, baseDelay, onRetry })
}

/** SSE streaming with abort + retry on connection errors (p01 + p02) */
export async function streamAI(messages, {
  signal,
  onDelta,
  onRetry,
  maxRetries = 3,
  baseDelay  = 1000,
} = {}) {
  return withRetry(async () => {
    const res = await fetch(API, {
      method: 'POST',
      signal,
      headers: headers(),
      body: JSON.stringify({ model: MODEL, max_tokens: 1024, stream: true, messages }),
    })

    if (!res.ok) {
      const msg = await parseError(res)
      throw new AIError(msg, { status: res.status, retryable: isRetryable(res.status) })
    }

    const reader = res.body.getReader()
    const dec = new TextDecoder()
    let text = ''
    let usage = null

    outer: while (true) {
      const { done, value } = await reader.read()
      if (done) break
      for (const line of dec.decode(value, { stream: true }).split('\n')) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (!raw || raw === '[DONE]') continue
        try {
          const evt = JSON.parse(raw)
          if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
            text += evt.delta.text
            onDelta?.(text)
          }
          if (evt.type === 'message_delta' && evt.usage) usage = evt.usage
          if (evt.type === 'message_stop') break outer
        } catch { /* skip malformed SSE */ }
      }
    }

    return { text, usage }
  }, { maxRetries, baseDelay, onRetry })
}
