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

## Commands and shortcuts
| What | How |
| --- | --- |
| Quit Claude Code | `/exit` or `Ctrl+C` twice (`!exit` does nothing) |
| Run a shell command from Claude | `! <command>`: output lands in the chat |
| Clear the conversation | `/clear` (`Ctrl+L` = just the screen) |
| Stop vs pause a program in the terminal | `Ctrl+C` stops ✅ · `Ctrl+Z` **pauses** (it keeps its port) → `jobs`, `kill %1` |

## Themes
- `/theme` → built-in themes (dark, light, colorblind, ANSI) **and custom themes**.
- Custom theme file: `~/.claude/themes/<name>.json` → `{ "name", "base": "dark", "overrides": { "text": "rgb(…)", "claude": "rgb(…)", … } }`
  - `text` = my reply text, `claude` = the spinner (✻ Thinking…), `diff*` = edit colors, `*Background` = message blocks.
- Claude's theme only changes **accents**. The background and font belong to the **terminal** (Windows Terminal → Settings `Ctrl+,`).
- ⚠️ When letters went missing, it was the **terminal settings** (font / line height), not the Claude theme. Revert there first.
- My terminal scheme backup: `docs/me/JoJo Calm theme.json`.

## VS Code
- Format document: `Shift+Alt+F` (Windows) / `Ctrl+Shift+I` (Linux). Rebind to `Ctrl+Alt+L` via `Ctrl+K Ctrl+S`, or install **IntelliJ IDEA Keybindings**.
- Useful extensions: **Playwright Test for VSCode**, **ESLint**, **Prettier**, **Error Lens**, **WSL**.
- Open from WSL with `code .`.

## How I work with Claude here
- Claude reads `CLAUDE.md` automatically every session: the project rules live there. If it gets emptied, ask Claude to restore it.
- Say **"log it"** to save something to my notes right away.

- I write the code and run the commands. Claude hints, reviews and keeps the docs.
- Say **"wrap up"** at the end of a session, and Claude updates my notes in `docs/me/`.
- I can ask Claude to do **chores** (rename titles, edit `.gitignore`). The learning code stays mine.
- Claude has **memory** across sessions: when I say how I want to work ("explain why", "show a snippet for new APIs"), it remembers.
- I can send a message **while Claude is working**; it reads it mid-task.
- Rejecting a tool call (e.g. a file edit) stops Claude, so I can correct it right away.
- Claude **checks files on disk**: if my run output doesn't match the code, I probably didn't save (Ctrl+S) or pasted old output.
- Claude can be wrong: on Day 4 it guessed twice before finding the real bug (a path). Ask for **evidence**, not guesses.
- I can **push back on grading**: on Day 5 I asked Claude to mark my **reasoning** and only flag keywords and details separately. It saved that as a rule.
- Claude can write **helper scripts** on request (e.g. `docs/revision-pdf.js` → PDF of my revision notes). I run them.
- A **long session gets summarized** automatically (context limit); the docs and memory carry everything over.
- **`/plan`** turns on plan mode: Claude only reads and writes a plan file, then asks me to approve before changing anything.
- When I **ask a question**, I want an answer, not a file edit. I can reject the edit and say so; Claude saves that as a rule.
- Claude can't open some web pages or GitHub repos in this sandbox. **Downloading them into a folder** (here `oldProjects/`, gitignored) lets it read them.
- I can paste a spec from another chat (e.g. "what a senior project contains") and Claude maps it onto my plan.
- **`/effort max`** makes Claude reason as deeply as it can (slower, more tokens). Worth it for a careful review, not for small steps.
- **Memory and `CLAUDE.md` belong to the project folder.** A new repo starts **without** my learning-mode rules and saved preferences. Fix: put the rules in the new repo's `CLAUDE.md`, or personal ones in `~/.claude/CLAUDE.md` (applies to every project).
- Using **two AIs** works well: one drafts or revises, Claude reviews it like a PR. The review caught real bugs in the AI's draft (a test that could never fail, CI that would never run).
