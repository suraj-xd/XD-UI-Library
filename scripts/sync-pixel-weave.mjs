import { readFile, writeFile } from "node:fs/promises";
// One editable source. Keep the browser-downloadable engine byte-identical.
const source = await readFile(
  new URL("../packages/pixel-weave/src/index.ts", import.meta.url),
  "utf8",
);
const target = new URL("../public/pixel-weave.ts", import.meta.url);
if (process.argv.includes("--check")) {
  if ((await readFile(target, "utf8")) !== source)
    throw new Error("Run npm run pixel-weave:sync");
} else await writeFile(target, source);
