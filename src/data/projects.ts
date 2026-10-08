export type GitHubRepository = {
  name: string;
  description: string | null;
  html_url: string;
  homepage?: string | null;
  pushed_at: string;
  language: string | null;
  fork: boolean;
  archived: boolean;
  stargazers_count?: number;
  languages_url?: string;
};

export const projectCategories = [
  "All projects",
  "AI & data",
  "Web",
  "Apps",
  "Team",
] as const;
export type ProjectCategory = (typeof projectCategories)[number];
type ProjectDetails = {
  title: string;
  description: string;
  category: ProjectCategory;
  stack: string[];
  symbol: string;
  color: string;
  caseStudy?: string;
  live?: string;
};

const details: Record<string, ProjectDetails> = {
  OrderSync: {
    title: "OrderSync",
    description:
      "Four marketplaces. One dashboard. AI-assisted order intake, inventory alerts, and customer replies with a person in control.",
    category: "AI & data",
    stack: ["React", "TypeScript", "Express", "Claude API"],
    symbol: "layers",
    color: "mint",
    caseStudy: "ordersync",
  },
  "Stock-Application": {
    title: "AI Trading Assistant",
    description:
      "Market research meets a deterministic risk engine. Claude proposes trade ideas; nine hard rules check every order.",
    category: "AI & data",
    stack: ["Python", "FastAPI", "React", "PostgreSQL"],
    symbol: "chart",
    color: "lavender",
    caseStudy: "trading-assistant",
  },
  FrogsVideography: {
    title: "Frogs Videography",
    description:
      "A complete website for a New England video production company, from responsive design to the live launch.",
    category: "Web",
    stack: ["Astro", "TypeScript", "CSS", "Netlify"],
    symbol: "play",
    color: "peach",
    caseStudy: "frogs-videography",
    live: "https://frogsvideography.com",
  },
  RepoPulse: {
    title: "RepoPulse",
    description:
      "Helping instructors understand student contributions through repository dashboards, commit analytics, and AI-assisted summaries.",
    category: "Team",
    stack: ["React", "FastAPI", "PostgreSQL"],
    symbol: "branch",
    color: "blue",
  },
  ChronoCal: {
    title: "ChronoCal",
    description:
      "A desktop calendar with recurring events, multiple calendars, and a Swing interface, built around an MVC architecture.",
    category: "Apps",
    stack: ["Java", "Swing", "JUnit"],
    symbol: "calendar",
    color: "peach",
  },
  CoinTrack: {
    title: "CoinTrack",
    description:
      "An iOS budgeting app that helps college students see where their money goes, with spending categories, charts, and history.",
    category: "Apps",
    stack: ["Swift", "SwiftUI"],
    symbol: "coin",
    color: "mint",
  },
  "Website-Portfolio": {
    title: "This portfolio",
    description:
      "The site you're exploring. An Astro portfolio with MDX case studies, interactive demos, and a GitHub-powered project library.",
    category: "Web",
    stack: ["Astro", "TypeScript", "MDX", "CSS"],
    symbol: "code",
    color: "lavender",
  },
  AppProject: {
    title: "AppProject",
    description:
      "An HTML-based project from my public GitHub archive. Explore the repository for the source and project files.",
    category: "Web",
    stack: ["HTML"],
    symbol: "code",
    color: "blue",
  },
};

export const projectSymbols: Record<string, string> = {
  layers: "m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5",
  chart: "M4 3v17h17M7 14l4-5 4 3 6-8",
  play: "M5 5h14v14H5zM10 8l6 4-6 4V8Z",
  branch:
    "M6 7v10M18 7v3a4 4 0 0 1-4 4H6M8 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM20 5a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
  calendar: "M4 5h16v16H4V5ZM4 10h16M8 3v4M16 3v4M8 14h2M14 14h2M8 17h2",
  coin: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM15 8h-4a2 2 0 0 0 0 4h2a2 2 0 0 1 0 4H9M12 6v12",
  code: "m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16",
};

export function describeRepository(repo: GitHubRepository) {
  const curated = details[repo.name];
  const category: ProjectCategory = repo.fork
    ? "Team"
    : ["Python", "Jupyter Notebook"].includes(repo.language ?? "")
      ? "AI & data"
      : ["Swift", "Java", "Kotlin"].includes(repo.language ?? "")
        ? "Apps"
        : "Web";
  return {
    name: repo.name,
    title: curated?.title ?? repo.name.replace(/[-_]/g, " "),
    description:
      curated?.description ??
      repo.description ??
      "Explore the source and project files on GitHub.",
    category: curated?.category ?? category,
    stack: curated?.stack ?? (repo.language ? [repo.language] : []),
    symbol: curated?.symbol ?? "code",
    color: curated?.color ?? "mint",
    caseStudy: curated?.caseStudy,
    live: curated?.live ?? safeWebUrl(repo.homepage),
    url: `https://github.com/bradycai/${encodeURIComponent(repo.name)}`,
    pushedAt: repo.pushed_at,
    language: repo.language,
    fork: repo.fork,
    archived: repo.archived,
    stars: repo.stargazers_count ?? 0,
  };
}

function safeWebUrl(value?: string | null) {
  if (!value) return undefined;
  try {
    const parsed = new URL(value);
    return ["https:", "http:"].includes(parsed.protocol)
      ? parsed.href
      : undefined;
  } catch {
    return undefined;
  }
}

export type PortfolioProject = ReturnType<typeof describeRepository>;
