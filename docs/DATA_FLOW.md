# GreenPlus AI — Data Flow & Architecture

> Reference document for data engineers. All diagrams use Mermaid (renders natively on GitHub).
> Last updated: 14 May 2026

---

## 1. Database Schema (ERD)

All tables live in `public` schema on Supabase PostgreSQL. Every table has Row Level Security enabled.

```mermaid
erDiagram
    auth_users {
        uuid id PK
        text email
        timestamptz created_at
    }

    user_profiles {
        uuid id PK "FK → auth.users"
        text role "user | buyer | admin"
        text display_name
        text language_pref "th | en"
        int eco_points
        timestamptz created_at
    }

    shops {
        uuid id PK
        uuid owner_id FK "→ user_profiles"
        text name
        text area
        float lat
        float lng
        text_array accepts "material_type keys"
        text status "pending | active | rejected"
        timestamptz created_at
    }

    shop_pricing {
        uuid id PK
        uuid shop_id FK "→ shops"
        text material_type
        numeric price_grade_a
        numeric price_grade_b
        numeric price_grade_c
        timestamptz updated_at
    }

    waste_items {
        uuid id PK
        text material_type UK
        text name_en
        text name_th
        numeric base_price
        timestamptz created_at
    }

    scan_history {
        uuid id PK
        uuid user_id FK "→ user_profiles"
        text material_type
        text grade "A | B | C | REJECTED"
        numeric weight_kg
        numeric price_per_kg
        numeric calculated_value
        numeric confidence
        text ai_source "onnx | vertex | manual"
        timestamptz scanned_at
    }

    bookings {
        uuid id PK
        uuid seller_id FK "→ user_profiles"
        uuid shop_id FK "→ shops"
        text material_type
        text grade
        numeric weight_kg
        text status "pending | accepted | rejected | completed"
        timestamptz scheduled_at
        timestamptz created_at
    }

    marketplace_posts {
        uuid id PK
        uuid user_id FK "→ user_profiles"
        text material_type
        text grade "A | B | C"
        numeric quantity_kg
        numeric price_per_kg
        text status "active | sold | removed"
        timestamptz created_at
    }

    eco_point_ledger {
        uuid id PK
        uuid user_id FK "→ user_profiles"
        int points
        text reason
        uuid ref_id "booking_id or scan_id"
        timestamptz created_at
    }

    training_images {
        uuid id PK
        text material_type
        int stage "1 | 2"
        text label "material_type OR clean|dirty"
        text storage_path
        text image_url
        uuid uploaded_by FK "→ user_profiles"
        text source "admin | user_report"
        timestamptz created_at
    }

    user_reports {
        uuid id PK
        uuid reporter_id FK "→ user_profiles"
        text scan_image_url
        text claimed_material
        text ai_material
        text ai_grade
        text status "pending | approved | rejected"
        uuid reviewed_by FK "→ user_profiles"
        timestamptz reviewed_at
        timestamptz created_at
    }

    model_deployments {
        uuid id PK
        text version
        text stage1_endpoint
        text stage2_endpoint
        text project_id
        text location
        boolean is_active
        uuid deployed_by FK "→ user_profiles"
        timestamptz deployed_at
    }

    auth_users ||--|| user_profiles : "1-to-1"
    user_profiles ||--o{ shops : "owns"
    user_profiles ||--o{ scan_history : "has"
    user_profiles ||--o{ bookings : "places (seller)"
    user_profiles ||--o{ marketplace_posts : "posts"
    user_profiles ||--o{ eco_point_ledger : "earns"
    user_profiles ||--o{ training_images : "uploads"
    user_profiles ||--o{ user_reports : "files"
    shops ||--o{ shop_pricing : "configures"
    shops ||--o{ bookings : "receives"
```

---

## 2. AI Inference Pipeline

Two-stage classification with priority: ONNX (local) → Vertex AI (cloud) → manual fallback.

