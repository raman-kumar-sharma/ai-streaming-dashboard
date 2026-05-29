import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { streamAI, AIError, MODEL } from '../lib/aiClient.js'

let abortRef = null

export const useChatStore = create(
  subscribeWithSelector((set, get) => ({
    sessions: {},
    activeSession: 'default',
    streaming: false,
    error: null,
    retryInfo: null,
    lastPrompt: null,

    getSession: (id) => get().sessions[id ?? get().activeSession] ?? { messages: [], feedback: {} },

    createSession: (id = crypto.randomUUID()) => {
      set(s => ({ sessions: { ...s.sessions, [id]: { messages: [], feedback: {} } }, activeSession: id }))
      return id
    },

    switchSession: (id) => set({ activeSession: id, error: null, retryInfo: null }),

    addMessage: (msg, sessionId) => {
      const sid = sessionId ?? get().activeSession
      set(s => {
        const session = s.sessions[sid] ?? { messages: [], feedback: {} }
        return { sessions: { ...s.sessions, [sid]: { ...session, messages: [...session.messages, msg] } } }
      })
    },

    updateLastMessage: (patch, sessionId) => {
      const sid = sessionId ?? get().activeSession
      set(s => {
        const session = s.sessions[sid]
        if (!session?.messages.length) return s
        const msgs = [...session.messages]
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], ...patch }
        return { sessions: { ...s.sessions, [sid]: { ...session, messages: msgs } } }
      })
    },

    removeLastMessage: (sessionId) => {
      const sid = sessionId ?? get().activeSession
      set(s => {
        const session = s.sessions[sid]
        if (!session) return s
        return { sessions: { ...s.sessions, [sid]: { ...session, messages: session.messages.slice(0, -1) } } }
      })
    },

    setFeedback: (msgId, value) => {
      const sid = get().activeSession
      set(s => {
        const session = s.sessions[sid]
        return { sessions: { ...s.sessions, [sid]: { ...session, feedback: { ...session.feedback, [msgId]: value } } } }
      })
    },

    clearError: () => set({ error: null, retryInfo: null }),

    stop: () => {
      abortRef?.abort()
      abortRef = null
      const sid = get().activeSession
      get().updateLastMessage({ streaming: false }, sid)
      set({ streaming: false })
    },

    send: async (content) => {
      const sid = get().activeSession
      if (!get().sessions[sid]) get().createSession()

      set({ error: null, retryInfo: null, lastPrompt: content, streaming: true })
      get().addMessage({ id: crypto.randomUUID(), role: 'user', content, ts: Date.now() }, sid)

      const history = get().getSession(sid).messages
        .filter(m => (m.role === 'user' || m.role === 'assistant') && !m.error)
        .map(m => ({ role: m.role, content: m.content }))

      const asstId = crypto.randomUUID()
      const start = Date.now()
      get().addMessage({
        id: asstId, role: 'assistant', content: '', streaming: true, ts: start, model: MODEL,
      }, sid)

      abortRef = new AbortController()

      try {
        const { text, usage } = await streamAI(history, {
          signal: abortRef.signal,
          onDelta: (partial) => get().updateLastMessage({ content: partial }, sid),
          onRetry: (info) => set({ retryInfo: info }),
        })

        const latencyMs = Date.now() - start
        const tokens = usage
          ? (usage.input_tokens ?? 0) + (usage.output_tokens ?? 0)
          : null

        get().updateLastMessage({
          content: text,
          streaming: false,
          latencyMs,
          tokens,
          inputTokens: usage?.input_tokens,
          outputTokens: usage?.output_tokens,
        }, sid)
      } catch (e) {
        if (e.name === 'AbortError') {
          get().updateLastMessage({ streaming: false }, sid)
        } else {
          const err = e instanceof AIError ? e : new AIError(e.message)
          set({ error: err })
          get().removeLastMessage(sid)
        }
      } finally {
        abortRef = null
        set({ streaming: false, retryInfo: null })
      }
    },

    clearSession: (sessionId) => {
      const sid = sessionId ?? get().activeSession
      set(s => ({
        sessions: { ...s.sessions, [sid]: { messages: [], feedback: {} } },
        error: null,
        retryInfo: null,
      }))
    },
  })),
)
