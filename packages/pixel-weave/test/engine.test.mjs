import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  generateSVG,
  generateDataURL,
  generateGrid,
  palettes,
} from "../dist/index.js";

test("exact string and options reproduce byte-identical output without global state", () => {
  const first = generateSVG("Attention is all you need");
  generateSVG("Other string", { variation: 8 });
  assert.equal(first, generateSVG("Attention is all you need"));
  assert.notEqual(
    first,
    generateSVG("Attention is all you need", { variation: 1 }),
  );
  assert.notEqual(first, generateSVG("attention is all you need"));
  assert.equal(
    decodeURIComponent(generateDataURL("test").split(",")[1]),
    generateSVG("test"),
  );
});
test("Unicode, empty strings and XML-looking seeds produce safe SVG", () => {
  for (const seed of [
    "",
    "नमस्ते 世界 🪷",
    "</svg><script>alert(1)</script>",
    '" onload="alert(1)',
  ]) {
    const svg = generateSVG(seed);
    assert.ok(svg.startsWith("<svg xmlns="));
    assert.ok(!svg.includes("<script"));
    assert.ok(!svg.includes("onload"));
    assert.ok(!svg.includes("NaN"));
  }
  assert.throws(() =>
    generateSVG("x", { palette: ["red", "url(javascript:1)"] }),
  );
  assert.throws(() => generateSVG("x", { palette: ["#fff"] }));
  assert.throws(() => generateSVG("x", { width: NaN }));
  assert.throws(() => generateSVG("x", { pattern: "unknown" }));
});
test("four-way mirror is exact with dither and grain", () => {
  for (const style of ["fold", "quilt", "contour"]) {
    const { columns, rows, colors } = generateGrid("mirror", {
      style,
      dither: 0.6,
      grain: 0.35,
    });
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < columns; x++) {
        assert.equal(
          colors[y * columns + x],
          colors[y * columns + columns - x - 1],
        );
        assert.equal(
          colors[y * columns + x],
          colors[(rows - y - 1) * columns + x],
        );
      }
  }
});
test("kaleidoscope reflects diagonally on a square canvas", () => {
  const { columns, rows, colors } = generateGrid("diagonal", {
    width: 600,
    height: 600,
    fold: "kaleidoscope",
  });
  assert.equal(columns, rows);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < columns; x++)
      assert.equal(colors[y * columns + x], colors[x * columns + y]);
});
test("export size changes preserve geometry at equal aspect ratio", () => {
  const a = generateGrid("size", { width: 600, height: 400 }),
    b = generateGrid("size", { width: 2400, height: 1600 });
  assert.deepEqual(a.colors, b.colors);
  assert.equal(a.columns, b.columns);
  assert.equal(
    generateGrid("bounded", { width: 1e9, height: 1e9, resolution: 1e9 }).colors
      .length,
    192 * 192,
  );
});
test("loop is seamless, controls change output, colors do not change geometry", () => {
  assert.equal(
    generateSVG("loop", { phase: 0, motion: 1 }),
    generateSVG("loop", { phase: 1, motion: 1 }),
  );
  assert.notEqual(
    generateSVG("loop", { phase: 0, motion: 1 }),
    generateSVG("loop", { phase: 0.25, motion: 1 }),
  );
  const baseline = generateSVG("controls");
  for (const options of [
    { fold: "none" },
    { foldX: 0.7 },
    { pattern: "dots" },
    { patches: 2 },
    { resolution: 32 },
    { style: "quilt" },
    { style: "contour" },
    { palette: palettes.mono },
    { wave: 0 },
    { dither: 1 },
    { grain: 1 },
  ])
    assert.notEqual(baseline, generateSVG("controls", options));
  const a = generateSVG("palette", { palette: palettes.arcade }),
    b = generateSVG("palette", { palette: palettes.garden });
  assert.equal(
    a.replace(/#[a-f\d]{6}/g, "INK"),
    b.replace(/#[a-f\d]{6}/g, "INK"),
  );
});
test("100 seed corpus has distinct output and bounded SVG size", () => {
  const hashes = new Set();
  let largest = 0;
  for (let i = 0; i < 100; i++) {
    const svg = generateSVG(`https://example.org/lesson/${i}`);
    hashes.add(createHash("sha256").update(svg).digest("hex"));
    largest = Math.max(largest, svg.length);
  }
  assert.equal(hashes.size, 100);
  assert.ok(largest < 180000, `Largest SVG: ${largest}`);
});
