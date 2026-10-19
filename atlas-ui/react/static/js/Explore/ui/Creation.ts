// atlas-ui/react/static/js/Explore/ui/Creation.ts
//
// The birth of a universe, played while the server creates it (onboarding), told the
// way the Primordial 4D Torus Hypothesis tells it (González Medina, Zenodo
// 10.5281/zenodo.18136117), and from there the way cosmology does:
//
//   before time      the primordial torus (K² × T²): no time yet, only closed loops.
//                    Energy circulates in counter-rotating pairs (+ε, −ε) that always
//                    sum to zero (G₀ = 0), and every pass through the Klein twist turns
//                    a quantum into its mirror. Held while the server works
//   saturation       energy stays at zero but entanglement entropy piles up with each
//                    cycle (S ∝ log n) until it reaches the Bekenstein-Hawking limit:
//                    the loops quicken and the torus trembles
//   signature change the torus pinches through its throat to the vertex of a double
//                    cone (det g → 0), Euclidean turning Lorentzian
//   the Big Bang     not an explosion of energy (which stays zero) but an information
//                    discharge: a flash at the vertex
//   two universes    the hourglass unfolds both ways: matter (M₊) into one cone,
//                    antimatter (M₋) into the other. The mirror falls away, causally
//                    disconnected, and the camera follows ours
//   inflation …      then as cosmology tells it: a sphere of light swells until it is
//                    all there is, the hot plasma cools along a blackbody, recombination
//                    shows the cosmic microwave background, the dark ages, and the gas
//                    falls into the cosmic web where galaxies ignite
//
// A few of the paper's equations drift faintly through each act. Everything is
// particles (the torus, the gas and the galaxies it becomes), text sprites and one post
// pass (the flash, the shockwave, the plasma's glow, inflation, the fade).

import * as THREE from "three";
import { gaussian, POINT_FRAGMENT, primordial, rng, torusGeometry, torusMaterial } from "../core/torus.ts";

export type CreationKind = "core" | "custom";

export interface CreationEpoch {
  // Which act it is (for the score, see Explore/audio/Genesis)
  cue: "prelude" | "saturation" | "signature" | "bang" | "twins" | "inflation" | "nuclei" | "recombination" | "dark" | "stars" | "galaxies" | "created";
  at: number;
  time: string;
  title: string;
  temperature: string;
  formula: string;
  // Real cosmic time, for the logarithmic timeline (after the transition surface)
  seconds: number;
  // Before it: where on the Euclidean stretch of the timeline (0 to 1, τ < 0 to τ = 0)
  tau?: number;
}

// Before the server has answered: the primordial torus, for as long as it takes
export const CREATION_PRELUDE: CreationEpoch = {
  cue: "prelude",
  at: -1,
  time: "τ < 0",
  title: "Before time · the primordial torus",
  temperature: "",
  formula: "K² × T²  ·  G₀ = Σ [(+εₖ) + (−εₖ)] = 0",
  seconds: 0,
  tau: 0.3,
};

// The acts, in seconds after the torus begins to saturate (once the universe exists),
// with the cosmic time, the temperature of the universe then, and the equation of each
export const CREATION_EPOCHS: CreationEpoch[] = [
  { cue: "saturation", at: 0, time: "log n → 10¹²³", title: "Information saturation", temperature: "", formula: "Sₑₙₜ(n) = S₀ · log n  →  Sₘₐₓ = A / 4ℓₚ²", seconds: 0, tau: 0.62 },
  { cue: "signature", at: 1.5, time: "τ → 0", title: "Signature change", temperature: "", formula: "det(gμν)|Σ = 0  ·  (+,+,+,+) → (−,+,+,+)", seconds: 0, tau: 0.92 },
  { cue: "bang", at: 2.4, time: "t₊ = t₋ = 0", title: "The Big Bang · an information discharge", temperature: "10³² K", formula: "ΣE = 0 before and after  ·  Sₑₙₜ → Sₘₐₓ − Sₜₒₚ", seconds: 1e-43 },
  { cue: "twins", at: 3.2, time: "t = 10⁻⁴³ s", title: "Two universes · matter and its mirror", temperature: "10³² K", formula: "V(Φ) = λ/4 (Φ² − v²)²  ·  Φ → ±v", seconds: 2e-43 },
  { cue: "inflation", at: 4.6, time: "t = 10⁻³² s", title: "Inflation", temperature: "10²⁸ K", formula: "ds² = −dt² + a(t)² dΩ₃²", seconds: 1e-32 },
  { cue: "nuclei", at: 6.3, time: "t = 3 minutes", title: "The first nuclei", temperature: "10⁹ K", formula: "η ≈ 6 × 10⁻¹⁰  ·  its antimatter went to the mirror", seconds: 180 },
  { cue: "recombination", at: 7.45, time: "t = 380,000 years", title: "Recombination · light breaks free", temperature: "3,000 K", formula: "ξ(π) = ⟨T(n̂) T(−n̂)⟩ ≠ ξΛCDM(π)", seconds: 1.2e13 },
  { cue: "dark", at: 8.5, time: "t = 100 million years", title: "The dark ages", temperature: "60 K", formula: "(ȧ/a)² = 8πG/3 ρ − k/a² + Λ/3", seconds: 3.15e15 },
  { cue: "stars", at: 9.6, time: "t = 200 million years", title: "The first stars", temperature: "30 K", formula: "ρ̇ + 3H(ρ + p) = 0", seconds: 6.3e15 },
  { cue: "galaxies", at: 10.75, time: "t = 1 billion years", title: "Galaxies and the cosmic web", temperature: "10 K", formula: "⟨L · n̂⟩ ≠ 0  ·  black holes, scars of the torus", seconds: 3.15e16 },
  { cue: "created", at: 12.0, time: "", title: "Universe created", temperature: "", formula: "", seconds: 3.15e16 },
];

// The primordial torus is seen for at least this long, however fast the server is
const PRIMORDIAL_MIN = 1.8;
// The acts before inflation, in seconds after saturation begins
const SIGNATURE_AT = 1.5;
const BANG_AT = 2.4;
const INFLATION_AT = 4.6;
// From inflation on, the original documentary pacing, a touch slower
const POST_PACE = 1.06;
// The end, on the same clock: the finished web held for a while, then the flight to one
// of its galaxies, found as the camera arrives, and the fade
const HOLD_UNTIL = 9.0;
const ARRIVE_AT = 12.4;
const FADE_AT = 14.1;
const DONE_AT = 15.0;
// The breath held before the Big Bang: the story slows as the torus closes on its vertex
// (a quarter of the speed at the last), and the discharge comes at full speed
const paceAt = (story: number) => (story < 1.8 || story >= BANG_AT ? 1 : 1 - 0.75 * THREE.MathUtils.smoothstep(story, 1.8, 2.15));
// Real seconds the story takes to get from its start to `story`
function realSeconds(story: number) {
  let at = 0;
  let real = 0;
  while (at < story) {
    at += 0.01 * paceAt(at);
    real += 0.01;
  }
  return real;
}

