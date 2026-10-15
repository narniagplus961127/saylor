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
