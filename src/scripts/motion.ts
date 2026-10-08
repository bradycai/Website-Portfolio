let session: AbortController | undefined;
let currentPage: Element | null = null;

export function cleanupMotion() {
  session?.abort();
  session = undefined;
  currentPage = null;
}

export function setupMotion() {
  const page = document.querySelector("main");
  if (currentPage === page && session) return;
  cleanupMotion();
  currentPage = page;
  session = new AbortController();
  const { signal } = session;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  splitHeadings();
  setupCounters(signal, reduced);

  const progress = document.querySelector<HTMLElement>(
    "[data-scroll-progress]",
  );
  const indicator = document.querySelector<HTMLElement>(
    "[data-current-section]",
  );
  const labels: Record<string, string> = {
    work: "01 / WORK",
    more: "02 / EXPLORE",
    experience: "03 / EXPERIENCE",
    about: "04 / ABOUT",
    approach: "05 / PROCESS",
    contact: "06 / CONTACT",
  };
  const sections = [
    ...document.querySelectorAll<HTMLElement>(".portfolio-home section[id]"),
  ];
  const links = [
    ...document.querySelectorAll<HTMLAnchorElement>(".nav-links a"),
  ];
  const photo = document.querySelector<HTMLElement>(".about-photo");
  let scrollFrame = 0;
  function syncScroll() {
    scrollFrame = 0;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress?.style.setProperty(
      "--scroll-progress",
      String(max > 0 ? scrollY / max : 0),
    );
    let active = "";
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= innerHeight * 0.34)
        active = section.id;
    }
    if (indicator) indicator.textContent = labels[active] ?? "00 / INTRO";
    links.forEach((link) => {
      if (active && link.hash === `#${active}`)
        link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
    if (photo && !reduced.matches) {
      const rect = photo.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < innerHeight) {
        const shift = Math.max(
          -18,
          Math.min(18, (rect.top + rect.height / 2 - innerHeight / 2) * 0.045),
        );
        photo.style.setProperty("--photo-shift", `${shift}px`);
      }
    }
  }
  const queueScroll = () => {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(syncScroll);
  };
  window.addEventListener("scroll", queueScroll, { passive: true, signal });
  window.addEventListener("resize", queueScroll, { passive: true, signal });
  const pageSize = new ResizeObserver(queueScroll);
  if (page) pageSize.observe(page);
  syncScroll();
  signal.addEventListener(
    "abort",
    () => {
      cancelAnimationFrame(scrollFrame);
      pageSize.disconnect();
    },
    { once: true },
  );

  // Delegate pointer details so newly refreshed GitHub cards get the same treatment.
  const cursor = document.querySelector<HTMLElement>("[data-motion-cursor]");
  let cursorFrame = 0;
  let x = 0,
    y = 0,
    targetX = 0,
    targetY = 0;
  let magnet: HTMLElement | null = null;
  let tilt: HTMLElement | null = null;
  let cover: HTMLElement | null = null;
  const clear = (el: HTMLElement | null, properties: string[]) =>
    properties.forEach((property) => el?.style.removeProperty(property));
  function drawCursor() {
    cursorFrame = 0;
    if (!cursor || signal.aborted || reduced.matches || !fine.matches) return;
    x += (targetX - x) * 0.22;
    y += (targetY - y) * 0.22;
    cursor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    if (Math.abs(targetX - x) + Math.abs(targetY - y) > 0.3)
      cursorFrame = requestAnimationFrame(drawCursor);
  }
  document.addEventListener(
    "pointermove",
    (event) => {
      if (reduced.matches || !fine.matches || event.pointerType === "touch")
        return;
      const target = event.target instanceof Element ? event.target : null;
      targetX = event.clientX;
      targetY = event.clientY;
      if (cursor && !cursor.classList.contains("is-visible")) {
        x = targetX;
        y = targetY;
      }
      cursor?.classList.toggle(
        "is-visible",
        !target?.closest("dialog, input, select, textarea"),
      );
      cursor?.classList.toggle(
        "is-project",
        Boolean(target?.closest(".feature-media")),
      );
      if (!cursorFrame) cursorFrame = requestAnimationFrame(drawCursor);
      const nextMagnet =
        target?.closest<HTMLElement>(".btn, .round-arrow, .hero-github") ??
        null;
      if (magnet !== nextMagnet) {
        clear(magnet, ["--magnet-x", "--magnet-y"]);
        magnet = nextMagnet;
      }
      if (magnet) {
        const rect = magnet.getBoundingClientRect();
        magnet.style.setProperty(
          "--magnet-x",
          `${(event.clientX - rect.left - rect.width / 2) * 0.1}px`,
        );
        magnet.style.setProperty(
          "--magnet-y",
          `${(event.clientY - rect.top - rect.height / 2) * 0.15}px`,
        );
      }
      const nextTilt = target?.closest<HTMLElement>(".repository-card") ?? null;
      if (tilt !== nextTilt) {
        clear(tilt, ["--tilt-x", "--tilt-y"]);
        tilt = nextTilt;
      }
      if (tilt) {
        const rect = tilt.getBoundingClientRect();
        tilt.style.setProperty(
          "--tilt-x",
          `${(-(event.clientY - rect.top - rect.height / 2) / rect.height) * 3}deg`,
        );
        tilt.style.setProperty(
          "--tilt-y",
          `${((event.clientX - rect.left - rect.width / 2) / rect.width) * 3}deg`,
        );
      }
      const nextCover = target?.closest<HTMLElement>(".feature-media") ?? null;
      if (cover !== nextCover) {
        clear(cover, ["--cover-x", "--cover-y"]);
        cover = nextCover;
      }
      if (cover) {
        const rect = cover.getBoundingClientRect();
        cover.style.setProperty(
          "--cover-x",
          `${(event.clientX - rect.left - rect.width / 2) * 0.012}px`,
        );
        cover.style.setProperty(
          "--cover-y",
          `${(event.clientY - rect.top - rect.height / 2) * 0.015}px`,
        );
      }
    },
    { passive: true, signal },
  );
  const hideCursor = () => {
    cursor?.classList.remove("is-visible");
    clear(magnet, ["--magnet-x", "--magnet-y"]);
    clear(tilt, ["--tilt-x", "--tilt-y"]);
    clear(cover, ["--cover-x", "--cover-y"]);
  };
  document.documentElement.addEventListener("pointerleave", hideCursor, {
    signal,
  });
  window.addEventListener("blur", hideCursor, { signal });
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Tab") hideCursor();
    },
    { signal },
  );
  reduced.addEventListener("change", hideCursor, { signal });
  signal.addEventListener(
    "abort",
    () => {
      cancelAnimationFrame(cursorFrame);
      hideCursor();
    },
    { once: true },
  );

  const signature = document.querySelector<HTMLElement>("[data-signature]");
  if (signature) {
    const letters = [...signature.children] as HTMLElement[];
    signature.addEventListener(
      "pointermove",
      (event) => {
        if (reduced.matches || !fine.matches) return;
        letters.forEach((letter) => {
          const rect = letter.getBoundingClientRect();
          const distance = Math.abs(event.clientX - rect.left - rect.width / 2);
          letter.style.setProperty(
            "--letter-y",
            `${-Math.max(0, 1 - distance / 160) * 18}px`,
          );
        });
      },
      { passive: true, signal },
    );
    signature.addEventListener(
      "pointerleave",
      () =>
        letters.forEach((letter) => letter.style.removeProperty("--letter-y")),
      { signal },
    );
  }

  // The decorative marquee pauses offscreen and while the browser is hidden.
  const track = document.querySelector<HTMLElement>(".marquee-track");
  if (track) {
    let visible = false;
    const sync = () => {
      track.style.animationPlayState =
        visible && !document.hidden ? "running" : "paused";
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(track);
    document.addEventListener("visibilitychange", sync, { signal });
    signal.addEventListener("abort", () => observer.disconnect(), {
      once: true,
    });
  }
}

