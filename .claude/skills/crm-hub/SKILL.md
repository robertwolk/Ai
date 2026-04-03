# CRM & Multi-Platform Ad Manager

A comprehensive skill for building and managing a HubSpot-style CRM with integrated multi-platform advertising across Google Ads, Meta (Facebook/Instagram), X (Twitter), and TikTok — with automatic cross-channel optimization.

## When To Use This Skill

Use this skill when the user wants to:
- Build a CRM system (contacts, deals, pipelines, dashboards)
- Set up ad campaigns across Google, Facebook, Instagram, X, or TikTok
- Monitor ad performance across platforms
- Automatically optimize ad spend and creatives
- Connect their CRM data to their ad campaigns
- Track leads from ad click → customer conversion
- Generate reports on marketing ROI

## Architecture Overview

Build a full-stack application with:

### Tech Stack
- **Frontend**: Next.js 14+ (App Router) with React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes or separate Node.js/Express server
- **Database**: PostgreSQL with Prisma ORM (or SQLite for local dev)
- **Auth**: NextAuth.js or Clerk
- **Charts**: Recharts or Chart.js for dashboards
- **Queue**: Bull or Inngest for background jobs (ad sync, optimization)
- **Caching**: Redis for API rate limiting and caching ad data

---

## Module 1: CRM Core

### 1.1 Contact Management
Build a contacts system with:
- **Contact records**: name, email, phone, company, source, tags, custom fields
- **Contact timeline**: every interaction logged (emails sent, ads clicked, pages visited, calls, notes)
- **Smart lists**: filter contacts by any field, tag, behavior, or ad source
- **Import/Export**: CSV import, bulk actions, deduplication
- **Lead source tracking**: automatically tag contacts with the ad platform and campaign that brought them in

### 1.2 Deal Pipeline
Build a visual Kanban-style pipeline:
- **Stages**: Lead → Qualified → Meeting Booked → Proposal Sent → Negotiation → Won / Lost
- **Custom pipelines**: users can create multiple pipelines for different products/services
- **Deal cards**: show value, contact, expected close date, probability
- **Drag-and-drop**: move deals between stages
- **Automation**: auto-move deals based on triggers (e.g., email opened → Qualified)
- **Revenue forecasting**: predict monthly/quarterly revenue based on pipeline

### 1.3 Activity & Task Management
- **Activity types**: call, email, meeting, note, task
- **Task assignment**: assign tasks to team members with due dates
- **Reminders**: email/in-app notifications for upcoming tasks
- **Activity feed**: chronological view of all activities per contact or deal

### 1.4 Dashboard & Reports
Build a main dashboard showing:
- **Pipeline overview**: deals by stage, total value, win rate
- **Revenue**: monthly recurring revenue (MRR), growth trends
- **Activity metrics**: calls made, emails sent, meetings booked
- **Lead sources**: which channels bring the most leads (ties into ad platforms)
- **Custom reports**: drag-and-drop report builder

---

## Module 2: Ad Platform Integrations

### 2.1 Google Ads Integration
Connect via Google Ads API (v16+):
- **Campaign management**: create, pause, edit Search, Display, Shopping, YouTube, Performance Max campaigns
- **Keyword management**: add/remove keywords, adjust bids, negative keywords
- **Ad groups & creatives**: create responsive search ads, display ads, video ads
- **Conversion tracking**: import CRM conversions back to Google (offline conversion import)
- **Audience sync**: push CRM contact lists as Customer Match audiences
- **Budget management**: daily/monthly budget controls
- **Metrics pulled**: impressions, clicks, CTR, CPC, conversions, cost/conversion, ROAS, quality score

### 2.2 Meta Ads Integration (Facebook & Instagram)
Connect via Meta Marketing API (v19+):
- **Campaign management**: create campaigns across Facebook feed, Instagram feed, Stories, Reels, Messenger
- **Ad sets**: audience targeting (demographics, interests, behaviors, lookalikes, custom audiences)
- **Ad creatives**: single image, carousel, video, collection ads
- **Pixel integration**: track website events, build retargeting audiences
- **Custom audiences**: sync CRM contacts as custom audiences for targeting or exclusion
- **Lookalike audiences**: auto-create lookalikes from best customers in CRM
- **Metrics pulled**: reach, impressions, clicks, CTR, CPM, CPC, conversions, ROAS, frequency

