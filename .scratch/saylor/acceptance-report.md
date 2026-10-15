# SayLor MVP acceptance report

Evaluated 2026-10-15 (Asia/Kuala_Lumpur). **Release acceptance has not passed.** The frozen public recording baseline produced 10/20 provisionally usable final results, nine clear critical errors and one additional substantive omission. Ticket 06 remains claimed. This is agent semantic screening against frozen public annotations, not native-speaker or user acceptance.

## Scope and method

The integrated application at `f4f708bf18670601386f1bdd0b25d1c89f8daeb3` used `whisper-large-v3-turbo` with bounded, ordered pause segmentation and `openai/gpt-oss-120b` with low reasoning effort. Windows local API calls exercised both real provider stages. All 20 transcription and processing operations returned HTTP 200; transport success did not imply semantic correctness. No automatic retries, reference-text prompts or paid fallback were used.

The frozen [manifest](evaluation-manifest.md) supplies source text, meaning, critical checks, attribution and original hashes. Its seven English, seven Mandarin and six Malay public read-speech clips distribute five to each output choice. Their 233.68 seconds average 11.684 seconds (range 4.14–22.84). Source float32 WAV was intentionally converted to 16 kHz mono PCM16 WAV. Evaluated-byte hashes and raw outputs remain in ignored local records.

References were not changed after inference. Review compared transcription to source annotations and final text to source meaning, allowing punctuation, equivalent script and phonetic transliteration differences. Annotations have not been independently verified by listening. Fidelity preserves the source's claims rather than silently repairing factual errors.

## Frozen baseline semantic results

| Clip | Output | Final assessment | Evidence and failure stage |
| --- | --- | --- | --- |
| 01 | Original | Critical | ASR changes Lakkha Singh/bhajans to “Laka sing”/“Bajshams”; cleanup retains corruption. |
| 02 | Chinese | Usable | Retains Italian, relatively easy and most words. |
| 03 | Malay | Usable | Retains three people, car impact and none injured. |
| 04 | Original | Critical | ASR changes Galapagos to “goblos”; final text retains wrong place. |
| 05 | Chinese | Usable | Retains wooden-to-iron replacement and 1767. |
| 06 | Malay | Usable | Retains not generally a replacement and outdoor satellite line of sight. |
| 07 | Chinese | Usable | Retains winter, Arctic/Antarctic and polar-night negation; “sun does not rise” is equivalent here. |
| 08 | Original | Usable | Retains Canaan, no large forests and expensive timber. |
| 09 | English | Critical | ASR drops 20 from 21–20; translation also renders All Blacks as “Black team.” |
| 10 | English | Substantive omission | Final text drops explicit snow and smooth asphalt, reducing them to ice and a paved street. Safety meaning survives; restoring detail needs editing. |
| 11 | Malay | Critical | “Rarely below zero” becomes “very low, below zero.” ASR punctuation fragments the qualifier; processing changes the claim. |
| 12 | Original | Usable, qualified | Three names and fourth/fifth/sixth mapping survive. 李克/里克 is accepted as a phonetic Rick transliteration difference. |
| 13 | Malay | Usable, qualified | Portuguese, rebuild, 1755 and post-earthquake abandonment survive. Casablanca is accepted as the supplied Chinese 卡萨布兰卡 city rendering; reference parenthetical Casa Branca creates naming ambiguity for human review. |
| 14 | English | Critical | ASR corrupts tree-lined boulevard/mosques; final output invents “Lianyin Avenue” and substitutes temples. |
| 15 | Original | Usable, qualified | Almost 7,000, Honshu and seventh survive. “Menghuni” is awkward for “contains” but the island claim remains intelligible; stricter Malay review may require correction. |
| 16 | English | Critical | ASR corrupts “young”; final output loses required young-dinosaur versus adult-feather contrast. |
| 17 | Chinese | Usable | Retains first flying animals, evading enemies, food and mates. |
| 18 | Malay | Critical | Buffalo-Pittsburgh Highway becomes “Buffalo Peace Road Highway” in ASR and result. |
| 19 | Chinese | Critical | ASR invents “berpikir”; final text describes the world's thinking instead of functioning and fragments scientific-method meaning. |
| 20 | English | Critical | Cricket “11 fours and 2 sixes” becomes flat “11, 4, 2, and 6”; Robin Uthappa spelling also changes. ASR starts corruption; processing does not recover it. |

These counts fail both ≥18/20 usability and zero-critical-error requirements. More lenient scoring of qualified details cannot satisfy zero critical errors. Retain this baseline alongside later candidate configurations and outcomes.

## Timing and additional screening

Local API pipeline timings exclude browser audio conversion, upload initiation and final rendering: minimum 823 ms, median 1,243.5 ms, nearest-rank p95 1,992 ms, maximum 10,094 ms. Nineteen of 20 were below five seconds; clip 02's text stage alone took 9,785 ms. The 22.84-second clip took 1,992 ms, but one sample cannot establish typical behavior. **Required browser Stop-to-visible-final-result measurement on representative 20-second speech remains outstanding.** These are not full browser latency measurements or a guarantee.

The separately attributed [prepared public clip](public-audio-sources.md) joins English, Mandarin and Malay speakers into 22.34 seconds. The integrated API retained languages/order and satellite/Amazon/six miles/Central America/most/duty-free meanings. Malay used “sadar” instead of “sedar.” Transcription took 1,117 ms and the API pipeline 1,833 ms. This artificial sequence does not validate natural within-sentence trilingual speech.

Fixed non-sensitive mixed-language text about meeting tomorrow at 3 p.m. in Kuala Lumpur and bringing two copies was processed into English, Chinese and Malay. All retained place, relative date, time and quantity; process-only timings were 765, 550 and 537 ms. This tests text translation rather than audio recognition. Earlier controls and prompt-tuning limits remain in [provider verification](provider-verification.md).

## Remaining work and boundaries

A separate `whisper-large-v3` candidate used the same segmented inputs and output assignments. Eleven cases completed before the operator reported HTTP 429 on case 12 and stopped, without automatic retry or paid fallback. It improved case 01 but retained Galapagos corruption, the missing 20 in the score and the temperature mistranslation; it additionally lost the “none hurt” predicate on case 03 and Antarctic on case 07. This partial candidate does not establish an improvement sufficient for adoption and does not replace the frozen Turbo baseline. Further live evaluation and full browser latency remain unfinished after the free-quota stop.

- Finish integrated controlled-provider browser suites and Standards/Spec review; record final commit, check counts and exact browser version. Isolated ticket checks are not final combined verification.
- Evaluate justified model/segmentation changes separately, without reference answers in prompts; a stronger model is not a proven fix until observed.
- Obtain held-out natural trilingual speech, user accent, self-corrections, dictated structure and spoken override attempts. Read speech and joined speakers leave these untested.
- Measure browser latency and verify final credential isolation, production assets, content persistence, logging and audio/microphone lifecycle. Account settings and application privacy need separate evidence.
- User confirms Free plan, billing/auto-recharge disabled and ZDR for speech/chat. Further eligibility/support clarification was explicitly waived: this is a user-accepted assumption, not provider confirmation. No support inquiry is required here.
- Keep raw audio/results and credentials out of public commits. No paid activation, deployment, push, merge or protection change is authorized by this report.

Baseline tool versions: Node.js 24.20, pnpm 12.8.1, TypeScript 7.0.2 and Playwright 1.64.1. Final browser/runtime and integrated checks must be recorded before closing ticket 06.
