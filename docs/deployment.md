# Vercel web deployment

Status as of 2026-10-16: The last verified Production version is https://qw-saylor.vercel.app/ from merged commit `cd2dacd`. Anonymous site/favicon/health, Chinese-to-English processing and a public-reference transcription→processing check passed. The owner reports the Preview workflow works well. The owner-confirmed old Preview was deleted; its generated URL and branch alias return 404, and Production remains healthy. Login is disabled by the owner's decision; the best-effort 20-recording allowance is implemented without a database. The existing speech-quality gate remains open independently of hosting readiness. Release evidence is in `.scratch/saylor/issues/09-release-production.md`.

## Architecture

Use one personal, noncommercial Vercel Hobby project, with the repository root as its Root Directory. `vercel.json` selects the built frontend in `apps/web/dist`; the root `api/[route].ts` function handles the single-segment `/api/transcribe`, `/api/process` and `/api/health` routes through the existing Hono app. No separate backend service or database is needed. The root package pins Node.js 24 and pnpm 12.8.1. Local `pnpm dev` still starts the two loopback servers.

The hosted entry exports a standard Web Request/Response handler. It starts no listener, loads no `.env` file, and stores no recording history. The Vercel function duration is 60 seconds; each provider stage retains its shared 20-second deadline and existing request/audio limits. The 1,920,044-byte maximum WAV is below Vercel's documented 4.5 MB function payload limit. No provider/model or paid fallback changes are introduced.

## Prepare the project before any live deployment

After deployment is separately authorized, select the intended personal account/Hobby team and repository/commit. Keep Root Directory at the repository root, Framework Preset as Other, Build Command `pnpm build` and Output Directory `apps/web/dist` (these are also in `vercel.json`). Keep the pinned package manager: set `ENABLE_EXPERIMENTAL_COREPACK=1`, and let Vercel use the repository's `packageManager` field rather than an override that selects an older pnpm. Use Node.js 24. Do not upgrade to Pro, activate paid trials/add-ons, add a paid domain or enable automatic paid fallback.

Configure server environment variables for the intended Preview and, later, Production environments:

| Variable | Value and purpose |
| --- | --- |
| `GROQ_API_KEY` | Enter the existing Free-plan key directly in Vercel's server environment settings. Never paste it into chat or prefix it with `VITE_`. |
| `ENABLE_EXPERIMENTAL_COREPACK` | `1`, so builds use the pinned pnpm version. |
| `SAYLOR_WEB_ORIGIN` | Optional exact HTTPS origin for a chosen canonical/branch alias, such as `https://your-project.vercel.app`; no paths, credentials, query strings or wildcard hosts. |

Vercel's server system variables `VERCEL_URL` and `VERCEL_PROJECT_PRODUCTION_URL`, when exposed to the function, add only their exact deployment/production addresses to the allowlist. Ensure system environment variables are exposed. If neither system addresses nor `SAYLOR_WEB_ORIGIN` is available, the hosted entry returns a safe configuration error. Missing provider credentials also fail closed. Set an exact custom origin if using an alias absent from those variables. Each browser mutation must come from the same origin as its requested URL, even when multiple aliases are configured.

HTTP loopback origins are accepted only for local function simulation when `VERCEL` is not `1`. Hosted requests require HTTPS origins. Forwarded/request headers cannot add trusted origins. `GROQ_BASE_URL` is ignored on Vercel, even if accidentally configured; it is a controlled-test option only outside the platform. Do not set it for deployments.

## Public access without login

The owner's 2026-10-16 decision supersedes the earlier requirement for Vercel Authentication on All Deployments. The hosted website and API may be used without login. The owner reports disabling Require Log In directly in Vercel. No application account system is required. Verify this setting on the intended deployment and aliases; project settings are separate from `vercel.json`.

The Groq key remains server-only, but anonymous visitors and scripts can invoke the API using the owner's shared Free quota. Host/origin checks are request validation, not authentication: scripts can forge Origin. The owner explicitly accepts quota exhaustion and possible service unavailability from other callers. Keep existing input/audio limits, deadlines, safe failures, and zero automatic paid fallback.

