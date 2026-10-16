# Deploy and verify the Vercel preview

Type: task
Status: resolved
Blocked by: 07

## Scope

Superseding access decision, 2026-10-16: the owner reports removing Vercel Require Log In and explicitly accepts public website/API access without login and shared free-quota consumption. Authentication is no longer an acceptance requirement. Verify anonymous access and the real hosted recording/translation flow; retain request validation, server-only secrets and no paid fallback. Earlier private-access requirements and signed-out-denial results below are historical. No new deployment or settings mutation is required by this documentation revision.

User authorized deployment to the QW Hobby team, `qw-e7b7`, initially as a protected Preview, subsequently with public access without login. Use the files from merged commit `3b8b3b86db1c00bf5fd273486247a1df36f3bafc`; no production promotion or paid features.

Vercel's dashboard classifies `main` as Production. Use `codex/saylor-integration` at `af6a394121b2c23cb04f77d70591ce8428d9879c` for Preview: a fresh `git fetch origin main` confirmed both commits have identical tree `3efe32e13994bcb76b743d095dcd7df48bc42bfc`, with no file differences.

## Verification

- Verify platform build and frontend/API routing.
- Verify signed-out website/API access works without login, while invalid input and disallowed origins remain rejected and credentials stay server-only. The owner accepts shared free-quota consumption; do not perform live load tests.
- Verify a hosted recording and translation with local servers stopped before claiming the complete hosted flow works.

## Comments

## Answer

Preview was built and tested as described below; the owner reported the requested hosted workflow works well. Production subsequently passed targeted live API/UI checks in ticket 09, and the owner confirmed retiring Preview. The Preview and its branch alias now return 404. Historical private-access checks are superseded by the owner's no-login policy. This closes the hosted Preview trial, not the speech-quality acceptance gate in ticket 06.

## Historical comments

2026-10-16 owner follow-up: after being asked to test anonymous access, recording, immediate translation, Malay/mixed speech, editing/copy and refresh clearing, the owner reports "Works well" and requests Production. Record this as targeted user-reported hosted success, without claiming measured latency or completion of ticket 06. Production and Preview retirement are tracked in ticket 09.

2026-10-16: Project `saylor`, ID `prj_OJjOkHSmsJK2MJ3d2vgvW5e1AcSy`, is connected to `narniagplus961127/saylor`. Node 24.x and Vercel Authentication for All Deployments verified. Preview has Corepack configuration and `GROQ_API_KEY` as a Secret, saved directly by the user and verified by metadata only. No secret value was read. Browser connection recovered as Chrome session 4. Platform build has not started yet.

First dashboard request explicitly showed Preview and Create Preview Deployment, but Vercel created `dpl_78u1M1VU1EHTSP7oYjiYdbU6YSgU` as Production, READY in 15 seconds, at `saylor-500w00hcv-qw-e7b7.vercel.app`. This unexpected target is confirmed by deployment details and the connector. No Production secret was added or promotion requested. Signed-out GET `/` and `/api/health` returned 302 to Vercel SSO on that URL and all three aliases (`project-cal1m`, `saylor-qw-e7b7`, and `saylor-git-codex-saylor-integration-qw-e7b7`, all under vercel.app). Creating a separate Preview next; actual app/API flow remains unverified.

Second dashboard Preview request succeeded: `dpl_6DhocvQAUtv1TafuC13Q8BPgjd28`, READY in 11 seconds, `https://saylor-nzw91kz3a-qw-e7b7.vercel.app/`, commit `af6a394`, region `iad1`, target null (Preview). Branch alias now points to this Preview. Signed-in Chrome renders SayLor and `/api/health` returns `{"status":"ok"}`. Signed-out requests to both Preview URLs return SSO redirects for `/`, `/api/health`, and `/favicon.svg`; POST `/api/process` returns 401. Owner live recording/translation remains pending. Screenshot: `../private/vercel-preview-ready-20261016.jpg`.

An alternate connector request using target `preview` failed schema validation; `staging` was rejected by automatic approval review as a different environment, without executing. Continued through the explicitly labeled Preview dashboard action. No custom environment, bypass secret, or paid setting was created.
