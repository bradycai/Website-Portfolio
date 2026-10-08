// Always render a complete project library, including when GitHub is unavailable.
import fallback from "../data/github-repositories.json";
import {
  describeRepository,
  type GitHubRepository,
  type PortfolioProject,
} from "../data/projects";

export type GitHubSnapshot = {
  repoCount: number;
  projects: PortfolioProject[];
  languages: { name: string; share: number }[];
  recent: {
    name: string;
    description: string | null;
    url: string;
    pushedAt: string;
    language: string | null;
  }[];
  fetchedAt: string;
  source: "github" | "snapshot";
};

let cached: Promise<GitHubSnapshot> | undefined;
export function getGitHubSnapshot() {
  cached ??= load();
  return cached;
}

async function load(): Promise<GitHubSnapshot> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "bradycai-portfolio-build",
  };
  if (process.env.GITHUB_TOKEN)
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  let repos: GitHubRepository[] = fallback;
  let source: GitHubSnapshot["source"] = "snapshot";
  let fetchedAt = "2026-10-07T03:44:05Z";
  try {
    const loaded: GitHubRepository[] = [];
    for (let page = 1; ; page++) {
      const res = await fetch(
        `https://api.github.com/users/bradycai/repos?per_page=100&sort=pushed&page=${page}`,
        { headers, signal: AbortSignal.timeout(8000) },
      );
      if (!res.ok) throw new Error(`GitHub returned ${res.status}`);
      const batch = (await res.json()) as GitHubRepository[];
      loaded.push(...batch);
      if (batch.length < 100) break;
    }
    repos = loaded;
    source = "github";
    fetchedAt = new Date().toISOString();
  } catch (error) {
    console.warn(
      `[github] Using the saved project library: ${(error as Error).message}`,
    );
  }
  // The profile README is not a project. Include the portfolio, forks, and archives.
  repos = repos
    .filter((r) => r.name.toLowerCase() !== "bradycai")
    .sort((a, b) => b.pushed_at.localeCompare(a.pushed_at));
  const originals = repos.filter(
    (r) => !r.fork && r.name !== "Website-Portfolio",
  );
  const totals = new Map<string, number>();
  if (source === "github") {
    const results = await Promise.allSettled(
      originals.map(async (repo) => {
        const res = await fetch(
          `https://api.github.com/repos/bradycai/${encodeURIComponent(repo.name)}/languages`,
          { headers, signal: AbortSignal.timeout(5000) },
        );
        if (!res.ok) throw new Error(String(res.status));
        return (await res.json()) as Record<string, number>;
      }),
    );
    // A partial language set would give misleading percentages.
    if (results.every((r) => r.status === "fulfilled"))
      for (const result of results) {
        if (result.status === "fulfilled")
          for (const [name, bytes] of Object.entries(result.value))
            totals.set(name, (totals.get(name) ?? 0) + bytes);
      }
  }
  const sum = [...totals.values()].reduce((a, b) => a + b, 0);
  const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]);
  const languages = sum
    ? ranked.slice(0, 4).map(([name, bytes]) => ({ name, share: bytes / sum }))
    : [];
  const rest = ranked.slice(4).reduce((a, [, bytes]) => a + bytes, 0);
  if (rest > 0) languages.push({ name: "Other", share: rest / sum });
  return {
    repoCount: repos.length,
    projects: repos.map(describeRepository),
    languages,
    source,
    fetchedAt,
    recent: repos
      .slice(0, 3)
      .map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        pushedAt: r.pushed_at,
        language: r.language,
      })),
  };
}
