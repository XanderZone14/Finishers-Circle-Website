/* =========================================================
   FINISHERS CIRCLE — Cinematic Main JavaScript
   GSAP 3.12 + ScrollTrigger
   ========================================================= */

'use strict';

/* ── UTILS ── */
const qs  = (s, ctx=document) => ctx.querySelector(s);
const qsa = (s, ctx=document) => [...ctx.querySelectorAll(s)];
const isMobile = () => window.innerWidth < 768;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────────────
     Register GSAP Plugin
  ────────────────────────────────────────────────── */
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  /* ──────────────────────────────────────────────────
     1. PRELOADER
  ────────────────────────────────────────────────── */
  const preloader = qs('#preloader');
  const preBar    = qs('#preBar');
  const preCount  = qs('#preCount');
  const preSkip   = qs('#preSkip');
  let preloaderDone = false;

  function completePreloader() {
    if (preloaderDone) return;
    preloaderDone = true;
    if (reducedMotion || typeof gsap === 'undefined') {
      if (preloader) preloader.style.display = 'none';
      startHeroAnim();
      return;
    }
    gsap.to('#preloader', {
      yPercent: -100,
      duration: 0.7,
      ease: 'power3.inOut',
      onComplete: () => {
        if (preloader) preloader.style.display = 'none';
        startHeroAnim();
      }
    });
  }

  if (reducedMotion || typeof gsap === 'undefined') {
    setTimeout(completePreloader, 100);
  } else if (preloader) {
    document.body.style.overflow = 'hidden';

    // Animate logo in
    gsap.to('.pre-logo', { opacity: 1, scale: 1, duration: 0.6, ease: 'power3.out', delay: 0.1 });
    gsap.set('.pre-logo', { scale: 0.88 });

    // Progress bar + counter
    let countVal = { n: 0 };
    const preloaderTl = gsap.timeline({
      onComplete: completePreloader
    });
    preloaderTl
      .to('.pre-logo', { opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out' }, 0)
      .to(preBar, { width: '100%', duration: 1.8, ease: 'power2.inOut' }, 0.1)
      .to(countVal, {
        n: 100,
        duration: 1.8,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (preCount) preCount.textContent = Math.round(countVal.n) + '%';
        }
      }, 0.1)
      .to('#preloader', { opacity: 1 }, 0) // keep visible
      .addPause(1.95);

    // After bar completes, brief pause then slide out
    preloaderTl.call(completePreloader, null, 2.1);

    // Skip button
    if (preSkip) {
      preSkip.addEventListener('click', () => {
        preloaderTl.kill();
        if (preBar) preBar.style.width = '100%';
        if (preCount) preCount.textContent = '100%';
        completePreloader();
      });
    }
  } else {
    startHeroAnim();
  }

  /* ──────────────────────────────────────────────────
     2. HERO ANIMATIONS
  ────────────────────────────────────────────────── */
  function startHeroAnim() {
    document.body.style.overflow = '';

    if (reducedMotion || typeof gsap === 'undefined') {
      // Show everything immediately
      qsa('.hero-logo, .manifesto-line, .hero-sub, .hero-ctas > *, #heroCountdown, .scroll-cue').forEach(el => {
        if (el) { el.style.opacity = '1'; el.style.transform = 'none'; }
      });
      initScrollFeatures();
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: initScrollFeatures
    });

    tl.from('.hero-logo',                   { opacity: 0, scale: 0.88, duration: 0.9 })
      .from('.manifesto-line:nth-child(1)', { x: -120, opacity: 0, duration: 0.7 }, '-=0.5')
      .from('.manifesto-line:nth-child(2)', { x: 120,  opacity: 0, duration: 0.7 }, '-=0.55')
      .from('.manifesto-line:nth-child(3)', { scale: 0.85, opacity: 0, duration: 0.7 }, '-=0.55')
      .from('.hero-sub',   { y: 24, opacity: 0, duration: 0.5 }, '-=0.35')
      .from('.hero-ctas > *', { y: 24, opacity: 0, stagger: 0.14, duration: 0.5 }, '-=0.35')
      .from('#heroCountdown', { opacity: 0, y: 12, duration: 0.45 }, '-=0.25')
      .from('.scroll-cue',    { opacity: 0, duration: 0.4 }, '-=0.2');
  }

  /* ──────────────────────────────────────────────────
     3. SCROLL-TRIGGERED FEATURES (init after hero)
  ────────────────────────────────────────────────── */
  function initScrollFeatures() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined' && !reducedMotion) {
      initHeroParallax();
      initSectionReveals();
    }
    initCounters();
    initCountdown();
    initScrollProgress();
    initStickyHeader();
    initMobileMenu();
    initDropdowns();
    initActiveNav();
    initModal();
    initFormValidation();
    initSmoothScroll();
    initCursor();
    initMagneticButtons();
    initTiltCards();
    initEmbers();
  }

  /* ──────────────────────────────────────────────────
     4. HERO SCROLL PARALLAX
  ────────────────────────────────────────────────── */
  function initHeroParallax() {
    if (typeof gsap === 'undefined') return;

    gsap.to('.hero-logo', {
      scale: 0.72, opacity: 0, y: -30,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: 1.5 }
    });
    gsap.to('.hero-manifesto', {
      y: -70, opacity: 0,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '50% top', scrub: 1 }
    });
    gsap.to('.hero-sub, .hero-ctas', {
      opacity: 0, y: -24,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '40% top', scrub: 1 }
    });
    gsap.to('.hero-video', {
      opacity: 0,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: '80% top', scrub: true }
    });
  }

  /* ──────────────────────────────────────────────────
     5. SECTION REVEALS
  ────────────────────────────────────────────────── */
  function initSectionReveals() {
    if (typeof gsap === 'undefined') return;

    // Stats
    gsap.to('.stat-item', {
      opacity: 1, y: 0,
      stagger: 0.12,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.stats-section', start: 'top 75%', once: true }
    });

    // One Rule section
    gsap.to('.or-label', {
      opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: '.one-rule-section', start: 'top 70%', once: true }
    });
    gsap.to('.or-title', {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: '.one-rule-section', start: 'top 70%', once: true },
      delay: 0.1
    });
    gsap.to('.or-body', {
      opacity: 1, y: 0, duration: 0.6, ease: 'power3.out',
      scrollTrigger: { trigger: '.one-rule-section', start: 'top 70%', once: true },
      delay: 0.25
    });

    // About — image clip reveal
    gsap.to('.about-img-col', {
      clipPath: 'inset(0 0% 0 0)',
      duration: 1.2,
      ease: 'power4.inOut',
      scrollTrigger: { trigger: '.about-section', start: 'top 60%', once: true }
    });
    gsap.to('.about-text-col', {
      opacity: 1, x: 0,
      duration: 1.0,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.about-section', start: 'top 60%', once: true },
      delay: 0.3
    });

    // Tournament cards
    gsap.to('.tournament-card', {
      opacity: 1, y: 0,
      stagger: 0.14,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.tournaments-grid', start: 'top 80%', once: true }
    });

    // Fighter quote
    gsap.to('.quote-text', {
      opacity: 1, scale: 1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.fighter-quote-section', start: 'top 65%', once: true }
    });
    gsap.to('.quote-author', {
      opacity: 1,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.fighter-quote-section', start: 'top 65%', once: true },
      delay: 0.3
    });

    // CTA section
    gsap.to('.cta-inner', {
      opacity: 1, y: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.cta-section', start: 'top 70%', once: true }
    });

    // Gallery preview items
    gsap.to('.preview-item', {
      opacity: 1, y: 0,
      stagger: 0.12,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.preview-grid', start: 'top 80%', once: true }
    });
    gsap.to('.gallery-cta-wrap', {
      opacity: 1, y: 0,
      duration: 0.6,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.gallery-cta-wrap', start: 'top 90%', once: true }
    });

    // Footer
    gsap.to('.footer-grid', {
      opacity: 1, y: 0,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: { trigger: '.footer-grid', start: 'top 85%', once: true }
    });
  }

  /* ──────────────────────────────────────────────────
     6. STAT COUNTERS
  ────────────────────────────────────────────────── */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start    = performance.now();
    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  function initCounters() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        trigger: '.stats-section',
        start: 'top 70%',
        once: true,
        onEnter: () => qsa('.stat-number[data-target]').forEach(animateCounter)
      });
    } else if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            qsa('.stat-number[data-target]').forEach(animateCounter);
            io.disconnect();
          }
        });
      }, { threshold: 0.3 });
      const section = qs('.stats-section');
      if (section) io.observe(section);
    }
  }

  /* ──────────────────────────────────────────────────
     7. COUNTDOWN TIMER
  ────────────────────────────────────────────────── */
  function initCountdown() {
    const TARGET_DATE = new Date('2026-08-15T09:00:00');
    const days  = qs('#cdDays');
    const hours = qs('#cdHours');
    const mins  = qs('#cdMins');
    const secs  = qs('#cdSecs');
    if (!days) return;

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      const diff = TARGET_DATE - new Date();
      if (diff <= 0) {
        days.textContent = hours.textContent = mins.textContent = secs.textContent = '00';
        const label = qs('.countdown-label');
        if (label) label.textContent = 'Event Live Now!';
        return;
      }
      days.textContent  = pad(Math.floor(diff / 86400000));
      hours.textContent = pad(Math.floor((diff % 86400000) / 3600000));
      mins.textContent  = pad(Math.floor((diff % 3600000)  / 60000));
      secs.textContent  = pad(Math.floor((diff % 60000)    / 1000));
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ──────────────────────────────────────────────────
     8. SCROLL PROGRESS BAR
  ────────────────────────────────────────────────── */
  function initScrollProgress() {
    const bar = qs('#scrollProgress');
    if (!bar) return;
    function update() {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0) bar.style.width = (window.scrollY / h * 100) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ──────────────────────────────────────────────────
     9. STICKY HEADER
  ────────────────────────────────────────────────── */
  function initStickyHeader() {
    const header = qs('#mainHeader');
    if (!header) return;
    function update() { header.classList.toggle('scrolled', window.scrollY > 30); }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ──────────────────────────────────────────────────
     10. MOBILE MENU
  ────────────────────────────────────────────────── */
  function initMobileMenu() {
    const hamburger     = qs('#hamburger');
    const mobileMenu    = qs('#mobileMenu');
    const mobileClose   = qs('#mobileClose');
    const mobileBackdrop = qs('#mobileBackdrop');

    function openMenu() {
      if (!hamburger || !mobileMenu) return;
      hamburger.classList.add('active');
      hamburger.setAttribute('aria-expanded', 'true');
      mobileMenu.classList.add('open');
      mobileMenu.removeAttribute('aria-hidden');
      if (mobileBackdrop) mobileBackdrop.classList.add('open');
      document.body.style.overflow = 'hidden';
      const first = qs('.mobile-nav-link', mobileMenu);
      if (first) first.focus();
    }

    function closeMenu() {
      if (!hamburger || !mobileMenu) return;
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.classList.remove('open');
      mobileMenu.setAttribute('aria-hidden', 'true');
      if (mobileBackdrop) mobileBackdrop.classList.remove('open');
      document.body.style.overflow = '';
      hamburger.focus();
    }

    if (hamburger) {
      hamburger.addEventListener('click', () => {
        hamburger.getAttribute('aria-expanded') === 'true' ? closeMenu() : openMenu();
      });
    }
    if (mobileClose) mobileClose.addEventListener('click', closeMenu);
    if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMenu);
    qsa('.mobile-nav-link').forEach(l => l.addEventListener('click', closeMenu));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) closeMenu();
    });

    // Expose for modal
    window._closeMobileMenu = closeMenu;
  }

  /* ──────────────────────────────────────────────────
     11. DESKTOP DROPDOWN
  ────────────────────────────────────────────────── */
  function initDropdowns() {
    const triggers = qsa('.dropdown-trigger');
    function closeAll() {
      triggers.forEach(t => {
        t.setAttribute('aria-expanded', 'false');
        const m = t.nextElementSibling;
        if (m) m.classList.remove('open');
      });
    }
    triggers.forEach(trigger => {
      trigger.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';
        closeAll();
        if (!isOpen) {
          trigger.setAttribute('aria-expanded', 'true');
          const m = trigger.nextElementSibling;
          if (m) m.classList.add('open');
        }
      });
    });
    document.addEventListener('click', closeAll);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
  }

  /* ──────────────────────────────────────────────────
     12. ACTIVE NAV
  ────────────────────────────────────────────────── */
  function initActiveNav() {
    const sections = qsa('section[id], footer[id]');
    const navLinks = qsa('.nav-link[href^="#"]');
    if (!sections.length) return;

    const io = new IntersectionObserver(entries => {
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

  /* ──────────────────────────────────────────────────
     13. SMOOTH SCROLL
  ────────────────────────────────────────────────── */
  function initSmoothScroll() {
    const header = qs('#mainHeader');
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

  /* ──────────────────────────────────────────────────
     14. REGISTRATION MODAL
  ────────────────────────────────────────────────── */
  const registerModal    = qs('#registerModal');
  const modalClose       = qs('#modalClose');
  const modalFormView    = qs('#modalFormView');
  const modalSuccessView = qs('#modalSuccessView');

  function openModal(presetEvent = '') {
    if (!registerModal) return;
    showFormView();
    registerModal.classList.add('open');
    registerModal.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';

    if (presetEvent) {
      const select = qs('#r-tournament');
      if (select) {
        const opt = [...select.options].find(o => o.value.includes(presetEvent) || presetEvent.includes(o.text));
        if (opt) select.value = opt.value;
      }
    }

    setTimeout(() => { const f = qs('#r-firstName'); if (f) f.focus(); }, 50);
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
      const det = qs('#successDetails');
      if (det) {
        det.innerHTML = `
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

    const openBtns = ['#heroRegisterBtn', '#openRegisterModal', '#ctaRegisterBtn', '#mobileRegisterBtn'];
    openBtns.forEach(sel => {
      const el = qs(sel);
      if (el) el.addEventListener('click', () => {
        if (window._closeMobileMenu) window._closeMobileMenu();
        openModal();
      });
    });

    qsa('.register-event-btn').forEach(btn => {
      btn.addEventListener('click', () => openModal(btn.dataset.event || ''));
    });

    const regMenuLink = qs('.register-menu-item');
    if (regMenuLink) regMenuLink.addEventListener('click', e => { e.preventDefault(); openModal(); });

    if (modalClose) modalClose.addEventListener('click', closeModal);
    const successClose = qs('#successClose');
    if (successClose) successClose.addEventListener('click', closeModal);

    registerModal.addEventListener('click', e => { if (e.target === registerModal) closeModal(); });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && registerModal.classList.contains('open')) closeModal();
    });
  }

  /* ──────────────────────────────────────────────────
     15. FORM VALIDATION + SUBMISSION
  ────────────────────────────────────────────────── */
  const FORM_ID = 'YOUR_FORM_ID';

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
      if (el) el.classList.remove('is-invalid', 'is-valid');
      const err = qs(`#err-${id}`);
      if (err) err.textContent = '';
    });
    const submitBtn = qs('#submitBtn');
    if (submitBtn) submitBtn.classList.remove('loading');
  }

  function initFormValidation() {
    const form = qs('#registerForm');
    if (!form) return;

    Object.keys(validators).forEach(id => {
      const el = qs(`#${id}`);
      if (!el) return;
      const event = id === 'r-waiver' ? 'change' : 'blur';
      el.addEventListener(event, () => setFieldState(id, getFieldError(id)));
      if (id !== 'r-waiver') {
        el.addEventListener('input', () => {
          if (el.classList.contains('is-invalid')) setFieldState(id, getFieldError(id));
        });
      }
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();

      let hasErrors = false;
      Object.keys(validators).forEach(id => {
        const error = getFieldError(id);
        setFieldState(id, error);
        if (error) hasErrors = true;
      });

      if (hasErrors) {
        const first = form.querySelector('.is-invalid');
        if (first) first.focus();
        return;
      }

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
          const resp = await fetch(`https://formspree.io/f/${FORM_ID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(data),
          });
          if (!resp.ok) throw new Error('Submission failed');
        } else {
          await new Promise(r => setTimeout(r, 1200));
          localStorage.setItem(`fc_reg_${Date.now()}`, JSON.stringify(data));
          console.info('Registration saved (demo mode):', data);
        }
        showSuccessView(data);
      } catch (err) {
        localStorage.setItem(`fc_reg_fallback_${Date.now()}`, JSON.stringify(data));
        console.warn('Formspree error (saved locally):', err);
        showSuccessView(data);
      } finally {
        if (submitBtn) submitBtn.classList.remove('loading');
      }
    });
  }

  /* ──────────────────────────────────────────────────
     16. CUSTOM CURSOR
  ────────────────────────────────────────────────── */
  function initCursor() {
    if (!window.matchMedia('(hover: hover)').matches || reducedMotion) return;
    const cursor   = qs('#cursor');
    const follower = qs('#cursor-follower');
    if (!cursor || !follower) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let fx = mx, fy = my;

    document.addEventListener('mousemove', e => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    }, { passive: true });

    (function animFollower() {
      fx += (mx - fx) * 0.1;
      fy += (my - fy) * 0.1;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
      requestAnimationFrame(animFollower);
    })();

    qsa('a, button, [tabindex]').forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
        follower.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering');
        follower.classList.remove('hovering');
      });
    });
  }

  /* ──────────────────────────────────────────────────
     17. EMBER PARTICLES
  ────────────────────────────────────────────────── */
  function initEmbers() {
    const canvas = qs('#emberCanvas');
    if (!canvas || reducedMotion) return;

    class Embers {
      constructor(canvas) {
        this.canvas  = canvas;
        this.ctx     = canvas.getContext('2d');
        this.particles = [];
        this.running = true;
        this.resize();
        window.addEventListener('resize', () => this.resize(), { passive: true });
        this.init();
        this.loop();
      }

      resize() {
        this.canvas.width  = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
      }

      count() { return isMobile() ? 25 : 60; }

      init() {
        for (let i = 0; i < this.count(); i++) this.add(true);
      }

      add(anywhere = false) {
        this.particles.push({
          x:    Math.random() * this.canvas.width,
          y:    anywhere ? Math.random() * this.canvas.height : this.canvas.height + 10,
          vx:   (Math.random() - 0.5) * 0.4,
          vy:   -(Math.random() * 0.8 + 0.3),
          r:    Math.random() * 1.8 + 0.4,
          life: Math.random(),
          maxL: Math.random() * 0.5 + 0.5,
        });
      }

      loop() {
        if (!this.running) return;
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles = this.particles.filter(p => p.life > 0);
        while (this.particles.length < this.count()) this.add();

        const t = Date.now() * 0.001;
        this.particles.forEach(p => {
          p.x   += p.vx + Math.sin(t + p.y * 0.01) * 0.15;
          p.y   += p.vy;
          p.life -= 0.003;

          const alpha = (p.life / p.maxL) * 0.55;
          if (alpha <= 0) return;

          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3);
          g.addColorStop(0, `rgba(255,80,30,${alpha})`);
          g.addColorStop(1, 'rgba(180,0,0,0)');

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        });

        requestAnimationFrame(() => this.loop());
      }
    }

    new Embers(canvas);
  }

  /* ──────────────────────────────────────────────────
     18. MAGNETIC BUTTONS
  ────────────────────────────────────────────────── */
  function initMagneticButtons() {
    if (isMobile() || reducedMotion || typeof gsap === 'undefined') return;

    qsa('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width  / 2;
        const y = e.clientY - r.top  - r.height / 2;
        gsap.to(btn, { x: x * 0.35, y: y * 0.35, duration: 0.4, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }

  /* ──────────────────────────────────────────────────
     19. 3D TILT CARDS
  ────────────────────────────────────────────────── */
  function initTiltCards() {
    if (isMobile() || reducedMotion || typeof gsap === 'undefined') return;

    qsa('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r    = card.getBoundingClientRect();
        const xPct = (e.clientX - r.left) / r.width;
        const yPct = (e.clientY - r.top)  / r.height;
        gsap.to(card, {
          rotateY: (xPct - 0.5) * 16,
          rotateX: (0.5 - yPct) * 10,
          transformPerspective: 900,
          duration: 0.4,
          ease: 'power2.out'
        });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
      });
    });
  }

}); // end DOMContentLoaded
