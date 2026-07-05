# TikTok Ads API Reference

## Authentication
- Use TikTok Marketing API via OAuth 2.0
- Required: App ID, Secret, Access Token
- Apply at ads.tiktok.com/marketing_api
- Use `business-api-client` npm package or direct REST calls

## API Structure
TikTok uses a 3-tier hierarchy:
1. **Campaign** — objective + budget type
2. **Ad Group** — targeting, schedule, budget, bid, placement
3. **Ad** — creative (video, image, text, CTA)

## Key API Endpoints

### Campaign Management
```
POST /open_api/v1.3/campaign/create/
GET /open_api/v1.3/campaign/get/
POST /open_api/v1.3/campaign/update/
POST /open_api/v1.3/campaign/update/status/ — enable/disable/delete
```

### Objectives
- REACH
- TRAFFIC
- VIDEO_VIEWS
- LEAD_GENERATION
- CONVERSIONS
- APP_PROMOTION
- PRODUCT_SALES (catalog/shop)

### Ad Group (Targeting + Budget)
```
POST /open_api/v1.3/adgroup/create/
Targeting fields:
- location_ids (country, state, city)
- age_groups: ["AGE_18_24", "AGE_25_34", "AGE_35_44", "AGE_45_54", "AGE_55_100"]
- gender: GENDER_MALE, GENDER_FEMALE, GENDER_UNLIMITED
- languages
- interest_category_ids
- interest_keyword_ids
- action_categories (behaviors: watched, liked, shared certain content)
- custom_audience_ids (from CRM upload)
- excluded_custom_audience_ids
- lookalike_audience_ids
```

### Placements
- TikTok feed
- Pangle (audience network)
- Automatic placement (recommended)

### Ad Creatives
```
POST /open_api/v1.3/ad/create/
Formats:
- Single video (most common)
- Single image
- Spark Ads (boost organic TikTok posts)
- Carousel (images)
- Playable ads

Required: video_id or image_id, ad_text, call_to_action, landing_page_url
CTA options: LEARN_MORE, SHOP_NOW, SIGN_UP, CONTACT_US, DOWNLOAD, GET_QUOTE, SUBSCRIBE, BOOK_NOW
```

### Custom Audiences (CRM Sync)
```
POST /open_api/v1.3/dmp/custom_audience/create/
- Upload type: FILE (hashed emails, phones, advertising IDs)
- SHA-256 hash before upload
- Minimum audience size: 1,000 matched users
```

### Lookalike Audiences
```
POST /open_api/v1.3/dmp/lookalike/create/
- source_audience_id
- lookalike_type: NARROW (1-2%), BALANCED (3-5%), BROAD (6-10%)
- region
```

### TikTok Pixel & Events API
```
POST /open_api/v1.3/pixel/track/
Server-side events:
- ViewContent, AddToCart, CompletePayment, PlaceAnOrder
- SubmitForm, Contact, Subscribe, CompleteRegistration
Required: pixel_code, event, timestamp
User data: email (hashed), phone (hashed), external_id, ip, user_agent
```

### Reporting
```
POST /open_api/v1.3/report/integrated/get/
Metrics: spend, impressions, clicks, ctr, cpc, cpm, reach,
         frequency, video_views_p25/p50/p75/p100, average_video_play,
         conversions, cost_per_conversion, conversion_rate,
         complete_payment_roas
Dimensions: campaign_id, adgroup_id, ad_id, stat_time_day, stat_time_hour
Filters: campaign_ids, adgroup_ids, ad_ids
```

## Rate Limits
- 10 requests per second per app
- 600 requests per minute per app
- Reporting: 60 requests per minute

## Key Metrics
- Impressions, Reach, Frequency
- Clicks, CTR, CPC, CPM
- Video Views (2s, 6s, 25%, 50%, 75%, 100%)
- Average Watch Time
- Conversions, CPA, Conversion Rate
- ROAS (Complete Payment)
- Profile Visits, Follows (Spark Ads)