## Best-effort recording allowance

The new implementation allows **20 submitted recordings total across all visitors per hour per Vercel function instance**, with all 20 allowed back-to-back. The first valid WAV submission starts the hour; the first valid submission at or after expiry starts a fresh window. The 21st is rejected before Groq with a typed `recording_limit` 429 and `Retry-After` seconds. Invalid uploads and rejected origins do not consume slots. A valid submission consumes one slot even if Groq fails; an explicit transcription retry is another submission. Internal audio segmentation never consumes additional recording slots.

The module retains only two numbers, without IP tracking, new environment variables, database or additional account. It runs only when `VERCEL=1`; local development/simulation remains unlimited. Counters persist across hosted app creation in the same process, but restart/cold start clears them and separate function instances have separate counters. This is the owner's explicitly accepted best-effort behavior, not an exact global or abuse-proof cap. `/api/process` has no new limit, so translation and cleanup can still consume provider quota independently.

The browser preserves original/result text and edits, offers a recording retry countdown, and leaves translation/copy available when recordings are limited. The allowance was published in merged main `cd2dacd`; subsequent releases still require a successful Vercel build. Test blocked/reset behavior using controlled providers, not 21 live requests against the shared free account.

The hosted trial should use non-sensitive speech first. Hosting adds Vercel to the content-processing path. The app emits no audio/text request-body logs or saved history, but Vercel's platform access/error metadata and its retention are separate from Groq's user-confirmed ZDR settings. Review those controls before confidential speech. Public access does not add shared transcript history or publish another visitor's in-memory results.

## Verify before release

`pnpm check` includes local behavior, hosted configuration checks and a production-built browser → actual function entry → controlled provider → result simulation. It checks recording, translation, failure/edit preservation, explicit text-only retry, invalid requests, exact hosts/origins and missing configuration. Tests use dummy credentials and no live provider traffic. This simulation does not attest Vercel's compiler, dynamic routing, account billing configuration or authentication.

On a separately authorized preview deployment:

1. Verify the account is Hobby, intended commit/build settings, Node/pnpm versions, successful function compilation and one project's frontend/API routes.
2. In a signed-out/incognito context without bypass headers/cookies, confirm `/`, `/favicon.svg` and `/api/health` are accessible without login on the intended deployment. Verify a valid, non-sensitive API operation works anonymously while invalid input and disallowed origins are still rejected. Check aliases before recommending them for use; do not exhaust live quota or perform load tests. The earlier signed-out-denial results describe the superseded private configuration.
3. With local SayLor servers stopped, record a non-sensitive clip and check original/result separation, immediate language translation, editing, copy, failure recovery and refresh clearing text. Check the supported desktop Chromium browser. Native mobile apps and PWAs are not planned.
4. Confirm provider credentials are absent from browser assets/responses and routine platform logs contain no recording/transcript bodies. Avoid secret-bearing HAR files, traces and screenshots.
5. Measure hosted Stop-to-visible-result latency separately; local timings are not hosted latency evidence. Keep the historical failed quality evaluation and ticket 06 open until its criteria pass.

Production releases and merges require owner authorization. On 2026-10-16 the owner authorized merging the tested desktop implementation and updated product scope. The authorized release in ticket 09 uses merged main with Production-only Groq Secret and Corepack configuration; it supersedes the initial unconfigured Production build. Use https://qw-saylor.vercel.app/ for normal use. The Windows desktop app bundles the UI and proxies only the supported API operations through its trusted main process; see [desktop setup](desktop.md). Credentials remain server-only. No native mobile client or PWA is planned.

## Official references checked 2026-10-15

- [Node.js functions and Web handler exports](https://vercel.com/docs/functions/runtimes/node-js)
- [Project configuration](https://vercel.com/docs/project-configuration/vercel-json)
- [Build configuration and Corepack](https://vercel.com/docs/builds/configure-a-build)
- [Hobby plan](https://vercel.com/docs/plans/hobby)
- [Deployment Protection scopes](https://vercel.com/docs/deployment-protection)
- [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)
- [Function limits](https://vercel.com/docs/functions/limitations)
