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
| `vault_info` | Mandatory first call | Returns `today`, `read_only`, note/notebook counts, `top_level`, `tags`, and open/overdue/due-today task counts. `task_migration_required: true` means the vault still needs the app's **Move tasks from notes to the agenda…** before task writes. |
| `list_notes` | Enumerate a notebook or the top level | `notebook` omitted = All notes (top level). `depth` 1–10, `sort`: manual/name/modified/created, `limit` max 1000. A note with `notes_inside` is itself a notebook. `depth: 10` from the top level is the practical way to enumerate the whole vault. |
| `read_note` | Full note text + metadata | Returns two text blocks: JSON metadata, then raw Markdown. Metadata may include `notebooks`, `notes_inside`, `linked_from`, `notebooks_not_found`, `frontmatter_error`, `tasks` (linked open/closed counts), and `checklist` (total/done boxes). |
| `search_notes` | Find by words and tags | Every word must match; `+tag` requires and `-tag` excludes a tag. Title matches rank first. `notebook` scopes to that notebook and all descendants. |
| `list_tasks` | Filter tasks | `states`: open (default), closed, all, todo, doing, wait, done, cancel, fwd. Filters: `note`, `notebook`, `tag`, `priority` (A/B/C), `due` (overdue/today/week/dated/undated), `query`. Returns `id`, `state`, `title`, dates, priority, tags (including inherited note tags), and `note` (name or `null`). `note_missing: true` marks an unresolved link. |
| `agenda` | Day-by-day view | `from` (default today), `days` 1–62. Includes IDs, scheduled tasks, deadlines, warnings, overdue items, repeaters, events and tasks on the day they closed. |
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
| `add_task` | New task | `title`, optional `note` (existing note; omit for standalone), `scheduled`, `deadline`, `priority`, `tags`, `state`. Returns `added` with the created task and its `id`. |
| `update_task` | Change a task | Identify by `id`. Changes: `state`, `scheduled`, `deadline`, `priority`, `new_title`, `tags` (replaces explicit tags), `note`. Marking a repeating task `done` advances its date. `null` clears a date, priority or note link. |

## Vault rules the tools enforce

- A notebook is a note with children. Membership lives in the `parents` frontmatter
  property; never write it by hand. A note can belong to several notebooks.
- Names are unique in the vault. Refer to notes by name; a path such as
  `cards/Note.md` also works as a reference.
- Links: `[[Note name]]`; embeds: `![[Note name]]` or `![[Note name#Heading]]`.
  Avoid a leading H1 that repeats the note name.
- The active agenda reads tasks and events from `.supstack/tasks.jsonl`. Note
  boxes (`- [ ]`, `- [x]`) are checklists. Use `update_task` for agenda task
  changes. A linked task survives the note's rename or deletion; if the note
  returns with the same frontmatter `id`, it reconnects.
- Dates accept `2026-11-20`, `2026-11-20 14:00`, ranges, `today`, `tomorrow`,
  `fri`, `+3d`, with repeaters `+1w`, `++1m`, `.+3d` or a warning `-2d`.
- Daily notes are `YYYY-MM-DD`. Hidden folders are skipped by the note tools.
  The agenda excludes the separate task archive.
- `read_only` mode omits write tools; do not attempt host file writes to work
  around it.

## Failure handling

A tool error is an answer, not a crash: re-read the target, correct the reference
or ID, and retry once with a narrower change. Never retry an ambiguous
batch blindly. Because each tool call commits immediately and there is no
server-side journal, follow `operations.md` when several calls form one logical
operation.
