# GreenPlus Ai — UX Research Report

> Generated: 19 May 2026 (19 พฤษภาคม 2569)  
> Scope: All three roles — User (recycler), Buyer (junk shop), Admin  
> Method: Synthesised from product docs, user-flow.md, design-spec.md, FEATURE_STATUS.md, and codebase analysis

---

## Part 1 — Personas

---

### Persona A — Anan "The Daily Recycler"
**Role:** `user`

| | |
|---|---|
| **Age** | 28 |
| **Occupation** | Freelance graphic designer |
| **Location** | Nimman area, Chiang Mai |
| **Device** | iPhone 13, occasionally laptop |
| **Language** | Thai primary, reads English |
| **Tech proficiency** | High — uses Line, Grab, GrabFood daily |

**Quote:** *"ฉันรู้ว่าขยะมีราคา แต่ไม่รู้ว่าเท่าไหร่ และไม่รู้จะเอาไปขายที่ไหน"*  
("I know trash has value, but I don't know how much — or where to sell it.")

**Motivations:**
- Extra income from items they'd otherwise throw away
- Environmental identity — sees recycling as a lifestyle signal, not a chore
- Convenience: Grab-style on-demand > planned trips to shops

**Behaviours:**
- Accumulates recyclables at home for 1–2 weeks before acting
- Scans 3–6 items per session, mostly PET bottles and cardboard
- Checks eco-points tier the way they check a fitness app streak
- Shares "impact" stats on Instagram Stories

**Frustrations:**
- Camera takes too long to give a result — uncertainty kills momentum
- Doesn't trust the weight estimate — wants to key in actual weight
- Unclear what "Grade A/B/C" means in practice
- Route planner feels complex for a single-shop trip

**Jobs to be done:**
1. *When I have a bag of bottles*, I want to know instantly what they're worth *so I can decide if it's worth the trip.*
2. *When I'm ready to sell*, I want the nearest buyer to come to me *so I don't have to carry it far.*
3. *After selling*, I want to see my environmental impact *so I feel the act was meaningful.*

**Design implications:**
- Speed is everything in the scan flow — result must appear < 2 s
- Weight input must be editable before adding to basket (not just post-scan)
- Grade explanation tooltip (tap [A] → "Grade A = clean, undamaged, full price")
- "Call a rider" as the primary basket CTA, not "Find route"
- Eco-points dashboard needs social share hook

---

### Persona B — Somchai "The Junk Shop Operator"
**Role:** `buyer`

| | |
|---|---|
| **Age** | 52 |
| **Occupation** | Owner, Somchai Scrap Yard, Hang Dong |
| **Device** | Android mid-range, uses Line primarily |
| **Language** | Thai only |
| **Tech proficiency** | Low — manages everything via Line chats and paper ledgers |
| **Business size** | Solo + 1 part-time helper, 30–80 transactions/week |

**Quote:** *"ผมรับซื้อมา 20 ปีแล้ว ราคามันขึ้นลงทุกวัน ถ้าแอพช่วยจัดการได้ก็ดี"*  
("I've been doing this 20 years. Prices change daily. If the app can manage it, great.")

**Motivations:**
- More volume with less phone-tag (currently fields 40+ Line messages/day)
- Predictable supply — knows what's coming, can plan truck runs
- Better prices visibility → competitive advantage vs neighbouring shops

**Behaviours:**
- Opens app on the shop tablet (desktop view) once in the morning
- Needs to accept/reject bookings fast — decision takes < 5 seconds
- Updates pricing weekly, sometimes daily when scrap market moves
- Distrusts automation — always wants to verify the actual weight himself

**Frustrations:**
- Dashboard KPIs use THB figures he can't reconcile with his paper ledger
- Booking list has no time-grouped view — he thinks in terms of "morning haul"
- Pricing page doesn't save to his account — reboots reset everything
- No way to block certain materials temporarily ("กระดาษเต็มคลังแล้ว")

**Jobs to be done:**
1. *When a seller books a pickup*, I want to see what they have and when *so I can accept or pass quickly.*
2. *When scrap prices change*, I want to update my buy-rates in one place *so every seller sees the new price immediately.*
3. *When my yard is full of cardboard*, I want to pause that material *without calling everyone.*

