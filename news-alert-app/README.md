# Middle East News Alert Monitor

Real-time news monitoring app focused on the Iranian war and Middle Eastern conflicts, with emphasis on Yemen/Houthi activity.

## Features

- **17+ RSS feeds** from major wire services (Reuters, AP, BBC) and Middle-East-focused outlets (Al Jazeera, Iran International, Middle East Eye)
- **Keyword scoring engine** that weights matches by relevance, position (title vs body), and recency
- **Desktop notifications** with urgency levels (critical for score >= 70)
- **Sound alerts** for breaking-level news
- **Deduplication** across restarts via persistent article ID storage
- **Rich terminal UI** with color-coded alert panels

## Quick Start

```bash
# Install dependencies
pip install -r requirements.txt

# Run the live monitor (checks every 2 minutes)
python app.py

# Run once and exit (good for testing)
python app.py --once

# Custom settings
python app.py --threshold 40 --interval 60
```

## How Scoring Works

Each article is scored 0–100 based on:

| Factor | Points |
|--------|--------|
| Keyword match in title | +12 per keyword |
| Keyword match in body | +6 per keyword |
| Region keyword confirmed | +10 |
| Middle East source outlet | +5 |
| Published < 1 hour ago | +15 |
| Published < 3 hours ago | +10 |
| Published < 6 hours ago | +5 |

Articles scoring below the threshold (default 30) are filtered out.

## Configuration

Edit `config.py` to:
- Add/remove keywords or RSS feeds
- Adjust poll interval and thresholds
- Toggle desktop notifications and sound

## Files

| File | Purpose |
|------|---------|
| `app.py` | Main entry point and terminal UI |
| `fetcher.py` | RSS feed fetching and normalization |
| `scorer.py` | Relevance scoring engine |
| `alerter.py` | Desktop notification and sound alerts |
| `config.py` | All configuration (feeds, keywords, settings) |
