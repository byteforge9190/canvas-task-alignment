# Verification guide

How to check a submission for [TASK.md](TASK.md) in about ten minutes. Automated steps first; the manual checks cover only what tests cannot see.

## 0. Setup

```bash
git fetch origin
git checkout <submission-branch>
npm ci
npx playwright install chromium   # first time only
```

## 1. Automated (criteria S1–S3)

```bash
npm run typecheck        # expect: no output, exit 0
npm run test:unit        # expect: "Tests  12 passed (12)"
npm run test:e2e         # expect: "16 passed"
```

`test:e2e` starts the Vite dev server on `http://127.0.0.1:5173` by itself. If the port is busy the run fails with a web-server timeout — free the port and retry.

A failing test names the step and rule it checks, for example `Step 1 — marquee selection › Shift+marquee adds to the current selection`. Report the failing test names verbatim; do not paraphrase.

## 2. Integrity (criteria S6–S7)

```bash
git diff main --stat -- tests src/editor/seed.ts
```

Expected: **no output**. Any change here means the submission altered the acceptance criteria and is rejected regardless of test results.

```bash
grep -n "__editor" src/editor/store.ts
```

Expected: the `window.__editor = editorStore` assignment is still present.

## 3. Manual checks

Run `npm run dev` and open `http://127.0.0.1:5173`.

**M1 — Marquee rendering (criterion S4)**

1. Press on empty canvas near the top-left corner (around 40, 40 px into the canvas) and drag toward the bottom-right. Do not release.
2. Expect: a translucent light-blue box with a dashed blue outline, drawn *on top of* any shape it crosses. Compare with `task/assets/01-marquee-drag.png`.
3. Release. Expect: the box disappears; shapes it touched show the blue selection outline; the inspector reads `3 selected` for the drag in the screenshot.

Fail if the box is solid, has no fill, or is drawn beneath shapes.

**M2 — Toolbar order and labels (criterion S5)**

1. With nothing selected, hover each button in the Align and Distribute groups.
2. Expect, left to right: *Align left, Align horizontal centers, Align right, Align top, Align vertical centers, Align bottom, Distribute horizontally, Distribute vertically*, all disabled.
3. Shift+click two shapes: the six align buttons enable, the two distribute buttons stay disabled. Shift+click a third: all eight enable.

**M3 — Smoke check of undo semantics (already covered by tests; repeat only if e2e could not run)**

1. Marquee-select three shapes, click *Align top*, then *Align left*.
2. Press `Ctrl+Z` once: shapes return to their x positions but stay top-aligned.
3. Press `Ctrl+Z` again: original layout restored.

## 4. Decision

| Result | Decision |
|---|---|
| S1–S7 all pass | **Accept** |
| Any of S1–S3 fail | **Reject** — attach the failing test names and the console output |
| S6 or S7 fail | **Reject** — acceptance criteria were modified |
| S4 or S5 fail only | **Request changes** — visual/labeling fix, no logic change needed |

If you find the task itself ambiguous at any point (two reasonable implementations would disagree and the tests do not settle it), stop and flag it rather than grading — that is a defect in the task, not the submission.
