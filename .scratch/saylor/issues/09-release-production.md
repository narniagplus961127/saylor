# Release SayLor to Production and retire the Preview

Type: task
Status: resolved

## Scope

2026-10-16: The user reports the hosted Preview works well and authorizes moving to Production and removing the Preview. Keep the working Preview until Production is verified. No merge, paid feature, database, application login or visitor limiter is authorized by this release. The user explicitly deferred limits and will monitor usage.

## Checks

- Build the merged, reviewed main commit with server-only Production configuration on QW Hobby.
- Verify anonymous website and backend access, valid processing, safe invalid-input rejection and a non-sensitive recording/translation flow.
- Retire only the identified Preview after Production is verified; review any irreversible deletion confirmation at action time.
- Preserve ticket 06's unresolved speech-quality gate; targeted owner success does not replace the frozen evaluation.

## Progress

Production settings show branch main and domain `qw-saylor.vercel.app`. Initially no Production environment variables were present. Corepack configuration is being prepared; the owner must enter the existing Groq key directly as a Production Secret, without sending it in chat. Preview remains available.

Owner saved the Production Secret; browser metadata confirms `GROQ_API_KEY` (Secret, Production), `ENABLE_EXPERIMENTAL_COREPACK` (Config, Production), and exposed system environment variables. No credential value was read. Preparing the main merge `3b8b3b86db1c00bf5fd273486247a1df36f3bafc`, whose files were previously verified identical to tested Preview `af6a394`.

Production is READY: `dpl_29CAUmZuNrFnqRGD8RDFkBj9CWwv`, generated URL `saylor-5iej8hrez-qw-e7b7.vercel.app`, primary URL https://qw-saylor.vercel.app/, main merge `3b8b3b8`, dashboard build duration 10 seconds. No source code was changed or merged for this release.

Anonymous HTTPS checks on the primary URL: website, SVG favicon and `/api/health` returned 200. Chinese-to-English text processing returned "I have a meeting at 3 PM today" (with narrow-space formatting); invalid output returned typed 400, unrelated Origin returned typed 403. One hash-verified public FLEURS English reference (case 03) was converted to canonical PCM16 without changing speech and sent through Production transcription then processing: both returned 200 and preserved the reference meaning, three people and no injuries. API-only elapsed time was 3,211 ms, not browser recording latency or a new quality benchmark. Chrome renders the live app; screenshot `../private/vercel-production-live-20261016.jpg`.

The old Preview deletion dialog is open for `dpl_6DhocvQAUtv1TafuC13Q8BPgjd28`. Vercel warns about losing instant revert and breaking Preview links. Final action-time deletion confirmation requested; no deletion performed yet. Screenshot `../private/vercel-preview-delete-confirmation-20261016.jpg`. Ticket remains claimed until retirement is handled.

## Answer

Owner confirmed "Delete the old Preview" at the final action. Deleted only `dpl_6DhocvQAUtv1TafuC13Q8BPgjd28`. Its generated URL and branch alias both now return 404; Production `/api/health` still returns 200 and `{"status":"ok"}`. Vercel overview shows Production READY on main `3b8b3b8` and No Active Branches. Historical Production deployments, Git branches and environment variables were not deleted. Production API speech/text processing and anonymous access were verified; owner microphone interaction was reported successful on Preview, not independently repeated on Production. No code, database, limiter, paid feature or merge was added. Ticket 06 remains open.
