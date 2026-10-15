# SayLor — Personal Web MVP

Status: claimed
Implementation authorization: Authorized by the user's implement-spec invocation on 2026-10-15, subject to the provider prerequisite and ticket dependencies. Paid services, deployment, merges, and protection changes remain unauthorized.
Provider gate: Preliminary selection completed on 2026-10-15 with user-confirmed Free/ZDR settings and user-waived eligibility clarification. Candidate pipeline: Whisper Large V3 Turbo plus GPT-OSS 120B. Functional implementation is integrated; final release-quality acceptance remains failed/open in ticket 06. See acceptance-report.md.
Updated: 2026-10-15

## Problem Statement

The user wants to speak naturally and obtain useful written text without manually typing, removing fillers, repairing false starts, or translating each message. Their speech includes English, Mandarin, Malay, and switches between these languages within one recording.

SayLor must meet one person's needs with a hard $0 software/service budget, conservative meaning preservation, and suitable treatment of potentially personal or confidential speech. The first deliverable is a local Windows web app. Desktop integration and mobile apps are later phases.

## Solution

Provide a local browser workspace where the user starts a recording, speaks for up to 60 seconds, and stops. Show a timer and Cancel control during recording. After stopping, show separate Transcribing and Cleaning/Translating states, then display the original transcription beside an editable result.

Default dictation preserves the spoken languages while removing fillers and false starts, resolving natural self-corrections, and fixing punctuation and obvious grammar. Alternatively, select English, Simplified Chinese, or Malay for output in that language. Preserve meaning, tone, names, numbers, and dates. Format simple paragraphs and lists when explicitly dictated.

The user reviews, edits, and manually copies the result. Changing output after processing requires Generate again using the original transcription, with a warning before replacing manual edits.

Run the frontend and backend locally with one startup command. Use cloud AI only after free-plan, privacy, eligibility, and quality checks pass. Stop cleanly when free quotas are exhausted. Keep no saved recording/transcript history and never automatically switch to paid services.

## User Stories

1. As a personal user, I want to open SayLor locally on Windows, so that I can dictate without a hosted service or public account system.
2. As a user, I want one startup command for the frontend and backend, so that daily setup is straightforward.
3. As a user, I want to explicitly start recording, so that microphone capture begins only when intended.
4. As a user, I want a recording indicator and timer, so that I know the microphone is active and how long I have spoken.
5. As a user, I want to stop recording, so that my completed speech is processed.
6. As a user, I want a 60-second recording cap, so that short dictation stays bounded.
7. As a user, I want to cancel and discard before submission, so that unwanted audio is not sent to a provider.
8. As a user, I want actionable microphone-permission errors, so that I can recover when recording is unavailable.
9. As a user, I want a clear no-speech outcome, so that silence is not presented as an invented message.
10. As a user, I want English dictation, so that I can write English messages naturally.
11. As a user, I want Mandarin dictation, so that I can write Mandarin messages naturally.
12. As a user, I want Malay dictation, so that I can write Malay messages naturally.
13. As a user, I want mixed-language speech preserved in dictation, so that language switches are not silently translated away.
14. As a user, I want language recognition without a required source-language selection, so that I can begin speaking directly.
15. As a user, I want fillers, repetitions, and false starts removed, so that the result needs less manual cleanup.
16. As a user, I want natural self-corrections resolved, so that my final intended statement appears in the result.
17. As a user, I want punctuation and obvious grammar corrected, so that the result is readable.
18. As a user, I want meaning, tone, names, numbers, and dates preserved, so that cleanup does not misrepresent me.
19. As a user, I want explicitly dictated paragraphs and lists formatted, so that basic structure survives transcription.
20. As a user, I want English output, so that speech in other languages can become English text.
21. As a user, I want Simplified Chinese output, so that speech in other languages can become Simplified Chinese text.
22. As a user, I want Malay output, so that speech in other languages can become Malay text.
23. As a user, I want mixed-language speech translated into one selected output language, so that the entire message's meaning reaches that result.
24. As a user, I want my last output choice remembered locally, so that I avoid repeatedly configuring it.
25. As a user, I want processing-stage indicators, so that I can distinguish transcription from cleanup or translation.
26. As a user, I want the original transcription visible beside the result, so that I can assess what changed.
27. As a user, I want to edit the result, so that I control the final wording.
28. As a user, I want an explicit Copy action, so that clipboard changes happen only when requested.
29. As a user, I want explicit regeneration from the original transcription, so that I can change output without recording again.
30. As a user, I want a warning before regeneration replaces edits, so that my work is not silently lost.
31. As a user, I want the transcription preserved when text processing fails, so that partial success remains useful.
32. As a user, I want to retry only the failed stage, so that successful work is not unnecessarily repeated.
33. As a user, I want failed audio retained temporarily in memory for retry, so that a transient error does not force another recording.
34. As a user, I want clear quota and service errors, so that I know when to retry or wait for free capacity.
35. As a user, I want zero automatic paid fallback, so that use cannot silently introduce charges.
36. As a user, I want provider keys outside browser-delivered code, so that frontend access does not expose them.
37. As a user, I want no persisted audio or transcript history, so that sensitive content does not accumulate.
38. As a user, I want provider data handling verified before sensitive use, so that cloud processing meets my privacy requirements.
39. As a user, I want spoken instructions treated as content, so that recorded phrases cannot override processing rules.
40. As a user, I want validation against my languages and speech patterns, so that provider selection is based on usable results.

