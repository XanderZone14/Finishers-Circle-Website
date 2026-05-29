/* =========================================================
   FINISHERS CIRCLE — Main JavaScript
   Three.js Globe Intro + Arena Canvas + GSAP + ScrollTrigger
   ========================================================= */

'use strict';

/* ── GLOBAL UTILS ── */
const el  = id  => document.getElementById(id);
const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = sel => [...document.querySelectorAll(sel)];
const isMobile = () => window.innerWidth < 768;
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   A. THREE.JS GLOBE INTRO
   ========================================================= */

function completeGlobeIntro() {
  const globeIntro  = el('globeIntro');
  const siteWrapper = el('siteWrapper');
  if (globeIntro) {
    globeIntro.style.opacity = '0';
    globeIntro.style.pointerEvents = 'none';
    setTimeout(() => { globeIntro.style.display = 'none'; }, 800);
  }
  if (siteWrapper) siteWrapper.classList.add('visible');
  initSiteAnimations();
}

function initGlobe() {
  if (typeof THREE === 'undefined') { completeGlobeIntro(); return; }
  const canvas = el('globeCanvas');
  if (!canvas) { completeGlobeIntro(); return; }

  const W = () => window.innerWidth;
  const H = () => window.innerHeight;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W() / H(), 0.1, 100);
  camera.position.set(0, 0, 3.2);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W(), H());
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  window.addEventListener('resize', () => {
    camera.aspect = W() / H();
    camera.updateProjectionMatrix();
    renderer.setSize(W(), H());
  });

  // Lighting
  scene.add(new THREE.AmbientLight(0x111133, 2));
  const keyLight = new THREE.PointLight(0x2244ff, 4, 20);
  keyLight.position.set(5, 3, 5);
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(0xcc0000, 2, 15);
  fillLight.position.set(-4, -2, 3);
  scene.add(fillLight);

  // Globe sphere
  const globeGeo = new THREE.SphereGeometry(1, 64, 64);
  const globeMat = new THREE.MeshPhongMaterial({
    color: 0x020d1f, emissive: 0x000820, specular: 0x223366, shininess: 20
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  scene.add(globe);

  // Lat/lon grid overlay
  const gridGeo = new THREE.SphereGeometry(1.003, 24, 14);
  const gridMat = new THREE.MeshBasicMaterial({ color: 0x1a3a6a, wireframe: true, transparent: true, opacity: 0.13 });
  scene.add(new THREE.Mesh(gridGeo, gridMat));

  // Atmosphere shader
  const atmVert = `varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
  const atmFrag = `varying vec3 vNormal; void main(){ float i=pow(0.65-dot(vNormal,vec3(0,0,1.0)),2.5); gl_FragColor=vec4(0.05,0.15,0.6,i*0.8); }`;
  const atmGeo  = new THREE.SphereGeometry(1.18, 64, 64);
  const atmMat  = new THREE.ShaderMaterial({
    vertexShader: atmVert, fragmentShader: atmFrag,
    side: THREE.FrontSide, blending: THREE.AdditiveBlending, transparent: true
  });
  scene.add(new THREE.Mesh(atmGeo, atmMat));

  // Star field
  const starVerts = [];
  for (let i = 0; i < 2500; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const r  = 15 + Math.random() * 25;
    starVerts.push(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph));
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starVerts, 3));
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.065, transparent: true, opacity: 0.75 })));

  // Helper: lat/lon → Vec3 on globe surface
  function ll2v(lat, lon, r = 1.012) {
    const phi = (90 - lat) * (Math.PI / 180);
    const th  = (lon + 180) * (Math.PI / 180);
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(th),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(th)
    );
  }

  // Line helper
  function makeLine(pts, color = 0xcc0000, opacity = 0.8) {
    const verts = pts.flatMap(([la, lo]) => { const v = ll2v(la, lo, 1.006); return [v.x, v.y, v.z]; });
    const first = ll2v(pts[0][0], pts[0][1], 1.006);
    verts.push(first.x, first.y, first.z);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return new THREE.Line(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
  }

  // Belize outline
  const belizeLine = makeLine([
    [18.49, -87.47], [18.49, -88.37], [17.82, -89.23], [16.83, -89.22],
    [15.90, -88.97], [15.89, -88.27], [16.68, -88.10], [18.49, -87.47]
  ], 0xcc0000, 0);
  globe.add(belizeLine);

  // Central America outline
  const caLine = makeLine([
    [23, -90], [23, -84], [8, -77], [8, -83], [12, -87], [16, -92], [23, -90]
  ], 0x2244aa, 0.2);
  globe.add(caLine);

  // Belize dot
  const belizeLocalPos = ll2v(17.25, -88.76, 1.02);
  const belizeDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xcc0000, transparent: true, opacity: 0 })
  );
  belizeDot.position.copy(belizeLocalPos);
  globe.add(belizeDot);

  // Pulse ring
  const ringMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.025, 0.045, 32),
    new THREE.MeshBasicMaterial({ color: 0xcc0000, transparent: true, opacity: 0, side: THREE.DoubleSide })
  );
  ringMesh.position.copy(belizeLocalPos);
  ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
  ringMesh.rotateY(Math.PI);
  globe.add(ringMesh);

  const targetRotY = (88.76 + 90) * (Math.PI / 180);
  const targetRotX = -17.25 * (Math.PI / 180);

  // DOM refs
  const globeIntro  = el('globeIntro');
  const siteWrapper = el('siteWrapper');
  const belizeTag   = el('belizeTag');
  const logoReveal  = el('globeLogoReveal');
  const scrollHint  = el('globeScrollHint');

  let autoRotate   = true;
  let introComplete = false;
  let ringOpacity  = 0;

  function completeIntro() {
    if (introComplete) return;
    introComplete = true;
    document.body.style.overflow = '';
    if (typeof gsap !== 'undefined') {
      gsap.to(globeIntro, {
        opacity: 0, duration: 0.8, onComplete: () => {
          if (globeIntro) globeIntro.style.display = 'none';
        }
      });
    } else {
      if (globeIntro) { globeIntro.style.opacity = '0'; globeIntro.style.display = 'none'; }
    }
    if (siteWrapper) siteWrapper.classList.add('visible');
    initSiteAnimations();
  }

  // ScrollTrigger pin
  if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
    document.body.style.overflow = 'hidden';
    ScrollTrigger.create({
      trigger: globeIntro,
      start: 'top top',
      end: '+=280%',
      pin: true,
      scrub: 1.2,
      onUpdate(self) { updateIntro(self.progress); },
      onLeave() { completeIntro(); }
    });
    document.body.style.overflow = '';
  } else {
    setTimeout(completeIntro, RM ? 0 : 500);
  }

  function updateIntro(p) {
    if (p < 0.25) {
      autoRotate = p < 0.04;
      const t = p / 0.25;
      globe.rotation.y += (targetRotY - globe.rotation.y) * t * 0.08;
      globe.rotation.x += (targetRotX - globe.rotation.x) * t * 0.08;
      if (scrollHint) scrollHint.style.opacity = String(Math.max(0, 1 - t * 3));
    } else if (p < 0.6) {
      autoRotate = false;
      const t = (p - 0.25) / 0.35;
      camera.position.z = 3.2 - t * 1.5;
      globe.rotation.y += (targetRotY - globe.rotation.y) * 0.12;
      globe.rotation.x += (targetRotX - globe.rotation.x) * 0.12;
      if (t > 0.4) {
        const show = Math.min(1, (t - 0.4) / 0.4);
        belizeDot.material.opacity  = show;
        ringOpacity                  = show;
        belizeLine.material.opacity  = show * 0.85;
        if (belizeTag) belizeTag.style.opacity = String(show);
      }
    } else if (p < 0.85) {
      autoRotate = false;
      const t = (p - 0.6) / 0.25;
      camera.position.z = 1.7 - t * 0.2;
      if (logoReveal) logoReveal.style.opacity = String(Math.min(1, t * 1.8));
    } else {
      const t = (p - 0.85) / 0.15;
      if (globeIntro) globeIntro.style.opacity = String(1 - t);
      if (t > 0.5 && !introComplete) {
        if (siteWrapper) siteWrapper.classList.add('visible');
        initSiteAnimations();
      }
    }
  }

  // Render loop
  let time = 0;
  (function tick() {
    requestAnimationFrame(tick);
    time += 0.005;
    if (autoRotate) globe.rotation.y += 0.0015;
    if (ringOpacity > 0) {
      const pulse = (Math.sin(time * 3) * 0.5 + 0.5) * ringOpacity;
      ringMesh.material.opacity = 0.3 * pulse + 0.2 * ringOpacity;
      ringMesh.scale.setScalar(1 + pulse * 0.15);
    }
    renderer.render(scene, camera);
  })();
}

/* =========================================================
   B. ARENA CANVAS BACKGROUND
   ========================================================= */

class ArenaRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });

    this.cam = { vpx: 0.5, vpy: 0.38, zoom: 1, tilt: 0 };

    this.views = {
      center:   { vpx: 0.50, vpy: 0.37, zoom: 1.00, tilt:  0    },
      sideline: { vpx: 0.14, vpy: 0.42, zoom: 0.82, tilt: -0.06 },
      corner:   { vpx: 0.80, vpy: 0.32, zoom: 0.88, tilt:  0.09 },
      elevated: { vpx: 0.50, vpy: 0.22, zoom: 1.14, tilt:  0    },
      entrance: { vpx: 0.50, vpy: 0.56, zoom: 0.72, tilt:  0.04 },
    };
    this.draw();
  }

  resize() {
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.draw();
  }

  transitionTo(viewName, reducedMotion) {
    const target = this.views[viewName] || this.views.center;
    if (reducedMotion || typeof gsap === 'undefined') {
      Object.assign(this.cam, target);
      this.draw();
      return;
    }
    gsap.to(this.cam, {
      ...target,
      duration: 1.8,
      ease: 'power3.inOut',
      onUpdate: () => this.draw(),
    });
  }

  draw() {
    const { ctx, canvas } = this;
    const W = canvas.width, H = canvas.height;
    const { vpx, vpy, zoom, tilt } = this.cam;
    const vpX = vpx * W, vpY = vpy * H;
    const matCenterY = vpY + (H - vpY) * 0.44;
    const matCenterX = vpX;
    const matRX = W * 0.26 * zoom;
    const matRY = matRX * 0.32;

    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(tilt);
    ctx.translate(-W / 2, -H / 2);

    // BG
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,   '#000005');
    bg.addColorStop(0.4, '#050810');
    bg.addColorStop(1,   '#080408');
    ctx.fillStyle = bg;
    ctx.fillRect(-200, -200, W + 400, H + 400);

    this._drawCrowd(vpX, vpY, W, H);
    this._drawFloor(vpX, vpY, W, H);
    this._drawMat(matCenterX, matCenterY, matRX, matRY);
    this._drawSpotlights(matCenterX, matCenterY, matRX, W, H);
    this._drawCage(matCenterX, matCenterY, matRX * 1.42, matRY * 1.42);

    // Top vignette
    const vig = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    vig.addColorStop(0, 'rgba(0,0,0,0.88)');
    vig.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = vig;
    ctx.fillRect(-200, -200, W + 400, H * 0.45 + 200);

    ctx.restore();
  }

  _drawCrowd(vpX, vpY, W, H) {
    const ctx = this.ctx;
    for (let row = 0; row < 5; row++) {
      const y       = vpY * H * (0.18 + row * 0.14);
      const rowW    = W * (0.28 + row * 0.16);
      const startX  = (W - rowW) / 2;
      const headR   = 3 + row * 1.2;
      const spacing = headR * 2.2;
      const count   = Math.floor(rowW / spacing);
      const alpha   = 0.08 + row * 0.04;
      ctx.fillStyle = `rgba(15,10,20,${alpha})`;
      for (let i = 0; i < count; i++) {
        const hx = startX + i * spacing + headR;
        ctx.beginPath();
        ctx.arc(hx, y, headR, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(hx - headR * 0.65, y + headR, headR * 1.3, headR * 2);
      }
    }
  }

  _drawFloor(vpX, vpY, W, H) {
    const ctx    = this.ctx;
    const floorY = vpY * H;

    const floorGrad = ctx.createLinearGradient(0, floorY, 0, H);
    floorGrad.addColorStop(0,   '#0d0910');
    floorGrad.addColorStop(0.5, '#100d14');
    floorGrad.addColorStop(1,   '#080608');
    ctx.fillStyle = floorGrad;
    ctx.beginPath();
    ctx.moveTo(vpX, floorY);
    ctx.lineTo(-W * 0.6, H * 1.15);
    ctx.lineTo(W * 1.6, H * 1.15);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(40,25,55,0.22)';
    ctx.lineWidth   = 0.8;
    for (let i = 0; i <= 14; i++) {
      const t  = i / 14;
      const bx = -W * 0.6 + t * W * 2.2;
      ctx.beginPath();
      ctx.moveTo(vpX, floorY);
      ctx.lineTo(bx, H * 1.15);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(40,25,55,0.14)';
    for (let i = 1; i <= 7; i++) {
      const t  = i / 7;
      const gy = floorY + (H * 1.15 - floorY) * (t * t);
      const hw = W * 0.55 * t * 1.4;
      ctx.beginPath();
      ctx.moveTo(vpX - hw, gy);
      ctx.lineTo(vpX + hw, gy);
      ctx.stroke();
    }
  }

  _drawMat(cx, cy, rX, rY) {
    const ctx = this.ctx;

    ctx.beginPath();
    ctx.ellipse(cx, cy, rX * 1.18, rY * 1.18, 0, 0, Math.PI * 2);
    ctx.fillStyle   = 'rgba(100,8,8,0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,20,20,0.7)';
    ctx.lineWidth   = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, cy, rX, rY, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(170,18,18,0.75)';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx, cy, rX * 0.73, rY * 0.73, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(225,218,210,0.82)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - rX * 0.73, cy);
    ctx.lineTo(cx + rX * 0.73, cy);
    ctx.strokeStyle = 'rgba(30,55,160,0.55)';
    ctx.lineWidth   = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(cx, cy, rX * 0.1, rY * 0.1, 0, 0, Math.PI * 2);
    ctx.fillStyle   = 'rgba(25,55,170,0.88)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(60,100,220,0.5)';
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(rX / 120, rY / 40);
    ctx.fillStyle    = 'rgba(0,0,0,0.18)';
    ctx.font         = 'bold 22px sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('FC', 0, 0);
    ctx.restore();
  }

  _drawSpotlights(cx, cy, rX, W, H) {
    const ctx     = this.ctx;
    const offsets = [-rX * 0.5, 0, rX * 0.5];
    offsets.forEach(dx => {
      const gx   = cx + dx;
      const grad = ctx.createRadialGradient(gx, cy, 0, gx, cy, rX * 0.9);
      grad.addColorStop(0,   'rgba(255,240,220,0.07)');
      grad.addColorStop(0.5, 'rgba(255,235,210,0.025)');
      grad.addColorStop(1,   'rgba(255,235,210,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
    });
    offsets.forEach(dx => {
      const lx       = cx + dx, ly = cy - rX * 1.1;
      const coneGrad = ctx.createRadialGradient(lx, ly, 0, lx, ly, rX * 0.6);
      coneGrad.addColorStop(0, 'rgba(255,245,230,0.12)');
      coneGrad.addColorStop(1, 'rgba(255,245,230,0)');
      ctx.fillStyle = coneGrad;
      ctx.fillRect(0, 0, W, H);
    });
  }

  _drawCage(cx, cy, rX, rY) {
    const ctx   = this.ctx;
    const sides = 8;
    ctx.beginPath();
    for (let i = 0; i <= sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 8;
      const px    = cx + Math.cos(angle) * rX;
      const py    = cy + Math.sin(angle) * rY;
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.strokeStyle = 'rgba(60,45,70,0.6)';
    ctx.lineWidth   = 3;
    ctx.stroke();

    ctx.strokeStyle = 'rgba(50,38,62,0.3)';
    ctx.lineWidth   = 0.7;
    for (let i = 0; i < sides; i++) {
      const a1 = (i / sides) * Math.PI * 2 - Math.PI / 8;
      const a2 = ((i + 1) / sides) * Math.PI * 2 - Math.PI / 8;
      const mx = cx + Math.cos((a1 + a2) / 2) * rX * 0.92;
      const my = cy + Math.sin((a1 + a2) / 2) * rY * 0.92;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a1) * rX, cy + Math.sin(a1) * rY);
      ctx.lineTo(mx, my - rY * 0.1);
      ctx.stroke();
    }

    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2 - Math.PI / 8;
      const px    = cx + Math.cos(angle) * rX;
      const py    = cy + Math.sin(angle) * rY;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(80,60,90,0.75)';
      ctx.fill();
    }
  }
}

/* =========================================================
   C. ARENA INIT
   ========================================================= */

let arenaInstance = null;

function initArena() {
  const arenaCanvas = el('arenaCanvas');
  if (!arenaCanvas) return;

  arenaInstance = new ArenaRenderer(arenaCanvas);

  const allViews   = ['center', 'sideline', 'corner', 'elevated', 'entrance'];
  const triggers   = qsa('.arena-trigger');

  triggers.forEach(triggerEl => {
    triggerEl.addEventListener('click', () => {
      const view = triggerEl.dataset.view || allViews[Math.floor(Math.random() * allViews.length)];
      arenaInstance.transitionTo(view, RM);
    });
  });
}

/* =========================================================
   D. SITE ANIMATIONS (called after globe completes)
   ========================================================= */

let siteAnimsInitialized = false;

function initSiteAnimations() {
  if (siteAnimsInitialized) return;
  siteAnimsInitialized = true;

  // Register GSAP plugins
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  initArena();
  initNavScroll();
  initMobileMenu();
  initCursor();
  initMagneticButtons();
  initTiltCards();
  initCounters();
  initCountdown();
  initScrollProgress();
  initSectionReveals();
  initSmoothScroll();
  initFormPage();
}

/* ── Nav scroll / sticky ── */
function initNavScroll() {
  const header = el('mainHeader');
  if (!header) return;

  function update() {
    header.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', update, { passive: true });

  // Scroll progress bar
  const bar = el('scrollProgress');
  if (bar) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      if (h > 0) bar.style.width = (window.scrollY / h * 100) + '%';
    }, { passive: true });
  }

  update();
}

/* ── Mobile hamburger ── */
function initMobileMenu() {
  const hamburger      = el('hamburger');
  const mobileMenu     = el('mobileMenu');
  const mobileClose    = el('mobileClose');
  const mobileBackdrop = el('mobileBackdrop');

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
  if (mobileClose)    mobileClose.addEventListener('click', closeMenu);
  if (mobileBackdrop) mobileBackdrop.addEventListener('click', closeMenu);
  qsa('.mobile-nav-link').forEach(l => l.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('open')) closeMenu();
  });

  window._closeMobileMenu = closeMenu;
}

/* ── Custom cursor (RAF loop) ── */
function initCursor() {
  if (!window.matchMedia('(hover: hover)').matches || RM) return;
  const cursor   = el('cursor');
  const follower = el('cursor-follower');
  if (!cursor || !follower) return;

  let mx = window.innerWidth / 2, my = window.innerHeight / 2;
  let fx = mx, fy = my;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
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

  qsa('a, button, [tabindex]').forEach(interactive => {
    interactive.addEventListener('mouseenter', () => {
      cursor.classList.add('hovering');
      follower.classList.add('hovering');
    });
    interactive.addEventListener('mouseleave', () => {
      cursor.classList.remove('hovering');
      follower.classList.remove('hovering');
    });
  });
}

/* ── Magnetic buttons ── */
function initMagneticButtons() {
  if (isMobile() || RM || typeof gsap === 'undefined') return;
  qsa('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width  / 2;
      const y = e.clientY - r.top  - r.height / 2;
      gsap.to(btn, { x: x * 0.35, y: y * 0.35, duration: 0.4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.4)' });
    });
  });
}

/* ── 3D card tilt ── */
function initTiltCards() {
  if (isMobile() || RM || typeof gsap === 'undefined') return;
  qsa('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r    = card.getBoundingClientRect();
      const xPct = (e.clientX - r.left) / r.width;
      const yPct = (e.clientY - r.top)  / r.height;
      gsap.to(card, {
        rotateY: (xPct - 0.5) * 16, rotateX: (0.5 - yPct) * 10,
        transformPerspective: 900, duration: 0.4, ease: 'power2.out'
      });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
    });
  });
}

/* ── Stat counters ── */
function animateCounter(counterEl) {
  const target   = parseInt(counterEl.dataset.target, 10);
  const duration = 1800;
  const start    = performance.now();
  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    counterEl.textContent = Math.round(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else counterEl.textContent = target;
  }
  requestAnimationFrame(step);
}

function initCounters() {
  const statNums = qsa('.stat-number[data-target]');
  if (!statNums.length) return;

  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: '.stats-section',
      start: 'top 75%',
      once: true,
      onEnter: () => statNums.forEach(animateCounter)
    });
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        statNums.forEach(animateCounter);
        io.disconnect();
      }
    }, { threshold: 0.3 });
    const section = qs('.stats-section');
    if (section) io.observe(section);
  }
}

/* ── Countdown timer ── */
function initCountdown() {
  const EVENT_DATE = new Date('2026-06-20T09:00:00-06:00');
  const pad = n => String(n).padStart(2, '0');

  function updateCountdown() {
    const diff = EVENT_DATE - Date.now();
    if (diff <= 0) {
      if (el('cdDays'))  el('cdDays').textContent  = '00';
      if (el('cdHours')) el('cdHours').textContent = '00';
      if (el('cdMins'))  el('cdMins').textContent  = '00';
      if (el('cdSecs'))  el('cdSecs').textContent  = '00';
      const label = qs('.countdown-label');
      if (label) label.textContent = 'Event Live Now!';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    if (el('cdDays'))  el('cdDays').textContent  = pad(d);
    if (el('cdHours')) el('cdHours').textContent = pad(h);
    if (el('cdMins'))  el('cdMins').textContent  = pad(m);
    if (el('cdSecs'))  el('cdSecs').textContent  = pad(s);
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();
}

/* ── Scroll progress bar ── */
function initScrollProgress() {
  const bar = el('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0) bar.style.width = (window.scrollY / h * 100) + '%';
  }, { passive: true });
}

/* ── GSAP scroll reveals ── */
function initSectionReveals() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || RM) {
    // If reduced motion, just make everything visible
    qsa('[data-reveal]').forEach(revealEl => {
      revealEl.style.opacity = '1';
      revealEl.style.transform = 'none';
    });
    return;
  }

  const revealAll = (selector, options = {}) => {
    const els = qsa(selector);
    if (!els.length) return;
    gsap.fromTo(els,
      { opacity: 0, y: options.y ?? 40, x: options.x ?? 0, scale: options.scale ?? 1 },
      {
        opacity: 1, y: 0, x: 0, scale: 1,
        duration: options.duration ?? 0.75,
        stagger:  options.stagger  ?? 0,
        ease: options.ease ?? 'power3.out',
        scrollTrigger: {
          trigger: options.trigger ?? els[0],
          start: options.start ?? 'top 80%',
          once: true,
        }
      }
    );
  };

  // Hero parallax
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

  // Stats
  revealAll('.stat-item', { stagger: 0.12, trigger: '.stats-section' });

  // One Rule
  revealAll('.or-label',  { trigger: '.one-rule-section', start: 'top 70%' });
  revealAll('.or-title',  { trigger: '.one-rule-section', start: 'top 70%', y: 30 });
  revealAll('.or-body',   { trigger: '.one-rule-section', start: 'top 70%', y: 20 });

  // About preview
  revealAll('.about-preview-text',   { x: -50, y: 0, trigger: '.about-preview-section' });
  revealAll('.about-preview-emblem', { x:  50, y: 0, trigger: '.about-preview-section' });

  // Tournament cards
  revealAll('.tournament-card', { stagger: 0.14, trigger: '.tournaments-grid' });

  // Fighter quote
  revealAll('.quote-text',   { scale: 0.95, y: 0, trigger: '.fighter-quote-section', start: 'top 65%' });
  revealAll('.quote-author', { trigger: '.fighter-quote-section', start: 'top 65%' });

  // CTA section
  revealAll('.cta-inner', { trigger: '.cta-section', start: 'top 70%' });

  // Gallery preview
  revealAll('.preview-item',    { stagger: 0.12, trigger: '.preview-grid' });
  revealAll('.gallery-cta-wrap', { trigger: '.gallery-cta-wrap', start: 'top 90%' });

  // Footer
  revealAll('.footer-grid', { trigger: '.footer-grid', start: 'top 85%' });

  // Generic reveal for inner page sections
  revealAll('.reveal-up',    { stagger: 0.1 });
  revealAll('.reveal-stagger .reveal-item', { stagger: 0.15 });
}

/* ── Smooth scroll for anchor links ── */
function initSmoothScroll() {
  const header = el('mainHeader');
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

/* ── Registration page form handling ── */
function initFormPage() {
  const form = el('registerForm');
  if (!form) return;

  const FORM_ID = 'YOUR_FORM_ID';

  const validators = {
    'r-firstName':  val => val.trim().length >= 2 ? '' : 'Please enter your first name (at least 2 characters).',
    'r-lastName':   val => val.trim().length >= 2 ? '' : 'Please enter your last name.',
    'r-email':      val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) ? '' : 'Please enter a valid email address.',
    'r-phone':      val => val.trim().length >= 7 ? '' : 'Please enter a valid phone number.',
    'r-tournament': val => val ? '' : 'Please select a tournament.',
    'r-belt':       val => val ? '' : 'Please select your belt rank.',
    'r-weight':     val => val ? '' : 'Please select your weight division.',
    'r-waiver':     (_, fieldEl) => fieldEl.checked ? '' : 'You must agree to the waiver to continue.',
  };

  function getErr(id) {
    const fieldEl = el(id);
    if (!fieldEl) return '';
    return validators[id] ? validators[id](fieldEl.value, fieldEl) : '';
  }

  function setFieldState(id, error) {
    const fieldEl = el(id);
    const errEl   = el(`err-${id}`);
    if (!fieldEl) return;
    if (error) {
      fieldEl.classList.add('is-invalid');
      fieldEl.classList.remove('is-valid');
      if (errEl) errEl.textContent = error;
    } else {
      fieldEl.classList.remove('is-invalid');
      if (fieldEl.value) fieldEl.classList.add('is-valid');
      if (errEl) errEl.textContent = '';
    }
  }

  Object.keys(validators).forEach(id => {
    const fieldEl = el(id);
    if (!fieldEl) return;
    const event = id === 'r-waiver' ? 'change' : 'blur';
    fieldEl.addEventListener(event, () => setFieldState(id, getErr(id)));
    if (id !== 'r-waiver') {
      fieldEl.addEventListener('input', () => {
        if (fieldEl.classList.contains('is-invalid')) setFieldState(id, getErr(id));
      });
    }
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    let hasErrors = false;
    Object.keys(validators).forEach(id => {
      const error = getErr(id);
      setFieldState(id, error);
      if (error) hasErrors = true;
    });

    if (hasErrors) {
      const first = form.querySelector('.is-invalid');
      if (first) first.focus();
      return;
    }

    const data = {
      firstName:      el('r-firstName') ? el('r-firstName').value.trim() : '',
      lastName:       el('r-lastName')  ? el('r-lastName').value.trim()  : '',
      email:          el('r-email')     ? el('r-email').value.trim()      : '',
      phone:          el('r-phone')     ? el('r-phone').value.trim()      : '',
      tournament:     el('r-tournament') ? el('r-tournament').value       : '',
      beltRank:       el('r-belt')      ? el('r-belt').value              : '',
      weightDivision: el('r-weight')    ? el('r-weight').value            : '',
      team:           el('r-team')      ? el('r-team').value.trim()       : '',
      _subject:       'New Registration — Finishers Circle',
    };

    const submitBtn = el('submitBtn');
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
      showSuccessState(data);
    } catch (err) {
      localStorage.setItem(`fc_reg_fallback_${Date.now()}`, JSON.stringify(data));
      console.warn('Submission error (saved locally):', err);
      showSuccessState(data);
    } finally {
      if (submitBtn) submitBtn.classList.remove('loading');
    }
  });

  function showSuccessState(data) {
    const formSection    = el('formSection');
    const successSection = el('modalSuccessView');
    if (formSection)    formSection.style.display    = 'none';
    if (successSection) {
      successSection.removeAttribute('hidden');
      successSection.style.display = 'block';
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
}

/* =========================================================
   E. INIT ON DOMCONTENTLOADED
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const globeIntro = el('globeIntro');

  if (globeIntro) {
    // Index page: run globe intro
    if (RM) {
      // Skip globe entirely for reduced motion users
      globeIntro.style.display = 'none';
      const sw = el('siteWrapper');
      if (sw) sw.classList.add('visible');
      initSiteAnimations();
    } else {
      // Wait for Three.js and GSAP to be available (they're deferred)
      function tryInitGlobe() {
        if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined') {
          initGlobe();
        } else {
          setTimeout(tryInitGlobe, 50);
        }
      }
      tryInitGlobe();
    }
  } else {
    // Other pages: skip globe, go straight to site animations
    const sw = el('siteWrapper');
    if (sw) sw.classList.add('visible');

    function tryInitSite() {
      if (typeof gsap !== 'undefined') {
        initSiteAnimations();
      } else {
        setTimeout(tryInitSite, 50);
      }
    }
    tryInitSite();
  }
});
