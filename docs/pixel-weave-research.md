# Fold research and Pixel Weave implementation

Inspected 2026-09-23. Scope: Fold and related pixel pattern families. The user explicitly deferred the full 52-tool collection and requested a standalone `/folds` route, absent from the main XD UI index.

## Evidence

- [Playgrnd index](https://www.playgrnd.tools/): its shipped catalog enumerates 52 tools in five groups. Pixel-related entries include Oddgrid, Quilt, Vee, Parcel, Weave, Static, Optic, Prism, Delta, Totem, Sampler, Bloom, Stitch and Fold. The remaining tools cover many different systems, including typography, vector marbling, botanical patterns and blurred backgrounds. They are not all modes of the same engine.
- [Fold](https://www.playgrnd.tools/fold): inspected live controls in an isolated Chromium browser and the page's publicly delivered inline JavaScript. The core is client-side Canvas 2D. No image-generation model or image API is involved in that renderer.
- [XD UI](https://ui.surajgaud.com/): inspected the existing showcase and its local `generate-avatar` example. It already demonstrates string-to-SVG generation; the new engine keeps that convenient API shape.

## Confirmed Fold mechanism

1. A numerical seed drives a repeatable PRNG. New variation deals a fresh patch count, patch size, pattern scale, wave, levels and tilt. Palette, fold and pixel size remain separate.
2. Each patch has a position, dimensions, rotation, rectangular or oval boundary, pattern, color pair and frequency. Pattern families are zebra, stairs, dots, bursts, chevrons and checks.
3. The renderer samples a coarse grid, not a full-resolution image. Each cell maps through horizontal/vertical reflection around adjustable axes; kaleidoscope adds diagonal reflection.
4. Patches are sampled from the topmost layer down. A sample outside every patch falls back to a quantized radial background. This is why folds produce large coherent shapes, not independent random pixels.
5. A small offscreen canvas is scaled with smoothing disabled. Aspect ratio changes the sampling domain; export resolution changes output size.
6. The source selects dark/light inks for zebra patches and other pairs for other patterns. Its optional grain and dithering are separate post-processing passes.
7. Motion uses time-dependent coordinates/phase; the UI provides animation, frame controls, captures, palette management and image/video export.

These are observations of the inspected page, not a promise that the upstream site will remain unchanged. We did not reverse engineer every other tool or assert a shared implementation across the catalog.

## What we built

Pixel Weave is a new implementation of the general patch-and-fold technique. It does not reproduce Playgrnd seeds, distribute its source, reuse its logos, or embed the remote tool. Its main differences:

- Exact string seeds hashed with an explicit v1 namespace; variation affects geometry separately from color choice.
- A pure TypeScript grid renderer that also runs in Node, plus compact SVG and data-URL encoders. No runtime dependencies.
- Five fold modes; six procedural pattern families; folded collage, tile quilt and contour field styles.
- Strict color parsing before SVG encoding. Seed text never becomes SVG markup. Finite numeric bounds cap work at a 192 × 192 grid.
- Even-sized sampling grids and source-coordinate texture ensure exact central symmetry, including grain/dither.
- Palette inks are intentionally part of the artwork; the studio and Fanout interface chrome remain separately styled.
- React missing-image handling, stable resource seeds, original-image preference and source-change recovery.
- A standalone studio with accessible controls, reduced-motion handling, session captures, local palette persistence, shareable recipes, source download and SVG/PNG export.

This release exports static SVG/PNG frames, including any currently selected animation frame. It does not include video/GIF encoding. The other 51 non-Fold tools are not implemented; the two extra styles here are original pixel-pattern modes, not compatibility replicas.

## Verification

Engine tests exercise byte-identical regeneration, UTF-16 string handling, hostile-looking seed safety, invalid palette rejection, bounds, four-way and diagonal symmetry, resolution-independent composition, seamless loop endpoints, control effects, palette/geometry separation and 100 distinct sampled seeds. Distinctness in that sample is not a mathematical uniqueness guarantee.

Fanout tests exercise healthy OG images, failed OG fallback, missing URLs, new-source recovery, stable seeds and wrapper attributes. Browser QA covers responsive layout, changing seeds/variations, fold/style selection, palette editing, captures, animation, share replay, and downloadable files. Production proof is recorded separately in the delivery summary; local builds alone do not establish deployment.
