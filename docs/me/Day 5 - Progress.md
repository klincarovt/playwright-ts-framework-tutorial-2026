# Day 5 - Progress

**Goal:** Interview drill. Tell your story, explain the repo, answer the cheat sheet out loud, and try AI tooling once.
**Then I can say:** "I adapt fast and use AI tools responsibly."

## Steps
- [x] 0. Recall of the ❌ questions (isolation, triage, `use()`, logged out after setup)
- [x] 1. My 2-minute project story → reviewed, polished lines in `Revision.md`
- [x] 2. Transfer map: Java / Selenium / REST Assured → Playwright (`Revision.md` Part 4)
- [x] 3. Cheat sheet out loud (why Playwright, locators, login, CI-only failures)
- [x] 4. Playwright MCP: concept only (what, why, risks). The hands-on browser part was skipped (MCP Chrome not installed).
- [x] 5. Mock interview: 5 questions (auth, hardest bug, UI vs API, logged out, flaky)
- [ ] 6. Repo walkthrough: optional, next session

---

## 📘 Learn notes

| Topic | One-liner |
| --- | --- |
| Isolation | Each `test()` = fresh context. `test.step`s share one. |
| storageState | The setup project saves the state once; the projects load it via `dependencies`. |
| `use()` | Hands the value to the test. Never called → the test never starts. |
| Triage | Test bug / app bug / environment. Give **my own** example for each. |
| Flaky | Reproduce (`--repeat-each`) → trace → fix the cause. Retries only flag it. |
| UI vs API | Test pyramid: most at API, critical flows at UI, API for UI setup. |
| Mock `{ data: [] }` | = **empty results** (200), not "server down" (that's `status: 500` / `abort()`). |
| Grid | Playwright replaces it with **workers** + **sharding** (`--shard=1/3`). |
| DataProvider | A `for` loop that creates one `test()` per item. |
| MCP | A protocol; the server exposes tools; the AI makes tool calls on the accessibility tree. |
| PDF export | `node docs/revision-pdf.js` uses `page.pdf()`: Playwright as a general browser tool. |

## "I can now say…"
- "A setup file logs in once; the specs load the saved state, each in a fresh context."
- "I follow the test pyramid and use API calls to set up UI tests."
- "Retries flag flaky tests; I fix the root cause with web-first assertions."
- "Selenium can do most of it, but Playwright has it built in."

## Where to improve (priority order)
1. **3 stories out loud** (`Revision.md` Part 4): auth path bug, false positive, CI blocked. 4 lines each, no notes.
2. **Keywords** (`Revision.md` → "Keywords to fix"): read before every interview.
3. **❌ fundamentals:** 2.1 getByRole vs getByTestId, 2.2 textContent vs toHaveText, 1.3 lock file, 3.11 baseURL/goto/toHaveURL, 3.17 green ≠ proven.
4. **Answer shape:** one-line answer → how → example from my project.
5. **Hands-on (each = a new story):** data-driven search loop, mock with `status: 500`, confirm the CI failure via trace, auth fixture instead of the setup project.
6. **Selenium refresh** only if the job ad asks for it.

## Next: my own plan
1. **Course:** "Playwright Automation Testing With TypeScript in 6 Hours". Watch at 1.5×, skim what I already built, type along on the new parts: `test.describe` + hooks, tags + `--grep`, frames, tabs, dialogs, file upload, `waitForResponse`, `toHaveScreenshot`, reporters, config per environment.
2. **Solo project:** a different practice site (`saucedemo.com` or `automationexercise.com`). From memory: config + `.env`, 2 page objects, a fixture, storageState, 1 API test, 1 mock, CI. Plus 2–3 course topics. Write down where I got stuck.
3. **Review:** bring it to Claude for a PR-style review → my 2nd interview story.

## My notes
- Mark my reasoning; tell me the details and keywords separately.

## Questions
- Hardest-bug story: practise story 1 (auth path) without notes.
