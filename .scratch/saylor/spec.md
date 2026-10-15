# SayLor — Personal Web MVP

Status: claimed
Implementation authorization: Authorized by the user's implement-spec invocation on 2026-10-15, and subsequent approval to prepare Vercel-compatible code with updated specification. Actual deployment, paid services, merges, and repository-protection changes remain separate actions requiring authorization.
Provider gate: Preliminary selection completed on 2026-10-15 with user-confirmed Free/ZDR settings and user-waived eligibility clarification. Candidate pipeline: Whisper Large V3 Turbo plus GPT-OSS 120B. Functional implementation is integrated; final release-quality acceptance remains failed/open in ticket 06. See acceptance-report.md.
Updated: 2026-10-15

## Problem Statement

The user wants to speak naturally and obtain useful written text without manually typing, removing fillers, repairing false starts, or translating each message. Their speech includes English, Mandarin, Malay, and switches between these languages within one recording.

SayLor must meet one person's needs with a hard $0 software/service budget, conservative meaning preservation, and suitable treatment of potentially personal or confidential speech. The local Windows web app remains supported. The next delivery phase is a private hosted web version on Vercel, sharing the same dictation and translation behavior. Desktop integration and native Android APK work are later phases.

## Solution

Provide a local browser workspace where the user starts a recording, speaks for up to 60 seconds, and stops. Show a timer and Cancel control during recording. After stopping, show separate Transcribing and Cleaning/Translating states, then display the original transcription beside an editable result.

Default dictation preserves the spoken languages while removing fillers and false starts, resolving natural self-corrections, and fixing punctuation and obvious grammar. Alternatively, select English, Simplified Chinese, or Malay for output in that language. Preserve meaning, tone, names, numbers, and dates. Format simple paragraphs and lists when explicitly dictated.

The user reviews, edits, and manually copies the result. After transcription is available, selecting a different output language immediately processes the original transcription into that language. For example, Mandarin speech followed by selecting English produces English text without recording again or pressing Generate again. Ask before replacing manual edits; declining preserves the result, selected language and saved preference. Generate again remains available to repeat the current choice explicitly.

Run the frontend and backend locally with one startup command. Use cloud AI only after free-plan, privacy, eligibility, and quality checks pass. Stop cleanly when free quotas are exhausted. Keep no saved recording/transcript history and never automatically switch to paid services.

For the hosted phase, one Vercel Hobby project serves the website and backend functions on the same HTTPS origin. The application must work without the owner's local servers running. Require owner-only access covering both the website and API, including production URLs, and keep Groq credentials server-only. A private hosted trial does not establish that the outstanding speech-quality gate has passed.

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
29. As a user, I want selecting an output language to immediately translate the original transcription, so that I can change output without recording again or pressing another button.
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
41. As the owner, I want a private HTTPS web deployment containing both frontend and backend, so that I can use SayLor without keeping my computer's local servers running.
42. As the owner, I want authentication covering every hosted website and API URL, so that other visitors cannot use my free provider quota.
43. As a user, I want local development to remain available, so that hosting changes do not remove the existing workflow.

## Implementation Decisions

### Architecture and software cost

