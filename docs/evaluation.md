# Speech evaluation

`pnpm evaluate` calls the local application's transcription and processing endpoints. It does not load provider credentials or contact Groq directly. References live in [.scratch/saylor/evaluation-manifest.json](../.scratch/saylor/evaluation-manifest.json); [the attributed Markdown manifest](../.scratch/saylor/evaluation-manifest.md) describes provenance and coverage. Audio and generated results remain private.

Validate frozen hashes and WAV formats without requests:

```powershell
pnpm.cmd evaluate --run candidate-a --dry-run
```

Start/restart the intended app with `pnpm.cmd dev`, confirm model/account settings, then explicitly run up to five cases:

```powershell
pnpm.cmd evaluate --run candidate-a --count 5
```

Repeat to resume; completed cases are skipped. A successful transcription is saved before processing. Failure stops the batch with exit code 2; argument/input/configuration problems exit 1. After resolving a failure and waiting for saved retry guidance, explicitly retry its failed stage:

```powershell
pnpm.cmd evaluate --run candidate-a --count 5 --retry-failed
```

There are no automatic retries, sleeps, provider switches or paid fallbacks. Changed references or application/tool source hashes require a new run name. `--api` and `--origin` accept only HTTP `127.0.0.1` origins; redirects are rejected. `--manifest` and `--audio-dir` support another prepared dataset. Cases need a unique integer `number`, relative `file`, original-byte `sha256`, `transcript`, `expectedMeaning`, `criticalChecks` and `suggestedOutput` using the supplied labels. The original float32 FLEURS and canonical PCM16 mono 16 kHz WAV formats are supported, up to 60 seconds.

Reports are atomically saved to `.scratch/saylor/private/runs/<run>/report.json`: Git commit, application/tool hashes, source model names, source/evaluated-byte hashes, stage timings, attempts, stop reasons and allowlisted retry/rate-limit headers when available. Standard output shows status summaries only; HTTP error bodies are excluded. A per-run lock prevents simultaneous evaluators. Verify no evaluator is running before removing a stale `run.lock` after interruption. Preserve hashes, configuration, successful outputs and completed states; use a new run for changed experiments.

## Human scoring

For the user-reported counting restart regression, start the intended current local API on 8787 with the frontend origin 5173, then explicitly run `pnpm.cmd evaluate:counting`. This optional live suite uses five fictional/non-sensitive text cases through `/api/process` and consumes the configured free provider quota. It is excluded from `pnpm check` and CI. It checks Chinese counting restarts with and without translation, the correctly transcribed Malay counting phrase, a quoted apology and Chinese-to-English appointment/negation preservation. It does not test recognition of the user's voice, recover missing ASR words, or replace the 20-recording gate. The suite has no automatic retries; if provider requests fail, resolve the error/quota before running it again.

Fill each case's `review.transcription` against the frozen reference and `review.final` against intended meaning. List changed names, numbers, dates, negation or invented content in `review.criticalErrors`; explain uncertainty in `review.notes`. These fields survive resume. Recognized text never becomes ground truth. The tool leaves acceptance pending even if every request succeeds.

The MVP gate remains at least 18/20 usable and zero critical errors on representative coverage, with competent language review. Existing read speech lacks natural trilingual speech, user accent, self-corrections, dictated structure and spoken override attempts. API-only stage timings also leave browser Stop-to-visible-result latency unmeasured; that needs representative 20-second speech in the browser.
