# 01: Verify a suitable free AI provider

Status: resolved
Blocked by: None (no ticket prerequisites).
Execution: Completed for preliminary provider selection. Release-quality validation remains ticket 06.
Parent: SayLor — Personal Web MVP specification.

**What to build:** Establish whether the user can obtain dictation, cleanup, and translation under the agreed $0 budget and sensitive-content requirements, before committing the app to a provider.

- [x] Review current official terms and record the eligibility uncertainty. The user explicitly waived further support verification and accepted private-use eligibility as an assumption on 2026-10-15; do not claim provider confirmation.
- [x] Verify actual free-account availability and quotas for approximately 30 recordings averaging 20 seconds daily, including text processing and manual retries. Do not enable billing, paid trials, auto-recharge, or paid fallback.
- [x] Verify no-training treatment and relied-upon retention settings on the actual account. Record content-retention exceptions and remaining metadata collection without exposing secrets.
- [x] Confirm supported recording formats, size limits, text operations, and usable stable model choices. Evaluate a small non-sensitive sample across English, Mandarin, Malay, mixed-language speech, and all three translation targets.
- [x] Assess cleanup fidelity for names, numbers, dates, self-corrections, and invented content. Distinguish preliminary provider screening from the final 20-recording acceptance gate.
- [x] Use synthetic/non-sensitive samples until privacy and eligibility checks pass; do not upload confidential recordings or commit credentials/personal samples.
- [x] Produce a clear pass/fail recommendation with evidence, settings, limitations, and compatibility details for the next ticket. If no free provider qualifies, report the blocker; that outcome does not clear the prerequisite for ticket 02.
- [x] Preserve the user's exclusive merge authority: no merges, auto-merge, protection bypasses, or repository-rule changes.

## Comments

Approved for local ticket publication on 2026-10-15. No provider is accepted by this ticket's creation.

2026-10-15: Execution authorized by implement-spec. Public documentation reviewed; the user confirmed the Free plan, billing/auto-recharge disabled, and ZDR enabled for speech/chat. A local GROQ_API_KEY authenticated with HTTP 200 and lists the candidate models. The key is ignored by Git and never printed. Account settings are user-confirmed, not independently inspected.

Completed developer screening: one locally synthesized English recording and eight fixed synthetic text cases, followed by three correction-prompt checks. All requests returned HTTP 200 with no automatic retries. Initial Mandarin/Malay correction failures were repaired on the known cases using explicit replacement rules; this is prompt tuning, not independent acceptance evidence. No personal recording was sent.

Remaining: authoritative eligibility clarification, actual multilingual speech screening (Mandarin, Malay, and mixed language), full account-specific quota evidence where not exposed in headers, and a final gate recommendation. Published model support and successful English/text calls do not resolve those requirements. The five-second latency target is not proven; one translation call took 7.674 seconds. Ticket 02 remains blocked. See the provider verification report in this feature's local tracker records.

2026-10-15 later steering: the user asked the agent to contact support, then explicitly canceled that inquiry and waived eligibility verification, accepting private use as an assumption. The agent selected an account-question category in the support widget but did not submit the substantive eligibility question; no further support messages will be sent. The user also authorized finding public recordings instead of supplying personal audio. These instructions supersede the earlier eligibility blocker; technical screening is being continued using licensed public samples.

## Answer

PASS for proceeding to the local implementation, with documented limitations. Use Whisper Large V3 Turbo with automatic pause-based segmentation and GPT-OSS 120B with explicit self-correction rules. Use standard PCM WAV for verified audio compatibility. The user confirmed the Free plan and speech/chat ZDR; API access and live response limit headers were checked. Unexposed limits remain based on official published documentation rather than an independent console audit, so runtime 429 handling and no paid fallback remain mandatory.

Human-recorded FLEURS Mandarin and Malay samples and an artificial joined English/Mandarin/Malay recording were screened. Unsegmented trilingual transcription garbled a proper noun, and Large V3 translated the full clip incorrectly. Automatic silence segmentation recovered the three source meanings and the Chinese proper noun. The app should implement bounded pause-based segmentation, preserve segment order, and never infer that a single detected language represents the whole recording. A Malay segment was labeled Indonesian despite correct Malay text; language metadata is advisory.

This is preliminary compatibility evidence, not the final 20-recording pass. The joined clip tests sequential language switching with different speakers, not natural within-sentence code switching or the user's accent. The five-second target remains unproven. See the provider verification report and public audio source record for evidence and attribution.