**Design implications:**
- Dashboard must be usable in < 60 s/session — cut anything non-essential
- Booking rows need time grouping ("Today AM / Today PM / Tomorrow")
- PricingPage save must persist to `shop_pricing` in Supabase (currently broken — P2 gap)
- Add "Pause material" toggle per row in pricing grid
- Revenue KPI must show actual data, not `totalKg × 10` formula

---

### Persona C — Pla "The Platform Admin"
**Role:** `admin`

| | |
|---|---|
| **Age** | 34 |
| **Occupation** | GreenPlus operations team, Chiang Mai |
| **Device** | MacBook Pro, Chrome |
| **Language** | Thai + English |
| **Tech proficiency** | High — comfortable with SQL, spreadsheets, basic ML concepts |

**Quote:** *"ฉันต้องอนุมัติร้านใหม่ ดู misidentification reports แล้วก็ training model ใหม่ ทุกอาทิตย์"*  
("I approve new shops, review misidentification reports, and retrain the model — every week.")

**Motivations:**
- Catch bad actors early (fake shops, troll scans)
- Keep AI accuracy high — bad scans erode user trust
- Understand which districts need more shop coverage

**Behaviours:**
- Logs in Monday mornings to batch-approve/reject shop applications
- Reviews flagged marketplace posts weekly
- Uses AI Studio quarterly for model retraining
- Wants a district-level map view, not a raw table

**Frustrations:**
- Shop approval has no notes field — can't record why a shop was rejected
- Heatmap is a placeholder — has to query Supabase directly to see density
- AI Config tab feels like a dev tool, not a product interface
- No audit log — can't see who changed what

**Jobs to be done:**
1. *When a new shop applies*, I want to see their details and approve/reject with a note *so we have a record.*
2. *When AI misidentifications spike*, I want to see which class is failing *so I can prioritise training data.*
3. *When coverage is thin in a district*, I want to see it on a map *so I can recruit shops in that area.*

**Design implications:**
- Shop approval: add "Reason" textarea before rejection confirm
- Heatmap must be real (P3 gap) — aggregated scan_history by district
- Admin page needs an audit log tab (who approved/rejected/flagged, timestamp)
- AI Studio: surface per-class accuracy metrics alongside upload counts
- Error reporting: misidentification reports need a "class breakdown" chart

---

## Part 2 — Customer Journey Maps

---

### Journey 1 — Anan: First-Time Scan to Booking (User role)

**Scenario:** Anan has a bag of recyclables, opens the app for the first time.

```
Stage          │ Thinking                        │ Feeling   │ Touchpoint       │ Pain / Gap
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
Discovery      │ "Recycling app? Let me try."    │ Curious   │ App store / word │ —
               │                                 │           │ of mouth         │
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
Onboarding /   │ "User or Buyer — what am I?"    │ Slightly  │ LandingPage      │ ⚠ Cards don't explain the
Landing        │ Picks User, goes to login.      │ confused  │ /login?role=user │   difference well enough
               │ Signs up with Google (fast).    │ → relieved│                  │
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
First Scan     │ "Allow camera? OK."             │ Expectant │ /scan            │ ⚠ No tutorial overlay — what
               │ Points at a PET bottle.         │           │                  │   do the corner brackets mean?
               │ "ANALYZING… is it thinking?"    │ Anxious   │                  │ ❌ Stage indicator missing
               │ Result: PET · Grade A · ฿16    │ Surprised │ Result card      │ ❌ No grade explanation tooltip
               │ "Grade A? Is that good?"        │ uncertain │                  │ ❌ Weight 0.8kg — did it weigh it?
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
Basket         │ "3 items — ฿69 total."          │ Pleased   │ /basket          │ ⚠ No indication if that's
               │ "Use my location? Sure."        │           │                  │   a good price or not
               │ "Single shop vs multi-stop?"    │ Confused  │ Route options    │ ⚠ "Multi-stop" needs more
               │ Picks multi-stop (best ฿).      │           │                  │   explanation for first-timers
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
Booking        │ "Book pickup — confirm."        │ Confident │ Modal → toast    │ ❌ No booking confirmation
               │ "What happens now?"             │ Wondering │                  │   screen / next-steps explainer
               │ No rider status visible.        │ Deflated  │ —                │ ❌ UserTrackingPanel not shown
               │                                 │           │                  │   until status = searching
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
Post-booking   │ "Did I earn eco-points?"        │ Curious   │ /home or         │ ❌ No post-sale eco-points
               │ Goes to Profile.                │           │ /eco-points      │   animation or prompt
               │ "Gold tier — 2,480 pts!"        │ Satisfied │                  │ ⚠ EcoPoints page was deleted —
               │                                 │           │                  │   now only accessible via Profile
```

