(() => {
  "use strict";

  const root = document.documentElement;
  const header = document.querySelector("[data-header]");

  /* ---------- Reveal on scroll ---------- */
  // Runs first: content marked .reveal stays hidden until this marks it visible.
  root.classList.add("reveal-ready");
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          revealer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );
    revealEls.forEach((el) => revealer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Theme ---------- */
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeMeta = document.querySelector('meta[name="theme-color"]');
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const storedTheme = () => {
    try {
      return localStorage.getItem("theme");
    } catch {
      return null;
    }
  };

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    themeMeta.content = theme === "dark" ? "#0b0c0f" : "#f6f6f3";
    const next = theme === "dark" ? "light" : "dark";
    themeToggle.setAttribute("aria-label", `Switch to ${next} theme`);
  };

  themeToggle.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage blocked (private mode, etc.) — the toggle still works for this visit.
    }
    if (document.startViewTransition && !prefersReducedMotion.matches) {
      document.startViewTransition(() => applyTheme(next));
    } else {
      applyTheme(next);
    }
  });

  // Follow the OS setting until the visitor picks a theme themselves.
  prefersDark.addEventListener("change", (event) => {
    if (!storedTheme()) applyTheme(event.matches ? "dark" : "light");
  });

  applyTheme(root.dataset.theme);

  /* ---------- Header background on scroll ---------- */
  const syncHeader = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");

  const setMenu = (open) => {
    header.classList.toggle("nav-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };

  menuToggle.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });

  document.addEventListener("click", (event) => {
    if (header.classList.contains("nav-open") && !header.contains(event.target)) setMenu(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("nav-open")) {
      setMenu(false);
      menuToggle.focus();
    }
  });

  window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => {
    if (event.matches) setMenu(false);
  });

  /* ---------- Highlight the nav link for the section in view ---------- */
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const spiedSections = ["top", ...navLinks.map((link) => link.hash.slice(1))]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const link of navLinks) {
            const active = link.hash === `#${entry.target.id}`;
            link.classList.toggle("is-active", active);
            if (active) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
          }
        }
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    spiedSections.forEach((section) => spy.observe(section));
  }

  /* ---------- Copy email ---------- */
  const copyButton = document.querySelector("[data-copy]");
  const copyLabel = copyButton.querySelector("[data-copy-label]");
  const copyStatus = document.querySelector("[data-copy-status]");
  let copyTimer;

  copyButton.addEventListener("click", async () => {
    const email = copyButton.dataset.copy;
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      // Clipboard unavailable (insecure context or permission denied) — open the mail app instead.
      window.location.href = `mailto:${email}`;
      return;
    }
    copyButton.classList.add("is-copied");
    copyLabel.textContent = "Copied!";
    copyStatus.textContent = "Email address copied to clipboard.";
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copyButton.classList.remove("is-copied");
      copyLabel.textContent = "Copy email";
      copyStatus.textContent = "";
    }, 2000);
  });

  /* ---------- Footer year ---------- */
  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
