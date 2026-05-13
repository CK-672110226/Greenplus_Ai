# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server with HMR at http://localhost:5173
npm run build     # Production build to dist/
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint on all JS/JSX files
```

No test runner is configured. Validation is done via lint + manual browser verification.

## Architecture

This is a **React 19 + Vite 8** single-page application. Entry point: `index.html` → `src/main.jsx` → `src/App.jsx`.

- `src/main.jsx` — mounts `<App />` into `#root` using React 19 `createRoot`
- `src/App.jsx` — currently the single component; all application logic lives here
- `src/index.css` — global styles
- `src/App.css` — component-scoped styles for App
- `src/assets/` — static images (hero.png, SVG logos)
- `public/` — files served as-is (icons.svg referenced via `<use href="/icons.svg#...">` in JSX)

ESLint is configured with `react-hooks` and `react-refresh` rules (see `eslint.config.js`). No TypeScript.

## Design Specification

Before building or restyling any page, read **`docs/design-spec.md`**. It is the visual source-of-truth derived from the wireframes and covers:

- Design language (neo-brutalist, borders, shadows, hatch charts, font roles)
- Navigation anatomy (UserLayout / BuyerLayout / Admin shell with ASCII diagrams)
- Every page spec: layout zones, exact UI zones, data shown, missing pieces vs wireframe
- Shared micro-patterns: KpiCard, SectionDivider, ProgressBar, Timeline, Toggle pill, BookingRow, hatch bar chart
- List of what's missing per page and what's not yet wireframed

## User Flow & Page Composition

Before creating or editing any page, read **`docs/user-flow.md`**. It covers:

- Entry points and role-based routing (`user` → UserLayout, `buyer` → BuyerLayout, `admin` → default shell)
- Full navigation flow for each role (user / buyer / admin)
- Per-page composition: which components, Redux slices, services, and data each page needs
- Redux state ↔ page map (which slice is read/written where)
- Checklist for adding a new page correctly

## UI Design System

Before writing any JSX or CSS, read **`docs/ui-components.md`**. It covers:

- All CSS custom property tokens (`--ink`, `--paper`, `--green`, etc.) — never use raw hex values
- Typography classes: `font-brand`, `font-body`, `font-data`
- Component APIs: `<Button>`, `<Card>`, `<GradeTag>`, `<NavBar>`, `<ProtectedRoute>`
- Layout components: `<SmartLayout>`, `<UserLayout>`, `<BuyerLayout>`
- Common patterns (uppercase labels, key/value grids, tab buttons)
- Anti-patterns to avoid (e.g. `--ink-5` does not exist, only `--ink` through `--ink-4`)

## AI Working Rules (from PROJECT_AI_WORKING_RULES.md)

These rules govern all AI-assisted work in this repository.

### Mandatory workflow for every task

1. Review relevant history files in `HistoryVersions/` **before** planning or editing code.
2. Read versions from `.00` through latest in ascending order for the target scope.
3. Make focused changes only to files required by the task.
4. After completing changes, create a new history version file.

### History file structure

```
HistoryVersions/
  Feature/<ScopeKey>/Feature-<ScopeKey>.YY.md   ← new feature work
  Fix/<ScopeKey>/Fix-<ScopeKey>.YY.md            ← bug fix work
  Assignment1/Assignment1.00.md                  ← legacy, do not delete

HistorySystem/
  System1.YY.md    ← AI workflow / process / rule changes only
```

- First revision for any scope is always `.00`; each follow-up increments by `.01` in filename.
- Never overwrite or delete existing history files.
- Mis-scoped files go into a `LegacyFromWrongScope/` subfolder, not deleted.
- When `HistoryVersions/` structure changes, update `HistoryVersions/README.md` in the same task.

### Required content for each history file

1. Title with exact version name
2. Date in English and Thai (e.g. `12 May 2026 (12 พฤษภาคม 2569)`)
3. Overview, Reason, Changes (file-by-file), Validation, Notes

### When history must be updated

Any feature addition, bug fix, UI/styling change, data structure change, file reorganization, or meaningful refactor requires a new history version file. Do not skip this step.

### AI-Native Engineering additions (System1.03)

The following rule sections were added to `PROJECT_AI_WORKING_RULES.md`:

- **AI-Native Engineering Principles** — Machine-Understandability, architecture docs in Mermaid (`docs/architecture.mermaid`), rule-category table, strict workflow order.
- **Git History Standards** — Conventional Commits format, commit message rules (AI drafts *what*, developer adds *why*), PR summary standards, AI code-review checklist.
- **Automated Testing Standards** — Self-healing/agentic testing principles, required test levels (unit/integration/smoke), visual regression notes.
- **Technology Maintenance Monitoring** — Signal ingestion, relevance filtering, breaking-change detection signals, impact analysis output format.
- **Risk Assessment Heuristics** — Risk-score formula, observable signals table, conditions that require a risk note in history.
- **MCP Integration** — Allowed MCP use cases, MCP rules (log all actions, no auto-push without approval).

### System history

Changes to AI workflow rules, tooling policy, or process (not tied to a feature/fix) go in `HistorySystem/` as `System1.YY.md` increments.
