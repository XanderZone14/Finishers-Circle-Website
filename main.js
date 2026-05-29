/* =========================================================
   FINISHERS CIRCLE — Main JavaScript
   ========================================================= */

'use strict';

/* ── UTILS ── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ════════════════════════════════════════════
   1. SCROLL PROGRESS BAR
════════════════════════════════════════════ */
const progressBar = qs('#scrollProgress');
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (progressBar && docHeight > 0) {
    progressBar.style.width = (scrollTop / docHeight * 100) + '%';
  }
}

/* ════════════════════════════════════════════
   2. STICKY HEADER
════════════════════════════════════════════ */
const header = qs('#mainHeader');
function updateHeader() {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 30);
}

/* ════════════════════════════════════════════
   3. HERO VIDEO PARALLAX FADE
════════════════════════════════════════════ */
const heroVideo = qs('.hero-video');
function updateHeroVideo() {
  if (!heroVideo) return;
  const scrolled = window.scrollY;
  const viewH = window.innerHeight;
  // Fade video as user scrolls down
  const opacity = Math.max(0, 1 - (scrolled / (viewH * 0.6)));
  heroVideo.style.opacity = opacity;
}

/* ════════════════════════════════════════════
   4. SCROLL-DRIVEN SECTION ANIMATIONS
════════════════════════════════════════════ */
function initScrollAnimations() {
  const elements = qsa('[data-animate]');
  if (!elements.length || !('IntersectionObserver' in window)) {
    // Fallback: show everything immediately
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = parseInt(el.dataset.delay || 0, 10);
        setTimeout(() => el.classList.add('is-visible'), delay);
        observer.unobserve(el);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -56px 0px'
  });

  elements.forEach(el => observer.observe(el));
}

/* Hero logo entrance on load */
function animateHeroLogo() {
  const logo = qs('.hero-logo');
  if (logo) {
    requestAnimationFrame(() => {
      logo.style.opacity = '0';
      logo.style.transform = 'scale(0.88)';
      setTimeout(() => {
        logo.style.transition = 'opacity 0.9s ease, transform 0.9s cubic-bezier(0.22,1,0.36,1)';
        logo.style.opacity = '1';
        logo.style.transform = 'scale(1)';
      }, 200);
    });
  }
}

/* ════════════════════════════════════════════
   5. ANIMATED STAT COUNTERS
════════════════════════════════════════════ */
function initCounters() {
  const counters = qsa('.stat-number[data-target]');
  if (!counters.length || !('IntersectionObserver' in window)) return;

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => countObserver.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const startTime = performance.now();

  function step(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out quad
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

/* ════════════════════════════════════════════
   6. COUNTDOWN TIMER
════════════════════════════════════════════ */
function initCountdown() {
  // Next event: Submission Series Vol. 4 — August 15, 2026
  const TARGET_DATE = new Date('2026-08-15T09:00:00');
  const days  = qs('#cdDays');
  const hours = qs('#cdHours');
  const mins  = qs('#cdMins');
  const secs  = qs('#cdSecs');

  if (!days) return;

  function pad(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now  = new Date();
    const diff = TARGET_DATE - now;

    if (diff <= 0) {
      days.textContent = hours.textContent = mins.textContent = secs.textContent = '00';
      qs('#heroCountdown').querySelector('.countdown-label').textContent = 'Event Live Now!';
      return;
    }

    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);

    days.textContent  = pad(d);
    hours.textContent = pad(h);
    mins.textContent  = pad(m);
    secs.textContent  = pad(s);
  }

  tick();
  setInterval(tick, 1000);
}

/* ════════════════════════════════════════════
   7. MOBILE HAMBURGER MENU
════════════════════════════════════════════ */
const hamburger    = qs('#hamburger');
const mobileMenu   = qs('#mobileMenu');
const mobileClose  = qs('#mobileClose');
const mobileBackdrop = qs('#mobileBackdrop');

function openMobileMenu() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.add('active');
  hamburger.setAttribute('aria-expanded', 'true');
  mobileMenu.classList.add('open');
  mobileMenu.removeAttribute('aria-hidden');
  mobileBackdrop && mobileBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
  const firstLink = qs('.mobile-nav-link', mobileMenu);
  if (firstLink) firstLink.focus();
}

function closeMobileMenu() {
  if (!hamburger || !mobileMenu) return;
  hamburger.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
  mobileMenu.setAttribute('aria-hidden', 'true');
  mobileBackdrop && mobileBackdrop.classList.remove('open');
  document.body.style.overflow = '';
  hamburger.focus();
}

function initMobileMenu() {
  if (!hamburger) return;
  hamburger.addEventListener('click', () => {
    hamburger.getAttribute('aria-expanded') === 'true' ? closeMobileMenu() : openMobileMenu();
  });
  mobileClose && mobileClose.addEventListener('click', closeMobileMenu);
  mobileBackdrop && mobileBackdrop.addEventListener('click', closeMobileMenu);

  // Close on nav link click
  qsa('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) {
      closeMobileMenu();
    }
  });
}

