# canvas-task-alignment

A worked example of a **visually-grounded coding task**: a small React + TypeScript canvas editor, a task specification derived from screenshots of the finished feature, objective success criteria backed by tests, a verification guide for reviewers, and a reference implementation.

I built this to show how I specify and grade frontend work — the kind of task where "it looks right" is not good enough and a reviewer needs to be able to say *pass* or *fail* without guessing.

## Repository layout

| Path | Purpose |
|---|---|
| [`TASK.md`](TASK.md) | The task: context, visual material, expected behaviour per step, state contract, success criteria, known traps |
| [`VERIFICATION.md`](VERIFICATION.md) | How a reviewer checks a submission in ~10 minutes: automated steps, integrity checks, the few manual checks, accept/reject rules |
| `task/assets/` | Screenshots of the finished feature (regenerated from the reference implementation, see below) |
| `src/editor/` | The editor: `geometry.ts` (pure maths), `store.ts` (Zustand), `Canvas.tsx` (rendering + pointer gestures), `Toolbar.tsx`, `Inspector.tsx` |
| `tests/unit/` | Vitest tests for the geometry functions (12) |
| `tests/e2e/task.spec.ts` | Playwright acceptance tests driving the real UI (16) |
| `tests/e2e/screenshots.spec.ts` | Regenerates `task/assets` — not an acceptance test |

## Branches

| Branch | Contents | `npm test` |
|---|---|---|
| `main` | Starting point handed to the implementer: click/shift-click selection, drag-to-move, undo/redo. `alignShapes`/`distributeShapes` throw `Not implemented`. | **fails by design** — the failing tests *are* the task |
| `solution` | Reference implementation of all three steps | passes: 12 unit + 16 e2e |

```bash
git diff main solution --stat   # see exactly what the task asks for
```

## Running it

```bash
npm ci
npx playwright install chromium   # once
npm run dev                       # http://127.0.0.1:5173
npm test                          # typecheck is separate: npm run typecheck
```

Regenerate the screenshots (on `solution`): `npm run screenshots`.

## Design decisions worth knowing

- **Tests assert on state, not pixels.** The store is exposed as `window.__editor`; Playwright drives real pointer and keyboard events and reads the resulting state. This keeps the suite deterministic across GPUs and fonts. The only pixel-level criteria (marquee styling, button order) are explicit manual checks in `VERIFICATION.md`.
- **Every rule in `TASK.md` maps to a named test.** A failing test tells the reviewer which rule was broken; a reviewer who cannot run the tests still has a numbered manual procedure.
- **Known traps are documented, not hidden.** Floating-point drift in `distributeShapes` and edge-contact in marquee hit-testing are both covered by tests and called out in the task, because a task that fails people on undocumented edge cases is a bad task.
- **Ambiguity is a task defect.** `VERIFICATION.md` tells reviewers to stop and flag rather than grade when two reasonable implementations would disagree.

## Stack

React 19 · TypeScript · Zustand · Canvas 2D · Vite · Vitest · Playwright

Built with Claude Code as a pair-programmer; the task design, acceptance criteria and review process are mine.
