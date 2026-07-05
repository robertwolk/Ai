# X (Twitter) Ads API Reference

## Authentication
- Use OAuth 1.0a or OAuth 2.0
- Required: API Key, API Secret, Access Token, Access Token Secret
- Apply for Ads API access at ads.x.com

## API Structure
X Ads uses a hierarchy:
1. **Campaign** — objective + funding instrument
2. **Line Item** — targeting, budget, bid, placement
3. **Promoted Tweets / Creatives** — the actual ad content

## Key API Endpoints

### Campaign Management
```
POST /12/accounts/{account_id}/campaigns — create campaign
GET /12/accounts/{account_id}/campaigns — list campaigns
PUT /12/accounts/{account_id}/campaigns/{campaign_id} — update
DELETE /12/accounts/{account_id}/campaigns/{campaign_id} — delete
```

### Objectives
- REACH
- ENGAGEMENTS
- VIDEO_VIEWS
- WEBSITE_CLICKS
- WEBSITE_CONVERSIONS
- APP_INSTALLS

### Line Items (Ad Sets)
```
POST /12/accounts/{account_id}/line_items
Fields: campaign_id, objective, bid_amount_local_micro, placements, 
        product_type, target_audience_id, start_time, end_time
```

### Targeting
```
POST /12/accounts/{account_id}/targeting_criteria
Types:
- LOCATION (country, state, city, zip)
- AGE
- GENDER
- LANGUAGE
- INTEREST
- FOLLOWER_LOOK_ALIKES (target followers of specific accounts)
- KEYWORD (target users who tweeted/engaged with keywords)
- CONVERSATION_TOPIC
- TAILORED_AUDIENCE (custom audience from CRM)
```

### Tailored Audiences (CRM Sync)
```
POST /12/accounts/{account_id}/tailored_audiences
- list_type: EMAIL, TWITTER_ID, DEVICE_ID
- Upload hashed email addresses (SHA-256)
- Use for targeting or exclusion
```

### Conversion Tracking
```
POST /12/accounts/{account_id}/web_event_tags — create conversion pixel
POST /12/accounts/{account_id}/conversion_event — import offline conversions
Fields: hashed_email, event_type (PURCHASE, SIGN_UP, LEAD), 
        conversion_time, conversion_value
```

### Analytics
```
GET /12/stats/accounts/{account_id}
Metrics: impressions, engagements, engagement_rate, clicks, url_clicks,
         retweets, likes, replies, follows, cost_per_engagement,
         cost_per_click, conversions, cost_per_conversion
Granularity: HOUR, DAY, TOTAL
Segmentation: GENDER, AGE, PLATFORMS, LOCATIONS
```

## Rate Limits
- 300 requests per 15-minute window (most endpoints)
- Analytics: 100 requests per 15-minute window

## Key Metrics
- Impressions, Engagements, Engagement Rate
- Link Clicks, CPC, CTR
- Cost per Engagement (CPE)
- Video Views (3s, 50%, 100%)
- Conversions, Cost per Conversion
- Follower gain/loss during campaign
