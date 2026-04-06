#!/usr/bin/env python3
"""
Web frontend for the Middle East News Alert Monitor.

Usage:
    python web.py                  # Start on port 5000
    python web.py --port 8080      # Custom port
"""

import argparse
import json
from flask import Flask, render_template, jsonify, request

from fetcher import fetch_all_feeds
from scorer import score_article
from config import RELEVANCE_THRESHOLD

app = Flask(__name__)

# In-memory seen set (resets on server restart)
seen_uids: set = set()


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/scan")
def api_scan():
    threshold = request.args.get("threshold", RELEVANCE_THRESHOLD, type=int)

    articles = fetch_all_feeds()
    alerts = []

    for article in articles:
        uid = article["uid"]
        if uid in seen_uids:
            continue

        score_info = score_article(
            title=article["title"],
            summary=article["summary"],
            source_name=article["source"],
            published_dt=article.get("published"),
        )

        if score_info["score"] >= threshold:
            alerts.append({
                "title": article["title"],
                "summary": article["summary"],
                "link": article["link"],
                "source": article["source"],
                "published": article["published"].isoformat() if article.get("published") else None,
                "uid": uid,
                "score": score_info["score"],
                "matched_keywords": score_info["matched_keywords"],
                "reason": score_info["reason"],
            })

        seen_uids.add(uid)

    alerts.sort(key=lambda x: x["score"], reverse=True)

    return jsonify({
        "alerts": alerts,
        "total_fetched": len(articles),
        "new_articles": len([a for a in articles if a["uid"] not in seen_uids]),
    })


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=5000)
    parser.add_argument("--host", default="0.0.0.0")
    args = parser.parse_args()

    print(f"\n  Middle East News Alert Monitor")
    print(f"  Dashboard: http://localhost:{args.port}")
    print(f"  Press Ctrl+C to stop\n")

    app.run(host=args.host, port=args.port, debug=False)
