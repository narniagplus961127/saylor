# 07: Prepare the private Vercel web version

Type: task
Status: resolved
Parent: SayLor — Personal Web MVP specification, hosted-phase clarification.

## Question

Can the existing website and API run in one private Vercel Hobby project while preserving local development, contracts, privacy and free-only behavior?

## Scope

User authorized preparation of code, specification updates and local verification. Actual deployment, external project settings, pushes, merges, paid activation and production promotion are not part of this step. Ticket 06's quality gate remains open independently.

- [x] Provide a Node.js Vercel function entry point using the existing Hono/Groq logic without starting a local server or loading shipped credentials.
- [x] Add repository-root build/routing configuration for the frontend and API, preserving local startup.
- [x] Validate exact hosted origins/hosts and fail closed on missing/invalid configuration; retain local restrictions.
- [x] Verify production-built browser → function entry → controlled provider → result, invalid audio/text and rejected requests.
- [x] Document server-only variables, free Hobby settings, all-deployment authentication, and the separate preview/security verification required before live hosted use.
- [x] Run the shared checks, build and credential scan; report limitations without claiming a live deployment or closing ticket 06.

## Comments

Claimed on 2026-10-15 after user approval to prepare Vercel compatibility and check/update the spec. Desktop and Android APK remain later work; the web backend can be reused after designing suitable client authentication for those platforms.

## Answer

Prepared at `e6807bf`: repository-root native function entry, frontend output/build configuration, exact hosted origin/host validation, configuration failures that deny access, no shipped `.env`, Node.js 24/ES modules and preserved local startup. The spec now explicitly includes the private hosted phase, with all-deployment owner authentication and a separate preview/release verification step. [Deployment guide](../../../docs/deployment.md) records the settings and limitations.

The clean `pnpm check` run passed all 39 checks (4 tool, 35 browser/API: 5 dictation, 7 translation, 7 multilingual, 14 recovery, 2 deployment), typecheck, build and credential scan. The deployment browser suite exercises the built frontend and actual function entry with only the external provider controlled. The initial run failed two existing readiness assertions; both passed in isolation and in the subsequent clean complete run without changing their assertions or timeouts. This transient result is retained in [preparation evidence](../deployment-preparation.md), rather than presented as an uninterrupted first-pass result.

No Vercel account/project, authentication or real routing has been configured/verified, no live provider evaluation was rerun, and no push, deployment, merge, repository-rule change or paid service was activated. Ticket 07 covers code preparation only. Ticket 06 remains claimed; a separately authorized protected preview must verify platform compilation/routing/authentication and live browser behavior before hosted use.