## Implementation Decisions

### Architecture and software cost

- Use TypeScript and pnpm workspaces, initially containing the web app, local API, and shared processing contracts. Add desktop/mobile projects later; avoid speculative shared packages.
- Use React/Vite for the frontend and Hono on Node.js for the backend. Both run locally on Windows with one startup command. Pin compatible stable versions during authorized implementation.
- Separate frontend capture/presentation from backend validation, credentials, orchestration, timeouts, and typed stage errors. Put provider-specific behavior behind replaceable adapters.
- Shared contracts describe output choices, original transcription, result, processing stages, and failures. A single detected-language value must not imply that a mixed recording contains only one language.
- Bind the backend to loopback and restrict access to the intended frontend. No cloud hosting, database, accounts, public API, or custom domain is needed for this release.
- Require free software and free service plans. Optional styling can use free Tailwind CSS; paid component kits, paid trials, and required subscriptions are excluded. Existing hardware, internet, and electricity are outside the software/service budget.
- Use the user's public GitHub repository, [narniagplus961127/saylor](https://github.com/narniagplus961127/saylor), as the source repository when repository work is authorized. The user reports protected rules and retains exclusive merge authority. Agents must not merge pull requests, enable automatic merging, bypass protections, or modify repository rules; prepare reviewable changes for the user instead. Protection settings have not been independently audited in this spec task.

### Recording, API, and failure behavior

- Start capture only after explicit action and browser permission. Release microphone resources on stop, cancel, or page closure.
- Record for at most 60 seconds. At the cap, end recording and follow the normal stopped-recording processing flow. Do not silently truncate oversized uploads on the server.
- Cancel before submission discards the clip without sending it. Empty or invalid audio must not be reported as a successful text result.
- Validate audio type, size, and duration where practical; enforce bounded requests/timeouts. Establish concrete encoding and byte limits from verified browser/provider compatibility during implementation.
- Expose idle, permission acquisition, recording, transcription, cleanup/translation, ready, and failure states clearly. Distinguish no-speech from provider failure.
- The API supports transcription and text processing as separate stage operations. Transcription accepts recorded audio and returns the original transcription and available language metadata. Text processing accepts that transcription plus the output choice and returns a result or typed failure. Provider response formats stay behind adapters.
- Screening-driven implementation detail: normalize capture to bounded mono PCM WAV and split sufficiently long pauses before transcription, preserving segment order. A single trilingual request produced a proper-noun error; automatically segmented requests recovered the public reference text. Do not claim this solves all within-sentence code switching. Treat detected-language metadata as advisory, especially Malay/Indonesian ambiguity.
- Preserve the original transcription when text processing fails. Retry text processing from that transcription without repeating successful audio transcription. Retain failed-transcription audio temporarily in browser memory for manual retry.
- Distinguish invalid input, microphone/capture failure, no-speech, quota exhaustion, unavailability, timeout, and text-processing failure where applicable. Errors must not expose credentials or sensitive payloads.
- Do not automatically retry failures, change providers, or enter unbounded request loops. Offer explicit stage retry and respect any provider retry guidance.
- Prevent repeated clicks from causing overlapping submissions. Late responses from earlier attempts must not overwrite newer results or manual edits.

