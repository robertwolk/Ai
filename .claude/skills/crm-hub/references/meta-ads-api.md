# Meta (Facebook & Instagram) Ads API Reference

## Authentication
- Use Facebook Marketing API via OAuth 2.0
- Required: App ID, App Secret, Access Token (long-lived)
- Use `facebook-nodejs-business-sdk` npm package

## API Structure
Meta uses a 3-tier hierarchy:
1. **Campaign** — objective (Awareness, Traffic, Engagement, Leads, Sales)
2. **Ad Set** — targeting, budget, schedule, placement
3. **Ad** — creative (image, video, carousel, text)

## Key API Endpoints

### Campaign Management
```
POST /act_{ad_account_id}/campaigns — create campaign
GET /act_{ad_account_id}/campaigns — list campaigns
POST /{campaign_id} — update campaign
DELETE /{campaign_id} — delete campaign
```

### Ad Set Management
```
POST /act_{ad_account_id}/adsets — create ad set
Fields: campaign_id, targeting, daily_budget, bid_amount, billing_event, optimization_goal, start_time, end_time
```

### Targeting Options
```json
{
  "geo_locations": {"countries": ["US"], "cities": [{"key": "2420379"}]},
  "age_min": 25,
  "age_max": 55,
  "genders": [1, 2],
  "interests": [{"id": "6003139266461", "name": "Small business"}],
  "behaviors": [{"id": "6002714895372", "name": "Small business owners"}],
  "custom_audiences": [{"id": "23456789"}],
  "excluded_custom_audiences": [{"id": "34567890"}]
}
```

### Custom Audiences (CRM Sync)
```
POST /act_{ad_account_id}/customaudiences
- subtype: CUSTOM (for CRM lists)
- Upload hashed: email, phone, first_name, last_name, city, state, zip, country
- Use SHA-256 hashing before upload
```

### Lookalike Audiences
```
POST /act_{ad_account_id}/customaudiences
- subtype: LOOKALIKE
- origin_audience_id: {source_custom_audience_id}
- lookalike_spec: {"country": "US", "ratio": 0.01}  (1% = most similar)
```

### Conversions API (Server-Side)
```
POST /{pixel_id}/events
- Send events: Purchase, Lead, CompleteRegistration, AddToCart
- Include: event_name, event_time, user_data (hashed), custom_data (value, currency)
- Match using email, phone, fbp, fbc cookies
```

### Insights (Reporting)
```
GET /{object_id}/insights
Fields: impressions, reach, clicks, cpc, cpm, ctr, spend, actions, cost_per_action_type, purchase_roas
Breakdowns: age, gender, country, placement, device_platform
Date presets: today, yesterday, last_7d, last_30d, this_month, last_month
```

## Rate Limits
- 200 calls per hour per ad account (insights)
- Batch requests: up to 50 API calls per batch

## Key Metrics
- Reach, Impressions, Frequency
- Clicks (all), Link Clicks, CTR, CPC
- CPM (cost per 1000 impressions)
- Conversions, Cost per Conversion
- ROAS (Purchase Return on Ad Spend)
- Relevance Score / Quality Ranking
