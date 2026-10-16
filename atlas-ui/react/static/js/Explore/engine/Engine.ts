// atlas-ui/react/static/js/Explore/engine/Engine.ts
//
// One renderer for the whole universe. The camera never moves: every layer positions
// its content relative to the camera in float64 before handing it to the GPU
// (floating origin), which is what keeps a planet surface and the galactic center
// in the same frame without jitter.
//
// Passes, each in its own units and depth range:
//   1. Deep sky (light years) into half-float targets: the galaxy's diffuse glow (layer
//      GLOW_LAYER) into a low-resolution one, as it is smooth and, inside dense regions,
//      thousands of overlapping sprites deep; everything else at full resolution
//   2. Tonemap (both targets added) + warp streaks to screen
//   3. Star system (astronomical units)
//   4. Planet (planet radii): the full planet renderer, effects and moons
//   5. Hyperjump, only while one runs: the finished frame is copied off the screen and
//      drawn back through a wormhole (everything bends away from its mouth), with the
//      hyperspace tunnel inside it
//   6. The ship, from its chase camera (ShipView): it flies into the wormhole untouched

import * as THREE from "three";
import type { QualityProfile } from "./Quality.ts";

const MAX_LENSES = 4;

// Objects on this layer are drawn into the low-resolution glow target
export const GLOW_LAYER = 1;
// Resolution of the glow target, relative to the deep sky target (per side)
const GLOW_SCALE = 0.35;

const FULLSCREEN_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const TONEMAP_FRAGMENT = /* glsl */ `
  uniform sampler2D tHdr;
  uniform sampler2D tGlow;
  uniform float uExposure;
  uniform float uTime;
  uniform float uWarp;
  uniform float uAspect;
  uniform vec3 uLenses[4];
  uniform int uLensCount;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  // The deep sky: stars at full resolution, the glow upsampled (bilinear) from its target
  // and held a little under the stars, so dense regions read as starfields, not fog
  vec3 deepSky(vec2 uv) {
    uv = clamp(uv, 0.0, 1.0);
    return texture2D(tHdr, uv).rgb + texture2D(tGlow, uv).rgb * 0.7;
  }

  // The jump drive. The real sky is smeared into radial streaks (a zoom blur, split
  // by colour at the edges like a lens pushed past its limits) and rippled by the jump
  // field. In the onboarding's palette
  vec3 warpedSky(vec2 uv) {
    vec2 c = vec2(0.5);
    vec2 d = uv - c;
    float r = length(d * vec2(uAspect, 1.0));
    d *= 1.0 + sin(r * 22.0 - uTime * 9.0) * 0.006 * uWarp;
    float span = uWarp * (0.05 + 0.3 * r);
    float split = 0.014 * uWarp * r;
    vec3 acc = vec3(0.0);
    float wsum = 0.0;
    for (int i = 0; i < 12; i++) {
      float t = float(i) / 11.0;
      float s = 1.0 - span * t;
      float w = 1.0 - t * 0.7;
      acc.r += deepSky(c + d * s * (1.0 + split)).r * w;
      acc.g += deepSky(c + d * s).g * w;
      acc.b += deepSky(c + d * s * (1.0 - split)).b * w;
      wsum += w;
    }
    // A star smeared over the streak keeps most of its light
    return acc / wsum * mix(1.0, 5.0, uWarp);
  }

  // Glowing motes streaming out of the vanishing point, each with a short tail
  vec3 jumpField(vec2 uv) {
    vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);
    float r = length(p);
    float a = atan(p.y, p.x);
    float lanes = 64.0;
    float lane = floor((a / 6.2831853 + 0.5) * lanes);
    float seed = hash(vec2(lane, 3.1));
    float laneAngle = (lane + 0.25 + 0.5 * seed) / lanes * 6.2831853 - 3.14159265;
    float across = abs(sin(a - laneAngle)) * r;
    float speed = 0.45 + seed * 1.1;
    float lr = log(max(r, 1e-3)) * 2.4 - uTime * speed * (0.6 + 2.6 * uWarp) + seed * 7.0;
    float cell = floor(lr);
    float f = fract(lr);
    float on = step(0.5, hash(vec2(lane, cell)));
    float head = exp(-pow((f - 0.82) * 10.0, 2.0));
    float tail = smoothstep(0.82 - 0.75 * uWarp, 0.82, f) * step(f, 0.82);
    float width = 0.0012 + 0.0045 * r;
    float core = exp(-pow(across / width, 2.0));
    vec3 tint = mix(vec3(0.3, 0.6, 1.0), vec3(0.72, 0.48, 1.0), hash(vec2(cell, lane)));
    tint = mix(tint, vec3(0.55, 1.0, 0.95), step(0.82, seed));
    return tint * core * on * (head * 1.3 + tail * 0.45) * smoothstep(0.03, 0.28, r) * uWarp;
  }

  void main() {
    // Gravitational lensing (thin lens): light is pulled towards the Einstein ring,
    // the horizon swallows everything inside it and a thin photon ring outlines it
    vec2 uv = vUv;
    float shadow = 1.0;
    vec3 photon = vec3(0.0);
    for (int i = 0; i < 4; i++) {
      if (i >= uLensCount) break;
      vec3 lens = uLenses[i];
      vec2 d = (vUv - lens.xy) * vec2(uAspect, 1.0);
      float r = max(length(d), 1e-5);
      float horizon = lens.z;
      float einstein = horizon * 1.7;
      float source = r - einstein * einstein / r;
      uv += (d / r) * (source - r) / vec2(uAspect, 1.0);
      shadow *= smoothstep(horizon * 0.95, horizon * 1.05, r);
      float ring = exp(-pow((r - horizon * 1.12) / (horizon * 0.05), 2.0));
      photon += vec3(1.0, 0.82, 0.6) * ring * 0.9;
    }
    vec3 sky = uWarp > 0.001 ? warpedSky(uv) : deepSky(uv);
    vec3 hdr = sky * uExposure * shadow + photon;
    // Filmic-ish shoulder; keeps saturated cores from clipping to flat white
    vec3 mapped = vec3(1.0) - exp(-hdr);
    float luma = dot(mapped, vec3(0.2126, 0.7152, 0.0722));
    mapped = mix(vec3(luma), mapped, 1.3);
    if (uWarp > 0.001) {
      vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
      float r = length(p);
      mapped *= 1.0 - uWarp * 0.4 * smoothstep(0.35, 0.95, r);
      mapped += jumpField(vUv);
      // The vanishing point glows
      mapped += vec3(0.3, 0.55, 1.0) * exp(-r * r * 22.0) * uWarp * 0.35;
    }
    mapped = pow(max(mapped, 0.0), vec3(1.0 / 2.2));
    mapped += (hash(vUv * 1000.0 + uTime) - 0.5) / 255.0;
    gl_FragColor = vec4(mapped, 1.0);
  }
`;