**Key moments of truth:**
1. **Scan result** — if it takes > 3 s or looks wrong, trust is lost forever
2. **Booking confirmation** — the gap between "Book" and "rider coming" is a black hole
3. **Post-sale reward** — eco-points need to surface immediately after completion

**Opportunity matrix:**

| Opportunity | Impact | Effort |
|---|---|---|
| Grade tooltip on [A]/[B]/[C] tag | High | Low |
| Post-booking "what next" explainer screen | High | Low |
| Eco-points earned animation after scan | Medium | Medium |
| First-scan tutorial overlay | Medium | Medium |
| Real-time rider tracking on basket page | High | High |

---

### Journey 2 — Somchai: Morning Booking Review (Buyer role)

**Scenario:** Somchai opens the app at 8 AM to review overnight bookings before his shop opens.

```
Stage          │ Thinking                        │ Feeling   │ Touchpoint       │ Pain / Gap
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
Login          │ Opens tablet. Logs in.          │ Routine   │ /login?role=buyer│ —
               │ Auto-redirects to /dashboard.   │ Expected  │ /dashboard       │
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
Dashboard      │ "3 pending, 1 accepted."        │ Alert     │ KPI cards        │ ⚠ Revenue KPI = totalKg×10
               │ "฿4,820 revenue… seems off."    │ Sceptical │                  │   formula, not real data
               │ "Let me check bookings."        │           │ Bookings tab     │
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
Booking review │ Scans booking list.             │ Focused   │ BookingRow       │ ⚠ No time-grouped view —
               │ "Anan W. — PET + paper, 2.5kg."│           │                  │   all bookings in one flat list
               │ "14:00–15:00 — that works."    │ OK        │                  │ ❌ No "today AM / PM" grouping
               │ Taps Accept.                    │ Satisfied │ Toast            │ ✅ This works
               │ "Café Linh — cardboard 18kg."  │ Hesitant  │                  │ ❌ No way to pause cardboard —
               │ "My yard is full. Reject?"      │ Reluctant │                  │   rejection is blunt instrument
               │ Rejects with no reason input.   │ Guilty    │                  │ ❌ No rejection reason field
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
Pricing update │ "Aluminium went up — update."  │ Motivated │ Pricing tab      │ ❌ Save doesn't persist to DB
               │ Changes Al Grade A from 40→45. │           │                  │   (P2 gap — only localStorage)
               │ Reloads page accidentally.      │ Frustrated│                  │ ❌ All changes lost on reload
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
End of session │ Opens Line to notify sellers   │ Resigned  │ Line app         │ ❌ No in-app messaging —
               │ about updated price.            │           │                  │   has to leave the app
               │ Total session: 12 min.          │           │                  │ Target: < 3 min
```

**Critical failure point: pricing data loss.** This is the single most damaging gap for Buyer retention. A shop owner who loses pricing data twice will abandon the app.

**Opportunity matrix:**

| Opportunity | Impact | Effort |
|---|---|---|
| PricingPage → Supabase persist (P2 task) | Critical | Medium |
| Booking list: time grouping (AM/PM/Tomorrow) | High | Low |
| Reject booking: reason field + template options | High | Low |
| "Pause material" toggle in pricing grid | High | Medium |
| In-app chat for seller communication | Medium | High |

---

### Journey 3 — Pla: Weekly Admin Review (Admin role)

**Scenario:** Monday morning, reviewing the week's queue.

