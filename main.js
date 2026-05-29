/* =========================================================
   FINISHERS CIRCLE — Main JavaScript
   Three.js Globe · ArenaRenderer · GSAP · Countdown
   ========================================================= */

'use strict';

/* ── UTILS ── */
const el  = id  => document.getElementById(id);
const qs  = (s, ctx = document) => ctx.querySelector(s);
const qsa = sel => [...document.querySelectorAll(sel)];
const isMobile = () => window.innerWidth < 768;
const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   A. EARTH TEXTURE GENERATOR
   ========================================================= */

function makeEarthTexture() {
  const TW = 2048, TH = 1024;
  const cv = document.createElement('canvas');
  cv.width = TW; cv.height = TH;
  const g = cv.getContext('2d');

  // lat/lon → canvas pixel (equirectangular)
  const px = (lat, lon) => [(lon + 180) / 360 * TW, (90 - lat) / 180 * TH];

  function poly(coords, color) {
    g.beginPath();
    coords.forEach(([la, lo], i) => {
      const [x, y] = px(la, lo);
      i === 0 ? g.moveTo(x, y) : g.lineTo(x, y);
    });
    g.closePath();
    g.fillStyle = color;
    g.fill();
  }

  // Ocean
  const ocean = g.createLinearGradient(0, 0, 0, TH);
  ocean.addColorStop(0,    '#091826');
  ocean.addColorStop(0.45, '#0e2244');
  ocean.addColorStop(0.55, '#0e2244');
  ocean.addColorStop(1,    '#091826');
  g.fillStyle = ocean;
  g.fillRect(0, 0, TW, TH);

  // Ocean grid
  g.strokeStyle = 'rgba(15,40,80,0.18)';
  g.lineWidth = 0.5;
  for (let lat = -60; lat <= 60; lat += 30) {
    const [, y] = px(lat, 0);
    g.beginPath(); g.moveTo(0, y); g.lineTo(TW, y); g.stroke();
  }
  for (let lon = -150; lon <= 150; lon += 30) {
    const [x] = px(0, lon);
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, TH); g.stroke();
  }

  const T  = '#2e6b1a', TM = '#3d7a22', DY = '#8b7355';
  const DS = '#c4a265', BR = '#4a7a35', IC = '#dce8e4';

  // North America
  poly([[72,-157],[70,-142],[67,-141],[60,-136],[57,-133],[53,-130],
    [50,-126],[49,-124],[47,-122],[42,-124],[36,-121],[33,-118],
    [29,-115],[25,-110],[22,-106],[20,-103],[20,-99],[18,-95],
    [16,-92],[15,-91],[15,-88],[16,-88],[18,-90],[20,-88],
    [21,-87],[21,-85],[25,-77],[27,-82],[26,-81],[25,-80],
    [30,-81],[35,-76],[40,-74],[42,-70],[44,-67],[47,-54],
    [49,-63],[49,-95],[50,-97],[49,-122],[54,-131],[58,-136],
    [60,-143],[63,-150],[65,-168],[68,-167],[70,-163],[72,-157]], TM);

  // Mexico
  poly([[30,-116],[28,-112],[25,-110],[22,-106],[20,-103],
    [20,-99],[18,-95],[16,-92],[15,-91],[16,-89],[18,-90],
    [21,-90],[24,-100],[26,-106],[28,-109],[30,-116]], DY);

  // Central America
  poly([[22,-90],[21,-87],[21,-85],[18,-90],[16,-92],[16,-89],
    [15,-89],[15,-88],[16,-88],[16,-83],[9,-79],[8,-77],
    [8,-83],[10,-85],[13,-86],[14,-89],[16,-89],[18,-90],
    [19,-91],[21,-90],[22,-90]], T);

  // Belize — vivid highlight
  poly([[18.5,-87.5],[18.5,-88.4],[17.8,-89.2],[16.8,-89.2],
    [15.9,-89.0],[15.9,-88.3],[16.7,-88.1],[18.5,-87.5]], '#52bb1e');

  // Greenland
  poly([[83,-60],[82,-35],[80,-18],[76,-18],[72,-24],[68,-24],
    [65,-37],[62,-43],[60,-44],[62,-52],[65,-55],[62,-65],
    [67,-70],[73,-73],[78,-74],[82,-72],[83,-60]], IC);

  // South America
  poly([[12,-72],[10,-62],[11,-60],[8,-62],[5,-52],[4,-51],
    [2,-50],[0,-50],[-4,-43],[-5,-35],[-8,-35],[-12,-37],
    [-15,-39],[-20,-40],[-22,-43],[-28,-49],[-33,-52],
    [-38,-58],[-42,-64],[-46,-66],[-50,-68],[-53,-70],
    [-55,-66],[-55,-68],[-50,-75],[-45,-74],[-40,-73],
    [-33,-72],[-22,-70],[-18,-70],[-15,-75],[-10,-78],
    [-5,-81],[0,-80],[2,-78],[5,-77],[7,-77],[8,-74],[10,-72],[12,-72]], T);

  // Amazon
  poly([[5,-74],[5,-52],[0,-50],[-4,-43],[-5,-35],
    [-8,-40],[-10,-55],[-8,-60],[-5,-65],[-5,-74],[0,-78],[5,-74]], '#1e5010');

  // Europe
  poly([[71,28],[70,26],[68,16],[63,10],[58,5],[56,5],
    [51,2],[51,-4],[48,-5],[44,-9],[37,-9],[36,-6],[36,0],
    [37,13],[38,15],[41,16],[40,19],[41,21],[42,22],[41,24],
    [41,27],[42,28],[45,30],[47,37],[46,38],[42,36],[43,29],
    [46,38],[48,40],[52,40],[55,38],[57,38],[60,32],[64,26],
    [68,20],[71,28]], TM);

  // Africa
  poly([[37,-5],[37,12],[34,28],[30,33],[22,37],[14,44],
    [12,44],[8,44],[2,42],[-2,41],[-5,40],[-10,40],[-15,37],
    [-20,35],[-25,33],[-34,26],[-35,20],[-30,17],[-25,15],
    [-20,14],[-14,12],[-5,10],[-4,9],[-5,2],[-5,-8],[0,-8],
    [3,-9],[5,-10],[5,-16],[8,-15],[14,-17],[20,-17],[26,-15],
    [30,-10],[32,-3],[35,0],[37,-5]], DY);

  // Sahara
  poly([[37,-5],[37,12],[30,33],[22,37],[22,30],[18,20],
    [15,10],[12,2],[12,-17],[20,-17],[26,-15],
    [30,-10],[32,-3],[35,0],[37,-5]], DS);

  // Congo
  poly([[5,10],[5,28],[-5,28],[-5,10],[5,10]], T);

  // Middle East
  poly([[38,26],[38,40],[32,48],[24,57],[18,56],[15,44],
    [12,44],[14,44],[22,37],[30,33],[34,28],[37,37],[38,26]], DS);

  // Central Asia
  poly([[38,44],[32,48],[26,57],[24,60],[24,68],[28,70],
    [30,74],[34,74],[34,72],[36,70],[38,72],[40,68],
    [42,64],[44,60],[42,50],[38,44]], DY);

  // India
  poly([[24,68],[28,70],[30,74],[28,76],[22,88],[20,87],
    [16,82],[10,80],[8,78],[8,77],[10,78],[13,80],[18,84],
    [22,88],[28,78],[28,76],[32,76],[34,74],[28,70],[24,68]], DY);

  // Russia West
  poly([[68,28],[65,28],[60,28],[55,35],[52,40],[55,38],
    [57,40],[60,50],[62,58],[65,68],[68,68],[72,68],
    [74,80],[74,100],[72,100],[68,90],[65,60],[62,48],
    [58,40],[55,38],[52,36],[52,50],[48,56],[48,68],
    [44,60],[42,50],[42,44],[46,38],[48,40],[52,40],
    [55,38],[57,38],[60,32],[64,26],[68,20],[71,28],[68,28]], BR);

  // Russia East
  poly([[74,100],[74,130],[71,141],[65,141],[62,142],
    [55,135],[52,141],[49,142],[46,136],[44,134],[44,130],
    [46,124],[48,116],[52,100],[55,100],[58,110],[62,120],
    [65,110],[68,100],[74,100]], BR);

  // Russia Far East
  poly([[71,141],[74,160],[77,162],[77,140],[71,141]], BR);

  // China / East Asia
  poly([[52,100],[52,116],[48,116],[46,124],[44,130],[44,134],
    [40,130],[38,128],[35,128],[30,122],[25,122],[22,121],
    [20,110],[18,110],[14,102],[14,106],[12,104],[10,100],
    [14,100],[18,96],[22,94],[24,90],[28,98],[28,88],[32,80],
    [36,72],[40,68],[42,64],[44,60],[48,68],[48,56],[52,60],
    [55,80],[52,80],[52,100]], TM);

  // Japan
  poly([[43,145],[42,142],[40,140],[36,137],[34,133],[33,130],
    [34,131],[36,136],[38,141],[40,142],[43,145]], TM);

  // SE Asia mainland
  poly([[22,100],[22,94],[18,96],[14,100],[10,100],[10,104],
    [3,103],[1,103],[3,100],[7,100],[14,100],[18,100],[22,100]], T);

  // Sumatra/Java
  poly([[5,98],[5,100],[3,103],[1,103],[1,104],[-1,105],
    [-6,107],[-7,108],[-7,112],[-6,107],[-2,106],[1,104],[5,98]], T);
  poly([[-8,115],[-8,122],[-5,118],[-3,115],[-6,112],[-8,115]], T);

  // Australia
  poly([[-17,122],[-14,128],[-12,136],[-14,136],[-14,141],
    [-17,141],[-20,148],[-24,151],[-28,153],[-34,151],
    [-38,145],[-38,140],[-36,138],[-34,137],[-32,133],
    [-30,130],[-28,126],[-24,114],[-22,114],[-20,115],[-17,122]], DS);

  poly([[-14,128],[-12,136],[-14,136],[-14,141],[-17,141],[-17,122],[-14,128]], T);

  // New Zealand
  poly([[-34,172],[-36,174],[-40,176],[-44,170],[-46,168],
    [-44,171],[-40,174],[-36,174],[-34,172]], TM);

  // Antarctica
  g.fillStyle = IC;
  g.fillRect(0, Math.round(TH * 0.795), TW, Math.round(TH * 0.205));
  poly([[-65,-180],[-68,-150],[-72,-100],[-75,-50],[-78,0],
    [-78,50],[-75,100],[-70,150],[-65,180],[-62,180],[-62,-180],[-65,-180]], IC);

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
   B. GLOBE INTRO
   ========================================================= */

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

  // Lighting — sun + deep-space ambient + blue-rim for dark side
  scene.add(new THREE.AmbientLight(0x0a1428, 2.5));
  const sun = new THREE.DirectionalLight(0xfff4d6, 3.8);
  sun.position.set(5, 3, 5);
  scene.add(sun);
  const rim = new THREE.DirectionalLight(0x1a3a8a, 1.0);
  rim.position.set(-6, -2, -4);
  scene.add(rim);

  // Globe — start with canvas texture, upgrade to real NASA texture async
  const globeMat = new THREE.MeshPhongMaterial({
    map:       makeEarthTexture(),
    specular:  new THREE.Color(0x336699),
    shininess: 18,
  });
  const globe = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), globeMat);
  scene.add(globe);

  // Async-load real textures from CDN (three-globe package on jsDelivr)
  const loader = new THREE.TextureLoader();
  const CDN = 'https://cdn.jsdelivr.net/npm/three-globe/example/img/';
  loader.crossOrigin = 'anonymous';

  loader.load(CDN + 'earth-blue-marble.jpg',
    tex => { globeMat.map = tex; globeMat.needsUpdate = true; });

  loader.load(CDN + 'earth-water.png',
    tex => { globeMat.specularMap = tex; globeMat.specular = new THREE.Color(0x4488bb); globeMat.shininess = 28; globeMat.needsUpdate = true; });

  // Cloud layer — real texture when loaded, white mesh in the meantime
  const cloudMat = new THREE.MeshPhongMaterial({
    transparent: true, opacity: 0.28, depthWrite: false,
    color: 0xffffff,
  });
  const clouds = new THREE.Mesh(new THREE.SphereGeometry(1.016, 48, 48), cloudMat);
  scene.add(clouds);

  loader.load(CDN + 'earth-clouds.png',
    tex => { cloudMat.map = tex; cloudMat.alphaMap = tex; cloudMat.color.set(0xffffff); cloudMat.opacity = 0.55; cloudMat.needsUpdate = true; });

  // Dual-layer atmosphere — inner haze + outer scatter glow
  const vN = `varying vec3 vN; void main(){ vN=normalize(normalMatrix*normal); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;

  // Inner: blue limb haze
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.04, 64, 64),
    new THREE.ShaderMaterial({
      vertexShader: vN,
      fragmentShader: `varying vec3 vN; void main(){ float f=pow(0.7-dot(vN,vec3(0,0,1.)),3.5); gl_FragColor=vec4(0.15,0.45,1.0,f*0.6); }`,
      side: THREE.FrontSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    })
  ));

  // Outer: deep blue-violet scatter
  scene.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.22, 64, 64),
    new THREE.ShaderMaterial({
      vertexShader: vN,
      fragmentShader: `varying vec3 vN; void main(){ float f=pow(0.55-dot(vN,vec3(0,0,1.)),4.2); gl_FragColor=vec4(0.05,0.15,0.75,f*0.45); }`,
      side: THREE.FrontSide, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false,
    })
  ));

  // Rich star field — 3 size tiers, slight colour variation
  const sPos = [], sCol = [];
  for (let i = 0; i < 4000; i++) {
    const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
    const r = 18 + Math.random() * 22;
    sPos.push(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph));
    // Warm/cool star tints
    const t = Math.random();
    sCol.push(t > 0.85 ? 1.0 : 0.92, t > 0.85 ? 0.85 : 0.94, t < 0.15 ? 1.0 : 0.96);
  }
  const sg = new THREE.BufferGeometry();
  sg.setAttribute('position', new THREE.Float32BufferAttribute(sPos, 3));
  sg.setAttribute('color',    new THREE.Float32BufferAttribute(sCol, 3));

  // Large bright stars
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.9 })));
  // Small dim stars (same geometry, half opacity)
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ size: 0.04, vertexColors: true, transparent: true, opacity: 0.45 })));

  // lat/lon → globe local position
  function ll2v(lat, lon, r = 1.012) {
    const phi = (90 - lat) * Math.PI / 180;
    const th  = (lon + 180) * Math.PI / 180;
    return new THREE.Vector3(
      -r * Math.sin(phi) * Math.cos(th),
       r * Math.cos(phi),
       r * Math.sin(phi) * Math.sin(th)
    );
  }

  function makeLine(pts, color, opacity) {
    const verts = pts.flatMap(([la, lo]) => { const v = ll2v(la, lo, 1.006); return [v.x, v.y, v.z]; });
    const f = ll2v(pts[0][0], pts[0][1], 1.006);
    verts.push(f.x, f.y, f.z);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    return new THREE.Line(geom, new THREE.LineBasicMaterial({ color, transparent: true, opacity }));
  }

  // Belize border line (starts invisible, fades in on zoom)
  const belizeLine = makeLine([
    [18.49,-87.47],[18.49,-88.37],[17.82,-89.23],[16.83,-89.22],
    [15.90,-88.97],[15.89,-88.27],[16.68,-88.10],[18.49,-87.47]
  ], 0xff2222, 0);
  globe.add(belizeLine);

  // Central America outline
  globe.add(makeLine([
    [23,-90],[23,-84],[8,-77],[8,-83],[12,-87],[16,-92],[23,-90]
  ], 0x2244aa, 0.12));

  // Belize location dot + pulse ring
  const bzPos = ll2v(17.25, -88.76, 1.02);

  const belizeDot = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xff2222, transparent: true, opacity: 0 })
  );
  belizeDot.position.copy(bzPos);
  globe.add(belizeDot);

  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.025, 0.045, 32),
    new THREE.MeshBasicMaterial({ color: 0xff2222, transparent: true, opacity: 0, side: THREE.DoubleSide })
  );
  ring.position.copy(bzPos);
  ring.lookAt(new THREE.Vector3(0, 0, 0));
  ring.rotateY(Math.PI);
  globe.add(ring);

  // Belize at lon≈-88.76 faces +Z (camera) at rotation.y ≈ 0.
  // Computed dynamically so we always take the shortest path from
  // wherever auto-rotation left the globe.
  let targetRotY   = null;
  const targetRotX = -17.25 * Math.PI / 180;

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
      gsap.to(globeIntro, { opacity: 0, duration: 0.8, onComplete: () => { if (globeIntro) globeIntro.style.display = 'none'; } });
    } else {
      if (globeIntro) { globeIntro.style.opacity = '0'; globeIntro.style.display = 'none'; }
    }
    if (siteWrapper) siteWrapper.classList.add('visible');
    initSiteAnimations();
  }

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
    setTimeout(completeIntro, RM ? 0 : 600);
  }

  // Safety net — site always appears within 8s even if ScrollTrigger stalls
  setTimeout(() => { if (!introComplete) completeIntro(); }, 8000);

  function updateIntro(p) {
    // Lock in target the moment scrolling starts
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
        belizeDot.material.opacity = show;
        ringOpacity                = show;
        belizeLine.material.opacity = show * 0.85;
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

  let time = 0;
  (function tick() {
    requestAnimationFrame(tick);
    time += 0.005;
    if (autoRotate) globe.rotation.y += 0.0015;
    clouds.rotation.y += 0.0007;
    if (ringOpacity > 0) {
      const pulse = (Math.sin(time * 3) * 0.5 + 0.5) * ringOpacity;
      ring.material.opacity = 0.3 * pulse + 0.2 * ringOpacity;
      ring.scale.setScalar(1 + pulse * 0.15);
    }
    renderer.render(scene, camera);
  })();
}

function completeGlobeIntro() {
  const globeIntro  = el('globeIntro');
  const siteWrapper = el('siteWrapper');
  if (globeIntro) { globeIntro.style.opacity = '0'; globeIntro.style.pointerEvents = 'none'; setTimeout(() => { globeIntro.style.display = 'none'; }, 600); }
  if (siteWrapper) siteWrapper.classList.add('visible');
  initSiteAnimations();
}

/* =========================================================
   C. ARENA CANVAS BACKGROUND
   ========================================================= */

class ArenaRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.cam    = { vpx: 0.5, vpy: 0.38, zoom: 1, tilt: 0 };
    this.views  = {
      center:   { vpx: 0.50, vpy: 0.37, zoom: 1.00, tilt:  0    },
      sideline: { vpx: 0.14, vpy: 0.42, zoom: 0.82, tilt: -0.06 },
      corner:   { vpx: 0.80, vpy: 0.32, zoom: 0.88, tilt:  0.09 },
      elevated: { vpx: 0.50, vpy: 0.22, zoom: 1.14, tilt:  0    },
      entrance: { vpx: 0.50, vpy: 0.56, zoom: 0.72, tilt:  0.04 },
    };
    this.resize();
    window.addEventListener('resize', () => this.resize(), { passive: true });
  }

  resize() { this.canvas.width = window.innerWidth; this.canvas.height = window.innerHeight; this.draw(); }

  transitionTo(viewName) {
    const target = this.views[viewName] || this.views.center;
    if (RM || typeof gsap === 'undefined') { Object.assign(this.cam, target); this.draw(); return; }
    gsap.to(this.cam, { ...target, duration: 1.8, ease: 'power3.inOut', onUpdate: () => this.draw() });
  }

  draw() {
    const { ctx, canvas } = this;
    const W = canvas.width, H = canvas.height;
    const { vpx, vpy, zoom, tilt } = this.cam;
    const vpX = vpx * W, vpY = vpy * H;
    const cY = vpY + (H - vpY) * 0.44;
    const rX = W * 0.26 * zoom, rY = rX * 0.32;

    ctx.save();
    ctx.translate(W / 2, H / 2); ctx.rotate(tilt); ctx.translate(-W / 2, -H / 2);

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#000005'); bg.addColorStop(0.4, '#050810'); bg.addColorStop(1, '#080408');
    ctx.fillStyle = bg; ctx.fillRect(-200, -200, W + 400, H + 400);

    this._crowd(vpX, vpY, W, H);
    this._floor(vpX, vpY, W, H);
    this._mat(vpX, cY, rX, rY);
    this._spots(vpX, cY, rX, W, H);
    this._cage(vpX, cY, rX * 1.42, rY * 1.42);

    const vig = ctx.createLinearGradient(0, 0, 0, H * 0.45);
    vig.addColorStop(0, 'rgba(0,0,0,0.88)'); vig.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = vig; ctx.fillRect(-200, -200, W + 400, H * 0.45 + 200);
    ctx.restore();
  }

  _crowd(vpX, vpY, W, H) {
    const ctx = this.ctx;
    for (let row = 0; row < 5; row++) {
      const y = vpY * H * (0.18 + row * 0.14), rowW = W * (0.28 + row * 0.16);
      const sX = (W - rowW) / 2, hr = 3 + row * 1.2, sp = hr * 2.2;
      const n = Math.floor(rowW / sp), alpha = 0.08 + row * 0.04;
      ctx.fillStyle = `rgba(15,10,20,${alpha})`;
      for (let i = 0; i < n; i++) {
        const hx = sX + i * sp + hr;
        ctx.beginPath(); ctx.arc(hx, y, hr, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(hx - hr * 0.65, y + hr, hr * 1.3, hr * 2);
      }
    }
  }

  _floor(vpX, vpY, W, H) {
    const ctx = this.ctx, fY = vpY * H;
    const fg = ctx.createLinearGradient(0, fY, 0, H);
    fg.addColorStop(0, '#0d0910'); fg.addColorStop(0.5, '#100d14'); fg.addColorStop(1, '#080608');
    ctx.fillStyle = fg;
    ctx.beginPath(); ctx.moveTo(vpX, fY); ctx.lineTo(-W * 0.6, H * 1.15); ctx.lineTo(W * 1.6, H * 1.15); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(40,25,55,0.22)'; ctx.lineWidth = 0.8;
    for (let i = 0; i <= 14; i++) { const bx = -W * 0.6 + (i / 14) * W * 2.2; ctx.beginPath(); ctx.moveTo(vpX, fY); ctx.lineTo(bx, H * 1.15); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(40,25,55,0.14)';
    for (let i = 1; i <= 7; i++) { const t = i / 7, gy = fY + (H * 1.15 - fY) * (t * t), hw = W * 0.55 * t * 1.4; ctx.beginPath(); ctx.moveTo(vpX - hw, gy); ctx.lineTo(vpX + hw, gy); ctx.stroke(); }
  }

  _mat(cx, cy, rX, rY) {
    const ctx = this.ctx;
    const E = (rx, ry, fill, stroke, lw) => { ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = lw || 1; ctx.stroke(); } };
    E(rX * 1.18, rY * 1.18, 'rgba(100,8,8,0.85)', 'rgba(180,20,20,0.7)', 2.5);
    E(rX, rY, 'rgba(170,18,18,0.75)');
    E(rX * 0.73, rY * 0.73, 'rgba(225,218,210,0.82)');
    ctx.beginPath(); ctx.moveTo(cx - rX * 0.73, cy); ctx.lineTo(cx + rX * 0.73, cy);
    ctx.strokeStyle = 'rgba(30,55,160,0.55)'; ctx.lineWidth = 2; ctx.stroke();
    E(rX * 0.1, rY * 0.1, 'rgba(25,55,170,0.88)', 'rgba(60,100,220,0.5)', 1.5);
    ctx.save(); ctx.translate(cx, cy); ctx.scale(rX / 120, rY / 40);
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('FC', 0, 0); ctx.restore();
  }

  _spots(cx, cy, rX, W, H) {
    const ctx = this.ctx;
    [-rX * 0.5, 0, rX * 0.5].forEach(dx => {
      const gx = cx + dx, g1 = ctx.createRadialGradient(gx, cy, 0, gx, cy, rX * 0.9);
      g1.addColorStop(0, 'rgba(255,240,220,0.07)'); g1.addColorStop(1, 'rgba(255,235,210,0)');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, W, H);
    });
    [-rX * 0.5, 0, rX * 0.5].forEach(dx => {
      const lx = cx + dx, ly = cy - rX * 1.1, g2 = ctx.createRadialGradient(lx, ly, 0, lx, ly, rX * 0.6);
      g2.addColorStop(0, 'rgba(255,245,230,0.12)'); g2.addColorStop(1, 'rgba(255,245,230,0)');
      ctx.fillStyle = g2; ctx.fillRect(0, 0, W, H);
    });
  }

  _cage(cx, cy, rX, rY) {
    const ctx = this.ctx, n = 8;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2 - Math.PI / 8; i === 0 ? ctx.moveTo(cx + Math.cos(a) * rX, cy + Math.sin(a) * rY) : ctx.lineTo(cx + Math.cos(a) * rX, cy + Math.sin(a) * rY); }
    ctx.strokeStyle = 'rgba(60,45,70,0.6)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.strokeStyle = 'rgba(50,38,62,0.3)'; ctx.lineWidth = 0.7;
    for (let i = 0; i < n; i++) {
      const a1 = (i / n) * Math.PI * 2 - Math.PI / 8, a2 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 8;
      const mx = cx + Math.cos((a1 + a2) / 2) * rX * 0.92, my = cy + Math.sin((a1 + a2) / 2) * rY * 0.92;
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a1) * rX, cy + Math.sin(a1) * rY); ctx.lineTo(mx, my - rY * 0.1); ctx.stroke();
    }
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 - Math.PI / 8;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rX, cy + Math.sin(a) * rY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(80,60,90,0.75)'; ctx.fill();
    }
  }
}

/* =========================================================
   D. ARENA INIT
   ========================================================= */

let arenaInstance = null;

function initArena() {
  const c = el('arenaCanvas');
  if (!c) return;
  arenaInstance = new ArenaRenderer(c);
  qsa('.arena-trigger').forEach(t => {
    t.addEventListener('click', () => arenaInstance.transitionTo(t.dataset.view || 'center'));
  });
}

/* =========================================================
   E. COUNTDOWN  (called immediately on DOMContentLoaded,
      before the globe resolves, so it's always live)
   ========================================================= */

let cdStarted = false;

function initCountdown() {
  if (cdStarted) return;
  cdStarted = true;

  // June 20, 2026 at 9:00 AM Belize Standard Time (UTC-6)
  const EVENT = new Date('2026-06-20T15:00:00Z');
  const pad   = n => String(n).padStart(2, '0');

  function tick() {
    const diff = EVENT - Date.now();
    if (diff <= 0) {
      ['cdDays','cdHours','cdMins','cdSecs'].forEach(id => { if (el(id)) el(id).textContent = '00'; });
      const lbl = qs('.countdown-label');
      if (lbl) lbl.textContent = 'Event Live Now!';
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000)  / 60000);
    const s = Math.floor((diff % 60000)    / 1000);
    if (el('cdDays'))  el('cdDays').textContent  = pad(d);
    if (el('cdHours')) el('cdHours').textContent = pad(h);
    if (el('cdMins'))  el('cdMins').textContent  = pad(m);
    if (el('cdSecs'))  el('cdSecs').textContent  = pad(s);
  }
  setInterval(tick, 1000);
  tick();
}

/* =========================================================
   F. SITE ANIMATIONS
   ========================================================= */

let siteAnimsInitialized = false;

function initSiteAnimations() {
  if (siteAnimsInitialized) return;
  siteAnimsInitialized = true;

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    // Recalculate after layout settles (especially post-globe scroll position)
    setTimeout(() => ScrollTrigger.refresh(), 80);
  }

  initArena();
  initNavScroll();
  initMobileMenu();
  initCursor();
  initMagneticButtons();
  initTiltCards();
  initCounters();
  initCountdown(); // guarded — safe to call again
  initScrollProgress();
  initSectionReveals();
  initSmoothScroll();
  initFormPage();
}

/* ── Nav ── */
function initNavScroll() {
  const header = el('mainHeader');
  if (!header) return;
  const update = () => header.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', update, { passive: true });
  update();
}

/* ── Mobile menu ── */
function initMobileMenu() {
  const hamburger = el('hamburger'), menu = el('mobileMenu');
  const closeBtn  = el('mobileClose'), backdrop = el('mobileBackdrop');

  const open = () => {
    if (!hamburger || !menu) return;
    hamburger.classList.add('active'); hamburger.setAttribute('aria-expanded', 'true');
    menu.classList.add('open'); menu.removeAttribute('aria-hidden');
    if (backdrop) backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    const first = qs('.mobile-nav-link', menu); if (first) first.focus();
  };
  const close = () => {
    if (!hamburger || !menu) return;
    hamburger.classList.remove('active'); hamburger.setAttribute('aria-expanded', 'false');
    menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true');
    if (backdrop) backdrop.classList.remove('open');
    document.body.style.overflow = ''; hamburger.focus();
  };

  if (hamburger) hamburger.addEventListener('click', () => hamburger.getAttribute('aria-expanded') === 'true' ? close() : open());
  if (closeBtn)  closeBtn.addEventListener('click', close);
  if (backdrop)  backdrop.addEventListener('click', close);
  qsa('.mobile-nav-link').forEach(l => l.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && menu && menu.classList.contains('open')) close(); });
  window._closeMobileMenu = close;
}

/* ── Custom cursor ── */
function initCursor() {
  if (!window.matchMedia('(hover: hover)').matches || RM) return;
  const cursor = el('cursor'), follower = el('cursor-follower');
  if (!cursor || !follower) return;
  let mx = innerWidth / 2, my = innerHeight / 2, fx = mx, fy = my;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursor.style.left = mx + 'px'; cursor.style.top = my + 'px'; }, { passive: true });
  (function anim() { fx += (mx - fx) * 0.1; fy += (my - fy) * 0.1; follower.style.left = fx + 'px'; follower.style.top = fy + 'px'; requestAnimationFrame(anim); })();
  qsa('a, button, [tabindex]').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('hovering'); follower.classList.add('hovering'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('hovering'); follower.classList.remove('hovering'); });
  });
}

/* ── Magnetic buttons ── */
function initMagneticButtons() {
  if (isMobile() || RM || typeof gsap === 'undefined') return;
  qsa('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, { x: (e.clientX - r.left - r.width / 2) * 0.35, y: (e.clientY - r.top - r.height / 2) * 0.35, duration: 0.4, ease: 'power2.out' });
    });
    btn.addEventListener('mouseleave', () => gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1,0.4)' }));
  });
}

/* ── 3D card tilt ── */
function initTiltCards() {
  if (isMobile() || RM || typeof gsap === 'undefined') return;
  qsa('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      gsap.to(card, { rotateY: ((e.clientX - r.left) / r.width - 0.5) * 16, rotateX: (0.5 - (e.clientY - r.top) / r.height) * 10, transformPerspective: 900, duration: 0.4, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' }));
  });
}

/* ── Stat counters ── */
function animateCounter(counterEl) {
  const target = parseInt(counterEl.dataset.target, 10);
  const start  = performance.now();
  (function step(now) {
    const p = Math.min((now - start) / 1800, 1);
    counterEl.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(step);
    else counterEl.textContent = target;
  })(performance.now());
}

function initCounters() {
  const nums = qsa('.stat-number[data-target]');
  if (!nums.length) return;
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({ trigger: '.stats-section', start: 'top 75%', once: true, onEnter: () => nums.forEach(animateCounter) });
  } else if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { nums.forEach(animateCounter); io.disconnect(); } }, { threshold: 0.3 });
    const s = qs('.stats-section'); if (s) io.observe(s);
  }
}

/* ── Scroll progress ── */
function initScrollProgress() {
  const bar = el('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h > 0) bar.style.width = (window.scrollY / h * 100) + '%';
  }, { passive: true });
}

/* ── Section reveals ── */

// Force all animated section elements visible (used on mobile + RM)
function revealAllImmediate() {
  ['.stat-item', '.tournament-card', '.or-label', '.or-title', '.or-body',
   '.about-preview-text', '.about-preview-emblem', '.quote-text', '.quote-author',
   '.cta-inner', '.preview-item', '.gallery-cta-wrap', '.footer-grid',
   '.reveal-up', '.reveal-stagger .reveal-item'
  ].forEach(sel => qsa(sel).forEach(e => { e.style.opacity = '1'; e.style.transform = 'none'; }));
}

function initSectionReveals() {
  // On mobile or without GSAP: skip all animations, show everything now.
  // iOS Safari's ScrollTrigger behaviour after a pinned globe intro is
  // unreliable — elements with CSS opacity:0 would stay invisible forever.
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || RM || isMobile()) {
    revealAllImmediate();
    return;
  }

  const reveal = (selector, opts = {}) => {
    const els = qsa(selector);
    if (!els.length) return;
    gsap.from(els, {
      opacity: 0,
      y:     opts.y   ?? 36,
      x:     opts.x   ?? 0,
      scale: opts.scale ?? 1,
      immediateRender: false,
      duration: opts.duration ?? 0.72,
      stagger:  opts.stagger  ?? 0,
      ease:     opts.ease     ?? 'power3.out',
      scrollTrigger: {
        trigger: opts.trigger ?? els[0],
        start:   opts.start   ?? 'top 82%',
        once:    true,
      }
    });
  };

  // Hero parallax
  gsap.to('.hero-logo',        { scale: 0.72, opacity: 0, y: -30,  scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: 1.5 } });
  gsap.to('.hero-manifesto',   { y: -70, opacity: 0,               scrollTrigger: { trigger: '.hero', start: 'top top', end: '50% top', scrub: 1   } });
  gsap.to('.hero-sub, .hero-ctas', { opacity: 0, y: -24,           scrollTrigger: { trigger: '.hero', start: 'top top', end: '40% top', scrub: 1   } });

  reveal('.stat-item',            { stagger: 0.12, trigger: '.stats-section' });
  reveal('.or-label',             { trigger: '.one-rule-section',   start: 'top 72%' });
  reveal('.or-title',             { trigger: '.one-rule-section',   start: 'top 72%', y: 28 });
  reveal('.or-body',              { trigger: '.one-rule-section',   start: 'top 72%', y: 18 });
  reveal('.about-preview-text',   { x: -48, y: 0,  trigger: '.about-preview-section' });
  reveal('.about-preview-emblem', { x:  48, y: 0,  trigger: '.about-preview-section' });
  reveal('.tournament-card',      { stagger: 0.14, trigger: '.tournaments-grid' });
  reveal('.quote-text',           { scale: 0.96, y: 0, trigger: '.fighter-quote-section', start: 'top 66%' });
  reveal('.quote-author',         { trigger: '.fighter-quote-section', start: 'top 66%' });
  reveal('.cta-inner',            { trigger: '.cta-section',    start: 'top 72%' });
  reveal('.preview-item',         { stagger: 0.12, trigger: '.preview-grid' });
  reveal('.gallery-cta-wrap',     { trigger: '.gallery-cta-wrap', start: 'top 92%' });
  reveal('.footer-grid',          { trigger: '.footer-grid',    start: 'top 86%' });
  reveal('.reveal-up',            { stagger: 0.1 });
  reveal('.reveal-stagger .reveal-item', { stagger: 0.15 });

  // Force ScrollTrigger to re-evaluate all positions now —
  // critical after the globe intro leaves the user deep in the page.
  requestAnimationFrame(() => setTimeout(() => ScrollTrigger.refresh(), 150));
}

/* ── Smooth scroll ── */
function initSmoothScroll() {
  const header = el('mainHeader');
  qsa('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = qs(href); if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + scrollY - (header ? header.offsetHeight : 0), behavior: 'smooth' });
    });
  });
}

/* ── Registration form ── */
function initFormPage() {
  const form = el('registerForm');
  if (!form) return;

  const FORM_ID = 'YOUR_FORM_ID';

  const validators = {
    'r-firstName':  v => v.trim().length >= 2 ? '' : 'Please enter your first name.',
    'r-lastName':   v => v.trim().length >= 2 ? '' : 'Please enter your last name.',
    'r-email':      v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.',
    'r-phone':      v => v.trim().length >= 7 ? '' : 'Enter a valid phone number.',
    'r-tournament': v => v ? '' : 'Please select a tournament.',
    'r-belt':       v => v ? '' : 'Please select your belt rank.',
    'r-weight':     v => v ? '' : 'Please select your weight division.',
    'r-waiver':     (_, f) => f.checked ? '' : 'You must agree to the waiver.',
  };

  const getErr = id => { const f = el(id); return (!f || !validators[id]) ? '' : validators[id](f.value, f); };
  const setState = (id, err) => {
    const f = el(id), e = el(`err-${id}`);
    if (!f) return;
    f.classList.toggle('is-invalid', !!err);
    f.classList.toggle('is-valid', !err && !!f.value);
    if (e) e.textContent = err || '';
  };

  Object.keys(validators).forEach(id => {
    const f = el(id); if (!f) return;
    f.addEventListener(id === 'r-waiver' ? 'change' : 'blur', () => setState(id, getErr(id)));
    if (id !== 'r-waiver') f.addEventListener('input', () => { if (f.classList.contains('is-invalid')) setState(id, getErr(id)); });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();
    let hasErr = false;
    Object.keys(validators).forEach(id => { const err = getErr(id); setState(id, err); if (err) hasErr = true; });
    if (hasErr) { const first = form.querySelector('.is-invalid'); if (first) first.focus(); return; }

    const data = {
      firstName: el('r-firstName')?.value.trim() || '',
      lastName:  el('r-lastName')?.value.trim()  || '',
      email:     el('r-email')?.value.trim()      || '',
      phone:     el('r-phone')?.value.trim()      || '',
      tournament: el('r-tournament')?.value       || '',
      beltRank:  el('r-belt')?.value              || '',
      weightDiv: el('r-weight')?.value            || '',
      team:      el('r-team')?.value.trim()       || '',
      _subject:  'New Registration — Finishers Circle',
    };

    const btn = el('submitBtn'); if (btn) btn.classList.add('loading');
    try {
      if (FORM_ID !== 'YOUR_FORM_ID') {
        const r = await fetch(`https://formspree.io/f/${FORM_ID}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) });
        if (!r.ok) throw new Error('failed');
      } else {
        await new Promise(r => setTimeout(r, 1200));
        localStorage.setItem(`fc_reg_${Date.now()}`, JSON.stringify(data));
      }
      showSuccess(data);
    } catch {
      localStorage.setItem(`fc_reg_fallback_${Date.now()}`, JSON.stringify(data));
      showSuccess(data);
    } finally {
      if (btn) btn.classList.remove('loading');
    }
  });

  function showSuccess(data) {
    const fs = el('formSection'), ss = el('modalSuccessView');
    if (fs) fs.style.display = 'none';
    if (ss) {
      ss.removeAttribute('hidden'); ss.style.display = 'block';
      const det = qs('#successDetails');
      if (det) det.innerHTML = `<strong>${data.firstName} ${data.lastName}</strong><br>Tournament: ${data.tournament}<br>Belt: ${data.beltRank} &middot; Division: ${data.weightDiv}${data.team ? `<br>Team: ${data.team}` : ''}`;
    }
  }
}

