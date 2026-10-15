# Local operations and continuation

## Resume work

Read [the implementation map](../../.scratch/saylor/map.md) for current state, open work and evidence. Update that map when handing off. Record the tested commit and unresolved failures; keep dated evaluation reports as historical evidence. Ticket 06's acceptance criteria remain authoritative.

## Windows commands

Use `pnpm.cmd` in PowerShell when execution policy prevents the `pnpm.ps1` shim. Run `pnpm.cmd dev` from the repository root and open the printed `127.0.0.1` frontend URL. Keep the terminal session identifier so it can be stopped with Ctrl+C. Avoid duplicate dev servers.

`pnpm.cmd check` runs tool checks, type checking, all four browser/API suites, build and credential scanning. Tests use dedicated ports from `scripts/test.mjs`; the default dev server can remain running. They use controlled providers, not live Groq. Install the browser first with `pnpm.cmd exec playwright install chromium` (Linux CI adds `--with-deps`).

For browser version information, use `browser.version()` from a short Playwright session that closes afterward, or inspect installed `playwright-core/browsers.json` and label that as metadata. Windows `chrome.exe --version` can launch a window and hang.

In this managed Codex environment, loopback/network and Git writes may require an escalated tool invocation. An `EACCES` or inaccessible browser cache under the sandbox is not proof the app is broken. Escalate only the authorized operation. Keep `.env` and its key in the root checkout.

## Evaluation

Use [the maintained evaluator](../evaluation.md). Restart the local API from the intended workspace first: recorded source hashes/model names describe that workspace, not an independently attested running server. Dry runs and CI require no provider credentials. Live runs explicitly consume the configured free account and stop on failure.

## Worktree cleanup

Inspect `git worktree list` and each checkout's `git status --porcelain`; preserve uncommitted work and needed ignored files. Resolve the absolute target and verify it is a child of this repository's `.worktrees` directory. Use `git worktree remove` for a clean checkout; `--force` may be needed for disposable ignored dependencies after checking them.

Windows can unregister a worktree but leave a residual directory. Recheck inventory and its `.git` marker before deleting leftovers. Resolve and verify the absolute path again, then use PowerShell `Remove-Item -LiteralPath ... -Recurse -Force`. Stop only identified processes belonging to that checkout. Use one shell throughout cleanup.

## CI references

The workflow follows [actions/checkout](https://github.com/actions/checkout), [actions/setup-node](https://github.com/actions/setup-node) and [pnpm/action-setup](https://github.com/pnpm/action-setup). Its read-only token, dummy key and controlled providers need no Groq secret. Remote execution begins after the user publishes changes; merge protections remain user-controlled.