```mermaid
flowchart TD
    A([User captures image]) --> B{ONNX model\nloaded?}

    B -->|Yes| C[Stage 1 — ONNX\nMaterial classification\nin browser WASM]
    B -->|No| D[Stage 1 — Vertex AI\nAutoML endpoint\nREST call]

    C --> E{confidence\n≥ threshold?}
    D --> E

    E -->|No| F[Low confidence\nshow warning\nask user to retry]
    E -->|Yes| G[Stage 2 — Cleanliness\nclean or dirty?]

    G --> H{ONNX Stage 2\navailable?}
    H -->|Yes| I[ONNX Stage 2 locally]
    H -->|No| J[Vertex AI Stage 2\nendpoint]

    I --> K[Grade assignment\nA=clean+top material\nB=slightly dirty\nC=very dirty]
    J --> K

    K --> L{Anti-troll filter\nconfidence < 0.3\nor nonsense?}
    L -->|Reject| M[REJECTED — not added\nto basket]
    L -->|Pass| N[Scan result card\nmaterial · grade · price]

    N --> O{User action}
    O -->|Add to basket| P[(Redux wasteSlice\nbasket array\nscannedAt stamped)]
    O -->|Report misID| Q[(user_reports table\nSupabase)]
    O -->|Scan again| A

    P --> R[(scan_history table\nSupabase — persisted)]
```

---

## 3. Scan → Basket → Booking Data Flow

End-to-end sequence from camera tap to booking confirmed.

```mermaid
sequenceDiagram
    actor User
    participant Browser as React SPA
    participant Redux as Redux Store
    participant ONNX as ONNX Runtime (WASM)
    participant Vertex as Vertex AI AutoML
    participant DB as Supabase DB
    participant Shop as Buyer Dashboard

    User->>Browser: Tap scan / upload image
    Browser->>ONNX: Run Stage 1 inference
    alt ONNX available
        ONNX-->>Browser: material_type + confidence
    else ONNX unavailable
        Browser->>Vertex: POST /stage1/predict
        Vertex-->>Browser: material_type + confidence
    end

    Browser->>ONNX: Run Stage 2 (cleanliness)
    ONNX-->>Browser: label (clean|dirty) + score

    Browser->>Browser: Compute grade A/B/C
    Browser->>DB: INSERT scan_history row
    DB-->>Browser: scan_id

    Browser->>Redux: addToBasket(item + scannedAt)
    Redux-->>Browser: basket updated

    User->>Browser: Open Basket
    Browser->>DB: SELECT shop_pricing (all shops)
    DB-->>Browser: pricing rows
    Browser->>Browser: Compute market average per material+grade

    User->>Browser: Enable GPS location
    Browser->>Browser: Haversine distance to each shop

    User->>Browser: Find Route → select shop
    Browser->>DB: INSERT bookings row (status=pending)
    DB-->>Browser: booking_id

    DB->>Shop: Realtime notify (new booking)
    Shop->>DB: UPDATE bookings SET status=accepted
    DB-->>Browser: Realtime event → toast notification
```

---

## 4. Booking State Machine

```mermaid
stateDiagram-v2
    [*] --> pending : User submits booking

    pending --> accepted  : Buyer taps Accept
    pending --> rejected  : Buyer taps Reject

    accepted --> completed : Buyer taps Complete\n(pickup done)
    accepted --> cancelled  : Either party cancels

    rejected --> [*]
    completed --> [*]
    cancelled --> [*]

    note right of accepted
        eco_point_ledger row
        inserted on accepted
    end note

    note right of completed
        scan_history.calculated_value
        confirmed as real transaction
    end note
```

---

## 5. Pricing Data Flow

How prices flow from shop configuration to user display.

```mermaid
flowchart LR
    A[(waste_items\nbase_price)] -->|fallback| F

    B[(shop_pricing\nper shop per material\ngrade A/B/C)] -->|fetch on page load| C

    C[useMarketPricing hook\nAverage per material+grade\nacross all active shops] --> F

    F{price shown\nto user}

    F -->|basket item price| G[BasketPage\nmaterialType + grade]
    F -->|route card price| H[Shop route card\nper-shop total\nvs market avg diff]
    F -->|scan result| I[ScanPage result card\nestimated value]
    F -->|home chart| J[HomePage\nweekly kg chart\nbasket aggregated]

    K[Buyer sets\nshop_pricing\nin PricingPage] --> B
    K --> C
```

---

## 6. Frontend Architecture — Pages, Hooks & Redux

