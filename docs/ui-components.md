# GreenPlus Ai — UI Component Reference

> Design system guide for Claude Code. Read this before writing any UI code.

---

## Design Tokens

All tokens are CSS custom properties declared in `src/index.css`.  
**Never use raw hex values in JSX — always reference a token.**

### Color

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--ink` | `#1A1A1A` | `#FAFAF7` | Primary text, borders |
| `--ink-2` | `#3A3A3A` | `#D8D8D0` | Secondary text |
| `--ink-3` | `#7A7A7A` | `#9A9A92` | Muted labels, hints |
| `--ink-4` | `#B8B8B8` | `#4A4A48` | Dividers, ghost borders |
| `--paper` | `#FAFAF7` | `#151512` | Page background |
| `--paper-2` | `#F1EFE8` | `#1E1E1A` | Card / surface background |
| `--green` | `#22C55E` | `#22C55E` | CTA, active state, success |
| `--green-soft` | `rgba(34,197,94,.14)` | `rgba(34,197,94,.18)` | Active tab bg, subtle highlight |
| `--green-ink` | `#0F7A3A` | `#4ADE80` | Green text on light surface |
| `--orange` | `#F59E0B` | `#FBBF24` | Warning, troll/error state |
| `--blue` | `#5BC0BE` | `#5BC0BE` | Accent (rarely used) |

> ⚠️ Only 4 ink levels exist: `--ink`, `--ink-2`, `--ink-3`, `--ink-4`. There is **no** `--ink-5` or `--ink-6`.

### Typography

| Token | Fonts | Usage |
|-------|-------|-------|
| `font-brand` | Architects Daughter, Mitr | Logo, page headings (`<h1>`) |
| `font-body` | Caveat, Sarabun | Body text, buttons, paragraphs |
| `font-data` | JetBrains Mono, IBM Plex Sans Thai | Labels, badges, metrics, codes |

**Common font sizes:**

| Size | Usage |
|------|-------|
| `text-[28px]` | Page `<h1>` |
| `text-[17px]` | Button, body default |
| `text-[15px]–text-[16px]` | Secondary body |
| `text-[13px]–text-[14px]` | Data values |
| `text-[11px]–text-[12px]` | Uppercase tracking labels |
| `text-[10px]` | Legend, footnotes |

### Borders & Shadows

All interactive surfaces use the "neo-brutalist" pattern:

```
border-[1.5px] border-[var(--ink)]
shadow-[2px_2px_0_var(--ink)]
```

Active/pressed state removes shadow and translates:

```
active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
```

---

## Components

### `<Button>`

**File:** `src/components/Button.jsx`

```jsx
<Button
  variant="primary"      // 'primary' | 'secondary' | 'ghost'
  onClick={fn}
  type="button"          // 'button' | 'submit'
  fullWidth={false}      // true → w-full
  disabled={false}
>
  Label
</Button>
```

| Variant | Background | Text |
|---------|-----------|------|
| `primary` | `--green` | `#062040` (dark navy) |
| `secondary` | `--paper` | `--ink` |
| `ghost` | transparent | `--ink` (no border, no shadow) |

All variants share: `font-body text-[17px]`, 1.5px ink border, 2px ink drop-shadow, active press animation.

---

### `<Card>`

**File:** `src/components/Card.jsx`

```jsx
<Card className="flex flex-col gap-3" onClick={fn}>
  {children}
</Card>
```

- Background: `--paper-2`
- Border: `1.5px var(--ink)`
- Shadow: `2px 2px 0 var(--ink)`
- Padding: `p-5` (20px)
- Pass additional classes via `className` (they are appended, not merged)
- `onClick` is optional — use for clickable cards

---

### `<GradeTag>`

**File:** `src/components/GradeTag.jsx`

```jsx
<GradeTag grade="A" />   // 'A' | 'B' | 'C'
```

| Grade | Background | Text |
|-------|-----------|------|
| A | `#22C55E` (green) | `#062040` |
| B | `#FFF3A8` (yellow) | `#5A4A1A` |
| C | `#FFFFFF` (white) | `#7A7A7A` |

All grades: `font-data text-[11px] font-bold`, 1.5px ink border, inline-flex.

---

### `<NavBar>`

**File:** `src/components/NavBar.jsx`

Renders the desktop top navigation bar. **Only used in the default (unauthenticated / admin fallback) shell** — `UserLayout` and `BuyerLayout` have their own navigation.