```
Stage          │ Thinking                        │ Feeling   │ Touchpoint       │ Pain / Gap
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
Login          │ /x/admin (hidden route)         │ Routine   │ AdminLoginPage   │ ✅ Works
               │ Dark bg — "admin mode"          │ Alert     │ /admin           │
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
Shop approvals │ "2 pending shops."              │ Focused   │ Shops tab        │ ⚠ Can't see shop details beyond
               │ Wants to see location, owner.   │           │                  │   name + owner
               │ Approves shop #1.               │ OK        │                  │ ❌ No rejection reason field
               │ Rejects shop #2 — no record.    │ Uneasy    │                  │ ❌ No audit trail
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
Heatmap        │ "Where are the scan clusters?"  │ Curious   │ Heatmap tab      │ ❌ Placeholder — no real data
               │ Tab is empty / placeholder.     │ Deflated  │                  │   Forces SQL query externally
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
Misid reports  │ "Which class is failing most?"  │ Analytical│ Reports sub-tab  │ ⚠ Flat list, no class breakdown
               │ Scrolls through list.           │           │                  │   chart
───────────────┼─────────────────────────────────┼───────────┼──────────────────┼─────────────────────────────────
AI Studio      │ Quarterly retraining.           │ Focused   │ AI Studio tab    │ ⚠ No per-class accuracy shown
               │ Uploads images per class.       │           │                  │ ⚠ Training progress bar is
               │ Trains, deploys.                │ Relieved  │                  │   simulated, not real
```

**Opportunity matrix:**

| Opportunity | Impact | Effort |
|---|---|---|
| Real heatmap from scan_history aggregate | High | Medium |
| Shop detail view in approval panel | High | Low |
| Rejection reason field + audit log | High | Medium |
| Misidentification: class breakdown chart | Medium | Medium |
| AI Studio: show per-class sample count vs minimum | Medium | Low |

---

## Part 3 — Usability Audit

Scored against **Nielsen's 10 Heuristics**, cross-referenced with design-spec.md and FEATURE_STATUS.md.

Scale: 0 = violation, 1 = partial, 2 = satisfies

---

### H1 — Visibility of System Status

| Page | Score | Finding |
|------|-------|---------|
| ScanPage — analyzing phase | 1/2 | "ANALYZING…" overlay exists but no stage indicator chip ("stage 1 of 2"). User doesn't know how many steps remain. |
| BasketPage — after booking | 0/2 | After tapping "Book pickup", a toast fires then nothing. No UserTrackingPanel unless status = searching. The gap between book and confirmation is invisible. |
| PricingPage — save | 0/2 | Save only writes to localStorage. No visual confirmation that data persisted. User has no idea if their price change took effect for sellers. |
| DashboardPage — KPI cards | 1/2 | Cards show counts but revenue uses a hardcoded formula. No "as of" timestamp. |
| NotificationsPage | 0/2 | Notifications are Redux-only. No realtime push. Badge count can be stale. |

**Aggregate: 2/10 — Critical violations on the two most important user-facing state transitions (scan result and booking confirmation).**

---

### H2 — Match Between System and Real World

| Page | Score | Finding |
|------|-------|---------|
| GradeTag [A][B][C] | 0/2 | Grade labels mean nothing without explanation. Users from non-recycling backgrounds (most users) need a tooltip or legend. |
| "Multi-stop · best" | 1/2 | Label exists but no explanation of what multi-stop means or the tradeoffs (longer distance, higher value). |
| "Impact pts" | 1/2 | Eco-points are gamification; the link between kg recycled and pts earned is never shown. |
| Basket "Skip" | 1/2 | "Skip" for an item in the basket is non-standard. "Exclude from route" or just a toggle would be clearer. |
| Booking status "searching" | 0/2 | Status label is internal vocabulary. Users don't know "searching" means "we're finding a rider". |

**Aggregate: 3/10 — Terminology throughout is technical/internal, not user language.**

---

### H3 — User Control and Freedom

| Page | Score | Finding |
|------|-------|---------|
| ScanPage — wrong result | 1/2 | "Scan Again" exists but requires confirming the current result first. Swipe to discard exists. |
| BasketPage — clear basket | 2/2 | Ghost "Clear basket" button present. |
| Booking — cancel after accept | 0/2 | No in-app cancel flow once booking is accepted. User must contact shop via Line. |
| Scan — undo "Add to basket" | 0/2 | No undo. Once added, must go to basket and remove manually. |

**Aggregate: 3/8 — Key recovery paths missing (booking cancel, scan undo).**

---

### H4 — Consistency and Standards

| Finding | Severity |
|---------|----------|
| BottomTabBar active state: some tabs use green pill, others use text colour only | Medium |
| Booking confirm uses modal; scan confirm uses swipe card — inconsistent confirmation patterns | Medium |
| "Book pickup" CTA: appears on BasketPage, MapPage popup, and (planned) RiderDashboard — different labels in each | High |
| Grade filter tabs (Marketplace) and booking status filter (Dashboard) look different despite same function | Low |
| Error states: some use orange border, some use toast, some use banner — no consistent error pattern | High |

