"use client";

import { useEffect, useMemo, useState } from "react";
import {
  generateSVG,
  generateDataURL,
  generateGrid,
  palettes,
  type PixelWeaveOptions,
  type Fold,
  type Pattern,
  type Style,
} from "@/packages/pixel-weave/src";
import { PixelCover } from "./pixel-cover";
import "./studio.css";

type Recipe = { seed: string; options: PixelWeaveOptions };
const initial: Recipe = {
  seed: "Attention is all you need",
  options: {
    width: 1200,
    height: 800,
    palette: palettes.arcade,
    variation: 0,
    resolution: 112,
    patches: 11,
    size: 0.65,
    frequency: 0.5,
    wave: 0.5,
    tilt: 0,
    levels: 5,
    fold: "four",
    foldX: 0.5,
    foldY: 0.5,
    style: "fold",
    pattern: "mixed",
    dither: 0,
    grain: 0,
  },
};
const ratios = [
  [1, 1],
  [4, 5],
  [3, 2],
  [16, 9],
  [2, 1],
];
const examples = [
  "Distributed systems",
  "Attention is all you need",
  "KV cache essentials",
  "Building reliable agents",
];
const sourceUrl =
  "https://github.com/suraj-xd/XD-UI-Library/tree/main/packages/pixel-weave";
