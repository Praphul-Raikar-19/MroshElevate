# MROSHELEVATE

> **"A Universe Where Talent Rises"**

[![Platform](https://img.shields.io/badge/Platform-Web%20Application-101214?style=flat-square&logo=googlechrome&logoColor=B7D66A)](https://mroshelevate.io)
[![Pilot Cohort](https://img.shields.io/badge/Karnataka%20Pilot-100%20Creators%20•%2050%20SHGs%20•%2010%20Studios-72B8A7?style=flat-square)](docs/MROSHELEVATE_MASTER_BLUEPRINT.md)
[![Database](https://img.shields.io/badge/Database-Supabase%20%2F%20PostgreSQL-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](docs/schema.sql)
[![Theme](https://img.shields.io/badge/Design%20System-Dark%20Futuristic%20%2B%20Natural-B7D66A?style=flat-square)](#design-system--tokens)

---

## 🌌 Overview

**MROSHELEVATE** is a premier creator-investor ecosystem engineered to connect emerging digital creators, grassroots artisan Self-Help Groups (SHGs), visionary brands, and creative production studios under one collaborative roof.

Rather than another social media or gig platform clone, MROSHELEVATE unites:
1. **Professional Creative Feed**: Real-time project work-in-progress, reels, and collaboration calls with active engagement (like, comment, share, save).
2. **Grassroots Craft Inclusion**: Direct integration of rural and peri-urban artisan collectives (SHGs) into modern commercial design pipelines with 100% fair-trade attribution.
3. **Transparent Milestone Backing**: Project funding and grant tracking inspired by the SafeGuard/Arbitrum model, where funds are tied to verifiable deliverable proofs rather than speculative hype.
4. **Studio Infrastructure Sharing**: Production suite listings, Dolby Atmos sound stages, and on-demand crew assembly.

---

## 📍 Karnataka Pilot Cohort Scope

Our initial validation launch is specifically structured around an exploratory Karnataka pilot:
- **100 Regional Creators**: Visual designers, 3D artists, indie filmmakers, audio engineers, and vernacular musicians (Bangalore, Mysore, Mangalore).
- **50 Artisan Self-Help Groups (SHGs)**: Channapatna lacquerware collectives (Ramanagara), Ilkal handloom weavers (Bagalkot), Bidri metalwork clusters (Bidar).
- **10 Creative Production Studios**: Dolby Atmos 7.1 suites, Foley recording stages, and animation facilities.

---

## 🚀 Key Features & Application Modules

### 1. The 3-Column Creator Feed (`Discover`)
* **Left Sidebar**: Featured creator quick-list, quick actions (`+ Create Post`, `Join Community`, `Upcoming Events`), and Karnataka Pilot status tracker.
* **Center Feed Stream**:
  * Inline **Post Composer** with tag attachments (`Media`, `Milestone`, `SHG Collective`) and instant publishing.
  * Realtime engagement bar on every post:
    * ❤️ **Like / Unlike** with animated bounce and live counter toggle.
    * 💬 **Threaded Comments** with inline drawer expansion and real-time comment submission.
    * 🔄 **Share** with link clipboard copying and toast alerts.
    * 🔖 **Bookmark / Save** with persistent ribbon state.
* **Right Sidebar**: **Suggested Connections** with active `[Connect]` toggles, and **Upcoming Events** cards (Creative Mixers, Film Workshops, Craft & UI Hackathons).

### 2. Talent & Collective Directory (`Network`)
* Multi-attribute filtering by creative discipline (`Digital & UI/UX`, `Artisan SHGs`, `Cinema & Video`, `Music & Sound`, `Studios`).
* Real-time search across names, skills, and regional districts.
* Comprehensive **Creator Profile Modals** featuring portfolios, verified ratings, hourly rates, and past client badges (e.g. CRED, Swiggy, FabIndia).

### 3. Collaborative Projects & Milestones (`Projects`)
* Opportunity board with briefs, budgets, deadlines, and quick pitch submission.
* **SafeGuard-style Milestone Rails**: Visual progress bars, deliverable status badges (`Pending`, `In Progress`, `Approved`), and escrow tracking.

### 4. Role-Based Onboarding Wizard
* 4-step modal wizard tailored for **Creators**, **Artisan SHGs**, **Brands & Businesses**, **Production Studios**, and **Investors**.

### 5. Dual-Mode Backend Architecture
* **Live Supabase Mode**: Automatically queries live PostgreSQL tables via Supabase PostgREST API and Supabase Auth when credentials are provided.
* **Graceful Offline Fallback**: Automatically provides responsive in-memory seed data when offline or keys are pending, guaranteeing **zero broken screens**.

---

## 🎨 Design System & Tokens

* **Primary Background**: `#101214` (Deep obsidian ground)
* **Secondary Surface**: `#191D20` (Elevated dark panels)
* **Card Surface**: `#202529` (Subtle glass elevation with hairline borders `#303638`)
* **Primary Accent**: `#B7D66A` (Vivid Nature-Lime glow)
* **Secondary Accent**: `#72B8A7` (Sage / Balanced Teal)
* **Artisan Accent**: `#E2B053` (Warm Amber for SHG Collectives)
* **Typography**:
  * Headings & UI: **Plus Jakarta Sans** (weights 300 to 800)
  * Metrics & Pricing: **JetBrains Mono**

---

## 🛠️ Technology Stack

* **Frontend**: Vanilla ES6+ JavaScript, Semantic HTML5, Modular CSS Design System Tokens (Zero runtime overhead, ultra-fast initial load).
* **Backend & API**: Supabase (PostgreSQL 15+, Row-Level Security, Supabase Auth, Supabase Storage, Supabase Realtime).
* **Dev Server**: Lightweight Python 3.12 HTTP server (`server.py`) serving static assets with custom port support.
* **Version Control**: Git with atomic conventional commits.

---

## 📁 Repository Structure

```
MroshElevate/
├── README.md                             # Project overview & documentation (this file)
├── server.py                             # Local development web server (default port 8080)
├── docs/
│   ├── MROSHELEVATE_MASTER_BLUEPRINT.md  # Comprehensive product & CTO blueprint
│   ├── SPRINT_2_BACKEND_INTEGRATION_PLAN.md # Backend audit & migration roadmap
│   └── schema.sql                        # Production PostgreSQL DDL, triggers & RLS
└── public/
    ├── index.html                        # Single-Page Application root
    ├── assets/
    │   └── references/                   # UI reference wireframes & pilot assets
    ├── css/
    │   ├── design-system.css             # Tokens, typography, reset, buttons, glass cards
    │   ├── landing.css                   # Modals, tabs, pilot banners, status pills
    │   └── feed.css                      # 3-column feed grid, composer, comments, cards
    └── js/
        ├── supabase-config.js            # Supabase credentials & runtime config manager
        ├── supabase-client.js            # Unified async data & service layer (mroshBackend)
        ├── data.js                       # Seed data for creators, SHGs, and opportunities
        ├── feed-data.js                  # Seed data for creator feed, connections & events
        ├── app.js                        # Directory search, modals, onboarding wizard
        └── feed.js                       # 3-column feed controller (likes, comments, posts)
```

---

## ⚡ Quick Start & Local Setup

### 1. Clone & Run the Development Server
```bash
# Clone the repository
git clone https://github.com/your-username/MroshElevate.git
cd MroshElevate

# Start the local server on port 8080
python server.py 8080
```
Open **[http://localhost:8080](http://localhost:8080)** in your browser.

*(Alternatively, you can open `public/index.html` directly in any modern browser).*

---

### 2. Connect Your Live Supabase Backend

1. In your **Supabase Dashboard**, open the **SQL Editor** (`>_`).
2. Copy and paste the entire script from **[`docs/schema.sql`](docs/schema.sql)** and click **Run**.  
   *(This creates all 15 tables, automated profile triggers, like/comment counters, and RLS policies).*
3. Open the web app at `http://localhost:8080`.
4. Click the **"Supabase: Setup"** pill in the bottom-left corner.
5. Enter your **Project URL** and **Public Anon Key**, then click **Connect & Save**.
6. The indicator will switch to **`● Supabase: Live`**, and all feed posts, comments, likes, and registrations will persist directly to PostgreSQL!

---

## 🔐 Database Security & RLS Policies

All tables in `schema.sql` have Row-Level Security (RLS) enabled:
* **Profiles**: Publicly readable; users can only update their own profile (`auth.uid() = id`).
* **Posts**: Publicly readable; only authenticated authors can create, edit, or delete their posts (`auth.uid() = author_id`).
* **Likes & Comments**: Uniquely constrained; users can only add/remove their own reactions.
* **Saved Posts**: Strictly private (`auth.uid() = user_id`).
* **Opportunities & Applications**: Role-gated creation; pitches viewable only by applicant and brief owner.

---

## 🏢 Headquarters & Contact

* **Organization**: MROSHELEVATE Inc.
* **Hub**: Indiranagar, Bangalore Urban, Karnataka, India 560038
* **Pilot Inquiries**: `pilot@mroshelevate.io`

© 2026 MROSHELEVATE. All rights reserved. Designed for equitable creative growth.
