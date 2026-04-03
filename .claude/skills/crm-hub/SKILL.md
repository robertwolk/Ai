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
- Create social media posts and content for any platform
- Plan social media on a visual content calendar
- Generate complete post packages (copy, design, hashtags, CTAs)
- Analyze past post performance and get AI-powered suggestions
- Schedule and publish content across all social platforms
- Build content themes, series, and batched content plans

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

## Module 6: Social Media Content & Design Studio

An AI-powered social media command center built into the CRM. Claude creates all posts, ads, and creatives — learning from your past performance to get better over time. Everything is planned on a visual calendar.

### 6.1 Visual Content Calendar

Build a full-screen calendar view (month/week/day) using a library like FullCalendar or custom-built with date-fns:

- **Month view**: color-coded dots per platform (blue = Facebook, pink = Instagram, black = X, teal = TikTok, blue = LinkedIn, red = YouTube)
- **Week view**: time slots showing scheduled posts with thumbnail previews
- **Day view**: detailed timeline with post previews, status indicators, and engagement predictions
- **Drag-and-drop rescheduling**: move posts to different dates/times by dragging
- **Filter by platform**: toggle platforms on/off to focus on specific channels
- **Filter by status**: Draft, Scheduled, Published, Failed
- **Filter by campaign**: link posts to CRM campaigns/deals for attribution
- **Bulk scheduling**: select multiple dates and fill them with a content series
- **Optimal time suggestions**: AI recommends best posting times per platform based on historical engagement data
- **Holiday/event markers**: auto-populate calendar with relevant holidays, industry events, and awareness days

### 6.2 AI Content Generator (Powered by Claude)

Claude generates all content using your brand voice, past performance data, and platform best practices:

#### How It Works
1. User selects platform(s) and content goal (awareness, engagement, traffic, conversion)
2. Claude analyzes:
   - **Brand DNA**: tone, voice, colors, fonts, messaging from the Brand skill
   - **Top-performing past posts**: what topics, formats, hooks, and CTAs worked best
   - **Competitor content**: what's working in your industry (via Ads Competitor skill)
   - **Trending topics**: relevant trends for each platform
   - **CRM data**: what products/services are in the pipeline, what customers care about
3. Claude generates complete post packages (see 6.3 below)
4. User reviews, edits, approves, or regenerates

#### Content Types Generated
- **Organic posts**: regular social media posts (text, image, video, carousel, stories)
- **Paid ad creatives**: ad-ready posts with proper specs per platform
- **Stories/Reels/Shorts**: vertical video concepts with scripts, hooks, and CTAs
- **Threads/Carousels**: multi-slide educational or storytelling content
- **Polls & interactive**: engagement-driving interactive content
- **User-generated content prompts**: prompts to encourage customers to create content

#### Learning From Previous Posts
- **Performance database**: store every published post with its metrics (likes, comments, shares, clicks, saves, reach)
- **Pattern analysis**: Claude identifies what works — which hooks get attention, which CTAs drive clicks, which visuals get saves
- **Topic scoring**: rank content topics by average engagement rate
- **Format scoring**: rank content formats (carousel vs video vs image vs text) by platform
- **Time scoring**: track which posting times drive the most engagement
- **Hashtag scoring**: track which hashtags drive the most reach
- **Tone analysis**: identify whether educational, entertaining, inspirational, or promotional content performs best
- **Suggestions engine**: before creating new content, Claude shows "Based on your last 30 posts, carousels about [topic] posted on Tuesdays at 10am get 3x more engagement than your average post"

### 6.3 Complete Post Packages

Every post Claude creates includes ALL of the following — nothing left for the user to figure out:

#### Text & Copy
- **Primary text/caption**: platform-optimized length (Instagram 2200 chars, X 280 chars, LinkedIn 3000 chars, TikTok 2200 chars, Facebook 63,206 chars)
- **Hook/opening line**: the first line that makes people stop scrolling — tested against your top performers
- **Body**: the main message, formatted for each platform (line breaks, spacing, emojis where appropriate)
- **CTA (Call to Action)**: specific, actionable next step (link in bio, comment below, DM us, visit link)
- **Alt text**: accessible image descriptions for screen readers

#### Hashtags
- **Primary hashtags** (5-10): high-volume, directly relevant to the post topic
- **Secondary hashtags** (5-10): medium-volume niche hashtags for discoverability
- **Branded hashtags** (1-3): your own branded hashtags for tracking
- **Banned hashtag check**: automatically flag shadowbanned or restricted hashtags
- **Platform-specific strategy**:
  - Instagram: 20-30 hashtags (mix of sizes), placed in first comment or caption
  - TikTok: 3-5 targeted hashtags in caption
  - X: 1-2 hashtags only (more hurts engagement)
  - LinkedIn: 3-5 professional hashtags
  - Facebook: 0-2 hashtags (minimal impact)
- **Hashtag performance tracking**: track which hashtags drive the most reach over time, replace underperformers

#### Visual Design & Creative
Use the **UI/UX Pro Max**, **Brand**, **Banner Design**, and **Ad Creative** skills to generate:

- **Image posts**: designed graphics with proper dimensions per platform
  - Instagram feed: 1080x1080 (square), 1080x1350 (portrait)
  - Instagram Stories/Reels: 1080x1920
  - Facebook feed: 1200x630
  - X: 1200x675
  - LinkedIn: 1200x627
  - TikTok: 1080x1920
- **Carousel slides**: multi-image posts with consistent design, each slide builds on the story
- **Video concepts**: storyboard with scene-by-scene breakdown, script, text overlays, music suggestions
- **Story templates**: branded story designs with interactive elements (polls, questions, sliders)
- **Thumbnail designs**: for video posts and YouTube
- **Brand consistency**: all creatives automatically use your brand colors, fonts, and logo from the Brand skill
- **Design variations**: generate 2-3 visual options for each post so the user can pick their favorite
- **Text overlay placement**: ensure text is readable, doesn't overlap key visual elements, and respects platform safe zones

#### Platform-Specific Adaptations
Claude automatically adapts the same content idea for each platform:

| Element | Instagram | Facebook | X | TikTok | LinkedIn | YouTube |
|---------|-----------|----------|---|--------|----------|---------|
| **Tone** | Visual, aspirational | Conversational, shareable | Witty, concise | Fun, authentic, trendy | Professional, insightful | Educational, in-depth |
| **Length** | Medium caption | Medium-long | Short (280 chars) | Short caption | Long-form OK | Title + description |
| **Format** | Carousel, Reels | Video, link posts | Threads, polls | Short video, duets | Articles, documents | Long video, Shorts |
| **CTA** | "Link in bio" | "Click the link" | "Reply with..." | "Follow for more" | "What do you think?" | "Subscribe" |
| **Hashtags** | 20-30 | 0-2 | 1-2 | 3-5 | 3-5 | Tags (not hashtags) |
| **Best time** | AI-suggested | AI-suggested | AI-suggested | AI-suggested | AI-suggested | AI-suggested |

### 6.4 Content Themes & Series

Help users build consistent content pillars:

- **Content pillars**: define 4-6 recurring themes (e.g., Educational, Behind-the-scenes, Customer stories, Product tips, Industry news, Entertainment)
- **Content ratio**: suggest a mix (e.g., 40% educational, 20% promotional, 20% engagement, 20% entertainment)
- **Recurring series**: set up weekly/monthly series (e.g., "Tip Tuesday", "Client Spotlight Friday", "Monthly Myth Buster")
- **Content batching**: generate a full week or month of content in one session
- **Theme calendar**: auto-distribute themes across the calendar so content stays varied

### 6.5 Approval Workflow

