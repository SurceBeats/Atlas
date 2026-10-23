// atlas-ui/react/static/js/Explore/galaxy/ExoticLayer.ts
//
// The exotic landmarks of a galaxy, drawn in the deep-sky pass (light years, camera
// relative): black holes with an accretion disk (and a gravitational lens applied in
// the tonemap pass), pulsars sweeping their beams, and the relativistic jets of a
// quasar core. Sizes are exaggerated, as everything else in the explorer, so they can
// be found and visited; every object also carries a small beacon visible from afar.
//
// A Singularity Void has none of them: it is the universe before its Bit Bang, and at
// its heart is the primordial torus (core/torus), as the creation shows it before time,
// inside a lattice of cubes like the universe grid's. It is in superposition: the same
// torus, in step, in every cell around it.

import * as THREE from "three";
import type { PointOfInterest } from "./GalaxyModel.ts";
import { hashString, SeededRng } from "../core/hash.ts";
import { primordial, RING, rng, TUBE, torusGeometry, torusMaterial } from "../core/torus.ts";
import { NOISE } from "../planet/realistic/glsl.ts";

// The primordial torus in the explorer: light years per unit of the creation's torus, and
// the side of each cube of its lattice (3 × 3 × 3 cells, it at the centre of the middle one)
const TORUS_SCALE = 2;
const TORUS_CELL = 16;
// The tension it holds before time, as the creation has it (it never saturates here)
const TORUS_TENSION = 0.6;
// The copies in the cells around it are fainter: what could be, not what is
const ECHO_ALPHA = 0.22;

const DISK_VERTEX = /* glsl */ `
  varying vec2 vLocal;
  varying float vBeaming;
  void main() {
    vLocal = position.xy;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Orbital velocity of the gas (tangent to the ring) against the line of sight:
    // the side moving towards us is boosted (relativistic beaming)
    vec3 velocity = normalize((modelViewMatrix * vec4(-position.y, position.x, 0.0, 0.0)).xyz);
    vBeaming = 1.0 + 0.75 * dot(velocity, -normalize(mv.xyz));
    gl_Position = projectionMatrix * mv;
  }
`;

const DISK_FRAGMENT = /* glsl */ `
  uniform float uTime;
  uniform float uInner;
  uniform float uOuter;
  uniform float uIntensity;
  varying vec2 vLocal;
  varying float vBeaming;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    float r = length(vLocal);
    float t = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);
    float angle = atan(vLocal.y, vLocal.x);
    // Keplerian shear: inner gas laps the outer gas
    float swirl = angle * 3.0 + log(r / uInner) * 9.0 - uTime * 1.6 / pow(max(r / uInner, 1.0), 1.5);
    float streaks = 0.65 + 0.35 * sin(swirl) * sin(swirl * 2.3 + 1.7);
    float edge = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.55, 1.0, t));
    vec3 hot = vec3(1.0, 0.95, 0.85);
    vec3 warm = vec3(1.0, 0.55, 0.2);
    vec3 color = mix(hot, warm, smoothstep(0.0, 0.7, t));
    float brightness = edge * streaks * pow(1.0 - t, 1.6) * pow(max(vBeaming, 0.05), 3.0);
    gl_FragColor = vec4(color * brightness * uIntensity, 1.0);
  }
`;

const BEAM_VERTEX = /* glsl */ `
  varying float vAlong;
  varying float vRim;
  void main() {
    vAlong = uv.y;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    vRim = abs(dot(n, normalize(-mv.xyz)));
    gl_Position = projectionMatrix * mv;
  }
`;

const BEAM_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  uniform float uFlow;
  uniform float uSubpulses;
  varying float vAlong;
  varying float vRim;
  void main() {
    // Bright at the source, fading outwards; knots travel along jets
    float fade = pow(1.0 - vAlong, 1.4);
    float knots = 1.0 + uFlow * 0.6 * sin(vAlong * 46.0 - uTime * 4.0);
    float core = vRim * vRim;
    // A pulsar's emission cone is hollow: brighter towards its walls (low rim), and no
    // two pulses are alike: the whole beam flickers from one to the next
    float hollow = mix(1.0, 0.35 + 1.3 * (1.0 - vRim) * vRim * 2.0, uSubpulses);
    float pulses = 1.0 + uSubpulses * 0.25 * sin(uTime * 7.3) * sin(uTime * 3.1 + 1.3);
    gl_FragColor = vec4(uColor * fade * knots * core * hollow * pulses * uIntensity, 1.0);
  }
