# Rendering Guide — To-Scale Elevation Artifacts

How to build the interactive React design-studio artifact. Read the frontend-design skill too if available — apply its palette/typography discipline to the app chrome.

## Core approach

Render the feature wall as a front elevation in SVG, everything in real inches multiplied by one scale constant:

```jsx
const WALL_W = 159;          // wall width, inches (from LiDAR/intake)
const WALL_H = 96;           // ceiling height, inches
const SCALE = 4.4;           // px per inch — tune so W ≈ 700px
const px = (inches) => inches * SCALE;
```

Every furniture piece uses published product dimensions (queen bed frame ≈ 65"W; standard nightstand 24"W × 24"H; sconces centered ~60–62" AFF). Never eyeball proportions — the credibility of the tool is scale accuracy.

## Component structure

- **Wall treatments as swappable components**: `<Slats>`, `<BoardBatten>`, `<FlatPanels>`, each filling the full W×H, driven by a per-style config object (colors, slat pitch, batten grid).
  - Slats: 3" pitch (1.5" slat + 1.5" gap), map an array of rects, vary fill across 3 close tones by index for realism, dark gap-shadow base layer behind.
  - Board & batten: field rect + vertical/horizontal batten rects on a grid.
  - Flat panels: field + thin recessed reveal lines.
  - Overlay a subtle vertical gradient (`#000` at 5–6% opacity top/bottom) on every treatment for depth.
- **Furniture layered on top**: headboard (rounded-corner rect + faint grain strokes + top-light/bottom-shade gradient), mattress/duvet/pillows as rounded rects, nightstands, sconces (mount + warm glow ellipses at low opacity).
- **Floor strip** below the wall (wood tone) with a rug sliver per style.
- **Dimension overlay** (toggleable): arrow-marker lines + monospace labels for wall width, ceiling height, and key furniture widths.

## Style config pattern

One array of style objects drives everything — each with `id, name, tag, treatment, palette[], materials, cost, why`. The UI maps over it for selector chips and detail cards. The "why" field must contain a genuine trade-off, not marketing copy.

## App layout

- Header: address/room label eyebrow + serif display title
- Pill selector for styles + dimensions toggle
- Elevation panel (light card, generous padding, `overflowX: auto`)
- Three detail cards below: Palette (swatch + name + hex), Materials & scope (+ cost chip), Why it works (or doesn't)
- Footer note stating the data sources and that costs are regional ballparks

## Constraints

- No localStorage/sessionStorage — state in React only
- Single-file JSX, default export, no required props
- Load display fonts via a `<link>` injected in `useEffect` (Google Fonts)
- Save to /mnt/user-data/outputs and present with present_files
- Be honest in the accompanying message: this is a scale elevation, not a photorealistic render; offer Canva MCP AI-image generation or photo-reskin tools as the photoreal path
