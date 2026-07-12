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

## Honest limits

- This produces **still images**, not a navigable walk-through video. For video, render
  several angles here and animate a still with an image-to-video tool, or use a
  browser 3D tool (e.g. Coohom).
- Image models can drift on exact dimensions; the `--ref` image and precise prompts
  reduce this but won't make it CAD-accurate. Treat output as a realistic impression.
- Free-tier keys have daily limits; heavy batches may need a paid key.
