const overlay = document.getElementById("confirm-modal-overlay");
const titleEl = document.getElementById("confirm-modal-title");
const bodyEl = document.getElementById("confirm-modal-body");
const cancelBtn = document.getElementById("confirm-modal-cancel");
const confirmBtn = document.getElementById("confirm-modal-confirm");
const closeBtn = document.getElementById("confirm-modal-close");

let resolveConfirm: ((value: boolean) => void) | null = null;

function close(): void {
  if (overlay) overlay.style.display = "none";
  if (resolveConfirm) {
    resolveConfirm(false);
    resolveConfirm = null;
  }
}

function finish(value: boolean): void {
  if (overlay) overlay.style.display = "none";
  if (resolveConfirm) {
    resolveConfirm(value);
    resolveConfirm = null;
  }
}

export function confirmModal(options: {
  message: string;
  title?: string;
}): Promise<boolean> {
  return new Promise((resolve) => {
    if (resolveConfirm) resolveConfirm(false);
    resolveConfirm = resolve;
    if (titleEl) titleEl.textContent = options.title ?? "Confirm";
    if (bodyEl) bodyEl.textContent = options.message;
    if (overlay) overlay.style.display = "flex";
    confirmBtn?.focus();
  });
}

cancelBtn?.addEventListener("click", () => finish(false));
confirmBtn?.addEventListener("click", () => finish(true));
closeBtn?.addEventListener("click", close);
overlay?.addEventListener("click", (e) => {
  if (e.target === overlay) close();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && overlay?.style.display === "flex") close();
});
