// Click-to-zoom for case study screenshots. The image morphs from its spot on the page into
// a full-screen view with the View Transitions API, and back again on close.

const root = document.documentElement;
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let origin: HTMLElement | null = null;

function parts() {
  const dialog = document.querySelector<HTMLDialogElement>("[data-lightbox]");
  return { dialog, img: dialog?.querySelector<HTMLImageElement>("[data-lightbox-img]") ?? null };
}

/** The pinned walkthrough frame zooms whichever screenshot is showing. */
function resolve(trigger: HTMLElement) {
  const active = trigger.hasAttribute("data-zoom-active")
    ? trigger.querySelector<HTMLImageElement>("img.is-active")
    : null;
  const thumb = active ?? trigger.querySelector<HTMLImageElement>("img") ?? trigger;
  const src = active?.dataset.zoomSrc ?? trigger.dataset.zoom;
  const alt = active?.dataset.zoomAlt ?? trigger.dataset.zoomAlt ?? "";
  return { thumb, src, alt };
}

function morph(update: () => void, after?: () => void) {
  if (!document.startViewTransition || reducedMotion.matches) {
    update();
    after?.();
    return;
  }
  root.classList.add("vt-lightbox");
  const transition = document.startViewTransition(update);
  transition.finished.finally(() => {
    root.classList.remove("vt-lightbox");
    after?.();
  });
}

async function open(trigger: HTMLElement) {
  const { dialog, img } = parts();
  const { thumb, src, alt } = resolve(trigger);
  if (!dialog || !img || !src) return;
  img.src = src;
  img.alt = alt;
  await img.decode().catch(() => {});
  origin = thumb;
  thumb.style.viewTransitionName = "lightbox";
  morph(() => {
    thumb.style.viewTransitionName = "";
    img.style.viewTransitionName = "lightbox";
    dialog.showModal();
  });
}

function close() {
  const { dialog, img } = parts();
  if (!dialog?.open || !img) return;
  const thumb = origin?.isConnected ? origin : null;
  morph(
    () => {
      img.style.viewTransitionName = "";
      dialog.close();
      if (thumb) thumb.style.viewTransitionName = "lightbox";
    },
    () => {
      if (thumb) thumb.style.viewTransitionName = "";
    }
  );
}

export function setupLightbox() {
  const { dialog } = parts();
  if (!dialog || dialog.dataset.bound) return;
  dialog.dataset.bound = "1";
  // Esc would close the dialog instantly; route it through the morph instead.
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener("click", close);
}

// Delegated, so triggers added on any page work without re-binding.
document.addEventListener("click", (event) => {
  const trigger = (event.target as Element | null)?.closest?.<HTMLElement>("[data-zoom], [data-zoom-active]");
  if (!trigger) return;
  event.preventDefault();
  open(trigger);
});
