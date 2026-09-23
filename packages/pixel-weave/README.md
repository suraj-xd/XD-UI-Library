# Pixel Weave

A string becomes a repeatable pixel-art cover. Zero runtime dependencies, DOM access, network requests, or mutable global state. Works in Node, Vite, Next.js and plain JavaScript. The standalone studio is at [ui.surajgaud.com/folds](https://ui.surajgaud.com/folds); it is deliberately absent from the main UI showcase.

## Use

Copy `src/index.ts` into your project, or build and install a local package:

```sh
cd packages/pixel-weave
npm run build
npm pack
# In your app:
npm install /path/to/suraj-pixel-weave-1.0.0.tgz
```

The package is not published to npm. TypeScript is a build-time requirement, provided by this repository.

```tsx
import { generateDataURL, generateFromString, palettes } from '@suraj/pixel-weave';

const imageUrl = generateDataURL('https://example.com/course/attention', {
  width: 1200,
  height: 630,
  palette: palettes.arcade,
  fold: 'four',
  variation: 0,
});

<img src={imageUrl} alt="" />

// Or raw SVG, like generate-avatar:
const svg = generateFromString('Attention is all you need');
```

For images that can fail, copy the React wrapper at `components/custom/pixel-weave/pixel-cover.tsx` and adjust its import. `PixelCover` uses the supplied `src` first, computes artwork only on a missing/failed URL, and resets failure state when the URL changes. Reserve the cover's aspect ratio in the parent to prevent layout shift. Use a canonical resource URL or persistent ID as the seed, not an array index. Decorative covers should have empty alt text when their title is already adjacent.

## API

- `generateSVG(seed, options)` / `generateFromString(seed, options)`: self-contained SVG string.
- `generateDataURL(seed, options)`: percent-encoded SVG image URL.
- `generateGrid(seed, options)`: `{ width, height, columns, rows, colors }` for your own Canvas renderer. Colors are row-major hex strings.
- `palettes`: arcade, garden, cobalt, plum, mineral, mono. Inks are artwork colors, not interface tokens.

| Option | Default | Range / values |
| --- | --- | --- |
| width / height | 1200 / 800 | 16–8192, rounded |
| resolution | 112 | 24–192 cells on longer edge, rounded to an even grid |
| variation | 0 | 0–2147483647, integer |
| palette | selected from seed | 2–12 `#RGB` or `#RRGGBB` inks |
| style | fold | fold, quilt, contour |
| fold | four | four, kaleidoscope, horizontal, vertical, none |
| foldX / foldY | .5 / .5 | .1–.9 |
| pattern | mixed | mixed, stripes, chevrons, checks, rings, steps, dots |
| patches | seeded, 8–13 | 1–24 |
| size / frequency / wave | .65 / .5 / .5 | 0–1 |
| tilt | 0 | 0–1 |
| levels | 5 | 2–12 background bands |
| dither / grain | 0 / 0 | 0–1 |
| phase / motion | 0 / 0 | loop position / amplitude, motion 0–1 |

`horizontal` mirrors left to right; `vertical` mirrors top to bottom. Kaleidoscope also reflects along the diagonal (exact diagonal symmetry on square frames). Off-center fold axes deliberately produce unequal sides. Quilt uses size to choose tile count and supports all six pattern types. Contour uses frequency and wave; patch count, tilt and pattern only affect applicable styles.

The grid is independent of export pixel size: exporting the same ratio at 600px or 2400px preserves the composition. SVG merges adjacent cells into horizontal runs, grouped by color. Grain increases file size because it adds colors. At equal dimensions, SVG cells are square within rounding precision; avoid extremely thin aspect ratios for normal covers.

Strings are case-sensitive and not Unicode-normalized. Empty strings are valid. All randomness comes from a versioned string hash plus separate variation state. Palette edits do not reshuffle geometry. This provides stable, varied covers, not a collision-free identity or security primitive. The finite hash and output space cannot guarantee every possible string has a unique picture. Preserve v1 for existing covers if the algorithm changes.

Animation is explicit: pass a phase and nonzero motion amplitude. Phase 0 and 1 match. The React studio runs at 12 fps, pauses in hidden tabs, honors reduced motion, and exports the currently displayed frame. Production card fallbacks are static.

## Studio

`/folds` has five fold modes, three styles, six pattern families, custom inks, palette save/restore, fold axes, patch controls, pixel density, dither/grain, animation and frame scrubbing, eight session captures, shareable versioned recipes, SVG/PNG export, and a source download. Saved palettes stay in local storage. Captures are session-only. Share links include the seed and settings; use a non-sensitive seed.

## Development

```sh
npm run pixel-weave:test
npm run pixel-weave:sync   # after editing the engine, refresh the downloadable source
npm run pixel-weave:check
npm run build
```

Fanout vendors the same engine in `src/lib/pixel-weave/index.ts`. Copy this source there when updating it; the provenance README records the upstream location. No new dependency or runtime service is required.

## Provenance

Original implementation inspired by the observable composition method of [Playgrnd Fold](https://www.playgrnd.tools/fold). The renderer, layouts, PRNG wiring, pattern functions, SVG encoder and API here are newly implemented; no Playgrnd source, logos or assets are distributed. See `docs/pixel-weave-research.md` for inspected mechanisms and deliberate differences. MIT applies to this implementation.
