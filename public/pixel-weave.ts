/** Pixel Weave v1 — deterministic, dependency-free artwork. No DOM or global state. */
export type Fold = "four" | "kaleidoscope" | "horizontal" | "vertical" | "none";
export type Pattern =
  "mixed" | "stripes" | "chevrons" | "checks" | "rings" | "steps" | "dots";
export type Style = "fold" | "quilt" | "contour";
export interface PixelWeaveOptions {
  width?: number;
  height?: number;
  /** Number of cells on the longer edge (24–192). Independent of export size. */
  resolution?: number;
  variation?: number;
  palette?: readonly string[];
  style?: Style;
  fold?: Fold;
  foldX?: number;
  foldY?: number;
  pattern?: Pattern;
  patches?: number;
  size?: number;
  frequency?: number;
  wave?: number;
  tilt?: number;
  levels?: number;
  dither?: number;
  grain?: number;
  /** Loop position: 0 and 1 produce identical frames. */
  phase?: number;
  motion?: number;
}
export interface PixelGrid {
  width: number;
  height: number;
  columns: number;
  rows: number;
  colors: string[];
}
const toHex = (rgb: readonly number[]) =>
  "#" + rgb.map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
// These are artwork inks, independent of a host application's interface tokens.
export const palettes: Readonly<Record<string, readonly string[]>> =
  Object.freeze(
    Object.fromEntries(
      Object.entries({
        arcade: [
          [24, 29, 30],
          [246, 235, 225],
          [240, 74, 51],
          [138, 79, 244],
          [127, 246, 197],
          [199, 163, 53],
        ],
        garden: [
          [19, 31, 34],
          [246, 238, 244],
          [213, 249, 91],
          [126, 118, 242],
          [183, 42, 32],
          [121, 204, 105],
        ],
        cobalt: [
          [17, 31, 62],
          [246, 240, 215],
          [58, 88, 217],
          [238, 151, 79],
          [175, 203, 244],
          [224, 198, 81],
        ],
        plum: [
          [42, 20, 44],
          [248, 231, 218],
          [188, 62, 108],
          [231, 152, 191],
          [123, 162, 116],
          [211, 113, 65],
        ],
        mineral: [
          [27, 38, 36],
          [235, 230, 215],
          [82, 130, 127],
          [181, 197, 167],
          [169, 101, 72],
          [209, 172, 105],
        ],
        mono: [
          [25, 27, 28],
          [246, 243, 232],
          [68, 73, 74],
          [117, 125, 125],
          [168, 176, 173],
          [209, 211, 203],
        ],
      }).map(([name, inks]) => [name, Object.freeze(inks.map(toHex))]),
    ),
  );
const patterns: Exclude<Pattern, "mixed">[] = [
  "stripes",
  "chevrons",
  "checks",
  "rings",
  "steps",
  "dots",
];
const folds: Fold[] = [
  "four",
  "kaleidoscope",
  "horizontal",
  "vertical",
  "none",
];
const styles: Style[] = ["fold", "quilt", "contour"];
const tau = Math.PI * 2;
const clamp = (n: number, a: number, b: number) => Math.max(a, Math.min(b, n));
const numeric = (
  n: number | undefined,
  fallback: number,
  a: number,
  b: number,
) =>
  n === undefined
    ? fallback
    : Number.isFinite(n)
      ? clamp(n, a, b)
      : (() => {
          throw new TypeError("Pixel Weave options must be finite numbers");
        })();
function hash(text: string) {
  let value = 2166136261;
  for (let i = 0; i < text.length; i++)
    value = Math.imul(value ^ text.charCodeAt(i), 16777619);
  return value >>> 0;
}
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let n = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}
function parseColor(color: string): number[] {
  if (typeof color !== "string" || !/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(color))
    throw new TypeError("Palette inks must be #RGB or #RRGGBB");
  const hex =
    color.length === 4
      ? color
          .slice(1)
          .split("")
          .map((c) => c + c)
          .join("")
      : color.slice(1);
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
}
const mix = (a: number[], b: number[], t: number) =>
  a.map((v, i) => Math.round(v + (b[i] - v) * clamp(t, 0, 1)));
const frac = (n: number) => n - Math.floor(n);
const parity = (n: number) => ((Math.floor(n) % 2) + 2) % 2;
const bayer = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

