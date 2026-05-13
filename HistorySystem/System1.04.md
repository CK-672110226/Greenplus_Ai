# System1.04 — Agent & Skill Selection Rules Added

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview
Added a new rule section "Agent & Skill Selection Rules" to `PROJECT_AI_WORKING_RULES.md` to govern how AI chooses the correct sub-agent type and skill command for each task category.

## Reason
User instruction: "อย่าลืมให้สกิลให้ถูกกับงานด้วยนะ" — AI must use the appropriate specialized agent (Explore, Plan, general-purpose, claude-code-guide, etc.) rather than defaulting to generic tools or Bash for every task. Rules need to be codified so they persist across sessions.

## Changes

### `PROJECT_AI_WORKING_RULES.md`
- Added section **Agent & Skill Selection Rules** with:
  - Agent Selection Table (6 agent types mapped to task categories)
  - 5 Mandatory Selection Rules (Explore for lookups, Plan before multi-file changes, parallel spawning, no duplicate work, background for non-blocking)
  - Skill Command Selection rules (only use listed skills, resume via SendMessage before spawning new)
  - Anti-Patterns to Avoid (4 common mistakes)

## Validation
- File parses correctly (Markdown, no broken tables)
- Rules are consistent with Claude Code agent type descriptions in the system environment

## Notes
- These rules complement System1.03 (AI-Native Engineering Principles) which established Mermaid architecture docs and git standards.
- The autonomous git workflow authorization ("จัดการเรื่องcicdเองเลย") is captured in `memory/feedback_commit_approval.md`, not here, because it is session-scoped user feedback rather than a project-level process rule.
