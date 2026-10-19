// atlas-ui/react/static/js/Explore/core/torus.ts
//
// The primordial 4D torus of the Primordial 4D Torus Hypothesis (K² × T²), as particles:
// quanta created in pairs, +ε and −ε, circulating in opposite directions along the closed
// loops of a torus whose tube turns half over on every lap (the Klein twist). The
// creation of a universe (ui/Creation) tells its whole story, from before time to the
// Big Bang; the explorer draws it as it is before time, at the heart of a Singularity
// Void (galaxy/ExoticLayer).

import * as THREE from "three";

// The torus: ring radius and tube radius; the cones: height and opening
export const RING = 2.0;
export const TUBE = 0.75;
export const CONE_HEIGHT = 4.6;
export const CONE_OPEN = 0.62;

export const PRIMORDIAL_VERTEX = /* glsl */ `
attribute float aU;
attribute float aV;
attribute float aSpeed;
attribute float aSign;
attribute float aShell;
attribute float aRand;
uniform float uFlow;
uniform float uTime;
uniform float uTension;
uniform float uPinch;
uniform float uUnfold;
uniform float uDrop;
uniform float uMirror;
uniform float uAlpha;
uniform float uPixels;
uniform vec3 uWarm;
uniform vec3 uCool;
varying vec3 vColor;
const float TAU = 6.2831853;
void main() {
  // Round the ring (u) and round the tube (v). The tube turns half over on each loop,
  // so a loop never closes on itself: it closes on its mirror image (the Klein twist)
  float u = aU + uFlow * aSpeed;
  float v = aV + 0.5 * u;
  float loops = u / TAU;
  float f = fract(loops);
  // Every pass through the twist (the far side of the ring) turns +e into -e
  float here = mod(floor(loops), 2.0) < 0.5 ? aSign : -aSign;
  float charge = mix(here, -here, smoothstep(0.45, 0.55, f));
  float seam = exp(-pow((f - 0.5) * 11.0, 2.0));
  // As entropy piles up the torus trembles
  float tremble = uTension * uTension * (0.09 * sin(5.0 * u + 3.0 * v - uTime * 5.0) + 0.05 * sin(13.0 * u - uTime * 9.0 + aRand * 6.0));
  float r = ${TUBE.toFixed(2)} * (aShell + tremble);
  vec3 torus = vec3((${RING.toFixed(2)} + r * cos(v)) * cos(u), r * sin(v), (${RING.toFixed(2)} + r * cos(v)) * sin(u));
  // The signature change: everything spirals down through the throat to one vertex
  float pinch = uPinch * uPinch * (3.0 - 2.0 * uPinch);
  float swirl = pinch * 2.4;
  vec3 p = torus * (1.0 - pinch);
  p.xz = mat2(cos(swirl), -sin(swirl), sin(swirl), cos(swirl)) * p.xz;
  // The unfolding: out of the vertex along two cones, matter one way, antimatter the other
  float side = aSign;
  float h = uUnfold * ${CONE_HEIGHT.toFixed(2)} * (0.06 + 0.94 * pow(fract(aRand * 13.7 + aU * 0.37), 0.65));
  float phi = aU + aV * 0.25 + uTime * 0.12 * side;
  float spread = aShell > 0.9 ? 1.0 : sqrt(aShell / 0.9);
  p += vec3(cos(phi) * h * ${CONE_OPEN.toFixed(2)} * spread, side * h, sin(phi) * h * ${CONE_OPEN.toFixed(2)} * spread);
  // The mirror falls away, causally disconnected
  float mirror = step(side, 0.0);
  p.y -= mirror * uDrop * 7.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);

  vec3 primordial = mix(uCool, uWarm, charge * 0.5 + 0.5) * (0.5 + 0.5 * aRand) * (0.6 + 0.6 * uTension + 1.5 * seam * (0.4 + uTension));
  vec3 vertex = vec3(1.0, 0.97, 0.92) * 1.4;
  vec3 sector = side > 0.0 ? vec3(1.0, 0.86, 0.66) : uCool * vec3(0.8, 0.75, 1.1);
  vec3 color = mix(primordial, vertex, pinch);
  color = mix(color, sector * (0.55 + 0.6 * (1.0 - uUnfold) + 0.4 * fract(aRand * 7.3)), smoothstep(0.0, 0.35, uUnfold));
  vColor = color * uAlpha * (1.0 - mirror * uMirror);
  gl_PointSize = 0.026 * (0.7 + 0.6 * aRand) * (1.0 - 0.55 * pinch * (1.0 - uUnfold)) * uPixels / -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

export const POINT_FRAGMENT = /* glsl */ `
varying vec3 vColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;
  gl_FragColor = vec4(vColor * exp(-d * d * 5.0), 1.0);
}
`;

export function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

export const gaussian = (rnd: () => number) => Math.sqrt(-2 * Math.log(Math.max(rnd(), 1e-9))) * Math.cos(2 * Math.PI * rnd());

// The primordial torus: quanta created in pairs at one place, +ε and −ε, which then
// circulate in opposite directions. Most run along strands on the surface of the tube
// (the closed loops, winding with the twist), the rest a faint haze within it
export function primordial(count: number, rnd: () => number) {
  const strands = 28;
  const u = new Float32Array(count);
  const v = new Float32Array(count);
  const speed = new Float32Array(count);
  const sign = new Float32Array(count);
  const shell = new Float32Array(count);
  const rand = new Float32Array(count);
  for (let i = 0; i < count; i += 2) {
    const onStrand = rnd() < 0.72;
    const strand = Math.floor(rnd() * strands);
    const at = [rnd() * Math.PI * 2, onStrand ? ((strand + 0.5) / strands) * Math.PI * 2 + gaussian(rnd) * 0.02 : rnd() * Math.PI * 2];
    // Each strand keeps its own pace
    const pace = onStrand ? 0.35 + 0.45 * ((strand * 0.618) % 1) : 0.3 + 0.5 * rnd();
    for (let k = 0; k < 2 && i + k < count; k++) {
      const j = i + k;
      const e = k === 0 ? 1 : -1;
      u[j] = at[0];
      v[j] = at[1];
      speed[j] = pace * e;
      sign[j] = e;
      shell[j] = onStrand ? 0.98 + 0.04 * rnd() : 0.9 * Math.sqrt(rnd());
      rand[j] = onStrand ? 0.45 + 0.55 * rnd() : 0.35 * rnd();
    }
  }
  return { u, v, speed, sign, shell, rand };
}

// The quanta as a geometry for PRIMORDIAL_VERTEX
export function torusGeometry(q: ReturnType<typeof primordial>) {
  const count = q.u.length;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute("aU", new THREE.BufferAttribute(q.u, 1));
  geometry.setAttribute("aV", new THREE.BufferAttribute(q.v, 1));
  geometry.setAttribute("aSpeed", new THREE.BufferAttribute(q.speed, 1));
  geometry.setAttribute("aSign", new THREE.BufferAttribute(q.sign, 1));
  geometry.setAttribute("aShell", new THREE.BufferAttribute(q.shell, 1));
  geometry.setAttribute("aRand", new THREE.BufferAttribute(q.rand, 1));
  return geometry;
}

// Its material, still before time unless the uniforms say otherwise. `cool`: the colour
// of the −ε quanta (cyan for the Core Continuum, violet for a universe of one's own)
export function torusMaterial(cool: THREE.Color) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uFlow: { value: 0 },
      uTime: { value: 0 },
      uTension: { value: 0 },
      uPinch: { value: 0 },
      uUnfold: { value: 0 },
      uDrop: { value: 0 },
      uMirror: { value: 0 },
      uAlpha: { value: 0 },
      uPixels: { value: 900 },
      uWarm: { value: new THREE.Color(1.0, 0.58, 0.22) },
      uCool: { value: cool },
    },
    vertexShader: PRIMORDIAL_VERTEX,
    fragmentShader: POINT_FRAGMENT,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
}
