// atlas-ui/react/static/js/Explore/planet/realistic/effects.ts
//
// What a planet has, drawn as it would really look from orbit:
//
//   satellites      constellations of satellites (panels, blinking lights) and a station
//   swarm           a machine civilisation: hundreds of satellites and an orbital ring
//   aurora          auroral ovals around the magnetic poles
//   belts           radiation belts (Van Allen), faint glowing tori
//   plumes          volcanic plumes, smoke, gas seeps, blowing snow (particles on the GPU)
//   livingGas       luminous clouds that drift on their own (conscious gas)
//   presence        an ethereal halo with slow ripples (non-physical entity)
//   monolith        a black cube in orbit, its edges pulsing
//   shards          exotic matter fragments tumbling in orbit
//   ripples         phase matter: interference ripples around the planet
//   jets            polar jets
//   debris          a debris field of broken crust
//   divine          "Have I just found God?": corona and rays, armillary rings of code,
//                   a lattice of light on the ground, golden motes, waves of light
//
// Everything is in the planet frame (planet at the origin, radius R). Objects that sit on
// the surface turn with the planet (they copy its rotation each frame).

import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { NOISE } from "./glsl.ts";

export type EffectKind = "satellites" | "swarm" | "aurora" | "belts" | "volcanic" | "smoke" | "seeps" | "snow" | "livingGas" | "presence" | "monolith" | "shards" | "ripples" | "jets" | "debris" | "divine";
interface Live {
  update: (time: number, wall: number) => void;
  dispose: () => void;
  // Follows the planet's rotation (things on the ground)
  surface?: THREE.Object3D;
}

function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

const randomDirection = (rnd: () => number) => {
  const u = rnd() * 2 - 1;
  const a = rnd() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return new THREE.Vector3(s * Math.cos(a), u, s * Math.sin(a));
};

// ---- orbiting objects ------------------------------------------------------------------

interface Orbit {
  radius: number;
  normal: THREE.Vector3;
  u: THREE.Vector3;
  v: THREE.Vector3;
  period: number; // seconds
  phase: number;
}

function makeOrbit(rnd: () => number, radius: number, inclinationSpread: number, period: number): Orbit {
  const normal = new THREE.Vector3(0, 1, 0).applyEuler(new THREE.Euler((rnd() - 0.5) * inclinationSpread * 2, rnd() * Math.PI * 2, (rnd() - 0.5) * inclinationSpread * 2)).normalize();
  const u = new THREE.Vector3(1, 0, 0).cross(normal);
  if (u.lengthSq() < 1e-4) u.set(0, 0, 1).cross(normal);
  u.normalize();
  const v = new THREE.Vector3().crossVectors(normal, u);
  return { radius, normal, u, v, period, phase: rnd() * Math.PI * 2 };
}

const orbitPosition = (o: Orbit, time: number, out: THREE.Vector3) => {
  const a = o.phase + (time / o.period) * Math.PI * 2;
  return out.copy(o.u).multiplyScalar(Math.cos(a) * o.radius).addScaledVector(o.v, Math.sin(a) * o.radius);
};

// A satellite: bus, two solar wings, a dish
function satelliteGeometry(size: number) {
  const bus = new THREE.BoxGeometry(size * 0.6, size * 0.6, size);
  const wingL = new THREE.BoxGeometry(size * 2.4, size * 0.02, size * 0.7).translate(-size * 1.6, 0, 0);
  const wingR = new THREE.BoxGeometry(size * 2.4, size * 0.02, size * 0.7).translate(size * 1.6, 0, 0);
  const dish = new THREE.ConeGeometry(size * 0.35, size * 0.2, 12, 1, true).rotateX(Math.PI / 2).translate(0, 0, size * 0.6);
  const parts = [bus, wingL, wingR, dish].map((g) => g.toNonIndexed());
  const merged = mergeGeometries(parts)!;
  parts.forEach((g) => g.dispose());
  return merged;
}

// A modular station: a truss, pressurised modules and big arrays
function stationGeometry(size: number) {
  const parts: THREE.BufferGeometry[] = [];
  parts.push(new THREE.BoxGeometry(size * 6, size * 0.15, size * 0.15));
  for (let i = -2; i <= 2; i++) parts.push(new THREE.CylinderGeometry(size * 0.35, size * 0.35, size * 1.4, 12).rotateX(Math.PI / 2).translate(i * size * 0.5, 0, 0));
  for (const x of [-2.8, -1.9, 1.9, 2.8]) for (const z of [-1, 1]) parts.push(new THREE.BoxGeometry(size * 0.7, size * 0.02, size * 2.2).translate(x * size, 0, z * size * 1.3));
  parts.push(new THREE.TorusGeometry(size * 1.1, size * 0.08, 8, 32).rotateY(Math.PI / 2));
  const flat = parts.map((g) => g.toNonIndexed());
  const merged = mergeGeometries(flat)!;
  parts.forEach((g) => g.dispose());
  flat.forEach((g) => g.dispose());
  return merged;
}

const BLINK_VERTEX = /* glsl */ `
attribute float phase;
uniform float uWall;
uniform float uPixelRatio;
varying float vOn;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  // Short double flash every two seconds
  float t = fract(uWall * 0.5 + phase);
  vOn = step(t, 0.04) + step(0.1, t) * step(t, 0.14);
  gl_PointSize = (1.5 + 2.5 * vOn) * uPixelRatio;
  gl_Position = projectionMatrix * mv;
}
`;

