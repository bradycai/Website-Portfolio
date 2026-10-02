# Brady Cai — Portfolio

Personal site for Brady Cai, a software engineer studying Computer Science & Business at Northeastern University.

**Live site:** https://bradycai.github.io/Website-Portfolio/

## Stack

Plain HTML, CSS, and vanilla JavaScript, with no framework and no build step. Fonts are [Geist](https://vercel.com/font), Geist Mono, and [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) from Google Fonts. GitHub Pages serves the files exactly as they are in the repo.

```
index.html      All page content, one commented block per section
styles.css      Design tokens (colors, fonts, spacing) at the top, then components
script.js       Theme toggle, mobile menu, scroll reveals, active-nav highlight, copy-email
assets/         Headshot, favicon, Apple touch icon, social preview image
.nojekyll       Tells GitHub Pages to skip Jekyll and serve files directly
```

## Run locally

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly also works, but "Copy email" needs `http://` (clipboard access is blocked on `file://`).

## Editing

- **Content:** edit `index.html`. Each section (`#about`, `#experience`, `#projects`, `#skills`, `#contact`) is self-contained.
- **Colors:** change the tokens at the top of `styles.css`. `--accent` drives the highlight color. The dark theme lives under `:root[data-theme="dark"]`.
- **Headshot:** replace `assets/headshot.webp` and `assets/headshot.jpg` (4:5 portrait, ~720×900).
- **Custom domain:** if you add one, update the `canonical`, `og:url`, `og:image`, and JSON-LD URLs in the `<head>` of `index.html`.

## Deployment

GitHub Pages builds from the root of the `main` branch. Every push to `main` goes live within a minute or two.
