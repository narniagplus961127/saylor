# Private Vercel preparation — 2026-10-15

Selected code: `e6807bf`. Scope is the user-authorized specification update, code adaptation and local verification. No external project configuration or deployment was performed.

## Result

The spec now includes the private hosted web phase alongside local development; Windows desktop was subsequently implemented under its own specification; native mobile apps are no longer planned. One repository-root Vercel project can serve the existing Vite build and a Node.js Web handler under `api/[route].ts` for the three single-segment API paths. The handler reuses Hono/Groq logic without importing the local listener or dotenv loader. Exact environment-configured origins and platform-provided addresses determine request access; request/forwarded headers cannot add hosts. Missing credentials/addresses and malformed hosted origins return safe configuration errors. Origin checks are not authentication; platform All Deployments authentication is a required, not-yet-configured gate.

The root build/typecheck includes the function entry, Node.js 24 and ES modules are explicit, local development stays intact, and private/local artifacts are excluded from CLI upload through `.vercelignore`. Existing WAV/text limits, no history/content logging, provider models, per-stage deadlines and no paid fallback remain. Frontend connection errors now apply to both local and hosted service use.

## Evidence

- The initial built-browser/function test failed at the localhost-only access restriction. After adaptation, recording, translation, edit preservation after provider failure and explicit text-only retry pass through the built frontend and real function entry with controlled external responses.
- Hosted entry checks deny missing/malformed configuration, non-HTTPS platform origins, wildcard origins, unrelated hosts, spoofed forwarded/Host headers and cross-alias mutations. They check exact deployment/production hosts, server-only credential use and rejection of the test provider override when running as Vercel. No live provider traffic or real credentials are used.
- A clean `pnpm check` passed **39 checks**: 4 tool plus 35 browser/API (5 dictation, 7 translation, 7 multilingual, 14 recovery, 2 deployment). Typecheck, production build and credential scanning passed. No assertion timeout was relaxed and automatic test retries remain disabled.
- An earlier full run during edits failed two existing retry readiness assertions (empty result before the assertion deadline). Both passed in isolation and in the subsequent clean full run without a retry-code change. Their precise transient cause was not independently established; report recurrence rather than treating a rerun as proof of a root-cause fix.

## Outstanding hosted verification

No Vercel compiler/build service, native dynamic routing, actual Hobby account configuration, All Deployments authentication, signed-out website/API denial, hosted phone browser/microphone behavior or hosted latency has been verified. Local simulation does not establish these properties. Follow the [deployment guide](../../docs/deployment.md) after separate authorization; keep platform authentication active for every preview/production address and do not place provider or reusable bypass credentials in browser/native clients.

No push, deployment, merge, repository-rule change or billing activation occurred. The frozen 20-recording quality baseline remains 14/20 provisionally usable with five critical recognition errors. The three targeted personal retests remain user-reported successful; they do not close the broader gate in ticket 06.
