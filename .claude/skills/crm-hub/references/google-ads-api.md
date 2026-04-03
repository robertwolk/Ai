# Google Ads API Reference

## Authentication
- Use OAuth 2.0 with Google Ads API
- Required credentials: Developer Token, Client ID, Client Secret, Refresh Token
- Use `google-ads-api` npm package or `google-ads-python` for Python

## Key API Endpoints

### Campaign Management
- `GoogleAdsService.SearchStream` — query campaign data using GAQL
- `CampaignService.MutateCampaigns` — create/update/remove campaigns
- `AdGroupService.MutateAdGroups` — manage ad groups
- `AdGroupAdService.MutateAdGroupAds` — manage ads

### GAQL Query Examples
```sql
-- Get campaign performance
SELECT campaign.name, campaign.status, metrics.impressions, metrics.clicks,
       metrics.cost_micros, metrics.conversions, metrics.cost_per_conversion
FROM campaign
WHERE segments.date DURING LAST_30_DAYS
ORDER BY metrics.cost_micros DESC

-- Get keyword performance
SELECT ad_group_criterion.keyword.text, metrics.impressions, metrics.clicks,
       metrics.cost_micros, metrics.conversions, metrics.quality_score
FROM keyword_view
WHERE segments.date DURING LAST_7_DAYS

-- Get ad performance
SELECT ad_group_ad.ad.responsive_search_ad.headlines,
       metrics.impressions, metrics.clicks, metrics.conversions
FROM ad_group_ad
WHERE segments.date DURING LAST_30_DAYS
```

### Offline Conversion Import
- Use `ConversionUploadService.UploadClickConversions`
- Match using GCLID (Google Click ID) stored when lead first arrives
- Upload: conversion_action, gclid, conversion_date_time, conversion_value

### Customer Match (Audience Sync)
- Use `OfflineUserDataJobService`
- Upload hashed email addresses, phone numbers, names
- Create/update user lists for targeting or exclusion

## Rate Limits
- 15,000 operations per day (standard access)
- Request higher limits through Google Ads API Center

## Key Metrics to Track
- Impressions, Clicks, CTR, CPC, Cost
- Conversions, Cost/Conversion, Conversion Rate
- ROAS (conversion value / cost)
- Quality Score (keywords)
- Impression Share, Search Lost IS (budget/rank)
