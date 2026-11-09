// Z.AI BALI · style kit for three.js (r170). Each style = materials + (optional) post pass. Pure functions of time: no Math.random().
import * as THREE from 'three';

// ---------- shared ----------
export function hash(n) { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
export function canvasTex(w, h, draw, repeat = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); return t;
}
// full-screen post pass: render scene -> target -> shader -> screen
export function makePost(renderer, W, H, fragment, uniforms = {}, withDepth = false) {
  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
  if (withDepth) { rt.depthTexture = new THREE.DepthTexture(W, H); }
  const mat = new THREE.ShaderMaterial({
    uniforms: { tColor: { value: rt.texture }, tDepth: { value: rt.depthTexture }, res: { value: new THREE.Vector2(W, H) }, time: { value: 0 }, ...uniforms },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }', fragmentShader: fragment, depthTest: false, depthWrite: false });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); quad.frustumCulled = false;
  const pscene = new THREE.Scene(); pscene.add(quad); const pcam = new THREE.Camera();
  return { rt, mat, run(scene, cam, t) { mat.uniforms.time.value = t; renderer.setRenderTarget(rt); renderer.render(scene, cam); renderer.setRenderTarget(null); renderer.render(pscene, pcam); } };
}

// ---------- 1. CLAY (plasticine) ----------
// Soft diffuse, no sharp specular, fingerprint-like bump, silhouettes slightly wobbling at 12 fps (stop-motion "boil").
export function clayBump() {
  return canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = '#808080'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 9000; i++) { const x = hash(i) * w, y = hash(i + 7e3) * h, r = 1 + hash(i + 1.5e4) * 3.5, v = hash(i + 3e4) > .5 ? 255 : 0;
      c.fillStyle = `rgba(${v},${v},${v},0.06)`; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }          // pits & bumps
    c.lineWidth = 1.4; for (let k = 0; k < 14; k++) { const cx = hash(k * 3) * w, cy = hash(k * 3 + 1) * h; // fingerprint arcs
      for (let r = 6; r < 70; r += 4.5) { c.strokeStyle = `rgba(255,255,255,${0.05 + 0.04 * hash(k + r)})`; c.beginPath();
        c.ellipse(cx, cy, r * 1.25, r, hash(k) * 3, 0.3, 5.6); c.stroke(); } }
  }, 2);
}
export function clayMaterial(color, bump = clayBump()) {
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.86, metalness: 0, bumpMap: bump, bumpScale: 4 });
  m.sheen = 0.6; m.onBeforeCompile = (s) => { // "boil": stop-motion wobble, 12 fps steps
    s.uniforms.uBoil = m.userData.boil = { value: 0 };
    s.vertexShader = 'uniform float uBoil;\n' + s.vertexShader.replace('#include <begin_vertex>',
      `vec3 transformed = position + normal * (sin(dot(position, vec3(7.1,5.3,6.2)) + uBoil*37.0) * 0.012);`);
  }; return m;
}
export const setClayTime = (mats, t) => { const q = Math.floor(t * 12) / 12; for (const m of mats) if (m.userData.boil) m.userData.boil.value = q; };
// light: warm key from upper left + cool low fill + wide soft shadow (PCFSoft radius) = "table-top" look
export function clayLights(scene) {
  const k = new THREE.DirectionalLight(0xfff0d8, 2.4); k.position.set(-4, 6, 4); k.castShadow = true; k.shadow.radius = 8; k.shadow.mapSize.set(1024, 1024); scene.add(k);
  scene.add(new THREE.HemisphereLight(0xffe3c8, 0x6a4a3a, 0.9)); return k;
}