const BLINK_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
varying float vOn;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(uColor * (0.25 + 2.5 * vOn) * (1.0 - d * 2.0), 1.0);
}
`;

function satellites(scene: THREE.Scene, R: number, seed: number, count: number, withStation: boolean, swarm: boolean): Live {
  const rnd = rng(seed);
  const size = R * (swarm ? 0.008 : 0.013);
  const geometry = satelliteGeometry(size);
  const material = new THREE.MeshStandardMaterial({ color: swarm ? 0x9aa4b4 : 0xc8b070, metalness: 0.85, roughness: 0.3, envMapIntensity: 1 });
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.frustumCulled = false;
  const orbits: Orbit[] = [];
  for (let i = 0; i < count; i++) {
    // Low orbits mostly, a shell of high ones, a few geostationary-like far out
    const band = rnd();
    const radius = band < 0.7 ? R * (1.04 + rnd() * 0.12) : band < 0.92 ? R * (1.3 + rnd() * 0.4) : R * (2.2 + rnd() * 0.6);
    const period = 5400 * Math.pow(radius / (R * 1.06), 1.5);
    orbits.push(makeOrbit(rnd, radius, swarm ? 1.4 : 1.0, period));
  }
  scene.add(mesh);

  // Their lights, so they can be spotted against the night side
  const lights = new THREE.BufferGeometry();
  lights.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  lights.setAttribute("phase", new THREE.BufferAttribute(Float32Array.from({ length: count }, () => rnd()), 1));
  const lightMaterial = new THREE.ShaderMaterial({
    uniforms: { uWall: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }, uColor: { value: new THREE.Color(swarm ? 0x60d8ff : 0xffe0a0) } },
    vertexShader: BLINK_VERTEX,
    fragmentShader: BLINK_FRAGMENT,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const points = new THREE.Points(lights, lightMaterial);
  points.frustumCulled = false;
  scene.add(points);

  let station: THREE.Mesh | null = null;
  const stationOrbit = makeOrbit(rnd, R * 1.08, 0.9, 5600);
  if (withStation) {
    station = new THREE.Mesh(stationGeometry(R * 0.012), new THREE.MeshStandardMaterial({ color: 0xd8d8d0, metalness: 0.6, roughness: 0.4 }));
    scene.add(station);
  }

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const ahead = new THREE.Vector3();
  const scale = new THREE.Vector3(1, 1, 1);
  const positions = lights.getAttribute("position") as THREE.BufferAttribute;
  return {
    update: (time, wall) => {
      for (let i = 0; i < count; i++) {
        orbitPosition(orbits[i], time, pos);
        orbitPosition(orbits[i], time + 30, ahead);
        // Panels face along the orbit, belly to the planet
        m.lookAt(pos, ahead, pos.clone().normalize());
        q.setFromRotationMatrix(m);
        mesh.setMatrixAt(i, m.compose(pos, q, scale));
        positions.setXYZ(i, pos.x, pos.y, pos.z);
      }
      mesh.instanceMatrix.needsUpdate = true;
      positions.needsUpdate = true;
      lightMaterial.uniforms.uWall.value = wall;
      if (station) {
        orbitPosition(stationOrbit, time, station.position);
        orbitPosition(stationOrbit, time + 30, ahead);
        station.lookAt(ahead);
      }
    },
    dispose: () => {
      for (const o of [mesh, points, station]) o?.removeFromParent();
      geometry.dispose();
      material.dispose();
      lights.dispose();
      lightMaterial.dispose();
      if (station) {
        station.geometry.dispose();
        (station.material as THREE.Material).dispose();
      }
    },
  };
}

// An orbital ring around the equator: a thin structure with lit sections and tethers
function orbitalRing(scene: THREE.Scene, R: number): Live {
  const radius = R * 1.55;
  const group = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, R * 0.006, 8, 512), new THREE.MeshStandardMaterial({ color: 0x8c96a4, metalness: 0.9, roughness: 0.35 }));
  ring.rotation.x = Math.PI / 2;
  group.add(ring);
  // Tethers down to the surface at a few points
  const tetherPoints: number[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    tetherPoints.push(Math.cos(a) * R, 0, Math.sin(a) * R, Math.cos(a) * radius, 0, Math.sin(a) * radius);
  }
  const tethers = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.Float32BufferAttribute(tetherPoints, 3)), new THREE.LineBasicMaterial({ color: 0x8090a0, transparent: true, opacity: 0.5 }));
  group.add(tethers);
  // Running lights along the ring
  const n = 240;
  const lightPos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    lightPos.set([Math.cos(a) * radius, 0, Math.sin(a) * radius], i * 3);
  }
  const lights = new THREE.BufferGeometry();
  lights.setAttribute("position", new THREE.BufferAttribute(lightPos, 3));
  lights.setAttribute("phase", new THREE.BufferAttribute(Float32Array.from({ length: n }, (_, i) => i / n), 1));
  const lightMaterial = new THREE.ShaderMaterial({
    uniforms: { uWall: { value: 0 }, uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }, uColor: { value: new THREE.Color(0x60e0ff) } },
    vertexShader: BLINK_VERTEX,
    fragmentShader: BLINK_FRAGMENT,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  group.add(new THREE.Points(lights, lightMaterial));
  scene.add(group);
  return {
    surface: group,
    update: (_time, wall) => {
      lightMaterial.uniforms.uWall.value = wall;
    },
    dispose: () => {
      group.removeFromParent();
      group.traverse((o) => {
        const mesh = o as THREE.Mesh;
        mesh.geometry?.dispose();
        (mesh.material as THREE.Material | undefined)?.dispose?.();
      });
    },
  };
}

// ---- glowing shells ----------------------------------------------------------------------

const SHELL_VERTEX = /* glsl */ `
varying vec3 vObj;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
void main() {
  vObj = normalize(position);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normalize(position));
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const SHELL_COMMON = /* glsl */ `
${NOISE}
uniform float uWall;
uniform vec3 uLightDir;
uniform vec3 uColor;
uniform vec3 uColor2;
uniform float uStrength;
uniform vec3 uSeed;
varying vec3 vObj;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
float nightSide() { return 1.0 - smoothstep(-0.15, 0.25, dot(normalize(vWorldNormal), uLightDir)); }
float limb() { vec3 v = normalize(cameraPosition - vWorldPos); return pow(1.0 - abs(dot(normalize(vWorldNormal), v)), 2.0); }
`;

