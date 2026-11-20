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

- Use `add_task` and `update_task` for every task mutation. Never hand-edit a
  task line with `edit_note`: the tools write `CLOSED:`, move repeating tasks
  to their next date, and keep the app's grammar intact.
- `add_task` without `note` writes to today's daily note and creates it if
  missing. That is intended for ad hoc capture; work with a clear owner belongs
  in a Project note, routines in an Area note.
- Identify a task for `update_task` by `note` + `line`, and pass `title` too
  whenever possible. Lines come from `list_tasks`, `agenda` or `read_note`;
  if a line has moved, re-query instead of guessing.
- `SCHEDULED` is when you intend to work on it; `DEADLINE` is when it is due.
  Use one or both. A dated task can show an early warning such as `-2d`.
- States: `todo` (`- [ ]`), `doing` (`[/]`), `wait` (`[<]`), `done` (`[x]`),
  `cancel` (`[-]`), `fwd` (`[>]`). `cancel` and `fwd` are closed but left out of
  progress. Reopening a closed task with `todo` is allowed.
- Priorities are A, B or C. Task tags are passed as `tags` (without `#`); `null`
  clears a date or priority in `update_task`.

## Common operations

**Capture.** Choose the destination note from the PARA rule in
[../supstack/references/para.md](../supstack/references/para.md). Call
`add_task` with a one-line title, optional `priority`, `tags`, `scheduled`,
`deadline`, and `notes` for detail. Report the returned task line.

**Schedule or reschedule.** Re-read the task, then `update_task` with
`scheduled` and/or `deadline`. Accepts `2026-11-20`, `2026-11-20 14:00`,
`tomorrow`, `fri`, `+3d`, with `+1w`, `++1m` or `.+3d` repeaters.

**Close.** `update_task` with `state: "done"` (or `cancel` / `fwd`). A repeating
task advances instead of simply closing; report the new date returned by the
tool. Do not also append a manual `CLOSED:` line.

**Triage.** `list_tasks` with `due: "overdue"` or `states: ["open"]`, and
`agenda` with `from` / `days`. Group by Project or Area, then propose: do,
reschedule, delegate (`fwd`), cancel, or move to Archives. Apply only the
choices the user confirms; bulk state or date changes need a preview first.

**Report.** `agenda` returns days with scheduled tasks, deadlines, warnings,
overdue items, repeaters and events. Present it as the app does, with note
names and line numbers for follow-up. This is a read-only use of the skill.

## Preview and verify

For a single task, state the destination, title, state, dates and priority
before calling the tool when the user's request is not already explicit. For
several tasks, show the full list of proposed changes and wait for approval.

After each write, call `list_tasks` (or `read_note`) again and confirm the
state, dates and line. Report exact note names and lines. Never claim a git
commit: the server does not run git and Supstack syncs separately.