### 2.3 X (Twitter) Ads Integration
Connect via X Ads API (v12+):
- **Campaign management**: create Reach, Engagement, Website Traffic, Conversion campaigns
- **Targeting**: keywords, interests, followers, tailored audiences, conversation topics
- **Ad formats**: promoted tweets, image ads, video ads, carousel ads
- **Audience sync**: upload CRM email lists as tailored audiences
- **Conversion tracking**: X pixel + offline event import
- **Metrics pulled**: impressions, engagements, engagement rate, clicks, CPE, CPC, conversions

### 2.4 TikTok Ads Integration
Connect via TikTok Marketing API (v1.3+):
- **Campaign management**: create Reach, Traffic, Conversions, App Install campaigns
- **Targeting**: demographics, interests, behaviors, custom audiences, lookalike audiences
- **Ad formats**: in-feed video, TopView, Spark Ads (boost organic posts), carousel
- **TikTok Pixel**: track website events, build retargeting audiences
- **Audience sync**: upload CRM contacts for targeting
- **Creative tools**: auto-generate video variations, A/B test hooks and CTAs
- **Metrics pulled**: impressions, clicks, CTR, CPC, CPM, conversions, CPA, video views, watch time

---

## Module 3: Cross-Platform Ad Monitoring

### 3.1 Unified Dashboard
Build a single view showing all platforms side-by-side:
- **Overview cards**: total spend, total conversions, blended ROAS, blended CPA across all platforms
- **Platform comparison**: table/chart comparing Google vs Meta vs X vs TikTok performance
- **Campaign-level drill-down**: see every active campaign across all platforms in one list
- **Date range picker**: today, 7 days, 30 days, 90 days, custom range
- **Real-time alerts**: notify when a campaign overspends, underperforms, or breaks a threshold

### 3.2 Attribution & Tracking
- **UTM parameter system**: auto-generate and enforce UTM tags for every ad link
- **Multi-touch attribution**: track the full journey (ad click → website visit → form fill → deal closed)
- **Attribution models**: first-touch, last-touch, linear, time-decay, position-based
- **Revenue attribution**: connect closed deals in CRM back to the exact ad/campaign/platform that sourced them
- **Cross-device tracking**: link the same person across platforms when possible

### 3.3 Performance Sync Schedule
- **Hourly**: pull key metrics (spend, clicks, conversions) from all platforms
- **Daily**: full data sync including creative-level performance, audience insights
- **Weekly**: generate summary reports, trend analysis, recommendations
- Store all historical data for trend analysis and forecasting

---

## Module 4: Automatic Optimization Engine

### 4.1 Budget Optimization
- **Cross-platform budget allocation**: automatically shift budget from underperforming platforms to top performers
- **Rules engine**: user-defined rules like "If CPA on TikTok exceeds $50, reduce budget by 20% and redistribute to Google"
- **Pace management**: ensure monthly budgets are spent evenly (not front-loaded or back-loaded)
- **Diminishing returns detection**: identify when increasing spend stops producing proportional results
- **Recommended daily budgets**: AI suggests optimal daily budget per platform based on historical performance

### 4.2 Ad Creative Optimization
- **Auto-pause losers**: pause ads with CTR below threshold after sufficient impressions
- **Creative rotation**: automatically test new creatives against winners
- **Cross-platform creative testing**: test the same creative concept across all platforms, find where it works best
- **Fatigue detection**: alert when frequency is too high or engagement is dropping
- **AI creative suggestions**: analyze top-performing ads and suggest new variations

