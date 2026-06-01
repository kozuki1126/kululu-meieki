const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const faqList = document.querySelector("[data-faq-list]");
const progressBar = document.querySelector("[data-scroll-progress]");
const lantern = document.querySelector("[data-lantern]");
const lanternZones = document.querySelectorAll("[data-lantern-zone]");
const reveals = document.querySelectorAll("[data-reveal], [data-shoji]");
const kanjis = document.querySelectorAll("[data-parallax-kanji]");
const magnetics = document.querySelectorAll("[data-magnetic]");
const tilts = document.querySelectorAll("[data-tilt]");

const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

function getFocusable(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(focusableSelector)).filter((el) => {
    if (el.inert || el.getAttribute("aria-hidden") === "true") return false;
    return el.tabIndex >= 0;
  });
}

function trapFocus(event, container) {
  if (event.key !== "Tab") return;
  const focusable = getFocusable(container);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/* Header scroll state */
function updateHeader() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 18);
}
updateHeader();

/* Scroll progress */
function updateProgress() {
  if (!progressBar) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
  progressBar.style.width = pct + "%";
  progressBar.classList.toggle("is-visible", window.scrollY > 60);
}

/* Kanji parallax */
function updateKanjiParallax() {
  if (!kanjis.length || prefersReducedMotion) return;
  kanjis.forEach((el) => {
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    if (rect.bottom < -200 || rect.top > vh + 200) return;
    const center = rect.top + rect.height / 2 - vh / 2;
    const offset = center * -0.06;
    const baseTransform = el.dataset.baseTransform || "";
    el.style.transform = `${baseTransform} translate3d(0, ${offset.toFixed(1)}px, 0)`;
  });
}
kanjis.forEach((el) => {
  if (el.classList.contains("final-cta-kanji")) {
    el.dataset.baseTransform = "translate(-50%, -50%)";
  } else {
    el.dataset.baseTransform = "";
  }
});

let scrollTicking = false;
function onScroll() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    updateHeader();
    updateProgress();
    if (!prefersReducedMotion) updateKanjiParallax();
    scrollTicking = false;
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll, { passive: true });
onScroll();

/* Nav toggle */
if (navToggle && header && nav) {
  const mobileNavQuery = window.matchMedia("(max-width: 760px)");
  const navLinks = Array.from(nav.querySelectorAll("a"));

  function syncNavInert() {
    const shouldHide = mobileNavQuery.matches && !header.classList.contains("is-open");
    nav.inert = shouldHide;
    nav.setAttribute("aria-hidden", String(shouldHide));
    navLinks.forEach((link) => {
      if (shouldHide) {
        if (!link.dataset.originalTabindex) link.dataset.originalTabindex = link.getAttribute("tabindex") || "";
        link.tabIndex = -1;
      } else if (link.dataset.originalTabindex !== undefined) {
        if (link.dataset.originalTabindex) {
          link.setAttribute("tabindex", link.dataset.originalTabindex);
        } else {
          link.removeAttribute("tabindex");
        }
        delete link.dataset.originalTabindex;
      }
    });
  }

  function setNavOpen(open, options = {}) {
    header.classList.toggle("is-open", open);
    document.body.classList.toggle("is-nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    syncNavInert();
    if (open && options.focusMenu) {
      requestAnimationFrame(() => nav.querySelector("a")?.focus());
    }
    if (!open && options.restoreFocus) navToggle.focus();
  }

  syncNavInert();
  if (mobileNavQuery.addEventListener) {
    mobileNavQuery.addEventListener("change", syncNavInert);
  } else {
    mobileNavQuery.addListener(syncNavInert);
  }

  navToggle.addEventListener("click", () => {
    setNavOpen(!header.classList.contains("is-open"), { focusMenu: true });
  });
  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setNavOpen(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (!header.classList.contains("is-open")) return;
    if (event.key === "Escape") {
      setNavOpen(false, { restoreFocus: true });
      return;
    }
    if (mobileNavQuery.matches) trapFocus(event, header);
  });
}

