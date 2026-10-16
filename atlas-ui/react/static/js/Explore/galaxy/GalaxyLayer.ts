// atlas-ui/react/static/js/Explore/galaxy/GalaxyLayer.ts
//
// Renders the LOD produced by galaxy.worker: soft glow for unresolved regions and real,
// pickable systems as points. Positions arrive relative to the origin used for the LOD
// request; every frame the layer is moved to (origin - camera) in float64.

import * as THREE from "three";
import type { GalaxyInfo, PointOfInterest } from "./GalaxyModel.ts";
import type { LodResult } from "./GalaxyLod.ts";
import { STAR_ANCESTORS, STAR_TYPE_COLORS } from "./GalaxyLod.ts";
import type { WorkerRequest, WorkerResponse } from "./galaxy.worker.ts";
import { GLOW_LAYER } from "../engine/Engine.ts";

// Angular radius (radians) over which a glow sprite fades out as the camera nears it
const GLOW_FADE_FROM = 0.06;
const GLOW_FADE_TO = 0.17;

const GLOW_VERTEX = /* glsl */ `
  #define GLOW_FADE_FROM ${GLOW_FADE_FROM.toFixed(3)}
  #define GLOW_FADE_TO ${GLOW_FADE_TO.toFixed(3)}
  attribute vec3 iPos;
  attribute float iSize;
  attribute vec3 iColor;
  attribute float iWeight;
  uniform float uGain;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vIntensity;

  void main() {
    vec4 mv = modelViewMatrix * vec4(iPos, 1.0);
    float dist = length(mv.xyz);
    // Sprites overlap generously so the octree grid never shows through
    float radius = iSize * 1.5;
    // Regions the camera is inside of are already resolved into stars, and sprites
    // spanning a large angle would wrap the view in haze and cost huge overdraw (deep in
    // a bulge, thousands of them stack): fade both out
    float angular = radius / max(dist, 1e-6);
    float nearFade = smoothstep(iSize * 1.5, iSize * 6.0, dist) * (1.0 - smoothstep(GLOW_FADE_FROM, GLOW_FADE_TO, angular));
    if (nearFade <= 0.0) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      return;
    }
    // Surface brightness (systems per unit area) does not depend on distance;
    // dividing by the sprite area keeps it independent of the overlap factor too
    vIntensity = iWeight / (radius * radius) * uGain * nearFade * uOpacity;
    vColor = iColor;
    vUv = position.xy * 2.0;
    mv.xy += position.xy * radius * 2.0;
    gl_Position = projectionMatrix * mv;
  }
`;

const GLOW_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vIntensity;

  void main() {
    float r2 = dot(vUv, vUv);
    if (r2 > 1.0) discard;
    float falloff = exp(-r2 * 3.0) - 0.0498;
    gl_FragColor = vec4(vColor * vIntensity * falloff, 1.0);
  }
