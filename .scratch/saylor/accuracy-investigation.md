# Accuracy investigation — 2026-10-15

Release acceptance remains open. Agent semantic screening of the same frozen public read-speech references improved from **10/20 to 14/20 provisionally usable**, with clear critical failures reduced from nine to five. One additional case still needs substantive correction. This is development evaluation, not independent native-speaker or user-accent acceptance. Reference answers were unchanged and were never supplied to the speech model.

## Reproduction and diagnosis

The original fixed RMS pause threshold (`0.008`) split a 0.4-second soft speech span between surrounding words. The approved local API seam reproduced the bad boundary deterministically with a controlled provider. `pnpm exec playwright test -c playwright.multilingual.config.ts -g 'quiet speech inside'` failed before the fix. The regression now covers two volume levels while the existing mixed-language fixture still requires genuine pauses to split.

The live score case also reproduced: the unchanged pipeline recognized only `21` from a reference score of `21–20`. With the relative threshold, the same audio retained `21比20`. The diagnostic English translation still produced “Black team” once; the full candidate run produced “All-Black team.” That variation is a remaining text-stage reliability concern, not proof that all proper names are solved.

Ranked hypotheses were: absolute thresholds cut soft speech; short requests lose context; the speech model misrecognizes words despite complete context; text processing introduces further errors. The selected change addresses the first. Whole-utterance probes on the five remaining failures did not solve them. A whole-utterance full Whisper V3 comparison and bounded gain normalization of the quietest clip also failed to establish sufficient improvement; neither was adopted.

## Selected changes

- Derive a conservative silence threshold from 2% of the recording's 95th-percentile 20 ms frame RMS, capped at the prior absolute limit. Keep pause duration/minimum spans, ordered output, 12-request bound, 60-second validation and shared 20-second deadline unchanged. All samples remain represented.
- For dictation capture, explicitly disable browser echo cancellation, noise suppression and automatic gain control. A simulated-file replay with these call-processing effects enabled garbled the Malay section into Chinese; disabling them in isolation restored the three source languages. A browser regression first observed the old enabled settings, then passed after the app changed. Real microphone/noisy-room performance still needs user validation.

Across the 20 canonical reference WAVs, the relative threshold reduced transcription requests from 35 to 26 and split recordings from ten to six. These counts are input-specific, not a guarantee for natural speech.

## Frozen comparison

Run `pause-relative-full-20261015` uses the maintained evaluator; full originals, outputs, timings, configuration hashes and agent review fields remain under ignored private runs. The [manifest](evaluation-manifest.md) retains attribution, hashes and expected meanings.

| Case | Baseline → candidate | Evidence |
| --- | --- | --- |
| 01 | Critical → critical | Lakkha Singh/bhajans remain corrupted. |
| 02 | Usable → usable | Italian, relatively easy and most words retained. |
| 03 | Usable → usable | Three occupants, collision and none injured retained. |
| 04 | Critical → critical | Galapagos remains wrong; grazing also becomes raising. |
| 05 | Usable → usable | Wooden-to-iron direction and 1767 retained. |
| 06 | Usable → usable | Not generally a replacement and satellite line of sight retained. |
| 07 | Usable → usable | Arctic/Antarctic, winter and polar-night negation retained. |
| 08 | Usable → usable | Canaan, no forests and expensive timber retained. |
| 09 | Critical → usable, qualified | 21–20 restored; All-Black team accepted here as the named team, with repeat-output instability noted above. |
| 10 | Substantive → substantive | Snow restored; smooth asphalt becomes dry asphalt. Still not counted usable. |
| 11 | Critical → usable | Rarely below zero restored instead of very low/below zero. |
| 12 | Usable → usable, qualified | Names and fourth/fifth/sixth mapping retained; same Rick transliteration allowance as baseline. |
| 13 | Usable → usable, qualified | Same Casa Branca/Casablanca naming qualification as baseline; Portuguese, 1755 and event order retained. |
| 14 | Critical → critical | Tree-lined boulevard restored, but mosques still become temples. |
| 15 | Usable → usable, qualified | Quantities/Honshu retained; same awkward Malay verb as baseline. |
| 16 | Critical → usable | Young dinosaur versus adult feathers contrast restored. |
| 17 | Usable → usable | Flight, avoiding enemies, food and mates retained. |
| 18 | Critical → critical | Buffalo-Pittsburgh remains Buffalo Peace Road Highway. |
| 19 | Critical → usable | How the world functions restored instead of how it thinks. |
| 20 | Critical → critical | 11 fours/2 sixes remain a flat number list; name also changes. |

API-only stage sums: median 1,265 ms, p95 7,169 ms, maximum 7,754 ms; 17/20 below five seconds. They exclude browser capture/conversion/rendering. The frozen run predates the frontend capture change, which does not affect direct WAV API requests. It is not a 20-case full-browser acceptance run.

## Browser replay and limitations

