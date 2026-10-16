# Limit recording submissions with a best-effort hourly counter

Type: task
Status: resolved

## Scope

Final owner steering: allow 20 valid recording submissions total across all visitors per Vercel function instance, back-to-back if desired. This supersedes the earlier per-IP/10-recording idea. Owner approved the best-effort, in-memory option after declining additional accounts/storage. The one-hour window begins at the first valid submission; the first valid request at or after expiry starts a new window. Block the 21st request before Groq. Instance restarts and separate instances reset/separate counters, so this is not a guaranteed site-wide limit.

No database, Upstash account, new service, login, IP tracking or text-processing limit. Count one submitted WAV before provider segmentation; invalid requests and browser cancellation before submission do not count. Provider-failed submissions and explicit transcription retries count as attempts. Keep original/result text and manual edits on rejection, with Retry-After guidance. Translation of existing text remains available during a recording cooldown. Local development remains unlimited. Retain only two in-memory numbers (count and reset time).

## Verification

Test burst/concurrent submissions across different caller headers, exact reset boundary, invalid input/origin rejection before counting, no provider calls when blocked, and persistence across hosted app recreation in one process. Check browser text preservation and retry countdown. Run repository checks without live provider traffic.

## Answer

Implemented a synchronous, process-scoped reservation before Groq transcription in the hosted Vercel entry. All visitors share 20 slots; the first valid submission starts an hour, and the first valid submission at/after expiry starts a fresh window. The 21st is a typed 429 with Retry-After. No caller/IP headers affect the counter. Segmentation uses one slot per WAV; provider failures count. Invalid WAVs, silence and disallowed/missing origins do not count. Local development remains unlimited.

The browser keeps the recording cooldown separate from general provider quota delays: previous transcription/results/edits and copying survive, and existing text can still be translated. Only new recording and transcription retry wait for the recording cooldown. No database, account, dependency, external setting, secret or paid feature was added. Text processing has no new limit. Restart/separate-instance limitations are accepted and documented.

Validation: `pnpm check` passed all 41 checks (5 tool, 36 browser/API), type checking, build and credential scanning (94 source/build files). The expanded native-handler regression was also run separately after adding segmented-audio and silence checks and passed. All provider traffic was controlled; no live Groq quota was consumed. `git diff --check` passed. Tests cover 20 concurrent requests from distinct caller headers, blocked provider calls, exact reset/non-extending failures, failed-provider accounting, two-segment recordings, instance independence and browser text preservation/translation during cooldown. Initial fixture silence was corrected; loopback tests were rerun with authorized network access.

Changes are local on `codex/saylor-integration` based on `af6a394`; not committed, pushed, merged or deployed. Current Production `3b8b3b8` has no recording counter until the owner publishes/merges the implementation. Ticket 06 remains open independently.
