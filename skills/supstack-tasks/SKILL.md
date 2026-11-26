---
name: supstack-tasks
description: >-
  Work with Supstack tasks and the agenda: capture, schedule, change state,
  close repeating tasks, triage overdue items and report the day or week. Use
  for add task, schedule, deadline, mark done, task states, agenda, overdue,
  today or weekly task review in a Supstack vault.
---

# Tasks and agenda in Supstack

Call `vault_info` first. Its `today` value and task counts are the starting
point; do not assume the host clock matches the vault.

Read [../supstack/references/mcp-contract.md](../supstack/references/mcp-contract.md)
for the exact tool arguments and date grammar. Load
[../supstack/references/operations.md](../supstack/references/operations.md)
before any multi-task change.

## Rules

- Use `add_task` and `update_task` for agenda tasks. Markdown boxes in notes
  are checklists; those boxes stay out of the agenda.
- `add_task` without `note` creates a standalone task. When work belongs to
  a project or area, pass the existing note's name in `note`.
- Identify a task for `update_task` by the `id` from `list_tasks`, `agenda`
  or `add_task`. Pass `note` to change the linked note, or `note: null` to
  remove the link. A task marked `note_missing` retains its link and reconnects
  if that note is restored.
- If `vault_info` reports `task_migration_required`, explain that legacy
  tasks still need to be moved through the Supstack app before task writes.
- `SCHEDULED` is when you intend to work on it; `DEADLINE` is when it is due.
  Use one or both. A dated task can show an early warning such as `-2d`.
- States: `todo`, `doing` and `wait` are open; `done`, `cancel` and `fwd`
  are closed. Reopen with `todo`.
- Priorities are A, B or C. Task tags are passed as `tags` (without `#`); `null`
  clears a date or priority in `update_task`.

## Common operations

**Capture.** Choose a linked note if relevant, using the PARA rule in
[../supstack/references/para.md](../supstack/references/para.md). Call
`add_task` with a one-line title and optional `note`, `priority`, `tags`,
`scheduled` and `deadline`. If the user dictates an app-style quick-add line
with a clear date, `#tags` or an `@note`, pass those as separate fields.
Resolve the note through `search_notes` if needed. Report the returned task ID.

**Schedule or reschedule.** Re-read the task, then `update_task` with
`scheduled` and/or `deadline`. Accepts `2026-11-20`, `2026-11-20 14:00`,
`tomorrow`, `fri`, `+3d`, with `+1w`, `++1m` or `.+3d` repeaters.

**Close.** `update_task` with `state: "done"` (or `cancel` / `fwd`). A repeating
task advances when marked `done`; report the new date returned by the tool.

**Triage.** `list_tasks` with `due: "overdue"` or `states: ["open"]`, and
`agenda` with `from` / `days`. Group by Project or Area, then propose: do,
reschedule, delegate (`fwd`), or cancel. Apply only the
choices the user confirms; bulk state or date changes need a preview first.

**Report.** `agenda` returns days with scheduled tasks, deadlines, warnings,
overdue items, repeaters, events and tasks on the day they closed. Present
linked note names and task IDs for follow-up. This is a read-only use of the skill.

## Preview and verify

For a single task, state the destination, title, state, dates and priority
before calling the tool when the user's request is not already explicit. For
several tasks, show the full list of proposed changes and wait for approval.

After each write, call `list_tasks` again and confirm the ID, state, dates and
note link. Include `states: ["all"]` when verifying a closure. Never claim a git
commit: the server does not run git and Supstack syncs separately.