// Auroral ovals: curtains of green (oxygen) with red/purple fringes, around both poles
const AURORA_FRAGMENT = /* glsl */ `
${SHELL_COMMON}
void main() {
  vec3 p = normalize(vObj);
  float lat = abs(p.y);
  float lon = atan(p.z, p.x);
  float oval = exp(-pow((lat - 0.93) / 0.035, 2.0));
  float curtains = 0.5 + 0.5 * snoise(vec3(lon * 6.0, p.y * 3.0, uWall * 0.15 + uSeed.x));
  curtains *= 0.6 + 0.4 * snoise(vec3(lon * 22.0, 0.0, uWall * 0.4));
  float glow = oval * curtains * (0.3 + 0.7 * nightSide()) * (0.4 + 0.9 * limb());
  vec3 color = mix(uColor, uColor2, smoothstep(0.92, 0.97, lat));
  gl_FragColor = vec4(color * glow * uStrength, 1.0);
}
`;

// Conscious gas: luminous clouds that drift and pulse on their own
const LIVING_GAS_FRAGMENT = /* glsl */ `
${SHELL_COMMON}
void main() {
  vec3 p = normalize(vObj);
  vec3 w = vec3(snoise(p * 2.0 + uWall * 0.03), snoise(p * 2.0 + 7.0 - uWall * 0.025), snoise(p * 2.0 + 13.0));
  float n = fbmN(p * 3.0 + w * 1.2 + vec3(uWall * 0.02), 5.0);
  float body = smoothstep(0.1, 0.5, n);
  float pulse = 0.65 + 0.35 * sin(uWall * 0.7 + n * 8.0);
  vec3 color = mix(uColor, uColor2, smoothstep(0.3, 0.7, n));
  gl_FragColor = vec4(color * body * pulse * uStrength * (0.35 + 0.65 * nightSide()), 1.0);
}
`;

// A presence: a soft halo with slow ripples crossing it, brighter at the limb
const PRESENCE_FRAGMENT = /* glsl */ `
${SHELL_COMMON}
void main() {
  vec3 p = normalize(vObj);
  float ripples = 0.5 + 0.5 * sin(acos(clamp(dot(p, normalize(uSeed - 50.0)), -1.0, 1.0)) * 18.0 - uWall * 0.8);
  float veil = 0.5 + 0.5 * snoise(p * 4.0 + vec3(0.0, uWall * 0.05, 0.0));
  float glow = (limb() * 1.4 + 0.08) * (0.4 + 0.6 * ripples * veil);
  gl_FragColor = vec4(mix(uColor, uColor2, ripples) * glow * uStrength, 1.0);
}
`;

// Phase matter: interference rings travelling across a faint shell
const RIPPLES_FRAGMENT = /* glsl */ `
${SHELL_COMMON}
void main() {
  vec3 p = normalize(vObj);
  float a = acos(clamp(dot(p, normalize(uSeed - 50.0)), -1.0, 1.0));
  float b = acos(clamp(dot(p, normalize(uSeed.zxy - 50.0)), -1.0, 1.0));
  float waves = sin(a * 40.0 - uWall * 1.5) * sin(b * 40.0 + uWall * 1.2);
  float glow = pow(abs(waves), 8.0) * (0.3 + limb());
  gl_FragColor = vec4(mix(uColor, uColor2, 0.5 + 0.5 * waves) * glow * uStrength, 1.0);
}
`;

function shell(scene: THREE.Scene, R: number, scale: number, fragment: string, color: number, color2: number, strength: number, seed: number, shared: Record<string, THREE.IUniform>, turns: boolean): Live & { mesh: THREE.Mesh; material: THREE.ShaderMaterial } {
  const rnd = rng(seed);
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uWall: { value: 0 },
      uLightDir: shared.uLightDir,
      uColor: { value: new THREE.Color(color) },
      uColor2: { value: new THREE.Color(color2) },
      uStrength: { value: strength },
      uSeed: { value: new THREE.Vector3(rnd() * 100, rnd() * 100, rnd() * 100) },
      uOctaves: { value: 5 },
    },
    vertexShader: SHELL_VERTEX,
    fragmentShader: fragment,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(R * scale, 128, 64), material);
  mesh.renderOrder = 3;
  scene.add(mesh);
  return {
    mesh,
    material,
    surface: turns ? mesh : undefined,
    update: (_time, wall) => {
      material.uniforms.uWall.value = wall;
    },
    dispose: () => {
      mesh.removeFromParent();
      mesh.geometry.dispose();
      material.dispose();
    },
  };
}

// Radiation belts: two faint tori following the magnetic field (dipole L-shells)
function belts(scene: THREE.Scene, R: number): Live {
  const group = new THREE.Group();
  const material = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(0x6aa8ff) }, uWall: { value: 0 } },
    vertexShader: /* glsl */ `
      varying vec3 vNormal; varying vec3 vView;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vNormal = normalize(normalMatrix * normal); vView = -mv.xyz; gl_Position = projectionMatrix * mv; }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor; uniform float uWall; varying vec3 vNormal; varying vec3 vView;
      void main() { float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 4.0); gl_FragColor = vec4(uColor * rim * (0.07 + 0.02 * sin(uWall * 0.5)), 1.0); }
    `,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  for (const [radius, thickness] of [
    [1.7, 0.35],
    [3.2, 0.9],
  ]) {
    const torus = new THREE.Mesh(new THREE.TorusGeometry(R * radius, R * thickness, 32, 128), material);
    torus.rotation.x = Math.PI / 2;
    // Crescent cross-section of a dipole belt: taller than it is wide
    torus.scale.z = 1.3;
    group.add(torus);
  }
  scene.add(group);
  return {
    update: (_t, wall) => {
      material.uniforms.uWall.value = wall;
    },
    dispose: () => {
      group.removeFromParent();
      group.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      material.dispose();
    },
  };
}

// ---- plumes ------------------------------------------------------------------------------

