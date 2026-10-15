# Private Vercel web deployment

Status: code preparation and local simulation only. No Vercel project or deployment has been created or configured by this change. The existing speech-quality gate remains open independently of hosting readiness.

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

## Private access is a platform requirement

In Vercel Deployment Protection, enable **Vercel Authentication → All Deployments**. This must cover production domains and aliases as well as previews, website assets and `/api/*`. Standard Protection leaves production domains public and does not meet this project's requirement. Keep access limited to the owner; do not create public share links, protection exceptions or reusable bypass credentials for normal app use.

Vercel Authentication and All Deployments are available on the free plans; password protection is a different, paid feature. These settings are not enabled by `vercel.json` or the application. Host/origin checks are request validation, not authentication: an unauthenticated script can forge Origin. **Do not approve hosted live use until platform authentication is verified.** The unauthenticated health URL must also be protected by the platform.

The private trial should use non-sensitive speech first. Hosting adds Vercel to the content-processing path. The app emits no audio/text request-body logs or saved history, but Vercel's platform access/error metadata and its retention are separate from Groq's user-confirmed ZDR settings. Review those controls before confidential speech.

## Verify before release

`pnpm check` includes local behavior, hosted configuration checks and a production-built browser → actual function entry → controlled provider → result simulation. It checks recording, translation, failure/edit preservation, explicit text-only retry, invalid requests, exact hosts/origins and missing configuration. Tests use dummy credentials and no live provider traffic. This simulation does not attest Vercel's compiler, dynamic routing, account billing configuration or authentication.

On a separately authorized preview deployment:

1. Verify the account is Hobby, intended commit/build settings, Node/pnpm versions, successful function compilation and one project's frontend/API routes.
2. In a signed-out/incognito context without bypass headers/cookies, confirm `/`, `/favicon.svg`, `/api/health` and POST `/api/process` require authentication and cannot consume the provider quota. Repeat for each production URL/alias before any promotion; remove an unexpected public alias rather than treating preview protection as sufficient.
3. Sign in as the owner. With local SayLor servers stopped, record a non-sensitive clip and check original/result separation, immediate language translation, editing, copy, failure recovery and refresh clearing text. Check desktop Chromium and the actual phone browser; native Android APK support is separate work.
4. Confirm provider credentials are absent from browser assets/responses and routine platform logs contain no recording/transcript bodies. Avoid secret-bearing HAR files, traces and screenshots.
5. Measure hosted Stop-to-visible-result latency separately; local timings are not hosted latency evidence. Keep the historical failed quality evaluation and ticket 06 open until its criteria pass.

Production deployment/promotion and merges remain owner-controlled, separate actions. The future Android/desktop clients can reuse the API operations, but need a suitable native-client authentication design; do not embed a Vercel protection-bypass secret or the Groq key in an APK/installer.

## Official references checked 2026-10-15

- [Node.js functions and Web handler exports](https://vercel.com/docs/functions/runtimes/node-js)
- [Project configuration](https://vercel.com/docs/project-configuration/vercel-json)
- [Build configuration and Corepack](https://vercel.com/docs/builds/configure-a-build)
- [Hobby plan](https://vercel.com/docs/plans/hobby)
- [Deployment Protection scopes](https://vercel.com/docs/deployment-protection)
- [Vercel Authentication](https://vercel.com/docs/deployment-protection/methods-to-protect-deployments/vercel-authentication)
- [Function limits](https://vercel.com/docs/functions/limitations)
