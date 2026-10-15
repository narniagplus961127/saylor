# Retrospective follow-through

Completed locally on 2026-10-15. Verified code commit: `cdff062`.

| Session finding | Change | Evidence |
| --- | --- | --- |
| Evaluation depended on ignored one-off scripts | Maintained `pnpm evaluate`, public frozen JSON references and private per-run reports | Tool checks cover quota stop, saved transcription, explicit text-only retry, completed-case skip, frozen references, locks and cooldown guidance. |
| Existing checks had no automatic guardrail | `pnpm check` and `.github/workflows/check.yml` | Same command runs locally and in the configured PR/main-branch workflow; no live Groq secret or live evaluation is required. Remote CI awaits publication. |
| Quota stop lacked retry context | Allowlisted API rate-limit headers and persisted stage attempts/retry guidance | Browser/API regression verifies safe headers and excludes a fake secret header. Evaluator stops rather than retrying automatically. |
| Interrupted work needed reconstruction | Current-state continuation map and concise AGENTS navigation pointer | [Map](map.md) identifies verified code, evidence, open quality work and next experiment. Historical reports retain their original baseline outcomes. |
| Windows tool probes and cleanup were repeated | [Operations reference](../../docs/agents/operations.md) | Commands, ports, sandbox caveats, browser metadata and verified worktree cleanup are documented once. |

Validation: `pnpm check` passed all 3 tooling checks and 26 browser/API checks (4 dictation, 3 translation, 5 multilingual, 14 recovery), type checking, production build and credential scanning. Final evaluator lock/cooldown changes also passed a focused rerun of all tooling checks. A dry run validated the original hashes/formats of all 20 available recordings without network requests. Scanner failure controls use generated fake credentials and assert matching values are not printed.

The scanner checks tracked and unignored working files plus required browser assets, using the local configured key when available and targeted Groq/private-key patterns. It is not a full repository-history or universal secret scan. No additional dependency or paid service was added.

These changes improve future runs; they do not improve or re-evaluate speech accuracy. [Ticket 06](issues/06-validate-complete-mvp.md) remains claimed, with the failed live baseline and missing natural speech/browser latency evidence unchanged. No push, merge, deployment or branch-protection change was performed.