`;

// A pulsar wind nebula and its jets (Chandra's Crab and Vela), ray-marched through a
// sphere in the pulsar's spin frame (+Y the spin axis): a thick, turbulent torus in the
// equator, wisps travelling out from it, Doppler-brighter on the side whose outflow
// comes towards us, and jets along the axis. The jets stand still while the beams sweep
const VOLUME_VERTEX = /* glsl */ `
  uniform float uRadius;
  varying vec3 vLocal;
  varying vec3 vCamera;
  void main() {
    vLocal = position * uRadius;
    // The camera in the nebula's frame (modelView is a rotation and a translation)
    vCamera = transpose(mat3(modelViewMatrix)) * -modelViewMatrix[3].xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vLocal, 1.0);
  }
`;

const VOLUME_FRAGMENT = /* glsl */ `
  ${NOISE}
  uniform float uTime;
  uniform float uRadius;
  uniform float uTorus;
  uniform float uIntensity;
  uniform int uSteps;
  varying vec3 vLocal;
  varying vec3 vCamera;

  float hash12(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  vec3 nebulaEmission(vec3 p, vec3 toCamera, float R, float radius, float time) {
    float r = length(p);
    float rho = length(p.xz);
    float y = p.y;
    // X-ray hot near the pulsar, violet further out; all of it gone before the bounding
    // sphere's edge
    vec3 color = mix(vec3(0.78, 0.9, 1.0), vec3(0.5, 0.32, 1.0), smoothstep(0.6, 2.0, r / R)) * (1.0 - smoothstep(0.8, 1.0, r / radius));
    // Jets along the spin axis, widening and fading, knots flowing out
    float ay = abs(y);
    float width = R * 0.06 * (1.0 + ay / R * 0.4);
    float jet = exp(-rho * rho / (width * width)) * exp(-ay / (R * 2.2)) * smoothstep(R * 0.05, R * 0.3, ay);
    jet *= 0.65 + 0.35 * sin(ay / R * 12.0 - time * 2.5);
    float halo = exp(-r * r / (R * R * 3.0)) * 0.05;
    vec3 light = color * halo + vec3(0.5, 0.65, 1.0) * jet * 2.5;
    // The torus, thick and turbulent, and the outflow in the equator beyond it
    vec2 q = vec2(rho - R, y);
    float h = R * 0.18;
    float torus = exp(-dot(q, q) / (h * h)) * 2.0;
    float sheet = exp(-y * y / (h * h * 0.15)) * exp(-rho * rho / (R * R * 5.0)) * smoothstep(R * 0.2, R * 0.6, rho);
    // No plasma here: skip the costly part
    if (torus + sheet < 0.004) return light;
    // Wisps travelling out as bent, broken arcs
    float angle = atan(p.z, p.x);
    float bend = sin(angle * 2.0 + time * 0.15) * 1.6 + sin(angle * 5.0 - time * 0.1 + 2.1) * 0.7;
    float wisps = pow(0.5 + 0.5 * sin(rho / R * 9.0 - time * 1.2 + bend), 4.0);
    // Clumpy, knotted plasma
    float turbulence = 0.6 + 0.4 * snoise(p / R * 4.0 + vec3(0.0, time * 0.04, 0.0));
    // Doppler: the outflow is radial in the equator
    vec3 outflow = rho > 1e-9 ? vec3(p.x, 0.0, p.z) / rho : vec3(0.0);
    float boost = pow(max(1.0 + 0.6 * dot(outflow, toCamera), 0.05), 2.0);
    return light + color * (torus + sheet * wisps * 0.9) * turbulence * boost;
  }

  void main() {
    vec3 dir = normalize(vLocal - vCamera);
    // One fragment per ray: where it leaves the sphere (works from inside it too)
    if (dot(vLocal, dir) <= 0.0) discard;
    float b = dot(vCamera, dir);
    float c = dot(vCamera, vCamera) - uRadius * uRadius;
    float disc = b * b - c;
    if (disc <= 0.0) discard;
    float s = sqrt(disc);
    float t0 = max(-b - s, 0.0);
    float t1 = -b + s;
    float ds = (t1 - t0) / float(uSteps);
    // Jittered start, so the steps don't show as bands
    float jitter = hash12(gl_FragCoord.xy);
    vec3 sum = vec3(0.0);
    for (int i = 0; i < uSteps; i++) {
      vec3 p = vCamera + dir * (t0 + (float(i) + jitter) * ds);
      sum += nebulaEmission(p, -dir, uTorus, uRadius, uTime);
    }
    gl_FragColor = vec4(sum * (ds / uTorus) * uIntensity, 1.0);
  }
`;

// A pulsar's magnetosphere: the closed dipole field lines (line segments), turning with
// the magnetic axis; light runs along them
const FIELD_VERTEX = /* glsl */ `
  varying float vAlong;
  void main() {
    vAlong = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FIELD_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  varying float vAlong;
  void main() {
    // Brightest near the star (both feet of a loop), a glow flowing along each line
    float foot = vAlong * 2.0 - 1.0;
    float feet = 0.45 + 0.55 * foot * foot;
    float flow = 0.6 + 0.4 * sin(vAlong * 30.0 - uTime * 3.0);
    gl_FragColor = vec4(uColor * feet * flow * uIntensity, 1.0);
  }
`;

const BEACON_VERTEX = /* glsl */ `
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uPulse;
  varying float vPulse;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vPulse = uPulse;
    gl_PointSize = uSize * uPixelRatio * (0.8 + 0.6 * uPulse);
    gl_Position = projectionMatrix * mv;
  }
`;

const BEACON_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying float vPulse;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c) * 2.0;
    if (r > 1.0) discard;
    float core = exp(-r * r * 9.0);
    float halo = exp(-r * 3.5) * 0.4;
    gl_FragColor = vec4(uColor * (core + halo) * uIntensity * (0.6 + vPulse), 1.0);
  }
`;

interface Exotic {
  poi: PointOfInterest;
  object: THREE.Group;
  horizon: number; // ly, 0 for objects that do not lens
  approach: number; // ly, good distance to look at it from
  // `time`: Unix seconds, for the spins (double precision); `view.shaderTime`: the same
  // modulo a day, for the shaders' uTime (a float still resolves it smoothly)
  update: (time: number, toCamera: THREE.Vector3, view: { pixels: number; exposure: number; detailed: boolean; projectionY: number; shaderTime: number }) => void;
}

function beacon(color: THREE.Color, size: number, intensity: number) {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, 0], 3));
  const material = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: color }, uIntensity: { value: intensity }, uSize: { value: size }, uPixelRatio: { value: 1 }, uPulse: { value: 0.4 } },
    vertexShader: BEACON_VERTEX,
    fragmentShader: BEACON_FRAGMENT,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true,
  });
  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;
  points.userData.beacon = true;
  return points;
}