/** Same exact seed + options + v1 algorithm => same grid in Node and the browser. */
export function generateGrid(
  seed: string,
  options: PixelWeaveOptions = {},
): PixelGrid {
  if (typeof seed !== "string") throw new TypeError("Seed must be a string");
  const width = Math.round(numeric(options.width, 1200, 16, 8192));
  const height = Math.round(numeric(options.height, 800, 16, 8192));
  const resolution = Math.round(numeric(options.resolution, 112, 24, 192));
  const even = (n: number) => Math.max(2, Math.round(n / 2) * 2);
  const columns = even(resolution * Math.min(1, width / height));
  const rows = even(resolution * Math.min(1, height / width));
  const variation = Math.trunc(numeric(options.variation, 0, 0, 2147483647));
  const root = hash("pixel-weave/v1/" + seed);
  const rng = random(hash(`${root}/${variation}/geometry`));
  const palette =
    options.palette ??
    Object.values(palettes)[root % Object.keys(palettes).length];
  if (palette.length < 2 || palette.length > 12)
    throw new RangeError("Use 2 to 12 palette inks");
  const inks = palette.map(parseColor);
  const fold = options.fold ?? "four";
  const style = options.style ?? "fold";
  const pattern = options.pattern ?? "mixed";
  if (
    !folds.includes(fold) ||
    !styles.includes(style) ||
    (pattern !== "mixed" && !patterns.includes(pattern))
  )
    throw new TypeError("Unknown fold, style, or pattern");
  const fx = numeric(options.foldX, 0.5, 0.1, 0.9),
    fy = numeric(options.foldY, 0.5, 0.1, 0.9);
  const count = Math.round(
    numeric(options.patches, 8 + Math.floor(rng() * 6), 1, 24),
  );
  const size = numeric(options.size, 0.65, 0, 1),
    frequency = numeric(options.frequency, 0.5, 0, 1);
  const wave = numeric(options.wave, 0.5, 0, 1),
    tilt = numeric(options.tilt, 0, 0, 1);
  const levels = Math.round(numeric(options.levels, 5, 2, 12));
  const dither = numeric(options.dither, 0, 0, 1),
    grain = numeric(options.grain, 0, 0, 1);
  const phase = numeric(options.phase, 0, -1000000, 1000000);
  const angle = (phase - Math.floor(phase)) * tau;
  const movement = numeric(options.motion, 0, 0, 1);
  const shiftX = (Math.cos(angle) - 1) * movement * 0.08,
    shiftY = Math.sin(angle) * movement * 0.08;
  const accent = (i: number) =>
    inks.length > 2 ? 2 + (i % (inks.length - 2)) : i % 2;
  const patches = Array.from({ length: count }, (_, i) => {
    const a = accent(Math.floor(rng() * inks.length));
    let b = accent(Math.floor(rng() * inks.length));
    if (b === a) b = (a + 1) % inks.length;
    const turn = (rng() < 0.18 ? Math.PI / 4 : 0) * tilt + (rng() - 0.5) * tilt;
    return {
      x: rng(),
      y: rng(),
      w: (0.25 + rng() * 0.43) * (0.65 + size),
      h: (0.25 + rng() * 0.43) * (0.65 + size),
      kind: pattern === "mixed" ? patterns[i % patterns.length] : pattern,
      oval: rng() < 0.23,
      a: inks[a],
      b: inks[b],
      frequency: 3 + Math.floor(rng() * 5) + frequency * 5,
      offset: rng() * tau,
      cos: Math.cos(turn),
      sin: Math.sin(turn),
    };
  });
  const samplePattern = (
    kind: Exclude<Pattern, "mixed">,
    x: number,
    y: number,
    f: number,
    offset: number,
  ) => {
    switch (kind) {
      case "stripes":
        return (
          Math.sin((x + Math.sin(y * 3 + offset) * wave * 0.28) * f * Math.PI) >
          0
        );
      case "chevrons":
        return parity(((Math.abs(x) + y) * f) / 2) === 0;
      case "checks":
        return parity(Math.floor((x * f) / 2) + Math.floor((y * f) / 2)) === 0;
      case "steps":
        return parity((Math.floor(x * f) + Math.floor(y * f)) / 3) === 0;
      case "dots":
        return (
          Math.hypot(frac((x * f) / 2) - 0.5, frac((y * f) / 2) - 0.5) < 0.29
        );
      case "rings":
        return parity(Math.hypot(x, y) * f) === 0;
    }
  };
  const colors: string[] = [];
  // Cache final RGB conversions: many thousands of cells share just a few inks.
  const hexCache = new Map<number, string>();
  for (let row = 0; row < rows; row++)
    for (let col = 0; col < columns; col++) {
      let x = (col + 0.5) / columns,
        y = (row + 0.5) / rows;
      if (fold === "four" || fold === "kaleidoscope" || fold === "horizontal")
        x = Math.abs(x - fx) / Math.max(fx, 1 - fx);
      if (fold === "four" || fold === "kaleidoscope" || fold === "vertical")
        y = Math.abs(y - fy) / Math.max(fy, 1 - fy);
      if (fold === "kaleidoscope" && x > y) [x, y] = [y, x];
      x += shiftX;
      y += shiftY;
      // Quantize source coordinates to make mirrored cells bit-identical, even with texture.
      x = Math.round(x * 1e8) / 1e8;
      y = Math.round(y * 1e8) / 1e8;
      let color: number[];
      if (style === "quilt") {
        const tiles = 2 + Math.round(size * 4),
          tx = Math.floor(x * tiles),
          ty = Math.floor(y * tiles);
        const tile = hash(`${root}/${variation}/${tx}/${ty}`);
        const kind =
          pattern === "mixed" ? patterns[tile % patterns.length] : pattern;
        const on = samplePattern(
          kind,
          frac(x * tiles) * 2 - 1,
          frac(y * tiles) * 2 - 1,
          3 + frequency * 8,
          tile % 7,
        );
        color =
          inks[
            on
              ? tile % inks.length
              : (tile + 1 + (tile % (inks.length - 1))) % inks.length
          ];
      } else {
        const distance = Math.hypot(x * 1.05, y * 0.95);
        const t = clamp(Math.floor(distance * levels) / (levels - 1), 0, 1);
        color = mix(inks[accent(root % inks.length)], inks[0], t);
        if (style === "contour") {
          const field =
            Math.hypot(x - 0.25, y - 0.2) +
            Math.sin(x * 7 + (root % 19)) * wave * 0.18 +
            Math.cos(y * 9) * wave * 0.12;
          color =
            inks[
              ((Math.floor(field * (6 + frequency * 18)) % inks.length) +
                inks.length) %
                inks.length
            ];
        } else
          for (let i = patches.length - 1; i >= 0; i--) {
            const p = patches[i],
              dx = x - p.x,
              dy = y - p.y;
            const u = (dx * p.cos + dy * p.sin) / (p.w / 2),
              v = (-dx * p.sin + dy * p.cos) / (p.h / 2);
            if (p.oval ? u * u + v * v > 1 : Math.abs(u) > 1 || Math.abs(v) > 1)
              continue;
            color = samplePattern(p.kind, u, v, p.frequency, p.offset)
              ? p.a
              : p.b;
            break;
          }
      }
      const sx = Math.floor(x * columns),
        sy = Math.floor(y * rows);
      if (dither) {
        const threshold =
          (bayer[(((sy % 4) + 4) % 4) * 4 + (((sx % 4) + 4) % 4)] / 16 - 0.5) *
          dither *
          64;
        color = color.map((c) =>
          clamp(Math.round((c + threshold) / 51) * 51, 0, 255),
        );
      }
      if (grain) {
        const noise =
          (hash(`${root}/${sx}/${sy}/grain`) / 4294967296 - 0.5) * grain * 55;
        color = color.map((c) => Math.round(clamp(c + noise, 0, 255)));
      }
      const key = color[0] * 65536 + color[1] * 256 + color[2];
      let hex = hexCache.get(key);
      if (!hex) {
        hex = toHex(color);
        hexCache.set(key, hex);
      }
      colors.push(hex);
    }
  return { width, height, columns, rows, colors };
}