/* FAQ single-open */
if (faqList) {
  faqList.addEventListener("toggle", (event) => {
    if (!(event.target instanceof HTMLDetailsElement) || !event.target.open) return;
    faqList.querySelectorAll("details").forEach((detail) => {
      if (detail !== event.target) detail.removeAttribute("open");
    });
  }, true);
}

/* Inject shoji doors */
document.querySelectorAll("[data-shoji]").forEach((el) => {
  const left = document.createElement("span");
  left.className = "shoji-door shoji-door-left";
  left.setAttribute("aria-hidden", "true");
  const right = document.createElement("span");
  right.className = "shoji-door shoji-door-right";
  right.setAttribute("aria-hidden", "true");
  el.appendChild(left);
  el.appendChild(right);
});

/* Reveal on scroll */
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const target = entry.target;
      const delay = parseInt(target.dataset.revealDelay || "0", 10);
      if (delay) {
        setTimeout(() => target.classList.add("is-visible"), delay);
      } else {
        target.classList.add("is-visible");
      }
      revealObserver.unobserve(target);
    });
  }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
  reveals.forEach((el) => revealObserver.observe(el));
} else {
  reveals.forEach((el) => el.classList.add("is-visible"));
}

/* Lantern */
if (lantern && matchMedia("(hover: hover)").matches) {
  let lanternX = window.innerWidth / 2;
  let lanternY = window.innerHeight / 2;
  let targetX = lanternX;
  let targetY = lanternY;
  let inZone = false;
  let rafLantern = false;

  function loopLantern() {
    lanternX += (targetX - lanternX) * 0.18;
    lanternY += (targetY - lanternY) * 0.18;
    lantern.style.transform = `translate3d(${lanternX}px, ${lanternY}px, 0)`;
    if (Math.abs(targetX - lanternX) > 0.5 || Math.abs(targetY - lanternY) > 0.5 || inZone) {
      requestAnimationFrame(loopLantern);
    } else {
      rafLantern = false;
    }
  }

  lanternZones.forEach((zone) => {
    zone.addEventListener("mouseenter", () => {
      inZone = true;
      lantern.classList.add("is-active");
      if (!rafLantern) { rafLantern = true; loopLantern(); }
    });
    zone.addEventListener("mouseleave", () => {
      inZone = false;
      lantern.classList.remove("is-active");
    });
    zone.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!rafLantern) { rafLantern = true; loopLantern(); }
    });
  });
}

/* Magnetic buttons */
if (matchMedia("(hover: hover)").matches) {
  magnetics.forEach((btn) => {
    let raf = false;
    let tx = 0, ty = 0;
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      tx = (e.clientX - cx) * 0.22;
      ty = (e.clientY - cy) * 0.22;
      if (!raf) {
        raf = true;
        requestAnimationFrame(() => {
          btn.style.setProperty("--magnetic-x", `${tx}px`);
          btn.style.setProperty("--magnetic-y", `${ty}px`);
          raf = false;
        });
      }
    });
    btn.addEventListener("mouseleave", () => {
      btn.style.setProperty("--magnetic-x", "0px");
      btn.style.setProperty("--magnetic-y", "0px");
    });
  });
}

/* Tilt on hover */
if (matchMedia("(hover: hover)").matches) {
  tilts.forEach((el) => {
    let raf = false;
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotY = (px - 0.5) * 4;
      const rotX = (0.5 - py) * 4;
      if (!raf) {
        raf = true;
        requestAnimationFrame(() => {
          el.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
          raf = false;
        });
      }
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "perspective(1200px) rotateX(0deg) rotateY(0deg)";
    });
  });
}

