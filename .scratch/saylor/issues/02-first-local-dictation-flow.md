# 02: Complete the first local dictation flow

Status: ready-for-agent
Blocked by: 01 — Verify a suitable free AI provider (must pass).
Execution: Authorized by implement-spec on 2026-10-15; cannot start until ticket 01 passes.
Parent: SayLor — Personal Web MVP specification.

**What to build:** Let the user start SayLor locally on Windows, record English speech, receive the original transcription and lightly cleaned result, edit it, and manually copy it in one complete working flow.

- [ ] Start the React/Vite frontend and Hono/Node.js backend with one command in the TypeScript/pnpm workspace, using free dependencies and no cloud hosting, database, or account service.
- [ ] Keep the backend on loopback, restrict it to the intended frontend, and keep provider credentials outside browser-delivered code and responses.
- [ ] Capture only after explicit Start and microphone permission. Show recording state and timer; support Stop and Cancel. Cancel discards without submission; the 60-second cap ends recording through the normal stopped-recording flow.
- [ ] Send valid recorded audio through the local API and the accepted provider adapters. Establish bounded request sizes/timeouts and validate compatible audio formats without silent truncation.
- [ ] Show distinct Transcribing and Cleaning states, then separate original transcription and editable result. Default dictation preserves the spoken language and applies conservative cleanup without adding information.
- [ ] Copy only on request, using the current edited result. If copying fails, keep the text available and explain the failure.
- [ ] Release microphone resources after stop/cancel/closure. Discard successful audio; keep results only in the page session, clear them on refresh, and exclude sensitive content from persistent storage and logs.
- [ ] Never activate billing or paid fallback. Expose failures honestly; complete recovery behavior is added in ticket 05.
- [ ] Demonstrate the browser → local API → result flow with controlled provider responses, plus a non-sensitive live smoke check after ticket 01 passes. Test visible behavior rather than component internals.
- [ ] Prepare reviewable changes only; the user alone may merge. Do not change repository protections or enable auto-merge.

## Comments

Approved for local ticket publication on 2026-10-15. This ticket includes the minimum complete application foundation; it is not a standalone frontend/backend scaffolding task.