`;

const STAR_VERTEX = /* glsl */ `
  attribute vec3 color;
  attribute float lum;
  attribute float weight;
  // Morph from the previous LOD: a point that was already on screen (same system) slides
  // from where and how bright it was; new points fade in, retired ones are drawn by the
  // new LOD instead
  attribute vec3 prevPosition;
  attribute float prevWeight;
  attribute float prevAlpha;
  attribute float matched;
  attribute float retired;
  uniform float uMorph;
  uniform float uPixelRatio;
  uniform float uOpacity;
  // Sparse galaxies (a few hundred systems) would be invisible from afar: lift them
  uniform float uFluxScale;
  uniform vec3 uHidePos;
  uniform float uHideRadius;
  uniform float uHideAmount;
  uniform vec3 uHighlightPos;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vCore;

  void main() {
    if (retired > 0.5) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      return;
    }
    vec3 p = matched > 0.5 ? mix(prevPosition, position, uMorph) : position;
    float w = matched > 0.5 ? exp(mix(log(prevWeight), log(weight), uMorph)) : weight;
    float appear = matched > 0.5 ? mix(prevAlpha, 1.0, uMorph) : uMorph;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float d = max(length(mv.xyz), 1e-9);
    // Apparent brightness from the light of every system the point stands for
    float flux = lum * w * uFluxScale / (d * d);
    float m = clamp((log(flux) / 2.302585 + 7.5) / 7.0, 0.0, 1.0);
    float size = mix(1.2, 5.0, m * m * m);
    // Very close stars (a light year or less) bloom into a glare. Only the light of one
    // star counts here: a point standing for a whole region must not bloom
    float single = lum * uFluxScale / (d * d);
    float glare = clamp(log(single) / 2.302585 + 0.5, 0.0, 3.5);
    size += glare * 6.0;
    // Faint points (sparse halo regions seen from afar) fade out instead of speckling
    vAlpha = smoothstep(0.1, 0.75, m) * appear * uOpacity;
    vCore = glare / 3.5;
    vColor = color;

    if (uHideRadius > 0.0 && distance(p, uHidePos) < uHideRadius) {
      // The star system drawn up close takes over from this point as we approach
      if (uHideAmount >= 0.999) {
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        gl_PointSize = 0.0;
        return;
      }
      vAlpha *= 1.0 - uHideAmount;
    }
    if (distance(position, uHighlightPos) < 1e-5) {
      size = max(size, 9.0);
      vAlpha = max(vAlpha, 0.9);
    }
    gl_PointSize = size * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`;

const STAR_FRAGMENT = /* glsl */ `
  // Compensates eye adaptation so stars stay crisp inside bright regions
  uniform float uStarBoost;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vCore;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c) * 2.0;
    if (r > 1.0) discard;
    float core = exp(-r * r * 10.0);
    float halo = exp(-r * 4.0) * 0.35;
    vec3 tint = mix(vColor, vec3(1.0), core * 0.6 + vCore * 0.4);
    gl_FragColor = vec4(tint * (core + halo) * vAlpha * 2.2 * uStarBoost, 1.0);
  }
