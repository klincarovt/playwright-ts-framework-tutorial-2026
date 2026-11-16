# Claude Code Learning

My notes on using Claude Code better. Updated at the end of each session.

---

## Sessions

- Sessions are saved on my machine in `~/.claude/projects/<project-folder>/`, one `.jsonl` file per session.
- `/resume` (or `claude --resume`) picks an old session. `claude --continue` reopens the last one.
- `/rename my-name` gives a session a readable name.
- `/clear` wipes the conversation and starts fresh. `Ctrl+L` only clears the screen.
- Commands start with `/`. Plain text like `clear` is just a message to Claude.

## CLAUDE.md: project instructions

- A `CLAUDE.md` in the project root is **loaded automatically** at the start of every session.
- Use it for the rules Claude should always follow here: how I learn, where the docs live, what not to do.
- I can edit it myself any time. Keep it short: a long CLAUDE.md gets diluted.
- Memory (`~/.claude/projects/.../memory/`) is Claude's private notes. CLAUDE.md is the shared, visible version.

## MCP servers

**What MCP is:** Model Context Protocol, a standard way to plug extra tools into Claude (a browser, a database, Jira...).

**Mine:**
```bash
claude mcp add playwright npx @playwright/mcp@latest
claude mcp add typescript npx ts-language-mcp /mnt/code/TypeScript/playwright-ts-framework-prep
```
- **playwright**: Claude can open a real browser and click around, like codegen driven by AI.
- **typescript**: Claude sees type errors and definitions in my `.ts` files, like the VS Code language server.

**Scopes, i.e. where the config is saved:**
| Scope | Who sees it | Stored in |
| --- | --- | --- |
| `local` (default) | Only me, this project | `~/.claude.json` |
| `project` | Everyone who clones the repo | `.mcp.json` in the repo |
| `user` | Me, in every project | `~/.claude.json` |

**Useful commands:** `claude mcp list`, `claude mcp remove <name>`, and `/mcp` inside a session to see their status.

## How I work with Claude here

- I write the code and run the commands. Claude hints, reviews and keeps the docs.
- Say **"wrap up"** at the end of a session, and Claude updates my notes in `docs/me/`.