---

### H5 — Error Prevention

| Finding | Severity |
|---------|----------|
| No weight input validation minimum (0.01kg) — user can add 0.0kg item to basket | High |
| PricingPage: no "unsaved changes" warning before navigating away | High |
| DeleteAccount (SettingsPage): no double-confirm step (soft-delete calls supabase.auth.signOut immediately) | Critical |
| Scan report form: no character limit on description field | Low |
| Booking: no check if shop is open before allowing book | Medium |

---

### H6 — Recognition Over Recall

| Finding | Severity |
|---------|----------|
| Material names shown in Thai OR English depending on language setting — never bilingual in scan result | Medium |
| Route planner: shop names in route but no address or distance in the booking confirmation | High |
| Grade explanation: must be recalled from previous experience — no inline reminder | High |

---

### H7 — Flexibility and Efficiency of Use

| Finding | Severity |
|---------|----------|
| No keyboard shortcuts anywhere (admin power users) | Low |
| Pricing grid has no "copy row to all grades" shortcut — setting 3 prices per material × 8 materials = 24 taps | High |
| Scan: no batch mode "scan all items in bag" — must scan one at a time | Medium |
| Basket: weight must be edited per-item; no "I weighed the whole bag" input | Medium |

---

### H8 — Aesthetic and Minimalist Design

| Finding | Severity |
|---------|----------|
| ✅ Design spec (neo-brutalist, ink borders, hatch charts) is coherent and distinctive | — |
| DashboardPage booking rows: 7+ data points per row — scannability breaks on mobile | Medium |
| AdminPage: 5 tabs × multiple sub-sections — cognitive load high for infrequent users | Medium |
| ScanPage result card: price formula (0.82kg × ฿24/kg × 1.00 = ฿22.10) shown but user just wants the number | Low |

---

### H9 — Help Users Recognize, Diagnose, Recover from Errors

| Finding | Severity |
|---------|----------|
| Camera denied: error message exists ✅ | — |
| Supabase network errors: currently surface as unhandled promise rejections or silent fails | Critical |
| Scan "troll" overlay: orange warning but no actionable recovery — user doesn't know what to do | High |
| Login errors: email/password wrong → orange border ✅, but "Email not confirmed" requires knowing to look for resend link | Medium |

---

### H10 — Help and Documentation

| Finding | Severity |
|---------|----------|
| No onboarding tutorial (first-scan overlay) | High |
| No FAQ or help screen accessible from any page | High |
| No tooltips on technical elements (grades, eco-point formula, route algorithm) | High |
| Profile page has "Help & FAQ → support@greenplus.ai" link in design spec, not yet implemented | Medium |

---

### Heuristic Audit Summary

| Heuristic | Score /10 | Priority |
|---|---|---|
| H1 Visibility of system status | 2 | P1 |
| H2 Real-world match | 3 | P1 |
| H3 User control | 3 | P2 |
| H4 Consistency | 5 | P2 |
| H5 Error prevention | 4 | P1 |
| H6 Recognition | 4 | P2 |
| H7 Efficiency | 5 | P3 |
| H8 Minimalism | 7 | P3 |
| H9 Error recovery | 3 | P1 |
| H10 Help | 1 | P2 |
| **Overall** | **3.7/10** | |

---

## Part 4 — Research Synthesis & Prioritised Opportunities

### Insight clusters

**Cluster A — Trust gap in the scan flow**  
Users don't know if the AI is right. Grade labels are opaque. Weight is estimated, not measured. The result card needs a trust layer: grade tooltip, confidence indicator framed as human language ("Very confident"), and weight editability before adding.

**Cluster B — Post-action black holes**  
Two critical dead-ends: after booking (no tracking visible), and after pricing save (no persistence confirmation). Users complete an action and don't know if it worked. Both erode confidence in the product.

**Cluster C — Buyer data fidelity**  
The Buyer persona's biggest pain is data loss. PricingPage doesn't persist to Supabase (P2 gap). Revenue KPIs use a fake formula. Bookings have no time structure. Fixing these three would transform the buyer experience from "app I have to use" to "app I want to use."

**Cluster D — Missing vocabulary layer**  
"Grade A/B/C", "Multi-stop", "searching", "impact pts", "Skip" — none of these terms match how users think. The app needs a thin vocabulary layer (tooltips, label rewrites, status messages in plain Thai/English).