// (the primordial torus itself, its shader and its quanta: core/torus)

// A cooling blackbody, from blue-white through yellow and orange to dull red and dark
const BLACKBODY = /* glsl */ `
vec3 blackbody(float t) {
  t = clamp(t, 0.0, 1.0);
  vec3 c = mix(vec3(0.0), vec3(0.35, 0.03, 0.0), smoothstep(0.0, 0.15, t));
  c = mix(c, vec3(0.85, 0.22, 0.03), smoothstep(0.12, 0.32, t));
  c = mix(c, vec3(1.0, 0.55, 0.18), smoothstep(0.3, 0.48, t));
  c = mix(c, vec3(1.0, 0.82, 0.55), smoothstep(0.45, 0.65, t));
  c = mix(c, vec3(1.0, 0.96, 0.9), smoothstep(0.62, 0.82, t));
  c = mix(c, vec3(0.86, 0.92, 1.0), smoothstep(0.8, 1.0, t));
  return c;
}
`;

const MATTER_VERTEX = /* glsl */ `
${BLACKBODY}
attribute vec3 aStart;
attribute vec3 aEnd;
attribute float aGalaxy;
attribute float aRand;
uniform float uScale;
uniform float uCollapse;
uniform float uTemp;
uniform float uGas;
uniform float uNeutral;
uniform float uStars;
uniform float uPixels;
uniform vec3 uTint;
varying vec3 vColor;
void main() {
  // Gravity: from an almost perfectly even gas into the knots and filaments of the web
  float c = uCollapse * uCollapse * (3.0 - 2.0 * uCollapse);
  vec3 p = mix(aStart, aEnd, c) * uScale;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  // Gas: glowing at the universe's temperature while it is hot, then a faint cold haze
  vec3 gas = mix(blackbody(uTemp), vec3(0.16, 0.2, 0.3), uNeutral) * uGas * (0.55 + 0.45 * aRand);
  // Galaxies ignite one after another, earliest in the densest knots
  float on = smoothstep(aRand * 0.75, aRand * 0.75 + 0.25, uStars) * aGalaxy;
  vec3 starlight = mix(vec3(0.72, 0.82, 1.0), vec3(1.0, 0.86, 0.66), fract(aRand * 7.31)) * mix(vec3(1.0), uTint, 0.25);
  // Most galaxies faint, a few bright: brightness falls off like a luminosity function
  float luminosity = 0.35 + 2.4 * pow(fract(aRand * 3.7), 4.0);
  // Flying into the web at the end: what passes right by the lens fades instead of
  // blooming into a blot
  float near = smoothstep(0.4, 2.4, -mv.z);
  vColor = (gas + starlight * on * luminosity) * near;
  gl_PointSize = min(mix(0.024, 0.032 + 0.03 * pow(fract(aRand * 3.7), 3.0), on) * uPixels / -mv.z, 10.0);
  gl_Position = projectionMatrix * mv;
}
`;

// The lens, before the post pass: a long exposure (what is bright lingers and streaks as
// it moves), the bright parts picked out at a quarter of the resolution, and a blur that
// spreads them into a glow, or along one axis into the streaks of an anamorphic lens
const TRAIL_FRAGMENT = /* glsl */ `
uniform sampler2D tScene;
uniform sampler2D tPrev;
uniform float uPersist;
varying vec2 vUv;
void main() { gl_FragColor = vec4(max(texture2D(tScene, vUv).rgb, texture2D(tPrev, vUv).rgb * uPersist), 1.0); }
`;

const BRIGHT_FRAGMENT = /* glsl */ `
uniform sampler2D tInput;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  vec3 c = (texture2D(tInput, vUv + uTexel * vec2(-1.0, -1.0)).rgb + texture2D(tInput, vUv + uTexel * vec2(1.0, -1.0)).rgb
    + texture2D(tInput, vUv + uTexel * vec2(-1.0, 1.0)).rgb + texture2D(tInput, vUv + uTexel * vec2(1.0, 1.0)).rgb) * 0.25;
  gl_FragColor = vec4(c * smoothstep(0.16, 0.9, dot(c, vec3(0.2126, 0.7152, 0.0722))), 1.0);
}
`;

const BLUR_FRAGMENT = /* glsl */ `
uniform sampler2D tInput;
uniform vec2 uDir;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(tInput, vUv).rgb * 0.227;
  c += (texture2D(tInput, vUv + uDir).rgb + texture2D(tInput, vUv - uDir).rgb) * 0.1945;
  c += (texture2D(tInput, vUv + uDir * 2.0).rgb + texture2D(tInput, vUv - uDir * 2.0).rgb) * 0.1216;
  c += (texture2D(tInput, vUv + uDir * 3.0).rgb + texture2D(tInput, vUv - uDir * 3.0).rgb) * 0.054;
  c += (texture2D(tInput, vUv + uDir * 4.0).rgb + texture2D(tInput, vUv - uDir * 4.0).rgb) * 0.0162;
  gl_FragColor = vec4(c, 1.0);
}
`;

