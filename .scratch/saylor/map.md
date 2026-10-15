# SayLor implementation map

## Notes

Implementation is on `codex/saylor-integration`. The repository owner retains merge authority. No push, merge, deployment or paid-service activation was performed.

Current verified code: `c2c1ef0` (relative pause detection and unprocessed dictation capture). `pnpm check` passed 32 checks (3 tool, 29 browser/API), typecheck, build and credential scanning. The raw WAV development baseline is 14/20 provisionally usable with five critical errors, improved from 10/20 with nine. Mixed-to-Chinese regeneration has an additional region error. [Accuracy investigation](accuracy-investigation.md), [tooling history](retro.md) and [operations reference](../../docs/agents/operations.md).

## Decisions-so-far

- [01: Provider screening](issues/01-verify-free-ai-provider.md): preliminary Groq selection and user-confirmed Free/ZDR settings; eligibility clarification waived by the user.
- [02: Local dictation](issues/02-first-local-dictation-flow.md): one-command local browser/API workflow, recording, editable result and explicit copy.
- [03: Translation](issues/03-translate-and-regenerate.md): four output choices, explicit regeneration and protection of edits.
- [04: Multilingual dictation](issues/04-multilingual-dictation-and-structure.md): bounded ordered pause segmentation, conservative processing instructions and live non-sensitive screening.
- [05: Recovery](issues/05-recover-from-failures.md): manual stage retries, temporary audio, quota guidance, cancellation and stale-response guards.
- [Retro improvements](retro.md): maintained evaluation command, quota metadata, shared local/CI checks, credential scanning and continuation pointers. CI is configured locally and awaits publication; remote execution has not been verified.
- [Accuracy investigation](accuracy-investigation.md): fixed soft speech being cut as silence and browser call-processing distortion in replay. The speech/text models and text prompt remain unchanged; unsuccessful model, normalization and pivot candidates were not adopted.

## Fog

- [06: Final acceptance](issues/06-validate-complete-mvp.md) remains unfinished. Retain the [initial baseline](acceptance-report.md) and current private run `pause-relative-full-20261015`. Current failure cases: 01 (name/bhajans), 04 (Galapagos/grazing), 14 (mosques), 18 (highway name), 20 (cricket quantities/name); case 10 still needs substantive correction. Direct mixed-to-Chinese translation also confuses Central America with the US/central US.
- Natural within-sentence trilingual speech and the user's accent remain unverified. Final browser replay observations are 1,577/2,683 ms on two 22-second public sources; capture tracks ended afterward. These samples do not establish typical/tail latency or natural speech quality.
- Next work: address the remaining speech/text semantic errors without reference answers in prompts; preserve the failed runs and evaluate new candidates through the maintained tooling. Have a competent speaker review results. For user-accent evidence, use [personal speech checks](natural-speech-check.md); user-reported text alone does not independently attest precise spoken wording. Update this map with the next experiment, tested code and unresolved question. The passing controlled-provider suites cannot substitute for live acceptance.