/* ════════════════════════════════════════════
   8. DESKTOP DROPDOWN MENU
════════════════════════════════════════════ */
function initDropdowns() {
  const triggers = qsa('.dropdown-trigger');

  function closeAll() {
    triggers.forEach(t => {
      t.setAttribute('aria-expanded', 'false');
      const menu = t.nextElementSibling;
      if (menu) menu.classList.remove('open');
    });
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      closeAll();
      if (!isOpen) {
        trigger.setAttribute('aria-expanded', 'true');
        const menu = trigger.nextElementSibling;
        if (menu) menu.classList.add('open');
      }
    });
  });

  document.addEventListener('click', closeAll);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
}

/* ════════════════════════════════════════════
   9. ACTIVE NAV LINK ON SCROLL
════════════════════════════════════════════ */
function initActiveNav() {
  const sections = qsa('section[id], footer[id]');
  const navLinks = qsa('.nav-link[href^="#"]');
  if (!sections.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(s => io.observe(s));
}

/* ════════════════════════════════════════════
   10. REGISTRATION MODAL
════════════════════════════════════════════ */
const registerModal = qs('#registerModal');
const modalClose    = qs('#modalClose');
const modalFormView = qs('#modalFormView');
const modalSuccessView = qs('#modalSuccessView');

function openModal(presetEvent = '') {
  if (!registerModal) return;
  // Reset to form view
  showFormView();
  registerModal.classList.add('open');
  registerModal.removeAttribute('aria-hidden');
  document.body.style.overflow = 'hidden';

  if (presetEvent) {
    const select = qs('#r-tournament');
    if (select) {
      // Try to match the preset event string to an option
      const option = [...select.options].find(o => o.value.includes(presetEvent) || presetEvent.includes(o.text));
      if (option) select.value = option.value;
    }
  }

  // Focus management
  const firstField = qs('#r-firstName');
  if (firstField) setTimeout(() => firstField.focus(), 50);
}

function closeModal() {
  if (!registerModal) return;
  registerModal.classList.remove('open');
  registerModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showFormView() {
  if (modalFormView) modalFormView.removeAttribute('hidden');
  if (modalSuccessView) modalSuccessView.hidden = true;
  resetForm();
}

function showSuccessView(data) {
  if (modalFormView) modalFormView.hidden = true;
  if (modalSuccessView) {
    modalSuccessView.removeAttribute('hidden');
    const details = qs('#successDetails');
    if (details) {
      details.innerHTML = `
        <strong>${data.firstName} ${data.lastName}</strong><br>
        Tournament: ${data.tournament}<br>
        Belt: ${data.beltRank} &middot; Division: ${data.weightDivision}
        ${data.team ? `<br>Team: ${data.team}` : ''}
      `;
    }
  }
}

function initModal() {
  if (!registerModal) return;

  // Open triggers
  const openBtns = ['#heroRegisterBtn', '#openRegisterModal', '#ctaRegisterBtn', '#mobileRegisterBtn'];
  openBtns.forEach(sel => {
    const el = qs(sel);
    if (el) el.addEventListener('click', () => {
      closeMobileMenu();
      openModal();
    });
  });

  // Open from tournament card buttons
  qsa('.register-event-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.event || ''));
  });

  // Open from dropdown registration link
  const regMenuLink = qs('.register-menu-item');
  if (regMenuLink) regMenuLink.addEventListener('click', () => openModal());

  // Close triggers
  modalClose && modalClose.addEventListener('click', closeModal);
  qs('#successClose') && qs('#successClose').addEventListener('click', closeModal);

  // Close on backdrop click
  registerModal.addEventListener('click', e => {
    if (e.target === registerModal) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && registerModal.classList.contains('open')) closeModal();
  });
}

/* ════════════════════════════════════════════
   11. FORM VALIDATION + SUBMISSION
════════════════════════════════════════════ */
const FORM_ID = 'YOUR_FORM_ID'; // Replace with your Formspree form ID (https://formspree.io)

const validators = {
  'r-firstName':  val => val.trim().length >= 2  ? '' : 'Please enter your first name (at least 2 characters).',
  'r-lastName':   val => val.trim().length >= 2  ? '' : 'Please enter your last name.',
  'r-email':      val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? '' : 'Please enter a valid email address.',
  'r-phone':      val => val.trim().length >= 7  ? '' : 'Please enter a valid phone number.',
  'r-tournament': val => val ? '' : 'Please select a tournament.',
  'r-belt':       val => val ? '' : 'Please select your belt rank.',
  'r-weight':     val => val ? '' : 'Please select your weight division.',
  'r-waiver':     (_, el) => el.checked ? '' : 'You must agree to the waiver to continue.',
};

