# System1.03 History

Date: 13 May 2026 (13 พฤษภาคม 2569)

## Overview

Extended `PROJECT_AI_WORKING_RULES.md` and `CLAUDE.md` with AI-Native Engineering framework covering six new rule domains: machine-understandable architecture, Git history standards, automated testing, technology maintenance monitoring, risk assessment heuristics, and MCP integration.

## Reason

The project needed a deeper governance framework that reflects the paradigm shift from Human-Centric to AI-Native Engineering. The new rules address:
- How AI reads and updates architecture context before and after every task
- Conventional Commits adoption so both humans and AI can understand change history
- Testing principles that favour self-healing and root-cause analysis over brittle scripted checks
- A systematic process for monitoring dependency updates and detecting breaking changes
- A quantifiable risk model for project health assessment
- Clear boundaries for when and how MCP tools may be used autonomously vs. with approval

## Changes

### 1. `PROJECT_AI_WORKING_RULES.md`

Six new horizontal-rule-delimited sections added before the existing **References** section:

**AI-Native Engineering Principles**
- Defines Machine-Understandability as a primary design concern.
- Requires `docs/architecture.mermaid` and `tasks/` directory conventions.
- Adds a rule-category table (Architecture, Coding Standards, Security, Complexity).
- Specifies a strict five-step workflow order for every AI-assisted task.

**Git History Standards**
- Mandates Conventional Commits format (`feat`, `fix`, `chore`, etc.).
- Separates AI responsibility (draft *what*) from developer responsibility (add *why*).
- Defines PR summary requirements: plain-language overview, breaking-change identification, coupling-risk flagging, docs/test coverage check.
- Provides a six-item AI code-review checklist.

**Automated Testing Standards**
- Self-healing principles: semantic selectors, root-cause analysis before locator patches.
- Three required test levels: unit, integration, smoke.
- Visual regression guideline: record expected layout in history when UI/styling changes.

**Technology Maintenance Monitoring**
- Signal sources: GitHub release pages, framework changelogs.
- Relevance filtering: check direct deps, scan for breaking-change labels/phrases, compare against codebase.
- Breaking-change detection signals: naming patterns and phrase patterns to watch.
- Standardised impact analysis output format with risk level rating.

**Risk Assessment Heuristics**
- Observable-signals table with four factors and their weights.
- Risk formula:
  `Risk_Total = α(T_overdue) + β(C_structural) + γ(R_bottleneck) − δ(V_historical)`
- Three conditions that require a risk note in the history file.

**MCP (Model Context Protocol) Integration**
- Use-case table: codebase navigation, security scanning, error monitoring, task management.
- Three MCP rules: treat as capability extension; log all automated actions; no auto-push/merge without explicit developer approval.

### 2. `CLAUDE.md`

Added **AI-Native Engineering additions (System1.03)** subsection inside the *AI Working Rules* section. Lists all six new rule domains with one-line summaries so they are immediately visible to Claude Code on session start.

## Validation

- `PROJECT_AI_WORKING_RULES.md`: reviewed full document after edit; all six sections present with correct headings and formatting; References section unchanged and still at end of file.
- `CLAUDE.md`: new subsection appears inside the correct parent section; no existing content removed.
- No source code files were touched; lint and build state is unchanged.

## Notes

- `docs/architecture.mermaid` and `tasks/` directory do not yet exist in the repository. They should be created as part of the next structural feature task.
- The risk formula weights (α, β, γ, δ) are placeholders; tune them once baseline delivery metrics are available.
- Future MCP-specific tooling decisions should reference this entry and increment to `System1.04`.
