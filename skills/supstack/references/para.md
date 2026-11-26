# PARA in a Supstack vault

Supstack has no folders to configure: a notebook is a note that other notes list
in their `parents` property. PARA is therefore four top-level notebooks plus an
Inbox staging notebook. The MCP tools manage membership; the agent only chooses
destinations.

```
All notes (top level)
├── Inbox          unsorted capture, source notes, quick drops
├── Projects       finite outcomes with a definition of done
├── Areas          ongoing responsibilities with a standard to maintain
├── Resources      reference material of continuing interest
└── Archives       finished or inactive material, kept for retrieval
```

Project and area notes may themselves be notebooks: a project note holds its
meeting notes, research and sub-projects; an area note holds its recurring
material. In `create_note`, pass the immediate parent only unless cross-listing
is intentional (`notebooks: ["Projects"]` for a project note,
`notebooks: ["<project note>"]` for a note inside it). More than one notebook
means the note appears in several places in the app.

## Routing rule

Ask in this order; stop at the first match:

1. **Inbox** — the item has not been triaged yet, or it is a raw source that must
   stay intact. Inbox is staging, not a permanent PARA bucket.
2. **Projects** — it has a concrete outcome, a definition of done, and an end
   date or a next action that finishes it. A project with no next action is
   still a project, but needs attention in review.
3. **Areas** — it is an ongoing responsibility with a standard to uphold and no
   finish line: health, finances, home, a role at work. Areas generate
   recurring tasks, not completion.
4. **Resources** — it is reference material, a topic, a technique or a source
   summary with no current action or deadline.
5. **Archives** — the outcome is reached, cancelled, or no longer actionable.
   Archive by moving (never deleting), preserving links and history.

When two buckets seem to fit, choose by actionability now, not by topic. A
finished project goes to Archives even if it is still useful as reference.
A reference note that becomes part of active work is copied or linked from the
project; the resource itself stays in Resources.

## Note shapes

Use the templates in `../templates/` as body structure. Keys:

- **Project** — `_Goal_`, `## Definition of done`, `## Notes`, `## Links`, `## Log`.
  Link agenda tasks to the project note and set their `scheduled` or `deadline`
  fields as needed.
- **Area** — `_Standard_`, `## Responsibilities`, `## Routines`, `## Links`, `## Log`.
  Routines are recurring tasks with repeaters.
- **Resource** — `_Summary_`, `## Key points`, `## Sources`, `## Related`, `## Log`.
  A resource summarizes; the verbatim source stays in Inbox.
- **Source capture** — `_Captured_`, `_Locator_`, `_Extraction_`, then `## Original`
  with untouched content and `## Derived notes` with links out.

Do not add a leading H1 that repeats the note title; the app already shows it.

## Status tags

The MCP tools can set tags and icons but not arbitrary frontmatter. Use tags for
lifecycle state:

- `status-active`, `status-waiting`, `status-paused`, `status-done`, `status-archived`
- `type-project`, `type-area`, `type-resource`, `type-source`
- `review-due` for notes the next PARA review should revisit

Set them with `organize_note` (`add_tags` / `remove_tags`), and remove the old
status tag when it changes. Tags are metadata, not evidence: a tag does not make
a claim true or a project finished.

## Archiving a project

1. Read the project note and its children (`read_note`, `list_notes`).
2. Confirm the definition of done, or get explicit user confirmation.
3. Preview: project note → Archives, tag `status-done` → `status-archived`,
   one `## Log` line with the date from `vault_info`, and a decision for each
   child note (keep inside the archived project, or move explicitly).
4. Apply after approval. Never `delete_note` as a shortcut for archiving.
5. Verify membership and links; report the moved names.

Switching filing habits later affects new notes only. Bulk migration of existing
notes needs its own reviewed move map and explicit approval; never do it as a
side effect of another operation.