/* =========================================================
   G. BOOT
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Countdown starts immediately — does NOT wait for globe or GSAP.
  // This guarantees it's always live even on mobile where the globe
  // intro is skipped.
  initCountdown();

  const globeIntro = el('globeIntro');

  if (globeIntro) {
    if (RM || isMobile()) {
      // Mobile / reduced-motion: skip globe entirely, show site right away.
      globeIntro.style.display = 'none';
      const sw = el('siteWrapper');
      if (sw) sw.classList.add('visible');
      // Wait for GSAP before kicking off animations
      (function waitGSAP() {
        if (typeof gsap !== 'undefined') initSiteAnimations();
        else setTimeout(waitGSAP, 50);
      })();
    } else {
      // Desktop: wait for Three.js + GSAP then show globe intro
      (function waitLibs() {
        if (typeof THREE !== 'undefined' && typeof gsap !== 'undefined') initGlobe();
        else setTimeout(waitLibs, 50);
      })();
    }
  } else {
    // Inner pages (about, contact, registration, gallery)
    const sw = el('siteWrapper');
    if (sw) sw.classList.add('visible');
    (function waitGSAP() {
      if (typeof gsap !== 'undefined') initSiteAnimations();
      else setTimeout(waitGSAP, 50);
    })();
  }
});
