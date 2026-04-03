# Social Media Publishing APIs Reference

## Meta Graph API (Facebook + Instagram)

### Facebook Page Publishing
```
POST /{page_id}/feed — publish text post
POST /{page_id}/photos — publish photo post
POST /{page_id}/videos — publish video post
Fields: message, link, attached_media (for carousel), scheduled_publish_time
```

### Instagram Content Publishing (2-step process)
```
Step 1: Create media container
POST /{ig_user_id}/media
- image_url + caption (single image)
- video_url + caption (Reel)
- children[] (carousel — create each child first)

Step 2: Publish
POST /{ig_user_id}/media_publish
- creation_id (from step 1)
```

### Instagram Stories
```
POST /{ig_user_id}/media
- image_url or video_url
- media_type: STORIES
```

### Scheduling (Facebook)
```
POST /{page_id}/feed
- scheduled_publish_time: UNIX timestamp (10 min to 6 months in future)
- published: false
```

### Post Insights
```
GET /{post_id}/insights
Metrics: post_impressions, post_reach, post_engagements, 
         post_clicks, post_reactions_by_type, post_video_views
```

---

## X (Twitter) API v2

### Create Tweet
```
POST /2/tweets
Body: {
  "text": "Your tweet text",
  "media": {"media_ids": ["media_id_1"]},
  "poll": {"options": ["Yes", "No"], "duration_minutes": 1440},
  "reply_settings": "everyone" | "mentionedUsers" | "following"
}
```

### Upload Media
```
POST /1.1/media/upload.json (chunked upload for video)
- INIT: media_type, total_bytes, media_category (tweet_image, tweet_video, tweet_gif)
- APPEND: upload chunks
- FINALIZE: complete upload
- STATUS: check processing (for video)
```

### Create Thread
```
1. Post first tweet: POST /2/tweets → get tweet_id
2. Reply to it: POST /2/tweets with reply.in_reply_to_tweet_id = tweet_id
3. Continue chain for each thread tweet
```

### Schedule Tweet
X API doesn't have native scheduling — implement via:
- Store in database with scheduled_at timestamp
- Background job checks every minute for due posts
- Publish via API when time arrives

### Tweet Metrics
```
GET /2/tweets/{id}?tweet.fields=public_metrics,organic_metrics
Returns: retweet_count, reply_count, like_count, quote_count,
         impression_count, url_link_clicks, user_profile_clicks
```

---

## TikTok Content Posting API

### Direct Post (requires Content Posting API access)
```
Step 1: Initialize upload
POST /v2/post/publish/content/init/
Body: {
  "post_info": {
    "title": "Video caption with #hashtags",
    "privacy_level": "PUBLIC_TO_EVERYONE",
    "disable_duet": false,
    "disable_comment": false,
    "disable_stitch": false,
    "video_cover_timestamp_ms": 1000
  },
  "source_info": {
    "source": "FILE_UPLOAD",
    "video_size": file_size_bytes,
    "chunk_size": chunk_size,
    "total_chunk_count": total_chunks
  }
}

Step 2: Upload video chunks
PUT {upload_url} with video binary data

Step 3: Check status
GET /v2/post/publish/status/fetch/
```

### Photo Post
```
POST /v2/post/publish/content/init/
- media_type: "PHOTO"
- images: [{"image_url": "https://..."}]  (up to 35 images for carousel)
```

### Post Metrics
```
GET /v2/video/query/
Fields: like_count, comment_count, share_count, view_count,
        reach, full_video_watched_rate, total_time_watched,
        average_time_watched, impression_sources
```

---

## LinkedIn Marketing API

### Create Post (UGC Post)
```
POST /v2/ugcPosts
Body: {
  "author": "urn:li:person:{person_id}",
  "lifecycleState": "PUBLISHED",
  "specificContent": {
    "com.linkedin.ugc.ShareContent": {
      "shareCommentary": {"text": "Your post text"},
      "shareMediaCategory": "NONE" | "IMAGE" | "VIDEO" | "ARTICLE",
      "media": [{
        "status": "READY",
        "originalUrl": "https://...",
        "title": {"text": "Title"},
        "description": {"text": "Description"}
      }]
    }
  },
  "visibility": {"com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"}
}
```

### Upload Image
```
Step 1: Register upload
POST /v2/assets?action=registerUpload
- recipes: ["urn:li:digitalmediaRecipe:feedshare-image"]

Step 2: Upload binary
PUT {uploadUrl} with image binary

Step 3: Use asset URN in post
```

### Company Page Post
```
Same as above but author = "urn:li:organization:{org_id}"
```

### Post Analytics
```
GET /v2/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=urn:li:organization:{id}
Metrics: shareCount, clickCount, likeCount, commentCount,
         impressionCount, uniqueImpressionsCount, engagement
```

---

## YouTube Data API v3

### Upload Video
```
POST /upload/youtube/v3/videos?part=snippet,status
Body (multipart):
- snippet: title, description, tags, categoryId
- status: privacyStatus (public/private/unlisted), publishAt (for scheduling)
- Video file binary
```

### Create YouTube Short
```
Same upload endpoint — YouTube auto-detects Shorts if:
- Video is vertical (9:16 aspect ratio)
- Duration is 60 seconds or less
- #Shorts in title or description
```

### Video Analytics
```
GET /youtube/analytics/v2/reports
Dimensions: video
Metrics: views, likes, dislikes, comments, shares, 
         estimatedMinutesWatched, averageViewDuration,
         subscribersGained, subscribersLost, 
         annotationClickThroughRate
```

### Schedule Video
```
POST /upload/youtube/v3/videos
status: {
  "privacyStatus": "private",
  "publishAt": "2024-12-25T10:00:00Z"  // ISO 8601
}
```

---

## Rate Limits Summary

| Platform | Limit | Notes |
|----------|-------|-------|
| Meta (Facebook) | 200 calls/hour per user | Higher for pages with many followers |
| Meta (Instagram) | 25 content publishes/day | Per Instagram account |
| X (Twitter) | 300 tweets/3 hours (app), 50 tweets/24h (user) | Per app or per user |
| TikTok | 1 video upload/day (basic), more with approval | Requires Content Posting API access |
| LinkedIn | 100 posts/day per member | 200/day for company pages |
| YouTube | 10,000 units/day (quota) | Video upload = ~1,600 units |

## Image/Video Specs Summary

| Platform | Image Size | Video Max | Video Format |
|----------|-----------|-----------|-------------|
| Instagram Feed | 1080x1080, 1080x1350 | 60 min | MP4, MOV |
| Instagram Stories/Reels | 1080x1920 | 90s (Reels), 60s (Stories) | MP4, MOV |
| Facebook Feed | 1200x630 | 240 min | MP4, MOV |
| X | 1200x675 | 2 min 20s | MP4 |
| TikTok | 1080x1920 | 10 min | MP4, MOV, WebM |
| LinkedIn | 1200x627 | 10 min | MP4 |
| YouTube | 1920x1080 (HD), 3840x2160 (4K) | 12 hours | MP4, MOV, AVI, WMV |
| YouTube Shorts | 1080x1920 | 60s | MP4, MOV |