- Logo: `font-brand text-[22px]`, links to `/`
- Nav links: `font-body text-[16px]`, visible links depend on `profile.role`
  - `user` → Scan, Basket, Map, Marketplace, Eco-Points
  - `buyer` → Dashboard, Marketplace
  - `admin` → Admin
- Language toggle: EN ↔ TH button, dispatches `setLanguage`
- Logout: calls `supabase.auth.signOut()` + dispatches `clearUser()`
- Internal `NavLink` subcomponent wraps React Router `<Link>` with hover green style

---

### `<ProtectedRoute>`

**File:** `src/components/ProtectedRoute.jsx`

```jsx
<ProtectedRoute requiredRole="user">
  <SomePage />
</ProtectedRoute>
```

- `loading` → renders `null` (prevents flash)
- `!session` → redirects to `/login`
- `requiredRole` mismatch → redirects to `/`
- Valid session + matching role → renders `children`

---

## Layout Components

### `<SmartLayout>`

**File:** `src/layouts/SmartLayout.jsx`

Route-level layout that selects shell based on Redux `profile.role`:

| Role | Shell |
|------|-------|
| `user` | `<UserLayout>` |
| `buyer` | `<BuyerLayout>` |
| `null` / `admin` | Default shell: `<NavBar>` + `<Outlet>` |

Used as the single layout route wrapping all routes in `App.jsx`.

---

### `<UserLayout>`

**File:** `src/layouts/UserLayout.jsx`

Shopee-like mobile-first shell for `role === 'user'`.

- **TopBar** (sticky): logo button → `/home`, language toggle, basket icon badge
- **Content**: `<Outlet>` inside `<main className="flex-1 pb-[68px]">` (clears bottom tab)
- **BottomTabBar** (fixed, 68px): 5 tabs — Home, Scan, Basket, Map, Profile
  - Active tab: `--green` fill + `--green-soft` bg
  - Badge: count of non-skipped basket items

---

### `<BuyerLayout>`

**File:** `src/layouts/BuyerLayout.jsx`

Industrial sidebar layout for `role === 'buyer'`.

- **Desktop (md+):** 200px fixed left sidebar — role badge, green left-border on active link, lang toggle, logout
- **Mobile:** sticky TopBar + horizontal scrollable nav strip
- Content: `<Outlet>` in main content area

---

## Design Patterns

### Uppercase label pattern

Used everywhere for section labels, metadata keys, stats:

```jsx
<span className="font-data text-[11px] text-[var(--ink-3)] uppercase tracking-widest">
  Label
</span>
```

### Grid for key/value pairs

```jsx
<div className="grid grid-cols-2 gap-x-4 gap-y-1">
  <span className="font-data text-[11px] text-[var(--ink-3)] uppercase">Key</span>
  <span className="font-data text-[13px] text-[var(--ink)]">Value</span>
</div>
```

### Section divider

```jsx
<div className="border-t-[1.5px] border-[var(--ink-4)] pt-3 mt-1">
```

### Analyzing / loading overlay on dark background

```jsx
<div className="absolute inset-0 bg-[#062040cc] flex items-center justify-center">
  <span className="font-data text-[13px] text-[var(--green)] uppercase tracking-widest">
    Analyzing...
  </span>
</div>
```

### Tab button (AdminPage / similar)

```jsx
<button
  className={[
    'px-4 py-2 font-data text-[12px] uppercase tracking-widest border-[1.5px] border-[var(--ink)]',
    active
      ? 'bg-[var(--ink)] text-[var(--paper)]'
      : 'bg-[var(--paper)] text-[var(--ink)] hover:bg-[var(--paper-2)]',
  ].join(' ')}
>
  Tab Label
</button>
```

---

## Anti-patterns

| ❌ Don't | ✅ Do instead |
|----------|--------------|
| `text-gray-400`, `text-green-500` | `text-[var(--ink-3)]`, `text-[var(--green)]` |
| `border-[var(--ink-5)]` | `border-[var(--ink-4)]` — only 4 levels exist |
| Inline `style={{ color: '#22C55E' }}` for text | Use token class `text-[var(--green)]` |
| Raw `<button>` without `font-body` / `border-[var(--ink)]` | Use `<Button>` component |
| `<div>` with arbitrary click handler for navigation | Use `<Link>` or `<NavLink>` |
| `setState` inside `useEffect` for derived values | Derive at render time instead |
