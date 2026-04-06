#!/usr/bin/env python3
"""
Middle East News Alert App
===========================
Monitors RSS feeds for Iranian war and Middle Eastern conflict news.
Alerts immediately when relevant articles are detected.

Usage:
    python app.py              # Run the live monitor
    python app.py --once       # Fetch once and exit (good for testing)
    python app.py --threshold 50  # Set custom relevance threshold
"""

import argparse
import json
import logging
import signal
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

from rich.console import Console
from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

from config import (
    ENABLE_DESKTOP_NOTIFICATIONS,
    ENABLE_SOUND,
    LOG_FILE,
    POLL_INTERVAL_SECONDS,
    RELEVANCE_THRESHOLD,
    SEEN_ARTICLES_FILE,
)
from fetcher import fetch_all_feeds
from scorer import score_article
from alerter import send_desktop_notification, play_alert_sound

console = Console()

# ---------- Persistence ----------

def load_seen(path: str) -> set:
    p = Path(path)
    if p.exists():
        try:
            return set(json.loads(p.read_text()))
        except Exception:
            return set()
    return set()


def save_seen(path: str, seen: set):
    # Keep only the latest 10 000 IDs to avoid unbounded growth
    trimmed = list(seen)[-10_000:]
    Path(path).write_text(json.dumps(trimmed))


# ---------- Display ----------

BANNER = r"""
[bold red]
 __  __ ___ ____  ____  _     _____   _____    _    ____ _____
|  \/  |_ _|  _ \|  _ \| |   | ____| | ____|  / \  / ___|_   _|
| |\/| || || | | | | | | |   |  _|   |  _|   / _ \ \___ \ | |
| |  | || || |_| | |_| | |___| |___  | |___ / ___ \ ___) || |
|_|  |_|___|____/|____/|_____|_____| |_____/_/   \_\____/ |_|

         [bold yellow]NEWS ALERT MONITOR[/bold yellow] — Iran · Yemen · Middle East
[/bold red]
"""


def build_alert_panel(article: dict, score_info: dict) -> Panel:
    """Build a rich Panel for a single alert."""
    urgency_color = "red" if score_info["score"] >= 70 else "yellow" if score_info["score"] >= 50 else "cyan"

    content = Text()
    content.append(f"\n  {article['title']}\n", style=f"bold {urgency_color}")
    content.append(f"  Source: ", style="dim")
    content.append(f"{article['source']}\n", style="bold white")
    if article.get("published"):
        content.append(f"  Time:   ", style="dim")
        content.append(f"{article['published'].strftime('%Y-%m-%d %H:%M UTC')}\n", style="white")
    content.append(f"  Score:  ", style="dim")
    content.append(f"{score_info['score']}/100", style=f"bold {urgency_color}")
    content.append(f"  ({score_info['reason']})\n", style="dim")
    content.append(f"  Link:   ", style="dim")
    content.append(f"{article['link']}\n", style="underline blue")

    border = "heavy" if score_info["score"] >= 70 else "rounded"
    return Panel(content, title=f"[bold {urgency_color}] ALERT [/bold {urgency_color}]",
                 border_style=urgency_color, expand=True, padding=(0, 1))


def build_status_table(cycle: int, total_fetched: int, alerts_this_cycle: int, total_alerts: int, next_check: str) -> Table:
    """Build the status bar table."""
    table = Table(show_header=False, box=None, padding=(0, 2))
    table.add_column(style="dim")
    table.add_column(style="bold")
    table.add_row("Cycle", str(cycle))
    table.add_row("Articles scanned", str(total_fetched))
    table.add_row("Alerts this cycle", str(alerts_this_cycle))
    table.add_row("Total alerts", str(total_alerts))
    table.add_row("Next check", next_check)
    return table


# ---------- Main loop ----------

def run_once(threshold: int, seen: set) -> tuple[list, set]:
    """Run a single fetch-score-alert cycle. Returns (alerts, updated_seen)."""
    articles = fetch_all_feeds()
    alerts = []

    for article in articles:
        uid = article["uid"]
        if uid in seen:
            continue

        score_info = score_article(
            title=article["title"],
            summary=article["summary"],
            source_name=article["source"],
            published_dt=article.get("published"),
        )

        if score_info["score"] >= threshold:
            alerts.append((article, score_info))

        seen.add(uid)

    # Sort by score descending
    alerts.sort(key=lambda x: x[1]["score"], reverse=True)
    return alerts, seen


def main():
    parser = argparse.ArgumentParser(description="Middle East News Alert Monitor")
    parser.add_argument("--once", action="store_true", help="Run one cycle and exit")
    parser.add_argument("--threshold", type=int, default=RELEVANCE_THRESHOLD,
                        help=f"Minimum relevance score (default: {RELEVANCE_THRESHOLD})")
    parser.add_argument("--interval", type=int, default=POLL_INTERVAL_SECONDS,
                        help=f"Poll interval in seconds (default: {POLL_INTERVAL_SECONDS})")
    args = parser.parse_args()

    # Setup logging
    logging.basicConfig(
        filename=LOG_FILE,
        level=logging.INFO,
        format="%(asctime)s  %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # Graceful shutdown
    shutdown = False
    def handle_signal(sig, frame):
        nonlocal shutdown
        shutdown = True
        console.print("\n[yellow]Shutting down gracefully...[/yellow]")
    signal.signal(signal.SIGINT, handle_signal)
    signal.signal(signal.SIGTERM, handle_signal)

    console.print(BANNER)
    console.print(f"[dim]Threshold: {args.threshold} | Poll interval: {args.interval}s | Press Ctrl+C to stop[/dim]\n")

    seen = load_seen(SEEN_ARTICLES_FILE)
    cycle = 0
    total_alerts = 0

    while not shutdown:
        cycle += 1
        console.print(f"[dim]--- Cycle {cycle} | {datetime.now(timezone.utc).strftime('%H:%M:%S UTC')} | Scanning feeds... ---[/dim]")

        try:
            alerts, seen = run_once(args.threshold, seen)
        except Exception as e:
            console.print(f"[red]Error during fetch cycle: {e}[/red]")
            alerts = []

        if alerts:
            total_alerts += len(alerts)
            for article, score_info in alerts:
                console.print(build_alert_panel(article, score_info))

                # Log the alert
                logging.info(
                    f"[ALERT score={score_info['score']}] {article['source']}: "
                    f"{article['title']} — {article['link']}"
                )

                # Desktop notification for high-score alerts
                if ENABLE_DESKTOP_NOTIFICATIONS and score_info["score"] >= 50:
                    send_desktop_notification(
                        title=f"NEWS ALERT [{article['source']}]",
                        message=article["title"],
                        urgency="critical" if score_info["score"] >= 70 else "normal",
                    )

                # Sound for breaking-level alerts
                if ENABLE_SOUND and score_info["score"] >= 70:
                    play_alert_sound()
        else:
            console.print("[dim]  No new relevant articles this cycle.[/dim]")

        # Persist seen articles
        save_seen(SEEN_ARTICLES_FILE, seen)

        if args.once:
            break

        # Countdown to next check
        next_time = datetime.now(timezone.utc).strftime("%H:%M:%S UTC")
        console.print(build_status_table(cycle, len(seen), len(alerts), total_alerts,
                                          f"in {args.interval}s"))
        console.print()

        # Sleep in small increments so Ctrl+C is responsive
        for _ in range(args.interval):
            if shutdown:
                break
            time.sleep(1)

    console.print("[green]Monitor stopped. Goodbye.[/green]")


if __name__ == "__main__":
    main()