// The hyperjump, over the finished frame (display colours, copied off the screen).
//
// A wormhole opens at the vanishing point. Outside its mouth the frame is lensed like
// the sky round a black hole: light from behind it is bent outwards, so whatever is on
// screen (stars, planets, orbits, labels drawn in the scene) slides away from the mouth,
// stretched round it into arcs, split into colours at the rim, twisting slowly. Inside
// is hyperspace. The mouth grows until it fills the screen; the ride happens inside;
// dropping out, a second mouth opens on the new place and widens until it is all there
// is (uExit = 1: the scene inside, hyperspace outside).
const WORMHOLE_FRAGMENT = /* glsl */ `
  uniform sampler2D tFrame;
  uniform float uTime;
  uniform float uAspect;
  uniform float uMouth;   // radius of the mouth, in screen heights
  uniform float uExit;
  uniform float uCharge;
  uniform float uFlash;
  // Reduced flashing (photosensitivity): no white flashes or shock ring, little colour
  // split, slower hyperspace
  uniform float uCalm;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  // Value noise, periodic in x (so it wraps round the tunnel without a seam)
  float pnoise(vec2 x, float period) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float x0 = mod(i.x, period), x1 = mod(i.x + 1.0, period);
    float a = hash(vec2(x0, i.y)), b = hash(vec2(x1, i.y));
    float c = hash(vec2(x0, i.y + 1.0)), d = hash(vec2(x1, i.y + 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Hyperspace: a tunnel of light streaming past, twisting as it goes, rings of energy
  // rushing out of the far end and a glow there (linear light)
  vec3 hyperspace(vec2 p, float r) {
    float a = atan(p.y, p.x) / 6.2831853 + 0.5;
    float depth = 0.22 / max(r, 0.015);
    float z = depth + uTime * 3.2 * (1.0 - 0.6 * uCalm);
    float u = a + depth * 0.035 + uTime * 0.03;
    float coarse = pnoise(vec2(u * 18.0, z * 0.9), 18.0);
    float fine = pnoise(vec2(u * 72.0, z * 3.5), 72.0);
    float filaments = pow(coarse, 3.0) * 0.8 + pow(fine, 6.0) * 0.9;
    float hue = pnoise(vec2(u * 3.0, z * 0.15), 3.0);
    vec3 col = mix(vec3(0.12, 0.38, 1.0), vec3(0.62, 0.28, 1.0), hue);
    col = mix(col, vec3(0.55, 1.0, 0.95), smoothstep(0.75, 0.97, fine) * 0.6);
    float walls = 0.15 + smoothstep(0.02, 0.3, r) * (0.55 + 1.1 * smoothstep(0.25, 0.85, r));
    float rings = pow(0.5 + 0.5 * sin(z * 2.2), 14.0) * smoothstep(0.05, 0.3, r) * 0.35;
    vec3 linear = col * (filaments * walls + rings) + vec3(0.65, 0.82, 1.0) * exp(-r * r * 90.0) * 0.6 + vec3(0.01, 0.015, 0.04);
    return pow(1.0 - exp(-linear * 1.4), vec3(1.0 / 2.2));
  }

  vec3 frameAt(vec2 p) {
    return texture2D(tFrame, clamp(0.5 + p / vec2(uAspect, 1.0), 0.0, 1.0)).rgb;
  }

  // The frame lensed by the mouth: each colour bent a little differently
  vec3 lensed(vec2 p, float r, float mouth) {
    vec2 dir = p / max(r, 1e-5);
    // A slow twist, strongest near the rim
    float twist = 0.9 * mouth / max(r, mouth) * (0.4 + 0.6 * uCharge);
    vec3 col;
    for (int c = 0; c < 3; c++) {
      float m = mouth * (1.0 + (float(c) - 1.0) * 0.045 * (1.0 - 0.85 * uCalm));
      float source = max(r - m * m / max(r, 1e-4), 0.0);
      float ang = twist * (1.0 + (float(c) - 1.0) * 0.1);
      vec2 d = vec2(dir.x * cos(ang) - dir.y * sin(ang), dir.x * sin(ang) + dir.y * cos(ang));
      col[c] = frameAt(d * source)[c];
    }
    return col;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    float r = length(p);
    float mouth = max(uMouth, 1e-4);
    float edge = 0.015 + 0.06 * mouth;
    vec3 tunnel = hyperspace(p, r);
    vec3 color;
    if (uExit < 0.5) {
      // Going in: the scene outside the mouth, bent away; hyperspace inside. Nothing of
      // the scene shows through the tunnel: what is left behind is gone once swallowed
      vec3 scene = lensed(p, r, mouth);
      color = mix(tunnel, scene, smoothstep(mouth - edge, mouth + edge, r));
    } else {
      // Coming out: the new place opens from the centre, curved like a fisheye at the rim
      float k = clamp(r / mouth, 0.0, 1.0);
      vec3 scene = frameAt(p * (1.0 - 0.3 * k * k * k));
      color = mix(scene, tunnel, smoothstep(mouth - edge, mouth + edge, r));
    }
    // The photon ring round the mouth
    float ring = exp(-pow((r - mouth) / (0.01 + 0.025 * mouth), 2.0));
    color += vec3(0.55, 0.78, 1.0) * ring * 0.55 * smoothstep(0.0, 0.05, mouth);
    // Charging: the view around the mouth dims, rings of light converge on it
    float pulses = pow(max(sin(r * 46.0 + uTime * (8.0 + 34.0 * uCharge) * (1.0 - 0.7 * uCalm)), 0.0), 12.0) * exp(-r * 3.6) * (1.0 - 0.7 * uCalm);
    color += vec3(0.35, 0.65, 1.0) * pulses * uCharge * 0.18;
    color *= 1.0 - uCharge * 0.45 * smoothstep(0.35, 0.95, r);
    // Flashes, with a shock ring running out
    float flash = clamp(uFlash, 0.0, 1.0);
    float shock = exp(-pow((r - (1.0 - flash) * 1.1) * 9.0, 2.0)) * flash * (1.0 - uCalm);
    color = mix(color, vec3(0.9, 0.95, 1.0), flash * 0.85 * (1.0 - 0.85 * uCalm)) + vec3(0.5, 0.75, 1.0) * shock * 0.5;
    gl_FragColor = vec4(color, 1.0);
  }
`;

