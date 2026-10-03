// Build-time snapshot of Brady's public GitHub activity. Runs during `astro build`, never in
// the browser. In GitHub Actions the workflow passes GITHUB_TOKEN for a higher rate limit.
// If the API can't be reached, this returns null and the page simply leaves the section out.

const USER = "bradycai";
// Not counted: the profile README repo, and this site (its code would skew the language mix).
const EXCLUDED = new Set(["bradycai", "Website-Portfolio"]);
const TOP_LANGUAGES = 4;

type Repo = {
  name: string;
  description: string | null;
  html_url: string;
  pushed_at: string;
  language: string | null;
  fork: boolean;
  archived: boolean;
  languages_url: string;
};

export type GitHubSnapshot = {
  repoCount: number;
  languages: { name: string; share: number }[];
  recent: { name: string; description: string | null; url: string; pushedAt: string; language: string | null }[];
  fetchedAt: string;
};

let cached: Promise<GitHubSnapshot | null> | undefined;

export function getGitHubSnapshot() {
  cached ??= load();
  return cached;
}

async function load(): Promise<GitHubSnapshot | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "bradycai-portfolio-build",
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, { headers });
    if (!res.ok) throw new Error(`repos request failed: ${res.status}`);
    const repos = ((await res.json()) as Repo[]).filter((r) => !r.fork && !r.archived && !EXCLUDED.has(r.name));

    const perRepo = await Promise.all(
      repos.map(async (r) => {
        const langRes = await fetch(r.languages_url, { headers });
        if (!langRes.ok) throw new Error(`languages request failed: ${langRes.status}`);
        return (await langRes.json()) as Record<string, number>;
      })
    );

    const totals = new Map<string, number>();
    for (const langs of perRepo) {
      for (const [name, bytes] of Object.entries(langs)) totals.set(name, (totals.get(name) ?? 0) + bytes);
    }
    const sum = [...totals.values()].reduce((a, b) => a + b, 0);
    if (!sum) throw new Error("no language data");

    const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const languages = ranked.slice(0, TOP_LANGUAGES).map(([name, bytes]) => ({ name, share: bytes / sum }));
    const rest = ranked.slice(TOP_LANGUAGES).reduce((a, [, bytes]) => a + bytes, 0);
    if (rest > 0) languages.push({ name: "Other", share: rest / sum });

    return {
      repoCount: repos.length,
      languages,
      recent: repos.slice(0, 3).map((r) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        pushedAt: r.pushed_at,
        language: r.language,
      })),
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`[github] Skipping the activity section: ${(error as Error).message}`);
    return null;
  }
}
