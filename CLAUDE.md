# Playwright + TS interview prep

JoJo is preparing for interviews: a 5-day plan in `docs/Interview Plan.md` (all 5 days done, 2026-11-19). The goal is learning, not a finished framework.
**Now:** JoJo watches a 6h Playwright + TS course, then builds a solo project on another practice site and brings it back for a PR-style review. Sessions are discussions, improvement and reviews.

## Start of every session
Read `docs/ai/progress.md`: the resume point, step log and weak spots. Continue from there.

## Learning mode (most important)
- JoJo writes all code. Claude gives the concept and task, hints one level at a time (question → API name → snippet with gaps → full snippet only on "show me"), and reviews like a PR.
- Mark blanks in hint snippets as `/* BLANK 1 */`, never `______` (JoJo took those literally).
- JoJo runs every command (npm, npx, node, git). Claude explains what to run and why, then reviews the pasted output. Never run them yourself.
- Header each step "Day N/5" (or the topic name after the plan). Flag wrong terminology before correcting the substance.
- **Grading:** mark the **reasoning**. Wrong keywords are flagged first; missed specifics go in a "notes" line and don't lower the mark.
- Keep explanations short and plain; JoJo asks for "explain, no bla bla".

## Docs
| File | Owner | Update when |
| --- | --- | --- |
| `docs/ai/progress.md` | Claude | A step or topic is finished, not after every message |
| `docs/ai/framework-changelog.md` | Claude | A framework change is finished (config, tests, tooling) |
| `docs/me/Revision.md` | Claude | **Right away**: new definitions, questions (✅/🟡/❌/⬜, answers in `<details>`), decisions, project stories |
| `docs/me/*.md` (other) | JoJo | At session wrap-up ("wrap up"), or when JoJo says "log it" / "add to notes". Human-readable names and plain language. |

- `docs/me/Day N - Progress.md`: Days 1–5 are filled in. Day 5 holds "Where to improve" and JoJo's next plan. Keep "📘 Learn notes" KISS: tables, diagrams, one-liners.
- `docs/me/Revision.md`: Part 1 definitions, Part 2 questions, Part 3 decision log, Part 4 project stories + Java/API → Playwright map. Export: `node docs/revision-pdf.js` → `docs/me/Revision.pdf`.
- `docs/me/Extras - Progress.md`: post-plan topics (describe/hooks, tags, waitForResponse, config per env, data-driven, frames, MCP). Same format as the Day files; tick the status table as each is done.
- `docs/me/Claude Code Learning.md`: what JoJo learns about Claude Code itself.
- `/mnt` is a Windows drive: edits may report ENOENT but still apply. Verify before retrying.

## Environment notes
- WSL: `npx playwright test --ui` exits silently → use `--ui-port=8080`. Open traces via `npx playwright show-report`.
- Config uses `process.env.BASEURL` (JoJo's choice, exact case) and `testIdAttribute: 'data-test'`. `.env` / secrets: `BASEURL`, `USER_EMAIL`, `USER_PASSWORD`.
- Claude can't read `.env` files (sandbox), so ask JoJo to confirm variable names.
- Projects: `setupUser` (writes `playwright/.auth/user.json`, gitignored) → `chromium` / `webkit` depend on it; `apiTest` has no storage state. Specs that must start logged out use `test.use({ storageState: { cookies: [], origins: [] } })`.
- CI (GitHub Actions, Environment `env`) runs only `tests/api --project=apiTest --no-deps`: the demo site blocks UI logins from GitHub runners (likely Cloudflare, not confirmed via trace).
