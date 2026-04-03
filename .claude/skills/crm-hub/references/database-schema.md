# CRM Database Schema Reference

## Core CRM Tables

### contacts
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| first_name | VARCHAR | Contact first name |
| last_name | VARCHAR | Contact last name |
| email | VARCHAR | Unique email address |
| phone | VARCHAR | Phone number |
| company | VARCHAR | Company name |
| job_title | VARCHAR | Role/title |
| source | ENUM | How they found you: GOOGLE_ADS, META_ADS, X_ADS, TIKTOK_ADS, ORGANIC, REFERRAL, COLD_EMAIL, MANUAL |
| source_campaign | VARCHAR | Specific campaign name that brought them in |
| source_ad | VARCHAR | Specific ad that brought them in |
| source_keyword | VARCHAR | Keyword (Google Ads) |
| utm_source | VARCHAR | UTM source parameter |
| utm_medium | VARCHAR | UTM medium parameter |
| utm_campaign | VARCHAR | UTM campaign parameter |
| utm_content | VARCHAR | UTM content parameter |
| utm_term | VARCHAR | UTM term parameter |
| gclid | VARCHAR | Google Click ID for offline conversion import |
| fbclid | VARCHAR | Facebook Click ID |
| tags | TEXT[] | Array of tags |
| custom_fields | JSONB | Flexible custom fields |
| lifecycle_stage | ENUM | SUBSCRIBER, LEAD, MQL, SQL, OPPORTUNITY, CUSTOMER, EVANGELIST |
| lead_score | INTEGER | 0-100 score based on behavior |
| acquisition_cost | DECIMAL | Cost to acquire this lead from ad platform |
| created_at | TIMESTAMP | When contact was created |
| updated_at | TIMESTAMP | Last updated |

### deals
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| contact_id | UUID | FK → contacts |
| title | VARCHAR | Deal name |
| value | DECIMAL | Deal value in dollars |
| currency | VARCHAR | USD, EUR, etc. |
| stage | ENUM | LEAD, QUALIFIED, MEETING_BOOKED, PROPOSAL_SENT, NEGOTIATION, WON, LOST |
| pipeline_id | UUID | FK → pipelines (for multiple pipelines) |
| probability | INTEGER | 0-100% chance of closing |
| expected_close_date | DATE | When you expect to close |
| actual_close_date | DATE | When it actually closed |
| lost_reason | VARCHAR | Why the deal was lost |
| source_platform | ENUM | Which ad platform sourced this deal |
| source_campaign | VARCHAR | Which campaign |
| created_at | TIMESTAMP | When deal was created |
| updated_at | TIMESTAMP | Last updated |

### activities
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| contact_id | UUID | FK → contacts |
| deal_id | UUID | FK → deals (optional) |
| type | ENUM | CALL, EMAIL, MEETING, NOTE, TASK, AD_CLICK, PAGE_VIEW, FORM_SUBMIT |
| subject | VARCHAR | Activity title |
| body | TEXT | Details/notes |
| outcome | VARCHAR | Result of activity |
| due_date | TIMESTAMP | For tasks |
| completed_at | TIMESTAMP | When completed |
| assigned_to | UUID | FK → users |
| created_at | TIMESTAMP | When created |

### pipelines
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Pipeline name (e.g., "Sales", "Partnerships") |
| stages | JSONB | Ordered list of stage names and probabilities |
| is_default | BOOLEAN | Default pipeline for new deals |

---

## Ad Platform Tables

### ad_accounts
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| platform | ENUM | GOOGLE, META, X, TIKTOK |
| account_id | VARCHAR | Platform-specific account ID |
| account_name | VARCHAR | Display name |
| access_token | TEXT | Encrypted OAuth token |
| refresh_token | TEXT | Encrypted refresh token |
| token_expires_at | TIMESTAMP | When token expires |
| currency | VARCHAR | Account currency |
| timezone | VARCHAR | Account timezone |
| is_active | BOOLEAN | Whether syncing is enabled |
| last_synced_at | TIMESTAMP | Last successful data sync |

### campaigns
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| ad_account_id | UUID | FK → ad_accounts |
| platform | ENUM | GOOGLE, META, X, TIKTOK |
| platform_campaign_id | VARCHAR | ID on the ad platform |
| name | VARCHAR | Campaign name |
| objective | VARCHAR | Campaign objective |
| status | ENUM | ACTIVE, PAUSED, DELETED, COMPLETED |
| daily_budget | DECIMAL | Daily budget |
| lifetime_budget | DECIMAL | Total budget |
| start_date | DATE | Campaign start |
| end_date | DATE | Campaign end |
| created_at | TIMESTAMP | When created |

