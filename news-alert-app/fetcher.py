"""
RSS/Atom feed fetcher using stdlib xml.etree (no feedparser dependency).
Pulls articles from configured news feeds and returns normalized entries.
"""

import xml.etree.ElementTree as ET
import requests
from datetime import datetime, timezone
from dateutil import parser as dateparser
from config import NEWS_FEEDS

# Common Atom namespace
ATOM_NS = "{http://www.w3.org/2005/Atom}"


def _parse_rss_items(root) -> list[dict]:
    """Parse RSS 2.0 <item> elements."""
    items = []
    for item in root.iter("item"):
        title = (item.findtext("title") or "").strip()
        summary = (item.findtext("description") or "").strip()
        link = (item.findtext("link") or "").strip()
        uid = (item.findtext("guid") or link).strip()
        date_str = item.findtext("pubDate") or item.findtext("dc:date") or ""
        items.append({"title": title, "summary": summary, "link": link, "uid": uid, "date_str": date_str.strip()})
    return items


def _parse_atom_entries(root) -> list[dict]:
    """Parse Atom <entry> elements."""
    items = []
    for entry in root.iter(f"{ATOM_NS}entry"):
        title = (entry.findtext(f"{ATOM_NS}title") or "").strip()
        summary = (entry.findtext(f"{ATOM_NS}summary") or entry.findtext(f"{ATOM_NS}content") or "").strip()
        link_el = entry.find(f"{ATOM_NS}link[@rel='alternate']")
        if link_el is None:
            link_el = entry.find(f"{ATOM_NS}link")
        link = (link_el.get("href", "") if link_el is not None else "").strip()
        uid = (entry.findtext(f"{ATOM_NS}id") or link).strip()
        date_str = (entry.findtext(f"{ATOM_NS}updated") or entry.findtext(f"{ATOM_NS}published") or "").strip()
        items.append({"title": title, "summary": summary, "link": link, "uid": uid, "date_str": date_str})
    return items


def _parse_feed(content: bytes) -> list[dict]:
    """Auto-detect RSS vs Atom and parse."""
    try:
        root = ET.fromstring(content)
    except ET.ParseError:
        return []

    # Check if Atom
    if root.tag == f"{ATOM_NS}feed" or root.tag == "feed":
        return _parse_atom_entries(root)

    # RSS 2.0: root is <rss> with <channel> children
    items = _parse_rss_items(root)
    if items:
        return items

    # Also try Atom entries without namespace (some feeds)
    for entry in root.iter("entry"):
        title = (entry.findtext("title") or "").strip()
        summary = (entry.findtext("summary") or entry.findtext("content") or "").strip()
        link_el = entry.find("link[@rel='alternate']") or entry.find("link")
        link = (link_el.get("href", "") if link_el is not None else "").strip()
        uid = (entry.findtext("id") or link).strip()
        date_str = (entry.findtext("updated") or entry.findtext("published") or "").strip()
        items.append({"title": title, "summary": summary, "link": link, "uid": uid, "date_str": date_str})

    return items


def fetch_all_feeds() -> list[dict]:
    """
    Fetch all configured RSS feeds and return a flat list of article dicts.
    """
    articles = []

    for source_name, feed_url in NEWS_FEEDS.items():
        try:
            resp = requests.get(feed_url, timeout=15, headers={
                "User-Agent": "MiddleEastNewsAlert/1.0"
            })
            resp.raise_for_status()
        except Exception:
            continue

        raw_items = _parse_feed(resp.content)

        for item in raw_items:
            published = None
            if item["date_str"]:
                try:
                    published = dateparser.parse(item["date_str"])
                    if published and published.tzinfo is None:
                        published = published.replace(tzinfo=timezone.utc)
                except Exception:
                    pass

            if item["title"]:
                articles.append({
                    "title": item["title"],
                    "summary": item["summary"],
                    "link": item["link"],
                    "source": source_name,
                    "published": published,
                    "uid": item["uid"] or item["link"],
                })

    return articles