### Text semantics and review

- Output choices are Keep original languages, English, Simplified Chinese, and Malay. Default to Keep original languages on first use; remember the last choice locally.
- Default dictation preserves language switches. A selected output language cleans same-language speech or translates other/mixed-language speech into that language while preserving the complete message.
- Cleanup removes fillers, repetitions, and false starts, fixes punctuation and obvious grammar, and resolves explicit natural self-corrections. Preserve meaning and tone; do not add facts, infer email structure, or creatively rewrite.
- Names, numbers, dates, and negation preserve intended meaning. Semantically equivalent script/date formatting is acceptable; arbitrary substitutions are not.
- Support simple explicitly dictated paragraph/list structure. Broader speech commands, snippets, and following recorded instructions are excluded.
- Keep original transcription separate from the editable result. Original transcription is provider-recognized text, not a guarantee of verbatim ground truth.
- Changing output choice does not itself make another request. Generate again uses the original transcription and warns before replacing manual edits; declining retains those edits.
- Copy acts only on explicit request and copies the current edited result. Clipboard failure must leave the text available.

### Privacy, lifecycle, and service budget

- Treat all recordings/text as potentially personal or confidential. Store credentials only in backend configuration. Exclude audio/transcripts/results from application logs and routine telemetry.
- Persist preferences only. Do not routinely write recordings, transcriptions, results, or failed audio to browser storage, files, or a database.
- Discard successful audio after processing. Keep failed-transcription audio only in browser memory until retry succeeds, the user discards/dismisses it, or the page closes. Text-processing retry needs the original transcription, not another upload.
- Text and edits exist in the current page session and clear on refresh. Backend payload copies are request-scoped and released on completion. Provider retention remains a separate verified concern.
- Stay on free plans with no billing activation, auto-recharge, paid trials, or automatic paid fallback. Quota exhaustion must produce a useful error and preserve available text. Unlimited free availability is not promised.
- Estimate 30 recordings daily averaging 20 seconds, approximately 600 audio seconds per day. Check actual provider account limits rather than relying solely on published summaries.

### Provider prerequisite and delivery order

- No AI provider/model is finalized. Groq transcription plus a Groq text model is a research candidate. Gemini's unpaid-service data-use terms conflict with the stated sensitive-content requirement, so Gemini is not the accepted default.
- Before real sensitive use, establish eligibility for this personal developer project, free account quotas, no-training treatment, applicable retention controls, and supported audio/text operations. Record evidence without secrets.
- Published provider terms include unresolved consumer-use wording. A working key or a successful request does not establish eligibility. Verify rather than treating user approval as a resolution.
- User steering on 2026-10-15: the user explicitly waived further support/eligibility verification and directed proceeding on the assumption that private use is acceptable. Record this as a user-accepted assumption, not provider clarification; it no longer blocks implementation. Free-plan, privacy, and technical validation requirements still apply.
- Validate relied-upon retention settings, including zero data retention, on the actual account. Document residual metadata collection and content-retention exceptions.
- Use synthetic/non-sensitive samples until eligibility/privacy checks pass. If no suitable free provider is available, report that the cloud AI workflow does not yet meet the spec; do not silently weaken privacy or enable a paid workaround.
- Resolve provider feasibility and quality evidence first. After separate implementation authorization, deliver record/transcribe/clean/review/copy, then translation/regeneration, then complete state/error/retry/privacy behavior before MVP acceptance.

## Testing Decisions