// ---------- 2. ANIME CEL ----------
export function celGradient(steps = 3) {
  const d = new Uint8Array(steps * 4); for (let i = 0; i < steps; i++) { const v = Math.round(255 * (0.35 + 0.65 * i / (steps - 1))); d.set([v, v, v, 255], i * 4); }
  const t = new THREE.DataTexture(d, steps, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t;
}
export function celMaterial(color, grad = celGradient(3)) { return new THREE.MeshToonMaterial({ color, gradientMap: grad }); }
// outline = inverted hull: same mesh, BackSide, pushed along the normal in clip space so width is constant on screen
export function celOutline(mesh, px = 3, color = 0x1a1020, H = 960) {
  const m = new THREE.ShaderMaterial({ side: THREE.BackSide, uniforms: { w: { value: px * 2 / H }, col: { value: new THREE.Color(color) } },
    vertexShader: `uniform float w; void main(){ vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.); vec3 n=normalize(normalMatrix*normal);
      vec2 d=normalize((projectionMatrix*vec4(n,0.)).xy+1e-5); p.xy+=d*w*p.w; gl_Position=p; }`,
    fragmentShader: 'uniform vec3 col; void main(){ gl_FragColor=vec4(col,1.); }' });
  const o = new THREE.Mesh(mesh.geometry, m); mesh.add(o); return o;
}
// extra: anime "hold" = pose on twos (12 fps); hard rim light via Fresnel step added in post or in material with onBeforeCompile.
export const animeTime = (t, fps = 12) => Math.floor(t * fps) / fps;

// ---------- 3. BLUEPRINT (edge shader) ----------
// Render scene with normals+depth, find edges (Sobel on normal-colour + depth gradient), paint white lines on a blue grid.
export const BLUEPRINT_FRAG = `
precision highp float; varying vec2 vUv; uniform sampler2D tColor, tDepth; uniform vec2 res; uniform float time;
float lin(float d){ float n=0.1,f=60.; return n*f/(f-d*(f-n)); }
vec3 N(vec2 uv){ return texture2D(tColor,uv).rgb; } float D(vec2 uv){ return lin(texture2D(tDepth,uv).r); }
void main(){ vec2 px=1./res; float gx=0.,gy=0.; vec3 nx=vec3(0.), ny=vec3(0.); float dx=0., dy=0.;
  // Sobel 3x3
  for(int i=-1;i<=1;i++) for(int j=-1;j<=1;j++){ float wx=float(i)*(j==0?2.:1.), wy=float(j)*(i==0?2.:1.); vec2 o=vec2(float(i),float(j))*px;
    nx+=N(vUv+o)*wx; ny+=N(vUv+o)*wy; dx+=D(vUv+o)*wx; dy+=D(vUv+o)*wy; }
  float e = length(nx)+length(ny); float ed = (abs(dx)+abs(dy))*0.35;
  float line = smoothstep(0.55,1.1,e) + smoothstep(0.35,0.9,ed); line=clamp(line,0.,1.);
  // paper: radial gradient + 2 grids (minor every 24 px, major every 120 px) + slight scan jitter
  vec2 p=vUv*res; vec3 bg=mix(vec3(.07,.23,.46),vec3(.12,.35,.65),1.-length(vUv-.5)*1.3);
  float g1=1.-min(min(abs(fract(p.x/24.-.5)-.5),abs(fract(p.y/24.-.5)-.5))*24.,1.)*1.; g1=smoothstep(0.,1.,1.-min(1.,min(abs(mod(p.x,24.)),abs(mod(p.y,24.)))));
  float g2=1.-min(1.,min(abs(mod(p.x,120.)),abs(mod(p.y,120.))));
  bg += vec3(.55,.75,1.)*(g1*.07+g2*.12);
  float fill = step(0.0001, 1.-texture2D(tDepth,vUv).r) ; // object mask (depth<1)
  bg += vec3(.2,.4,.8)*fill*.08;                           // faint tint inside the object
  vec3 col = mix(bg, vec3(.93,.97,1.), line); gl_FragColor=vec4(col,1.); }`;
// Materials for the normal pass: MeshNormalMaterial for everything (set scene.overrideMaterial).
// Dimension lines are 2D: draw them with CSS/SVG/Canvas over the frame (arrows + "12,0 cm"), animate stroke-dashoffset by t.

// ---------- 4. PAPER CUT (layered diorama) ----------
export function paperGrain() {
  return canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#808080'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { const x = hash(i) * w, y = hash(i + 1e4) * h, a = hash(i + 2e4) * 6.28, l = 3 + hash(i + 3e4) * 9;
      c.strokeStyle = hash(i + 4e4) > .5 ? 'rgba(0,0,0,.07)' : 'rgba(255,255,255,.09)'; c.lineWidth = .5 + hash(i + 5e4) * .6;
      c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Math.cos(a + .6) * l / 2, y + Math.sin(a + .6) * l / 2, x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke(); } }, 3);
}
// every piece = flat shape extruded 0.02..0.04 (cut edge catches light), layers separated along Z by ~0.35, REAL shadows between layers.
export function paperPiece(shape, color, z, grain = paperGrain()) {
  const g = new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1 });
  const m = new THREE.MeshStandardMaterial({ color, roughness: 0.95, bumpMap: grain, bumpScale: 1.2 });
  const mesh = new THREE.Mesh(g, m); mesh.position.z = z; mesh.castShadow = mesh.receiveShadow = true; return mesh;
}
export function paperLights(scene) { // low raking key from upper-left makes cast shadows long; soft radius grows with distance (use 5..8)
  const k = new THREE.DirectionalLight(0xfff4e6, 2.6); k.position.set(-6, 4, 5); k.castShadow = true; k.shadow.radius = 5;
  Object.assign(k.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 0.5, far: 40 }); k.shadow.mapSize.set(2048, 2048); k.shadow.bias = -0.0005; scene.add(k); scene.add(new THREE.AmbientLight(0xdfe6ff, 0.3)); return k;
}
// parallax: camera slides on x by <=0.4 over the shot, layers at different z shift automatically (true 3D), no manual parallax code.

