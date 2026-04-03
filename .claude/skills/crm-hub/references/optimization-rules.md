# Auto-Optimization Rules & Playbooks

## Budget Optimization Rules

### Cross-Platform Budget Reallocation
- **Trigger**: Weekly review (every Monday) or when any platform's CPA exceeds 2x the average
- **Logic**:
  1. Calculate blended CPA across all platforms
  2. Rank platforms by CPA (lowest = best)
  3. If a platform's CPA > 150% of blended average → reduce budget by 20%
  4. Redistribute reduced budget to platform with lowest CPA
  5. Never reduce any platform below 15% of total budget (maintain presence)
  6. Never increase any platform above 60% of total budget (avoid over-dependence)

### Daily Pacing Rules
- If daily spend > 120% of target → reduce bids by 10% or pause lowest-performing ad set
- If daily spend < 50% of target by noon → increase bids by 15% or expand targeting
- If monthly spend is on track to exceed budget by >10% → reduce daily budgets proportionally

### Diminishing Returns Detection
- Track CPA at different spend levels over 30-day rolling window
- If increasing budget by 25% only increases conversions by <10% → flag diminishing returns
- Suggest redistributing excess budget to other platforms or campaigns

---

## Ad Creative Optimization Rules

### Auto-Pause Underperformers
- **Minimum data**: 1,000 impressions before making decisions
- **Pause if**: CTR < 50% of ad group average after 2,000+ impressions
- **Pause if**: CPA > 200% of campaign target after 5+ conversions on other ads
- **Pause if**: Zero conversions after spending 3x the target CPA

### Creative Fatigue Detection
- **Meta/TikTok**: Alert when frequency > 3.0 and CTR is declining week-over-week
- **Google Display**: Alert when frequency > 5.0
- **Any platform**: Alert when CTR drops >25% from its first-week average
- **Action**: Suggest new creative variations, refresh copy, or rotate in new images/videos

### A/B Testing Protocol
- Always run minimum 2 ad variations per ad group
- Split traffic evenly for first 7 days or 1,000 impressions per ad (whichever comes first)
- After sufficient data: declare winner at 95% statistical confidence
- Promote winner, pause loser, create new challenger variation

---

## Audience Optimization Rules

### Performance Ranking
- Weekly: rank all audiences across all platforms by CPA and ROAS
- Tier audiences:
  - **Gold** (top 20%): increase budget by 25%
  - **Silver** (middle 60%): maintain budget
  - **Bronze** (bottom 20%): reduce budget by 25% or pause

### Auto-Exclusion Rules
- Exclude any audience with zero conversions after spending >$500
- Exclude converted customers from all prospecting campaigns (sync daily)
- Exclude bounced email addresses from all custom audiences

### Lookalike Refresh Schedule
- Rebuild lookalike audiences from CRM data every 30 days
- Source audience: customers who closed in last 90 days (weighted by deal value)
- Create 3 tiers: 1% (narrow), 3% (balanced), 5% (broad)
- Test all three, budget toward best performer

### Retargeting Rules
- **Hot** (visited pricing page, started signup): highest bid, 7-day window
- **Warm** (visited 3+ pages, spent >2 min): medium bid, 14-day window
- **Cold** (visited once, bounced): lowest bid, 30-day window
- Frequency cap: max 3 impressions per day per person across all platforms

---

## Bid Optimization Rules

### Dayparting
- Analyze conversion data by hour-of-day and day-of-week (minimum 30 days data)
- Increase bids by 20% during top-performing 4-hour windows
- Decrease bids by 30% during hours with zero conversions
- Review and adjust monthly

### Device Optimization
- Track CPA by device (mobile, desktop, tablet) per platform
- If mobile CPA > 150% of desktop → reduce mobile bid by 20%
- If desktop has zero conversions → reduce to minimum bid, don't fully pause

### Geographic Optimization
- Track CPA by region/city (minimum 10 conversions per region)
- Increase bids by 25% in top 5 regions
- Decrease bids by 30% in bottom 5 regions
- Exclude regions with >$200 spend and zero conversions

---

## Optimization Log Requirements

Every automated action must log:
- **Timestamp**: when the change was made
- **Platform**: which ad platform
- **Object**: which campaign/ad set/ad/audience
- **Action**: what was changed (budget, bid, status, etc.)
- **Before value**: the previous setting
- **After value**: the new setting
- **Reason**: why the change was triggered (e.g., "CPA exceeded 2x average")
- **Data snapshot**: key metrics at time of decision
- **Undo available**: yes/no + how to reverse

---

## Safety Guardrails

- **Maximum daily spend change**: no more than 30% increase or decrease in one day
- **Cooling period**: after pausing a campaign/ad, wait 48 hours before reactivating
- **Human approval required for**:
  - Spending more than $500/day on any single platform
  - Pausing a campaign that has been running for less than 7 days
  - Any budget change exceeding $1,000
  - Creating new campaigns (only suggest, don't auto-create)
- **Never auto-delete**: only pause. Deletion requires manual confirmation
- **Notification on every change**: email or in-app notification to account owner
