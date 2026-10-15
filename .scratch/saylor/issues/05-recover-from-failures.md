# 05: Recover from failures without losing useful work

Status: resolved
Blocked by: 02 — Complete the first local dictation flow.
Execution: Authorized by implement-spec on 2026-10-15; waits for its blocking ticket.
Parent: SayLor — Personal Web MVP specification.

**What to build:** Let the user understand recording/processing failures, retain useful partial results, and manually retry only the failed stage without duplicate requests, unintended charges, or lost edits.

- [x] Show actionable microphone-permission and unavailable-capture errors, and distinguish no-speech from validation, timeout, provider, network, and quota failures where applicable.
- [x] Reject invalid/oversized audio without silent truncation. Do not present silence or failed processing as a successful invented result.
- [x] On successful transcription followed by text-processing failure, keep the original transcription available and let the user retry text processing without re-uploading or re-transcribing audio.
- [x] On transcription failure, retain the clip only temporarily in browser memory for explicit retry. Release it after successful processing, discard/dismissal, or page closure; do not persist it.
- [x] Preserve any existing result and manual edits on failed attempts. Keep original and edited text distinct.
- [x] Prevent repeated clicks from overlapping submissions. Late responses cannot replace newer results or manual edits.
- [x] Do not automatically retry provider failures, loop on quotas, switch providers, or invoke paid fallback. Explain quota exhaustion and respect available retry guidance.
- [x] Test each failure and recovery through the browser/local API flow with controlled provider responses. Verify stage-specific retry, content release, and absence of repeated successful transcription.
- [x] Keep recovery generic to the text-processing stage so it can combine with ticket 03 without depending on its translation UI; ticket 06 verifies that combination.
- [x] Retain backend-only credentials, sensitive-log exclusions, free plans, and exclusive user merge authority; do not alter repository protections.

## Comments

Approved for local ticket publication on 2026-10-15. No automatic retry or recording history is introduced.

## Answer

Implemented explicit failed-stage retries with browser-memory-only failed audio, selected-output snapshots, bounded quota cooldowns, cancellation and attempt guards. Text-processing failure retains the original transcription and existing edited result. Text retries and regeneration warn before replacing edits. Capture errors explain permissions or missing/unavailable microphones. API/client failures distinguish invalid input, no speech, provider/network failure, timeout and quota; no automatic retries or paid fallback were added.

Browser-to-local-API checks replace only the external provider boundary. Eleven recovery checks passed, followed by a red/green regression for declining/approving text retry after further manual edits. Original four dictation checks, typecheck and production build passed. The oversized-upload regression exposed an early rejection that Chromium surfaced as a network error; bounded streaming inspection now returns the typed validation error without provider submission. Final integration rechecks all suites.