const PLUME_VERTEX = /* glsl */ `
attribute vec3 vent;     // direction of the vent on the unit sphere
attribute vec4 params;   // phase, speed, spread angle, size
uniform float uWall;
uniform float uRadius;
uniform float uHeight;
uniform float uRate;
uniform float uGravity;
uniform float uPixelRatio;
uniform float uWind;
varying float vAge;
varying float vSeed;
void main() {
  float t = fract(uWall * uRate * params.y + params.x);
  vAge = t;
  vSeed = params.x;
  vec3 up = normalize(vent);
  vec3 side = normalize(cross(up, abs(up.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
  vec3 side2 = cross(up, side);
  float a = params.x * 61.0;
  vec3 out_ = side * cos(a) + side2 * sin(a);
  // Ballistic rise and fall (or a buoyant column that spreads), carried by the wind
  float h = uHeight * (t * 2.0 - uGravity * t * t);
  vec3 pos = up * (uRadius + max(h, 0.0)) + out_ * uHeight * params.z * t + side * uWind * uHeight * t * t;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = params.w * (0.4 + t * 1.8) * uPixelRatio * 300.0 / -mv.z;
  gl_Position = projectionMatrix * mv;
}
`;

const PLUME_FRAGMENT = /* glsl */ `
uniform vec3 uHot;
uniform vec3 uCool;
uniform float uGlow;
uniform float uOpacity;
uniform vec3 uLightDir;
varying float vAge;
varying float vSeed;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float soft = (1.0 - d * d);
  // Glowing when fresh, cooling to ash or vapour as it ages
  vec3 color = mix(uHot, uCool, smoothstep(0.0, 0.45, vAge));
  float fade = smoothstep(0.0, 0.05, vAge) * (1.0 - smoothstep(0.6, 1.0, vAge));
  float emissive = uGlow * (1.0 - smoothstep(0.0, 0.35, vAge));
  // Ash and vapour thin out as they spread
  float thin = 1.0 - 0.75 * smoothstep(0.2, 0.9, vAge);
  gl_FragColor = vec4(color * (0.35 + emissive * 2.5), soft * soft * fade * thin * uOpacity);
}
`;

interface PlumeStyle {
  vents: number;
  particlesPerVent: number;
  height: number; // fraction of R
  rate: number;
  gravity: number; // 0..1 (1 = falls back, ballistic)
  spread: number;
  size: number; // fraction of R
  hot: number;
  cool: number;
  glow: number;
  opacity: number;
  additive: boolean;
  wind: number;
  latitude?: [number, number]; // band of |sin(lat)| where vents sit
}

const PLUME_STYLES: Record<"volcanic" | "smoke" | "seeps" | "snow", PlumeStyle> = {
  // Io's plumes rise a tenth of its radius or more; these are a little generous so they
  // read from orbit
  volcanic: { vents: 7, particlesPerVent: 260, height: 0.16, rate: 0.1, gravity: 1, spread: 0.7, size: 0.022, hot: 0xffa040, cool: 0x3a3028, glow: 1, opacity: 0.9, additive: false, wind: 0.3 },
  smoke: { vents: 9, particlesPerVent: 200, height: 0.1, rate: 0.05, gravity: 0.2, spread: 0.35, size: 0.03, hot: 0x4a4440, cool: 0x201e22, glow: 0, opacity: 0.6, additive: false, wind: 1.6 },
  seeps: { vents: 12, particlesPerVent: 120, height: 0.05, rate: 0.07, gravity: 0.1, spread: 0.6, size: 0.024, hot: 0xa8ff70, cool: 0x5a8a40, glow: 0.3, opacity: 0.4, additive: true, wind: 1.0 },
  snow: { vents: 10, particlesPerVent: 160, height: 0.025, rate: 0.08, gravity: 0, spread: 1.6, size: 0.03, hot: 0xf4f8ff, cool: 0xdfe8f4, glow: 0, opacity: 0.3, additive: false, wind: 3.0, latitude: [0.6, 0.95] },
};

function plumes(scene: THREE.Scene, R: number, seed: number, style: PlumeStyle, shared: Record<string, THREE.IUniform>): Live {
  const rnd = rng(seed);
  const count = style.vents * style.particlesPerVent;
  const vent = new Float32Array(count * 3);
  const params = new Float32Array(count * 4);
  for (let v = 0; v < style.vents; v++) {
    let dir = randomDirection(rnd);
    if (style.latitude) {
      const y = (style.latitude[0] + rnd() * (style.latitude[1] - style.latitude[0])) * (rnd() < 0.5 ? -1 : 1);
      const s = Math.sqrt(1 - y * y);
      const a = rnd() * Math.PI * 2;
      dir = new THREE.Vector3(s * Math.cos(a), y, s * Math.sin(a));
    }
    const strength = 0.6 + rnd() * 0.8;
    for (let i = 0; i < style.particlesPerVent; i++) {
      const k = v * style.particlesPerVent + i;
      vent.set([dir.x, dir.y, dir.z], k * 3);
      params.set([rnd(), (0.7 + rnd() * 0.6) * strength, rnd() * style.spread, R * style.size * (0.6 + rnd() * 0.8)], k * 4);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  geometry.setAttribute("vent", new THREE.BufferAttribute(vent, 3));
  geometry.setAttribute("params", new THREE.BufferAttribute(params, 4));
  const material = new THREE.ShaderMaterial({
    uniforms: {
      uWall: { value: 0 },
      uRadius: { value: R * 1.002 },
      uHeight: { value: R * style.height },
      uRate: { value: style.rate },
      uGravity: { value: style.gravity },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      uWind: { value: style.wind },
      uHot: { value: new THREE.Color(style.hot) },
      uCool: { value: new THREE.Color(style.cool) },
      uGlow: { value: style.glow },
      uOpacity: { value: style.opacity },
      uLightDir: shared.uLightDir,
    },
    vertexShader: PLUME_VERTEX,
    fragmentShader: PLUME_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: style.additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.renderOrder = 1;
  scene.add(points);
  return {
    surface: points,
    update: (_t, wall) => {
      material.uniforms.uWall.value = wall;
    },
    dispose: () => {
      points.removeFromParent();
      geometry.dispose();
      material.dispose();
    },
  };
}

// ---- odd things in orbit -------------------------------------------------------------------

function monolith(scene: THREE.Scene, R: number, seed: number): Live {
  const rnd = rng(seed);
  const size = R * 0.06;
  const group = new THREE.Group();
  const box = new THREE.BoxGeometry(size, size, size);
  const cube = new THREE.Mesh(box, new THREE.MeshPhysicalMaterial({ color: 0x050507, metalness: 0.3, roughness: 0.08, clearcoat: 1 }));
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x80c8ff, transparent: true, blending: THREE.AdditiveBlending });
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box), edgeMaterial);
  group.add(cube, edges);
  scene.add(group);
  const orbit = makeOrbit(rnd, R * 1.9, 0.5, 40000);
  return {
    update: (time, wall) => {
      orbitPosition(orbit, time, group.position);
      group.rotation.set(wall * 0.05, wall * 0.08, 0);
      edgeMaterial.opacity = 0.35 + 0.65 * Math.pow(0.5 + 0.5 * Math.sin(wall * 1.2), 3);
    },
    dispose: () => {
      group.removeFromParent();
      box.dispose();
      edges.geometry.dispose();
      (cube.material as THREE.Material).dispose();
      edgeMaterial.dispose();
    },
  };
}

