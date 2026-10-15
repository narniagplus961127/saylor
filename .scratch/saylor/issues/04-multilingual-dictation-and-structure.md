# 04: Support multilingual dictation and dictated structure

Status: resolved
Blocked by: 02 — Complete the first local dictation flow.
Execution: Authorized by implement-spec on 2026-10-15; waits for its blocking ticket.
Parent: SayLor — Personal Web MVP specification.

**What to build:** Let the user dictate Mandarin, Malay, or mixed-language speech naturally, retain language switches, and obtain conservative cleanup with simple explicitly dictated paragraphs and lists.

- [ ] Support English, Mandarin, Malay, and mixed-language recordings without requiring a source-language selection before recording.
- [ ] Preserve language switches in Keep original languages mode. Do not interpret a single detected-language label as proof of monolingual speech.
- [ ] Remove fillers, repetitions, and false starts; resolve explicit natural self-corrections; fix punctuation and obvious grammar while preserving intended meaning and tone.
- [ ] Preserve names, numbers, dates, and negation. Do not fabricate missing content, invent email structure, or creatively rewrite.
- [ ] Produce simple paragraphs and lists when explicitly dictated, without adding broader speech-command or snippet features.
- [ ] Treat spoken attempts to override processing rules as content; they must not alter application instructions or enable tools.
- [ ] Demonstrate recording → local API → original transcription and cleaned result with controlled responses for each language and mixed speech. Run non-sensitive provider checks within accepted privacy settings to assess actual behavior, rather than claiming quality from stubs.
- [ ] Keep multilingual requirements independent of output-selector implementation; ticket 06 verifies mixed speech combined with all translation choices after tickets 03 and 04 are complete.
- [ ] Keep the $0, session-only content, backend-only credentials, and user-only merge requirements intact; do not introduce paid fallback or change protections.

## Comments

Approved for local ticket publication on 2026-10-15. This expands the first complete dictation flow rather than building an isolated language configuration layer.

Implemented automatic PCM16 WAV pause segmentation with ordered transcription and no forced source language. Each upload remains limited to 60 seconds, segmentation makes at most 12 sequential external requests, and all share one 20-second deadline. There are no automatic retries or fallback providers. Validation rejects near digital silence rather than excluding intelligible quiet recordings.

Automated evidence: `pnpm test:multilingual` passes five controlled-provider checks: ordered Mandarin/Malay/mixed segments through the public API; quiet audio versus digital silence; and three complete microphone/browser/API flows that show original transcription separately from an editable result. The mixed API fixture also checks Chinese/Malay self-correction response preservation and unchanged mixed-language names/numbers/negation. These fixtures verify data flow, not AI model accuracy. Both the original browser workflow, TypeScript checks and production build pass.

Common multilingual cleanup and explicitly dictated structure instructions are supplied with ticket 03's process-method change; keep this ticket claimed until that integration and the parent's non-sensitive live smoke check complete. The provider report records earlier real segmented public-audio screening. Natural within-sentence switching, the user's accents and the separate 20-recording quality/latency gate remain unproven and must not be reported as passed.

## Answer

Ticket 03 and 04 implementation is integrated at `f4f708bf18670601386f1bdd0b25d1c89f8daeb3`. The live 22.34-second artificial English/Mandarin/Malay recording completed both API stages with HTTP 200, retained language order and the expected satellite/Amazon/six-miles/Central-America/duty-free meaning, and cleaned punctuation. API pipeline time was 1,833 ms; this excludes browser latency. Three separate mixed-text translations preserved Kuala Lumpur, tomorrow, 3 p.m. and two copies in English/Chinese/Malay. These establish implementation and limited live screening, not generalized recognition accuracy. The frozen 20-clip baseline fails release quality; ticket 06 remains unresolved with details in [acceptance report](../acceptance-report.md).