function Range({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="pw-range">
      <span>
        {label}
        <output>{step === 1 ? value : `${Math.round(value * 100)}%`}</output>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}
function Toggle({
  label,
  on,
  change,
}: {
  label: string;
  on: boolean;
  change: () => void;
}) {
  return (
    <button
      type="button"
      className="pw-toggle"
      role="switch"
      aria-checked={on}
      onClick={change}
    >
      <span>{label}</span>
      <span className="pw-switch" data-on={on}>
        <i />
      </span>
    </button>
  );
}
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function PixelWeaveStudio() {
  const [recipe, setRecipe] = useState<Recipe>(initial);
  const [captures, setCaptures] = useState<Recipe[]>([]);
  const [savedPalette, setSavedPalette] = useState<readonly string[] | null>(
    null,
  );
  const [playing, setPlaying] = useState(false);
  const [phase, setPhase] = useState(0);
  const [notice, setNotice] = useState("");
  const [exporting, setExporting] = useState(false);
  const { seed, options } = recipe;
  const setOption = <K extends keyof PixelWeaveOptions>(
    key: K,
    value: PixelWeaveOptions[K],
  ) => setRecipe((r) => ({ ...r, options: { ...r.options, [key]: value } }));
  const updateSeed = (value: string) => {
    setPlaying(false);
    setPhase(0);
    setRecipe((r) => ({ ...r, seed: value }));
  };
  useEffect(() => {
    try {
      const raw = new URLSearchParams(window.location.search).get("recipe");
      if (raw && raw.length < 12000) {
        const parsed = JSON.parse(raw);
        if (
          parsed.version !== 1 ||
          typeof parsed.seed !== "string" ||
          parsed.seed.length > 500 ||
          !parsed.options ||
          typeof parsed.options !== "object" ||
          Array.isArray(parsed.options)
        )
          throw new Error("Invalid recipe");
        const grid = generateGrid(parsed.seed, parsed.options);
        setRecipe({
          seed: parsed.seed,
          options: {
            ...parsed.options,
            width: grid.width,
            height: grid.height,
          },
        });
        setPhase(parsed.options.phase ?? 0);
      }
      const saved = localStorage.getItem("pixel-weave/palette/v1");
      if (saved) {
        const palette = JSON.parse(saved);
        generateGrid("", { palette });
        setSavedPalette(palette);
      }
    } catch {
      setNotice(
        "Could not load the saved settings. Showing the default artwork.",
      );
    }
  }, []);
  useEffect(() => {
    if (!playing) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      setPlaying(false);
      setNotice("Animation is paused for your reduced motion preference.");
      return;
    }
    const changed = () => {
      if (media.matches) setPlaying(false);
    };
    media.addEventListener("change", changed);
    const id = setInterval(() => {
      if (!document.hidden)
        setPhase((p) => ((Math.round(p * 36) + 1) % 36) / 36);
    }, 1000 / 12);
    return () => {
      clearInterval(id);
      media.removeEventListener("change", changed);
    };
  }, [playing]);
  const renderOptions = useMemo(
    () => ({ ...options, phase, motion: options.motion ?? 0.6 }),
    [options, phase],
  );
  const svg = useMemo(
    () => generateSVG(seed, renderOptions),
    [seed, renderOptions],
  );
  const image = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  const newVariation = () => {
    setPhase(0);
    setOption("variation", (options.variation ?? 0) + 1);
  };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLElement &&
        (e.target.closest("input,textarea,select,button,a") ||
          e.target.isContentEditable)
      )
        return;
      if (e.code === "Space") {
        e.preventDefault();
        setRecipe((r) => ({
          ...r,
          options: { ...r.options, variation: (r.options.variation ?? 0) + 1 },
        }));
        setPhase(0);
      }
      if (e.key.toLowerCase() === "p") setPlaying((p) => !p);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  const inks = options.palette ?? palettes.arcade;
  async function copy(text: string, message: string) {
    try {
      await navigator.clipboard.writeText(text);
      setNotice(message);
    } catch {
      setNotice(
        "Clipboard unavailable. Use Export SVG or download the source.",
      );
    }
  }
  async function exportPNG() {
    setExporting(true);
    try {
      const img = new Image();
      img.src = image;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = options.width ?? 1200;
      canvas.height = options.height ?? 800;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas unavailable");
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob>((resolve, reject) =>
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("PNG export failed"))),
          "image/png",
        ),
      );
      download(blob, "pixel-weave.png");
      setNotice("PNG exported.");
    } catch {
      setNotice("PNG export failed. SVG export is still available.");
    } finally {
      setExporting(false);
    }
  }
  function savePalette() {
    try {
      localStorage.setItem("pixel-weave/palette/v1", JSON.stringify(inks));
      setSavedPalette([...inks]);
      setNotice("Palette saved in this browser.");
    } catch {
      setNotice(
        "Browser storage unavailable. Use Copy settings to keep this palette.",
      );
    }
  }
  const copySettings = () =>
    copy(
      JSON.stringify({ version: 1, seed, options: renderOptions }, null, 2),
      "Settings copied.",
    );
  const share = () => {
    const url = new URL("/folds", window.location.origin);
    url.searchParams.set(
      "recipe",
      JSON.stringify({ version: 1, seed, options: renderOptions }),
    );
    copy(
      url.toString(),
      "Link copied. It includes your seed, colors, and settings.",
    );
  };
  const snippet = `import { generateDataURL } from '@suraj/pixel-weave';\n\nconst cover = generateDataURL(${JSON.stringify(seed)}, ${JSON.stringify(renderOptions, null, 2)});\n\n<img src={cover} alt="" />`;
  return (
    <div className="pw-studio">
      <header className="pw-header">
        <a href="/" className="pw-brand">
          XD <span>/</span> Pixel Weave
        </a>
        <span className="pw-eyebrow">
          A small engine for one-of-a-kind covers
        </span>
        <a href={sourceUrl} target="_blank" rel="noreferrer">
          Source ↗
        </a>
      </header>
      <div className="pw-workspace">
        <aside className="pw-controls">
          <div className="pw-intro">
            <span className="pw-eyebrow">Seeded artwork · v1</span>
            <h1>
              A string.
              <br /> A whole new pattern.
            </h1>
            <p>Turn a title, URL, or idea into a cover that stays yours.</p>
          </div>
          <label className="pw-field">
            Your string
            <input
              value={seed}
              maxLength={500}
              onChange={(e) => updateSeed(e.target.value)}
              placeholder="A course title, URL, anything"
            />
          </label>
          <div className="pw-variation">
            <span>Variation</span>
            <output>{String(options.variation ?? 0).padStart(4, "0")}</output>
          </div>
          <button className="pw-primary" onClick={newVariation}>
            <span>↻</span>
            <span>
              New variation<small>Same string. Another composition.</small>
            </span>
          </button>
          <section className="pw-section">
            <h2>Composition</h2>
            <label className="pw-field">
              Style
              <select
                value={options.style ?? "fold"}
                onChange={(e) => setOption("style", e.target.value as Style)}
              >
                <option value="fold">Folded collage</option>
                <option value="quilt">Patch quilt</option>
                <option value="contour">Contour field</option>
              </select>
            </label>
            <label className="pw-field">
              Fold
              <select
                value={options.fold ?? "four"}
                onChange={(e) => setOption("fold", e.target.value as Fold)}
              >
                <option value="four">Four ways</option>
                <option value="kaleidoscope">Kaleidoscope</option>
                <option value="horizontal">Across</option>
                <option value="vertical">Down</option>
                <option value="none">Unfolded</option>
              </select>
            </label>
            <Range
              label="Fold across"
              min={0.1}
              max={0.9}
              value={options.foldX ?? 0.5}
              onChange={(n) => setOption("foldX", n)}
            />
            <Range
              label="Fold down"
              min={0.1}
              max={0.9}
              value={options.foldY ?? 0.5}
              onChange={(n) => setOption("foldY", n)}
            />
          </section>
          <details className="pw-section">
            <summary>Patches & pixels</summary>
            <label className="pw-field">
              Pattern
              <select
                value={options.pattern ?? "mixed"}
                onChange={(e) =>
                  setOption("pattern", e.target.value as Pattern)
                }
              >
                {[
                  "mixed",
                  "stripes",
                  "chevrons",
                  "checks",
                  "rings",
                  "steps",
                  "dots",
                ].map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </label>
            <Range
              label="Patch count"
              value={options.patches ?? 11}
              min={1}
              max={24}
              step={1}
              onChange={(n) => setOption("patches", n)}
            />
            <Range
              label="Patch size"
              value={options.size ?? 0.65}
              onChange={(n) => setOption("size", n)}
            />
            <Range
              label="Frequency"
              value={options.frequency ?? 0.5}
              onChange={(n) => setOption("frequency", n)}
            />
            <Range
              label="Wave"
              value={options.wave ?? 0.5}
              onChange={(n) => setOption("wave", n)}
            />
            <Range
              label="Tilt"
              value={options.tilt ?? 0}
              onChange={(n) => setOption("tilt", n)}
            />
            <Range
              label="Cells on long edge"
              value={options.resolution ?? 112}
              min={24}
              max={192}
              step={1}
              onChange={(n) => setOption("resolution", n)}
            />
            <Range
              label="Background levels"
              value={options.levels ?? 5}
              min={2}
              max={12}
              step={1}
              onChange={(n) => setOption("levels", n)}
            />
          </details>
          <section className="pw-section pw-effects">
            <Toggle
              label="Animate"
              on={playing}
              change={() => setPlaying((p) => !p)}
            />
            <Toggle
              label="Dither"
              on={!!options.dither}
              change={() => setOption("dither", options.dither ? 0 : 0.6)}
            />
            <Toggle
              label="Grain"
              on={!!options.grain}
              change={() => setOption("grain", options.grain ? 0 : 0.35)}
            />
            {playing && (
              <Range
                label="Movement"
                value={options.motion ?? 0.6}
                onChange={(n) => setOption("motion", n)}
              />
            )}
          </section>
          <section className="pw-section">
            <h2>
              Color <span>{inks.length} inks</span>
            </h2>
            <div className="pw-swatches">
              {inks.map((color, i) => (
                <label
                  key={i}
                  style={{ background: color }}
                  title={`Ink ${i + 1}: ${color}`}
                >
                  <input
                    aria-label={`Ink ${i + 1}`}
                    type="color"
                    value={color}
                    onChange={(e) =>
                      setOption(
                        "palette",
                        inks.map((c, j) => (j === i ? e.target.value : c)),
                      )
                    }
                  />
                </label>
              ))}
              {inks.length < 12 && (
                <button
                  aria-label="Add ink"
                  onClick={() =>
                    setOption("palette", [
                      ...inks,
                      palettes.cobalt[inks.length % 6],
                    ])
                  }
                >
                  +
                </button>
              )}
              {inks.length > 2 && (
                <button
                  aria-label="Remove last ink"
                  onClick={() => setOption("palette", inks.slice(0, -1))}
                >
                  −
                </button>
              )}
            </div>
            <div className="pw-palette-list">
              {Object.entries(palettes).map(([name, colors]) => (
                <button
                  key={name}
                  onClick={() => setOption("palette", colors)}
                  aria-pressed={JSON.stringify(inks) === JSON.stringify(colors)}
                >
                  {name}
                </button>
              ))}
            </div>
            <div className="pw-actions">
              <button
                onClick={() => {
                  const list = Object.values(palettes);
                  const i = list.findIndex(
                    (p) => JSON.stringify(p) === JSON.stringify(inks),
                  );
                  setOption("palette", list[(i + 1) % list.length]);
                }}
              >
                New colors
              </button>
              <button
                onClick={() =>
                  setOption("palette", [...inks.slice(1), inks[0]])
                }
              >
                Rotate
              </button>
              <button onClick={savePalette}>Save</button>
              {savedPalette && (
                <button onClick={() => setOption("palette", savedPalette)}>
                  Restore
                </button>
              )}
            </div>
          </section>
        </aside>
        <main className="pw-main">
          <div className="pw-stage-meta">
            <span className="pw-eyebrow">
              {options.style === "quilt"
                ? "02 / Patch quilt"
                : options.style === "contour"
                  ? "03 / Contour field"
                  : "01 / Folded collage"}
            </span>
            <span className="pw-eyebrow">
              {options.width} × {options.height} · SVG
            </span>
          </div>
          <div className="pw-stage">
            <div className="pw-orbit" />
            <div
              className="pw-art-frame"
              style={{
                aspectRatio: `${options.width}/${options.height}`,
                maxWidth:
                  (options.width ?? 1200) < (options.height ?? 800)
                    ? 440
                    : undefined,
              }}
            >
              <img
                id="pixel-weave-art"
                src={image}
                alt={`Generated pixel artwork for ${seed || "an empty string"}`}
                width={options.width}
                height={options.height}
              />
            </div>
          </div>
          <div className="pw-stage-toolbar">
            <div className="pw-ratios" aria-label="Aspect ratio">
              {ratios.map(([w, h]) => (
                <button
                  key={`${w}:${h}`}
                  aria-pressed={
                    (options.width ?? 1200) / (options.height ?? 800) === w / h
                  }
                  onClick={() => {
                    setRecipe((r) => ({
                      ...r,
                      options: {
                        ...r.options,
                        width: 1200,
                        height: (1200 * h) / w,
                      },
                    }));
                  }}
                >
                  {w}:{h}
                </button>
              ))}
            </div>
            <div className="pw-actions">
              <button
                onClick={() => {
                  setCaptures((c) => [
                    ...c.slice(-7),
                    { seed, options: { ...renderOptions } },
                  ]);
                  setNotice("Capture saved for this session.");
                }}
              >
                Capture
              </button>
              <button onClick={share}>Copy link</button>
              <button
                onClick={() => {
                  download(
                    new Blob([svg], { type: "image/svg+xml" }),
                    "pixel-weave.svg",
                  );
                  setNotice("SVG exported.");
                }}
              >
                Export SVG
              </button>
              <button disabled={exporting} onClick={exportPNG}>
                {exporting ? "Exporting…" : "Export PNG"}
              </button>
            </div>
          </div>
          <div className="pw-playback">
            <button
              aria-label={playing ? "Pause animation" : "Play animation"}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? "Ⅱ" : "▶"}
            </button>
            <input
              aria-label="Animation frame"
              type="range"
              min={0}
              max={35}
              value={Math.round(phase * 36) % 36}
              onChange={(e) => {
                setPlaying(false);
                setPhase(Number(e.target.value) / 36);
              }}
            />
            <span>
              {String(Math.round(phase * 36) + 1).padStart(2, "0")} / 36
            </span>
            <label>
              Export width
              <select
                aria-label="Export width"
                value={options.width}
                onChange={(e) => {
                  const width = Number(e.target.value);
                  setRecipe((r) => ({
                    ...r,
                    options: {
                      ...r.options,
                      width,
                      height: Math.round(
                        (width * (r.options.height ?? 800)) /
                          (r.options.width ?? 1200),
                      ),
                    },
                  }));
                }}
              >
                {Array.from(new Set([600, 1200, 2400, options.width ?? 1200]))
                  .sort((a, b) => a - b)
                  .map((w) => (
                    <option key={w} value={w}>
                      {w} px
                    </option>
                  ))}
              </select>
            </label>
          </div>
          <div className="pw-captures">
            <span className="pw-eyebrow">Captures</span>
            {captures.length ? (
              captures.map((capture, i) => (
                <button
                  key={i}
                  aria-label={`Restore capture ${i + 1}`}
                  onClick={() => {
                    setRecipe(capture);
                    setPhase(capture.options.phase ?? 0);
                    setPlaying(false);
                  }}
                >
                  <img
                    src={generateDataURL(capture.seed, capture.options)}
                    alt=""
                  />
                </button>
              ))
            ) : (
              <span className="pw-muted">
                Keep a composition while you explore.
              </span>
            )}
          </div>
          <p className="pw-notice" role="status" aria-live="polite">
            {notice || "Space — new variation · P — play / pause"}
          </p>
          <section className="pw-card-section">
            <div>
              <span className="pw-eyebrow">Made for the empty image slot</span>
              <h2>Every card gets a cover.</h2>
              <p>No image server. No API call. Just the resource’s string.</p>
            </div>
            <div className="pw-card-grid">
              {examples.map((title, i) => (
                <article key={title}>
                  <PixelCover
                    seed={title}
                    options={{ width: 600, height: 360, palette: inks }}
                    className="pw-card-image"
                  />
                  <div>
                    <span className="pw-eyebrow">
                      {["Course", "Paper", "Lesson", "Guide"][i]}
                    </span>
                    <h3>{title}</h3>
                    <span className="pw-muted">
                      Deterministic fallback cover
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
          <details className="pw-code">
            <summary>
              Use it in your project <span>Zero runtime dependencies</span>
            </summary>
            <div className="pw-actions">
              <button onClick={() => copy(snippet, "Code copied.")}>
                Copy code
              </button>
              <button onClick={copySettings}>Copy settings</button>
              <a href="/pixel-weave.ts" download>
                Download engine
              </a>
              <a href={sourceUrl} target="_blank" rel="noreferrer">
                Documentation ↗
              </a>
            </div>
            <pre>
              <code>{snippet}</code>
            </pre>
            <p>
              Copy the engine into your project, or build the package from
              source. The npm name above is for local package installation; it
              has not been published to npm.
            </p>
          </details>
        </main>
      </div>
      <footer className="pw-footer">
        <span>Pixel Weave / a generative cover library by XD</span>
        <a
          href="https://www.playgrnd.tools/fold"
          target="_blank"
          rel="noreferrer"
        >
          Inspired by Playgrnd’s Fold ↗
        </a>
      </footer>
    </div>
  );
}
