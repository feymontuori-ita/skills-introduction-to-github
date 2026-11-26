// Renders the PWA icons (burgundy tile, ivory serif "T."). Run: npm run icons
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright"); // pre-installed globally or via npm i -D playwright
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const font = path.join(root, "node_modules/@fontsource/instrument-serif/files/instrument-serif-latin-400-normal.woff2");
const out = path.join(root, "public/icons");

const html = (size, pad) => `<!doctype html><html><head><style>
@font-face{font-family:IS;src:url("file://${font}")}
html,body{margin:0;width:${size}px;height:${size}px;background:#741D38}
div{width:100%;height:100%;display:flex;align-items:center;justify-content:center;
font-family:IS;color:#F6F3EF;font-size:${Math.round(size * (pad ? 0.5 : 0.66))}px;line-height:1;padding-top:${Math.round(size * 0.04)}px;box-sizing:border-box}
span{color:#F2B705}
</style></head><body><div>T<span>.</span></div></body></html>`;

const targets = [
  ["icon-192.png", 192, false],
  ["icon-512.png", 512, false],
  ["maskable-512.png", 512, true],
  ["apple-touch-icon.png", 180, false],
];

const browser = await chromium.launch();
for (const [name, size, pad] of targets) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(html(size, pad));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(out, name) });
  await page.close();
}
await browser.close();
console.log("icons written to public/icons");