// Tumbling bodies in a loose swarm: exotic shards, or the debris of a broken crust
function tumblers(scene: THREE.Scene, R: number, seed: number, kind: "shards" | "debris"): Live {
  const rnd = rng(seed);
  const count = kind === "shards" ? 70 : 600;
  let geometry: THREE.BufferGeometry;
  let material: THREE.Material;
  if (kind === "shards") {
    geometry = new THREE.OctahedronGeometry(R * 0.02, 0).scale(0.5, 1.8, 0.5);
    material = new THREE.MeshPhysicalMaterial({ color: 0xc8b8ff, metalness: 0.1, roughness: 0.05, iridescence: 1, iridescenceIOR: 1.6, clearcoat: 1, emissive: 0x2a1060, emissiveIntensity: 0.6 });
  } else {
    // Irregular rocks: a dodecahedron with its vertices pushed around
    geometry = new THREE.DodecahedronGeometry(R * 0.012, 1);
    const p = geometry.getAttribute("position") as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) p.setXYZ(i, p.getX(i) * (0.7 + rnd() * 0.6), p.getY(i) * (0.6 + rnd() * 0.5), p.getZ(i) * (0.7 + rnd() * 0.6));
    geometry.computeVertexNormals();
    material = new THREE.MeshStandardMaterial({ color: 0x6a625a, roughness: 0.95, metalness: 0.05, flatShading: true });
  }
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.frustumCulled = false;
  const orbits: Orbit[] = [];
  const spins: THREE.Vector3[] = [];
  const scales: number[] = [];
  for (let i = 0; i < count; i++) {
    const radius = kind === "shards" ? R * (1.4 + rnd() * 0.8) : R * (1.15 + Math.pow(rnd(), 2) * 0.6);
    orbits.push(makeOrbit(rnd, radius, kind === "shards" ? 1.2 : 0.15, 9000 * Math.pow(radius / R, 1.5)));
    spins.push(new THREE.Vector3(rnd(), rnd(), rnd()).multiplyScalar(0.4));
    scales.push(kind === "shards" ? 0.5 + rnd() : 0.3 + Math.pow(rnd(), 3) * 2.5);
  }
  scene.add(mesh);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const pos = new THREE.Vector3();
  const s = new THREE.Vector3();
  return {
    update: (time, wall) => {
      for (let i = 0; i < count; i++) {
        orbitPosition(orbits[i], time, pos);
        e.set(spins[i].x * wall, spins[i].y * wall, spins[i].z * wall);
        q.setFromEuler(e);
        s.setScalar(scales[i]);
        mesh.setMatrixAt(i, m.compose(pos, q, s));
      }
      mesh.instanceMatrix.needsUpdate = true;
    },
    dispose: () => {
      mesh.removeFromParent();
      geometry.dispose();
      material.dispose();
    },
  };
}

// Polar jets: narrow beams leaving both poles, flickering
function jets(scene: THREE.Scene, R: number, shared: Record<string, THREE.IUniform>): Live {
  const material = new THREE.ShaderMaterial({
    uniforms: { uWall: { value: 0 }, uColor: { value: new THREE.Color(0x9ad0ff) }, uLightDir: shared.uLightDir, uOctaves: { value: 3 } },
    vertexShader: /* glsl */ `
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
      void main() { vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vNormal = normalize(normalMatrix * normal); vView = -mv.xyz; gl_Position = projectionMatrix * mv; }
    `,
    fragmentShader: /* glsl */ `
      ${NOISE}
      uniform float uWall; uniform vec3 uColor; varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
      void main() {
        float core = pow(abs(dot(normalize(vNormal), normalize(vView))), 2.0);
        float knots = 0.6 + 0.4 * snoise(vec3(vUv.y * 12.0 - uWall * 2.0, 0.0, 0.0));
        float fade = (1.0 - vUv.y) * smoothstep(0.0, 0.05, vUv.y);
        gl_FragColor = vec4(uColor * core * knots * fade * 1.6, 1.0);
      }
    `,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const group = new THREE.Group();
  for (const sign of [1, -1]) {
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.08, R * 0.015, R * 3, 24, 1, true), material);
    cone.position.y = sign * R * 2.5;
    if (sign < 0) cone.rotation.z = Math.PI;
    group.add(cone);
  }
  scene.add(group);
  return {
    surface: group,
    update: (_t, wall) => {
      material.uniforms.uWall.value = wall;
    },
    dispose: () => {
      group.removeFromParent();
      group.traverse((o) => (o as THREE.Mesh).geometry?.dispose());
      material.dispose();
    },
  };
}