export type FrameCallback = (dt: number, time: number) => void;

export interface ScenePass {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
}

export class Engine {
  readonly renderer: THREE.WebGLRenderer;
  readonly camera: THREE.PerspectiveCamera;
  readonly deepScene = new THREE.Scene();
  readonly nearScene = new THREE.Scene();
  nearSceneVisible = false;
  // Depth range of the star system pass (AU), set every frame by whoever owns the view
  nearRange: [number, number] = [1e-4, 1e5];
  // Planet pass: brings its own camera, already placed in planet units
  // Planet passes: each brings its own camera, already placed in planet units (drawn
  // in order, so the nearest planet goes last)
  planetPasses: ScenePass[] = [];
  // Chase-camera ship overlay (its own scene and camera)
  shipPass: ScenePass | null = null;
  exposure = 1;
  warp = 0;
  // The hyperjump, set by the owner every frame: whether it runs, the drive charging
  // (0..1), the wormhole's mouth (radius in screen heights), going in (exit 0) or
  // coming out (exit 1), and the flashes (0..1)
  jump = { active: false, charge: 0, mouth: 0, exit: 0, flash: 0 };
  // Reduced flashing (see core/comfort)
  calm = false;
  // Half the diagonal of the screen, in screen heights: a mouth this wide fills it
  get screenCover() {
    return Math.hypot(this.camera.aspect / 2, 0.5) * 1.08;
  }
  paused = false;
  // Set by the owner when the camera is still: frames drop to quality.idleFps
  idle = false;
  fps = 0;
  quality: QualityProfile;
  private frames = 0;
  private fpsWindowStart = performance.now();

