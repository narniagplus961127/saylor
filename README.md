# SayLor

A personal, local web workspace for short dictation. Speak, review the original transcription and lightly cleaned result, edit, then explicitly copy. Audio and text are sent to Groq; the application saves no recording or transcript history.

## Run on Windows

Install Node.js 24 and pnpm 12.8.1 (both free). From the repository root:

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env # Only when .env does not already exist.
```

Put your own Free-plan `GROQ_API_KEY` in the root `.env` file. Keep billing and auto-recharge disabled and enable zero data retention for speech and text in your Groq organization. Never put a key in a `VITE_` variable or commit `.env`. Existing process environment values take priority over `.env`.

```powershell
pnpm dev
```

Open **http://127.0.0.1:5173** in a current Chrome or Edge browser. Allow microphone access when you press Start recording. Stop submits the clip; Cancel discards it without submitting. Recordings stop automatically at 60 seconds. Review both panels, edit the result and press Copy result. Refresh clears session text.

Both servers bind to loopback. The Hono API listens on port 8787 and accepts mutations only from the intended web origin. Optional process environment variables `WEB_PORT` and `API_PORT` change both ports together; always open the matching `127.0.0.1` address. This is a local development application, not a public hosted service.

## Verify

```powershell
pnpm exec playwright install chromium
pnpm test
pnpm typecheck
pnpm build
```

Browser tests launch the actual frontend and API, a synthetic browser microphone and a local fake Groq server. They use a dummy key and never call the live provider. `FAKE_GROQ_PORT`, `WEB_PORT` and `API_PORT` allow parallel worktrees to use different ports. Tests observe the user workflow rather than component internals. A production build checks the web bundle; daily local startup remains `pnpm dev`.

## Boundaries

- `apps/web`: capture, review and clipboard UI. Browser audio is normalized to mono 16 kHz PCM16 WAV.
- `apps/api`: validation and Groq adapters; keys stay in this backend. Two operations keep successful transcription separate from cleanup.
- `packages/contracts`: stage request/response and failure types.
- `POST /api/transcribe`: raw `audio/wav`, at most 1,920,044 bytes/60 seconds; returns `{ transcript }`.
- `POST /api/process`: JSON `{ transcript, output: "original" }`; returns `{ result }`.
- Failures return `{ error: { code, message, retryAfter? } }`. Requests are bounded, no automatic retries or paid fallback are implemented, and provider error bodies are never reflected.

Groq's `whisper-large-v3-turbo` and `openai/gpt-oss-120b` are the preliminary selected models. Free availability is quota-limited. Mixed-language handling, translation, regeneration, recovery and the separate 20-recording quality gate belong to subsequent tickets. The initial complete English flow does not establish final MVP acceptance. Only the repository owner may merge changes.
