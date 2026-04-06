"""
Configuration for the Middle East News Alert App.
Focuses on Iranian war news and Middle Eastern conflicts (Yemen, etc.)
"""

# Keywords to match in headlines and summaries
ALERT_KEYWORDS = [
    # Iran-related
    "iran", "iranian", "tehran", "irgc", "revolutionary guard",
    "khamenei", "persian gulf", "strait of hormuz",
    # Yemen-related
    "yemen", "yemeni", "houthi", "ansar allah", "sanaa", "sana'a", "aden",
    "red sea", "bab al-mandab",
    # Regional conflict terms
    "hezbollah", "proxy war", "axis of resistance",
    "iraq militia", "islamic resistance",
    # Military / war terms (paired with region keywords in matching logic)
    "airstrike", "air strike", "missile", "drone strike", "bombing",
    "ceasefire", "cease-fire", "escalation", "retaliation",
    "military operation", "naval blockade", "sanctions",
    "nuclear deal", "jcpoa", "enrichment",
    # Key actors
    "ansarallah", "quds force", "kata'ib hezbollah",
    "popular mobilization", "hashd al-shaabi",
]

# Region keywords — at least one must appear alongside a general military term
REGION_KEYWORDS = [
    "iran", "iranian", "tehran", "yemen", "yemeni", "houthi",
    "iraq", "iraqi", "syria", "syrian", "lebanon", "lebanese",
    "middle east", "gulf", "red sea", "persian gulf",
    "oman", "bahrain", "saudi", "arabia",
]

# RSS / Atom feeds — a mix of major wires and Middle-East-focused outlets
NEWS_FEEDS = {
    # --- Major wire services ---
    "Reuters World": "https://www.reutersagency.com/feed/?taxonomy=best-sectors&post_type=best",
    "AP News": "https://rsshub.app/apnews/topics/world-news",
    "Al Jazeera": "https://www.aljazeera.com/xml/rss/all.xml",
    "BBC World": "http://feeds.bbci.co.uk/news/world/middle_east/rss.xml",

    # --- Middle-East-focused ---
    "Al Jazeera English": "https://www.aljazeera.com/xml/rss/all.xml",
    "Middle East Eye": "https://www.middleeasteye.net/rss",
    "The New Arab": "https://www.newarab.com/rss",
    "Iran International": "https://www.iranintl.com/en/rss",
    "Arab News": "https://www.arabnews.com/rss.xml",

    # --- Conflict / defense ---
    "Defense One": "https://www.defenseone.com/rss/",
    "War on the Rocks": "https://warontherocks.com/feed/",
    "The War Zone": "https://www.thedrive.com/the-war-zone/rss",

    # --- Google News search feeds ---
    "Google News - Iran War": "https://news.google.com/rss/search?q=iran+war&hl=en-US&gl=US&ceid=US:en",
    "Google News - Yemen Houthi": "https://news.google.com/rss/search?q=yemen+houthi&hl=en-US&gl=US&ceid=US:en",
    "Google News - Iran Yemen": "https://news.google.com/rss/search?q=iran+yemen+conflict&hl=en-US&gl=US&ceid=US:en",
    "Google News - Middle East War": "https://news.google.com/rss/search?q=middle+east+war&hl=en-US&gl=US&ceid=US:en",
}

# How often to poll feeds (seconds)
POLL_INTERVAL_SECONDS = 120  # 2 minutes

# Maximum age of articles to consider (hours)
MAX_ARTICLE_AGE_HOURS = 24

# Relevance score threshold (0-100) — articles below this are skipped
RELEVANCE_THRESHOLD = 30

# Desktop notification settings
ENABLE_DESKTOP_NOTIFICATIONS = True
ENABLE_SOUND = True

# File to persist seen article IDs across restarts
SEEN_ARTICLES_FILE = "seen_articles.json"

# Log file
LOG_FILE = "news_alerts.log"
