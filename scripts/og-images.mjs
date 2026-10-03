// Renders a 1200x630 social card per case study into public/og/<slug>.png.
// Run `npm run og` after changing a case study's title, kind, period, tint, or stats.
// Needs a local Chrome; set CHROME_PATH if it isn't in the default macOS location.
import puppeteer from "puppeteer-core";
import { readFileSync, mkdirSync, readdirSync } from "node:fs";
const ROOT = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const FONT_DATA = "data:font/woff2;base64," + readFileSync(
  ROOT + "/node_modules/@fontsource-variable/instrument-sans/files/instrument-sans-latin-standard-normal.woff2"
).toString("base64");

mkdirSync(ROOT + "/public/og", { recursive: true });

// Pull the fields we need straight from each MDX frontmatter.
const field = (src, key) => (src.match(new RegExp("^" + key + ":\\s*(.+)$", "m")) || [])[1]?.replace(/^"|"$/g, "") ?? "";
const projects = readdirSync(ROOT + "/src/content/projects").filter((f) => f.endsWith(".mdx")).map((f) => {
  const src = readFileSync(ROOT + "/src/content/projects/" + f, "utf8");
  const stats = [...src.matchAll(/- \{ value: "([^"]+)", label: "([^"]+)" \}/g)].map((m) => ({ value: m[1], label: m[2] }));
  return { slug: f.replace(/\.mdx$/, ""), title: field(src, "title"), kind: field(src, "kind"), period: field(src, "period"), tint: field(src, "tint"), stats };
});

const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630 });
for (const p of projects) {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face{font-family:IS;src:url("${FONT_DATA}") format("woff2");font-weight:400 700;font-stretch:75% 100%}
    html,body{margin:0;width:1200px;height:630px}
    body{position:relative;overflow:hidden;background:#f6f5f1;color:#171716;font-family:IS,sans-serif;-webkit-font-smoothing:antialiased}
    .wrap{position:absolute;inset:0;display:grid;grid-template-columns:1fr 360px;gap:56px;padding:64px 72px}
    .left{display:flex;flex-direction:column}
    .who{display:flex;justify-content:space-between;color:#6b6a64;font-size:22px}
    .who b{color:#171716;font-weight:600}
    h1{margin:auto 0 0 -4px;font-size:${p.title.length > 14 ? 104 : 132}px;font-weight:520;font-stretch:84%;line-height:.9;letter-spacing:-.045em}
    .kind{margin-top:22px;color:#6b6a64;font-size:26px}
    .tile{display:flex;flex-direction:column;justify-content:flex-end;gap:0;border-radius:22px;background:${p.tint};padding:36px 34px;color:#fff}
    .stat{padding:16px 0;border-top:1px solid rgba(255,255,255,.18)}
    .stat:first-child{border-top:0}
    .v{font-size:58px;font-weight:540;font-stretch:88%;letter-spacing:-.035em;line-height:1}
    .l{margin-top:6px;color:rgba(255,255,255,.7);font-size:20px;line-height:1.25}
    .dot{position:absolute;right:72px;top:64px;width:14px;height:14px;border-radius:50%;background:#ff6b3d}
  </style></head><body><div class="wrap">
    <div class="left"><div class="who"><span><b>Brady Cai</b> · Case study</span></div><h1>${p.title}</h1><p class="kind">${p.kind} · ${p.period}</p></div>
    <div class="tile">${p.stats.map((s) => `<div class="stat"><div class="v">${s.value}</div><div class="l">${s.label}</div></div>`).join("")}</div>
  </div></body></html>`;
  await page.setContent(html, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  const loaded = await page.evaluate(() => document.fonts.check('520 40px IS'));
  if (!loaded) throw new Error("Instrument Sans did not load for " + p.slug);
  await page.screenshot({ path: `${ROOT}/public/og/${p.slug}.png` });
  console.log("rendered", p.slug, p.stats.length, "stats");
}
await browser.close();
