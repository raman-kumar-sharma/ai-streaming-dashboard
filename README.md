# StreamDesk

A single-page app that pairs a **streaming AI chat** with a **live metrics dashboard**. Built to practice real frontend patterns around LLM APIs — not a thin wrapper around `fetch`, but streaming UX, session state, error recovery, and client-side observability in one place.

**Stack:** React 18 · Vite 5 · Zustand · Claude (Anthropic API, Haiku)

---

## What it does

**Chat** — Multi-session sidebar, token-by-token streaming, stop/cancel mid-response, thumbs up/down on replies, clear/retry when the API fails.

**Dashboard** — Latency bars, token usage, and a call log for every request, plus preset prompts to exercise the client quickly.

Two tabs in one shell: conversation on one side, how the client behaves on the other.

---

## How it’s built

Five areas in one app:

| Area | Approach |
|------|----------|
| **Streaming** | Anthropic Messages API with SSE-style parsing; partial text updates the UI as chunks arrive |
| **API client** | Custom layer: typed `AIError`, 30s timeout, exponential backoff on 429/5xx, abort via `AbortController` |
| **State** | Zustand store — sessions map, active session, streaming/error/retry flags, message CRUD |
| **UI** | Small component set: bubbles, typing indicator, session sidebar, error/retry banners, metric cards |
| **Metrics** | `useMetrics` hook records latency and tokens per call; dashboard reads from that history |

### Chat flow

1. User sends a prompt → user message appended to the active session.
2. `streamAI` opens a streamed request; assistant message is created with `streaming: true`.
3. Chunks append to content; **Stop** aborts the request and clears the streaming flag.
4. On retryable errors, backoff runs and `retryInfo` surfaces in the UI; user can retry the last prompt.
5. Feedback is stored per message id on the session object.

### API client (`src/lib/aiClient.js`)

- Retries up to 3 times with jittered exponential delay.
- Merges user abort signals with timeout abort.
- Surfaces HTTP status and whether the error is retryable.
- Streams by reading the response body and parsing SSE `data:` lines.

### State (`src/store/chatStore.js`)

- `sessions`: `{ [id]: { messages, feedback } }`.
- `send` / `stop` orchestrate streaming, errors, and partial message updates.
- `subscribeWithSelector` middleware for fine-grained subscriptions where needed.

---

## Project structure

```
src/
  App.jsx                 # Chat + Dashboard tabs
  components/
    MessageBubble.jsx     # User / assistant messages
    ResponseCard.jsx      # Assistant block while streaming
    SessionSidebar.jsx    # Create / switch sessions
    PromptInput.jsx       # Input + send / stop
    ErrorUI.jsx           # Errors and retry banner
    FeedbackButtons.jsx   # Thumbs up / down
    MetricCard.jsx        # Dashboard stat tiles
    LatencyBar.jsx        # Per-call latency visualization
    CallLog.jsx             # Request history list
  hooks/
    useMetrics.js         # Latency, tokens, call log
  lib/
    aiClient.js           # Stream, retry, timeout, errors
  store/
    chatStore.js          # Sessions and chat actions
```

---

## Run locally

```bash
npm install
cp .env.example .env.local   # set VITE_ANTHROPIC_API_KEY
npm run dev
```

Requires an [Anthropic API key](https://console.anthropic.com/). Set `VITE_ANTHROPIC_API_KEY` in `.env.local`; the client runs in the browser.

---

## License

MIT
