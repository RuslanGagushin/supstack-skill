---
name: supstack-lint
description: >-
  Read-only health check for a Supstack vault: broken wikilinks and embeds,
  unresolved notebook links, orphan notes, frontmatter errors, PARA misfiles,
  duplicate titles and task hygiene. Reports findings; never repairs files.
---

# Lint a Supstack vault

This skill is read-only: `vault_info`, `list_notes`, `read_note`, `search_notes`,
`list_tasks` and `agenda` only. Do not create reports in the vault or auto-fix
anything. Return the findings in chat.

Call `vault_info` first. Then enumerate with `list_notes` at the top level,
`depth: 10` and `limit: 500` (if the result is truncated, report that the scan
is partial).
Keep a list of names seen. `search_notes` can locate a specific target during
link checks.

## Checks

1. **Structure** — report whether `Inbox`, `Projects`, `Areas`, `Resources` and
   `Archives` exist as top-level notebooks. List notes at the top level with no
   `parents`; an orphan may be intentional, so report rather than judge.
2. **Links** — collect `[[...]]` and `![[...]]` targets from note bodies. Check
   each target with `read_note` or `search_notes`; report the source note,
   target and whether it resolves. Also report `notebooks_not_found` values
   from `read_note` metadata.
3. **Frontmatter** — report `frontmatter_error` values, and notes whose
   `notebooks` metadata contains a missing target.
4. **Tasks** — use `list_tasks` with `states: ["all"]` and `due: "overdue"` to
   count overdue work; report open tasks with no date only as an observation
   (undated tasks are legal). Check that task lines found by `read_note` match
   the states and lines reported by `list_tasks`.
5. **PARA hygiene** — flag notes tagged `status-done` still in Projects,
   project notes without a definition-of-done section, Inbox captures older
   than the user's chosen age (default 14 days), and dated project work that
   has passed its deadline without a state change.
6. **Duplicates** — search for near-identical titles and report candidates;
   do not merge them.

Extract wikilinks from note bodies only; ignore links inside fenced code blocks
and treat aliases/heading fragments as the same target note. Cap link checks at
200 targets per run and say when the check was sampled.

## Report

Group findings by impact: broken navigation first, then metadata, then PARA
maintainability. Keep exact note names, targets, line numbers and counts. State
which checks were complete and which were sampled or skipped. Separate facts
from suggestions: "this link does not resolve" is a fact; "move to Archives"
is a suggestion.

Never claim deterministic hashing, ledger validation or a transaction check:
this transport exposes notes, notebooks and tasks only.

## Repair is a separate operation

After the user chooses specific findings, route each repair to the right skill
(`supstack-ingest`, `supstack-save`, `supstack-tasks` or `supstack-review`),
preview it under [../supstack/references/operations.md](../supstack/references/operations.md),
and apply only after that separate review. Re-run this read-only lint afterward
and compare the relevant findings.
