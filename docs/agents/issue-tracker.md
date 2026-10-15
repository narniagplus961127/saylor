# Issue tracker: Local Markdown

Issues and specs live as Markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`.
- Specs: `.scratch/<feature-slug>/spec.md`.
- Implementation tickets: `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`, one file per ticket.
- Record triage state in a `Status:` line near the top; use the strings in `triage-labels.md`.
- Append comments under `## Comments`.

When a skill says “publish to the issue tracker”, create the appropriate file using these conventions, creating directories as needed.

When a skill says “fetch the relevant ticket”, read the referenced file. Resolve a bare ticket number within its feature directory; ask for the feature if ambiguous.

## Wayfinding operations

- Map: `.scratch/<effort>/map.md`, containing Notes, Decisions-so-far, and Fog.
- Child tickets: `.scratch/<effort>/issues/NN-<slug>.md`, numbered from `01`, with the question in the body.
- Record ticket type in `Type:` using `research`, `prototype`, `grilling`, or `task`.
- Wayfinding uses `Status: open`, `Status: claimed`, and `Status: resolved`.
- Record dependencies in `Blocked by: NN, NN`. A ticket is unblocked when every listed ticket is resolved.
- Frontier: choose the first ticket by number that is open and unblocked.
- Claim: set `Status: claimed` and save before starting work.
- Resolve: append `## Answer`, set `Status: resolved`, and append a gist and link to the map’s Decisions-so-far.
