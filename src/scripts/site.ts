// Client-side behavior shared by every page.
// Astro runs this module once. Per-page setup runs right away and again on
// `astro:page-load`, which fires after each client-side navigation. Every
// listener is attached through `bind`, so running setup twice is harmless.

const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

root.classList.add("reveal-ready");

function bind<T extends HTMLElement>(el: T | null, key: string, setup: (el: T) => void) {
  if (!el || el.dataset[key]) return;
  el.dataset[key] = "1";
  setup(el);
}

/* ---------- Scroll reveal ---------- */

let revealer: IntersectionObserver | undefined;

function setupReveal() {
  revealer?.disconnect();
  const items = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-in"));
    return;
  }
  revealer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-in");
        revealer?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.06 }
  );
  items.forEach((el) => revealer!.observe(el));
}

// A fast scroll or a jump (End key, a nav link) can carry an element past the
// viewport between two frames, so the observer never sees it. Reveal anything
// that has already come into view or been scrolled past.
let revealCheckQueued = false;

function revealPassed() {
  revealCheckQueued = false;
  const line = window.innerHeight * 0.92;
  document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((el) => {
    if (el.getBoundingClientRect().top < line) el.classList.add("is-in");
  });
}

window.addEventListener(
  "scroll",
  () => {
    if (revealCheckQueued) return;
    revealCheckQueued = true;
    requestAnimationFrame(revealPassed);
  },
  { passive: true }
);

/* ---------- Header: background after scrolling, hide on the way down ---------- */

let lastY = window.scrollY;

function syncHeader() {
  const header = document.querySelector<HTMLElement>("[data-header]");
  if (!header) return;
  const y = window.scrollY;
  header.classList.toggle("is-scrolled", y > 8);
  if (header.classList.contains("menu-open")) return;
  if (y > lastY + 6 && y > 320) header.classList.add("is-hidden");
  else if (y < lastY - 6 || y <= 320) header.classList.remove("is-hidden");
  lastY = y;
}

window.addEventListener("scroll", syncHeader, { passive: true });

// On the home page the big name is the logo; the small one fades in once it scrolls away.
let nameWatcher: IntersectionObserver | undefined;

function setupWordmark() {
  nameWatcher?.disconnect();
  const header = document.querySelector<HTMLElement>("[data-header]");
  const heroName = document.querySelector("[data-hero-name]");
  if (!header || !heroName) return;
  nameWatcher = new IntersectionObserver(
    ([entry]) => header.classList.toggle("show-mark", !entry.isIntersecting),
    { rootMargin: "-60px 0px 0px 0px" }
  );
  nameWatcher.observe(heroName);
}

/* ---------- Theme ---------- */