/* ============= HERO IMAGE ROTATOR ============= */
(function setupHeroRotator() {
  const slides = document.querySelectorAll("[data-hero-slides] .hero-slide");
  const indicators = document.querySelectorAll("[data-hero-indicators] button");
  const indicatorGroup = document.querySelector("[data-hero-indicators]");
  if (!slides.length) return;

  let current = 0;
  let timer = null;
  const interval = 5600;

  function loadSlide(index) {
    const slide = slides[index];
    if (!slide || !slide.dataset.bg) return;
    slide.style.backgroundImage = `url("${slide.dataset.bg}")`;
    delete slide.dataset.bg;
  }

  function syncIndicators() {
    indicators.forEach((btn, i) => {
      const active = i === current;
      btn.classList.toggle("is-active", active);
      btn.setAttribute("aria-pressed", String(active));
    });
  }

  function go(index) {
    const nextIndex = (index + slides.length) % slides.length;
    if (nextIndex === current) return;
    loadSlide(nextIndex);
    slides[current].classList.remove("is-active");
    current = nextIndex;
    slides[current].classList.add("is-active");
    syncIndicators();
  }

  function next() { go(current + 1); }

  function start() {
    stop();
    if (prefersReducedMotion) return;
    timer = setInterval(next, interval);
  }
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  indicators.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      go(i);
      start();
    });
    btn.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (event.key === "ArrowRight") nextIndex = current + 1;
      if (event.key === "ArrowLeft") nextIndex = current - 1;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = slides.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      go(nextIndex);
      indicators[current]?.focus();
      start();
    });
  });

  syncIndicators();
  indicatorGroup?.addEventListener("focusin", stop);
  indicatorGroup?.addEventListener("focusout", () => {
    if (!prefersReducedMotion) start();
  });

  if (!prefersReducedMotion) start();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden || prefersReducedMotion) stop(); else start();
  });

  window.addEventListener("load", () => {
    const preloadNext = () => loadSlide(current + 1);
    if ("requestIdleCallback" in window) {
      requestIdleCallback(preloadNext, { timeout: 4200 });
    } else {
      setTimeout(preloadNext, 3200);
    }
  }, { once: true });
})();

/* Lazy background images */
(function setupLazyBackgrounds() {
  const backgrounds = document.querySelectorAll("[data-bg]:not(.hero-slide)");
  if (!backgrounds.length) return;

  function loadBackground(el) {
    el.style.backgroundImage = `url("${el.dataset.bg}")`;
    delete el.dataset.bg;
  }

  if ("IntersectionObserver" in window) {
    const bgObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadBackground(entry.target);
        bgObserver.unobserve(entry.target);
      });
    }, { rootMargin: "360px 0px" });
    backgrounds.forEach((el) => bgObserver.observe(el));
  } else {
    backgrounds.forEach(loadBackground);
  }
})();

