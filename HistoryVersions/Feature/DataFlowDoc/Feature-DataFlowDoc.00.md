# Feature-DataFlowDoc.00

**Date:** 14 May 2026 (14 พฤษภาคม 2569)

## Overview

Created architecture and data flow documentation using Mermaid diagrams, as required by the AI-Native Engineering Principles in CLAUDE.md.

## Reason

Data engineers need a clear map of tables, relationships, and which pipelines are built vs missing. Mermaid diagrams are version-controlled alongside code.

## Changes

### `docs/architecture.mermaid` (new)
- C4 System Context: all actors, the React SPA, and all external services

### `docs/DATA_FLOW.md` (new)
8 embedded Mermaid diagrams:
1. **ERD** — All 11 Supabase tables with columns and FK relationships
2. **AI Inference Pipeline** — ONNX → Vertex AI fallback, grade assignment, anti-troll filter, scan_history insert
3. **Scan → Basket → Booking Sequence** — Full actor sequence diagram from camera tap to buyer dashboard
4. **Booking State Machine** — pending/accepted/rejected/completed/cancelled with side effects (eco_points, scan_history confirmation)
5. **Pricing Data Flow** — waste_items base price → shop_pricing averages → user-facing prices in basket/scan/home
6. **Frontend Architecture** — Pages, layouts, hooks, Redux slices and their connections
7. **Data Engineer Work Breakdown** — ✅ Ready / ⚠️ Partial / 🔴 Not built yet — clear TODO list
8. **RLS Policy Map** — Who (user/buyer/admin/public) can read/write each table

## Validation

All `.mermaid` and embedded code blocks render correctly on GitHub Markdown preview.

## Notes

- Diagram 7 (Work Breakdown) is the key handoff to data engineers — shows eco_point_ledger automation, heatmap aggregate query, realtime notifications, and model_deployments are the four remaining gaps