```mermaid
flowchart TB
    subgraph Auth["Auth Layer"]
        LoginPage
        ProtectedRoute
    end

    subgraph Layouts["Layouts"]
        UserLayout
        BuyerLayout
        AdminShell[Admin Shell]
    end

    subgraph UserPages["User Pages"]
        HomePage
        ScanPage
        BasketPage
        MapPage
        MarketplacePage
        EcoPointsPage
        ProfilePage
    end

    subgraph BuyerPages["Buyer Pages"]
        DashboardPage
        SchedulePage
        PricingPage
        NotificationsPage
    end

    subgraph AdminPages["Admin Pages"]
        AdminPage["AdminPage\n(shops · heatmap · reports · AI Studio)"]
    end

    subgraph Hooks["Supabase Hooks"]
        useAuth
        useShops
        useMarketPricing
        useSupabaseBookings
        useSupabaseMarketplace
        useUserReports
        useScanInsert
        useGPS
    end

    subgraph Store["Redux Slices"]
        userSlice["userSlice\nsession · profile · language"]
        wasteSlice["wasteSlice\nbasket · lastScan"]
        bookingSlice["bookingSlice\nbookings"]
        marketplaceSlice["marketplaceSlice\nposts"]
        scheduleSlice["scheduleSlice\nslots"]
        pricingSlice["pricingSlice\npricing rows"]
        notificationSlice["notificationSlice\nitems"]
        aiConfigSlice["aiConfigSlice\nmodelVersion · endpoints"]
    end

    LoginPage --> useAuth --> userSlice
    ScanPage --> useScanInsert --> wasteSlice
    BasketPage --> useShops & useMarketPricing & wasteSlice & bookingSlice
    MapPage --> useShops
    MarketplacePage --> useSupabaseMarketplace --> marketplaceSlice
    DashboardPage --> useSupabaseBookings --> bookingSlice
    SchedulePage --> useSupabaseBookings --> scheduleSlice
    PricingPage --> pricingSlice
    AdminPage --> useShops & useUserReports & aiConfigSlice
    HomePage --> wasteSlice & userSlice & useShops
```

---

## 7. Data Engineer Work Breakdown

Areas that need real data pipelines built out:

```mermaid
flowchart TD
    subgraph READY["✅ Ready (schema + hooks exist)"]
        A[scan_history — insert on scan]
        B[bookings — full CRUD via Supabase]
        C[shop_pricing — buyer sets via PricingPage]
        D[marketplace_posts — CRUD working]
        E[user_reports — insert + admin review]
        F[training_images — upload via AI Studio]
    end

    subgraph PARTIAL["⚠️ Partial (schema ready, no hook yet)"]
        G[eco_point_ledger — schema exists,\nno automatic award on booking complete]
        H[user_profiles.eco_points — not incremented\nwhen ledger row inserted]
        I[scan_history ← basket.clearBasket\nnot yet persisting on basket submit]
    end

    subgraph PENDING["🔴 Not built yet"]
        J[Heatmap — needs aggregate query\nSELECT area, COUNT from scan_history\nGrouped by district polygon]
        K[Admin analytics — revenue,\nvolume trends from bookings]
        L[model_deployments — admin sets\nactive endpoint, app reads on boot]
        M[Realtime notifications — bookings\nstatus change → buyer/seller toast]
    end

    A --> G
    B --> G
    G --> H
    J -.->|requires| A
    K -.->|requires| B
    L -.->|requires| F
    M -.->|requires| B
```

---

## 8. Row Level Security Policy Map

Who can read/write each table.

```mermaid
flowchart LR
    subgraph Tables
        UP[user_profiles]
        SH[shops]
        SP[shop_pricing]
        SCH[scan_history]
        BK[bookings]
        MK[marketplace_posts]
        EP[eco_point_ledger]
        TI[training_images]
        UR[user_reports]
        MD[model_deployments]
    end

    subgraph Roles
        U((user))
        B((buyer))
        A((admin))
        PUB((public\nanon))
    end

    U -->|own row only| UP
    B -->|own row only| UP
    A -->|all rows| UP

    PUB -->|status=active only| SH
    B -->|own shop| SH
    A -->|all| SH

    PUB -->|SELECT| SP
    B -->|own shop pricing| SP

    U -->|own rows| SCH
    A -->|all| SCH

    U -->|own as seller| BK
    B -->|own shop bookings| BK

    PUB -->|status=active| MK
    U -->|own posts| MK
    A -->|remove any| MK

    U -->|own ledger| EP

    A -->|all| TI
    PUB -->|SELECT| TI

    U -->|insert own| UR
    A -->|all| UR

    A -->|all| MD
    PUB -->|is_active=true| MD
```