**Cluster E — Missing recovery paths**  
No undo for adding to basket. No cancel after booking is accepted. No "unsaved changes" warning before navigating away from pricing. DeleteAccount with no confirmation. These are liability-level gaps.

---

### Prioritised opportunity backlog

| # | Opportunity | Persona | Cluster | Impact | Effort | Priority |
|---|---|---|---|---|---|---|
| U1 | PricingPage → persist to Supabase (P2 task #5) | Buyer | B, C | Critical | Medium | P1 |
| U2 | Post-booking status: show UserTrackingPanel immediately on basket page after any booking | User | B | High | Low | P1 |
| U3 | Grade tooltip on GradeTag — tap [A] → bottom sheet explaining grade | User | D | High | Low | P1 |
| U4 | Scan result: make weight field editable inline before "Add to basket" | User | A | High | Low | P1 |
| U5 | Booking rejection: reason field + preset options (full yard, material paused, etc.) | Buyer | C, E | High | Low | P1 |
| U6 | Booking list: time grouping "Today AM / Today PM / Tomorrow / Later" | Buyer | C | High | Low | P1 |
| U7 | "Pause material" toggle in pricing grid — pauses that material from new bookings | Buyer | C | High | Medium | P1 |
| U8 | Real heatmap from scan_history (P3 task #7) | Admin | — | High | Medium | P2 |
| U9 | Error recovery: all Supabase calls need try/catch → toast with retry action | All | E | High | Medium | P2 |
| U10 | DeleteAccount: two-step confirmation modal + 7-day grace period message | User | E | High | Low | P2 |
| U11 | Shop approval: detail panel (address, materials, owner contact) before approve/reject | Admin | — | High | Low | P2 |
| U12 | Scan flow: first-time tutorial overlay (4 steps: point → tap → result → add) | User | D | Medium | Medium | P2 |
| U13 | Revenue KPI: real calculation from `bookings.actual_value` | Buyer | C | Medium | Low | P2 |
| U14 | Notifications: Supabase Realtime push (P3 task #6) | All | B | Medium | High | P3 |
| U15 | Basket "Skip" → rename to "Exclude from pickup" | User | D | Medium | Low | P3 |
| U16 | Eco-points earned animation after scan completes | User | — | Medium | Medium | P3 |
| U17 | Pricing grid: "copy A price to B/C with % discount" shortcut | Buyer | — | Medium | Low | P3 |
| U18 | LandingPage stats bar: total kg recycled + active shops (P3 task #9) | All | B | Low | Medium | P4 |
| U19 | Misidentification reports: class breakdown chart in admin | Admin | — | Low | Medium | P4 |
| U20 | In-app chat between seller and buyer (M8, already planned) | All | — | Medium | High | P4 |

---

### Top 5 quick wins (high impact, low effort)

1. **U3** — Grade tooltip: one component change, immediate trust improvement for all users
2. **U6** — Booking time grouping: one `groupBy` utility + UI change, transforms buyer daily flow
3. **U5** — Rejection reason: adds a textarea + 3 preset chips to an existing modal
4. **U4** — Editable weight in scan result: one controlled input in the result card
5. **U10** — DeleteAccount two-step: prevents the most catastrophic irreversible action

### The one thing that must ship this sprint

**U1 — PricingPage Supabase persistence.**  
It is the single gap that undermines Buyer trust in the entire product. Every other buyer improvement is hollow if their pricing data evaporates on page reload.

---

## Appendix — Feature gaps referenced in audit (from FEATURE_STATUS.md)

| ID | Gap | Status |
|---|---|---|
| P2-4 | Buyer openDays + acceptedMaterials → Supabase | ❌ not persisted |
| P2-5 | PricingPage → INSERT/UPDATE shop_pricing | ❌ not built |
| P3-6 | Notifications — Supabase Realtime | ❌ not built |
| P3-7 | Heatmap — aggregate scan_history by district | 🔴 placeholder |
| P3-8 | Shop approval workflow in AdminPage | ⚠️ UI + toast only |
| P4-10 | Forgot password flow | 🔴 no handler |
| P4-11 | Admin profile stats (not hardcoded 0) | 🔴 hardcoded |
| P4-12 | Settings notification prefs persist | 🔴 no persist |
