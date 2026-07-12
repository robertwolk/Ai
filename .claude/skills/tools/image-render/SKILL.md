---
name: image-render
description: Generate photorealistic images — interior renders, product shots, concept visuals — from a text prompt and (optionally) a reference image, using Google's Gemini image API ("Nano Banana"). Use whenever the user wants a photoreal render or photo of a designed space or object ("render this room photorealistically", "make a photo of the bedroom", "visualize this in real life"), or as the photoreal step after the room-design workflow. Requires a free GEMINI_API_KEY. Claude cannot render photoreal images on its own; this skill calls an external image model to do it.
---

# Image Render

Turn a design or description into a photorealistic image by calling Google's Gemini
image model. This is the "make it look real" step — pair it with `room-design`, which
produces the layout, palette, and prompts, then render here.

Based on the open-source "Nano Banana" (Gemini image) skill pattern, trimmed to a
single reviewed script that only calls Google's image endpoint.

## One-time setup

1. Get a **free API key** at https://aistudio.google.com/apikey (Google AI Studio).
2. Make it available to the session:
   - `export GEMINI_API_KEY=<key>` (or set it as a project/environment secret so it
     loads automatically in Claude Code on the web).
3. Outbound HTTPS to `generativelanguage.googleapis.com` must be allowed by the
   environment's network policy. If a call fails with a proxy/network error, the
   domain needs to be permitted.

## Generate

Run the script with a prompt (and optional reference image):

```
python3 scripts/generate.py --prompt "PROMPT" --out render.png
python3 scripts/generate.py --prompt "PROMPT" --ref layout.png --out render.png
python3 scripts/generate.py --prompt "PROMPT" --model gemini-3-pro-image-preview
```

- `--prompt` — the image description (required).
- `--ref` — a reference image to condition on. For interiors, pass a screenshot of
  the to-scale plan/elevation/walk-through so the render keeps the same composition
  and furniture placement.
- `--out` — output path (default `render.png`).
- `--model` — `gemini-2.5-flash-image` (default, fast) or `gemini-3-pro-image-preview`
  (higher quality).

After it writes the file, show the image to the user and offer to iterate.

## Writing a strong photoreal prompt

Lead with the shot, then the space, then materials, then light, then camera. Name real
materials and finishes; state one camera position. Example skeleton:

> Photorealistic architectural interior photograph of [room], [dimensions/ceiling].
> [Camera position and what it faces]. [Key furniture with real finishes]. [Wall/floor
> materials and colors]. [Lighting: warm 2700K + daylight source]. Wide 20mm lens, eye
> level, shallow depth of field, calm and uncluttered, ultra-detailed, 16:9.

For a consistent set, keep every clause identical across shots and change only the
camera line. Pass the same `--ref` layout image each time for placement fidelity.

## Dimension-accurate renders (reskin a to-scale model) — PREFERRED for rooms

Text-to-image will not honor exact dimensions (a "10×14 ft" room comes out generically
spacious). When proportions matter, don't describe the geometry — **hand it to the image
model as a picture**. Screenshot a to-scale 3D model and have Gemini reskin it: the
structure (room shape, furniture placement, camera) is preserved, and the model only
applies real materials and light.

Workflow:

1. **Build/obtain a to-scale model.** The `room-design` skill's interactive walk-through
   is built to the real dimensions — use it, or any HTML/CSS-3D scene at true scale.
2. **Capture the view** with the screenshot helper (hides UI chrome, can jump to a
   preset camera):
   ```
   NODE_PATH=$(npm root -g) node scripts/screenshot.js \
     --html /path/to/walkthrough.html --out ref.png \
     --selector "#vp" --hide ".hint,.compass" --wait 2200 \
     [--click "text=Foot of bed"]
   ```
   (Requires Playwright + Chromium — pre-installed in Claude Code web environments.)
3. **Reskin it** — pass the screenshot as `--ref` with a prompt that says *keep the exact
   proportions/camera/placement* and only changes materials:
   ```
   python3 scripts/generate.py --ref ref.png --out render.png --prompt \
   "Convert this 3D room-layout screenshot into a PHOTOREALISTIC interior photograph.
    CRITICAL: keep the EXACT room proportions, camera viewpoint and furniture placement
    of the reference; do NOT widen or enlarge the room. Reskin with real materials:
    [walls / floor / furniture finishes]. Natural daylight, ultra-detailed. Ignore any
    on-screen text or icons."
   ```
4. To change one wall/finish (e.g. "paint the east wall, remove the curtains"), re-run
   step 3 against the **same** `ref.png` with the one change stated — the geometry stays
   put because the reference is unchanged.

This is the preferred path for room renders: it fixes the "dimensions are wrong" problem
that plain text prompting can't.

## Honest limits

- This produces **still images**, not a navigable walk-through video. For video, render
  several angles here and animate a still with an image-to-video tool, or use a
  browser 3D tool (e.g. Coohom).
- Image models can drift on exact dimensions; the `--ref` image and precise prompts
  reduce this but won't make it CAD-accurate. Treat output as a realistic impression.
- Free-tier keys have daily limits; heavy batches may need a paid key.
