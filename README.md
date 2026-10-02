# Brady Cai — Portfolio

Personal site for Brady Cai, a software engineer studying computer science and business at Northeastern University.

**Live site:** https://bradycai.github.io/Website-Portfolio/

## Stack

[Astro](https://astro.build) 7 with MDX, deployed to GitHub Pages by GitHub Actions. Type is [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans), self-hosted through Fontsource. Styles are plain CSS with design tokens; there is no CSS framework.

Motion:

- Page transitions use Astro's `<ClientRouter />`. A project's cover and title morph between the home page and its case study.
- The hero name rises letter by letter, sections fade in as you scroll, and the theme toggle reveals the new theme as a growing circle.
- Case studies show a reading-progress line driven by CSS scroll timelines.
- Everything respects `prefers-reduced-motion`.

## Structure

```
src/
  data/profile.ts             Contact details, experience, education, skills, "More projects"
  content/projects/*.mdx      One case study per project: frontmatter plus the write-up
  content.config.ts           The fields each case study needs
  assets/                     Headshot and project screenshots, optimized at build time
  components/                 Header, Footer, ProjectCover, TradingDiagram, Figure
  layouts/Base.astro          <head>, theme setup, page transitions
  pages/                      index.astro, projects/[slug].astro, 404.astro
  styles/global.css           Design tokens, base styles, case study prose, motion
  scripts/site.ts             Scroll reveals, header, theme toggle, mobile menu, copy buttons, clock
public/                       Favicon, Apple touch icon, social preview image
.github/workflows/deploy.yml  Builds and deploys on every push to main
```

## Develop

```bash
npm install
npm run dev     # http://localhost:4321/Website-Portfolio/
npm run build   # static output in dist/
npm run check   # type-check
```

## Editing

- **Text and links:** `src/data/profile.ts`.
- **A new case study:** add `src/content/projects/<slug>.mdx` with the same frontmatter as the others, and put its screenshots in `src/assets/projects/<slug>/`. It appears on the home page, ordered by `order`.
- **Colors and type:** the tokens at the top of `src/styles/global.css`. The dark theme is under `:root[data-theme="dark"]`.
- **Custom domain:** change `site` and `base` in `astro.config.mjs`.

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `dist/` to GitHub Pages (Settings → Pages → Source: GitHub Actions).
