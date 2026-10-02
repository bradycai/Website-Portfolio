import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Case studies: one MDX file per project in src/content/projects.
const projects = defineCollection({
  loader: glob({ pattern: "**/*.mdx", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      kind: z.string(),
      period: z.string(),
      year: z.string(),
      order: z.number(),
      stack: z.array(z.string()),
      award: z.string().optional(),
      links: z.object({
        code: z.string().optional(),
        live: z.string().optional(),
      }),
      // Either a screenshot or a named diagram component fills the cover frame.
      cover: image().optional(),
      coverAlt: z.string().optional(),
      diagram: z.enum(["trading"]).optional(),
      // Background color of the cover frame, picked to suit each project's own UI.
      tint: z.string(),
    }),
});

export const collections = { projects };
