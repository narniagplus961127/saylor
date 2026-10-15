# 03: Translate and regenerate results safely

Status: resolved
Blocked by: 02 — Complete the first local dictation flow.
Execution: Authorized by implement-spec on 2026-10-15; waits for its blocking ticket.
Parent: SayLor — Personal Web MVP specification.

**What to build:** Let the user choose an output language, obtain a faithful translation, and regenerate from the original transcription without silently losing manual edits or recording again.

- [x] Offer Keep original languages, English, Simplified Chinese, and Malay. Default first use to Keep original languages and remember the last choice locally without persisting transcript content.
- [x] For a selected output language, clean same-language input or translate other-language input through the local API and accepted provider; preserve meaning, tone, names, numbers, dates, and negation.
- [x] Preserve the original transcription independently of the editable result and show Cleaning or Translating progress as appropriate.
- [x] Changing the choice after processing makes no automatic request. Generate again explicitly uses the original transcription, not the prior translation or edited result.
- [x] Warn before replacing manual edits. Declining retains the edits and makes no replacement request; approving produces a new editable result that can be manually copied.
- [x] Preserve existing text on generation failure. Do not re-transcribe audio merely to change the output language.
- [x] Exercise all output choices and regeneration/edit protection through the approved browser-to-API seam with controlled responses. Cover semantic equivalence rather than exact translation strings in live evaluation.
- [x] Keep the $0, backend-only credentials, session-only content, and user-only merge requirements intact; do not introduce paid fallback or alter protections.

## Comments

Approved for local ticket publication on 2026-10-15. Ticket 04 separately completes mixed-language dictation and its cross-feature translation checks.


## Answer

Implemented output selection and preference-only persistence, whole-message translation/cleanup, explicit regeneration from original transcription, manual-edit confirmation, failure preservation, and copying of the current edited result. Tested through the approved browser → local API seam with controlled Groq responses. All three translation checks and the original dictation check pass; typecheck and production build pass. Live semantic quality remains the separate ticket 06 release gate. No paid fallback, live provider requests, pushes, or merges were introduced.
