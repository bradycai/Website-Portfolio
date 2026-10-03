// A small confirmation that slides up from the bottom of the screen.
let timer: number | undefined;

export function showToast(message: string) {
  const toast = document.querySelector<HTMLElement>("[data-toast]");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(timer);
  timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2200);
}
