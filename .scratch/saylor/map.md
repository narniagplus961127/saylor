# SayLor implementation map

## Notes

Implementation is on `codex/saylor-integration`. The repository owner retains merge authority. No push, merge, deployment or paid-service activation was performed.

Current verified code: `cdff062` (retrospective tooling follow-through). `pnpm check` passed 3 tool checks and 26 browser/API checks, typecheck, build and credential scanning. All 20 frozen recordings also passed `pnpm evaluate --run baseline-check --dry-run`; no live AI requests were made for this tooling change. [Tooling evidence](retro.md) and [operations reference](../../docs/agents/operations.md).

## Decisions-so-far

- [01: Provider screening](issues/01-verify-free-ai-provider.md): preliminary Groq selection and user-confirmed Free/ZDR settings; eligibility clarification waived by the user.
- [02: Local dictation](issues/02-first-local-dictation-flow.md): one-command local browser/API workflow, recording, editable result and explicit copy.
- [03: Translation](issues/03-translate-and-regenerate.md): four output choices, explicit regeneration and protection of edits.
- [04: Multilingual dictation](issues/04-multilingual-dictation-and-structure.md): bounded ordered pause segmentation, conservative processing instructions and live non-sensitive screening.
- [05: Recovery](issues/05-recover-from-failures.md): manual stage retries, temporary audio, quota guidance, cancellation and stale-response guards.
- [Retro improvements](retro.md): maintained evaluation command, quota metadata, shared local/CI checks, credential scanning and continuation pointers. CI is configured locally and awaits publication; remote execution has not been verified.

## Fog

- [06: Final acceptance](issues/06-validate-complete-mvp.md) remains unfinished. The [frozen live evaluation](acceptance-report.md) failed the agreed quality gate. A larger Whisper candidate also failed and stopped on HTTP 429; no automatic retries or paid fallback followed.
- Natural within-sentence trilingual speech, the user's accent and full browser Stop-to-result latency on representative 20-second speech still require validation. API-only timings do not settle browser latency.
- Next implementation work: investigate transcription/segmentation quality with a new frozen run after confirming free capacity; use the [evaluation command](../../docs/evaluation.md), retain the failed baseline and have a competent speaker review results. Update this map with the experiment/run name, tested code and next unresolved question. Do not substitute the passing controlled-provider suites for live acceptance.