function applyTheme(theme: "light" | "dark") {
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", theme === "dark" ? "#0f0f0e" : "#f6f5f1");
  document.querySelectorAll("[data-theme-toggle]").forEach((btn) => {
    btn.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} theme`);
  });
}

async function toggleTheme(button: HTMLElement) {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  try {
    localStorage.setItem("theme", next);
  } catch {
    // Storage blocked; the switch still works for this visit.
  }
  if (!document.startViewTransition || reducedMotion.matches) {
    applyTheme(next);
    return;
  }
  // Reveal the new theme as a circle growing out of the toggle.
  const rect = button.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  root.classList.add("theme-switching");
  const transition = document.startViewTransition(() => applyTheme(next));
  try {
    await transition.ready;
    root.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      { duration: 720, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" }
    );
    await transition.finished;
  } finally {
    root.classList.remove("theme-switching");
  }
}

function setupThemeToggle() {
  document.querySelectorAll<HTMLElement>("[data-theme-toggle]").forEach((btn) => {
    bind(btn, "boundTheme", (el) => el.addEventListener("click", () => toggleTheme(el)));
  });
  applyTheme(root.dataset.theme === "dark" ? "dark" : "light");
}

/* ---------- Mobile menu ---------- */

function setMenu(open: boolean) {
  const header = document.querySelector<HTMLElement>("[data-header]");
  const toggle = document.querySelector<HTMLElement>("[data-menu-toggle]");
  if (!header || !toggle) return;
  header.classList.toggle("menu-open", open);
  header.classList.remove("is-hidden");
  toggle.setAttribute("aria-expanded", String(open));
  const label = toggle.querySelector("[data-menu-label]");
  if (label) label.textContent = open ? "Close" : "Menu";
  document.body.style.overflow = open ? "hidden" : "";
}

function setupMenu() {
  bind(document.querySelector<HTMLElement>("[data-menu-toggle]"), "boundMenu", (el) =>
    el.addEventListener("click", () => setMenu(el.getAttribute("aria-expanded") !== "true"))
  );
  bind(document.querySelector<HTMLElement>("[data-menu]"), "boundMenu", (el) =>
    el.addEventListener("click", (event) => {
      if ((event.target as Element).closest("a")) setMenu(false);
    })
  );
}

document.addEventListener("keydown", (event) => {
  const toggle = document.querySelector<HTMLElement>("[data-menu-toggle]");
  if (event.key === "Escape" && toggle?.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    toggle.focus();
  }
});

window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
  if (event.matches) setMenu(false);
});

/* ---------- Copy email ---------- */

function setupCopy() {
  const status = document.querySelector("[data-copy-status]");
  document.querySelectorAll<HTMLElement>("[data-copy]").forEach((btn) => {
    bind(btn, "boundCopy", (el) => {
      let timer: number | undefined;
      el.addEventListener("click", async () => {
        const text = el.dataset.copy ?? "";
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // No clipboard access (http, or permission denied): open the mail app instead.
          window.location.href = `mailto:${text}`;
          return;
        }
        const label = el.querySelector("[data-copy-label]");
        el.classList.add("is-copied");
        if (label) label.textContent = "Copied";
        if (status) status.textContent = `${text} copied to clipboard.`;
        clearTimeout(timer);
        timer = window.setTimeout(() => {
          el.classList.remove("is-copied");
          if (label) label.textContent = "Copy";
          if (status) status.textContent = "";
        }, 1800);
      });
    });
  });
}

/* ---------- Local time ---------- */

let clockTimer: number | undefined;

function setupClock() {
  clearInterval(clockTimer);
  const clocks = document.querySelectorAll<HTMLElement>("[data-clock]");
  if (!clocks.length) return;
  const tick = () =>
    clocks.forEach((el) => {
      const format = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: el.dataset.clock || "America/New_York",
      });
      el.textContent = format.format(new Date());
    });
  tick();
  clockTimer = window.setInterval(tick, 15_000);
}

/* ---------- Sticky story: the step crossing the middle of the screen is active ---------- */

let storyWatcher: IntersectionObserver | undefined;

function setupStory() {
  storyWatcher?.disconnect();
  const story = document.querySelector<HTMLElement>("[data-story]");
  if (!story || !("IntersectionObserver" in window)) return;
  const parts = (attr: string) => [...story.querySelectorAll<HTMLElement>(`[${attr}]`)];
  const steps = parts("data-step");
  const shots = parts("data-shot");
  const dots = parts("data-dot");
  const activate = (index: number) => {
    for (const group of [steps, shots, dots]) {
      group.forEach((el, n) => el.classList.toggle("is-active", n === index));
    }
  };
  storyWatcher = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) activate(Number((entry.target as HTMLElement).dataset.step));
      }
    },
    { rootMargin: "-50% 0px -50% 0px" }
  );
  steps.forEach((step) => storyWatcher!.observe(step));
}

/* ---------- Spotlight: cards light up around the cursor ---------- */

document.addEventListener(
  "pointermove",
  (event) => {
    const card = (event.target as Element | null)?.closest?.<HTMLElement>(".spotlight");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    card.style.setProperty("--my", `${event.clientY - rect.top}px`);
  },
  { passive: true }
);

/* ---------- Wire up ---------- */

function init() {
  setupReveal();
  setupWordmark();
  setupThemeToggle();
  setupMenu();
  setupCopy();
  setupClock();
  setupStory();
  lastY = window.scrollY;
  syncHeader();
}

init();
document.addEventListener("astro:page-load", init);
// Astro replaces the <html> attributes on navigation, so restore the flag set above.
// Reveals only animate on a first visit; after a navigation the page transition
// already moves things, and hidden elements would break the morphing covers.
document.addEventListener("astro:after-swap", () => {
  root.classList.add("reveal-ready", "reveal-instant");
  document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("is-in"));
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove("reveal-instant")));
});
document.addEventListener("astro:before-swap", () => {
  setMenu(false);
  revealer?.disconnect();
  nameWatcher?.disconnect();
  storyWatcher?.disconnect();
  clearInterval(clockTimer);
});
