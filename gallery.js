/* Gallery lightbox + lazy-load + load animations */

// helper: select
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));

const grid = $('#galleryGrid');
const items = $$('.gallery-item img.lazy');
const lightbox = $('#lightbox');
const lbImg = document.querySelector('.lb-img');
const lbSpinner = document.querySelector('.lb-spinner');
const lbClose = document.querySelector('.lb-close');
const lbPrev = document.querySelector('.lb-prev');
const lbNext = document.querySelector('.lb-next');

let currentIndex = -1;

// ------------- lazy load images with IntersectionObserver -------------
function lazyLoadImages() {
  if (!('IntersectionObserver' in window)) {
    // fallback: load all
    items.forEach(img => { img.src = img.dataset.src; img.addEventListener('load', () => img.classList.add('loaded')); });
    return;
  }

  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.addEventListener('load', () => img.classList.add('loaded'));
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '120px 0px' });

  items.forEach(img => io.observe(img));
}

// ------------- open lightbox -------------
function openLightbox(index) {
  currentIndex = index;
  const imgEl = items[index];
  if (!imgEl) return;
  const src = imgEl.dataset.src || imgEl.src;

  lbImg.classList.remove('visible');
  lbSpinner.classList.add('visible');
  lightbox.classList.add('visible');
  lightbox.setAttribute('aria-hidden', 'false');

  // load the image (smooth animation)
  const loader = new Image();
  loader.onload = () => {
    lbSpinner.classList.remove('visible');
    lbImg.src = loader.src;
    lbImg.alt = imgEl.alt || '';
    // small timeout to ensure CSS transition
    requestAnimationFrame(() => {
      lbImg.classList.add('visible');
    });
    // preload neighbors
    preloadNeighbor(currentIndex - 1);
    preloadNeighbor(currentIndex + 1);
  };
  loader.onerror = () => {
    lbSpinner.classList.remove('visible');
    // fallback: show broken image placeholder (optional)
    lbImg.src = src;
    lbImg.classList.add('visible');
  };
  loader.src = src;
}

// ------------- preload neighbor -------------
function preloadNeighbor(i) {
  if (i < 0 || i >= items.length) return;
  const src = items[i].dataset.src || items[i].src;
  const p = new Image();
  p.src = src;
}

// ------------- close lightbox -------------
function closeLightbox() {
  lightbox.classList.remove('visible');
  lbImg.classList.remove('visible');
  lbSpinner.classList.remove('visible');
  lightbox.setAttribute('aria-hidden', 'true');
  lbImg.src = '';
  currentIndex = -1;
}

// ------------- next / prev -------------
function showNext() {
  if (currentIndex < items.length - 1) {
    openLightbox(currentIndex + 1);
  } else {
    // loop to start
    openLightbox(0);
  }
}
function showPrev() {
  if (currentIndex > 0) {
    openLightbox(currentIndex - 1);
  } else {
    openLightbox(items.length - 1);
  }
}

// ------------- attach click handlers to grid images -------------
function wireGallery() {
  items.forEach((img, idx) => {
    // click opens lightbox
    img.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(idx);
    });
    // keyboard accessibility
    img.tabIndex = 0;
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') openLightbox(idx);
    });
  });
}

// ------------- lightbox UI handlers -------------
lbClose.addEventListener('click', closeLightbox);
lbNext.addEventListener('click', showNext);
lbPrev.addEventListener('click', showPrev);

// click outside image closes
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});

// keyboard nav: Esc, ArrowLeft, ArrowRight
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('visible')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowRight') showNext();
  if (e.key === 'ArrowLeft') showPrev();
});

// ------------- initialize -------------
document.addEventListener('DOMContentLoaded', () => {
  lazyLoadImages();
  wireGallery();
});