// Below this angular size (radians, ~0.7 px on a typical screen) an object's structure
// (disk, jets, beams) cannot be resolved: only its beacon is drawn
const DETAIL_ANGLE = 0.0008;

function disk(inner: number, outer: number, intensity: number) {
  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uInner: { value: inner }, uOuter: { value: outer }, uIntensity: { value: intensity } },
    vertexShader: DISK_VERTEX,
    fragmentShader: DISK_FRAGMENT,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(new THREE.RingGeometry(inner, outer, 160, 8), material);
  mesh.frustumCulled = false;
  return mesh;
}

// A cone/cylinder along +Y starting at the origin
function beamGeometry(length: number, baseRadius: number, tipRadius: number) {
  const geometry = new THREE.CylinderGeometry(tipRadius, baseRadius, length, 24, 1, true);
  geometry.translate(0, length / 2, 0);
  return geometry;
}

// subpulses: 1 for a pulsar's hollow, flickering beam, 0 for a jet
function beam(geometry: THREE.BufferGeometry, color: THREE.Color, intensity: number, flow: number, subpulses = 0) {
  const material = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: color }, uIntensity: { value: intensity }, uTime: { value: 0 }, uFlow: { value: flow }, uSubpulses: { value: subpulses } },
    vertexShader: BEAM_VERTEX,
    fragmentShader: BEAM_FRAGMENT,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false;
  return mesh;
}