/* ============= COURSE SLIDER ============= */
(function setupCourseSlider() {
  const slider = document.querySelector("[data-course-slider]");
  if (!slider) return;

  const range = slider.querySelector("[data-course-range]");
  const fill = slider.querySelector("[data-slider-fill]");
  const marks = slider.querySelectorAll("[data-slider-marks] button");
  const options = slider.querySelectorAll("[data-course-option]");

  const img = slider.querySelector("[data-course-display-img]");
  const photoBox = slider.querySelector(".course-display-photo");
  const infoBox = slider.querySelector(".course-display-info");
  const elJp = slider.querySelector("[data-course-jp]");
  const elName = slider.querySelector("[data-course-name]");
  const elRuby = slider.querySelector("[data-course-ruby]");
  const elOcc = slider.querySelector("[data-course-occasion]");
  const elPrice = slider.querySelector("[data-course-price]");
  const elDesc = slider.querySelector("[data-course-desc]");

  const courses = Array.from(options).map((option) => ({ ...option.dataset }));
  if (!courses.length) return;

  let currentIdx = -1;
  let changeTimer = null;

  function render(idx) {
    if (idx === currentIdx) return;
    currentIdx = idx;
    const c = courses[idx];

    // animate out
    infoBox.classList.add("is-changing");
    photoBox.classList.add("is-changing");

    if (changeTimer) clearTimeout(changeTimer);
    changeTimer = setTimeout(() => {
      elJp.textContent = c.jp;
      elName.childNodes[0].nodeValue = c.name + " ";
      elRuby.textContent = c.ruby;
      elOcc.textContent = c.occasion;
      elPrice.textContent = c.price;
      elDesc.textContent = c.desc;
      img.src = c.image;
      img.alt = c.name + " ― " + c.jp;

      infoBox.classList.remove("is-changing");
      photoBox.classList.remove("is-changing");
    }, 320);

    // fill bar
    const pct = (idx / (courses.length - 1)) * 100;
    fill.style.width = pct + "%";

    // marks
    marks.forEach((m, i) => m.classList.toggle("is-active", i === idx));
    marks.forEach((m, i) => m.setAttribute("aria-pressed", String(i === idx)));
    options.forEach((option, i) => {
      const active = i === idx;
      option.classList.toggle("is-active", active);
      option.setAttribute("aria-pressed", String(active));
    });
    range.setAttribute("aria-valuetext", `${c.price} ${c.name}`);
  }

  function setCourse(idx) {
    range.value = String(idx);
    render(idx);
  }

  range.addEventListener("input", () => {
    render(parseInt(range.value, 10));
  });

  marks.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      setCourse(i);
    });
    btn.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (event.key === "ArrowRight") nextIndex = Math.min(currentIdx + 1, courses.length - 1);
      if (event.key === "ArrowLeft") nextIndex = Math.max(currentIdx - 1, 0);
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = courses.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      setCourse(nextIndex);
      marks[nextIndex]?.focus();
    });
  });

  options.forEach((option, i) => {
    option.addEventListener("click", () => {
      setCourse(i);
    });
    option.addEventListener("keydown", (event) => {
      let nextIndex = null;
      if (event.key === "Enter" || event.key === " ") nextIndex = i;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = Math.min(i + 1, courses.length - 1);
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = Math.max(i - 1, 0);
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = courses.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      setCourse(nextIndex);
      options[nextIndex]?.focus();
    });
  });

  // init
  const initial = parseInt(range.value, 10) || 0;
  // force first render
  currentIdx = -1;
  // sync without animation
  const c0 = courses[initial];
  elJp.textContent = c0.jp;
  elName.childNodes[0].nodeValue = c0.name + " ";
  elRuby.textContent = c0.ruby;
  elOcc.textContent = c0.occasion;
  elPrice.textContent = c0.price;
  elDesc.textContent = c0.desc;
  img.src = c0.image;
  img.alt = c0.name + " ― " + c0.jp;
  fill.style.width = ((initial / (courses.length - 1)) * 100) + "%";
  marks.forEach((m, i) => m.classList.toggle("is-active", i === initial));
  marks.forEach((m, i) => m.setAttribute("aria-pressed", String(i === initial)));
  options.forEach((option, i) => {
    const active = i === initial;
    option.classList.toggle("is-active", active);
    option.setAttribute("aria-pressed", String(active));
  });
  range.setAttribute("aria-valuetext", `${c0.price} ${c0.name}`);
  currentIdx = initial;
})();

