# Brady Cai — Portfolio

Personal site for Brady Cai, a software engineer studying computer science and business at Northeastern University.

**Live site:** https://bradycai.github.io/Website-Portfolio/

## Stack

[Astro](https://astro.build) 7 with MDX, deployed to GitHub Pages by GitHub Actions. Type is [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans), self-hosted through Fontsource. Styles are plain CSS with design tokens; there is no CSS framework.

Motion:

- Page transitions use Astro's `<ClientRouter />`. A project's cover and title morph between the home page and its case study, and the "Next project" card morphs into the next page.
- The hero name rises letter by letter and recedes as you scroll; sections fade in; the theme toggle reveals the new theme as a growing circle.
- Scroll-driven CSS (no JavaScript): screenshots drift slightly against their frames, the About statement fills in as you read, and case studies show a reading-progress line.
- The OrderSync case study has a sticky walkthrough: steps scroll while the matching screenshot stays pinned.
- Cards light up around the cursor, and the tools strip scrolls slowly (paused on hover).
- Everything respects `prefers-reduced-motion`.

Features:

- **Résumé page** (`/resume/`): the résumé as a web page, with print styles that lay it out as one letter-size page. "Save as PDF" opens the print dialog. The phone number is deliberately left off.
- **Command menu**: press ⌘K / Ctrl+K (or `/`) to jump to any page or case study, copy an email address, or switch theme.
- **Interactive demos** in two case studies: OrderSync's stock math, including the duplicate-import check, and a simplified model of the trading assistant's nine risk rules.
- **Live from GitHub**: language mix and recent pushes, fetched from the GitHub API at build time. The deploy workflow also runs daily so it stays current. If the API is unreachable, the build leaves the panel out.
- **Case study extras**: an "On this page" list that follows your scroll, `#` links on headings that copy the section URL, and click-to-zoom screenshots that morph into a full-screen view.
- **Per-page social cards**: each case study has its own preview image in `public/og/`. Regenerate them with `npm run og` after changing a case study's title, dates, tint, or stats (needs a local Chrome).

Scroll-driven animations keep `animation-timeline` in its own, more specific rule. CSS minifiers fold it into the `animation` shorthand, which browsers reject, so the effect would silently disappear in production builds.

## Structure

```
src/
  data/profile.ts             Contact details, experience, education, skills, "More projects"
  data/resume.ts              Résumé text for /resume/ (from the PDF résumé)
  content/projects/*.mdx      One case study per project: frontmatter plus the write-up
  content.config.ts           The fields each case study needs
  assets/                     Headshot and project screenshots, optimized at build time
  components/                 Header, Footer, ProjectCover, TradingDiagram, Figure,
                              LogoWall, Stats, Story (sticky walkthrough), IsoDrawing (FIG drawings),
                              CommandPalette, RiskPlayground, StockDemo, GitHubActivity
  lib/github.ts               Build-time GitHub API snapshot for the activity panel
  layouts/Base.astro          <head>, theme setup, page transitions
  pages/                      index.astro, projects/[slug].astro, resume.astro, 404.astro
  styles/global.css           Design tokens, base styles, case study prose, motion
  scripts/site.ts             Scroll reveals, header, theme, menu, copy, clock, TOC, heading links
  scripts/palette.ts          Command menu behavior and keyboard shortcuts
  scripts/demos.ts            Logic for the two interactive demos
  scripts/lightbox.ts         Click-to-zoom screenshots
public/                       Favicon, Apple touch icon, social preview images (og/ per case study)
scripts/og-images.mjs         Generates the per-case-study social cards (npm run og)
.github/workflows/deploy.yml  Builds and deploys on every push to main
```

## Develop

```bash
npm install
npm run dev     # http://localhost:4321/Website-Portfolio/
npm run build   # static output in dist/
npm run check   # type-check
npm run og      # regenerate case-study social cards
```

## Editing

- **Text and links:** `src/data/profile.ts`.
- **A new case study:** add `src/content/projects/<slug>.mdx` with the same frontmatter as the others (including three `stats`), and put its screenshots in `src/assets/projects/<slug>/`. It appears on the home page, ordered by `order`. Add a `story` list to give it a sticky walkthrough.
- **"How I build" cards and the tools strip:** `principles` at the top of `src/pages/index.astro`, and the icon list in `src/components/LogoWall.astro` (icons come from Simple Icons).
- **Colors and type:** the tokens at the top of `src/styles/global.css`. The dark theme is under `:root[data-theme="dark"]`.
- **Custom domain:** change `site` and `base` in `astro.config.mjs`.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `dist/` to GitHub Pages (Settings → Pages → Source: GitHub Actions). It also runs once a day to refresh the GitHub activity panel, and can be started by hand from the Actions tab.