// A dipole's closed field lines, r = L sin²θ about +Y, as line segments: loops of three
// sizes at eight azimuths, from the star's surface out and back; uv.x runs 0..1 along
// each loop
function fieldGeometry(star: number, shells: number[]) {
  const steps = 48;
  const positions: number[] = [];
  const uvs: number[] = [];
  for (const shell of shells) {
    // Where the loop leaves the star: L sin²θ = star
    const start = Math.asin(Math.min(1, Math.sqrt(star / shell)));
    for (let k = 0; k < 8; k++) {
      const phi = (k / 8) * Math.PI * 2 + shell * 97;
      const point = (i: number) => {
        const s = i / steps;
        const theta = start + (Math.PI - 2 * start) * s;
        const r = shell * Math.sin(theta) * Math.sin(theta);
        positions.push(r * Math.sin(theta) * Math.cos(phi), r * Math.cos(theta), r * Math.sin(theta) * Math.sin(phi));
        uvs.push(s, 0);
      };
      for (let i = 1; i <= steps; i++) {
        point(i - 1);
        point(i);
      }
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  return geometry;
}

// A pulsar's meshes (shared by every pulsar): its beams, the unit sphere its wind nebula
// is ray-marched in and the magnetosphere
interface PulsarParts {
  beam: THREE.BufferGeometry;
  volume: THREE.BufferGeometry;
  field: THREE.BufferGeometry;
}

function randomTilt(rng: SeededRng) {
  return new THREE.Euler(rng.range(-1.2, 1.2), rng.range(0, Math.PI * 2), rng.range(-1.2, 1.2));
}

export class ExoticLayer {
  readonly root = new THREE.Group();
  private items: Exotic[] = [];
  private toCamera = new THREE.Vector3();
  private pulsarParts: PulsarParts | null = null;

  constructor(pois: PointOfInterest[], galaxyRadius: number, galaxyType: string, quasar: boolean) {
    for (const poi of pois) {
      const rng = new SeededRng(hashString(poi.id + poi.name));
      if (poi.kind === "blackhole") this.items.push(this.blackHole(poi, rng, galaxyType, quasar));
      else if (poi.kind === "pulsar") this.items.push(this.pulsar(poi, rng));
      else if (poi.kind === "quasar") this.items.push(this.quasar(poi, galaxyRadius));
      else if (poi.kind === "torus") this.items.push(this.torus(poi));
    }
    for (const item of this.items) this.root.add(item.object);
  }

  private blackHole(poi: PointOfInterest, rng: SeededRng, galaxyType: string, quasar: boolean): Exotic {
    const central = poi.id === "smbh";
    const horizon = central ? 0.02 : 0.0006;
    const group = new THREE.Group();
    const accretion = disk(horizon * 2.6, horizon * 14, central ? (quasar ? 4 : 2) : 1.3);
    accretion.rotation.copy(randomTilt(rng));
    group.add(accretion);
    const mark = beacon(new THREE.Color(1.0, 0.6, 0.85), central ? 5 : 3.5, central ? 1.4 : 0.9);
    group.add(mark);
    const material = accretion.material as THREE.ShaderMaterial;
    return {
      poi,
      object: group,
      horizon,
      approach: horizon * 45,
      update: (_time, _toCamera, view) => {
        material.uniforms.uTime.value = view.shaderTime;
      },
    };
  }

  private pulsar(poi: PointOfInterest, rng: SeededRng): Exotic {
    const group = new THREE.Group();
    group.rotation.copy(randomTilt(rng));
    const spin = new THREE.Group();
    const magnetic = new THREE.Group();
    magnetic.rotation.z = rng.range(0.35, 0.8); // magnetic axis misaligned with the spin axis
    const length = 0.05;
    // Narrow, well collimated lighthouse beams
    const parts = (this.pulsarParts ??= {
      beam: beamGeometry(length, 0.0002, length * 0.07),
      volume: new THREE.SphereGeometry(1, 48, 24),
      field: fieldGeometry(length * 0.004, [length * 0.08, length * 0.14, length * 0.22]),
    });

    // The wind nebula and its jets, a volume in the spin frame (the group: +Y the spin axis)
    const volumeMaterial = new THREE.ShaderMaterial({
      // Radius just past where the outflow fades (the shader fades it out before the edge)
      uniforms: { uTime: { value: 0 }, uRadius: { value: length * 0.55 }, uTorus: { value: length * 0.16 }, uIntensity: { value: 1.6 }, uSteps: { value: 40 } },
      vertexShader: VOLUME_VERTEX,
      fragmentShader: VOLUME_FRAGMENT,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      side: THREE.DoubleSide,
    });
    const volume = new THREE.Mesh(parts.volume, volumeMaterial);
    volume.frustumCulled = false;
    group.add(volume);

    // The lighthouse beams from the magnetic poles, hollow, pulse after pulse
    const color = new THREE.Color(0.65, 0.8, 1.0);
    const north = beam(parts.beam, color, 2.2, 0, 1);
    const south = beam(parts.beam, color, 2.2, 0, 1);
    south.rotation.z = Math.PI;
    magnetic.add(north, south);

    // The magnetosphere, turning with the magnetic axis
    const fieldMaterial = new THREE.ShaderMaterial({
      uniforms: { uColor: { value: new THREE.Color(0.62, 0.5, 1.0) }, uIntensity: { value: 1.4 }, uTime: { value: 0 } },
      vertexShader: FIELD_VERTEX,
      fragmentShader: FIELD_FRAGMENT,
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
    });
    const field = new THREE.LineSegments(parts.field, fieldMaterial);
    field.frustumCulled = false;
    magnetic.add(field);

    spin.add(magnetic);
    group.add(spin);
    const mark = beacon(new THREE.Color(0.7, 0.85, 1.0), 4, 1.2);
    group.add(mark);
    const period = rng.range(0.6, 2.2); // seconds per turn (slowed down to be watchable)
    const beamDirection = new THREE.Vector3();
    const beamRotation = new THREE.Quaternion();
    const markMaterial = mark.material as THREE.ShaderMaterial;
    const timed = [volumeMaterial, fieldMaterial, ...[north, south].map((m) => m.material as THREE.ShaderMaterial)];
    return {
      poi,
      object: group,
      horizon: 0,
      approach: length * 3,
      update: (time, toCamera, view) => {
        spin.rotation.y = ((time / period) % 1) * Math.PI * 2;
        for (const m of timed) m.uniforms.uTime.value = view.shaderTime;
        // Up close, the neutron star itself: a fierce blue-white point
        markMaterial.uniforms.uSize.value = view.detailed ? 12 : 4;
        // Steps along each ray: 40, down to 24 as the nebula fills the screen (its radius
        // against half the screen height); the jitter hides the difference
        const coverage = (volumeMaterial.uniforms.uRadius.value / Math.max(group.position.length(), 1e-9)) * view.projectionY;
        volumeMaterial.uniforms.uSteps.value = Math.round(40 - 16 * THREE.MathUtils.smoothstep(coverage, 0.3, 1.0));
        // Flash when a beam sweeps across the line of sight
        group.updateMatrixWorld();
        beamDirection.set(0, 1, 0).applyQuaternion(north.getWorldQuaternion(beamRotation));
        const facing = Math.abs(beamDirection.dot(toCamera));
        markMaterial.uniforms.uPulse.value = Math.pow(facing, 24) * 2.5 + 0.15;
      },
    };
  }

  private quasar(poi: PointOfInterest, galaxyRadius: number): Exotic {
    const group = new THREE.Group();
    const length = galaxyRadius * 0.4;
    const color = new THREE.Color(0.55, 0.72, 1.0);
    const jet = beamGeometry(length, galaxyRadius * 0.002, galaxyRadius * 0.018);
    const up = beam(jet, color, 1.6, 1);
    const down = beam(jet, color, 1.6, 1);
    down.rotation.z = Math.PI;
    group.add(up, down);
    const mark = beacon(new THREE.Color(1.0, 0.95, 0.9), 9, 3);
    group.add(mark);
    const materials = [up.material as THREE.ShaderMaterial, down.material as THREE.ShaderMaterial];
    const jetRadius = galaxyRadius * 0.018;
    return {
      poi,
      object: group,
      horizon: 0,
      approach: poi.radius * 3.5,
      update: (_time, _toCamera, view) => {
        // From inside (or right next to) a jet it would flood the whole view with light:
        // fade it out as the camera approaches its axis
        const p = group.position; // jet base relative to the camera
        const fromAxis = Math.hypot(p.x, p.z);
        const fade = THREE.MathUtils.smoothstep(fromAxis, jetRadius * 2, jetRadius * 8);
        materials.forEach((m) => {
          m.uniforms.uTime.value = view.shaderTime;
          m.uniforms.uIntensity.value = 1.6 * fade;
        });
        up.visible = down.visible = fade > 0.001;
      },
    };
  }

  // The primordial torus, before time, and its copies in the 26 cells around it: one
  // material for all the copies, so they move as one
  private torus(poi: PointOfInterest): Exotic {
    const group = new THREE.Group();
    const small = Math.min(window.innerWidth, window.innerHeight) < 700;
    const violet = new THREE.Color(0.58, 0.46, 1.0);
    const rnd = rng(hashString(poi.id + poi.name) || 1);
    const torusGroup = new THREE.Group();
    torusGroup.scale.setScalar(TORUS_SCALE);
    // Tilted a little, so the ring reads as a ring from the arrival's point of view
    torusGroup.rotation.set(0.35, 0, 0.18);
    const main = torusMaterial(violet);
    const echo = torusMaterial(violet.clone());
    // Drawn over the deep sky like every other exotic
    main.depthTest = echo.depthTest = false;
    const center = new THREE.Points(torusGeometry(primordial(small ? 14000 : 24000, rnd)), main);
    center.frustumCulled = false;
    torusGroup.add(center);
    const echoGeometry = torusGeometry(primordial(small ? 2500 : 5000, rnd));
    const step = TORUS_CELL / TORUS_SCALE;
    for (let x = -1; x <= 1; x++)
      for (let y = -1; y <= 1; y++)
        for (let z = -1; z <= 1; z++) {
          if (x === 0 && y === 0 && z === 0) continue;
          const copy = new THREE.Points(echoGeometry, echo);
          copy.position.set(x * step, y * step, z * step);
          copy.frustumCulled = false;
          torusGroup.add(copy);
        }
    group.add(torusGroup);

    // The cubes: the lattice of the 3 × 3 × 3 cells, and the torus's own cell brighter
    const half = TORUS_CELL * 1.5;
    const ticks = [-1.5, -0.5, 0.5, 1.5].map((t) => t * TORUS_CELL);
    const points: number[] = [];
    for (let axis = 0; axis < 3; axis++) {
      const [u, v] = [(axis + 1) % 3, (axis + 2) % 3];
      for (const a of ticks)
        for (const b of ticks) {
          const p0 = [0, 0, 0];
          const p1 = [0, 0, 0];
          p0[axis] = -half;
          p1[axis] = half;
          p0[u] = p1[u] = a;
          p0[v] = p1[v] = b;
          points.push(...p0, ...p1);
        }
    }
    const lineMaterial = (color: number) => new THREE.LineBasicMaterial({ color, transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, toneMapped: false });
    const latticeGeometry = new THREE.BufferGeometry();
    latticeGeometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    const lattice = new THREE.LineSegments(latticeGeometry, lineMaterial(0x4a7fd0));
    const cell = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(TORUS_CELL, TORUS_CELL, TORUS_CELL)), lineMaterial(0x7fd8ff));
    for (const lines of [lattice, cell]) {
      lines.frustumCulled = false;
      group.add(lines);
    }

    const mark = beacon(new THREE.Color(0.75, 0.65, 1.0), 5, 1.4);
    group.add(mark);

    let flow = 0;
    let last: number | null = null;
    // Big enough to see it among its copies, close enough to see its loops turn
    const extent = (RING + TUBE) * TORUS_SCALE;
    return {
      poi,
      object: group,
      horizon: 0,
      approach: Math.max(extent * 9, TORUS_CELL * 3.4),
      update: (time, _toCamera, view) => {
        const dt = last === null ? 0 : Math.min(0.1, Math.max(0, time - last));
        last = time;
        // Before time the loops run at the creation's pace for this tension
        flow += dt * (0.55 + 2.4 * TORUS_TENSION * TORUS_TENSION);
        // The same on-screen brightness whatever the eye has adapted to, as the grid does
        const level = 1 / Math.max(view.exposure, 1e-3);
        for (const [material, alpha] of [
          [main, 1],
          [echo, ECHO_ALPHA],
        ] as const) {
          const u = material.uniforms;
          u.uFlow.value = flow;
          u.uTime.value = view.shaderTime;
          u.uTension.value = TORUS_TENSION;
          u.uAlpha.value = Math.min(4, alpha * level);
          u.uPixels.value = view.pixels * TORUS_SCALE;
        }
        (lattice.material as THREE.LineBasicMaterial).opacity = Math.min(1, 0.22 * level);
        (cell.material as THREE.LineBasicMaterial).opacity = Math.min(1, 0.45 * level);
      },
    };
  }

  approachDistance(poi: PointOfInterest): number | null {
    return this.items.find((i) => i.poi.id === poi.id)?.approach ?? null;
  }

  // `viewportHeight` in CSS pixels; `exposure`: the deep sky exposure (eye adaptation);
  // `projectionY`: the camera's projection [1][1] (1 / tan of half the vertical field).
  // `time`: Unix seconds, the wall clock shared by every device and the app, so a
  // pulsar's beams point the same way everywhere at the same moment
  update(time: number, cameraWorld: THREE.Vector3, pixelRatio: number, viewportHeight = 900, exposure = 1, projectionY = 1) {
    const shaderTime = time % 86400;
    for (const item of this.items) {
      const [x, y, z] = item.poi.position;
      item.object.position.set(x - cameraWorld.x, y - cameraWorld.y, z - cameraWorld.z);
      // Far away the structure is sub-pixel: draw only the beacon (still animated: a
      // pulsar's beacon flashes as its beam sweeps past, and that shows from anywhere)
      const detailed = item.approach / 3.5 / Math.max(item.object.position.length(), 1e-9) > DETAIL_ANGLE;
      const view = { pixels: viewportHeight * pixelRatio, exposure, detailed, projectionY, shaderTime };
      const structure = item.object.children.filter((child) => !child.userData.beacon);
      if (detailed) structure.forEach((child) => (child.visible = true));
      this.toCamera.copy(item.object.position).negate().normalize();
      item.object.updateMatrixWorld();
      item.update(time, this.toCamera, view);
      if (!detailed) structure.forEach((child) => (child.visible = false));
      item.object.traverse((o) => {
        const material = (o as THREE.Points).material as THREE.ShaderMaterial | undefined;
        if (material?.uniforms?.uPixelRatio) material.uniforms.uPixelRatio.value = pixelRatio;
      });
    }
  }

  // Black holes big enough on screen to bend the light behind them
  lenses(cameraWorld: THREE.Vector3, camera: THREE.PerspectiveCamera): Array<{ x: number; y: number; radius: number }> {
    const out: Array<{ x: number; y: number; radius: number }> = [];
    const tanHalf = Math.tan((camera.fov * Math.PI) / 360);
    const v = new THREE.Vector3();
    for (const item of this.items) {
      if (item.horizon <= 0) continue;
      v.set(item.poi.position[0] - cameraWorld.x, item.poi.position[1] - cameraWorld.y, item.poi.position[2] - cameraWorld.z);
      const distance = v.length();
      const radius = item.horizon / distance / (2 * tanHalf); // fraction of the screen height
      if (radius < 0.0015) continue;
      v.applyMatrix4(camera.matrixWorldInverse);
      if (v.z >= 0) continue;
      v.applyMatrix4(camera.projectionMatrix);
      if (Math.abs(v.x) > 1.5 || Math.abs(v.y) > 1.5) continue;
      out.push({ x: (v.x + 1) / 2, y: (v.y + 1) / 2, radius: Math.min(radius, 0.4) });
    }
    return out.sort((a, b) => b.radius - a.radius).slice(0, 4);
  }

  dispose() {
    this.root.traverse((o) => {
      const mesh = o as THREE.Mesh;
      mesh.geometry?.dispose();
      (mesh.material as THREE.Material | undefined)?.dispose?.();
    });
    this.root.clear();
  }
}
