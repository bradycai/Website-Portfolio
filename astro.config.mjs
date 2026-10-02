// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

// The site is served from https://bradycai.github.io/Website-Portfolio/.
// Moving to a custom domain (or renaming the repo to bradycai.github.io)?
// Change `site` to the new origin and set `base` to "/".
export default defineConfig({
  site: "https://bradycai.github.io",
  base: "/Website-Portfolio",
  trailingSlash: "always",
  integrations: [mdx(), sitemap()],
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
});
