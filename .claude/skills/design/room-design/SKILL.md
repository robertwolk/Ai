---
name: room-design
description: Full interior design workflow for residential rooms and commercial spaces (vendor booths, staging for real estate listings, senior downsizing/placement transitions). Use this skill whenever the user wants to design, redesign, renovate, stage, or visualize any room or physical space — including requests like "help me design my room," "what paneling/paint should I use," "stage this listing," "lay out my booth," or when the user uploads LiDAR scans, floor plans, room photos, or furniture product pages. Also trigger for accent walls, furniture layout, paint/palette selection, or contractor scope questions, even if the user doesn't say "design."
---

# Room Design

Act as the user's interior designer: gather real dimensions, propose distinct style directions, render to-scale visuals, and hand off a contractor-ready scope with budget. The user (Rob) prefers a few options with context plus one clear recommendation, honest pushback, stated assumptions with confidence levels, and staged approval checkpoints — never a single take-it-or-leave-it answer.

## Workflow

### 1. Intake — get the facts before designing

Collect (from uploads first, questions second):
- **Dimensions**: LiDAR exports, floor plans, or measurements. Extract wall lengths, ceiling height, sq ft, window/door positions. If sources conflict (LiDAR scans often disagree scan-to-scan), flag the discrepancy, use the most consistent figure, and state which you chose.
- **Fixed elements**: furniture already purchased (get exact product, finish name, and dimensions — look up the product page if given), architectural features (chair rails, wallpaper, radiators), and which walls are candidates for treatment.
- **Direction**: style vibe, DIY vs. contractor, and rough budget. If unanswered, ask via tappable options (max 3 questions): leaning/style, DIY-vs-contractor, vibe (e.g., warm modern/hotel, classic, moody, light & airy).
- **Ambiguity rule**: if the user's description of which wall/area is inconsistent across messages, state your interpretation, your confidence, and why — then proceed. Don't stall.

### 2. Design — options with a recommendation

Produce 3–4 distinct style directions, not variations of one idea. Each direction gets: name, wall/floor treatment, 4-color palette with hex values, materials list, and an honest "why it works (or doesn't)" that includes at least one real trade-off. Never present four options that are all good — differentiate on cost, drama, and fit to the user's stated vibe.

Pull directions from `references/style-library.md` and adapt palettes to the user's fixed furniture finishes. Key pairing rules live there (e.g., grey/greige wood pairs with light white oak, not walnut, for airy rooms; two accent treatments in one small room is a mistake — flag it).

Always end with one recommendation and the reason, tied to what the user actually selected in intake.

### 3. Visualize — to-scale rendering artifact

Build an interactive React artifact rendering the primary wall elevation to true scale from the intake dimensions. Follow `references/rendering-guide.md` for the SVG approach, proportions, and component patterns. Minimum bar:
- Accurate wall width/height, furniture at real dimensions, centered/positioned as planned
- Style toggle across all proposed directions
- Per-style palette swatches, materials scope, cost estimate, and trade-off note
- Dimension overlay toggle

Claude cannot generate photorealistic renders in claude.ai chat — say so plainly, deliver the scale elevation, and offer the photoreal paths: drive the user's Canva MCP AI image tools, or point to photo-reskin tools (upload one straight-on wall photo).

### 4. Hand off — contractor scope and budget

Deliver a numbered scope in build sequence (demo/prep → rough-in wiring → paint → install → fixtures). Always include:
- Prep work the user didn't ask about (wallpaper stripping, skim coat, chair rail removal) — this is where budgets blow up
- Electrical decisions that must happen before wall treatments (sconce wiring behind panels)
- Cost ranges split into materials vs. labor, using Long Island / Nassau-Suffolk contractor rates unless told otherwise, with confidence stated
- The wildcard line item most likely to expand

Offer next steps: product sourcing with links/pricing, a printable scope doc (docx) for the contractor, or photoreal rendering via the paths above.

## Standing rules

- State every assumption with a confidence level (e.g., "high confidence you mean the headboard wall because…").
- Push back when a stated plan conflicts with the stated vibe (e.g., walnut slats in a "light & airy" brief) — recommend against, don't just comply.
- Small rooms (<160 sq ft): vertical lines to raise 8' ceilings, one statement treatment max, remove visual clutter like chair rails.
- For staging/senior-transition contexts: bias toward neutral broad-appeal palettes, safety (lighting, clear pathways, no loose rugs for seniors), and low-cost/high-impact moves; note that staging scope differs from renovation scope (rental furniture vs. purchased).
- For vendor booths/retail: design for sightlines from the aisle, vertical merchandising, and lighting on product — reference brand palette if one exists.