// ---------- 5. ISOMETRIC ----------
// True isometric: camera along (1,1,1), elevation 35.264 deg. Game-style "2:1": rotate 45 deg, elevation 30 deg (kit uses cos30=.866, .5).
export function isoCamera(W, H, viewH = 10, game = false) {
  const a = W / H, c = new THREE.OrthographicCamera(-viewH * a / 2, viewH * a / 2, viewH / 2, -viewH / 2, -100, 100);
  const el = game ? Math.PI / 6 : Math.atan(1 / Math.SQRT2), d = 30;
  c.position.set(Math.cos(el) * Math.SQRT1_2 * d, Math.sin(el) * d, Math.cos(el) * Math.SQRT1_2 * d); c.lookAt(0, 0, 0); return c;
}
// "maket" look: flat per-face shades (top = base, left = -16%, right = -34% like the catalog) + light bevel edge. Use MeshLambertMaterial + 3 fixed lights.
export function isoLights(scene) {
  const top = new THREE.DirectionalLight(0xffffff, 2.2); top.position.set(0, 10, 0);
  const left = new THREE.DirectionalLight(0xffffff, 1.5); left.position.set(-10, 1, 10);   // shows the +z face
  const right = new THREE.DirectionalLight(0xffffff, 0.6); right.position.set(10, 1, 0);   // shows the +x face, darker
  scene.add(top, left, right, new THREE.AmbientLight(0xffffff, 0.35)); }
// landing: squash with decaying sine, same formula as in the catalogue: sq = exp(-land*9) * sin(land*26) * 0.16
export const landSquash = (land) => land > 0 ? Math.exp(-land * 9) * Math.sin(land * 26) * 0.16 : 0;

// ---------- 6. MATRIX ----------
// Post pass: green glyph rain; brightness of the scene decides how bright the cell is -> the subject appears made of falling code.
export const MATRIX_FRAG = `
precision highp float; varying vec2 vUv; uniform sampler2D tColor; uniform vec2 res; uniform float time;
float h11(float n){ return fract(sin(n*127.1)*43758.5453); } float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
void main(){ float cell=14.; vec2 g=floor(vUv*res/cell); vec2 f=fract(vUv*res/cell);
  float spd=.35+h11(g.x)*.9, off=h11(g.x+9.)*40.; float head=fract(-time*spd*.25-off); float yy=g.y/(res.y/cell);
  float trail=fract(head-yy); float rain=pow(1.-trail,3.);                       // bright head, long tail
  float step_=floor(time*8.); float bits=h21(g+step_*(h11(g.x*7.+g.y)>.8?1.:0.)); // some glyphs flicker
  vec2 q=floor(f*vec2(5.,7.)); float glyph= step(.5,h21(q+floor(bits*64.))) * step(.12,f.x)*step(f.x,.88)*step(.1,f.y)*step(f.y,.9);
  float lum=dot(texture2D(tColor,(g+.5)*cell/res).rgb,vec3(.299,.587,.114));
  float v=glyph*(rain*.3+lum*2.6); vec3 col=vec3(.0,1.,.35)*v + vec3(.8,1.,.85)*glyph*smoothstep(.96,1.,1.-trail)*.8; gl_FragColor=vec4(col+vec3(0.,.02,.0),1.); }`;
