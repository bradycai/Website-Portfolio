import {
  describeRepository,
  projectSymbols,
  type GitHubRepository,
  type PortfolioProject,
} from "../data/projects";

export function setupPortfolio() {
  setupShowcase();
  setupLibrary();
}

function setupShowcase() {
  const showcase = document.querySelector<HTMLElement>("[data-showcase]");
  if (!showcase || showcase.dataset.bound) return;
  showcase.dataset.bound = "1";
  const slides = [
    ...showcase.querySelectorAll<HTMLElement>("[data-showcase-slide]"),
  ];
  const buttons = [
    ...showcase.querySelectorAll<HTMLButtonElement>("[data-showcase-select]"),
  ];
  buttons.forEach((button, index) =>
    button.addEventListener("click", () => {
      slides.forEach((slide, i) => {
        slide.hidden = i !== index;
      });
      buttons.forEach((item, i) =>
        item.setAttribute("aria-pressed", String(i === index)),
      );
      const counter = showcase.querySelector("[data-showcase-count]");
      if (counter)
        counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(slides.length).padStart(2, "0")}`;
    }),
  );
}

function setupLibrary() {
  const library = document.querySelector<HTMLElement>("[data-project-library]");
  if (!library || library.dataset.bound) return;
  library.dataset.bound = "1";
  const input = library.querySelector<HTMLInputElement>(
    "[data-project-search]",
  )!;
  const sort = library.querySelector<HTMLSelectElement>("[data-project-sort]")!;
  const grid = library.querySelector<HTMLElement>("[data-repository-grid]")!;
  const filters = [
    ...library.querySelectorAll<HTMLButtonElement>("[data-project-filter]"),
  ];
  const status = library.querySelector<HTMLElement>("[data-project-results]")!;
  const empty = library.querySelector<HTMLElement>("[data-project-empty]")!;
  let category = "All projects";
  const apply = (animate = true) => {
    const terms = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const cards = [
      ...grid.querySelectorAll<HTMLElement>("[data-project-card]"),
    ];
    const motion =
      animate && !matchMedia("(prefers-reduced-motion: reduce)").matches;
    cards.forEach((card) =>
      card.getAnimations().forEach((animation) => animation.cancel()),
    );
    const positions = new Map(
      cards
        .filter((card) => !card.hidden)
        .map((card) => [card, card.getBoundingClientRect()]),
    );
    const ordered = cards.sort((a, b) =>
      sort.value === "name"
        ? (a.dataset.title ?? "").localeCompare(b.dataset.title ?? "")
        : (b.dataset.updated ?? "").localeCompare(a.dataset.updated ?? ""),
    );
    let visible = 0;
    for (const card of ordered) {
      const match =
        (category === "All projects" || card.dataset.category === category) &&
        terms.every((term) => card.dataset.search?.includes(term));
      card.hidden = !match;
      if (match) visible++;
      grid.append(card);
    }
    if (motion)
      ordered
        .filter((card) => !card.hidden)
        .forEach((card, i) => {
          const before = positions.get(card);
          const after = card.getBoundingClientRect();
          const dx = before ? before.left - after.left : 0;
          const dy = before ? before.top - after.top : 14;
          if (before && Math.abs(dx) + Math.abs(dy) < 1) return;
          card.animate(
            [
              {
                transform: `translate(${dx}px, ${dy}px)`,
                opacity: before ? 1 : 0,
              },
              { transform: "translate(0, 0)", opacity: 1 },
            ],
            {
              duration: 450,
              delay: before ? 0 : i * 25,
              easing: "cubic-bezier(.16,1,.3,1)",
            },
          );
        });
    empty.hidden = visible > 0;
    status.textContent =
      category === "All projects" && !terms.length
        ? `Showing all ${cards.length} projects`
        : `${visible} of ${cards.length} projects${category === "All projects" ? "" : ` · ${category}`}`;
    filters.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.projectFilter === category),
      ),
    );
  };
  input.addEventListener("input", () => apply());
  sort.addEventListener("change", () => apply());
  filters.forEach((button) =>
    button.addEventListener("click", () => {
      category = button.dataset.projectFilter ?? "All projects";
      apply();
    }),
  );
  library
    .querySelector("[data-project-reset]")
    ?.addEventListener("click", () => {
      category = "All projects";
      input.value = "";
      sort.value = "recent";
      apply();
      input.focus();
    });

  const refresh = library.querySelector<HTMLButtonElement>(
    "[data-github-refresh]",
  )!;
  const syncStatus = library.querySelector<HTMLElement>(
    "[data-github-status]",
  )!;
  refresh.addEventListener("click", async () => {
    if (refresh.disabled) return;
    refresh.disabled = true;
    refresh.textContent = "Refreshing…";
    syncStatus.textContent = "Checking GitHub…";
    try {
      const repos: GitHubRepository[] = [];
      for (let page = 1; ; page++) {
        const response = await fetch(
          `https://api.github.com/users/bradycai/repos?per_page=100&sort=pushed&page=${page}`,
          {
            headers: { Accept: "application/vnd.github+json" },
            signal: AbortSignal.timeout(10000),
          },
        );
        if (!response.ok) throw new Error(`GitHub returned ${response.status}`);
        const batch: unknown = await response.json();
        if (!Array.isArray(batch) || !batch.every(isRepository))
          throw new Error("Invalid repository response");
        repos.push(...batch);
        if (batch.length < 100) break;
      }
      // Replace only after every page arrives, so failures never leave a partial library.
      const fragment = document.createDocumentFragment();
      for (const repo of repos.filter(
        (r) => r.name.toLowerCase() !== "bradycai",
      ))
        fragment.append(
          renderCard(describeRepository(repo), library.dataset.base ?? "/"),
        );
      grid.replaceChildren(fragment);
      const count = grid.childElementCount;
      library.querySelectorAll("[data-library-count]").forEach((el) => {
        el.textContent = String(count);
      });
      document.querySelectorAll("[data-project-total]").forEach((el) => {
        el.textContent = String(count);
      });
      syncStatus.textContent = "Synced with GitHub just now";
      const time = library.querySelector<HTMLTimeElement>(".sync-date time");
      if (time) {
        time.dateTime = new Date().toISOString();
        time.textContent = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "America/New_York",
        });
      }
      apply();
    } catch {
      syncStatus.textContent = "GitHub unavailable · showing saved projects";
    } finally {
      refresh.disabled = false;
      refresh.textContent = "Refresh ↻";
    }
  });
  apply(false);
}

