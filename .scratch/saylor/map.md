# SayLor implementation map

## Notes

Implementation is on `codex/saylor-integration`. The repository owner retains merge authority. The user-authorized push published `69d6c99`; GitHub reported that the authenticated account bypassed its branch-creation restriction. No merge, protection-setting change, deployment or paid-service activation was performed. The following translation improvement is committed locally and has not been pushed.

Current verified code: `d053712` (bounded English draft followed by translation-only Chinese for input with Latin letters), following `c2c1ef0` audio fixes. `pnpm check` passed 35 checks (3 tool, 32 browser/API), typecheck, build and credential scanning. Eight integrated live text checks and one full browser replay preserve the previously wrong Central America region and its qualifier. The frozen raw WAV development baseline remains 14/20 provisionally usable with five critical errors; this is not a new full 20-case acceptance run. [Accuracy investigation](accuracy-investigation.md), [tooling history](retro.md) and [operations reference](../../docs/agents/operations.md).

## Decisions-so-far

- [01: Provider screening](issues/01-verify-free-ai-provider.md): preliminary Groq selection and user-confirmed Free/ZDR settings; eligibility clarification waived by the user.
- [02: Local dictation](issues/02-first-local-dictation-flow.md): one-command local browser/API workflow, recording, editable result and explicit copy.
- [03: Translation](issues/03-translate-and-regenerate.md): four output choices, explicit regeneration and protection of edits.
- [04: Multilingual dictation](issues/04-multilingual-dictation-and-structure.md): bounded ordered pause segmentation, conservative processing instructions and live non-sensitive screening.
- [05: Recovery](issues/05-recover-from-failures.md): manual stage retries, temporary audio, quota guidance, cancellation and stale-response guards.
- [Retro improvements](retro.md): maintained evaluation command, quota metadata, shared local/CI checks, credential scanning and continuation pointers. CI configuration is published on the feature branch; remote execution has not been verified. Its triggers are pull requests and main/master pushes.
- [Initial accuracy investigation](accuracy-investigation.md): `c2c1ef0` fixed soft speech being cut as silence and browser call-processing distortion in replay. That increment kept the speech/text models and text prompt unchanged; its unsuccessful model, normalization and pivot candidates were not adopted.
- [Chinese translation follow-up](accuracy-investigation.md#chinese-translation-follow-up): translation-only second pass preserves all clauses in eight live text checks, including mixed names and quoted instructions. Models remain unchanged; Chinese output with Latin letters uses one additional bounded text call. Generic ASR language context failed all five remaining critical cases and was rejected.

## Fog

- [06: Final acceptance](issues/06-validate-complete-mvp.md) remains unfinished. Retain the [initial baseline](acceptance-report.md) and current private run `pause-relative-full-20261015`. Current failure cases: 01 (name/bhajans), 04 (Galapagos/grazing), 14 (mosques), 18 (highway name), 20 (cricket quantities/name); case 10 still needs substantive correction. The separate mixed-to-Chinese region error passes the new targeted checks, but overall semantic acceptance still fails.
- Natural within-sentence trilingual speech and the user's accent remain unverified. Earlier browser replay observations are 1,577/2,683 ms on two 22-second public sources; the new Chinese pipeline replay took 2,979 ms on the same 22.34-second artificial sequential clip. Capture tracks ended afterward. These samples do not establish typical/tail latency or natural speech quality.
- Next work: address the remaining speech/text semantic errors without reference answers in prompts; preserve the failed runs and evaluate new candidates through the maintained tooling. Have a competent speaker review results. For user-accent evidence, use [personal speech checks](natural-speech-check.md); user-reported text alone does not independently attest precise spoken wording. Update this map with the next experiment, tested code and unresolved question. The passing controlled-provider suites cannot substitute for live acceptance.