  private hdrTarget: THREE.WebGLRenderTarget;
  private glowTarget: THREE.WebGLRenderTarget;
  private tonemapScene = new THREE.Scene();
  private tonemapCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private tonemapMaterial: THREE.ShaderMaterial;
  // The hyperjump pass: the frame copied off the screen, and the wormhole drawn from it
  private frameCopy: THREE.FramebufferTexture | null = null;
  private wormholeScene = new THREE.Scene();
  private wormholeMaterial: THREE.ShaderMaterial;
  private callbacks: FrameCallback[] = [];
  private running = false;
  private lastTime = 0;
  private container: HTMLElement;
  private resizeObserver: ResizeObserver;

  constructor(container: HTMLElement, quality: QualityProfile) {
    this.container = container;
    this.quality = quality;
    // No logarithmic depth: the planet effects use plain ShaderMaterials that would not
    // write log depth. Each pass gets a tight near/far range instead.
    this.renderer = new THREE.WebGLRenderer({ antialias: quality.antialias, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.pixelRatioCap));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    // Same look as the planet renderer the effects were designed for
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = quality.shadows;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.autoClear = false;
    this.renderer.domElement.style.display = "block";
    this.renderer.domElement.style.touchAction = "none";
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(60, 1, 1e-6, 1e7);
    this.camera.position.set(0, 0, 0);

    this.hdrTarget = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false });
    this.glowTarget = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, depthBuffer: false });
    this.tonemapMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tHdr: { value: this.hdrTarget.texture },
        tGlow: { value: this.glowTarget.texture },
        uExposure: { value: 1 },
        uTime: { value: 0 },
        uWarp: { value: 0 },
        uAspect: { value: 1 },
        uLenses: { value: Array.from({ length: MAX_LENSES }, () => new THREE.Vector3(0, 0, 0)) },
        uLensCount: { value: 0 },
      },
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: TONEMAP_FRAGMENT,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    this.tonemapScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.tonemapMaterial));

    this.wormholeMaterial = new THREE.ShaderMaterial({
      uniforms: { tFrame: { value: null }, uTime: { value: 0 }, uAspect: { value: 1 }, uMouth: { value: 0 }, uExit: { value: 0 }, uCharge: { value: 0 }, uFlash: { value: 0 }, uCalm: { value: 0 } },
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: WORMHOLE_FRAGMENT,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
    this.wormholeScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.wormholeMaterial));

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(container);
    this.resize();
  }

  get pixelRatio() {
    return this.renderer.getPixelRatio();
  }

  // Live part of a quality change (antialias and shadows need a new context)
  applyQuality(quality: QualityProfile) {
    this.quality = quality;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality.pixelRatioCap));
    this.resize();
  }

  // Gravitational lenses for this frame: screen position (0..1) and horizon radius
  // (fraction of the screen height). Applied to the deep sky while tonemapping.
  setLenses(lenses: Array<{ x: number; y: number; radius: number }>) {
    const u = this.tonemapMaterial.uniforms;
    const count = Math.min(lenses.length, MAX_LENSES);
    for (let i = 0; i < count; i++) u.uLenses.value[i].set(lenses[i].x, lenses[i].y, lenses[i].radius);
    u.uLensCount.value = count;
  }

  get viewportHeight() {
    return this.container.clientHeight || 1;
  }

  onFrame(callback: FrameCallback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((c) => c !== callback);
    };
  }

  resize() {
    const width = this.container.clientWidth || 1;
    const height = this.container.clientHeight || 1;
    this.renderer.setSize(width, height, false);
    this.renderer.domElement.style.width = `${width}px`;
    this.renderer.domElement.style.height = `${height}px`;
    const pr = this.renderer.getPixelRatio() * this.quality.deepSkyScale;
    this.hdrTarget.setSize(Math.max(1, Math.floor(width * pr)), Math.max(1, Math.floor(height * pr)));
    this.glowTarget.setSize(Math.max(1, Math.floor(width * pr * GLOW_SCALE)), Math.max(1, Math.floor(height * pr * GLOW_SCALE)));
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    const loop = () => {
      if (!this.running) return;
      requestAnimationFrame(loop);
      const now = performance.now();
      // Frame cap: the quality's rate while moving, a much lower one while idle
      const cap = this.idle ? this.quality.idleFps : this.quality.fps;
      if (cap > 0 && now - this.lastTime < 1000 / cap - 2) return;
      const dt = Math.min(0.1, (now - this.lastTime) / 1000);
      this.lastTime = now;
      if (this.paused) return;
      for (const cb of this.callbacks) cb(dt, now / 1000);
      this.render(now / 1000);
      this.frames++;
      if (now - this.fpsWindowStart >= 1000) {
        this.fps = Math.round((this.frames * 1000) / (now - this.fpsWindowStart));
        this.frames = 0;
        this.fpsWindowStart = now;
      }
    };
    requestAnimationFrame(loop);
  }

  private render(time: number) {
    const renderer = this.renderer;
    const camera = this.camera;
    camera.updateMatrixWorld();

    // 1. Deep sky (light years)
    camera.near = 1e-7;
    camera.far = 1e8;
    camera.updateProjectionMatrix();
    renderer.setClearColor(0x000000, 1);
    camera.layers.set(GLOW_LAYER);
    renderer.setRenderTarget(this.glowTarget);
    renderer.clear(true, true, true);
    renderer.render(this.deepScene, camera);
    camera.layers.set(0);
    renderer.setRenderTarget(this.hdrTarget);
    renderer.clear(true, true, true);
    renderer.render(this.deepScene, camera);

    // 2. Tonemap (+ warp)
    renderer.setRenderTarget(null);
    renderer.clear(true, true, true);
    const u = this.tonemapMaterial.uniforms;
    u.uExposure.value = this.exposure;
    u.uTime.value = time % 1000;
    u.uWarp.value = this.warp;
    u.uAspect.value = camera.aspect;
    renderer.render(this.tonemapScene, this.tonemapCamera);

    // 3. Star system (astronomical units)
    if (this.nearSceneVisible) {
      camera.near = this.nearRange[0];
      camera.far = this.nearRange[1];
      camera.updateProjectionMatrix();
      renderer.clearDepth();
      renderer.render(this.nearScene, camera);
    }

    // 4. Planets (planet radii)
    for (const pass of this.planetPasses) {
      pass.camera.aspect = camera.aspect;
      pass.camera.fov = camera.fov;
      pass.camera.updateProjectionMatrix();
      renderer.clearDepth();
      renderer.render(pass.scene, pass.camera);
    }

    // 5. Hyperjump: copy the finished frame and draw it back through the wormhole
    if (this.jump.active) this.renderWormhole(time);

    // 6. Ship seen from the chase camera, on top of everything
    if (this.shipPass) {
      renderer.clearDepth();
      renderer.render(this.shipPass.scene, this.shipPass.camera);
    }
  }

  // The frame as it is now, without the ship in front of the camera, at the screen's own
  // resolution: the quality presets may draw below it (phones above all), so this one
  // frame is drawn at the device's pixel ratio and the canvas goes back right after.
  // Drawn and copied in the same task, before the browser clears the drawing buffer
  snapshot(pixelRatio = Math.min(window.devicePixelRatio || 1, 3)): HTMLCanvasElement {
    const ship = this.shipPass;
    const previous = this.renderer.getPixelRatio();
    const sharper = pixelRatio > previous + 0.01;
    this.shipPass = null;
    const source = this.renderer.domElement;
    const copy = document.createElement("canvas");
    try {
      if (sharper) {
        this.renderer.setPixelRatio(pixelRatio);
        this.resize();
      }
      this.render(performance.now() / 1000);
      copy.width = source.width;
      copy.height = source.height;
      copy.getContext("2d")!.drawImage(source, 0, 0);
    } finally {
      this.shipPass = ship;
      if (sharper) {
        this.renderer.setPixelRatio(previous);
        this.resize();
        // Resizing cleared the canvas: draw the frame again so the screen never blinks
        this.render(performance.now() / 1000);
      }
    }
    return copy;
  }

  private renderWormhole(time: number) {
    const renderer = this.renderer;
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    if (!this.frameCopy || this.frameCopy.image.width !== size.x || this.frameCopy.image.height !== size.y) {
      this.frameCopy?.dispose();
      this.frameCopy = new THREE.FramebufferTexture(size.x, size.y);
      this.frameCopy.minFilter = this.frameCopy.magFilter = THREE.LinearFilter;
    }
    renderer.copyFramebufferToTexture(this.frameCopy);
    const u = this.wormholeMaterial.uniforms;
    u.tFrame.value = this.frameCopy;
    u.uTime.value = time % 1000;
    u.uAspect.value = this.camera.aspect;
    u.uMouth.value = this.jump.mouth;
    u.uExit.value = this.jump.exit;
    u.uCharge.value = this.jump.charge;
    u.uFlash.value = this.jump.flash;
    u.uCalm.value = this.calm ? 1 : 0;
    renderer.render(this.wormholeScene, this.tonemapCamera);
  }

  // Screen (client px) -> world direction in camera space
  rayDirection(clientX: number, clientY: number, out: THREE.Vector3): THREE.Vector3 {
    const rect = this.renderer.domElement.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((clientY - rect.top) / rect.height) * 2 + 1;
    return out.set(x, y, 0.5).unproject(this.camera).normalize();
  }

  // Camera-relative position -> client px (null when behind the camera)
  project(relative: THREE.Vector3, out: { x: number; y: number }): { x: number; y: number } | null {
    const v = relative.clone().applyMatrix4(this.camera.matrixWorldInverse);
    if (v.z >= 0) return null;
    v.applyMatrix4(this.camera.projectionMatrix);
    const rect = this.renderer.domElement.getBoundingClientRect();
    out.x = rect.left + ((v.x + 1) / 2) * rect.width;
    out.y = rect.top + ((1 - v.y) / 2) * rect.height;
    return out;
  }

  dispose() {
    this.running = false;
    this.resizeObserver.disconnect();
    this.hdrTarget.dispose();
    this.glowTarget.dispose();
    this.tonemapMaterial.dispose();
    this.wormholeMaterial.dispose();
    this.frameCopy?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
