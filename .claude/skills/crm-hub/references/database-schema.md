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

---

## Social Media Tables

### social_accounts
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| platform | ENUM | FACEBOOK, INSTAGRAM, X, TIKTOK, LINKEDIN, YOUTUBE |
| account_name | VARCHAR | Display name / handle |
| account_id | VARCHAR | Platform-specific account/page ID |
| access_token | TEXT | Encrypted OAuth token |
| refresh_token | TEXT | Encrypted refresh token |
| token_expires_at | TIMESTAMP | When token expires |
| follower_count | INTEGER | Current follower count |
| is_active | BOOLEAN | Whether publishing is enabled |
| last_synced_at | TIMESTAMP | Last metrics sync |

### social_posts
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| campaign_id | UUID | FK → campaigns (optional, for attribution) |
| content_theme_id | UUID | FK → content_themes (which pillar this belongs to) |
| series_id | UUID | FK → content_series (if part of a recurring series) |
| status | ENUM | DRAFT, IN_REVIEW, APPROVED, SCHEDULED, PUBLISHED, FAILED |
| post_type | ENUM | IMAGE, VIDEO, CAROUSEL, STORY, REEL, SHORT, THREAD, POLL, TEXT |
| created_by | UUID | FK → users |
| approved_by | UUID | FK → users |
| created_at | TIMESTAMP | When created |
| updated_at | TIMESTAMP | Last updated |

### social_post_versions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| social_post_id | UUID | FK → social_posts |
| version_number | INTEGER | 1, 2, 3... |
| caption | TEXT | Full post caption/text |
| hook | VARCHAR | Opening line / scroll-stopper |
| cta | VARCHAR | Call to action text |
| alt_text | TEXT | Accessibility image description |
| hashtags | JSONB | {"primary": [...], "secondary": [...], "branded": [...]} |
| ai_generation_prompt | TEXT | The prompt used to generate this version |
| edited_by | UUID | FK → users (null if AI-generated) |
| created_at | TIMESTAMP | When this version was created |

### social_post_platforms
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| social_post_id | UUID | FK → social_posts |
| social_account_id | UUID | FK → social_accounts |
| platform | ENUM | FACEBOOK, INSTAGRAM, X, TIKTOK, LINKEDIN, YOUTUBE |
| platform_post_id | VARCHAR | Post ID on the platform (after publishing) |
| adapted_caption | TEXT | Platform-specific adapted caption |
| adapted_hashtags | JSONB | Platform-specific hashtags |
| scheduled_at | TIMESTAMP | When to publish |
| published_at | TIMESTAMP | When actually published |
| status | ENUM | PENDING, SCHEDULED, PUBLISHED, FAILED |
| error_message | TEXT | Error details if publishing failed |

### social_post_creatives
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| social_post_id | UUID | FK → social_posts |
| creative_type | ENUM | IMAGE, VIDEO, CAROUSEL_SLIDE, THUMBNAIL, STORY_FRAME |
| file_url | VARCHAR | URL to the creative file |
| file_path | VARCHAR | Local file path |
| width | INTEGER | Image/video width in pixels |
| height | INTEGER | Image/video height in pixels |
| duration_seconds | INTEGER | Video duration (null for images) |
| slide_order | INTEGER | Order in carousel (null for single) |
| design_prompt | TEXT | AI prompt used to generate this creative |
| brand_colors_used | JSONB | Which brand colors were applied |
| brand_fonts_used | JSONB | Which brand fonts were applied |
| created_at | TIMESTAMP | When created |

### social_post_metrics
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| social_post_platform_id | UUID | FK → social_post_platforms |
| date | DATE | Metric date |
| impressions | INTEGER | Total impressions |
| reach | INTEGER | Unique people reached |
| likes | INTEGER | Likes/reactions |
| comments | INTEGER | Comments/replies |
| shares | INTEGER | Shares/retweets/reposts |
| saves | INTEGER | Saves/bookmarks |
| clicks | INTEGER | Link clicks |
| video_views | INTEGER | Video views (if applicable) |
| video_watch_time_seconds | INTEGER | Total watch time |
| profile_visits | INTEGER | Profile visits driven by post |
| follows | INTEGER | New follows from this post |
| engagement_rate | DECIMAL | (likes+comments+shares+saves) / reach |
| synced_at | TIMESTAMP | When metrics were last pulled |

