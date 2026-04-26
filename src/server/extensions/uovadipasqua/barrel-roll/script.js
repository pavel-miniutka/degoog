const DURATION_MS = 4000;

export function run() {
  const html = document.documentElement;
  html.classList.add("egg-barrel-roll-active");
  window.setTimeout(() => {
    html.classList.remove("egg-barrel-roll-active");
  }, DURATION_MS);
}
