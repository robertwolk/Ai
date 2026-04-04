# CRM AI Hub

A comprehensive AI-powered CRM with integrated multi-platform advertising, social media management, and intelligent lead generation. Built with Next.js 14, TypeScript, Tailwind CSS, and Claude AI.

## Modules Implemented

### Module 1: CRM Core
- **Dashboard** — Revenue trends, pipeline overview, ad platform KPIs, AI insights
- **Contacts** — Full contact management with lifecycle stages, lead scoring, source attribution, tags, bulk actions
- **Pipeline** — Visual Kanban deal pipeline with drag-and-drop, deal cards, probability tracking, revenue forecasting
- **Activities** — Call, email, meeting, note, task tracking with timeline view

### Module 2-3: Ad Platform Integrations
- **Unified Ad Dashboard** — Cross-platform view of Google, Meta, TikTok, LinkedIn performance
- **Platform cards** — Per-platform spend, ROAS, CPA, CTR, conversions
- **Campaign management** — All active campaigns across platforms in one table
- **AI Alerts** — Real-time alerts for overspend, creative fatigue, ROAS opportunities
- **Spend trend charts** — 7-day daily spend by platform

### Module 4: AI Optimization Engine
- **Optimization log** — Every automated AI action logged with before/after values and impact
- **Undo capability** — Roll back any optimization with one click
- **Rules engine** — 6 pre-built optimization rules (budget reallocation, auto-pause, CPA guard, etc.)
- **Auto-optimize toggle** — Enable/disable the automation engine

### Module 5: Attribution & Audience Sync
- Full UTM parameter tracking
- CRM → ad platform audience sync
- Offline conversion import
- Multi-touch attribution

### Module 6: Social Media Content Studio
- **Visual content calendar** — Week view with color-coded platform posts, drag-and-drop scheduling
- **Platform metrics** — Followers, engagement rate, posts per month for Instagram, LinkedIn, TikTok, Facebook
- **AI Content Generator** — Claude-powered post creation panel
- **Post queue** — Upcoming scheduled posts with status badges
- **Approval workflow** — Draft → Review → Approved → Scheduled → Published

### Module 7: Lead Generation Engine
- **Target Discovery Interview** — 8-question interactive ICP profiling wizard
- **Campaign management** — Scraping campaigns with full funnel metrics (Found → Verified → Scored → Grade A/B)
- **Lead scoring** — 0-100 score with fit + intent + engagement components
- **Top leads table** — Grade A leads with enrichment data
- **Source tracking** — Apollo, Hunter, BuiltWith, LinkedIn, Crunchbase

### Landing Page Manager
- **Page list** — All landing pages with visit/conversion/CVR metrics
- **A/B test indicators** — Active tests with variant performance
- **Template picker** — 6 templates (Hero+CTA, Long Form, Webinar, Lead Magnet, Competitor, Squeeze)
- **AI generation** — Generate pages from templates with Claude
- **Competitor clone** — Clone any competitor landing page

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL + Prisma ORM |
| Auth | NextAuth.js |
| Charts | Recharts |
| AI | Anthropic Claude (claude-3-5-sonnet) |
| Queue | Bull (Redis-backed) |
| Email | Resend |
| Storage | Cloudinary |

## Project Structure

```
crm/
├── prisma/
│   └── schema.prisma          # Complete DB schema (all 40+ models)
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx     # Dashboard shell with sidebar
│   │   │   ├── dashboard/     # Main CRM dashboard
│   │   │   ├── contacts/      # Contact management
│   │   │   ├── pipeline/      # Kanban deal pipeline
│   │   │   ├── ads/           # Unified ad dashboard
│   │   │   ├── social/        # Social media calendar + AI
│   │   │   ├── lead-gen/      # Lead generation engine
│   │   │   ├── landing-pages/ # Landing page manager
│   │   │   ├── optimizer/     # AI optimization engine
│   │   │   ├── campaigns/     # Campaign management
│   │   │   ├── attribution/   # Multi-touch attribution
│   │   │   ├── email/         # Email sequences
│   │   │   └── reports/       # Custom reports
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Design system tokens
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx    # Dark sidebar navigation
│   │   │   └── topbar.tsx     # Search + actions bar
│   │   ├── ui/                # shadcn/ui components
│   │   └── providers.tsx      # Auth + theme providers
│   └── lib/
│       └── utils.ts           # Helper functions
├── .env.example               # Environment variables template
├── next.config.js             # Next.js configuration
├── tailwind.config.ts         # Tailwind + design tokens
└── package.json               # Dependencies
```

## Getting Started

### 1. Clone and install

```bash
cd crm
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Fill in your API keys
```

### 3. Set up database

```bash
npx prisma db push
npx prisma generate
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to `/dashboard`.

## Skills Used

This implementation draws from all skill packs in `.claude/skills/`:

| Skill | Usage |
|-------|-------|
| `crm-hub` | Core CRM architecture, all 7 modules |
| `ui-ux-pro-max` | Design system, shadcn/ui, dark sidebar |
| `ads-audit/ads-audit` | Unified ad dashboard |
| `ads-audit/ads-google` | Google Ads module |
| `ads-audit/ads-meta` | Meta Ads module |
| `ads-audit/ads-tiktok` | TikTok Ads module |
| `ads-audit/ads-linkedin` | LinkedIn Ads module |
| `ads-audit/ads-landing` | Landing page manager |
| `marketing/social-content` | Social media calendar |
| `marketing/analytics-tracking` | Attribution & UTM |
| `marketing/revops` | Revenue operations |
| `marketing/copywriting` | AI content generation |
| `marketing/email-sequence` | Email sequences |
| `marketing/cold-email` | Lead gen cold outreach |
| `marketing/lead-magnets` | Lead magnet pages |
| `marketing/page-cro` | Landing page CRO |
| `marketing/ab-test-setup` | A/B testing |
| `website-cloner` | Competitor landing page cloning |

## API Integrations

### Ad Platforms
- Google Ads API v16+
- Meta Marketing API v19+
- TikTok Marketing API v1.3+
- LinkedIn Marketing API v2
- Microsoft Ads API
- Apple Search Ads API

### Social Publishing
- Meta Graph API (Facebook + Instagram)
- X API v2
- TikTok Content Posting API
- LinkedIn Marketing API
- YouTube Data API v3

### Lead Generation
- Apollo.io API (company + contact search)
- Hunter.io API (email finding + verification)
- BuiltWith API (technology profiling)
- Crunchbase API (company data + funding)
- NeverBounce (email verification)

### AI
- Anthropic Claude API (content generation, insights, optimization recommendations)
