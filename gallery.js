/* =========================================================
   FINISHERS CIRCLE — Gallery + Nav JS
   ========================================================= */

'use strict';

const $  = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];

/* ── NAV: Scroll Progress + Sticky Header ── */
const progressBar = $('#scrollProgress');
const header      = $('#mainHeader');

function updateNav() {
  if (progressBar) {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = docH > 0 ? (window.scrollY / docH * 100) + '%' : '0%';
  }
  if (header) header.classList.toggle('scrolled', window.scrollY > 30);
}

let navTicking = false;
window.addEventListener('scroll', () => {
  if (!navTicking) {
    requestAnimationFrame(() => { updateNav(); navTicking = false; });
    navTicking = true;
  }
}, { passive: true });
updateNav();

/* ── NAV: Mobile Hamburger ── */
const hamburger      = $('#hamburger');
const mobileMenu     = $('#mobileMenu');
const mobileClose    = $('#mobileClose');
const mobileBackdrop = $('#mobileBackdrop');

function openMobileMenu() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileMenu.classList.add('open');
  mobileMenu.removeAttribute('aria-hidden');
  if (mobileBackdrop) mobileBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  if (mobileBackdrop) mobileBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.getAttribute('aria-expanded') === 'true' ? closeMobileMenu() : openMobileMenu();
  });
}
if (mobileClose)    mobileClose.addEventListener('click', closeMobileMenu);
if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMobileMenu);
$$('.mobile-nav-link').forEach(l => l.addEventListener('click', closeMobileMenu));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) closeMobileMenu();
});

/* ── GALLERY: Lazy Load ── */
const grid    = $('#galleryGrid');
const items   = $$('.gallery-item img.lazy');

function lazyLoadImages() {
  if (!('IntersectionObserver' in window)) {
    items.forEach(img => {
      img.src = img.dataset.src;
      img.addEventListener('load', () => img.classList.add('loaded'));
    });
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.addEventListener('load',  () => img.classList.add('loaded'), { once: true });
        img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '150px 0px' });
  items.forEach(img => io.observe(img));
}

/* ── GALLERY: Lightbox ── */
const lightbox   = $('#lightbox');
const lbImg      = $('.lb-img');
const lbSpinner  = $('.lb-spinner');
const lbClose    = $('.lb-close');
const lbPrev     = $('.lb-prev');
const lbNext     = $('.lb-next');
const lbCounter  = $('.lb-counter');

let currentIndex = -1;
let isLoading    = false;

function updateCounter() {
  if (lbCounter) lbCounter.textContent = `${currentIndex + 1} / ${items.length}`;
}

function openLightbox(index) {
  if (isLoading) return;
  currentIndex = Math.max(0, Math.min(index, items.length - 1));
  const imgEl = items[currentIndex];
  if (!imgEl) return;
  const src = imgEl.dataset.src || imgEl.src;

  isLoading = true;
  lbImg.classList.remove('visible');
  lbSpinner.classList.add('visible');
  lightbox.classList.add('visible');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  updateCounter();

  const loader = new Image();
  loader.onload = () => {
    lbSpinner.classList.remove('visible');
    lbImg.src = loader.src;
    lbImg.alt = imgEl.alt || '';
    requestAnimationFrame(() => lbImg.classList.add('visible'));
    isLoading = false;
    // Preload neighbours
    preloadAt(currentIndex - 1);
    preloadAt(currentIndex + 1);
  };
  loader.onerror = () => {
    lbSpinner.classList.remove('visible');
    lbImg.src = src;
    lbImg.classList.add('visible');
    isLoading = false;
  };
  loader.src = src;
}

function preloadAt(i) {
  if (i < 0 || i >= items.length) return;
  const src = items[i].dataset.src || items[i].src;
  if (src) new Image().src = src;
}

function closeLightbox() {
  lightbox.classList.remove('visible');
  lbImg.classList.remove('visible');
  lbSpinner.classList.remove('visible');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  lbImg.src = '';
  currentIndex = -1;
  isLoading = false;
}

function showNext() { openLightbox(currentIndex < items.length - 1 ? currentIndex + 1 : 0); }
function showPrev() { openLightbox(currentIndex > 0 ? currentIndex - 1 : items.length - 1); }

/* Swipe support for mobile */
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend',   e => {
  const delta = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(delta) > 60) { delta > 0 ? showNext() : showPrev(); }
});

function wireGallery() {
  items.forEach((img, idx) => {
    const parent = img.closest('.gallery-item');
    if (parent) {
      parent.setAttribute('role', 'button');
      parent.setAttribute('tabindex', '0');
      parent.setAttribute('aria-label', img.alt || `View image ${idx + 1}`);
      parent.addEventListener('click', () => openLightbox(idx));
      parent.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(idx); }
      });
    }
  });
}

/* Lightbox controls */
if (lbClose) lbClose.addEventListener('click', closeLightbox);
if (lbNext)  lbNext.addEventListener('click', showNext);
if (lbPrev)  lbPrev.addEventListener('click', showPrev);
lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('visible')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowRight') { e.preventDefault(); showNext(); }
  if (e.key === 'ArrowLeft')  { e.preventDefault(); showPrev(); }
});

/* ── GALLERY: Scroll-reveal animation on grid items ── */
function initGalleryReveal() {
  if (!('IntersectionObserver' in window)) {
    $$('.gallery-item').forEach(el => el.classList.add('revealed'));
    return;
  }
  const revealObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const items = $$('.gallery-item', entry.target.parentElement || document);
        // Stagger siblings in view
        const el = entry.target;
        const delay = parseInt(el.dataset.revealIndex || 0) * 60;
        setTimeout(() => el.style.opacity = '1', delay);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  $$('.gallery-item').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.5s ease';
    el.dataset.revealIndex = i % 4;
    revealObs.observe(el);
  });
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  lazyLoadImages();
  wireGallery();
  initGalleryReveal();
});
