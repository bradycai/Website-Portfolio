// Behavior for the ⌘K command menu (markup in src/components/CommandPalette.astro).
import { navigate } from "astro:transitions/client";
import { showToast } from "./toast";

const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);

// Accent- and case-insensitive, so "resume" finds "Résumé".
const normalize = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function dialog() {
  return document.querySelector<HTMLDialogElement>("[data-palette]");
}

export function openPalette() {
  const palette = dialog();
  if (!palette || palette.open) return;
  palette.showModal();
  palette.querySelector<HTMLInputElement>("[data-palette-input]")?.focus();
}

export function setupPalette() {
  document.querySelectorAll("[data-kbd-hint]").forEach((el) => {
    el.textContent = isMac ? "⌘K" : "Ctrl K";
  });
  document.querySelectorAll<HTMLElement>("[data-palette-open]").forEach((button) => {
    if (button.dataset.boundPalette) return;
    button.dataset.boundPalette = "1";
    button.addEventListener("click", openPalette);
  });

  const palette = dialog();
  if (!palette || palette.dataset.bound) return;
  palette.dataset.bound = "1";

  const input = palette.querySelector<HTMLInputElement>("[data-palette-input]")!;
  const items = [...palette.querySelectorAll<HTMLElement>("[data-item]")];
  const groups = [...palette.querySelectorAll<HTMLElement>("[data-group]")];
  const empty = palette.querySelector<HTMLElement>("[data-palette-empty]")!;
  const haystacks = new Map(items.map((item) => [item, normalize(item.dataset.search ?? "")]));

  let visible = items;
  let active = 0;

  const highlight = (index: number) => {
    if (!visible.length) return;
    active = (index + visible.length) % visible.length;
    visible.forEach((item, i) => item.setAttribute("aria-selected", String(i === active)));
    input.setAttribute("aria-activedescendant", visible[active].id);
    visible[active].scrollIntoView({ block: "nearest" });
  };

  const filter = () => {
    const terms = normalize(input.value).split(/\s+/).filter(Boolean);
    visible = items.filter((item) => {
      const match = terms.every((term) => haystacks.get(item)!.includes(term));
      item.hidden = !match;
      item.setAttribute("aria-selected", "false");
      return match;
    });
    groups.forEach((group) => {
      group.hidden = !group.querySelector("[data-item]:not([hidden])");
    });
    empty.hidden = visible.length > 0;
    if (visible.length) highlight(0);
    else input.removeAttribute("aria-activedescendant");
  };

  const run = async (item: HTMLElement) => {
    const { href, action, value } = item.dataset;
    palette.close();
    if (action === "copy" && value) {
      try {
        await navigator.clipboard.writeText(value);
        showToast(`Copied ${value}`);
      } catch {
        window.location.href = `mailto:${value}`;
      }
    } else if (action === "theme") {
      document.querySelector<HTMLElement>("[data-theme-toggle]")?.click();
    } else if (href && item.dataset.external !== undefined) {
      window.open(href, "_blank", "noopener");
    } else if (href) {
      navigate(href);
    }
  };

  input.addEventListener("input", filter);
  input.addEventListener("keydown", (event) => {
    const keys: Record<string, () => void> = {
      ArrowDown: () => highlight(active + 1),
      ArrowUp: () => highlight(active - 1),
      Home: () => highlight(0),
      End: () => highlight(visible.length - 1),
      Enter: () => visible[active] && run(visible[active]),
    };
    if (keys[event.key]) {
      event.preventDefault();
      keys[event.key]();
    }
  });
  items.forEach((item) => {
    item.addEventListener("pointermove", () => {
      const index = visible.indexOf(item);
      if (index !== active) highlight(index);
    });
    item.addEventListener("click", () => run(item));
  });
  // A click on the backdrop lands on the <dialog> itself.
  palette.addEventListener("click", (event) => {
    if (event.target === palette) palette.close();
  });
  palette.addEventListener("close", () => {
    input.value = "";
    filter();
  });

  filter();
}

// Global shortcuts, registered once: ⌘K / Ctrl+K toggles, "/" opens when not typing.
document.addEventListener("keydown", (event) => {
  const target = event.target as HTMLElement | null;
  const typing = target?.closest?.("input, textarea, select, [contenteditable='true']");
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    const palette = dialog();
    if (palette?.open) palette.close();
    else openPalette();
  } else if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
    event.preventDefault();
    openPalette();
  }
});
