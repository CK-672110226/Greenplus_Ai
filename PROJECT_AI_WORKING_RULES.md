# Project AI Working Rules

These instructions apply to all AI-assisted work in this repository.

## Core Objective

AI must not stop at code edits alone. Every completed task must leave a clear trace of what changed, why it changed, and how it was verified.

## Required Workflow

1. Read the user's request carefully and identify the smallest correct implementation scope.
2. Inspect the related files before editing.
3. Make focused changes only to the files required by the task.
4. Validate the result after editing.
5. Update the change history before ending the task.
6. If the work changes behavior, structure, styling, data, or logic, the history version must be incremented.

## Change History Rule

All implementation history files must be stored in either `HistoryVersions/Feature/` or `HistoryVersions/Fix/` based on change type.

## System History Rule

If a history update is about AI workflow rules, tool usage policy, or process improvements that are not directly tied to one feature/fix implementation, it must be stored in `HistorySystem/`.

## History-First Planning Rule

Before planning implementation or writing code, AI must review relevant history entries in `HistoryVersions/` to reuse prior context and avoid repeating mistakes.

### Required History Review Steps

1. Identify whether the request is a `Feature` or `Fix` and determine the target scope key.
2. Read all version files for that scope from `.00` through the latest available revision in ascending order.
3. Do not skip earlier versions and do not start from only the latest file.
4. Extract and reuse:
   - previously implemented behavior
   - known limitations
   - validation steps that were already used
   - unresolved follow-up notes
5. Reflect this reused context in the implementation plan before editing.

### Planning Guardrail

- Do not start code edits until relevant history has been reviewed.
- If current scope is `Feature/AuthFlow` and latest history is `Feature-AuthFlow.09`, AI must review `Feature-AuthFlow.00` to `Feature-AuthFlow.09` before planning.
- Do not propose solutions that conflict with previously documented behavior unless the user explicitly requests a change.
- If history and current code differ, mention the mismatch and resolve it with the smallest safe update.

### Naming Format

- Feature work uses `HistoryVersions/Feature/<ScopeKey>/<Feature-<ScopeKey>.YY.md>`.
- Fix work uses `HistoryVersions/Fix/<ScopeKey>/<Fix-<ScopeKey>.YY.md>`.
- The first baseline for any scope is always `.00`.
- Continue follow-up revisions as `.01`, `.02`, `.03`, and so on for the same scope.

### Versioning Policy

- `<ScopeKey>` is a stable scope identifier for a single feature or bugfix thread.
- `YY` is a two-digit revision number for that scope.
- The first completed baseline for a scope is always `.00`.
- Every later update for the same scope increases the revision by `+0.01` in filename form.
- Never overwrite or delete an older history version just to create a newer one.
- A new revision file must preserve the audit trail by summarizing only the new delta and referencing the previous version when useful.

### Scope Correction Rule

- If a feature/fix history was recorded under the wrong scope or wrong type, do not delete or rewrite existing files.
- Create the correct scope folder/history sequence starting at `.00` for the correct target type and scope key.
- Add a short superseded/redirect note in the originally mis-scoped history to point to the corrected location.
- Record the rule/process update in `HistorySystem/` with the next system version.

### New Scope Initialization Rule

- When a new implementation thread starts, AI must create a new scope under either `HistoryVersions/Feature/` or `HistoryVersions/Fix/`.
- The first history file for the new scope must always be `.00`.
- AI must not continue writing a new scope into a previous scope folder.
- If scope identity is unclear, AI must ask for confirmation before creating or updating history files.

### Canonical vs Legacy Organization Rule

- Each scope root (`HistoryVersions/Feature/<ScopeKey>/` or `HistoryVersions/Fix/<ScopeKey>/`) must contain only the canonical history sequence for that scope.
- Mis-scoped or superseded files must be moved into a clearly named legacy subfolder inside the most relevant scope (for example `LegacyFromWrongScope/` or `LegacyFromPreviousRebase/`).
- Do not delete historical records during cleanup; preserve all prior files in legacy folders.
- When a cleanup/reorganization is performed, add a new history note in the affected scope and add a system history entry describing the canonical/legacy boundary.
- Whenever `HistoryVersions/` structure changes (folders moved/renamed, canonical vs legacy layout updates), AI must also update `HistoryVersions/README.md` in the same task.
- Canonical future updates must continue from the latest version file in the scope root, not from files inside legacy folders.

### When History Must Be Updated

Create a new history version file whenever any of the following happens:

- A feature is added.
- A bug is fixed.
- UI or styling is changed.
- Data structure or content is changed.
- File structure is reorganized.
- Validation logic changes.
- Refactoring changes behavior, flow, or maintainability in a meaningful way.

Minor text edits may be grouped into the current task update, but they still require a history entry if they were part of requested work.