`;

function spawnGalaxyWorker(): Worker {
  if (new URL(import.meta.url).origin !== window.location.origin) {
    // DEV: pages come from Flask but modules from the Vite server, and workers must be
    // same-origin. A blob worker can still import the cross-origin module (CORS).
    // The path is concatenated so Vite does not emit the raw .ts file as an asset.
    const moduleUrl = new URL("./galaxy" + ".worker.ts", import.meta.url).href;
    const bootstrap = new Blob([`import ${JSON.stringify(moduleUrl)};`], { type: "text/javascript" });
    return new Worker(URL.createObjectURL(bootstrap), { type: "module" });
  }
  return new Worker(new URL("./galaxy.worker.ts", import.meta.url), { type: "module" });
}

interface LodBuffers {
  result: LodResult;
  origin: THREE.Vector3;
  group: THREE.Group;
  glowMaterial: THREE.ShaderMaterial;
  starMaterial: THREE.ShaderMaterial;
  morph: number; // 0..1, arriving from the previous LOD
  fade: number; // 1..0 once replaced by a newer LOD
  retiring: boolean;
  colorAttribute: THREE.BufferAttribute;
  indexToSlot: Map<number, number>;
  prevPositions: Float32Array;
  prevWeights: Float32Array;
  prevAlphas: Float32Array;
  matched: Float32Array;
  retired: Float32Array;
  retiredAttribute: THREE.BufferAttribute;
}

// Seconds for a new LOD to take over from the previous one
const MORPH_SECONDS = 0.45;
const ease = (t: number) => t * t * (3 - 2 * t);

export interface PickedStar {
  index: number;
  position: THREE.Vector3; // galaxy frame, float64 (approximate for unresolved points)
  exact: boolean;
  screen: { x: number; y: number };
  apparent: number;
}

export interface GalaxyLayerEvents {
  onReady?: (pois: PointOfInterest[], radius: number) => void;
  onLod?: (result: LodResult, coarse: boolean) => void;
}

export class GalaxyLayer {
  readonly info: GalaxyInfo;
  readonly root = new THREE.Group();
  radius = 50000;
  pois: PointOfInterest[] = [];

  private worker: Worker;
  private current: LodBuffers | null = null;
  private fading: LodBuffers[] = [];
  private requestId = 0;
  private inFlight = false;
  private lastRequestCamera = new THREE.Vector3(Infinity, 0, 0);
  private lastRequestForward = new THREE.Vector3();
  private lastRequestTime = 0;
  private callbacks = new Map<number, (value: any) => void>();
  private events: GalaxyLayerEvents;
  private ready = false;
  private glowGain = 1;
  private hidePosition: THREE.Vector3 | null = null;
  private hideAmount = 1;
  private highlightPosition: THREE.Vector3 | null = null;
  private realStarTypes = new Map<number, string>();
  numSystems: number;
  private fluxScale: number;

  // LOD budget, from the quality profile
  budget = { maxNodes: 36000, maxStars: 45000, splitAngle: 0.018 };

  // A new budget only takes effect with the next LOD; force one right away
  setBudget(budget: { maxNodes: number; maxStars: number; splitAngle: number }) {
    this.budget = budget;
    this.lastRequestTime = 0;
    this.lastRequestCamera.set(Infinity, 0, 0);
  }

  constructor(info: GalaxyInfo, events: GalaxyLayerEvents = {}) {
    this.info = info;
    this.events = events;
    this.numSystems = info.num_systems;
    this.fluxScale = Math.max(1, Math.sqrt(1e9 / Math.max(1, info.num_systems)));
    this.worker = spawnGalaxyWorker();
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => this.handle(event.data);
    this.post({ type: "init", info });
  }

  private post(message: WorkerRequest) {
    this.worker.postMessage(message);
  }

  private handle(message: WorkerResponse) {
    switch (message.type) {
      case "ready": {
        this.ready = true;
        this.pois = message.pois;
        this.radius = message.radius;
        // Normalise glow so an average patch of the disk sits mid-way in the tonemap
        const meanColumn = Math.max(this.numSystems, 1) / (Math.PI * this.radius * this.radius);
        this.glowGain = 0.32 / meanColumn;
        this.events.onReady?.(message.pois, message.radius);
        break;
      }
      case "lod":
        if (!message.coarse) this.inFlight = false;
        this.install(message.result);
        this.events.onLod?.(message.result, message.coarse);
        break;
      case "located":
      case "leaf": {
        const cb = this.callbacks.get(message.id);
        if (cb) {
          this.callbacks.delete(message.id);
          cb(message.type === "located" ? message.position : message.indices);
        }
        break;
      }
    }
  }

  locate(index: number): Promise<THREE.Vector3> {
    const id = ++this.requestId;
    return new Promise((resolve) => {
      this.callbacks.set(id, (p: [number, number, number]) => resolve(new THREE.Vector3(p[0], p[1], p[2])));
      this.post({ type: "locate", id, index });
    });
  }

  systemsAt(position: THREE.Vector3): Promise<number[]> {
    const id = ++this.requestId;
    return new Promise((resolve) => {
      this.callbacks.set(id, resolve);
      this.post({ type: "leaf", id, position: [position.x, position.y, position.z], numSystems: this.numSystems });
    });
  }

  // Asks the worker for a new LOD when the camera moved or turned enough.
  maybeRequest(camera: THREE.Vector3, forward: THREE.Vector3, focusDistance: number, fovY: number, aspect: number, viewportHeight: number, force = false) {
    if (!this.ready || this.inFlight) return;
    const now = performance.now();
    const moved = camera.distanceTo(this.lastRequestCamera);
    const turned = forward.angleTo(this.lastRequestForward);
    const threshold = Math.max(focusDistance, 1e-4) * 0.12;
    if (!force && moved < threshold && turned < 0.2 && this.lastRequestTime > 0) return;
    if (!force && now - this.lastRequestTime < 90) return;

    this.inFlight = true;
    this.lastRequestTime = now;
    this.lastRequestCamera.copy(camera);
    this.lastRequestForward.copy(forward);
    this.post({
      type: "lod",
      request: {
        id: ++this.requestId,
        camera: [camera.x, camera.y, camera.z],
        forward: [forward.x, forward.y, forward.z],
        fovY,
        aspect,
        viewportHeight,
        numSystems: this.numSystems,
        origin: [camera.x, camera.y, camera.z],
        maxNodes: this.budget.maxNodes,
        maxStars: this.budget.maxStars,
        splitAngle: this.budget.splitAngle,
      },
    });
  }

  // Eye adaptation: splat the glow layer onto a coarse screen grid exactly as the GPU
  // accumulates it (sprites stack along the line of sight in spheroidal galaxies) and
  // expose for the brighter part of the frame, so a compact galaxy on black sky is not
  // burnt out and the inside of a bulge is not a white wall.
  measureExposure(camera: THREE.Vector3, threeCamera: THREE.PerspectiveCamera) {
    const cur = this.current;
    if (!cur) return;
    const r = cur.result;
    const W = 48;
    const H = 30;
    const grid = this.brightnessGrid;
    grid.fill(0);
    const view = threeCamera.matrixWorldInverse.elements;
    const proj = threeCamera.projectionMatrix.elements;
    const ox = cur.origin.x - camera.x;
    const oy = cur.origin.y - camera.y;
    const oz = cur.origin.z - camera.z;
    const cellAngle = (2 / proj[5] / H) * 1.0; // radians per grid row (tan approximation)

    for (let i = 0; i < r.glowCount; i++) {
      const x = r.glowPositions[i * 3] + ox;
      const y = r.glowPositions[i * 3 + 1] + oy;
      const z = r.glowPositions[i * 3 + 2] + oz;
      const vz = view[2] * x + view[6] * y + view[10] * z;
      if (vz >= 0) continue;
      const dist = Math.sqrt(x * x + y * y + z * z);
      const size = r.glowSizes[i];
      const radius = size * 1.5;
      const angular = radius / dist;
      const fade = (1 - THREE.MathUtils.smoothstep(angular, GLOW_FADE_FROM, GLOW_FADE_TO)) * THREE.MathUtils.smoothstep(dist, size * 1.5, size * 6);
      if (fade <= 0) continue;
      const vx = view[0] * x + view[4] * y + view[8] * z;
      const vy = view[1] * x + view[5] * y + view[9] * z;
      const gx = ((proj[0] * vx) / -vz + 1) * 0.5 * W;
      const gy = ((proj[5] * vy) / -vz + 1) * 0.5 * H;
      const intensity = (r.glowWeights[i] / (radius * radius)) * this.glowGain * fade;
      const cells = Math.max(0.5, angular / cellAngle);
      // Mean value of the sprite falloff over its footprint, spread over the cells it covers
      const perCell = (intensity * 0.267 * Math.PI * cells * cells) / Math.max(1, Math.PI * cells * cells);
      const x0 = Math.max(0, Math.floor(gx - cells));
      const x1 = Math.min(W - 1, Math.floor(gx + cells));
      const y0 = Math.max(0, Math.floor(gy - cells));
      const y1 = Math.min(H - 1, Math.floor(gy + cells));
      for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) grid[cy * W + cx] += perCell;
    }

    // Median brightness of the lit part of the frame (cells above 1% of the peak)
    let peak = 0;
    for (let i = 0; i < grid.length; i++) peak = Math.max(peak, grid[i]);
    const lit = Array.from(grid)
      .filter((v) => v > peak * 0.01)
      .sort((a, b) => a - b);
    const median = lit.length ? lit[Math.floor(lit.length / 2)] : 0;
    this.targetExposure = THREE.MathUtils.clamp(0.35 / Math.max(median, 1e-6), 0.01, 1.6);
  }

  targetExposure = 1;
  private brightnessGrid = new Float32Array(48 * 30);

  private install(result: LodResult) {
    const group = new THREE.Group();
    const origin = new THREE.Vector3(...result.origin);

    const quad = new THREE.PlaneGeometry(1, 1);
    const glowGeometry = new THREE.InstancedBufferGeometry();
    glowGeometry.index = quad.index;
    glowGeometry.setAttribute("position", quad.getAttribute("position"));
    glowGeometry.setAttribute("iPos", new THREE.InstancedBufferAttribute(result.glowPositions, 3));
    glowGeometry.setAttribute("iSize", new THREE.InstancedBufferAttribute(result.glowSizes, 1));
    glowGeometry.setAttribute("iColor", new THREE.InstancedBufferAttribute(result.glowColors, 3));
    glowGeometry.setAttribute("iWeight", new THREE.InstancedBufferAttribute(result.glowWeights, 1));
    glowGeometry.instanceCount = result.glowCount;
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: { uGain: { value: this.glowGain }, uOpacity: { value: 0 } },
      vertexShader: GLOW_VERTEX,
      fragmentShader: GLOW_FRAGMENT,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    glow.frustumCulled = false;
    glow.layers.set(GLOW_LAYER);
    group.add(glow);

    // Apply star types already known from the server
    const indexToSlot = new Map<number, number>();
    for (let i = 0; i < result.starCount; i++) {
      const index = result.starIndices[i];
      indexToSlot.set(index, i);
      const known = this.realStarTypes.get(index);
      if (known) this.writeStarColor(result.starColors, i, known);
    }

    const starGeometry = new THREE.BufferGeometry();
    starGeometry.setAttribute("position", new THREE.BufferAttribute(result.starPositions, 3));
    const colorAttribute = new THREE.BufferAttribute(result.starColors, 3);
    starGeometry.setAttribute("color", colorAttribute);
    starGeometry.setAttribute("lum", new THREE.BufferAttribute(result.starSizes, 1));
    starGeometry.setAttribute("weight", new THREE.BufferAttribute(result.starWeights, 1));

    // The same system in the LOD on screen: start from where it is drawn now. An
    // unresolved point stands for a whole region and sits at an approximate spot, so
    // across LODs it moves and changes weight; sliding it (instead of fading one point
    // out and another in) keeps every star continuous while the view refines
    const n = result.starCount;
    const prevPositions = new Float32Array(n * 3);
    const prevWeights = new Float32Array(n).fill(1);
    const prevAlphas = new Float32Array(n);
    const matched = new Float32Array(n);
    const retired = new Float32Array(n);
    const prev = this.current;
    if (prev) {
      const m = ease(prev.morph);
      const pr = prev.result;
      const dx = prev.origin.x - origin.x;
      const dy = prev.origin.y - origin.y;
      const dz = prev.origin.z - origin.z;
      // Where (in the new LOD's frame) a point of the previous LOD is drawn right now
      const shownAt = (slot: number, i: number) => {
        const was = prev.matched[slot] > 0;
        for (let k = 0; k < 3; k++) {
          const to = pr.starPositions[slot * 3 + k];
          prevPositions[i * 3 + k] = (was ? prev.prevPositions[slot * 3 + k] + (to - prev.prevPositions[slot * 3 + k]) * m : to) + (k === 0 ? dx : k === 1 ? dy : dz);
        }
      };
      const taken = new Uint8Array(pr.starCount);
      for (let i = 0; i < n; i++) {
        const slot = prev.indexToSlot.get(result.starIndices[i]);
        if (slot === undefined || prev.retired[slot]) continue;
        const was = prev.matched[slot] > 0;
        shownAt(slot, i);
        prevWeights[i] = was ? Math.exp(Math.log(prev.prevWeights[slot]) + (Math.log(pr.starWeights[slot]) - Math.log(prev.prevWeights[slot])) * m) : pr.starWeights[slot];
        prevAlphas[i] = was ? prev.prevAlphas[slot] + (1 - prev.prevAlphas[slot]) * m : m;
        matched[i] = 1;
        taken[slot] = 1;
      }
      // Points new to this LOD split off from the coarser point that stood for their
      // region: they start there, unlit, and move out to their own place
      for (let i = 0; i < n; i++) {
        if (matched[i]) continue;
        for (let k = 0; k < STAR_ANCESTORS; k++) {
          const ancestor = result.starAncestors[i * STAR_ANCESTORS + k];
          if (ancestor < 0) break;
          const slot = prev.indexToSlot.get(ancestor);
          if (slot === undefined || prev.retired[slot]) continue;
          shownAt(slot, i);
          prevWeights[i] = result.starWeights[i];
          prevAlphas[i] = 0;
          matched[i] = 1;
          break;
        }
      }
      // Drawn by the new LOD from now on
      for (let slot = 0; slot < pr.starCount; slot++) if (taken[slot]) prev.retired[slot] = 1;
      prev.retiredAttribute.needsUpdate = true;
    }
    starGeometry.setAttribute("prevPosition", new THREE.BufferAttribute(prevPositions, 3));
    starGeometry.setAttribute("prevWeight", new THREE.BufferAttribute(prevWeights, 1));
    starGeometry.setAttribute("prevAlpha", new THREE.BufferAttribute(prevAlphas, 1));
    starGeometry.setAttribute("matched", new THREE.BufferAttribute(matched, 1));
    const retiredAttribute = new THREE.BufferAttribute(retired, 1);
    starGeometry.setAttribute("retired", retiredAttribute);

    const starMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uMorph: { value: 0 },
        uPixelRatio: { value: 1 },
        uOpacity: { value: 1 },
        uStarBoost: { value: 1 },
        uFluxScale: { value: this.fluxScale },
        uHidePos: { value: new THREE.Vector3() },
        uHideRadius: { value: 0 },
        uHideAmount: { value: 1 },
        uHighlightPos: { value: new THREE.Vector3(1e9, 1e9, 1e9) },
      },
      vertexShader: STAR_VERTEX,
      fragmentShader: STAR_FRAGMENT,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    stars.frustumCulled = false;
    group.add(stars);

    if (prev) {
      prev.retiring = true;
      this.fading.push(prev);
    }
    this.current = {
      result,
      origin,
      group,
      glowMaterial,
      starMaterial,
      morph: 0,
      fade: 1,
      retiring: false,
      colorAttribute,
      indexToSlot,
      prevPositions,
      prevWeights,
      prevAlphas,
      matched,
      retired,
      retiredAttribute,
    };
    this.root.add(group);
  }

  private writeStarColor(colors: Float32Array, slot: number, type: string) {
    const c = STAR_TYPE_COLORS[type];
    if (!c) return;
    colors[slot * 3] = c[0];
    colors[slot * 3 + 1] = c[1];
    colors[slot * 3 + 2] = c[2];
  }

  // Replace the placeholder color with the star type generated by the server
  setRealStarType(index: number, type: string) {
    this.realStarTypes.set(index, type);
    const cur = this.current;
    if (!cur) return;
    const slot = cur.indexToSlot.get(index);
    if (slot === undefined) return;
    this.writeStarColor(cur.result.starColors, slot, type);
    cur.colorAttribute.needsUpdate = true;
  }

  // `amount` fades the point out gradually (1 = fully hidden)
  setHidden(position: THREE.Vector3 | null, amount = 1) {
    this.hidePosition = position ? position.clone() : null;
    this.hideAmount = amount;
  }

  setHighlight(position: THREE.Vector3 | null) {
    this.highlightPosition = position ? position.clone() : null;
  }

  // The highlight off for the next frame drawn (a clean photo); update() puts it back
  hideHighlightOnce() {
    for (const buffers of this.current ? [...this.fading, this.current] : this.fading) buffers.starMaterial.uniforms.uHighlightPos.value.set(1e9, 1e9, 1e9);
  }

  update(dt: number, camera: THREE.Vector3, pixelRatio: number, exposure = 1) {
    const all = this.current ? [...this.fading, this.current] : this.fading;
    const starBoost = Math.min(5, Math.pow(1 / Math.max(exposure, 1e-3), 0.6));
    for (const buffers of all) {
      buffers.starMaterial.uniforms.uStarBoost.value = starBoost;
      // The newest LOD morphs in; the ones it replaced fade what it did not take over
      if (buffers.retiring) buffers.fade = Math.max(0, buffers.fade - dt / MORPH_SECONDS);
      else buffers.morph = Math.min(1, buffers.morph + dt / MORPH_SECONDS);
      const morph = ease(buffers.morph);
      const fade = ease(buffers.fade);
      buffers.group.position.set(buffers.origin.x - camera.x, buffers.origin.y - camera.y, buffers.origin.z - camera.z);
      buffers.glowMaterial.uniforms.uOpacity.value = morph * fade;
      buffers.starMaterial.uniforms.uMorph.value = morph;
      buffers.starMaterial.uniforms.uOpacity.value = fade;
      buffers.starMaterial.uniforms.uPixelRatio.value = pixelRatio;
      if (this.hidePosition) {
        buffers.starMaterial.uniforms.uHidePos.value.copy(this.hidePosition).sub(buffers.origin);
        buffers.starMaterial.uniforms.uHideRadius.value = 2e-3;
        buffers.starMaterial.uniforms.uHideAmount.value = this.hideAmount;
      } else {
        buffers.starMaterial.uniforms.uHideRadius.value = 0;
      }
      if (this.highlightPosition) buffers.starMaterial.uniforms.uHighlightPos.value.copy(this.highlightPosition).sub(buffers.origin);
      else buffers.starMaterial.uniforms.uHighlightPos.value.set(1e9, 1e9, 1e9);
    }
    this.fading = this.fading.filter((buffers) => {
      if (buffers.fade > 0) return true;
      this.root.remove(buffers.group);
      buffers.group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        (mesh.material as THREE.Material)?.dispose?.();
      });
      return false;
    });
  }

  // Screen-space pick of the brightest star near the cursor.
  pick(clientX: number, clientY: number, camera: THREE.Vector3, threeCamera: THREE.PerspectiveCamera, canvas: HTMLCanvasElement, radiusPx = 14): PickedStar | null {
    const cur = this.current;
    if (!cur) return null;
    const rect = canvas.getBoundingClientRect();
    const r = cur.result;
    const view = threeCamera.matrixWorldInverse.elements;
    const proj = threeCamera.projectionMatrix.elements;
    const ox = cur.origin.x - camera.x;
    const oy = cur.origin.y - camera.y;
    const oz = cur.origin.z - camera.z;
    let best = -1;
    let bestScore = -Infinity;
    let bestScreen = { x: 0, y: 0 };
    let bestApparent = 0;

    for (let i = 0; i < r.starCount; i++) {
      const x = r.starPositions[i * 3] + ox;
      const y = r.starPositions[i * 3 + 1] + oy;
      const z = r.starPositions[i * 3 + 2] + oz;
      // view space (camera at origin, so only rotation)
      const vx = view[0] * x + view[4] * y + view[8] * z;
      const vy = view[1] * x + view[5] * y + view[9] * z;
      const vz = view[2] * x + view[6] * y + view[10] * z;
      if (vz >= 0) continue;
      const sx = rect.left + ((proj[0] * vx) / -vz + 1) * 0.5 * rect.width;
      const sy = rect.top + (1 - ((proj[5] * vy) / -vz + 1) * 0.5) * rect.height;
      const dx = sx - clientX;
      const dy = sy - clientY;
      const d2 = dx * dx + dy * dy;
      if (d2 > radiusPx * radiusPx) continue;
      const dist = Math.sqrt(x * x + y * y + z * z);
      const flux = (r.starSizes[i] * r.starWeights[i] * this.fluxScale) / (dist * dist);
      const apparent = Math.min(1, Math.max(0, (Math.log10(flux) + 7.5) / 7));
      if (apparent < 0.12) continue; // invisible on screen, not pickable either
      const score = apparent * 2 - Math.sqrt(d2) / radiusPx;
      if (score > bestScore) {
        bestScore = score;
        best = i;
        bestScreen = { x: sx, y: sy };
        bestApparent = apparent;
      }
    }
    if (best < 0) return null;
    return {
      index: r.starIndices[best],
      position: new THREE.Vector3(r.starPositions[best * 3] + cur.origin.x, r.starPositions[best * 3 + 1] + cur.origin.y, r.starPositions[best * 3 + 2] + cur.origin.z),
      exact: r.starExact[best] === 1,
      screen: bestScreen,
      apparent: bestApparent,
    };
  }

  // Brightest resolved systems currently on screen (for labels and server lookups).
  visibleStars(camera: THREE.Vector3, limit: number, maxDistance: number): Array<{ index: number; position: THREE.Vector3; distance: number }> {
    const cur = this.current;
    if (!cur) return [];
    const r = cur.result;
    const out: Array<{ index: number; position: THREE.Vector3; distance: number }> = [];
    for (let i = 0; i < r.starCount; i++) {
      if (r.starWeights[i] !== 1) continue;
      const x = r.starPositions[i * 3] + cur.origin.x;
      const y = r.starPositions[i * 3 + 1] + cur.origin.y;
      const z = r.starPositions[i * 3 + 2] + cur.origin.z;
      const distance = Math.hypot(x - camera.x, y - camera.y, z - camera.z);
      if (distance > maxDistance) continue;
      out.push({ index: r.starIndices[i], position: new THREE.Vector3(x, y, z), distance });
    }
    out.sort((a, b) => a.distance - b.distance);
    return out.slice(0, limit);
  }

  dispose() {
    this.worker.terminate();
    for (const buffers of [...this.fading, ...(this.current ? [this.current] : [])]) {
      buffers.group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        (mesh.material as THREE.Material)?.dispose?.();
      });
    }
    this.root.clear();
  }
}
