# 04: Support multilingual dictation and dictated structure

Status: ready-for-agent
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