// ---- "Have I just found God?" ---------------------------------------------------------
//
// The rarest life in the universe, and the old effect's soul in the new light: gold and
// white, sacred geometry, and the code of creation. A corona with slow rays of light
// breaking past the limb; three armillary rings engraved with ones and zeros, turning
// at their own pace; a lattice of great circles (the icosahedron's symmetry) glowing on
// the ground, brightest on the night side, with pulses running along it; golden motes in
// orbit; and every few seconds a wave of light rising off the planet.

const DIVINE_GOLD = 0xffd27a;
const DIVINE_WHITE = 0xfff4dc;

const RAYS_VERTEX = /* glsl */ `
uniform float uR;
varying vec2 vP;
varying float vSilhouette;
void main() {
  // A billboard at the planet's centre, facing the camera
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float d = length(mv.xyz);
  // The planet's silhouette radius, measured in that plane
  vSilhouette = uR * d / sqrt(max(d * d - uR * uR, 1e-6));
  vP = position.xy;
  mv.xy += position.xy;
  gl_Position = projectionMatrix * mv;
}
`;

const RAYS_FRAGMENT = /* glsl */ `
${NOISE}
uniform float uWall;
uniform vec3 uColor;
uniform vec3 uColor2;
varying vec2 vP;
varying float vSilhouette;
void main() {
  float x = length(vP) / vSilhouette;
  if (x < 0.995) discard;
  float a = atan(vP.y, vP.x);
  vec2 ring = vec2(cos(a), sin(a));
  // Rays: broad and fine, drifting round, each brightening and fading on its own
  float broad = 0.5 + 0.5 * snoise(vec3(ring * 2.2, uWall * 0.06));
  float fine = pow(0.5 + 0.5 * snoise(vec3(ring * 9.0, uWall * 0.11 + 4.0)), 3.0);
  float rays = broad * 0.6 + fine * 0.8;
  float reach = exp(-(x - 1.0) * (1.6 + 1.4 * (1.0 - broad)));
  float corona = exp(-(x - 1.0) * 10.0);
  float breathe = 0.82 + 0.18 * sin(uWall * 0.5);
  vec3 color = mix(uColor, uColor2, corona) * (corona * 1.1 + rays * reach * 0.55) * breathe;
  gl_FragColor = vec4(color, 1.0);
}
`;

const ARMILLARY_FRAGMENT = /* glsl */ `
uniform float uWall;
uniform float uInner;
uniform float uOuter;
uniform float uCells;
uniform float uSpeed;
uniform float uSeedF;
uniform vec3 uColor;
uniform vec3 uColor2;
varying vec2 vPos;
float hash(float n) { return fract(sin(n * 12.9898 + uSeedF) * 43758.5453); }
void main() {
  float r = length(vPos);
  float t = (r - uInner) / (uOuter - uInner);
  float a = atan(vPos.y, vPos.x) / 6.2831853 + 0.5;
  // Hairlines along both edges
  float lines = exp(-pow((t - 0.1) / 0.025, 2.0)) + exp(-pow((t - 0.9) / 0.025, 2.0));
  // The engraved code: one glyph per cell, a 0 or a 1, flickering as it is rewritten
  float u = a * uCells + uWall * uSpeed;
  float id = floor(u);
  vec2 g = vec2(fract(u), (t - 0.28) / 0.44);
  float inside = step(0.0, g.y) * step(g.y, 1.0);
  float bit = step(0.5, hash(id + floor(uWall * 0.4 + hash(id) * 10.0)));
  float one = smoothstep(0.09, 0.03, abs(g.x - 0.5)) * smoothstep(0.0, 0.08, g.y) * smoothstep(1.0, 0.92, g.y);
  float zero = smoothstep(0.1, 0.03, abs(length((g - 0.5) * vec2(2.4, 2.0)) - 0.78));
  float glyph = mix(zero, one, bit) * inside;
  // Ticks between the glyphs
  float ticks = smoothstep(0.03, 0.0, abs(fract(u) - 0.0)) * smoothstep(0.35, 0.3, abs(t - 0.5));
  float flicker = 0.6 + 0.4 * sin(uWall * 3.0 + id * 1.7);
  // A faint band of light carrying the code
  float band = smoothstep(0.0, 0.12, t) * smoothstep(1.0, 0.88, t) * 0.08;
  vec3 color = mix(uColor, uColor2, glyph) * (band + lines * 1.1 + glyph * 1.3 * flicker + ticks * 0.4);
  gl_FragColor = vec4(color, 1.0);
}
`;

const LATTICE_FRAGMENT = /* glsl */ `
${SHELL_COMMON}
uniform vec3 uAxes[6];
void main() {
  vec3 p = normalize(vObj);
  float web = 0.0;
  float pulses = 0.0;
  for (int i = 0; i < 6; i++) {
    float d = abs(dot(p, uAxes[i]));
    float line = exp(-pow(d / 0.006, 2.0)) + exp(-pow(d / 0.03, 2.0)) * 0.25;
    web += line;
    // Light travelling along each great circle
    vec3 u = normalize(cross(uAxes[i], vec3(0.31, 0.83, 0.47)));
    vec3 v = cross(uAxes[i], u);
    float along = atan(dot(p, v), dot(p, u));
    pulses += line * pow(0.5 + 0.5 * sin(along * 3.0 - uWall * 1.3 + float(i) * 2.1), 12.0);
  }
  float glow = (web * 0.35 + pulses * 1.2) * (0.25 + 0.75 * nightSide()) * (0.6 + 0.6 * limb());
  gl_FragColor = vec4(mix(uColor, uColor2, clamp(pulses, 0.0, 1.0)) * glow * uStrength, 1.0);
}
`;

