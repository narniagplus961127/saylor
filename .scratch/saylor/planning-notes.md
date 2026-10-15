# SayLor — planning notes

Status: Planning; interview in progress. App implementation is not authorized.

## Confirmed foundations

- Official name: SayLor. The pasted SayYor plan is an input draft; its technology choices remain provisional.
- Personal use first; defer a public, no-login portfolio demo.
- Hard $0 cost limit, no automatic paid fallback. Accept stopping when a free quota is exhausted.
- Web first, desktop later, mobile later.
- Default workflow: same-language dictation. Translation runs when an output language is selected.
- Initial language priorities: English, Mandarin, Malay, and mixed-language speech.
- Light cleanup removes fillers and false starts, fixes punctuation and obvious grammar, and preserves meaning, tone, names, and numbers; no added information or creative rewriting.
- Dictation preserves language switches. Explicit translation renders the whole message in the selected output language.
- Web MVP recording: click to start, click to stop, at most 60 seconds per recording; process after stopping.
- Show original transcription and cleaned or translated result; allow editing the result and manual copying.
- Estimated use: 30 recordings daily averaging 20 seconds, approximately 10 minutes per day.
- Treat dictation as potentially containing personal information or confidential work details; select provider terms/settings suitable for that content.
- Cloud processing is acceptable under that privacy requirement; offline operation is deferred.
- Initial delivery: local web app on the user's Windows computer, opened in a browser. Remote hosting/access is deferred.
- Keep audio and results only in the current session; no persisted recording/transcript history. Preferences may persist locally. Refresh clears results.
- Discard successful recordings after processing. On failure, retain audio temporarily in memory for manual retry until discarded, dismissed, or the page closes.
- Preserve completed text on partial failures, explain the failure, and allow manual retry. Never switch automatically to paid services.
- Performance target: display the result within five seconds after stopping a typical 20-second recording. Measure this during validation; it is not a guarantee. Show a visible processing state.
- If transcription succeeds but cleanup/translation fails, display the original transcription and allow retry of only the failed step.
- Treat spoken text as content, never as instructions to override processing rules. Resolve natural self-corrections according to the cleanup rules.
- Output choices: Keep original languages, English, Simplified Chinese, Malay. Remember the last selection. A same-language selection performs cleanup; other-language selections translate. Mixed input must preserve all meaning when rendered in one selected language.
- Provider acceptance requires representative recordings for individual languages, mixed speech, names, numbers, and self-corrections. Changed meaning and invented content fail acceptance.
- Keep the TypeScript/pnpm workspace, initially containing only the web app, API, and shared processing contracts. Add desktop/mobile projects in their own phases.
- Use React/Vite for the frontend and Hono on Node.js for the backend, both local, with one startup command. Provider credentials belong to the backend.
- Changing output language after processing requires an explicit Generate again action from the original transcription. Warn before replacing a manually edited result.
- Initial quality gate: 20 representative recordings, at least 18 usable without substantive correction, and zero incorrect names, numbers, dates, intended meaning, or invented information across the set. Cosmetic punctuation fixes can be minor; semantic corrections are substantive. A single critical error fails this gate even if the 18/20 usability threshold passes.
- All selected tools and dependencies must be usable without payment. No required subscriptions, paid trials, automatic paid fallback, paid hosting, or custom domain for the MVP. External AI remains subject to free quotas and provider acceptance.

## Agreed local architecture

Browser microphone → local Hono API → transcription provider → cleanup/translation provider → editable result in browser.

- `apps/web/`: React, Vite, TypeScript; recording controls, output selector, transcription and result panels.
- `apps/api/`: Hono on Node.js; validation, provider credentials, processing orchestration, timeouts, and typed failures. Bind to loopback for this personal local release; keep requests limited to the intended local frontend.
- Shared processing contracts: request/response types and language choices. Keep provider-specific code behind replaceable adapters; extract additional shared packages only when there is an actual consumer.
- pnpm workspaces: one command to start frontend and backend during local use.
- No database, authentication service, or cloud hosting is required for the initial local version.
- Ordinary local software has no subscription charge. Electricity, internet, and existing hardware are outside the software/service budget.

## Cost checks

Checked official project sources on 2026-10-15:

| Component | License/cost basis | MVP deployment |
| --- | --- | --- |
| React | MIT; https://github.com/react/react/blob/main/LICENSE | Local browser UI |
| Vite | MIT; https://github.com/vitejs/vite/blob/main/LICENSE | Local development/build |
| TypeScript | Apache-2.0; https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt | Local development |
| Hono | MIT; https://github.com/honojs/hono/blob/main/LICENSE | Local API |
| Node.js | Free, open-source runtime; https://nodejs.org/en/about | Local runtime |
| pnpm | MIT; https://github.com/pnpm/pnpm/blob/main/LICENSE | Local workspace tooling |
| Tailwind CSS, from the original draft | MIT; https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE | Optional local styling; no paid component kit |
| AI processing | Provider free plan only; provider not accepted yet | Cloud inference within free quota |
| Hosting/domain/database | Not required | No service fee |

Free cloud inference is quota-limited and terms can change. If there is no acceptable free provider, the full AI workflow is blocked until a compatible free option is found; do not silently weaken privacy requirements or enable billing. The MVP does not promise unlimited free operation.

## Planned delivery sequence — no implementation authorized