The original browser replay produced additional recognition errors even when requests succeeded. That observation was retained, rather than counted as a quality pass. Chromium's [fake-audio implementation notes](https://chromium.googlesource.com/chromium/src.git/+/cc79060bcce11b0cb6fafa673a2a20dcb12bd077/media/base/media_switches.cc) warn that processing can distort file playback; the paired processing-off diagnostic supports this explanation for the test fixture. It does not independently prove an improvement for every real microphone.

Public files are played once through a simulated microphone, then the real browser conversion, local API, configured live provider and rendered result. This validates neither natural within-sentence code switching nor the user's accent. [Groq speech documentation](https://console.groq.com/docs/speech-to-text) describes model/format tradeoffs, but published model claims do not replace these observed results.

Final app capture, Chromium 156.0.8078.4 on Windows, with its own processing settings (no harness override):

| Source | Source duration | Normalized capture duration | Stop to rendered result | Semantic assessment |
| --- | --- | --- | --- | --- |
| Mandarin read speech, case 14 | 22.84 s | 23.88 s | 1,577 ms | Boulevard recovered; mosques still become morning temples. Quality fails. |
| Artificial sequential English/Mandarin/Malay | 22.34 s | 23.40 s | 2,683 ms | All three source meanings/languages retained, with the known Malay sadar/sedar variation. |

Timing begins at the browser's Stop click and ends after the ready result reaches two animation frames. Both real API operations returned HTTP 200. Observed capture tracks were ended afterward. The capture includes approximately one second after source playback so the utterance is complete; these are already roughly 20-second speech clips, not short clips padded to 20 seconds. The normalized upload remains mono 16 kHz PCM16. Two observations below five seconds do not establish typical/tail latency or a guarantee. Prior enabled-processing replay measurements and their erroneous output remain in private records.