function isRepository(value: unknown): value is GitHubRepository {
  if (!value || typeof value !== "object") return false;
  const repo = value as Record<string, unknown>;
  return (
    typeof repo.name === "string" &&
    typeof repo.pushed_at === "string" &&
    typeof repo.fork === "boolean" &&
    typeof repo.archived === "boolean" &&
    (repo.language === null || typeof repo.language === "string") &&
    (repo.description === null || typeof repo.description === "string")
  );
}

// GitHub strings are assigned as text, never injected as HTML.
function element<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text?: string,
) {
  const el = document.createElement(tag);
  el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
function link(text: string, href: string, external = true) {
  const el = element("a", "", text);
  el.href = href;
  if (external) {
    el.target = "_blank";
    el.rel = "noopener";
  }
  return el;
}
function renderCard(project: PortfolioProject, base: string) {
  const card = element("article", "repository-card spotlight is-new");
  Object.assign(card.dataset, {
    projectCard: "",
    name: project.name,
    title: project.title,
    category: project.category,
    search:
      `${project.title} ${project.name} ${project.description} ${project.stack.join(" ")}`.toLowerCase(),
    updated: project.pushedAt,
  });
  const top = element("div", "repository-top");
  const symbol = element("span", `project-symbol ${project.color}`);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  for (const [key, value] of Object.entries({
    viewBox: "0 0 24 24",
    width: "23",
    height: "23",
    fill: "none",
    stroke: "currentColor",
    "stroke-width": "1.4",
    "stroke-linejoin": "round",
    "stroke-linecap": "round",
    "aria-hidden": "true",
  }))
    svg.setAttribute(key, value);
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", projectSymbols[project.symbol]);
  svg.append(path);
  symbol.append(svg);
  const arrow = link("↗", project.url);
  arrow.className = "repository-arrow";
  arrow.setAttribute("aria-label", `View ${project.title} on GitHub`);
  top.append(
    symbol,
    element(
      "span",
      "repository-type",
      `${project.category}${project.fork ? " · Fork" : ""}${project.archived ? " · Archived" : ""}`,
    ),
    arrow,
  );
  const caseUrl = `${base}projects/${project.caseStudy}/`;
  const heading = element("h3", "");
  heading.append(
    link(
      project.title,
      project.caseStudy ? caseUrl : project.url,
      !project.caseStudy,
    ),
  );
  const tags = element("ul", "tech-tags");
  tags.setAttribute("aria-label", "Technologies");
  project.stack.forEach((tech) => tags.append(element("li", "", tech)));
  const bottom = element("div", "repository-bottom");
  const language = element("p", "");
  const dot = element("span", `language-dot ${project.color}`);
  dot.setAttribute("aria-hidden", "true");
  language.append(
    dot,
    document.createTextNode(project.language ?? "Team project"),
  );
  const links = element("div", "repository-links");
  if (project.caseStudy) links.append(link("Case study ↗", caseUrl, false));
  if (project.live) links.append(link("Live site ↗", project.live));
  links.append(link("Code ↗", project.url));
  bottom.append(language, links);
  card.append(
    top,
    heading,
    element("p", "repository-description", project.description),
    tags,
    bottom,
  );
  return card;
}