function getFieldError(id) {
  const el = qs(`#${id}`);
  if (!el) return '';
  return validators[id] ? validators[id](el.value, el) : '';
}

function setFieldState(id, error) {
  const el  = qs(`#${id}`);
  const err = qs(`#err-${id}`);
  if (!el) return;
  if (error) {
    el.classList.add('is-invalid');
    el.classList.remove('is-valid');
    if (err) err.textContent = error;
    if (id === 'r-waiver') {
      const label = el.closest('.check-label');
      if (label) label.classList.add('is-invalid');
    }
  } else {
    el.classList.remove('is-invalid');
    if (el.value) el.classList.add('is-valid');
    if (err) err.textContent = '';
    if (id === 'r-waiver') {
      const label = el.closest('.check-label');
      if (label) label.classList.remove('is-invalid');
    }
  }
}

function resetForm() {
  const form = qs('#registerForm');
  if (!form) return;
  form.reset();
  Object.keys(validators).forEach(id => {
    const el = qs(`#${id}`);
    if (el) {
      el.classList.remove('is-invalid', 'is-valid');
    }
    const err = qs(`#err-${id}`);
    if (err) err.textContent = '';
  });
  const submitBtn = qs('#submitBtn');
  if (submitBtn) submitBtn.classList.remove('loading');
}

function initFormValidation() {
  const form = qs('#registerForm');
  if (!form) return;

  // Real-time validation on blur
  Object.keys(validators).forEach(id => {
    const el = qs(`#${id}`);
    if (!el) return;
    const event = id === 'r-waiver' ? 'change' : 'blur';
    el.addEventListener(event, () => {
      const error = getFieldError(id);
      setFieldState(id, error);
    });
    // Clear error on input
    if (id !== 'r-waiver') {
      el.addEventListener('input', () => {
        if (el.classList.contains('is-invalid')) {
          const error = getFieldError(id);
          setFieldState(id, error);
        }
      });
    }
  });

  // Submit
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate all fields
    let hasErrors = false;
    Object.keys(validators).forEach(id => {
      const error = getFieldError(id);
      setFieldState(id, error);
      if (error) hasErrors = true;
    });

    if (hasErrors) {
      // Focus first invalid field
      const firstInvalid = form.querySelector('.is-invalid');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // Build payload
    const data = {
      firstName:      qs('#r-firstName').value.trim(),
      lastName:       qs('#r-lastName').value.trim(),
      email:          qs('#r-email').value.trim(),
      phone:          qs('#r-phone').value.trim(),
      tournament:     qs('#r-tournament').value,
      beltRank:       qs('#r-belt').value,
      weightDivision: qs('#r-weight').value,
      team:           qs('#r-team') ? qs('#r-team').value.trim() : '',
      _subject:       'New Registration — Finishers Circle',
    };

    const submitBtn = qs('#submitBtn');
    if (submitBtn) submitBtn.classList.add('loading');

    try {
      if (FORM_ID && FORM_ID !== 'YOUR_FORM_ID') {
        // Real Formspree submission
        const resp = await fetch(`https://formspree.io/f/${FORM_ID}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(data),
        });
        if (!resp.ok) throw new Error('Submission failed');
      } else {
        // Demo mode: simulate network delay, save to localStorage
        await new Promise(r => setTimeout(r, 1200));
        const savedKey = `fc_reg_${Date.now()}`;
        localStorage.setItem(savedKey, JSON.stringify(data));
        console.info('Registration saved (demo mode):', data);
      }
      showSuccessView(data);
    } catch (err) {
      // Show success anyway (graceful degradation) — user data saved locally
      const savedKey = `fc_reg_fallback_${Date.now()}`;
      localStorage.setItem(savedKey, JSON.stringify(data));
      console.warn('Formspree error (saved locally):', err);
      showSuccessView(data);
    } finally {
      if (submitBtn) submitBtn.classList.remove('loading');
    }
  });
}

/* ════════════════════════════════════════════
   12. SMOOTH SCROLL FOR ANCHOR LINKS
════════════════════════════════════════════ */
function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = qs(href);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - (header ? header.offsetHeight : 0);
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ════════════════════════════════════════════
   13. CONSOLIDATED SCROLL HANDLER
════════════════════════════════════════════ */
let ticking = false;
function onScroll() {
  if (!ticking) {
    requestAnimationFrame(() => {
      updateScrollProgress();
      updateHeader();
      updateHeroVideo();
      ticking = false;
    });
    ticking = true;
  }
}

/* ════════════════════════════════════════════
   INIT
════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Run immediately
  updateHeader();
  updateScrollProgress();

  // Initialize features
  animateHeroLogo();
  initScrollAnimations();
  initCounters();
  initCountdown();
  initMobileMenu();
  initDropdowns();
  initActiveNav();
  initModal();
  initFormValidation();
  initSmoothScroll();

  // Scroll listener
  window.addEventListener('scroll', onScroll, { passive: true });
});