- Use TypeScript and pnpm workspaces, initially containing the web app, local API, and shared processing contracts. Add desktop/mobile projects later; avoid speculative shared packages.
- Use React/Vite for the frontend and Hono on Node.js for the backend. Both run locally on Windows with one startup command. Pin compatible stable versions during authorized implementation.
- Separate frontend capture/presentation from backend validation, credentials, orchestration, timeouts, and typed stage errors. Put provider-specific behavior behind replaceable adapters.
- Shared contracts describe output choices, original transcription, result, processing stages, and failures. A single detected-language value must not imply that a mixed recording contains only one language.
- In local mode, bind the backend to loopback and restrict access to the intended local frontend. In hosted mode, run the same Hono routes in Node.js Vercel Functions and serve the Vite build from the same project. Keep the same `/api/transcribe` and `/api/process` contracts. No database, separate backend host or paid custom domain is required.
- Use the Vercel Hobby plan and included `vercel.app` address for this personal, noncommercial deployment. Configure Vercel Authentication for all deployments, including production domains; verify unauthenticated website and API requests are blocked before adding live-use approval. Origin validation is not authentication. Do not enable paid upgrades or add-ons.
- Allow only exact configured hosted origins and trusted platform-provided deployment hostnames; never allow arbitrary `*.vercel.app` domains or derive authorization from untrusted forwarded headers. Missing/invalid hosted configuration must fail closed. Keep local-only access defaults isolated from the hosted entry point.
- Store `GROQ_API_KEY` in server-only Vercel environment configuration. Never bundle it, read a shipped `.env`, log request bodies, or persist audio/transcripts in hosted functions. Hosted processing adds Vercel to the request path; platform logging/retention controls must be reviewed before confidential use. Configure function duration above the bounded per-stage provider deadline and retain audio limits and no-paid-fallback behavior.
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
- A counting restart after a correction marker replaces the abandoned count with the restarted sequence, including correction markers in another language. Preserve the phrase introducing the count. Quoted apologies are not automatically corrections. Missing or corrupted speech-recognition content must not be invented during cleanup.
- Names, numbers, dates, and negation preserve intended meaning. Semantically equivalent script/date formatting is acceptable; arbitrary substitutions are not.
- Support simple explicitly dictated paragraph/list structure. Broader speech commands, snippets, and following recorded instructions are excluded.
- Keep original transcription separate from the editable result. Original transcription is provider-recognized text, not a guarantee of verbatim ground truth.
- Before transcription, output selection only saves the preference. After transcription, selecting a different output immediately processes the original transcription into that language. Warn before replacing manual edits; declining retains edits, selection and preference. Generate again explicitly repeats the current choice. Disable selection during recording, processing and quota cooldown; failures preserve original/prior text and require explicit retry or a new user-selected language, without another audio upload.
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
- The implemented Playwright suites exercise the browser/local API workflow with controlled external provider responses. Tool checks use Node's test runner. Optional live text regressions exercise counting restarts and Chinese-to-English translation through the local API; these consume free quota and run separately from CI.
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
- Verify the production-built frontend through the hosted function entry point with controlled provider responses, including upload, translation, rejected origins/hosts, invalid input and safe failures. Local simulation does not independently prove Vercel routing or authentication. After separately authorized preview deployment, verify real routing, HTTPS microphone access, unauthorized website/API denial, server-only secrets and the complete flow with no local server running. Production promotion remains a separate owner-approved step.

## Out of Scope

- Paid-service activation, public/unrestricted demo, application-managed account system, synchronization, database, and saved transcript/audio history.
- Actual hosted deployment and production promotion during the currently authorized code-preparation step; perform these only after separate authorization and private-access verification.
- Windows desktop packaging, global shortcuts, floating recorder, and insertion into other apps.
- Mobile apps, custom keyboards, system-wide dictation, macOS support.
- Continuous/real-time streaming, offline inference, system-audio capture, text-to-speech, simultaneous translation targets, and additional initial output choices.
- Personal dictionaries, automatic vocabulary learning, snippets, per-app tone, creative rewriting, meeting recording, speaker identification, and summaries.
- Unlimited free use, guaranteed cloud latency, or accuracy claims unsupported by evaluation.

## Further Notes

- The official name is SayLor. Earlier SayYor branding and the original draft's finalized cloud stack are superseded by confirmed conversation decisions.
- This spec is published to the local Markdown tracker with ready-for-agent status as required by the invoked skill. That status describes the prepared spec; it does not waive provider prerequisites or authorize implementation.
- Planning notes are preserved separately. The user supplied natural-speech screenshots and confirmed counting restarts and the intended Malay counting phrase. Use anonymized regression cases; screenshots without original audio cannot independently establish every spoken word, name spelling, latency or recognition error. Representative live acceptance remains open.
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
- Hosted-phase clarification on 2026-10-15 supersedes the original local-only hosting exclusion. Prepare and test code first; retain ticket 06's failed quality gate. Reference current [Vercel Node.js functions](https://vercel.com/docs/functions/runtimes/node-js), [Hobby plan](https://vercel.com/docs/plans/hobby), and [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication) when configuring the separately authorized deployment.
