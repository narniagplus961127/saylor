# 06: Validate the complete MVP

Status: claimed
Blocked by: 03 — Translate and regenerate results safely; 04 — Support multilingual dictation and dictated structure; 05 — Recover from failures without losing useful work.
Execution: Authorized by implement-spec on 2026-10-15; waits for completion of all blocking tickets.
Parent: SayLor — Personal Web MVP specification.

**What to build:** Establish whether the integrated local SayLor experience meets the agreed quality, privacy, cost, recovery, and usability requirements, with a reviewable acceptance report rather than unsupported claims.

- [ ] Verify one-command startup and the complete recording-to-edit/copy experience on Windows in a supported Chromium browser, including timer, Cancel, 60-second cap, progress states, and microphone release.
- [ ] Run browser → local API → result checks with controlled provider responses for all output choices, regeneration/edit protection, failures, partial results, manual retries, repeated clicks, and late responses.
- [ ] Verify the combined behavior of multilingual input and translation: preserve mixed-language speech in dictation; translate the entire message into each selected output language without losing meaning.
- [ ] Assemble and run 20 representative recordings covering English, Mandarin, Malay, mixed speech, names, numbers, dates, self-corrections, and spoken attempts to override rules. Cover all selected translation targets and evaluate transcription and final results separately.
- [ ] Require at least 18 of 20 final results usable without substantive correction and zero critical errors across all 20. Incorrect names, numbers, dates, intended meaning, or invented information fail acceptance even if the usability threshold passes. Treat faithful script/format changes semantically, not as exact-string mismatches.
- [ ] Measure Stop-to-visible-final-result latency on typical 20-second clips, including both AI stages. Report measured timings, test conditions, and whether the five-second target is met; do not substitute provider-only timing or promise a guarantee.
- [ ] Verify provider keys are absent from browser-delivered code/responses; sensitive content is absent from routine logs/persisted history; refresh clears text; audio is released on success/discard; and only preferences persist.
- [ ] Confirm provider eligibility/settings remain valid, usage stays within free account limits, and quota exhaustion cannot trigger billing or automatic paid fallback.
- [ ] Keep personal recordings out of the public repository; use synthetic/non-sensitive automated fixtures and approved live samples only after provider checks pass.
- [ ] Report exact tool/browser/model versions, evaluation outcomes, limitations, and outstanding failures. Failed gates remain unresolved; do not weaken acceptance criteria merely to finish the ticket.
- [ ] Present results and reviewable changes to the user. Do not merge, enable auto-merge, bypass protections, modify repository rules, deploy, or activate paid services.

## Comments

Approved for local ticket publication on 2026-10-15. This verifies the combined vertical slices; it does not replace each ticket's own behavioral checks.

Validation resumed on 2026-10-15. The frozen public read-speech baseline completed 20 real API pipelines but provisionally scores only 10/20 usable with nine critical failures and one substantive omission. References were preserved. See [acceptance report](../acceptance-report.md) for per-case evidence, API-only timings, coverage limits and outstanding integrated verification. This ticket cannot close: the quality gate fails and natural trilingual/user-accent coverage and full browser latency remain unverified.
