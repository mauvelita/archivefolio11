(() => {
  const pages = Array.from(document.querySelectorAll(".page"));
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");
  const indicator = document.getElementById("pageIndicator");
  const audio = document.getElementById("bgm");
  const enterBtn = document.querySelector('[data-action="enter"]');
  const nav = document.getElementById("site-nav");
  const toggle = document.getElementById("navToggle");
  const header = document.querySelector(".site-header");

  let index = 0;
  let musicStarted = false;
  let flipping = false;

  const labels = pages.map((page) => page.dataset.label || "");

  function clamp(i) {
    return Math.max(0, Math.min(pages.length - 1, i));
  }

  function updateControls() {
    if (prevBtn) prevBtn.disabled = index <= 0;
    if (nextBtn) nextBtn.disabled = index >= pages.length - 1;
    if (indicator) {
      const titleEl = pages[index]?.querySelector("h1, h2");
      const title = titleEl ? titleEl.textContent.trim() : labels[index] || "";
      indicator.textContent = index === 0 ? "" : title;
    }
  }

  function showPage(nextIndex, direction = 1) {
    nextIndex = clamp(nextIndex);
    if (nextIndex === index || flipping) return;

    const current = pages[index];
    const next = pages[nextIndex];
    if (!current || !next) return;

    flipping = true;

    current.classList.remove("is-active");
    current.classList.add(direction >= 0 ? "is-exit-left" : "is-exit-right");

    next.classList.remove("is-exit-left", "is-exit-right");
    next.classList.add(
      "is-active",
      direction >= 0 ? "is-enter-right" : "is-enter-left"
    );

    window.setTimeout(() => {
      current.classList.remove("is-exit-left", "is-exit-right");
      next.classList.remove("is-enter-right", "is-enter-left");
      flipping = false;
    }, 520);

    index = nextIndex;
    updateControls();
    next.scrollTop = 0;
  }

  function startMusic() {
    if (!audio || musicStarted) return;
    try {
      audio.volume = 0.4;
      audio.loop = true;
      const playAttempt = audio.play();
      if (playAttempt && typeof playAttempt.then === "function") {
        playAttempt
          .then(() => {
            musicStarted = true;
          })
          .catch(() => {});
      } else {
        musicStarted = true;
      }
    } catch {}
  }

  ["pointerdown", "keydown", "touchstart"].forEach((evt) => {
    document.addEventListener(evt, startMusic, { once: true, passive: true });
  });

  if (enterBtn) {
    enterBtn.addEventListener("click", (event) => {
      event.preventDefault();
      startMusic();
      showPage(1, 1);
    });
  }

  const brand = document.querySelector(".brand-mark");
  if (brand) {
    brand.addEventListener("click", (event) => {
      event.preventDefault();
      closeNav();
      showPage(0, -1);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => showPage(index - 1, -1));
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      startMusic();
      showPage(index + 1, 1);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault();
      startMusic();
      showPage(index + 1, 1);
    }
    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      showPage(index - 1, -1);
    }
  });

  document.querySelectorAll("[data-goto]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = Number(link.getAttribute("data-goto"));
      if (!Number.isNaN(target)) {
        startMusic();
        showPage(target, target > index ? 1 : -1);
      }
      closeNav();
    });
  });

  function closeNav() {
    if (!nav || !toggle) return;
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
  }

  function openNav() {
    if (!nav || !toggle) return;
    toggle.setAttribute("aria-expanded", "true");
    nav.classList.add("is-open");
  }

  if (nav && toggle) {
    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const open = toggle.getAttribute("aria-expanded") === "true";
      if (open) closeNav();
      else openNav();
    });

    document.addEventListener("pointerdown", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (header && header.contains(event.target)) return;
      closeNav();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNav();
    });
  }

  pages.forEach((page, i) => {
    page.classList.toggle("is-active", i === 0);
  });
  updateControls();
})();