1. Provider feasibility gate: verify personal-developer eligibility, actual free account quotas, no-training terms, and available retention controls. Use synthetic/non-sensitive text until checks pass. Keep model choices provisional.
2. Speech-quality validation: use a 20-recording evaluation set and compare original transcription and final result separately. Include each priority language, mixed speech, names, numbers, dates, self-corrections, and adversarial spoken instructions. Do not store the user's actual speech as committed fixtures.
3. After explicit implementation authorization, build one complete local flow: record → transcribe → light cleanup → review/edit/copy.
4. Add selected-language translation, explicit regeneration, edit protection, and simple dictated paragraph/list formatting.
5. Complete timer, Cancel/discard, microphone/no-speech errors, stage progress, quota handling, partial success, manual retry, and memory cleanup.
6. Verify the full 20-recording gate, language preservation, key isolation, no saved history, cancellation/retry behavior, and one-command startup. Measure end-to-end latency on typical 20-second clips; report observed timing against the five-second target.
7. Review results before considering a hosted demo, desktop integration, or mobile development.

## MVP feature scope

1. Start/stop microphone recording in a local Windows browser; cap each recording at 60 seconds.
2. Transcribe English, Mandarin, Malay, and mixed-language speech, subject to provider quality validation.
3. Produce lightly cleaned text by default, preserving language switches and intended meaning.
4. Optionally translate into English, Simplified Chinese, or Malay.
5. Show the original transcription and an editable result, with manual copy.
6. Show recording and processing states, useful failures, and manual retries with partial-result preservation.
7. Remember preferences locally, with no saved audio/transcript history.
8. Keep provider credentials outside browser-delivered code, protect sensitive content, and stop cleanly at free quota limits.
9. Show a recording timer and allow Cancel/discard without submitting the recording.
10. Distinguish Transcribing from Cleaning/Translating; explain microphone-permission and no-speech errors.
11. Format simple paragraphs and lists when explicitly dictated, without inventing email structure or changing tone.

## Deferred scope

- Hosted access and a public portfolio demo.
- Windows desktop app, global shortcuts, floating recorder, and text insertion into other apps.
- Mobile app and system-wide dictation.
- Continuous/live streaming, offline models, saved history, accounts/synchronization, meeting notes, and summaries.
- Automatic per-app tone, snippet expansion, and vocabulary learning.

## Wispr Flow comparison — approved refinements

Reviewed the public product page on 2026-10-15: https://wisprflow.ai/ . This is product-documentation research, not evidence of its internal implementation.

REA browser inspection also completed on 2026-10-15 through its CLI: launched an owned temporary headless Chrome profile, navigated to the public page, waited for it to settle, and captured accessibility text. Evidence: `wispr-rea-evidence.json`; scenario: `wispr-rea-scenario.json`. REA reported complete requested capture and terminated its owned browser. This validates inspection capability and visible product claims, not the desktop app's accuracy, internal architecture, or transcription behavior.

- Existing MVP alignment: removal of fillers/repetition, natural self-corrections, punctuation, and multilingual dictation. SayLor's more conservative meaning-preservation requirements remain authoritative.
- Approved: a visible recording timer, Cancel/discard recording, clear microphone-permission/no-speech errors, and distinct Transcribing versus Cleaning/Translating progress states.
- Approved: simple paragraphs and lists when explicitly dictated; no inferred email structure or tone rewriting.
- Defer personal dictionary, snippets, per-app style adaptation, cross-app insertion, and meeting notetaking; these would widen the first web release.
- Wispr's page advertises automatic detection but also recommends explicit language selection for accuracy. SayLor's mixed-language behavior must be measured rather than inferred from this comparison.

## Provider research — provisional

- Groq Whisper and a Groq text model are candidates for transcription and cleanup/translation. Published free quotas appear sufficient for the estimated 600 audio seconds/day; actual account limits and quality must be checked.
- Groq's agreement disallows training on inputs/outputs without permission; zero data retention is a separate opt-in setting. Verify account settings before sending sensitive samples. Usage metadata can remain.
- Groq's terms include a consumer-use limitation whose applicability to this personal developer project is unresolved; do not mark the provider accepted until clarified.
- Gemini unpaid-service data terms do not fit the currently stated sensitive-content requirement; do not finalize Gemini as the default.
- Sources: https://console.groq.com/docs/speech-to-text , https://console.groq.com/docs/rate-limits , https://console.groq.com/docs/your-data , https://console.groq.com/docs/legal/services-agreement , https://ai.google.dev/gemini-api/terms .
- Research reflects published documentation, not live account verification or an accuracy benchmark.

## Unresolved

- Representative speech and expected output examples; none supplied yet.
- Provider selection and verification of data handling/settings.
- Populate the agreed 20-recording quality set during validation; usability and critical-error thresholds are agreed.
- Runtime/model/package version pinning during implementation; application architecture is agreed, AI provider selection remains provisional.

## REA tooling verification

- User approved Codex-only setup on 2026-10-15.
- Installed package registration: `rea-agents@6.5.0`; workflow skill metadata version 42.
- Codex config backup: `C:\Users\QW\.codex\config.toml.rea.backup`.
- Scoped doctor: healthy; registration and skill aligned. Native analysis providers are absent and outside the approved setup scope.
- Direct MCP verification: successful initialization reporting REA 6.5.0 and tool listing with 207 tools.
- REA tools are not yet loaded in this running chat; Codex restart/reconnection is needed to load the new registration. CLI inspection works independently, as demonstrated above.

## Source

The user confirmed all recommendations in the first interview round on 2026-10-15. The original draft is attached to the chat; confirmed interview decisions take precedence.
