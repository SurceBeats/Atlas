// atlas-ui/react/static/js/Explore/galaxy/ExoticLayer.ts
//
// The exotic landmarks of a galaxy, drawn in the deep-sky pass (light years, camera
// relative): black holes with an accretion disk (and a gravitational lens applied in
// the tonemap pass), pulsars sweeping their beams, and the relativistic jets of a
// quasar core. Sizes are exaggerated, as everything else in the explorer, so they can
// be found and visited; every object also carries a small beacon visible from afar.

import * as THREE from "three";
import type { PointOfInterest } from "./GalaxyModel.ts";
import { hashString, SeededRng } from "../core/hash.ts";

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
  varying float vAlong;
  varying float vRim;
  void main() {
    // Bright at the source, fading outwards; knots travel along jets
    float fade = pow(1.0 - vAlong, 1.4);
    float knots = 1.0 + uFlow * 0.6 * sin(vAlong * 46.0 - uTime * 4.0);
    float core = pow(vRim, 2.0);
    gl_FragColor = vec4(uColor * fade * knots * core * uIntensity, 1.0);
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
  update: (time: number, toCamera: THREE.Vector3) => void;
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
function beam(length: number, baseRadius: number, tipRadius: number, color: THREE.Color, intensity: number, flow: number) {
  const geometry = new THREE.CylinderGeometry(tipRadius, baseRadius, length, 24, 1, true);
  geometry.translate(0, length / 2, 0);
  const material = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: color }, uIntensity: { value: intensity }, uTime: { value: 0 }, uFlow: { value: flow } },
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

function randomTilt(rng: SeededRng) {
  return new THREE.Euler(rng.range(-1.2, 1.2), rng.range(0, Math.PI * 2), rng.range(-1.2, 1.2));
}

export class ExoticLayer {
  readonly root = new THREE.Group();
  private items: Exotic[] = [];
  private toCamera = new THREE.Vector3();

  constructor(pois: PointOfInterest[], galaxyRadius: number, galaxyType: string, quasar: boolean) {
    for (const poi of pois) {
      const rng = new SeededRng(hashString(poi.id + poi.name));
      if (poi.kind === "blackhole") this.items.push(this.blackHole(poi, rng, galaxyType, quasar));
      else if (poi.kind === "pulsar") this.items.push(this.pulsar(poi, rng));
      else if (poi.kind === "quasar") this.items.push(this.quasar(poi, galaxyRadius));
    }
    for (const item of this.items) this.root.add(item.object);
  }

  private blackHole(poi: PointOfInterest, rng: SeededRng, galaxyType: string, quasar: boolean): Exotic {
    const central = poi.id === "smbh";
    const horizon = central ? (galaxyType === "Void" ? 0.4 : 0.02) : 0.0006;
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
      update: (time) => {
        material.uniforms.uTime.value = time;
      },
    };
  }

  private pulsar(poi: PointOfInterest, rng: SeededRng): Exotic {
    const group = new THREE.Group();
    group.rotation.copy(randomTilt(rng));
    const spin = new THREE.Group();
    const magnetic = new THREE.Group();
    magnetic.rotation.z = rng.range(0.35, 0.8); // magnetic axis misaligned with the spin axis
    const color = new THREE.Color(0.65, 0.8, 1.0);
    const length = 0.05;
    const north = beam(length, 0.0002, length * 0.12, color, 2.2, 0);
    const south = beam(length, 0.0002, length * 0.12, color, 2.2, 0);
    south.rotation.z = Math.PI;
    magnetic.add(north, south);
    spin.add(magnetic);
    group.add(spin);
    const mark = beacon(new THREE.Color(0.7, 0.85, 1.0), 4, 1.2);
    group.add(mark);
    const period = rng.range(0.6, 2.2); // seconds per turn (slowed down to be watchable)
    const beamDirection = new THREE.Vector3();
    const beamRotation = new THREE.Quaternion();
    const markMaterial = mark.material as THREE.ShaderMaterial;
    return {
      poi,
      object: group,
      horizon: 0,
      approach: length * 3,
      update: (time, toCamera) => {
        spin.rotation.y = ((time / period) % 1) * Math.PI * 2;
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
    const up = beam(length, galaxyRadius * 0.002, galaxyRadius * 0.018, color, 1.6, 1);
    const down = beam(length, galaxyRadius * 0.002, galaxyRadius * 0.018, color, 1.6, 1);
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
      update: (time) => {
        // From inside (or right next to) a jet it would flood the whole view with light:
        // fade it out as the camera approaches its axis
        const p = group.position; // jet base relative to the camera
        const fromAxis = Math.hypot(p.x, p.z);
        const fade = THREE.MathUtils.smoothstep(fromAxis, jetRadius * 2, jetRadius * 8);
        materials.forEach((m) => {
          m.uniforms.uTime.value = time;
          m.uniforms.uIntensity.value = 1.6 * fade;
        });
        up.visible = down.visible = fade > 0.001;
      },
    };
  }

  approachDistance(poi: PointOfInterest): number | null {
    return this.items.find((i) => i.poi.id === poi.id)?.approach ?? null;
  }

  update(time: number, cameraWorld: THREE.Vector3, pixelRatio: number) {
    for (const item of this.items) {
      const [x, y, z] = item.poi.position;
      item.object.position.set(x - cameraWorld.x, y - cameraWorld.y, z - cameraWorld.z);
      // Far away the structure is sub-pixel: draw only the beacon (still animated: a
      // pulsar's beacon flashes as its beam sweeps past, and that shows from anywhere)
      const detailed = item.approach / 3.5 / Math.max(item.object.position.length(), 1e-9) > DETAIL_ANGLE;
      const structure = item.object.children.filter((child) => !child.userData.beacon);
      if (detailed) structure.forEach((child) => (child.visible = true));
      this.toCamera.copy(item.object.position).negate().normalize();
      item.object.updateMatrixWorld();
      item.update(time, this.toCamera);
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
