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
   A. EARTH TEXTURE GENERATOR
   ========================================================= */

function makeEarthCanvasTexture() {
  const TW = 2048, TH = 1024;
  const cv = document.createElement('canvas');
  cv.width = TW; cv.height = TH;
  const g = cv.getContext('2d');

  // Equirectangular projection: lat/lon → canvas pixel
  const p = (lat, lon) => [(lon + 180) / 360 * TW, (90 - lat) / 180 * TH];

  function fillPoly(coords, color) {
    g.beginPath();
    coords.forEach(([la, lo], i) => {
      const [x, y] = p(la, lo);
      i === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    });
    g.closePath();
    g.fillStyle = color;
    g.fill();
  }

  // Ocean base gradient
  const ocean = g.createLinearGradient(0, 0, 0, TH);
  ocean.addColorStop(0,    '#091826');
  ocean.addColorStop(0.45, '#0e2244');
  ocean.addColorStop(0.55, '#0e2244');
  ocean.addColorStop(1,    '#091826');
  g.fillStyle = ocean;
  g.fillRect(0, 0, TW, TH);

  // Subtle ocean grid
  g.strokeStyle = 'rgba(15,40,80,0.2)';
  g.lineWidth = 0.5;
  for (let lat = -60; lat <= 60; lat += 30) {
    const [, y] = p(lat, 0);
    g.beginPath(); g.moveTo(0, y); g.lineTo(TW, y); g.stroke();
  }
  for (let lon = -150; lon <= 150; lon += 30) {
    const [x] = p(0, lon);
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, TH); g.stroke();
  }

  const T  = '#2e6b1a'; // tropical
  const TM = '#3d7a22'; // temperate
  const DY = '#8b7355'; // dry/savanna
  const DS = '#c4a265'; // desert
  const BR = '#4a7a35'; // boreal
  const IC = '#dce8e4'; // ice

  // === NORTH AMERICA ===
  fillPoly([
    [72,-157],[70,-142],[67,-141],[60,-136],[57,-133],[53,-130],
    [50,-126],[49,-124],[47,-122],[42,-124],[36,-121],[33,-118],
    [29,-115],[25,-110],[22,-106],[20,-103],[20,-99],[18,-95],
    [16,-92],[15,-91],[15,-88],[16,-88],[18,-90],[20,-88],
    [21,-87],[21,-85],[25,-77],[27,-82],[26,-81],[25,-80],
    [30,-81],[35,-76],[40,-74],[42,-70],[44,-67],[47,-54],
    [49,-63],[49,-95],[50,-97],[49,-122],[54,-131],[58,-136],
    [60,-143],[63,-150],[65,-168],[68,-167],[70,-163],[72,-157]
  ], TM);

  // Mexico interior (drier)
  fillPoly([
    [30,-116],[28,-112],[25,-110],[22,-106],[20,-103],
    [20,-99],[18,-95],[16,-92],[15,-91],[16,-89],
    [18,-90],[21,-90],[24,-100],[26,-106],[28,-109],[30,-116]
  ], DY);

  // Central America (lush tropical)
  fillPoly([
    [22,-90],[21,-87],[21,-85],[18,-90],[16,-92],[16,-89],
    [15,-89],[15,-88],[16,-88],[16,-83],[9,-79],[8,-77],
    [8,-83],[10,-85],[13,-86],[14,-89],[16,-89],[18,-90],
    [19,-91],[21,-90],[22,-90]
  ], T);

  // Belize — bright highlight so it's visible on zoom
  fillPoly([
    [18.5,-87.5],[18.5,-88.4],[17.8,-89.2],[16.8,-89.2],
    [15.9,-89.0],[15.9,-88.3],[16.7,-88.1],[18.5,-87.5]
  ], '#52bb1e');

  // === GREENLAND ===
  fillPoly([
    [83,-60],[82,-35],[80,-18],[76,-18],[72,-24],[68,-24],
    [65,-37],[62,-43],[60,-44],[62,-52],[65,-55],[62,-65],
    [67,-70],[73,-73],[78,-74],[82,-72],[83,-60]
  ], IC);

  // === SOUTH AMERICA ===
  fillPoly([
    [12,-72],[10,-62],[11,-60],[8,-62],[5,-52],[4,-51],
    [2,-50],[0,-50],[-4,-43],[-5,-35],[-8,-35],[-12,-37],
    [-15,-39],[-20,-40],[-22,-43],[-28,-49],[-33,-52],
    [-38,-58],[-42,-64],[-46,-66],[-50,-68],[-53,-70],
    [-55,-66],[-55,-68],[-50,-75],[-45,-74],[-40,-73],
    [-33,-72],[-22,-70],[-18,-70],[-15,-75],[-10,-78],
    [-5,-81],[0,-80],[2,-78],[5,-77],[7,-77],[8,-74],[10,-72],[12,-72]
  ], T);

  // Amazon basin (deeper green)
  fillPoly([
    [5,-74],[5,-52],[0,-50],[-4,-43],[-5,-35],
    [-8,-40],[-10,-55],[-8,-60],[-5,-65],[-5,-74],[0,-78],[5,-74]
  ], '#1e5010');

  // Patagonia/southern cone (drier)
  fillPoly([
    [-40,-73],[-33,-72],[-22,-70],[-38,-58],[-42,-64],[-46,-66],[-50,-68],[-40,-73]
  ], DY);

  // === EUROPE ===
  fillPoly([
    [71,28],[70,26],[68,16],[63,10],[58,5],[56,5],
    [51,2],[51,-4],[48,-5],[44,-9],[37,-9],[36,-6],
    [36,0],[37,13],[38,15],[41,16],[40,19],[41,21],
    [42,22],[41,24],[41,27],[42,28],[45,30],[47,37],
    [46,38],[42,36],[43,29],[46,38],[48,40],[52,40],
    [55,38],[57,38],[60,32],[64,26],[68,20],[71,28]
  ], TM);

  // === AFRICA ===
  fillPoly([
    [37,-5],[37,12],[34,28],[30,33],[22,37],[14,44],
    [12,44],[8,44],[2,42],[-2,41],[-5,40],[-10,40],
    [-15,37],[-20,35],[-25,33],[-34,26],[-35,20],
    [-30,17],[-25,15],[-20,14],[-14,12],[-5,10],
    [-4,9],[-5,2],[-5,-8],[0,-8],[3,-9],[5,-10],
    [5,-16],[8,-15],[14,-17],[20,-17],[26,-15],
    [30,-10],[32,-3],[35,0],[37,-5]
  ], DY);

  // Sahara (desert overlay)
  fillPoly([
    [37,-5],[37,12],[30,33],[22,37],[22,30],[18,20],
    [15,10],[12,2],[12,-17],[20,-17],[26,-15],
    [30,-10],[32,-3],[35,0],[37,-5]
  ], DS);

  // Congo tropical belt
  fillPoly([
    [5,10],[5,28],[-5,28],[-5,10],[5,10]
  ], T);

  // === MIDDLE EAST (desert) ===
  fillPoly([
    [38,26],[38,40],[32,48],[24,57],[18,56],[15,44],
    [12,44],[14,44],[22,37],[30,33],[34,28],[37,37],[38,26]
  ], DS);

  // === CENTRAL ASIA ===
  fillPoly([
    [38,44],[32,48],[26,57],[24,60],[24,68],[28,70],
    [30,74],[34,74],[34,72],[36,70],[38,72],[40,68],
    [42,64],[44,60],[42,50],[38,44]
  ], DY);

  // India / South Asia
  fillPoly([
    [24,68],[28,70],[30,74],[28,76],[22,88],[20,87],
    [16,82],[10,80],[8,78],[8,77],[10,78],[13,80],
    [18,84],[22,88],[28,78],[28,76],[32,76],[34,74],[28,70],[24,68]
  ], DY);

  // === RUSSIA / SIBERIA (two parts) ===
  fillPoly([
    [68,28],[65,28],[60,28],[55,35],[52,40],[55,38],
    [57,40],[60,50],[62,58],[65,68],[68,68],[72,68],
    [74,80],[74,100],[72,100],[68,90],[65,60],[62,48],
    [58,40],[55,38],[52,36],[52,50],[48,56],[48,68],
    [44,60],[42,50],[42,44],[46,38],[48,40],[52,40],
    [55,38],[57,38],[60,32],[64,26],[68,20],[71,28],[68,28]
  ], BR);

  fillPoly([
    [74,100],[74,130],[71,141],[65,141],[62,142],
    [55,135],[52,141],[49,142],[46,136],[44,134],
    [44,130],[46,124],[48,116],[52,100],[55,100],
    [58,110],[62,120],[65,110],[68,100],[74,100]
  ], BR);

  fillPoly([
    [71,141],[74,160],[77,162],[77,140],[71,141]
  ], BR);

  // === CHINA / EAST ASIA ===
  fillPoly([
    [52,100],[52,116],[48,116],[46,124],[44,130],
    [44,134],[40,130],[38,128],[35,128],[30,122],
    [25,122],[22,121],[20,110],[18,110],[14,102],
    [14,106],[12,104],[10,100],[14,100],[18,96],
    [22,94],[24,90],[28,98],[28,88],[32,80],[36,72],
    [40,68],[42,64],[44,60],[48,68],[48,56],[52,60],
    [55,80],[52,80],[52,100]
  ], TM);

  // Japan
  fillPoly([
    [43,145],[42,142],[40,140],[36,137],[34,133],
    [33,130],[34,131],[36,136],[38,141],[40,142],[43,145]
  ], TM);

  // Southeast Asia mainland
  fillPoly([
    [22,100],[22,94],[18,96],[14,100],[10,100],
    [10,104],[3,103],[1,103],[3,100],[7,100],[14,100],[18,100],[22,100]
  ], T);

  // Sumatra / Java
  fillPoly([
    [5,98],[5,100],[3,103],[1,103],[1,104],[-1,105],
    [-6,107],[-7,108],[-7,112],[-6,107],[-2,106],[1,104],[5,98]
  ], T);

  fillPoly([
    [-8,115],[-8,122],[-5,118],[-3,115],[-6,112],[-8,115]
  ], T);

  // === AUSTRALIA ===
  fillPoly([
    [-17,122],[-14,128],[-12,136],[-14,136],[-14,141],
    [-17,141],[-20,148],[-24,151],[-28,153],[-34,151],
    [-38,145],[-38,140],[-36,138],[-34,137],[-32,133],
    [-30,130],[-28,126],[-24,114],[-22,114],[-20,115],[-17,122]
  ], DS);

  // Northern tropical coast
  fillPoly([
    [-14,128],[-12,136],[-14,136],[-14,141],[-17,141],[-17,122],[-14,128]
  ], T);

  // === NEW ZEALAND ===
  fillPoly([
    [-34,172],[-36,174],[-40,176],[-44,170],[-46,168],
    [-44,171],[-40,174],[-36,174],[-34,172]
  ], TM);

  // === ANTARCTICA ===
  g.fillStyle = IC;
  g.fillRect(0, Math.round(TH * 0.795), TW, Math.round(TH * 0.205));
  fillPoly([
    [-65,-180],[-68,-150],[-72,-100],[-75,-50],[-78,0],
    [-78,50],[-75,100],[-70,150],[-65,180],[-62,180],[-62,-180],[-65,-180]
  ], IC);

  // North polar cap
  g.fillStyle = IC;
  g.fillRect(0, 0, TW, Math.round(TH * 0.038));
  const northIce = g.createLinearGradient(0, Math.round(TH * 0.038), 0, Math.round(TH * 0.1));
  northIce.addColorStop(0, 'rgba(220,232,228,0.85)');
  northIce.addColorStop(1, 'rgba(220,232,228,0)');
  g.fillStyle = northIce;
  g.fillRect(0, Math.round(TH * 0.038), TW, Math.round(TH * 0.062));

  return new THREE.CanvasTexture(cv);
}