/* ============= SEAT FILTER ============= */
(function setupSeatFilter() {
  const filter = document.querySelector("[data-seat-filter]");
  const grid = document.querySelector("[data-seat-grid]");
  const carousel = document.querySelector("[data-seat-carousel]");
  const empty = document.querySelector("[data-seat-empty]");
  const modal = document.querySelector("[data-seat-modal]");
  if (!filter || !grid) return;
  if (modal) modal.inert = true;

  const cards = Array.from(grid.querySelectorAll(".seat-card"));
  const buttons = Array.from(filter.querySelectorAll("button"));
  const prevButton = carousel?.querySelector("[data-seat-prev]");
  const nextButton = carousel?.querySelector("[data-seat-next]");
  const closeButtons = modal ? modal.querySelectorAll("[data-seat-close]") : [];
  const modalPanel = modal?.querySelector(".seat-modal-panel");
  const modalImg = modal?.querySelector("[data-seat-modal-img]");
  const modalCap = modal?.querySelector("[data-seat-modal-cap]");
  const modalTitle = modal?.querySelector("[data-seat-modal-title]");
  const modalDesc = modal?.querySelector("[data-seat-modal-desc]");
  const modalDetail = modal?.querySelector("[data-seat-modal-detail]");
  const modalMood = modal?.querySelector("[data-seat-modal-mood]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let selectedCard = null;
  let lastOpenedCard = null;
  let scrollRaf = 0;

  function rangeMatch(filter, cardMin, cardMax) {
    if (filter === "all") return true;
    if (filter === "31+") return cardMax >= 31;
    const [lo, hi] = filter.split("-").map(Number);
    const fLo = lo;
    const fHi = isNaN(hi) ? lo : hi;
    // overlap test
    return cardMax >= fLo && cardMin <= fHi;
  }

  function getVisibleCards() {
    return cards.filter((card) => !card.classList.contains("is-hidden"));
  }

  function updateNav() {
    const visibleCards = getVisibleCards();
    const selectedIndex = selectedCard ? visibleCards.indexOf(selectedCard) : -1;
    const hasMany = visibleCards.length > 1;
    if (prevButton) prevButton.disabled = !hasMany || selectedIndex <= 0;
    if (nextButton) nextButton.disabled = !hasMany || selectedIndex === -1 || selectedIndex >= visibleCards.length - 1;
  }

  function centerCard(card) {
    const left = card.offsetLeft - (grid.clientWidth - card.clientWidth) / 2;
    grid.scrollTo({
      left: Math.max(0, left),
      behavior: prefersReducedMotion.matches ? "auto" : "smooth"
    });
  }

  function selectCard(card, shouldScroll = false) {
    if (!card || card.classList.contains("is-hidden")) return;
    cards.forEach((item) => {
      const active = item === card;
      item.classList.toggle("is-selected", active);
      item.setAttribute("aria-pressed", String(active));
    });
    selectedCard = card;
    updateNav();
    if (shouldScroll) centerCard(card);
  }

  function syncSelectedFromScroll() {
    scrollRaf = 0;
    const visibleCards = getVisibleCards();
    if (!visibleCards.length) return;
    const gridRect = grid.getBoundingClientRect();
    const center = gridRect.left + gridRect.width / 2;
    const nearest = visibleCards.reduce((best, card) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - center);
      return distance < best.distance ? { card, distance } : best;
    }, { card: visibleCards[0], distance: Infinity }).card;
    selectCard(nearest);
  }

  function scheduleScrollSync() {
    if (scrollRaf) cancelAnimationFrame(scrollRaf);
    scrollRaf = requestAnimationFrame(syncSelectedFromScroll);
  }

  function apply(filterValue, shouldScroll = true) {
    let visible = 0;
    let firstVisible = null;
    cards.forEach((card) => {
      const min = parseInt(card.dataset.min, 10);
      const max = parseInt(card.dataset.max, 10);
      const show = rangeMatch(filterValue, min, max);
      card.classList.toggle("is-hidden", !show);
      card.setAttribute("aria-hidden", String(!show));
      card.tabIndex = show ? 0 : -1;
      if (show) {
        visible++;
        if (!firstVisible) firstVisible = card;
      } else {
        card.classList.remove("is-selected");
        card.setAttribute("aria-pressed", "false");
      }
    });
    if (empty) empty.hidden = visible !== 0;
    if (!visible) {
      selectedCard = null;
      updateNav();
      return;
    }
    const nextSelected = selectedCard && !selectedCard.classList.contains("is-hidden") ? selectedCard : firstVisible;
    requestAnimationFrame(() => selectCard(nextSelected, shouldScroll));
  }

  function openSeat(card) {
    if (!modal || card.classList.contains("is-hidden")) return;
    selectCard(card);
    const img = card.querySelector(".seat-photo img");
    const cap = card.querySelector(".seat-cap");
    const title = card.querySelector("h3");
    const desc = card.querySelector(".seat-info > p:not(.seat-cap)");
    const cardRect = card.getBoundingClientRect();

    if (modalImg && img) {
      modalImg.src = img.currentSrc || img.src;
      modalImg.alt = img.alt;
    }
    if (modalCap && cap) modalCap.textContent = cap.textContent;
    if (modalTitle && title) modalTitle.textContent = title.textContent;
    if (modalDesc && desc) modalDesc.textContent = desc.textContent;
    if (modalDetail) modalDetail.textContent = card.dataset.detail || "";
    if (modalMood) modalMood.textContent = card.dataset.mood || "";

    lastOpenedCard = card;
    modal.classList.remove("is-opening");
    modal.classList.add("is-measuring");
    modal.hidden = false;
    modal.inert = false;
    document.body.classList.add("is-modal-open");
    if (modalPanel && !prefersReducedMotion.matches) {
      const panelRect = modalPanel.getBoundingClientRect();
      const originX = cardRect.left + cardRect.width / 2 - (panelRect.left + panelRect.width / 2);
      const originY = cardRect.top + cardRect.height / 2 - (panelRect.top + panelRect.height / 2);
      modalPanel.style.setProperty("--seat-origin-x", `${originX}px`);
      modalPanel.style.setProperty("--seat-origin-y", `${originY}px`);
      modalPanel.style.setProperty("--seat-origin-scale-x", String(Math.max(0.32, cardRect.width / panelRect.width)));
      modalPanel.style.setProperty("--seat-origin-scale-y", String(Math.max(0.32, cardRect.height / panelRect.height)));
      void modalPanel.offsetWidth;
      modal.classList.remove("is-measuring");
      modal.classList.add("is-opening");
      modalPanel.addEventListener("animationend", () => modal.classList.remove("is-opening"), { once: true });
    } else {
      modal.classList.remove("is-measuring");
    }
    modal.querySelector(".seat-modal-close")?.focus();
  }

  function closeSeat() {
    if (!modal || modal.hidden) return;
    modal.classList.remove("is-opening", "is-measuring");
    modal.hidden = true;
    modal.inert = true;
    document.body.classList.remove("is-modal-open");
    if (modalImg) {
      modalImg.removeAttribute("src");
      modalImg.alt = "";
    }
    modalPanel?.style.removeProperty("--seat-origin-x");
    modalPanel?.style.removeProperty("--seat-origin-y");
    modalPanel?.style.removeProperty("--seat-origin-scale-x");
    modalPanel?.style.removeProperty("--seat-origin-scale-y");
    lastOpenedCard?.focus();
    lastOpenedCard = null;
  }

  function moveSeat(direction) {
    const visibleCards = getVisibleCards();
    if (!visibleCards.length) return;
    const currentIndex = selectedCard ? visibleCards.indexOf(selectedCard) : 0;
    const nextIndex = Math.min(Math.max(currentIndex + direction, 0), visibleCards.length - 1);
    selectCard(visibleCards[nextIndex], true);
  }

  function setActiveFilter(btn, shouldScroll = true) {
    buttons.forEach((b) => {
      const active = b === btn;
      b.classList.toggle("is-active", active);
      b.setAttribute("aria-selected", String(active));
      b.tabIndex = active ? 0 : -1;
    });
    apply(btn.dataset.filter, shouldScroll);
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActiveFilter(btn);
    });
    btn.addEventListener("keydown", (event) => {
      const currentIndex = buttons.indexOf(btn);
      let nextIndex = null;
      if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % buttons.length;
      if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = buttons.length - 1;
      if (nextIndex === null) return;
      event.preventDefault();
      buttons[nextIndex].focus();
      setActiveFilter(buttons[nextIndex]);
    });
  });

  cards.forEach((card) => {
    card.addEventListener("click", () => openSeat(card));
    card.addEventListener("focus", () => selectCard(card, true));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openSeat(card);
    });
  });

  prevButton?.addEventListener("click", () => moveSeat(-1));
  nextButton?.addEventListener("click", () => moveSeat(1));
  grid.addEventListener("scroll", scheduleScrollSync, { passive: true });
  grid.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    moveSeat(event.key === "ArrowRight" ? 1 : -1);
  });
  window.addEventListener("resize", scheduleScrollSync);

  closeButtons.forEach((btn) => {
    btn.addEventListener("click", closeSeat);
  });

  document.addEventListener("keydown", (event) => {
    if (!modal || modal.hidden) return;
    if (event.key === "Escape") {
      closeSeat();
      return;
    }
    trapFocus(event, modalPanel || modal);
  });

  buttons.forEach((btn) => {
    btn.tabIndex = btn.classList.contains("is-active") ? 0 : -1;
  });
  cards.forEach((card) => card.setAttribute("aria-pressed", "false"));
  apply("all");
})();
