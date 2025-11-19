const SELECTOR_IMG = 'img.responsive-img, img[data-resize="true"]';
const DEFAULT_MIN_RATIO = 0.5;
const DEFAULT_MAX_RATIO = 2;
const DEBOUNCE_MS = 120;

let baseWindowWidth = window.innerWidth;
let baseRootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
const images = [];

function init() {
  baseWindowWidth = window.innerWidth;
  baseRootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;

  document.querySelectorAll(SELECTOR_IMG).forEach((img) => {
    const rect = img.getBoundingClientRect();
    const base = img.dataset.baseWidth ? parseFloat(img.dataset.baseWidth) : rect.width || img.naturalWidth || img.width;
    img.dataset.baseWidth = base;
    images.push(img);
    img.style.height = "auto";
    img.style.display = img.style.display || "inline-block";
  });

  applyResize();
  window.addEventListener("resize", debounce(applyResize, DEBOUNCE_MS));
}

function applyResize() {
  console.log("##");

  const currentWidth = window.innerWidth;
  const htmlMin = parseFloat(document.documentElement.dataset.minRatio) || DEFAULT_MIN_RATIO;
  const htmlMax = parseFloat(document.documentElement.dataset.maxRatio) || DEFAULT_MAX_RATIO;
  const ratio = clamp(currentWidth / baseWindowWidth, htmlMin, htmlMax);

  document.documentElement.style.fontSize = baseRootFontSize * ratio + "px";

  images.forEach((img) => {
    const base = parseFloat(img.dataset.baseWidth) || img.naturalWidth || img.width;
    const imgMin = parseFloat(img.dataset.minRatio) || htmlMin;
    const imgMax = parseFloat(img.dataset.maxRatio) || htmlMax;
    const imgRatio = clamp(ratio, imgMin, imgMax);
    img.style.width = Math.round(base * imgRatio) + "px";
  });
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function debounce(fn, wait) {
  let t = null;
  return function () {
    clearTimeout(t);
    t = setTimeout(() => fn(), wait);
  };
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

// Expose for manual control / testing
window.responsiveResize = {
  init,
  applyResize,
};