/* =========================================================
   B. THREE.JS GLOBE INTRO
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

  // Lighting — sun directional + soft ambient
  scene.add(new THREE.AmbientLight(0x223355, 1.2));
  const sunLight = new THREE.DirectionalLight(0xfff8e8, 2.8);
  sunLight.position.set(5, 3, 5);
  scene.add(sunLight);
  const rimLight = new THREE.DirectionalLight(0x2233aa, 0.6);
  rimLight.position.set(-4, -1, -3);
  scene.add(rimLight);

  // Globe sphere with Earth texture
  const globeGeo = new THREE.SphereGeometry(1, 64, 64);
  const globeMat = new THREE.MeshPhongMaterial({
    map:       makeEarthCanvasTexture(),
    specular:  new THREE.Color(0x224466),
    shininess: 12,
  });
  const globe = new THREE.Mesh(globeGeo, globeMat);
  scene.add(globe);

  // Subtle lat/lon grid overlay
  const gridGeo = new THREE.SphereGeometry(1.003, 24, 14);
  const gridMat = new THREE.MeshBasicMaterial({
    color: 0x1a3a6a, wireframe: true, transparent: true, opacity: 0.06
  });
  scene.add(new THREE.Mesh(gridGeo, gridMat));

  // Cloud sphere
  const cloudGeo = new THREE.SphereGeometry(1.015, 48, 48);
  const cloudMat = new THREE.MeshPhongMaterial({
    color: 0xffffff, transparent: true, opacity: 0.22, depthWrite: false,
  });
  const clouds = new THREE.Mesh(cloudGeo, cloudMat);
  scene.add(clouds);

  // Atmosphere shader
  const atmVert = `varying vec3 vNormal; void main(){ vNormal=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }`;
  const atmFrag = `varying vec3 vNormal; void main(){ float i=pow(0.65-dot(vNormal,vec3(0,0,1.0)),2.5); gl_FragColor=vec4(0.05,0.18,0.7,i*0.75); }`;
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
  scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.065, transparent: true, opacity: 0.75
  })));

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
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return new THREE.Line(geom, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
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
  ], 0x2244aa, 0.15);
  globe.add(caLine);

  // Belize dot
  const belizeLocalPos = ll2v(17.25, -88.76, 1.02);
  const belizeDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff2222, transparent: true, opacity: 0 })
  );
  belizeDot.position.copy(belizeLocalPos);
  globe.add(belizeDot);

  // Pulse ring
  const ringMesh = new THREE.Mesh(
    new THREE.RingGeometry(0.025, 0.045, 32),
    new THREE.MeshBasicMaterial({ color: 0xff2222, transparent: true, opacity: 0, side: THREE.DoubleSide })
  );
  ringMesh.position.copy(belizeLocalPos);
  ringMesh.lookAt(new THREE.Vector3(0, 0, 0));
  ringMesh.rotateY(Math.PI);
  globe.add(ringMesh);

  // targetRotY is computed dynamically on first scroll so we always find
  // the nearest rotation that puts Belize (lon≈-88.76 → faces +Z at rotation.y=0)
  // facing the camera, regardless of how long auto-rotation has been running.
  let targetRotY    = null;
  const targetRotX  = -17.25 * (Math.PI / 180);

  // DOM refs
  const globeIntro  = el('globeIntro');
  const siteWrapper = el('siteWrapper');
  const belizeTag   = el('belizeTag');
  const logoReveal  = el('globeLogoReveal');
  const scrollHint  = el('globeScrollHint');

  let autoRotate    = true;
  let introComplete = false;
  let ringOpacity   = 0;

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

  // Safety fallback: ensure site appears even if ScrollTrigger never fires
  setTimeout(() => { if (!introComplete) completeIntro(); }, 8000);

  function updateIntro(p) {
    // Lazily set targetRotY to nearest alignment of Belize with the camera.
    // Belize faces +Z (camera) when globe.rotation.y is any integer multiple of 2π.
    if (targetRotY === null) {
      const turns = Math.round(globe.rotation.y / (2 * Math.PI));
      targetRotY = turns * 2 * Math.PI;
    }

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
    clouds.rotation.y += 0.0007;
    if (ringOpacity > 0) {
      const pulse = (Math.sin(time * 3) * 0.5 + 0.5) * ringOpacity;
      ringMesh.material.opacity = 0.3 * pulse + 0.2 * ringOpacity;
      ringMesh.scale.setScalar(1 + pulse * 0.15);
    }
    renderer.render(scene, camera);
  })();
}

/* =========================================================
   C. ARENA CANVAS BACKGROUND
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
   D. ARENA INIT
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
   E. SITE ANIMATIONS (called after globe completes)
   ========================================================= */

