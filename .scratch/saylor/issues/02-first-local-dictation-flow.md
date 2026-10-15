# 02: Complete the first local dictation flow

Status: resolved
Blocked by: 01 — Verify a suitable free AI provider (must pass).
Execution: Completed after ticket 01's preliminary provider selection.
Parent: SayLor — Personal Web MVP specification.

**What to build:** Let the user start SayLor locally on Windows, record English speech, receive the original transcription and lightly cleaned result, edit it, and manually copy it in one complete working flow.

- [x] Start the React/Vite frontend and Hono/Node.js backend with one command in the TypeScript/pnpm workspace, using free dependencies and no cloud hosting, database, or account service.
- [x] Keep the backend on loopback, restrict it to the intended frontend, and keep provider credentials outside browser-delivered code and responses.
- [x] Capture only after explicit Start and microphone permission. Show recording state and timer; support Stop and Cancel. Cancel discards without submission; the 60-second cap ends recording through the normal stopped-recording flow.
- [x] Send valid recorded audio through the local API and the accepted provider adapters. Establish bounded request sizes/timeouts and validate compatible audio formats without silent truncation.
- [x] Show distinct Transcribing and Cleaning states, then separate original transcription and editable result. Default dictation preserves the spoken language and applies conservative cleanup without adding information.
- [x] Copy only on request, using the current edited result. If copying fails, keep the text available and explain the failure.
- [x] Release microphone resources after stop/cancel/closure. Discard successful audio; keep results only in the page session, clear them on refresh, and exclude sensitive content from persistent storage and logs.
- [x] Never activate billing or paid fallback. Expose failures honestly; complete recovery behavior is added in ticket 05.
- [x] Demonstrate the browser → local API → result flow with controlled provider responses, plus a non-sensitive live smoke check after ticket 01 passes. Test visible behavior rather than component internals.
- [x] Prepare reviewable changes only; the user alone may merge. Do not change repository protections or enable auto-merge.

## Comments

Approved for local ticket publication on 2026-10-15. This ticket includes the minimum complete application foundation; it is not a standalone frontend/backend scaffolding task.

Implementation evidence, 2026-10-15:

- Local branch `codex/ticket-02` started at `db55113efd0746283d80eb8a8489142757f7c745`; foundation commit `9b85e83a8742a9998237935d19a4524c6013fea6`. No merge or push performed.
- Approved browser → local API → result seam used with synthetic microphone input and a local fake Groq server. The initial test failed against missing UI, then passed after implementation.
- Four Playwright checks pass: full record/transcribe/clean/edit/copy/refresh; cancellation without upload; automatic recording cap through normal Stop; cross-origin/invalid-WAV rejection and safe no-store errors. The cap test accelerates browser time while native audio capture runs in real time.
- `pnpm typecheck` and `pnpm build` pass. Dependencies were chosen from current registry metadata, pinned, and locked. Both servers start through `pnpm dev`; alternate ports support isolated worktree validation.
- The browser converts capture to mono 16 kHz PCM16 WAV. The API accepts only validated WAV with at most 1,920,044 bytes/60 seconds; provider requests time out after 20 seconds, no retry or paid fallback. Backend configuration loads root `.env` while preserving existing process environment priority.
- Live non-sensitive API smoke on the integration workspace passed: public FLEURS English validation row 0, converted to PCM16, returned HTTP 200 from transcription and processing. Both preserved the reference sentence about a satellite; the local API pipeline took 1,932 ms. This is not full browser Stop-to-result timing. Mixed-language pause segmentation belongs to ticket 04; final quality/latency acceptance remains ticket 06.

## Answer

The first complete local English dictation flow is working and verified by four automated browser/API checks plus a real non-sensitive provider smoke test. A quiet public clip exposed an overly aggressive silence threshold; that is recorded for correction in ticket 04's WAV/segmentation work before final validation.