function splitHeadings() {
  document
    .querySelectorAll<HTMLElement>(
      ".section-heading h2, .experience-intro h2, .approach-heading h2, .contact-panel h2",
    )
    .forEach((heading) => {
      if (heading.dataset.split) return;
      heading.dataset.split = "1";
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      while (walker.nextNode()) nodes.push(walker.currentNode as Text);
      let index = 0;
      nodes.forEach((node) => {
        const fragment = document.createDocumentFragment();
        (node.textContent ?? "").split(/(\s+)/).forEach((word) => {
          if (!word.trim()) {
            fragment.append(document.createTextNode(word));
            return;
          }
          const wrap = document.createElement("span"),
            inner = document.createElement("span");
          wrap.className = "motion-word";
          wrap.style.setProperty("--word", String(index++));
          inner.textContent = word;
          wrap.append(inner);
          fragment.append(wrap);
        });
        node.replaceWith(fragment);
      });
    });
}

function setupCounters(signal: AbortSignal, reduced: MediaQueryList) {
  const items = [...document.querySelectorAll<HTMLElement>("[data-count-to]")];
  const frames = new Map<HTMLElement, number>();
  const showFinal = () =>
    items.forEach((item) => {
      item.textContent = item.dataset.countTo ?? "";
    });
  if (reduced.matches) {
    showFinal();
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const item = entry.target as HTMLElement;
        observer.unobserve(item);
        const target = Number(item.dataset.countTo);
        const start = performance.now();
        const update = (time: number) => {
          if (signal.aborted) return;
          const progress = Math.min(1, (time - start) / 1100);
          item.textContent = String(
            Math.round(target * (1 - Math.pow(1 - progress, 3))),
          );
          if (progress < 1 && !reduced.matches)
            frames.set(item, requestAnimationFrame(update));
          else {
            item.textContent = String(target);
            frames.delete(item);
          }
        };
        frames.set(item, requestAnimationFrame(update));
      });
    },
    { threshold: 0.5 },
  );
  items.forEach((item) => observer.observe(item));
  reduced.addEventListener(
    "change",
    () => {
      if (reduced.matches) {
        frames.forEach(cancelAnimationFrame);
        frames.clear();
        observer.disconnect();
        showFinal();
      }
    },
    { signal },
  );
  signal.addEventListener(
    "abort",
    () => {
      observer.disconnect();
      frames.forEach(cancelAnimationFrame);
    },
    { once: true },
  );
}
