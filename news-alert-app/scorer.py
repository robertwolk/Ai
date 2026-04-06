"""
Relevance scoring engine for news articles.
Scores articles based on keyword matches, source, and recency.
"""

import re
from datetime import datetime, timezone
from config import ALERT_KEYWORDS, REGION_KEYWORDS, MAX_ARTICLE_AGE_HOURS


def score_article(title: str, summary: str, source_name: str, published_dt: datetime | None) -> dict:
    """
    Score an article for relevance to Iranian war / Middle East conflict news.

    Returns a dict with:
        score: int 0-100
        matched_keywords: list[str]
        reason: str
    """
    text = f"{title} {summary}".lower()
    title_lower = title.lower()

    matched = []
    score = 0

    # --- Keyword matching ---
    for kw in ALERT_KEYWORDS:
        pattern = r"\b" + re.escape(kw) + r"\b"
        if re.search(pattern, text):
            matched.append(kw)
            # Title matches are worth more
            if re.search(pattern, title_lower):
                score += 12
            else:
                score += 6

    # --- Region anchoring ---
    # If we matched generic military terms, boost only if a region keyword also appears
    has_region = any(re.search(r"\b" + re.escape(rk) + r"\b", text) for rk in REGION_KEYWORDS)
    if has_region:
        score += 10

    # --- Source bonus ---
    # Middle-East-focused outlets get a small boost
    me_sources = {"al jazeera", "middle east eye", "the new arab", "iran international", "arab news"}
    if source_name.lower() in me_sources:
        score += 5

    # --- Recency bonus ---
    if published_dt:
        try:
            now = datetime.now(timezone.utc)
            if published_dt.tzinfo is None:
                published_dt = published_dt.replace(tzinfo=timezone.utc)
            age_hours = (now - published_dt).total_seconds() / 3600
            if age_hours < 1:
                score += 15  # Breaking news
            elif age_hours < 3:
                score += 10
            elif age_hours < 6:
                score += 5
            elif age_hours > MAX_ARTICLE_AGE_HOURS:
                score = 0  # Too old, discard
        except Exception:
            pass

    # Cap at 100
    score = min(score, 100)

    # Build reason string
    if not matched:
        reason = "No keyword matches"
    else:
        reason = f"Matched: {', '.join(matched[:8])}"
        if has_region:
            reason += " [region confirmed]"

    return {"score": score, "matched_keywords": matched, "reason": reason}