const POST_FRAGMENT = /* glsl */ `
${BLACKBODY}
uniform sampler2D tScene;
uniform sampler2D tBloom;
uniform sampler2D tStreak;
uniform float uBloom;
uniform float uStreak;
uniform float uRays;
uniform float uAberration;
uniform float uGrain;
uniform float uAspect;
uniform float uTime;
uniform float uFlash;
uniform float uShock;
uniform float uShockAmp;
uniform float uInflate;
uniform float uWhite;
uniform float uPlasma;
uniform float uTemp;
uniform float uFluct;
uniform float uFade;
uniform vec3 uSeed;
varying vec2 vUv;
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
void main() {
  vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
  float r = length(p);
  // The transition surface sweeps out from the vertex, bending the light it crosses
  vec2 dir = r > 0.0001 ? p / r : vec2(0.0);
  // (a thin, hot front with a softer wake: it reads as a wave, not a grey halo)
  float front = exp(-pow((r - uShock) * 30.0, 2.0)) * uShockAmp;
  float ring = front + exp(-pow((r - uShock + 0.04) * 12.0, 2.0)) * uShockAmp * 0.35;
  vec2 uv = vUv - dir * vec2(1.0 / uAspect, 1.0) * ring * 0.035;
  // The lens splits the colours a little towards the edges of the frame, more as the
  // shock passes
  vec2 split = (vUv - 0.5) * uAberration * (0.4 + r);
  vec3 color = vec3(texture2D(tScene, uv + split).r, texture2D(tScene, uv).g, texture2D(tScene, uv - split).b);
  color += vec3(1.0, 0.78, 0.52) * front * 0.3;
  // A glow round everything bright, and the blue streaks of an anamorphic lens
  color += texture2D(tBloom, vUv).rgb * uBloom + texture2D(tStreak, vUv).rgb * vec3(0.5, 0.72, 1.0) * uStreak;
  // Rays of light from the centre of the frame (where the vertex is when it discharges)
  if (uRays > 0.001) {
    vec2 march = (vec2(0.5) - vUv) / 28.0 * 0.5;
    vec2 at = vUv;
    float decay = 1.0;
    vec3 rays = vec3(0.0);
    for (int i = 0; i < 28; i++) {
      at += march;
      rays += texture2D(tBloom, at).rgb * decay;
      decay *= 0.9;
    }
    color += rays / 28.0 * uRays * 3.0;
  }
  // The plasma: the whole sky glows at the temperature of the universe. Just before it
  // clears, the fluctuations of its density show (the cosmic microwave background),
  // echoed faintly at the antipodes and quiet on the largest scales
  vec2 q = p * 5.0 + uSeed.xy;
  vec2 qa = -p * 5.0 + uSeed.xy;
  float n = noise(q) * 0.5 + noise(q * 2.1 + 3.0) * 0.3 + noise(q * 4.7 + 7.0) * 0.2;
  n = mix(n, noise(qa * 2.1 + 3.0) * 0.6 + noise(q * 4.7 + 7.0) * 0.4, 0.35);
  // While it is hot the plasma churns: cells of slightly hotter and cooler gas on two
  // scales, drifting and folding into each other, so the sky is never a flat colour
  vec2 w = p * 2.2 + vec2(uTime * 0.07, -uTime * 0.05) + uSeed.yz;
  float churn = noise(w + noise(w * 1.7) * 1.5) - 0.5;
  vec2 w2 = p * 6.5 + vec2(-uTime * 0.11, uTime * 0.08) + uSeed.zx;
  churn = churn * 0.7 + (noise(w2 + noise(w2 * 1.3 + uTime * 0.05) * 1.2) - 0.5) * 0.45;
  float hot = (1.0 - uFluct) * churn;
  vec3 plasma = blackbody(uTemp + hot * 0.16) * (1.0 + hot * 0.55 + uFluct * (n - 0.5) * 0.9);
  plasma *= 1.0 - smoothstep(0.25, 1.1, r) * 0.35;
  color += plasma * uPlasma * 1.3;
  // Inflation: a sphere of light swelling from the point until it fills the sky
  float inside = 1.0 - smoothstep(uInflate * 0.82, uInflate, r);
  color = mix(color, vec3(1.0, 0.98, 0.95) * 2.5, inside * uWhite);
  // (its light spilling round it, as through a lens)
  color += vec3(1.0, 0.94, 0.85) * uWhite * exp(-max(r - uInflate, 0.0) * 7.0) * 0.7 * step(0.001, uInflate);
  // The discharge at the vertex
  color += vec3(1.0, 0.96, 0.9) * (uFlash * (exp(-r * r * 3000.0) * 4.0 + exp(-r * 6.0) * 1.4) + uFlash * uFlash * 0.25);
  color = 1.0 - exp(-color * 1.2);
  color *= 1.0 - smoothstep(0.6, 1.2, r) * 0.45;
  color *= 1.0 - uFade;
  // Film grain
  color = pow(max(color, 0.0), vec3(1.0 / 2.2));
  color += (hash(gl_FragCoord.xy + fract(uTime * 13.7) * 311.0) - 0.5) * uGrain * (1.0 - uFade);
  gl_FragColor = vec4(color, 1.0);
}
`;

const FULLSCREEN_VERTEX = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// The equations that drift through each act: before time (on the clock since the torus
// appeared) and after (on the clock since saturation began), each faint, slow, turning
// round the scene at its own distance
const FORMULAS: Array<{ text: string; clock: "t" | "s"; from: number; to: number; radius: [number, number]; height: number }> = [
  { text: "G₀ = lim Σ [(+εₖ) + (−εₖ)] = 0", clock: "t", from: 0.3, to: Infinity, radius: [3.4, 4.6], height: 1.8 },
  { text: "π₁(K² × T²) = ⟨a, b, c, d | aba⁻¹b = 1, [c, d] = 1⟩", clock: "t", from: 0.7, to: Infinity, radius: [3.8, 5.2], height: 2.0 },
  { text: "(t, x, y, z) ∼ (t + Lₜ/2, −x, y, z)", clock: "t", from: 1.1, to: Infinity, radius: [3.4, 4.8], height: 1.6 },
  { text: "χ(K² × T²) = χ(K²) · χ(T²) = 0", clock: "t", from: 1.6, to: Infinity, radius: [3.6, 5.0], height: 1.9 },
  { text: "Sₑₙₜ(n) = S₀ · log n + O(1)", clock: "t", from: 2.2, to: Infinity, radius: [3.4, 4.6], height: 1.5 },
  { text: "ds² = dτ² + a(τ)² dΣ₃²   (τ < 0)", clock: "t", from: 2.8, to: Infinity, radius: [3.8, 5.0], height: 2.1 },
  { text: "b₀ = 1   b₁ = 3   b₂ = 3   b₃ = 1   b₄ = 0", clock: "t", from: 3.6, to: Infinity, radius: [3.6, 5.2], height: 1.8 },
  { text: "|ω(r)| > h(r) / N(r)", clock: "t", from: 4.6, to: Infinity, radius: [3.4, 4.4], height: 1.4 },
  { text: "Sₘₐₓ = A / 4ℓₚ²", clock: "s", from: 0.1, to: 2.6, radius: [3.2, 4.2], height: 1.2 },
  { text: "det(gμν)|Σ = 0", clock: "s", from: 1.2, to: 4.6, radius: [3.6, 5.0], height: 2.4 },
  { text: "∂²Φ/∂t² − c²∇²Φ + V′(Φ) = 0", clock: "s", from: 2.3, to: 5.0, radius: [4.4, 6.0], height: 3.2 },
  { text: "ds² = −dt² + |t|² [dχ² + sinh²χ dΩ²]", clock: "s", from: 2.6, to: 5.2, radius: [4.6, 6.2], height: 3.4 },
  { text: "ρ₊a³ + ρ₋b³ = ρₚᵣᵢₘ", clock: "s", from: 3.0, to: 5.2, radius: [4.2, 5.6], height: 3.0 },
  { text: "H² = 8πG/3 · ρ (1 − ρ/ρcrit)", clock: "s", from: 5.6, to: 9.2, radius: [5.5, 7.5], height: 2.6 },
  { text: "η ≈ (T_BBN / Mₚ) · sin δCP · f", clock: "s", from: 6.2, to: 9.6, radius: [5.5, 8.0], height: 2.8 },
  { text: "ξ(π) = ⟨T(n̂) T(−n̂)⟩ ≠ ξΛCDM(π)", clock: "s", from: 7.3, to: 10.6, radius: [6.0, 8.0], height: 3.0 },
  { text: "Cℓ / CℓΛCDM < 1   ℓ ≤ 4", clock: "s", from: 7.7, to: 11.0, radius: [5.5, 7.5], height: 2.6 },
  { text: "Tμν = ρuμuν + p(gμν + uμuν),  ρ + p < 0", clock: "s", from: 8.6, to: 11.8, radius: [6.0, 8.5], height: 3.0 },
  { text: "⟨L · n̂⟩ ≠ 0", clock: "s", from: 9.8, to: 12.6, radius: [5.5, 7.5], height: 2.4 },
  { text: "h(t) = h₀(t) + Σ αₙ h(t − nΔt)", clock: "s", from: 10.3, to: 12.9, radius: [6.0, 8.0], height: 2.8 },
];