For teams:
- **Draft → Review → Approved → Scheduled → Published** workflow
- **Role-based access**: content creator, reviewer, approver, admin
- **Comment on drafts**: team members can leave feedback on specific posts
- **Version history**: see all revisions of a post
- **Bulk approve**: approve multiple posts at once for efficient review

### 6.6 Publishing & Scheduling

- **Direct publishing** via platform APIs:
  - Meta Graph API (Facebook + Instagram)
  - X API v2
  - TikTok Content Posting API
  - LinkedIn Marketing API
  - YouTube Data API v3
- **Queue system**: set up a posting queue with time slots, posts auto-fill into the next available slot
- **Timezone handling**: schedule in user's timezone, publish in each platform's optimal timezone
- **Auto-retry**: if publishing fails, retry 3 times with exponential backoff, then alert user
- **Cross-posting**: publish the same content (adapted) to multiple platforms simultaneously

### 6.7 Performance Analytics Dashboard

After posts are published, track everything:

- **Post-level metrics**: likes, comments, shares, saves, reach, impressions, clicks, video views per post
- **Engagement rate tracking**: calculate and trend engagement rate over time
- **Best/worst performers**: highlight top 5 and bottom 5 posts with analysis of why
- **Content type comparison**: which format performs best on which platform (chart)
- **Hashtag leaderboard**: rank hashtags by reach driven
- **Posting time heatmap**: visual grid showing engagement by day-of-week × hour
- **Follower growth**: track follower count changes tied to content activity
- **Competitor benchmarking**: compare your metrics to industry averages
- **AI insights**: Claude generates weekly/monthly insights like "Your carousel posts get 2.5x more saves than image posts. Consider doing more carousels about [topic]."

### 6.8 CRM ↔ Social Media Integration

Connect social content to the rest of the CRM:

- **Lead capture**: when someone DMs, comments, or clicks a social post → auto-create lead in CRM
- **Attribution**: track which social posts drove which leads/deals
- **Customer content**: auto-suggest content ideas based on common customer questions from CRM notes
- **Testimonial mining**: identify positive customer interactions in CRM → suggest turning them into social proof posts
- **Retargeting fuel**: people who engage with organic posts → add to retargeting audiences for paid ads
- **Sales team content**: auto-generate social posts for sales reps to share (employee advocacy)
- **Revenue per post**: connect social post → lead → deal → revenue for true ROI per post

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
| **Social Content** | Platform-specific post templates and reverse-engineering of viral content |
| **Banner Design** | Generate social media graphics, banners, and ad creatives at correct dimensions |
| **Brand** | Enforce brand voice, colors, fonts, and messaging across all social posts |
| **UI/UX Pro Max** | Design all social graphics, carousels, and story templates with professional quality |
| **Ads Audit** | Audit paid social campaigns alongside organic social performance |
| **Ads Creative** | Generate ad-ready creatives from top-performing organic posts (boost strategy) |
| **Marketing Psychology** | Apply psychological triggers (scarcity, social proof, reciprocity) to social content |
| **Content Strategy** | Align social content calendar with overall content marketing strategy |
| **Competitor Alternatives** | Monitor competitor social presence, reverse-engineer their best content |

---

## Implementation Order

When building this system, follow this order:

1. **Database schema & models** — contacts, deals, activities, campaigns, ad accounts, social posts
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
15. **Social media content calendar** — visual calendar UI with drag-and-drop
16. **AI content generator** — Claude-powered post creation with brand voice
17. **Post performance database** — store metrics, build learning engine
18. **Content themes & series** — pillar system, recurring series, content batching
19. **Social publishing** — direct API publishing to all platforms
20. **Social analytics dashboard** — post metrics, hashtag tracking, engagement heatmaps
21. **Social ↔ CRM integration** — lead capture from social, attribution, testimonial mining
22. **Approval workflow** — team review and scheduling pipeline
23. **Reports & exports** — custom report builder, PDF/CSV export

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
