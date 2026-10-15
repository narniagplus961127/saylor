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
pnpm check
```

`pnpm test` runs dictation, translation, multilingual and recovery suites sequentially on isolated ports. Browser tests launch the actual frontend and API, a synthetic browser microphone and a local fake Groq server. They use a dummy key and never call the live provider. `FAKE_GROQ_PORT`, `WEB_PORT` and `API_PORT` allow parallel worktrees to use different ports. Tests observe the user workflow rather than component internals. A production build checks the web bundle; daily local startup remains `pnpm dev`.

`pnpm check` runs the tool checks, type checking, all workflow suites, production build and credential scan. The GitHub Actions workflow runs the same command with dummy credentials. It does not run live speech evaluation. See [local operations](docs/agents/operations.md) and [resumable evaluation](docs/evaluation.md). `pnpm check:secrets --build` scans tracked/unignored working files and the browser build, including the locally configured key when present, without printing matching values. It is a targeted Groq/private-key check, not a general secret-detection service.

## Boundaries

- `apps/web`: capture, review and clipboard UI. Browser audio is normalized to mono 16 kHz PCM16 WAV.
- `apps/api`: validation and Groq adapters; keys stay in this backend. Two operations keep successful transcription separate from cleanup.
- `packages/contracts`: stage request/response and failure types.
- `POST /api/transcribe`: raw `audio/wav`, at most 1,920,044 bytes/60 seconds; returns `{ transcript }`.
- `POST /api/process`: JSON `{ transcript, output: "original" | "en" | "zh" | "ms" }`; returns `{ result }`. The selected language translates the complete message or conservatively cleans input already in that language.
- Failures return `{ error: { code, message, retryAfter? } }`. Requests are bounded, no automatic retries or paid fallback are implemented, and provider error bodies are never reflected.

Choose Keep original languages, English, Simplified Chinese or Malay before or after recording. Only this preference is saved in browser storage. Once transcription is available, choosing a different language immediately processes the original transcription into that language; for example, speak Chinese and then choose English. You are asked before replacing manual edits; declining preserves your edits and previous language choice. Generate again repeats the current choice. A generation failure leaves the existing result available. Copy result always copies the current edit.

Chinese output from text containing Latin letters uses an English semantic draft followed by a translation-only Chinese pass. Original Chinese name characters are supplied to the final pass. This makes at most two text-model calls within one shared 20-second deadline and uses more of the free quota. Chinese input without Latin letters and the other output choices use one text-model call. Either pass failing leaves the previous result available for explicit retry.

Translation/regeneration browser checks use a separate controlled Groq fixture: `pnpm exec playwright test -c playwright.translation.config.ts`. Set `WEB_PORT=5273`, `API_PORT=8887`, and `FAKE_GROQ_PORT=9897` when running alongside another worktree.

Groq's `whisper-large-v3-turbo` and `openai/gpt-oss-120b` are the preliminary selected models. Free availability is quota-limited. Multilingual segmentation and manual stage recovery are implemented. The live quality gate remains open; see the [current implementation map](.scratch/saylor/map.md) and [accuracy investigation](.scratch/saylor/accuracy-investigation.md) for results and remaining failures. Automated fixtures establish workflow behavior, not live translation quality. Only the repository owner may merge changes.

Capture requests unprocessed microphone audio for dictation, then converts it to mono PCM16 WAV. Quiet speech is protected from an absolute-volume pause threshold. Real microphone, room-noise and accent validation remains necessary; simulated public-file replays do not establish that coverage.

On a temporary transcription failure, Retry transcription reuses audio held only in page memory. Once transcription succeeds, audio is released and Retry text processing reuses the original text. Discard or Cancel processing releases a failed attempt; useful existing text stays available. Provider quota guidance disables new requests until the indicated wait expires. No automatic retries occur.