const MOTES_VERTEX = /* glsl */ `
attribute vec4 orbit;   // radius, inclination, node, phase
attribute float speed;
attribute float twinkle;
uniform float uTime;
uniform float uWall;
uniform float uPixels;
varying float vGlow;
void main() {
  float a = orbit.w + uWall * speed;
  vec3 p = vec3(cos(a), 0.0, sin(a)) * orbit.x;
  float ci = cos(orbit.y), si = sin(orbit.y);
  p = vec3(p.x, -p.z * si, p.z * ci);
  float cn = cos(orbit.z), sn = sin(orbit.z);
  p = vec3(p.x * cn - p.z * sn, p.y, p.x * sn + p.z * cn);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vGlow = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(uWall * (1.0 + twinkle * 2.0) + twinkle * 40.0), 3.0);
  gl_PointSize = clamp(uPixels * orbit.x * 0.012 / -mv.z, 1.5, 9.0);
  gl_Position = projectionMatrix * mv;
}
`;

const MOTES_FRAGMENT = /* glsl */ `
uniform vec3 uColor;
varying float vGlow;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;
  float core = exp(-d * d * 7.0);
  gl_FragColor = vec4(mix(uColor, vec3(1.0), core * 0.5) * core * vGlow, 1.0);
}
`;

const WAVE_FRAGMENT = /* glsl */ `
uniform float uAge;
uniform vec3 uColor;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main() {
  vec3 v = normalize(cameraPosition - vWorldPos);
  // A rim that fades again right at the silhouette, so the wave has no hard edge
  float grazing = 1.0 - abs(dot(normalize(vWorldNormal), v));
  float rim = pow(grazing, 3.0) * (1.0 - pow(grazing, 14.0));
  float fade = (1.0 - uAge) * smoothstep(0.0, 0.08, uAge);
  gl_FragColor = vec4(uColor * rim * fade * 0.7, 1.0);
}
`;

function divine(scene: THREE.Scene, R: number, seed: number, shared: Record<string, THREE.IUniform>): Live {
  const rnd = rng(seed);
  const group = new THREE.Group();
  const additive = { blending: THREE.AdditiveBlending, transparent: true, depthWrite: false } as const;
  const disposables: Array<{ dispose: () => void }> = [];
  const materials: THREE.ShaderMaterial[] = [];

  // Corona and rays, from behind the limb
  const raysMaterial = new THREE.ShaderMaterial({
    uniforms: { uWall: { value: 0 }, uR: { value: R }, uColor: { value: new THREE.Color(DIVINE_GOLD) }, uColor2: { value: new THREE.Color(DIVINE_WHITE) }, uOctaves: { value: 3 } },
    vertexShader: RAYS_VERTEX,
    fragmentShader: RAYS_FRAGMENT,
    ...additive,
  });
  const raysGeometry = new THREE.PlaneGeometry(R * 9, R * 9);
  const rays = new THREE.Mesh(raysGeometry, raysMaterial);
  rays.frustumCulled = false;
  rays.renderOrder = 4;
  group.add(rays);
  disposables.push(raysGeometry, raysMaterial);
  materials.push(raysMaterial);

  // Armillary rings engraved with the code
  const rings: Array<{ mesh: THREE.Mesh; spin: number; base: number }> = [];
  for (let i = 0; i < 3; i++) {
    const inner = R * (1.6 + i * 0.36);
    const width = R * 0.13;
    const geometry = new THREE.RingGeometry(inner, inner + width, 256, 1);
    const mid = inner + width / 2;
    const cells = Math.round((Math.PI * 2 * mid) / (width * 0.44 * 0.62));
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uWall: { value: 0 },
        uInner: { value: inner },
        uOuter: { value: inner + width },
        uCells: { value: cells },
        uSpeed: { value: (0.6 + rnd() * 0.8) * (i % 2 ? -1 : 1) },
        uSeedF: { value: rnd() * 100 },
        uColor: { value: new THREE.Color(DIVINE_GOLD) },
        uColor2: { value: new THREE.Color(DIVINE_WHITE) },
      },
      vertexShader: "varying vec2 vPos; void main() { vPos = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: ARMILLARY_FRAGMENT,
      side: THREE.DoubleSide,
      ...additive,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 4;
    mesh.rotation.set(Math.PI / 2 + (rnd() - 0.5) * 1.4, (rnd() - 0.5) * 1.4, rnd() * Math.PI);
    group.add(mesh);
    // (Euler XYZ: the z turn is about the ring's own axis)
    rings.push({ mesh, spin: (0.02 + rnd() * 0.03) * (i % 2 ? -1 : 1), base: mesh.rotation.z });
    disposables.push(geometry, material);
    materials.push(material);
  }

  // The lattice of great circles on the ground (icosahedral axes)
  const phi = (1 + Math.sqrt(5)) / 2;
  const axes = [
    [0, 1, phi],
    [0, -1, phi],
    [1, phi, 0],
    [-1, phi, 0],
    [phi, 0, 1],
    [-phi, 0, 1],
  ].map(([x, y, z]) => new THREE.Vector3(x, y, z).normalize());
  const lattice = shell(scene, R, 1.004, LATTICE_FRAGMENT, DIVINE_GOLD, DIVINE_WHITE, 0.55, seed + 11, shared, true);
  lattice.material.uniforms.uAxes = { value: axes };

  // Golden motes in orbit
  const count = 700;
  const orbit = new Float32Array(count * 4);
  const speed = new Float32Array(count);
  const twinkle = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    orbit.set([R * (1.15 + Math.pow(rnd(), 1.5) * 1.6), (rnd() - 0.5) * 2.4, rnd() * Math.PI * 2, rnd() * Math.PI * 2], i * 4);
    speed[i] = (0.03 + rnd() * 0.06) * (rnd() < 0.5 ? -1 : 1);
    twinkle[i] = rnd();
  }
  const motesGeometry = new THREE.BufferGeometry();
  motesGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
  motesGeometry.setAttribute("orbit", new THREE.BufferAttribute(orbit, 4));
  motesGeometry.setAttribute("speed", new THREE.BufferAttribute(speed, 1));
  motesGeometry.setAttribute("twinkle", new THREE.BufferAttribute(twinkle, 1));
  const motesMaterial = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uWall: { value: 0 }, uPixels: { value: 900 }, uColor: { value: new THREE.Color(DIVINE_GOLD) } },
    vertexShader: MOTES_VERTEX,
    fragmentShader: MOTES_FRAGMENT,
    ...additive,
  });
  const motes = new THREE.Points(motesGeometry, motesMaterial);
  motes.frustumCulled = false;
  group.add(motes);
  disposables.push(motesGeometry, motesMaterial);
  materials.push(motesMaterial);

  // Waves of light rising off the planet
  const waveGeometry = new THREE.SphereGeometry(R, 96, 48);
  const waves = [0, 1].map(() => {
    const material = new THREE.ShaderMaterial({ uniforms: { uAge: { value: 0 }, uColor: { value: new THREE.Color(DIVINE_WHITE) } }, vertexShader: SHELL_VERTEX, fragmentShader: WAVE_FRAGMENT, ...additive });
    const mesh = new THREE.Mesh(waveGeometry, material);
    mesh.renderOrder = 4;
    group.add(mesh);
    disposables.push(material);
    return { mesh, material };
  });
  disposables.push(waveGeometry);

  scene.add(group);
  return {
    update: (_time, wall) => {
      for (const m of materials) m.uniforms.uWall.value = wall;
      lattice.update(_time, wall);
      for (const ring of rings) ring.mesh.rotation.z = ring.base + wall * ring.spin;
      waves.forEach((wave, i) => {
        const age = ((wall / 7 + i * 0.5) % 1 + 1) % 1;
        wave.material.uniforms.uAge.value = age;
        wave.mesh.scale.setScalar(1.02 + age * 2.2);
      });
    },
    dispose: () => {
      group.removeFromParent();
      lattice.dispose();
      disposables.forEach((d) => d.dispose());
    },
    surface: lattice.mesh,
  };
}