// Matter, as it starts (an even gas) and as gravity leaves it (a cosmic web: knots,
// each joined to its nearest neighbours by filaments, around nearly empty voids)
function matter(count: number, rnd: () => number) {
  const R = 9;
  const start = new Float32Array(count * 3);
  const end = new Float32Array(count * 3);
  const galaxy = new Float32Array(count);
  const rand = new Float32Array(count);
  const knots = Array.from({ length: 130 }, () => {
    const v = new THREE.Vector3(gaussian(rnd), gaussian(rnd), gaussian(rnd)).normalize().multiplyScalar(R * Math.cbrt(rnd()));
    return { at: v, mass: 0.2 + Math.pow(rnd(), 3) * 2.2 };
  });
  // Filaments to the nearest neighbours, each bowed its own way (they are never straight)
  const links: Array<{ a: number; b: number; bow: THREE.Vector3; wiggle: THREE.Vector3 }> = [];
  knots.forEach((k, i) => {
    const near = knots.map((o, j) => ({ j, d: o.at.distanceTo(k.at) })).filter((o) => o.j !== i).sort((a, b) => a.d - b.d);
    for (const o of near.slice(0, 3)) {
      if (i > o.j) continue;
      const along = knots[o.j].at.clone().sub(k.at);
      const side = new THREE.Vector3(gaussian(rnd), gaussian(rnd), gaussian(rnd)).cross(along).normalize();
      const twist = new THREE.Vector3().crossVectors(along, side).normalize();
      links.push({ a: i, b: o.j, bow: side.multiplyScalar(along.length() * (0.08 + rnd() * 0.22)), wiggle: twist.multiplyScalar(along.length() * 0.06 * rnd()) });
    }
  });
  const p = new THREE.Vector3();
  for (let i = 0; i < count; i++) {
    // Even at the start (with the faintest ripples)
    p.set(gaussian(rnd), gaussian(rnd), gaussian(rnd)).normalize().multiplyScalar(R * Math.cbrt(rnd()));
    start.set([p.x, p.y, p.z], i * 3);
    const roll = rnd();
    let dense = 0;
    if (roll < 0.26) {
      // Haloes round the knots, the heaviest the most crowded
      const k = knots[Math.floor(Math.pow(rnd(), 0.7) * knots.length)];
      p.copy(k.at).add(new THREE.Vector3(gaussian(rnd), gaussian(rnd), gaussian(rnd)).multiplyScalar(0.12 + 0.22 * k.mass * Math.pow(rnd(), 0.5)));
      dense = 1;
    } else if (roll < 0.78) {
      // Along a filament: bowed, wavering, thicker in the middle
      const link = links[Math.floor(rnd() * links.length)];
      const t = rnd();
      p.lerpVectors(knots[link.a].at, knots[link.b].at, t)
        .addScaledVector(link.bow, Math.sin(Math.PI * t))
        .addScaledVector(link.wiggle, Math.sin(Math.PI * 3 * t))
        .add(new THREE.Vector3(gaussian(rnd), gaussian(rnd), gaussian(rnd)).multiplyScalar(0.07 + 0.12 * Math.sin(Math.PI * t)));
      dense = 0.55;
    } else {
      // Sheets and voids: a thin, even remainder
      p.multiplyScalar(0.95);
    }
    end.set([p.x, p.y, p.z], i * 3);
    galaxy[i] = rnd() < 0.05 + 0.12 * dense ? 1 : 0;
    // Earliest galaxies in the densest places
    rand[i] = dense === 1 ? rnd() * 0.55 : rnd();
  }
  return { start, end, galaxy, rand, knots };
}

// One galaxy, for the end: the camera leaves the web for one of its knots and finds a
// spiral there (the first thing the explorer shows). A bulge of old, warm stars, two arms
// of young blue ones winding out (with the odd pink star-forming region) and a faint disc,
// in the plane y = 0, a third of a unit across
const GALAXY_RADIUS = 0.34;
function spiral(count: number, rnd: () => number) {
  const position = new Float32Array(count * 3);
  const color = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const pitch = Math.tan(0.3);
  const core = 0.035;
  for (let i = 0; i < count; i++) {
    const roll = rnd();
    let x: number, y: number, z: number;
    let c: [number, number, number];
    let s = 0.6 + 0.8 * rnd();
    if (roll < 0.2) {
      // The bulge
      const r = Math.abs(gaussian(rnd)) * 0.05;
      const a = rnd() * Math.PI * 2;
      const b = Math.acos(2 * rnd() - 1);
      x = r * Math.sin(b) * Math.cos(a);
      z = r * Math.sin(b) * Math.sin(a);
      y = r * Math.cos(b) * 0.6;
      c = [0.8, 0.64 + 0.08 * rnd(), 0.44 + 0.12 * rnd()];
    } else if (roll < 0.85) {
      // The arms: logarithmic spirals, crowded and bright near the core, thinning and
      // fading towards the edge (exponentially, as a disc's light does)
      const r = Math.min(core + -Math.log(1 - rnd() * 0.985) * 0.075, GALAXY_RADIUS);
      const arm = rnd() < 0.5 ? 0 : Math.PI;
      const a = Math.log(r / core) / pitch + arm + gaussian(rnd) * (0.14 + 0.35 * (r / GALAXY_RADIUS));
      x = r * Math.cos(a);
      z = r * Math.sin(a);
      y = gaussian(rnd) * 0.006;
      const young = rnd();
      const fade = 0.35 + 0.65 * Math.exp(-r / 0.16);
      const tone: [number, number, number] = young < 0.035 ? [1.0, 0.5, 0.68] : young < 0.65 ? [0.72, 0.84, 1.0] : [1.0, 0.9, 0.76];
      c = [tone[0] * fade, tone[1] * fade, tone[2] * fade];
      s *= 0.85;
    } else {
      // The disc between the arms
      const r = -Math.log(1 - rnd() * 0.95) * 0.09;
      const a = rnd() * Math.PI * 2;
      x = r * Math.cos(a);
      z = r * Math.sin(a);
      y = gaussian(rnd) * 0.008;
      c = [0.85, 0.82, 0.8];
      s *= 0.7;
    }
    position.set([x, y, z], i * 3);
    color.set(c, i * 3);
    size[i] = s;
  }
  return { position, color, size };
}

