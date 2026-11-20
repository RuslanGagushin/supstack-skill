# supstack-mcp contract

All vault access goes through the `supstack` MCP server. Tool names below are the
MCP names; hosts prefix them (`mcp__supstack__vault_info` in Claude Code,
`supstack.vault_info` under OpenCode Code Mode).

The server refreshes its view of the vault before every tool call, so changes made
in the Supstack app, by git, or by another agent are visible on the next call.
The app does not need to be running. The server never runs git; the app's own
sync carries changes to other devices.

## Read tools

| Tool | Use | Notes |
| --- | --- | --- |
| `vault_info` | Mandatory first call | Returns `today`, `read_only`, note/notebook counts, `top_level`, `tags`, and open/overdue/due-today task counts. Use its `today` value; do not assume the system date is the vault date. |
| `list_notes` | Enumerate a notebook or the top level | `notebook` omitted = All notes (top level). `depth` 1–10, `sort`: manual/name/modified/created, `limit` max 1000. A note with `notes_inside` is itself a notebook. `depth: 10` from the top level is the practical way to enumerate the whole vault. |
| `read_note` | Full note text + metadata | Returns two text blocks: JSON metadata, then raw Markdown. Metadata may include `notebooks`, `notes_inside`, `linked_from`, `notebooks_not_found`, `frontmatter_error`, `tasks`. Line 1 of the text is line 1 for `update_task`. |
| `search_notes` | Find by words and tags | Every word must match; `+tag` requires and `-tag` excludes a tag. Title matches rank first. `notebook` scopes to that notebook and all descendants. |
| `list_tasks` | Filter tasks | `states`: open (default), closed, all, todo, doing, wait, done, cancel, fwd. Filters: `note`, `notebook`, `tag`, `priority` (A/B/C), `due` (overdue/today/week/dated/undated), `query`. Returns `note`, `line`, `state`, `title`, dates, priority, tags, subtask counts. |
| `agenda` | Day-by-day view | `from` (default today), `days` 1–62, `closed`. Includes scheduled tasks, deadlines, warnings, overdue items, repeaters and events. |
| `daily_note` | Open a daily note | **Creates by default.** Pass `create: false` for a read-only check. Named `daily notes/YYYY-MM-DD.md`. |

## Write tools

| Tool | Use | Constraints |
| --- | --- | --- |
| `create_note` | New note | `title`, `body`, `notebooks`, `tags`, `icon`. Titles are unique across the vault; the tool fails on a duplicate. The first notebook's `child_template` is applied automatically. Do not put frontmatter or an H1 repeating the title in `body`. |
| `edit_note` | Change body text | `replace` (exact old/new, optional `all`), `append` (optionally under `heading`), or `body` (whole text). Frontmatter is preserved; it cannot edit properties. Prefer small replace/append over full replacement. |
| `organize_note` | Membership, tags, icon | `notebooks` replaces the full list; `add_to` / `remove_from` are additive; same pattern for `tags`, `add_tags`, `remove_tags`; `icon` must be a Lucide name or empty to remove. This is the only way to move a note between notebooks. |
| `reorder_notebook` | Manual order | `notebook` + `order` of note names. Unlisted notes keep their relative order after the listed ones. |
| `rename_note` | Rename + link rewrite | Rewrites `[[links]]` in every note, including notebook lists. Still preview it: pins and saved views in app settings are not updated. |
| `delete_note` | Delete | Copies to `.trash`, leaves child notes in place, breaks incoming links. **Explicit user consent required.** Prefer `organize_note` to Archives. |
| `add_task` | New task | `title`, optional `note` (default: today's daily note, created if needed), `heading`, `scheduled`, `deadline`, `priority`, `tags`, `state`, `notes`. Returns the created task with its line. |
| `update_task` | Change a task | Identify by `note` + `line` and/or `title` (the title is checked, so a stale line cannot hit the wrong task). Changes: `state`, `scheduled`, `deadline`, `priority`, `new_title`, `tags`. Closing writes `CLOSED:` and moves repeating tasks forward. `null` clears a date or priority. |

## Vault rules the tools enforce

- A notebook is a note with children. Membership lives in the `parents` frontmatter
  property; never write it by hand. A note can belong to several notebooks.
- Names are unique in the vault. Refer to notes by name; a path such as
  `cards/Note.md` also works as a reference.
- Links: `[[Note name]]`; embeds: `![[Note name]]` or `![[Note name#Heading]]`.
  Avoid a leading H1 that repeats the note name.
- Task states are fixed: `- [ ]` todo, `- [/]` doing, `- [<]` wait, `- [x]` done,
  `- [-]` cancel, `- [>]` fwd. Headings are never tasks. Use `update_task` for
  state and date changes.
- Dates accept `2026-11-20`, `2026-11-20 14:00`, ranges, `today`, `tomorrow`,
  `fri`, `+3d`, with repeaters `+1w`, `++1m`, `.+3d` or a warning `-2d`.
- Daily notes are `YYYY-MM-DD`. Hidden folders (`.trash`, `.supstack`, `.git`)
  are never listed or read.
- `read_only` mode omits write tools; do not attempt host file writes to work
  around it.

## Failure handling

A tool error is an answer, not a crash: re-read the target, correct the reference
or stale line, and retry once with a narrower change. Never retry an ambiguous
batch blindly. Because each tool call commits immediately and there is no
server-side journal, follow `operations.md` when several calls form one logical
operation.
