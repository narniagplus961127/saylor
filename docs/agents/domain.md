# Domain docs

## Before exploring

Read the root `GLOSSARY.md` and ADRs in `docs/adr/` relevant to the area being explored.

If these files do not exist, proceed silently. The domain-modeling skill creates them when terms or decisions are resolved.

## Layout

This project uses a single context:
- `GLOSSARY.md`: shared domain vocabulary.
- `docs/adr/NNNN-<decision>.md`: architecture decisions.

## Vocabulary

Use glossary terms in issue titles, proposals, hypotheses, and test names.
If a needed concept is absent, reconsider the wording or note the gap for domain-modeling.

## ADR conflicts

Explicitly identify any proposal that contradicts an existing ADR, including the ADR number and the reason for proposing a change.