### content_themes
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Theme name (e.g., "Educational", "Behind-the-scenes") |
| description | TEXT | What this theme covers |
| color | VARCHAR | Calendar display color (hex) |
| target_percentage | INTEGER | Target % of content (e.g., 40 = 40%) |
| is_active | BOOLEAN | Whether theme is currently in use |

### content_series
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Series name (e.g., "Tip Tuesday") |
| description | TEXT | What this series covers |
| theme_id | UUID | FK → content_themes |
| frequency | ENUM | WEEKLY, BIWEEKLY, MONTHLY |
| preferred_day | INTEGER | Day of week (0=Mon, 6=Sun) |
| preferred_time | TIME | Preferred posting time |
| template_prompt | TEXT | AI prompt template for generating episodes |
| episode_count | INTEGER | How many episodes published so far |
| is_active | BOOLEAN | Whether series is currently running |

### hashtag_performance
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| hashtag | VARCHAR | The hashtag text (without #) |
| platform | ENUM | INSTAGRAM, TIKTOK, X, LINKEDIN, FACEBOOK |
| times_used | INTEGER | How many times we've used this hashtag |
| avg_reach | DECIMAL | Average reach on posts using this hashtag |
| avg_engagement_rate | DECIMAL | Average engagement rate |
| best_reach | INTEGER | Best reach achieved with this hashtag |
| last_used_at | TIMESTAMP | When we last used it |
| is_banned | BOOLEAN | Whether flagged as shadowbanned/restricted |
| updated_at | TIMESTAMP | Last metrics update |

### social_post_approvals
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| social_post_id | UUID | FK → social_posts |
| reviewer_id | UUID | FK → users |
| action | ENUM | APPROVED, REJECTED, REQUESTED_CHANGES |
| comment | TEXT | Review feedback |
| created_at | TIMESTAMP | When review was submitted |

### posting_queue
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| social_account_id | UUID | FK → social_accounts |
| day_of_week | INTEGER | 0=Mon through 6=Sun |
| time_slot | TIME | Posting time |
| is_filled | BOOLEAN | Whether a post is assigned to this slot |
| social_post_id | UUID | FK → social_posts (the assigned post) |

---

## Lead Generation Tables

### lead_gen_campaigns
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Campaign name (e.g., "Q2 SaaS Outreach") |
| status | ENUM | DRAFT, PROFILING, SCRAPING, ENRICHING, SCORING, ACTIVATING, ACTIVE, PAUSED, COMPLETED |
| target_profile | JSONB | Full ICP from interview (industry, size, tech, geo, titles, etc.) |
| interview_responses | JSONB | Raw Q&A from the target discovery interview |
| crm_analysis | JSONB | AI analysis of existing contacts/campaigns |
| scraping_plan | JSONB | The scraping strategy (sources, steps, estimated costs) |
| scraping_sources | TEXT[] | Which APIs/sources to use |
| target_lead_count | INTEGER | How many leads to find |
| actual_lead_count | INTEGER | How many leads were found |
| qualified_lead_count | INTEGER | How many scored B or above |
| estimated_cost | DECIMAL | Estimated scraping/enrichment cost |
| actual_cost | DECIMAL | Actual cost spent |
| created_by | UUID | FK → users |
| created_at | TIMESTAMP | When campaign was created |
| completed_at | TIMESTAMP | When scraping finished |

### lead_gen_leads
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| lead_gen_campaign_id | UUID | FK → lead_gen_campaigns |
| contact_id | UUID | FK → contacts (after import to CRM) |
| status | ENUM | SCRAPED, ENRICHING, ENRICHED, VERIFIED, SCORED, IMPORTED, DUPLICATE, REJECTED |
| first_name | VARCHAR | Person first name |
| last_name | VARCHAR | Person last name |
| email | VARCHAR | Email address |
| email_status | ENUM | VALID, INVALID, CATCH_ALL, UNKNOWN, UNVERIFIED |
| phone | VARCHAR | Phone number |
| job_title | VARCHAR | Current job title |
| linkedin_url | VARCHAR | LinkedIn profile URL |
| twitter_handle | VARCHAR | X/Twitter handle |
| company_name | VARCHAR | Company name |
| company_domain | VARCHAR | Company website domain |
| company_industry | VARCHAR | Industry classification |
| company_size | VARCHAR | Employee count range |
| company_revenue | VARCHAR | Revenue range |
| company_location | VARCHAR | HQ location |
| company_founded | INTEGER | Year founded |
| company_tech_stack | JSONB | Technologies detected |
| company_funding | JSONB | Funding data (rounds, total, investors) |
| hiring_signals | JSONB | Active job postings relevant to your product |
| intent_signals | JSONB | Buying intent signals detected |
| fit_score | INTEGER | 0-50 ICP fit score |
| intent_score | INTEGER | 0-30 intent score |
| engagement_score | INTEGER | 0-20 engagement score |
| total_score | INTEGER | 0-100 combined score |
| lead_grade | ENUM | A, B, C, D |
| enrichment_sources | JSONB | Which APIs provided which data |
| enrichment_cost | DECIMAL | Cost to enrich this lead |
| scraped_at | TIMESTAMP | When initially found |
| enriched_at | TIMESTAMP | When enrichment completed |
| scored_at | TIMESTAMP | When scoring completed |
| imported_at | TIMESTAMP | When imported to CRM |

### lead_gen_activations
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| lead_gen_campaign_id | UUID | FK → lead_gen_campaigns |
| channel | ENUM | GOOGLE_ADS, META_ADS, X_ADS, TIKTOK_ADS, COLD_EMAIL, LINKEDIN_OUTREACH, SOCIAL_CONTENT |
| activation_type | ENUM | CUSTOM_AUDIENCE, LOOKALIKE, RETARGETING, EMAIL_SEQUENCE, DIRECT_OUTREACH, CONTENT_TARGETING |
| platform_audience_id | VARCHAR | Audience ID on the ad platform (if applicable) |
| email_sequence_id | UUID | FK → email sequences (if applicable) |
| campaign_id | UUID | FK → campaigns (if ad activation) |
| leads_pushed | INTEGER | Number of leads pushed to this channel |
| lead_grade_filter | ENUM | A, B, C, D (which grades were pushed) |
| status | ENUM | PENDING, ACTIVE, PAUSED, COMPLETED |
| created_at | TIMESTAMP | When activation was created |

### lead_gen_source_performance
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| source | VARCHAR | API/source name (e.g., "apollo", "hunter", "builtwith") |
| lead_gen_campaign_id | UUID | FK → lead_gen_campaigns |
| leads_found | INTEGER | Total leads from this source |
| leads_verified | INTEGER | Leads with verified emails |
| leads_converted | INTEGER | Leads that became customers |
| cost | DECIMAL | Total cost for this source |
| cost_per_lead | DECIMAL | Cost / leads_found |
| cost_per_verified | DECIMAL | Cost / leads_verified |
| cost_per_customer | DECIMAL | Cost / leads_converted |
| avg_lead_score | DECIMAL | Average score of leads from this source |
| conversion_rate | DECIMAL | leads_converted / leads_found |
| updated_at | TIMESTAMP | Last updated |

### ideal_customer_profiles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR | Profile name (e.g., "Primary ICP", "Secondary ICP") |
| version | INTEGER | Version number (profiles evolve over time) |
| industries | TEXT[] | Target industries |
| company_sizes | TEXT[] | Employee count ranges |
| revenue_ranges | TEXT[] | Revenue ranges |
| geographies | TEXT[] | Target locations |
| job_titles | TEXT[] | Decision-maker titles |
| tech_stack | TEXT[] | Required technologies |
| funding_stages | TEXT[] | Target funding stages |
| behavioral_signals | JSONB | Buying triggers, content consumption, communities |
| negative_signals | JSONB | Disqualifying traits (from feedback loop) |
| source_data | JSONB | CRM analysis data that informed this profile |
| performance_metrics | JSONB | How leads matching this ICP have performed |
| is_active | BOOLEAN | Whether actively used for scraping |
| created_at | TIMESTAMP | When created |
| updated_at | TIMESTAMP | Last refined |

### suppression_list
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | VARCHAR | Suppressed email address |
| domain | VARCHAR | Suppressed company domain (optional) |
| reason | ENUM | UNSUBSCRIBED, BOUNCED, COMPLAINED, DO_NOT_CONTACT, COMPETITOR, EXISTING_CUSTOMER |
| source | VARCHAR | Where the suppression came from |
| added_at | TIMESTAMP | When added to suppression list |