- The user approved one primary behavioral seam: the complete browser → local API → result workflow, with controlled provider responses for repeatable checks and the agreed 20 real recordings for live quality/latency validation.
- Good tests assert observable behavior, meaning preservation, stage outcomes, privacy, and cost boundaries. Avoid coupling tests to component internals, helper calls, exact prompt wording, or speculative module structure.
- There is no existing app code or test suite to reuse. Choose free tooling during implementation. Vitest from the original draft is a candidate for API/workflow checks; browser-level checks must still exercise the user flow.
- Exercise the UI and local API together where practical, replacing only the external provider boundary. Keep provider-specific response details out of frontend assertions.
- Cover each output choice, mixed-language dictation, conservative cleanup, self-corrections, dictated paragraphs/lists, original/result separation, editing, copy, regeneration, and protection of edits.
- Cover microphone denial/unavailability, silence, invalid/oversized audio, the 60-second cap, Cancel without submission, provider/network failure, timeout, and quota exhaustion.
- Simulate successful transcription followed by failed cleanup/translation. Assert original text remains and retry does not repeat transcription. Simulate transcription failure and assert manual retry reuses temporary audio.
- Verify repeated clicks and late responses cannot duplicate processing or overwrite newer/manual work. Verify no automatic paid path or retry loop.
- Check key isolation, absence of sensitive logs/persisted history, refresh clearing text, and release of successful/discarded clips and microphone resources.
- Use synthetic/non-sensitive fixtures for automation. Do not commit the user's personal recordings or send confidential samples to an unverified provider.
- Assemble 20 representative recordings covering English, Mandarin, Malay, mixed speech, names, numbers, dates, self-corrections, and spoken attempts to override processing rules. Cover all selected translation targets. Evaluate original transcription and final output separately to locate failure stages.
- Acceptance requires at least 18 of 20 final results usable without substantive correction and zero critical errors across all 20. Incorrect names, numbers, dates, intended meaning, or invented information are critical. A single critical error fails the gate even if 18/20 are usable; minor cosmetic punctuation fixes may be non-substantive.
- Judge translations by semantic equivalence rather than exact strings. Do not infer mixed-language accuracy from one detected-language label.
- Measure Stop-to-visible-final-result latency on representative 20-second clips, including both AI stages. Target five seconds; report actual timings and conditions. This is a measurable target, not a guaranteed cloud-service claim.
- Validate one-command startup and the complete flow on Windows in a supported Chromium browser. Record browser/provider versions, account conditions, measured quality/latency, and limitations before declaring the MVP usable.

## Out of Scope

- App implementation, dependency scaffolding, paid-service activation, and deployment during this specification task.
- Hosted/public demo, remote access, accounts, synchronization, database, saved transcript/audio history.
- Windows desktop packaging, global shortcuts, floating recorder, and insertion into other apps.
- Mobile apps, custom keyboards, system-wide dictation, macOS support.
- Continuous/real-time streaming, offline inference, system-audio capture, text-to-speech, simultaneous translation targets, and additional initial output choices.
- Personal dictionaries, automatic vocabulary learning, snippets, per-app tone, creative rewriting, meeting recording, speaker identification, and summaries.
- Unlimited free use, guaranteed cloud latency, or accuracy claims unsupported by evaluation.

## Further Notes

- The official name is SayLor. Earlier SayYor branding and the original draft's finalized cloud stack are superseded by confirmed conversation decisions.
- This spec is published to the local Markdown tracker with ready-for-agent status as required by the invoked skill. That status describes the prepared spec; it does not waive provider prerequisites or authorize implementation.
- Planning notes are preserved separately. User-specific speech/expected-output examples have not been supplied; populate the evaluation set during authorized validation rather than claiming it has passed.
- GitHub source repository creation does not change the configured local Markdown issue/spec tracker. No remote commits, pushes, or repository-rule changes were made by this spec task.
- REA 6.5.0 installation and a direct MCP handshake were verified. REA inspected Wispr Flow's public page in an owned temporary browser. This establishes visible product claims and inspection capability, not internal architecture or speech accuracy.
- Wispr Flow inspires basic cleanup and recording UX. SayLor's narrower scope and conservative meaning-preservation rules remain authoritative.
- Research occurred on 2026-10-15. Recheck changing terms, models, limits, and actual account settings before integration. References are evidence to revisit, not approval of a provider:
  - [Wispr Flow](https://wisprflow.ai/)
  - [Groq speech-to-text](https://console.groq.com/docs/speech-to-text)
  - [Groq rate limits](https://console.groq.com/docs/rate-limits)
  - [Groq data controls](https://console.groq.com/docs/your-data)
  - [Groq services agreement](https://console.groq.com/docs/legal/services-agreement)
  - [Gemini API terms](https://ai.google.dev/gemini-api/terms)
- Local software uses free/open-source components; cloud inference is a separate quota-limited service. Future desktop/mobile distribution needs a separate cost review.