### 4.3 Audience Optimization
- **Audience performance ranking**: rank all audiences across platforms by CPA and ROAS
- **Auto-expand winners**: increase budget on top-performing audiences
- **Auto-exclude wasters**: pause audiences with high spend and zero conversions
- **Lookalike refresh**: automatically rebuild lookalike audiences monthly from latest CRM data
- **Negative audience management**: exclude converted customers from prospecting campaigns
- **CRM-powered retargeting**: auto-create retargeting segments (e.g., leads who didn't convert in 30 days)

### 4.4 Bid Optimization
- **Smart bidding recommendations**: suggest bid strategy changes based on performance data
- **Dayparting**: adjust bids by time of day and day of week based on conversion patterns
- **Device bid adjustments**: optimize bids for mobile vs desktop based on conversion rates
- **Geographic bid adjustments**: increase bids in high-performing locations

### 4.5 Optimization Log
- **Every automated action is logged**: what was changed, why, what the data showed
- **Before/after tracking**: measure performance improvement after each optimization
- **Undo capability**: roll back any automated change with one click
- **Weekly optimization summary**: report showing all changes made and their impact

---

## Module 5: CRM ↔ Ad Platform Integration

This is what makes the system powerful — connecting CRM data to ads and vice versa:

### 5.1 Lead → Ad Attribution
- When a lead enters the CRM (form fill, email signup), automatically tag them with:
  - Which platform (Google, Meta, X, TikTok)
  - Which campaign
  - Which ad
  - Which keyword (Google) or audience (Meta/TikTok)
  - Cost to acquire that lead

### 5.2 CRM → Ad Platforms (Audience Sync)
- **Auto-sync customer lists**: push CRM segments to all ad platforms as custom audiences
- **Suppression lists**: automatically exclude existing customers from acquisition campaigns
- **Lookalike seeding**: send your best customers to Meta/TikTok to build lookalike audiences
- **Lifecycle-based targeting**: create ad audiences based on CRM pipeline stage (e.g., retarget leads stuck in "Proposal" stage)

### 5.3 Closed-Loop Reporting
- **Offline conversion import**: when a deal closes in CRM, send that conversion data back to Google/Meta/X/TikTok
- **Revenue reporting**: show actual revenue (not just leads) per platform, campaign, ad, keyword
- **True ROAS**: calculate real return on ad spend using CRM revenue data, not just platform-reported conversions
- **LTV-based optimization**: optimize campaigns toward customer lifetime value, not just first purchase

---

## Integration With Other Installed Skills

This CRM skill works with your other marketing skills:

| Skill | How It Integrates |
|-------|-------------------|
| **Cold Email** | Send cold email sequences to CRM contacts, log opens/clicks as activities |
| **Email Sequence** | Trigger automated email sequences when contacts enter specific pipeline stages |
| **Copywriting** | Generate ad copy and landing page copy directly from CRM campaign data |
| **Lead Magnets** | Create lead magnets, track downloads in CRM, auto-add to nurture sequences |
| **SEO Audit** | Compare organic vs paid traffic in unified dashboard |
| **Paid Ads** | Uses the paid ads skill's templates for campaign creation |
| **Ad Creative** | Generate ad creatives using CRM data about what messaging converts best |
| **Analytics Tracking** | Unified event tracking across website, CRM, and ad platforms |
| **Pricing Strategy** | Test different pricing in ads, track which converts best in CRM pipeline |
| **AB Test Setup** | Run A/B tests on ads and track results through to CRM revenue |
| **Customer Research** | Use CRM data to understand customer behavior and inform targeting |
| **Referral Program** | Track referral-sourced leads separately in CRM, compare to paid acquisition |
| **RevOps** | Lead scoring, routing, and lifecycle management powered by ad + CRM data |
| **Website Cloner** | Clone competitor landing pages, A/B test them with your ad traffic |

---

## Implementation Order

When building this system, follow this order:

1. **Database schema & models** — contacts, deals, activities, campaigns, ad accounts
2. **CRM core** — contact CRUD, pipeline view, activity logging
3. **Auth & team** — user accounts, roles, permissions
4. **Dashboard** — main CRM dashboard with charts
5. **Google Ads integration** — connect API, pull data, create campaigns
6. **Meta Ads integration** — connect API, pull data, create campaigns
7. **X Ads integration** — connect API, pull data, create campaigns
8. **TikTok Ads integration** — connect API, pull data, create campaigns
9. **Unified ad dashboard** — cross-platform view
10. **Attribution system** — UTM tracking, multi-touch attribution
11. **Audience sync** — CRM → ad platforms
12. **Offline conversion import** — CRM → ad platforms
13. **Optimization engine** — auto-budget, auto-pause, auto-bid
14. **Optimization log & undo** — transparency and safety
15. **Reports & exports** — custom report builder, PDF/CSV export

---

## UI/UX Guidelines

- Use the **UI/UX Pro Max** skill for all design decisions
- Dark sidebar navigation (like HubSpot)
- Clean data tables with sorting, filtering, and bulk actions
- Kanban board for deal pipeline (drag-and-drop)
- Chart-heavy dashboard (use Recharts)
- Mobile-responsive — the dashboard should work on phones for quick checks
- Loading states and skeleton screens for API data
- Toast notifications for successful actions
- Confirmation modals for destructive actions (pause campaign, delete contact)