/** Compact SVG: adjacent cells of a color are merged into horizontal runs. */
export function generateSVG(
  seed: string,
  options: PixelWeaveOptions = {},
): string {
  const grid = generateGrid(seed, options),
    paths = new Map<string, string[]>();
  for (let y = 0; y < grid.rows; y++) {
    let x = 0;
    while (x < grid.columns) {
      const color = grid.colors[y * grid.columns + x];
      let end = x + 1;
      while (
        end < grid.columns &&
        grid.colors[y * grid.columns + end] === color
      )
        end++;
      const runs = paths.get(color) ?? [];
      runs.push(`M${x} ${y}h${end - x}v1H${x}z`);
      paths.set(color, runs);
      x = end;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${grid.width}" height="${grid.height}" viewBox="0 0 ${grid.columns} ${grid.rows}" preserveAspectRatio="none" shape-rendering="crispEdges">${Array.from(paths, ([color, runs]) => `<path fill="${color}" d="${runs.join("")}"/>`).join("")}</svg>`;
}
export function generateDataURL(
  seed: string,
  options: PixelWeaveOptions = {},
): string {
  return (
    "data:image/svg+xml;charset=utf-8," +
    encodeURIComponent(generateSVG(seed, options))
  );
}
/** Familiar generate-avatar-style API. Returns SVG markup. */
export const generateFromString = generateSVG;