## Required History Content

Each new history file should contain, in order:

1. Title with the exact version name.
2. Date in English and Thai if the existing project uses both.
3. Short overview of the task.
4. Reason for the change.
5. File-by-file change summary.
6. Validation or checks performed.
7. Known limitations or follow-up notes, if any.

### Recommended Template

```md
# Feature-<ScopeKey>.YY History

Date: DD Month YYYY (DD <Thai month> YYYY+543)

## Overview

Brief summary of the completed work.

## Reason

Why this update was needed.

## Changes

1. Updated path/to/file
   - What changed
   - Why it changed

2. Added path/to/file
   - What was added

## Validation

- Ran relevant check, test, preview, or manual verification.

## Notes

- Optional follow-up items or known limits.
```

## Problem-Solving Standard

When helping with a task, AI should work in this order:

1. Understand the actual problem before editing.
2. Identify the probable root cause instead of applying surface-only fixes.
3. Explain assumptions briefly when the request is ambiguous.
4. Prefer small, testable changes over broad rewrites.
5. Check whether existing code patterns in the repository should be reused.
6. Confirm the result with a focused verification step.
7. Record the completed work in `HistoryVersions/` under `Feature/` or `Fix/`.

## Redux DevTools Verification Rule

For Redux-related tasks, AI should follow a repeatable verification checklist and document the outcome clearly.

- Use the repository playbook in `.github/AI-Redux-DevTools-Playbook.md` as the default verification flow.
- Verify startup state shape first (students/courses/grades branches and expected counts/fields).
- Verify action-driven updates with real user interactions where possible (add, update/edit, delete).
- If extension panels are unavailable in the current environment, explicitly state the limitation and perform fallback checks (UI state transitions, lint/build, and code-level store shape confirmation).
- AI may add temporary debug dispatch helpers only when necessary for validation and must remove them before final delivery unless the user explicitly asks to keep them.

## Detail and Quality Rules

AI responses and edits should be more detailed when solving problems in this repository.

- Describe what was changed in practical terms, not vague summaries.
- Mention impacted files and behavior clearly.
- Prefer root-cause fixes over temporary patches.
- Keep code style consistent with the surrounding files.
- Avoid unrelated refactors unless they are required to complete the requested work safely.
- If a check cannot be run, state that clearly in the history file and final response.
- If a request affects multiple files, document each touched file in the history.

## Safety and Consistency Rules

- Do not remove previous history files.
- Do not change scope keys or history sequencing without a clear reason.
- Do not skip the history update after completing a task.
- Do not claim validation was performed unless it actually was.
- Do not rewrite large sections of the project when a local fix is enough.

## Practical Repository Convention

For this repository, new implementation histories should use `Feature` or `Fix` scope folders with `.00` as baseline.
Existing assignment-numbered histories are treated as legacy references and must not be deleted.
When touching legacy logic, create or continue the most appropriate `Feature` or `Fix` scope and optionally add a redirect note in legacy files.

System-level updates (rule changes, tool/process updates, AI workflow changes) must be versioned in `HistorySystem/` using the same `SystemX.YY.md` style or another clearly incremental naming format.

## References & Further Reading

### Official React & Redux Docs

- React: Managing State
  https://react.dev/learn/managing-state
- React: Passing Data with Context
  https://react.dev/learn/passing-data-deeply-with-context
- useEffect Hook Reference
  https://react.dev/reference/react/useEffect
- useRef Hook Reference
  https://react.dev/reference/react/useRef
- Built-in React Hooks (All)
  https://react.dev/reference/react/hooks
- Reusing Logic with Custom Hooks
  https://react.dev/learn/reusing-logic-with-custom-hooks
- Rules of Hooks
  https://react.dev/reference/rules/rules-of-hooks
- Redux: Core Concepts
  https://redux.js.org/tutorials/essentials/part-1-overview-concepts
- Redux: Three Principles
  https://redux.js.org/understanding/thinking-in-redux/three-principles
- Why RTK Is How To Use Redux Today
  https://redux.js.org/introduction/why-rtk-is-redux-today
- Redux Toolkit: Getting Started
  https://redux-toolkit.js.org/introduction/getting-started

### APIs & Additional Resources

- Vite: Scaffolding Your First Project
  https://vite.dev/guide/
- REST Countries API Documentation
  https://restcountries.com
- JSONPlaceholder - Free Mock REST API
  https://jsonplaceholder.typicode.com
- MDN: Using Fetch (fetch() reference)
  https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
- MDN: async / await (JavaScript)
  https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises
- Immer.js Documentation
  https://immerjs.github.io/immer/
- Redux DevTools Extension
  https://github.com/reduxjs/redux-devtools
- Kent C. Dodds: Prop Drilling
  https://kentcdodds.com/blog/prop-drilling