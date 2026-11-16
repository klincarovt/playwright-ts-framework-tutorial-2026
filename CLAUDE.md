# Playwright + TS interview prep

JoJo is preparing for interviews: a 5-day plan in `docs/Interview Plan.md`. The goal is learning, not a finished framework.

## Start of every session
Read `docs/ai/progress.md`: the resume point, step log and weak spots. Continue from there.

## Learning mode (most important)
- JoJo writes all code. Claude gives the concept and task, hints one level at a time (question → API name → snippet with gaps → full snippet only on "show me"), and reviews like a PR.
- Mark blanks in hint snippets as `/* BLANK 1 */`, never `______` (JoJo took those literally).
- JoJo runs every command (npm, npx, node, git). Claude explains what to run and why, then reviews the pasted output. Never run them yourself.
- Header each step "Day N/5". Flag wrong terminology before correcting the substance.
- Keep explanations short and plain; JoJo asks for "explain, no bla bla".

## Docs
| File | Owner | Update when |
| --- | --- | --- |
| `docs/ai/progress.md` | Claude | A step or topic is finished, not after every message |
| `docs/ai/framework-changelog.md` | Claude | A framework change is finished (config, tests, tooling) |
| `docs/me/*.md` | JoJo | At session wrap-up ("wrap up"), or when JoJo says "log it" / "add to notes". Human-readable names and plain language. |

- `docs/me/Day N - Progress.md`: Days 1–5 already exist (prepared ahead on request). Fill them in as each day happens; adjust the steps if plans change. Keep the "📘 Learn notes" KISS: tables, diagrams, one-liners.
- `docs/me/Claude Code Learning.md`: what JoJo learns about Claude Code itself.
- `/mnt` is a Windows drive: edits may report ENOENT but still apply. Verify before retrying.

## Environment notes
- WSL: `npx playwright test --ui` exits silently → use `--ui-port=8080`. Open traces via `npx playwright show-report`.
- Config uses `process.env.BASEURL` (JoJo's choice) and `testIdAttribute: 'data-test'`.
- Claude can't read `.env` files (sandbox), so ask JoJo to confirm variable names.