const GALAXY_VERTEX = /* glsl */ `
attribute vec3 aColor;
attribute float aSize;
uniform float uAlpha;
uniform float uPixels;
varying vec3 vColor;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  // Tens of thousands of stars add up: each one faint, so the core glows without burning
  vColor = aColor * uAlpha * 0.4;
  gl_PointSize = clamp(0.0026 * aSize * uPixels / -mv.z, 0.0, 9.0);
  gl_Position = projectionMatrix * mv;
}
`;

// An equation set in a softly glowing italic serif, as a texture
function formulaTexture(text: string) {
  const size = 44;
  const font = `italic 300 ${size}px "STIX Two Math", "Cambria Math", "Times New Roman", serif`;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = font;
  const pad = 18;
  canvas.width = Math.ceil(ctx.measureText(text).width + pad * 2);
  canvas.height = Math.ceil(size * 1.6 + pad);
  ctx.font = font;
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(255,255,255,0.8)";
  ctx.shadowBlur = 10;
  ctx.fillText(text, pad, canvas.height / 2);
  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return { texture, aspect: canvas.width / canvas.height };
}

function seedNumber(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return Math.abs(h) || 1;
}

export class Creation {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  // The equations, drawn over the finished frame so the lens never smears them
  private overlay = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400);
  private target: THREE.WebGLRenderTarget;
  private post: THREE.ShaderMaterial;
  private postScene = new THREE.Scene();
  private postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  // The lens: the long exposure (two, read one and write the other), and at a quarter of
  // the resolution the bright parts, two buffers to blur through, and the streaks
  private trail: [THREE.WebGLRenderTarget, THREE.WebGLRenderTarget];
  private bright: THREE.WebGLRenderTarget;
  private blurA: THREE.WebGLRenderTarget;
  private blurB: THREE.WebGLRenderTarget;
  private streak: THREE.WebGLRenderTarget;
  private trailMaterial: THREE.ShaderMaterial;
  private brightMaterial: THREE.ShaderMaterial;
  private blurMaterial: THREE.ShaderMaterial;
  private passScene = new THREE.Scene();
  private passQuad: THREE.Mesh;
  private primordialMaterial: THREE.ShaderMaterial;
  private matterMaterial: THREE.ShaderMaterial;
  private formulas: Array<{ sprite: THREE.Sprite; clock: "t" | "s"; from: number; to: number; radius: number; height: number; angle: number; drift: number; phase: number; width: number }> = [];
  private frame = 0;
  private last = performance.now() / 1000;
  // Film time since the torus appeared, and story time since saturation began: both run
  // slow in the breath before the Big Bang
  private clock = 0;
  private story = 0;
  private released = false;
  private wantRelease = false;
  private banged = false;
  private epoch = -1;
  private finished = false;
  private flow = 0;
  private entropyAtRelease = 0;
  private container: HTMLElement;
  private lookAt = new THREE.Vector3();
  // The knots of the web, and the galaxy the camera flies to at the end: chosen when the
  // flight begins (the heaviest knot ahead), with where the flight starts from
  private knots: Array<{ at: THREE.Vector3; mass: number }> = [];
  private galaxy: THREE.Points;
  private galaxyMaterial: THREE.ShaderMaterial;
  private destination: { knot: THREE.Vector3; from: THREE.Vector3; tilt: THREE.Quaternion } | null = null;

  // Entanglement entropy of the primordial torus, as a fraction of its Bekenstein-Hawking
  // limit (1 when it saturates and collapses)
  entropy = 0;

  // `calm`: reduced flashing (photosensitivity): the discharge and inflation never burn
  // the screen white
  constructor(
    container: HTMLElement,
    kind: CreationKind,
    seed: string,
    private events: { onEpoch?: (index: number) => void; onCollapse?: (untilBang: number) => void; onBang?: () => void; onDone?: () => void } = {},
    private calm = false
  ) {
    this.container = container;
    this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.renderer.domElement.style.display = "block";
    container.appendChild(this.renderer.domElement);
    const buffer = () => new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });
    this.target = buffer();
    this.trail = [buffer(), buffer()];
    this.bright = buffer();
    this.blurA = buffer();
    this.blurB = buffer();
    this.streak = buffer();
    const pass = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>) =>
      new THREE.ShaderMaterial({ uniforms, vertexShader: FULLSCREEN_VERTEX, fragmentShader, depthTest: false, depthWrite: false });
    this.trailMaterial = pass(TRAIL_FRAGMENT, { tScene: { value: null }, tPrev: { value: null }, uPersist: { value: 0 } });
    this.brightMaterial = pass(BRIGHT_FRAGMENT, { tInput: { value: null }, uTexel: { value: new THREE.Vector2() } });
    this.blurMaterial = pass(BLUR_FRAGMENT, { tInput: { value: null }, uDir: { value: new THREE.Vector2() } });
    this.passQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.trailMaterial);
    this.passScene.add(this.passQuad);

    const rnd = rng(seedNumber(seed || kind));
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    const tint = new THREE.Color(kind === "core" ? 0x9fe8ff : 0xd4c4ff);

    // The primordial torus
    const quanta = small ? 14000 : 24000;
    const torus = torusGeometry(primordial(quanta, rnd));
    this.primordialMaterial = torusMaterial(kind === "core" ? new THREE.Color(0.32, 0.66, 1.0) : new THREE.Color(0.58, 0.46, 1.0));
    const torusPoints = new THREE.Points(torus, this.primordialMaterial);
    torusPoints.frustumCulled = false;
    this.scene.add(torusPoints);

    // The matter of our universe
    const count = small ? 32000 : 64000;
    const m = matter(count, rnd);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    geometry.setAttribute("aStart", new THREE.BufferAttribute(m.start, 3));
    geometry.setAttribute("aEnd", new THREE.BufferAttribute(m.end, 3));
    geometry.setAttribute("aGalaxy", new THREE.BufferAttribute(m.galaxy, 1));
    geometry.setAttribute("aRand", new THREE.BufferAttribute(m.rand, 1));
    this.matterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uScale: { value: 0.3 },
        uCollapse: { value: 0 },
        uTemp: { value: 1 },
        uGas: { value: 0 },
        uNeutral: { value: 0 },
        uStars: { value: 0 },
        uPixels: { value: 900 },
        uTint: { value: tint },
      },
      vertexShader: MATTER_VERTEX,
      fragmentShader: POINT_FRAGMENT,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    const points = new THREE.Points(geometry, this.matterMaterial);
    points.frustumCulled = false;
    this.scene.add(points);
    this.knots = m.knots;

    // The galaxy at the end of the flight (placed and turned when the flight begins)
    const stars = small ? 14000 : 26000;
    const g = spiral(stars, rnd);
    const galaxyGeometry = new THREE.BufferGeometry();
    galaxyGeometry.setAttribute("position", new THREE.BufferAttribute(g.position, 3));
    galaxyGeometry.setAttribute("aColor", new THREE.BufferAttribute(g.color, 3));
    galaxyGeometry.setAttribute("aSize", new THREE.BufferAttribute(g.size, 1));
    this.galaxyMaterial = new THREE.ShaderMaterial({
      uniforms: { uAlpha: { value: 0 }, uPixels: { value: 900 } },
      vertexShader: GALAXY_VERTEX,
      fragmentShader: POINT_FRAGMENT,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    this.galaxy = new THREE.Points(galaxyGeometry, this.galaxyMaterial);
    this.galaxy.frustumCulled = false;
    this.galaxy.visible = false;
    this.scene.add(this.galaxy);

    // The equations, faint, drifting
    for (const formula of FORMULAS) {
      const { texture, aspect } = formulaTexture(formula.text);
      const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, color: tint.clone().lerp(new THREE.Color(1, 1, 1), 0.5), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, depthTest: false }));
      sprite.frustumCulled = false;
      this.overlay.add(sprite);
      this.formulas.push({
        sprite,
        clock: formula.clock,
        from: formula.from,
        to: formula.to,
        radius: formula.radius[0] + rnd() * (formula.radius[1] - formula.radius[0]),
        height: (rnd() * 2 - 1) * formula.height,
        angle: rnd() * Math.PI * 2,
        drift: (0.03 + rnd() * 0.05) * (rnd() < 0.5 ? -1 : 1),
        phase: rnd() * Math.PI * 2,
        width: aspect,
      });
    }

    this.post = new THREE.ShaderMaterial({
      uniforms: {
        tScene: { value: this.target.texture },
        tBloom: { value: this.blurB.texture },
        tStreak: { value: this.blurA.texture },
        uBloom: { value: 0 },
        uStreak: { value: 0 },
        uRays: { value: 0 },
        uAberration: { value: 0 },
        uGrain: { value: 0.035 },
        uAspect: { value: 1 },
        uTime: { value: 0 },
        uFlash: { value: 0 },
        uShock: { value: 0 },
        uShockAmp: { value: 0 },
        uInflate: { value: 0 },
        uWhite: { value: 0 },
        uPlasma: { value: 0 },
        uTemp: { value: 1 },
        uFluct: { value: 0 },
        uFade: { value: 0 },
        uSeed: { value: new THREE.Vector3(rnd() * 40, rnd() * 40, rnd() * 40) },
      },
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: POST_FRAGMENT,
      depthTest: false,
      depthWrite: false,
    });
    this.postScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.post));

    window.addEventListener("resize", this.resize);
    this.resize();
    this.frame = requestAnimationFrame(this.render);
  }

  // The universe exists (the server answered): the torus saturates and collapses, once
  // it has been seen for a moment
  release() {
    this.wantRelease = true;
  }

  private resize = () => {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.renderer.setSize(width, height);
    const pr = this.renderer.getPixelRatio();
    const w = Math.floor(width * pr);
    const h = Math.floor(height * pr);
    for (const full of [this.target, ...this.trail]) full.setSize(w, h);
    const sw = Math.max(1, Math.floor(w / 4));
    const sh = Math.max(1, Math.floor(h / 4));
    for (const quarter of [this.bright, this.blurA, this.blurB, this.streak]) quarter.setSize(sw, sh);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.post.uniforms.uAspect.value = width / height;
    this.matterMaterial.uniforms.uPixels.value = height * pr;
    this.primordialMaterial.uniforms.uPixels.value = height * pr;
    this.galaxyMaterial.uniforms.uPixels.value = height * pr;
  };

  private render = () => {
    this.frame = requestAnimationFrame(this.render);
    const now = performance.now() / 1000;
    const real = Math.min(now - this.last, 0.1);
    this.last = now;
    if (!this.released && this.wantRelease && this.clock >= PRIMORDIAL_MIN) {
      this.released = true;
      this.entropyAtRelease = this.entropy;
      this.events.onCollapse?.(realSeconds(BANG_AT));
    }
    const dt = real * (this.released ? paceAt(this.story) : 1);
    this.clock += dt;
    if (this.released) this.story += dt;
    const t = this.clock;
    // s: story seconds since saturation began (-1 before); p: on the original
    // documentary clock, seconds since inflation began (negative before)
    const s = this.released ? this.story : -1;
    const p = s < 0 ? -1 : (s - INFLATION_AT) / POST_PACE;
    const sm = THREE.MathUtils.smoothstep;
    const u = this.post.uniforms;
    const pu = this.primordialMaterial.uniforms;
    const mu = this.matterMaterial.uniforms;
    const calm = this.calm ? 0.35 : 1;

    if (s >= 0) {
      let index = -1;
      CREATION_EPOCHS.forEach((epoch, i) => s >= epoch.at && (index = i));
      if (index !== this.epoch) {
        this.epoch = index;
        this.events.onEpoch?.(index);
      }
      if (!this.banged && s >= BANG_AT) {
        this.banged = true;
        this.events.onBang?.();
      }
    }

    // Before time: entropy creeps up with every cycle but cannot reach the limit until
    // the universe exists; then it saturates
    this.entropy = s < 0 ? 0.6 * (1 - Math.exp(-t / 6)) : this.entropyAtRelease + (1 - this.entropyAtRelease) * sm(s, 0, SIGNATURE_AT);
    const tension = this.entropy;
    this.flow += dt * (0.55 + 2.4 * tension * tension + (s < 0 ? 0 : 3 * sm(s, SIGNATURE_AT, BANG_AT)));
    pu.uFlow.value = this.flow;
    pu.uTime.value = t;
    pu.uTension.value = tension;
    pu.uPinch.value = s < 0 ? 0 : sm(s, SIGNATURE_AT, BANG_AT);
    pu.uUnfold.value = s < BANG_AT ? 0 : 1 - Math.pow(1 - Math.min((s - BANG_AT) / 2.4, 1), 3);
    pu.uDrop.value = s < 0 ? 0 : sm(s, 3.5, INFLATION_AT + 0.4);
    pu.uMirror.value = s < 0 ? 0 : sm(s, 3.6, INFLATION_AT + 0.2);
    // The quanta crowding into the vertex are dimmed, so its glow doesn't fog the frame
    // (calm: further, so it never burns white)
    const crowd = s < 0 ? 0 : sm(s, SIGNATURE_AT, BANG_AT) * (1 - sm(s, BANG_AT, BANG_AT + 1));
    pu.uAlpha.value = sm(t, 0, 1.2) * (1 - sm(p, 0.1, 1.1)) * (1 - 0.7 * crowd) * (1 - (1 - calm) * 0.6 * crowd);

    // The discharge at the vertex, and the transition surface sweeping out from it
    const since = s - BANG_AT;
    u.uFlash.value = s < BANG_AT ? 0 : Math.exp(-since * 6) * (1 - sm(since, 0.6, 1.2)) * calm;
    u.uShock.value = since < 0 ? 0 : since * 1.4;
    u.uShockAmp.value = since < 0 ? 0 : Math.exp(-since * 1.6) * (this.calm ? 0.5 : 1);

    // Inflation: exponential, then the white gives way to the plasma
    const cover = Math.hypot(this.camera.aspect / 2, 0.5) * 1.15;
    const swell = this.calm ? 1.5 : 0.6;
    u.uInflate.value = p < 0 ? 0 : cover * ((Math.exp((Math.min(p, swell) / swell) * 5.4) - 1) / (Math.exp(5.4) - 1));
    u.uWhite.value = p < 0 ? 0 : (1 - sm(p, swell, swell + 0.9)) * (this.calm ? 0.3 : 1);
    // The plasma cools along a blackbody and clears at recombination
    const temp = p < 0 ? 1 : p < 2.7 ? 0.95 - 0.5 * sm(p, 0.5, 2.7) : 0.45 - 0.3 * sm(p, 2.7, 3.6);
    u.uTemp.value = temp;
    mu.uTemp.value = temp;
    // (only once inflation has filled the sky: outside the sphere there is nothing yet)
    u.uPlasma.value = p < 0 ? 0 : sm(p, 0.55, 0.9) * (1 - sm(p, 2.75, 3.5));
    u.uFluct.value = p < 0 ? 0 : sm(p, 2.0, 2.7);
    // Matter: expanding, cooling into a faint neutral haze, then falling into the web
    mu.uScale.value = p < 0 ? 0.3 : 0.3 + 0.7 * sm(p, 0.3, 3.6) + 0.2 * sm(p, 3.6, 8.0);
    mu.uGas.value = p < 0 ? 0 : sm(p, 0.55, 0.9) * (1 - 0.88 * sm(p, 2.9, 3.6));
    mu.uNeutral.value = p < 0 ? 0 : sm(p, 2.9, 3.6);
    mu.uCollapse.value = p < 0 ? 0 : sm(p, 3.5, 6.6);
    mu.uStars.value = p < 0 ? 0 : sm(p, 4.6, 6.8);
    u.uFade.value = p < 0 ? 0 : sm(p, FADE_AT, DONE_AT - 0.1);
    u.uTime.value = t;

    // The lens: a long exposure while the quanta circulate, swirl down and fly apart (none
    // once the plasma fills the sky); glow and anamorphic streaks, flaring with the
    // discharge; rays from the vertex; colour fringes as the shock passes
    const flash = u.uFlash.value;
    const persist = s < 0 ? 0.8 : s < SIGNATURE_AT ? 0.82 : s < BANG_AT ? 0.9 : p < 0 ? 0.86 : 0.86 * (1 - sm(p, 0, 0.6));
    this.trailMaterial.uniforms.uPersist.value = Math.pow(persist, dt * 60);
    u.uBloom.value = 0.9 + 2 * flash;
    u.uStreak.value = (0.45 + 2.5 * flash) * (p < 0 ? 1 : 1 - 0.5 * sm(p, 0, 1));
    u.uRays.value = (s < BANG_AT ? 0 : 1.6 * Math.exp(-since * 1.1) * (1 - sm(p, 0, 0.6))) * (this.calm ? 0.5 : 1);
    u.uAberration.value = 0.0025 +0.03 * u.uShockAmp.value + 0.015 * flash;

    this.moveCamera(t, s, p, tension);
    this.driftFormulas(t, s, dt, u.uFade.value);

    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setRenderTarget(this.target);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
    this.develop();
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCamera);
    this.renderer.autoClear = false;
    this.renderer.render(this.overlay, this.camera);
    this.renderer.autoClear = true;

    if (!this.finished && p >= DONE_AT) {
      this.finished = true;
      this.events.onDone?.();
    }
  };

  // The lens passes, between the scene and the post pass: the long exposure, then the
  // bright parts blurred twice into a glow (blurB) and stretched sideways into streaks
  // (blurA)
  private develop() {
    const blit = (material: THREE.ShaderMaterial, out: THREE.WebGLRenderTarget) => {
      this.passQuad.material = material;
      this.renderer.setRenderTarget(out);
      this.renderer.render(this.passScene, this.postCamera);
    };
    const blur = (from: THREE.WebGLRenderTarget, out: THREE.WebGLRenderTarget, x: number, y: number) => {
      this.blurMaterial.uniforms.tInput.value = from.texture;
      this.blurMaterial.uniforms.uDir.value.set(x / from.width, y / from.height);
      blit(this.blurMaterial, out);
    };
    const [previous, exposure] = this.trail;
    this.trailMaterial.uniforms.tScene.value = this.target.texture;
    this.trailMaterial.uniforms.tPrev.value = previous.texture;
    blit(this.trailMaterial, exposure);
    this.trail = [exposure, previous];
    this.post.uniforms.tScene.value = exposure.texture;

    this.brightMaterial.uniforms.tInput.value = exposure.texture;
    this.brightMaterial.uniforms.uTexel.value.set(1 / exposure.width, 1 / exposure.height);
    blit(this.brightMaterial, this.bright);
    blur(this.bright, this.blurA, 1, 0);
    blur(this.blurA, this.blurB, 0, 1);
    blur(this.blurB, this.blurA, 2.5, 0);
    blur(this.blurA, this.blurB, 0, 2.5);
    blur(this.bright, this.streak, 4, 0);
    blur(this.streak, this.blurA, 14, 0);
  }

  // The camera, as a film would move it: close round the torus, pushing in while it
  // saturates (a vertigo shot: the lens narrows as the camera backs away, so the torus
  // holds its size while the space round it stretches, and the frame tilts), down to its
  // equator for the collapse, level and wide again at the discharge, back to take in the
  // hourglass, up after our universe as the mirror falls away, and then the slow
  // documentary drawing-back of the original
  private moveCamera(t: number, s: number, p: number, tension: number) {
    const sm = THREE.MathUtils.smoothstep;
    const r = Math.max(s, 0);
    const released = s < 0 ? 0 : 1;
    const angle = 0.05 * t + 0.3 * sm(r, 0, BANG_AT) * released;
    const fit = Math.max(1, 1.2 / this.camera.aspect);
    const vertigo = released * (sm(r, 0.1, SIGNATURE_AT + 0.2) - sm(r, BANG_AT - 0.05, BANG_AT + 0.35));
    const fov = 55 - 22 * vertigo;
    if (Math.abs(this.camera.fov - fov) > 1e-3) {
      this.camera.fov = fov;
      this.camera.updateProjectionMatrix();
    }
    const dolly = Math.tan(THREE.MathUtils.degToRad(27.5)) / Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const roll = 0.02 * Math.sin(t * 0.3) + 0.11 * released * sm(r, 0.2, SIGNATURE_AT + 0.4) * (1 - sm(r, BANG_AT - 0.05, BANG_AT + 0.25));
    const distance = (7.6 - 1.1 * sm(t, 0, 9) + released * (-0.6 * sm(r, 0, SIGNATURE_AT) + 1.2 * sm(r, SIGNATURE_AT, BANG_AT) + 3.6 * sm(r, BANG_AT, 4.2))) * fit * dolly;
    const elevation = 0.42 - 0.1 * sm(t, 0, 9) - 0.3 * sm(r, SIGNATURE_AT - 0.1, BANG_AT) * released;
    const rise = 2.4 * sm(r, 3.5, INFLATION_AT + 0.2) * released;
    // The torus trembles at saturation, and the discharge jolts the frame
    const jolt = 0.035 * Math.pow(tension, 4) * (1 - sm(r, BANG_AT, BANG_AT + 0.4)) + (s >= BANG_AT ? 0.09 * Math.exp(-(s - BANG_AT) * 5) : 0) * (this.calm ? 0.3 : 1);
    const shake = new THREE.Vector3(Math.sin(t * 37.1), Math.sin(t * 29.3 + 1.3), Math.sin(t * 41.7 + 2.1)).multiplyScalar(jolt);
    const near = new THREE.Vector3(Math.sin(angle) * Math.cos(elevation), Math.sin(elevation), Math.cos(angle) * Math.cos(elevation)).multiplyScalar(distance).add(shake);
    near.y += rise * 1.25;
    const nearTarget = new THREE.Vector3(0, rise, 0);

    // The original drawing-back over the cosmic web, eased in under inflation's light
    const far = 11 + 4.5 * sm(p, 1.0, 8.5);
    const wide = new THREE.Vector3(Math.sin(angle) * far, 2.5 * sm(Math.max(p, 0), 3, 8.5), Math.cos(angle) * far);
    const w = p < 0 ? 0 : sm(p, 0.1, 1.5);
    this.camera.position.lerpVectors(near, wide, w);
    this.lookAt.copy(nearTarget).multiplyScalar(1 - w);

    // The end: the eye turns to one knot of the web, then the camera flies there, through
    // the filaments, and finds a galaxy waiting
    if (p >= HOLD_UNTIL) {
      if (!this.destination) this.destination = this.chooseDestination();
      const { knot, from } = this.destination;
      const approach = from.clone().sub(knot).normalize();
      const arrive = knot.clone().addScaledVector(approach, 1.05 * (1 - 0.08 * sm(p, ARRIVE_AT - 0.4, DONE_AT)));
      const fly = THREE.MathUtils.smootherstep(p, HOLD_UNTIL + 0.5, ARRIVE_AT);
      this.camera.position.lerp(arrive, fly);
      this.lookAt.lerp(knot, sm(p, HOLD_UNTIL, HOLD_UNTIL + 1.6));
      this.galaxy.visible = true;
      this.galaxyMaterial.uniforms.uAlpha.value = sm(p, HOLD_UNTIL + 0.8, ARRIVE_AT - 0.6);
      // Turning slowly on itself
      this.galaxy.quaternion.copy(this.destination.tilt).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -0.06 * t));
    }
    this.camera.lookAt(this.lookAt);
    this.camera.rotateZ(roll * (1 - w));
  }

  // The knot the camera flies to: a heavy one, ahead of it and well inside the web. The
  // galaxy there is tilted about 55° to the line of sight, so its arms show
  private chooseDestination() {
    const scale = this.matterMaterial.uniforms.uScale.value as number;
    const from = this.camera.position.clone();
    const ahead = from.clone().negate().normalize();
    let best = this.knots[0];
    let score = -Infinity;
    for (const k of this.knots) {
      const at = k.at.clone().multiplyScalar(scale);
      const towards = at.clone().sub(from).normalize().dot(ahead);
      if (at.length() > 7.5 || towards < 0.85) continue;
      const s = k.mass * towards;
      if (s > score) {
        score = s;
        best = k;
      }
    }
    const knot = best.at.clone().multiplyScalar(scale);
    const approach = from.clone().sub(knot).normalize();
    const side = new THREE.Vector3().crossVectors(approach, new THREE.Vector3(0, 1, 0)).normalize();
    const tilt = THREE.MathUtils.degToRad(55);
    const normal = approach.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(side, Math.sin(tilt)).normalize();
    this.galaxy.position.copy(knot);
    return { knot, from, tilt: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal) };
  }

  // Each equation fades in for its act, turns slowly round the scene and fades out
  private driftFormulas(t: number, s: number, dt: number, fade: number) {
    const sm = THREE.MathUtils.smoothstep;
    for (const f of this.formulas) {
      const x = f.clock === "t" ? t : s;
      let seen = x < f.from ? 0 : sm(x, f.from, f.from + 1.4) * (f.to === Infinity ? 1 : 1 - sm(x, f.to - 1.2, f.to));
      // Those of before time leave as the torus collapses
      if (f.clock === "t") seen *= s < 0 ? 1 : 1 - sm(s, SIGNATURE_AT - 0.2, BANG_AT);
      f.angle += f.drift * dt;
      const bob = Math.sin(t * 0.25 + f.phase) * 0.2;
      f.sprite.position.set(Math.cos(f.angle) * f.radius, f.height + bob, Math.sin(f.angle) * f.radius);
      const size = 0.16 + f.radius * 0.035;
      f.sprite.scale.set(size * f.width, size, 1);
      // (never looming in front of the lens: they stay in the background)
      seen *= sm(f.sprite.position.distanceTo(this.camera.position), 3.5, 6);
      const material = f.sprite.material as THREE.SpriteMaterial;
      material.opacity = seen * (0.2 + 0.05 * Math.sin(t * 0.7 + f.phase)) * (1 - fade);
      f.sprite.visible = material.opacity > 0.001;
    }
  }

  dispose() {
    cancelAnimationFrame(this.frame);
    window.removeEventListener("resize", this.resize);
    for (const f of this.formulas) (f.sprite.material as THREE.SpriteMaterial).map?.dispose();
    for (const scene of [this.scene, this.overlay])
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        (mesh.material as THREE.Material | undefined)?.dispose?.();
      });
    this.post.dispose();
    for (const material of [this.trailMaterial, this.brightMaterial, this.blurMaterial]) material.dispose();
    this.passQuad.geometry.dispose();
    for (const buffer of [this.target, ...this.trail, this.bright, this.blurA, this.blurB, this.streak]) buffer.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
