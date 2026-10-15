# 05: Recover from failures without losing useful work

Status: ready-for-agent
Blocked by: 02 — Complete the first local dictation flow.
Execution: Authorized by implement-spec on 2026-10-15; waits for its blocking ticket.
Parent: SayLor — Personal Web MVP specification.

**What to build:** Let the user understand recording/processing failures, retain useful partial results, and manually retry only the failed stage without duplicate requests, unintended charges, or lost edits.

- [ ] Show actionable microphone-permission and unavailable-capture errors, and distinguish no-speech from validation, timeout, provider, network, and quota failures where applicable.
- [ ] Reject invalid/oversized audio without silent truncation. Do not present silence or failed processing as a successful invented result.
- [ ] On successful transcription followed by text-processing failure, keep the original transcription available and let the user retry text processing without re-uploading or re-transcribing audio.
- [ ] On transcription failure, retain the clip only temporarily in browser memory for explicit retry. Release it after successful processing, discard/dismissal, or page closure; do not persist it.
- [ ] Preserve any existing result and manual edits on failed attempts. Keep original and edited text distinct.
- [ ] Prevent repeated clicks from overlapping submissions. Late responses cannot replace newer results or manual edits.
- [ ] Do not automatically retry provider failures, loop on quotas, switch providers, or invoke paid fallback. Explain quota exhaustion and respect available retry guidance.
- [ ] Test each failure and recovery through the browser/local API flow with controlled provider responses. Verify stage-specific retry, content release, and absence of repeated successful transcription.
- [ ] Keep recovery generic to the text-processing stage so it can combine with ticket 03 without depending on its translation UI; ticket 06 verifies that combination.
- [ ] Retain backend-only credentials, sensitive-log exclusions, free plans, and exclusive user merge authority; do not alter repository protections.

## Comments

Approved for local ticket publication on 2026-10-15. No automatic retry or recording history is introduced.