// ---- assembly ------------------------------------------------------------------------------

export interface EffectContext {
  scene: THREE.Scene;
  radius: number;
  seed: number;
  shared: Record<string, THREE.IUniform>;
  auroraColor?: [number, number];
}

export class PlanetEffects {
  private live: Live[] = [];

  constructor(kinds: Set<EffectKind>, ctx: EffectContext) {
    const { scene, radius: R, seed, shared } = ctx;
    let n = 0;
    const s = () => seed + 7919 * ++n;
    for (const kind of kinds) {
      switch (kind) {
        case "satellites":
          this.live.push(satellites(scene, R, s(), 48, true, false));
          break;
        case "swarm":
          this.live.push(satellites(scene, R, s(), 320, false, true), orbitalRing(scene, R));
          break;
        case "aurora":
          this.live.push(shell(scene, R, 1.03, AURORA_FRAGMENT, ctx.auroraColor?.[0] ?? 0x40ff90, ctx.auroraColor?.[1] ?? 0xff4080, 1.4, s(), shared, false));
          break;
        case "belts":
          this.live.push(belts(scene, R));
          break;
        case "volcanic":
        case "smoke":
        case "seeps":
        case "snow":
          this.live.push(plumes(scene, R, s(), PLUME_STYLES[kind], shared));
          break;
        case "livingGas":
          this.live.push(shell(scene, R, 1.018, LIVING_GAS_FRAGMENT, 0xb060ff, 0x40e0ff, 0.9, s(), shared, true));
          break;
        case "presence":
          this.live.push(shell(scene, R, 1.12, PRESENCE_FRAGMENT, 0xe0f4ff, 0xa0c0ff, 0.5, s(), shared, false));
          break;
        case "ripples":
          this.live.push(shell(scene, R, 1.08, RIPPLES_FRAGMENT, 0x8a5cff, 0x40c0ff, 0.8, s(), shared, false));
          break;
        case "monolith":
          this.live.push(monolith(scene, R, s()));
          break;
        case "shards":
          this.live.push(tumblers(scene, R, s(), "shards"));
          break;
        case "debris":
          this.live.push(tumblers(scene, R, s(), "debris"));
          break;
        case "jets":
          this.live.push(jets(scene, R, shared));
          break;
        case "divine":
          this.live.push(divine(scene, R, s(), shared));
          break;
      }
    }
  }

  // `time`: cosmic seconds (orbits); `wall`: real seconds (flickers, plumes); `rotation`:
  // the planet's own rotation, followed by what sits on its surface
  update(time: number, wall: number, rotation: THREE.Quaternion) {
    for (const item of this.live) {
      item.surface?.quaternion.copy(rotation);
      item.update(time, wall);
    }
  }

  dispose() {
    this.live.forEach((item) => item.dispose());
    this.live = [];
  }
}

// Which effects a planet gets, from its type, its surface and its life (the same planets
// that had them in the original renderer)
export function effectKinds(data: any): Set<EffectKind> {
  const kinds = new Set<EffectKind>();
  const type = String(data?.planet_info?.type ?? data?.original_planet_data?.planet_type ?? "").toLowerCase().replace(/_/g, " ");
  const life = String(data?.original_planet_data?.life_forms ?? "None");
  const surface = data?.surface_elements ?? {};
  if (life === "Intelligent Life") kinds.add("satellites");
  if (life === "Robotic Entities") kinds.add("swarm");
  if (life === "Conscious Gas") kinds.add("livingGas");
  if (life === "Non-Physical Entity") kinds.add("presence");
  if (life === "Have I just found God?") kinds.add("divine");
  if (type === "lava" || type === "molten core" || type === "magma") kinds.add("volcanic");
  if (type === "carbon") kinds.add("smoke");
  if (type === "toxic" || (type === "swamp" && surface.toxic_bubbles)) kinds.add("seeps");
  // Blowing snow on tundras; the same drift carries dust and spores on deserts, carbon and toxic worlds
  if (type === "tundra" || type === "desert" || type === "carbon" || type === "toxic") kinds.add("snow");
  if (type === "radioactive") {
    kinds.add("belts");
    kinds.add("aurora");
  }
  if (type === "exotic") kinds.add("shards");
  if (type === "anomaly") {
    kinds.add("ripples");
    kinds.add("monolith");
    kinds.add("jets");
  }
  if (surface.has_fragmentation_zones) kinds.add("debris");
  return kinds;
}