English and Malay regeneration from the final mixed browser transcription preserved satellite use, Amazon/six miles and most goods from Central America arriving duty-free. Chinese incorrectly changed Central America to the United States: **an additional cross-feature critical failure outside the 20-case table**. A current-account Qwen 3.8 27B comparison, medium reasoning on the existing model and a generic qualifier-preservation instruction did not fix the region (several yielded central United States). An English-pivot diagnostic recovered the region but omitted the speaker's awareness qualifier. None was adopted. The model and text instructions remain unchanged. [Groq's reasoning documentation](https://console.groq.com/docs/reasoning) was used to check supported diagnostic parameters; availability is not evidence of quality.

## Integrated verification

Selected code commit: `c2c1ef0`. `pnpm check` passed all **32 checks**: 3 tool checks and 29 browser/API checks (5 dictation, 3 translation, 7 multilingual, 14 recovery), plus typecheck, production build and credential scanning. The fixed WAV API run records the source hashes of the same backend; its frontend capture change is tested separately above. Root review found no new unbounded requests, logging/storage paths, paid fallback, or changes to the existing retry contract. Both minimized regressions failed before their respective fixes and pass afterward.

The only production changes are the pause threshold and capture processing settings. Full Whisper, normalization, alternative text models, prompt changes and pivot translation remain discarded diagnostic candidates. Debug probes/results remain under ignored private files, and no credential values were printed or committed. No push, merge, deployment or billing change was performed.

The gate still requires at least 18/20 usable and zero critical errors, plus representative speech coverage. Keep [ticket 06](issues/06-validate-complete-mvp.md) open. Next work is additional speech-model/context investigation and [natural speech checks](natural-speech-check.md); do not repair frozen references, insert their answers into prompts, or reinterpret the five critical failures as success.

## Chinese translation follow-up

Selected code: `d053712`. The previous direct mixed-to-Chinese output confused Central America with the United States. An English draft followed by a **translation-only** pass preserves the region and the speaker's awareness qualifier. This differs from the rejected earlier pivot that cleaned again and omitted a clause. Input containing Latin letters with Chinese output now uses this two-call text path; other output choices and Chinese-script-only input retain the one-call path. Both calls share one 20-second deadline, response completion/length validation and the existing quota/error handling. No automatic retries or paid fallback were added. Original text accompanies the draft only to anchor original Chinese name characters.

The new regional-qualifier and final-pass failure regressions failed before the change. All **35 checks** now pass: 3 tool checks and 32 browser/API checks (5 dictation, 6 translation, 7 multilingual, 14 recovery), plus typecheck, build and credential scanning. The final-pass failure test confirms prior edits/original transcription survive and explicit retry submits text only. Chinese-script-only input is checked for a single provider call.

Live integrated `/api/process` checks used the saved ASR transcripts for all five Chinese-output baseline cases (02, 05, 07, 17, 19), the mixed regional counterexample, independent mixed Chinese names/time/negation, and a quoted instruction. All eight retained their assessed meaning. The mixed result now says 中美洲 and retains 我不知道你是否意识到; 郝玥 and 陈明 retain their original characters. Observed API times ranged from 952 to 2,587 ms. Private evidence: `integrated-chinese-validation.json`. These are targeted text-stage checks, not a fresh 20-recording acceptance run or proof for every possible input. The earlier diagnostic pilot had slower samples, up to 10,955 ms across its separately timed calls; one extra model call can increase latency and quota use.

Full browser replay with Chromium 156.0.8078.4 used the same frozen public artificial sequential English/Mandarin/Malay source (22.34 seconds, normalized capture 23.40 seconds). Stop-to-rendered Chinese result was **2,979 ms**, with both API operations returning 200 and microphone tracks ended. Satellite use, Amazon/six miles, the awareness qualifier and duty-free goods from Central America were preserved. Evidence: private `browser-latency-chinese-pipeline.json` and screenshot. This single artificial replay is not natural code switching, user-accent validation, or a typical/tail latency guarantee.

A separate whole-utterance speech diagnostic supplied only generic language context (`English, 简体中文, Bahasa Melayu (Malaysia).`), without reference answers. All five critical cases still failed: 01 injected Bahasa Melayu; 04 retained a wrong Galapagos name despite recovering grazing; 14 still misrecognized mosques; 18 still changed the highway name; 20 flattened cricket quantities. It was rejected, with no production speech-prompt change. Private `language-context-diagnostic.json` retains the source hashes and outputs.

The frozen 20-case score remains **14/20 provisionally usable, five critical errors and one substantive correction**. Keep ticket 06 claimed. Next evidence needed is natural user speech and a new speech-recognition candidate that fixes the remaining cases without inserting benchmark answers. The prior user-authorized push published `69d6c99`; this follow-up is local. No merge, deployment, paid activation or repository-rule change occurred.

## Immediate language selection and counting restart

User clarification on 2026-10-15 supersedes the earlier explicit-regeneration interaction: after a transcription exists, selecting another output language must immediately process that original transcription. Mandarin speech followed by English selection must produce English. Selection before recording only stores the preference; Generate again still repeats the current target. Declining the manual-edit warning preserves the result, language selection and stored preference. Recording, active processing and quota cooldown block new selections. Failures preserve prior text and use explicit retry or another deliberate language selection.

A browser regression first failed because selecting English left the Chinese result unchanged. After the interaction change, it passes through the actual frontend/local API with controlled external transcription/translation responses, asserting that the sole new request carries the original Chinese transcription and English target, without uploading audio. Existing edit-decline, edit-approval, preference persistence, failure retention and all-output tests were updated to the new user-approved behavior. A separate live API control translates the Chinese corrected appointment into English with Kuala Lumpur and its negation retained.

The user's natural-speech screenshots also exposed a counting restart problem. An anonymized/minimized Chinese input with `123,sorry,1234567890` retained both sequences in three live replays. The same failure occurred with Keep original languages, isolating it from the additional Chinese translation pass. Ranked hypotheses were incomplete whole-sequence correction guidance, a translation-pass problem, and joined-digit interpretation. The minimal adopted instruction explicitly replaces an abandoned counting sequence after a correction marker and preserves the introductory phrase; quoted apologies remain content. No deterministic digit rewriting or reference-answer dictionary was added.

The optional maintained `pnpm.cmd evaluate:counting` command goes through the live local text API with five fictional/non-sensitive cases. Before the fix, the two counting-restart checks failed while Malay framing, quoted-apology and Chinese-to-English controls passed. After the fix all five pass; the original Chinese/Malay anonymized reproduction also passed three repetitions each. The eight prior Chinese text controls were repeated with preserved region, names, quantities and negation; these are targeted text checks, not a new 20-recording acceptance score. Prompt behavior remains probabilistic even at temperature zero.

The Malay screenshot already contains a recognition error where the user confirmed saying the counting phrase. Correctly transcribed `Sekarang saya mengira` survives the live cleanup checks. This does **not** repair missing words in the original recognized text, and cleanup must not invent them. No user name, screenshot or personal recording was added to public fixtures. Original audio is unavailable, so the precise acoustic cause and personal-name accuracy remain unverified. The frozen 14/20 baseline and five critical recognition failures remain open.

Integrated verification of this follow-up: `pnpm check` passed all **36 checks** (3 tool and 33 browser/API: 5 dictation, 7 translation, 7 multilingual, 14 recovery), typecheck, production build and credential scan. The separate five-case live text command also passed. These checks validate the new interaction and targeted cleanup behavior; they do not close ticket 06 or change the historical 20-recording score.

### User retest confirmation

On 2026-10-15 the user confirmed all three requested personal retests correct: immediate Chinese-to-English output selection, counting restart after sorry, and the original Malay counting phrase. This follows workflow commit `db63f5e` and favicon commit `0b98176`. It is user-reported targeted evidence, without fresh audio, full results or measured latency. The previous screenshot failure remains historical evidence; the frozen 20-case results and broader acceptance gate are unchanged.