let siteAnimsInitialized = false;

function initSiteAnimations() {
  if (siteAnimsInitialized) return;
  siteAnimsInitialized = true;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    // Ensure ScrollTrigger knows the current scroll position (especially
    // important when called mid-scroll after the globe intro completes).
    setTimeout(() => ScrollTrigger.refresh(), 50);
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

  // Generic inner-page reveals
  revealAll('.reveal-up',    { stagger: 0.1 });
  revealAll('.reveal-stagger .reveal-item', { stagger: 0.15 });

  // After the globe intro the user is already scrolled deep —
  // refresh forces ScrollTrigger to re-evaluate all positions and
  // immediately fire any triggers the user has already scrolled past.
  requestAnimationFrame(() => {
    setTimeout(() => ScrollTrigger.refresh(), 150);
  });

  // Hard fallback: any element still at opacity:0 after 2s becomes visible.
  const REVEAL_SELECTORS = [
    '.stat-item', '.tournament-card', '.or-label', '.or-title', '.or-body',
    '.about-preview-text', '.about-preview-emblem', '.quote-text', '.quote-author',
    '.cta-inner', '.preview-item', '.footer-grid',
  ];
  setTimeout(() => {
    REVEAL_SELECTORS.forEach(sel => {
      qsa(sel).forEach(elem => {
        if (parseFloat(getComputedStyle(elem).opacity) < 0.1) {
          gsap.to(elem, { opacity: 1, y: 0, x: 0, duration: 0.5, ease: 'power2.out' });
        }
      });
    });
  }, 2000);
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
   F. INIT ON DOMCONTENTLOADED
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  const globeIntro = el('globeIntro');

  if (globeIntro) {
    if (RM) {
      globeIntro.style.display = 'none';
      const sw = el('siteWrapper');
      if (sw) sw.classList.add('visible');
      initSiteAnimations();
    } else {
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