### ad_sets
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| campaign_id | UUID | FK → campaigns |
| platform_adset_id | VARCHAR | ID on the ad platform |
| name | VARCHAR | Ad set name |
| status | ENUM | ACTIVE, PAUSED, DELETED |
| targeting | JSONB | Targeting configuration |
| daily_budget | DECIMAL | Ad set daily budget |
| bid_strategy | VARCHAR | Bid strategy type |
| bid_amount | DECIMAL | Manual bid amount |

### ads
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| ad_set_id | UUID | FK → ad_sets |
| platform_ad_id | VARCHAR | ID on the ad platform |
| name | VARCHAR | Ad name |
| status | ENUM | ACTIVE, PAUSED, DELETED |
| format | ENUM | IMAGE, VIDEO, CAROUSEL, TEXT, SPARK_AD |
| headline | VARCHAR | Ad headline |
| body | TEXT | Ad body copy |
| cta | VARCHAR | Call to action |
| landing_url | VARCHAR | Landing page URL |
| creative_url | VARCHAR | Image/video URL |

### ad_metrics
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| ad_id | UUID | FK → ads |
| ad_set_id | UUID | FK → ad_sets |
| campaign_id | UUID | FK → campaigns |
| platform | ENUM | GOOGLE, META, X, TIKTOK |
| date | DATE | Metric date |
| hour | INTEGER | Hour (0-23) for hourly data |
| impressions | INTEGER | Total impressions |
| reach | INTEGER | Unique people reached |
| clicks | INTEGER | Total clicks |
| link_clicks | INTEGER | Clicks to landing page |
| ctr | DECIMAL | Click-through rate |
| cpc | DECIMAL | Cost per click |
| cpm | DECIMAL | Cost per 1000 impressions |
| spend | DECIMAL | Total spend |
| conversions | INTEGER | Total conversions |
| conversion_value | DECIMAL | Revenue from conversions |
| cpa | DECIMAL | Cost per acquisition |
| roas | DECIMAL | Return on ad spend |
| video_views | INTEGER | Video views (where applicable) |
| frequency | DECIMAL | Average times shown per person |

---

## Optimization Tables

### optimization_log
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| platform | ENUM | GOOGLE, META, X, TIKTOK, CROSS_PLATFORM |
| object_type | ENUM | CAMPAIGN, AD_SET, AD, AUDIENCE, BUDGET |
| object_id | VARCHAR | ID of the changed object |
| object_name | VARCHAR | Name for display |
| action | ENUM | BUDGET_INCREASE, BUDGET_DECREASE, PAUSE, ENABLE, BID_CHANGE, AUDIENCE_EXCLUDE |
| before_value | VARCHAR | Previous value |
| after_value | VARCHAR | New value |
| reason | TEXT | Why the optimization was triggered |
| metrics_snapshot | JSONB | Key metrics at time of decision |
| is_undone | BOOLEAN | Whether this was rolled back |
| undone_at | TIMESTAMP | When it was rolled back |
| created_at | TIMESTAMP | When the optimization happened |

### audience_syncs
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Audience name |
| crm_segment | JSONB | CRM filter criteria (e.g., stage = "Customer") |
| platforms | TEXT[] | Which platforms to sync to (GOOGLE, META, X, TIKTOK) |
| sync_type | ENUM | TARGETING, EXCLUSION, LOOKALIKE_SOURCE |
| contact_count | INTEGER | Number of contacts in segment |
| last_synced_at | TIMESTAMP | Last sync timestamp |
| sync_frequency | ENUM | DAILY, WEEKLY, MANUAL |

---

## Attribution Tables

### attribution_events
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| contact_id | UUID | FK → contacts |
| event_type | ENUM | AD_CLICK, PAGE_VIEW, FORM_SUBMIT, DEAL_CREATED, DEAL_WON |
| platform | ENUM | GOOGLE, META, X, TIKTOK, ORGANIC, DIRECT |
| campaign_id | UUID | FK → campaigns (if from ad) |
| ad_id | UUID | FK → ads (if from ad) |
| url | VARCHAR | Page URL |
| utm_params | JSONB | Full UTM parameters |
| revenue | DECIMAL | Revenue attributed (for DEAL_WON events) |
| timestamp | TIMESTAMP | When the event occurred |

### conversion_imports
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| deal_id | UUID | FK → deals |
| platform | ENUM | GOOGLE, META, X, TIKTOK |
| platform_conversion_id | VARCHAR | ID returned by platform |
| conversion_value | DECIMAL | Revenue sent to platform |
| imported_at | TIMESTAMP | When conversion was sent |
| status | ENUM | PENDING, SUCCESS, FAILED |
| error_message | TEXT | Error details if failed |
