#!/usr/bin/env python3
"""
Generate a photorealistic image with Google's Gemini image API ("Nano Banana").

Standard library only. Reads the API key from the GEMINI_API_KEY environment
variable. Optionally conditions on a reference image (e.g. a screenshot of a
to-scale layout) so the render keeps the same composition.

Usage:
  export GEMINI_API_KEY=...        # free key: https://aistudio.google.com/apikey
  python3 generate.py --prompt "photorealistic bedroom ..." --out render.png
  python3 generate.py --prompt "..." --ref layout.png --out render.png
  python3 generate.py --prompt "..." --model gemini-3-pro-image-preview

Exit codes: 0 ok, 2 usage/env error, 3 API error, 4 no image returned.
"""
import argparse
import base64
import json
import mimetypes
import os
import sys
import urllib.error
import urllib.request

ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
DEFAULT_MODEL = "gemini-2.5-flash-image"  # "Nano Banana"; Pro: gemini-3-pro-image-preview


def build_parts(prompt, ref_path):
    parts = [{"text": prompt}]
    if ref_path:
        if not os.path.isfile(ref_path):
            sys.exit(f"[error] reference image not found: {ref_path}")
        mime = mimetypes.guess_type(ref_path)[0] or "image/png"
        with open(ref_path, "rb") as fh:
            data = base64.b64encode(fh.read()).decode("ascii")
        parts.append({"inline_data": {"mime_type": mime, "data": data}})
    return parts


def extract_image(resp):
    """Return (mime, raw_bytes) for the first inline image in the response, or None."""
    for cand in resp.get("candidates", []):
        for part in cand.get("content", {}).get("parts", []):
            blob = part.get("inlineData") or part.get("inline_data")
            if blob and blob.get("data"):
                mime = blob.get("mimeType") or blob.get("mime_type") or "image/png"
                return mime, base64.b64decode(blob["data"])
    return None


def main():
    ap = argparse.ArgumentParser(description="Generate an image via the Gemini image API.")
    ap.add_argument("--prompt", required=True, help="Text prompt for the image.")
    ap.add_argument("--ref", help="Optional reference image path to condition on.")
    ap.add_argument("--out", default="render.png", help="Output file path (default render.png).")
    ap.add_argument("--model", default=DEFAULT_MODEL, help=f"Model id (default {DEFAULT_MODEL}).")
    args = ap.parse_args()

    key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")
    if not key:
        sys.exit("[error] set GEMINI_API_KEY (free at https://aistudio.google.com/apikey)")

    body = json.dumps({"contents": [{"parts": build_parts(args.prompt, args.ref)}]}).encode()
    url = ENDPOINT.format(model=args.model)
    req = urllib.request.Request(
        url, data=body, method="POST",
        headers={"Content-Type": "application/json", "x-goog-api-key": key},
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            resp = json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        detail = e.read().decode(errors="replace")[:800]
        sys.exit(f"[error] Gemini API {e.code}: {detail}")
    except urllib.error.URLError as e:
        sys.exit(f"[error] network/proxy issue reaching Gemini: {e.reason}")

    found = extract_image(resp)
    if not found:
        msg = json.dumps(resp)[:800]
        sys.exit(f"[error] no image in response (safety block or wrong model?): {msg}")

    _, raw = found
    with open(args.out, "wb") as fh:
        fh.write(raw)
    print(f"[ok] wrote {args.out} ({len(raw)} bytes) with {args.model}")


if __name__ == "__main__":
    main()
