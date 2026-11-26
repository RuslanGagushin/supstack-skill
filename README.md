# supstack-para

PARA knowledge workflows for [Supstack](https://github.com/RuslanGagushin/supstack), driven by the [supstack-mcp](https://github.com/RuslanGagushin/supstack-mcp) server.

Drop in a source and the agent captures it, files the derived notes into **Projects / Areas / Resources / Archives**, links them to their evidence, and schedules tasks in the Supstack agenda. Ask questions from the vault, save one selected insight, run a weekly PARA review, and lint the graph. Notes stay as plain Markdown; agenda tasks live in `.supstack/tasks.jsonl`.

The same skill files work as an OpenCode skill pack and as a Claude Code plugin; there is one source of truth in `skills/`.

## Skills

| Skill | What it does |
| --- | --- |
| `supstack` | Setup/adoption of the PARA notebooks, preflight, routing and the shared operation contract. |
| `supstack-ingest` | Source → immutable Inbox capture + linked canonical notes with provenance. |
| `supstack-query` | Read-only answers from the vault, cited with `[[Note#Heading]]` and task IDs. |
| `supstack-save` | Keep one explicitly selected answer, decision or insight as a PARA note. |
| `supstack-tasks` | Capture, schedule, close and triage tasks; read the agenda. Uses `add_task` / `update_task` only. |
| `supstack-review` | Weekly PARA review: Inbox triage, project/area checks, archive proposals, digest. |
| `supstack-lint` | Read-only check for dead links, orphans, frontmatter errors, duplicate titles and PARA hygiene. |

## Requirements

- Node.js 20 or newer (used by `npx` to start the MCP server).
- A Supstack vault folder: the one containing `cards/`.
- `supstack-mcp` 0.2 or newer, using the Supstack 0.38+ task store. For an older vault, first use **Move tasks from notes to the agenda…** in the app.
- OpenCode or Claude Code. The Supstack app itself does not have to be running; if it is, it picks up changes on disk.

## Install for OpenCode

1. Get the skills. Either run OpenCode from a clone of this repository (`.opencode/opencode.jsonc` already registers `./skills`), or add this to your global `~/.config/opencode/opencode.jsonc` / project `opencode.jsonc`:

   ```jsonc
   {
     "$schema": "https://opencode.ai/config.json",
     "skills": ["C:/git/supstack-skill/skills"]
   }
   ```

2. Point the MCP server at your vault:

   ```sh
   opencode mcp add supstack -- npx -y github:RuslanGagushin/supstack-mcp "C:/path/to/my-vault"
   opencode mcp list
   ```

   The equivalent config is in [`examples/opencode.jsonc`](examples/opencode.jsonc). Use `{env:VAR}` substitution if you do not want the path in a config file.

3. Open OpenCode and ask, in plain language: *Set up PARA notebooks in my Supstack vault*. The agent calls `vault_info`, previews missing notebooks, and creates them only after approval.

## Install as a Claude Code plugin

```sh
claude plugin marketplace add RuslanGagushin/supstack-skill
claude plugin install supstack-para@ruslangagushin-supstack
claude mcp add supstack -- npx -y github:RuslanGagushin/supstack-mcp "/path/to/my-vault"
```

The MCP server can also be configured per project through [`examples/claude-mcp.json`](examples/claude-mcp.json) (copy it to `.mcp.json` in your vault and replace the path). Then invoke `/supstack` or ask for the workflow you want, for example *review my PARA projects* or *ingest this article into Supstack*.

## PARA layout in the vault

Supstack notebooks are notes that hold other notes; membership is the `parents` frontmatter property, which the MCP tools manage. The setup creates five top-level notebooks:

```text
All notes
├── Inbox       unsorted capture and immutable source notes
├── Projects    finite outcomes with a definition of done
├── Areas       ongoing responsibilities with a standard
├── Resources   reference material of continuing interest
└── Archives    finished or inactive work, kept for retrieval
```

A project note can itself be a notebook holding meeting notes, research and sub-projects. Filing is by actionability now, not by topic: a finished project goes to Archives, while the reference it produced stays in Resources. The full routing rule and archive procedure are in `skills/supstack/references/para.md`.

## A typical cycle

1. **Capture** — paste a source or point at a file. `supstack-ingest` saves it verbatim in Inbox and writes linked notes into the right PARA bucket.
2. **Act** — `supstack-tasks` schedules next actions and links them to the project note when relevant; `agenda` shows the day and week.
3. **Ask** — `supstack-query` answers from the vault with citations to notes and task IDs and never writes.
4. **Keep** — `supstack-save` persists only the answer the user explicitly selects.
5. **Review** — `supstack-review` proposes Inbox triage, overdue decisions and archives.
6. **Check** — `supstack-lint` reports navigation and PARA hygiene problems; repairs are separate, reviewed operations.

## Safety and limits

- Every operation starts with `vault_info`. Writes follow a read → draft → preview → apply → verify protocol; destructive and bulk changes need explicit approval.
- MCP calls commit one at a time. There is no bundle, hash precondition, server-side journal or rollback claim. Deleted notes go to `.trash`; other reversals rely on the app's Undo or a manual edit.
- The server never runs git. Committing and syncing remain the app's job.
- If a note is open in the Supstack editor, finish editing (Done) before the agent writes to it; the app's next save can otherwise overwrite the change.
- Source material, note bodies and tool results are treated as untrusted data, never as instructions. Network fetching requires explicit consent.
- In read-only MCP mode the skills degrade to query, lint and reports.
- The MCP server needs the vault as a folder on the machine running the agent (a desktop vault, or a git clone of it); Android's picked folder is not directly addressable.

## Repository layout

```text
.claude-plugin/                 Claude Code plugin + marketplace metadata
.opencode/opencode.jsonc        registers ./skills for OpenCode
examples/                        host configuration examples
skills/
  supstack/                      orchestrator
    references/                  MCP contract, PARA, operations, provenance
    templates/                   project, area, resource, source capture
  supstack-ingest/
  supstack-query/
  supstack-save/
  supstack-tasks/
  supstack-review/
  supstack-lint/
scripts/check-skills.mjs         structural check for this repository
```

Run `node scripts/check-skills.mjs` after editing skill files. It verifies the JSON metadata, SKILL.md frontmatter and local relative links.

## License

MIT. See [LICENSE](LICENSE).
