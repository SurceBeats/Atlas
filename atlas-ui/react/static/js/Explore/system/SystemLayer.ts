// atlas-ui/react/static/js/Explore/system/SystemLayer.ts
//
// A star system in astronomical units, centered on its barycenter. Orbits use the real
// orbital radius (AU), period, eccentricity and current angle from the server, plus
// the same inclination / ascending node hashes as the planet renderer. Bodies are
// enlarged (real sizes would be invisible) but distances are not.

import * as THREE from "three";
import type { SystemDetail, PlanetDetail, Timing, StarInfo } from "../api.ts";
import { StarSurface, starLook, type StarLook } from "./StarSurface.ts";
import { getOrbitalInclination, getAscendingNode, calculateEllipticalPosition } from "../../Utils/OrbitalMechanics.ts";
import { getFallbackColorForPlanetType } from "../planet/planetColors.ts";
import { hashString, SeededRng } from "../core/hash.ts";

export const AU_PER_LY = 63241.077;
const KM_PER_AU = 1.496e8;
const SUN_RADIUS_AU = 0.00465;
const STAR_SCALE = 8;
const PLANET_SCALE = 80;

const STAR_TINTS: Record<string, number> = {
  red: 0xff7a4d,
  yellow: 0xfff1c9,
  blue: 0xa9c8ff,
  orange: 0xffb86b,
  white: 0xf4f7ff,
  purple: 0xc9a6ff,
};

const STAR_POWER: Record<string, number> = {
  "Red Dwarf": 0.8,
  "Yellow Dwarf": 1.4,
  "Blue Giant": 2.6,
  "Red Giant": 1.8,
  "White Dwarf": 1.2,
  "Neutron Star": 1.0,
};

const GAS_TYPES = new Set(["Gas Giant", "Frozen Gas Giant", "Nebulous", "Super Puff", "Super Ringed", "Mirror", "Ruby Cloud"]);
const HOT_TYPES = new Set(["Lava", "Magma", "Molten Core", "Radioactive", "Ruby Cloud"]);

export interface PlanetBody {
  data: PlanetDetail;
  mesh: THREE.Mesh;
  orbit: THREE.LineLoop;
  radius: number;
  inclination: number;
  ascendingNode: number;
  eccentricity: number;
  angularVelocity: number;
  position: THREE.Vector3;
}

function glowTexture(): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.08, "rgba(255,255,255,0.85)");
  g.addColorStop(0.25, "rgba(255,255,255,0.22)");
  g.addColorStop(0.6, "rgba(255,255,255,0.05)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Cheap procedural surface so planets read as worlds before you land on them.
// `realColor` is the planet's own base color from its rendering data; until that
// arrives the sphere uses the per-type palette
function planetTexture(planet: PlanetDetail, realColor?: THREE.Color): THREE.Texture {
  const w = 256;
  const h = 128;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const rng = new SeededRng(hashString(planet.name));
  const base = realColor ? realColor.clone() : getFallbackColorForPlanetType(planet.planet_type).clone();
  // The fallback palette is very saturated; pull it towards a natural albedo
  if (!realColor) base.lerp(new THREE.Color(0x8a8f99), 0.35);
  const hex = (c: THREE.Color) => `#${c.getHexString()}`;
  ctx.fillStyle = hex(base);
  ctx.fillRect(0, 0, w, h);

  if (GAS_TYPES.has(planet.planet_type)) {
    for (let y = 0; y < h; y++) {
      const band = Math.sin(y * 0.18 + rng.next() * 0.4) * 0.5 + Math.sin(y * 0.05) * 0.5;
      const c = base.clone().offsetHSL(0, 0, band * 0.12);
      ctx.fillStyle = hex(c);
      ctx.fillRect(0, y, w, 1);
    }
  } else {
    const dark = base.clone().offsetHSL(0, -0.05, -0.18);
    const light = base.clone().offsetHSL(0.02, 0, 0.12);
    for (let i = 0; i < 220; i++) {
      ctx.fillStyle = hex(rng.next() < 0.55 ? dark : light);
      ctx.globalAlpha = rng.range(0.15, 0.45);
      ctx.beginPath();
      ctx.ellipse(rng.range(0, w), rng.range(0, h), rng.range(4, 26), rng.range(3, 14), rng.range(0, Math.PI), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    // surface_temperature is in °C; caps below 260 K
    if (planet.surface_temperature + 273.15 < 260) {
      ctx.fillStyle = "rgba(240,248,255,0.85)";
      ctx.fillRect(0, 0, w, 10);
      ctx.fillRect(0, h - 10, w, 10);
    }
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

const ATMOSPHERE_VERTEX = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vView;
  #include <common>
  #include <logdepthbuf_pars_vertex>
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
    #include <logdepthbuf_vertex>
  }
`;

const ATMOSPHERE_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vView;
  #include <logdepthbuf_pars_fragment>
  void main() {
    #include <logdepthbuf_fragment>
    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.0);
    gl_FragColor = vec4(uColor * rim * 1.4, rim);
  }
`;

export class SystemLayer {
  readonly root = new THREE.Group();
  readonly system: SystemDetail;
  readonly planets: PlanetBody[] = [];
  readonly stars: Array<{ mesh: THREE.Mesh; glow: THREE.Sprite; radius: number; offset: THREE.Vector3; light: THREE.PointLight; surface: StarSurface; info: StarInfo; look: StarLook }> = [];
  timeScale = 1;
  simulatedSeconds = 0;
  private serverTime: number;
  // Wall clock when the system arrived (the server's time was "now" then)
  private loadedAt = Date.now() / 1000;
  private disposables: Array<{ dispose: () => void }> = [];

  readonly timing: Timing;

  constructor(system: SystemDetail, timing: Timing) {
    this.system = system;
    this.timing = timing;
    this.serverTime = timing.current_time;
    this.buildStars();
    this.buildPlanets();
    this.root.add(new THREE.AmbientLight(0x404a66, 0.06));
  }

  // Seconds of cosmic time represented right now (server time + simulated offset)
  get cosmicNow() {
    return this.serverTime + this.simulatedSeconds;
  }

  // How far the simulation has run ahead of (or behind) the real present, in seconds
  get drift() {
    return this.simulatedSeconds - (Date.now() / 1000 - this.loadedAt);
  }

  // Back to the real present: the planets return to where they are right now
  resetTime() {
    this.simulatedSeconds = Date.now() / 1000 - this.loadedAt;
  }

  private buildStars() {
    const glowMap = glowTexture();
    this.disposables.push(glowMap);
    const count = this.system.stars.length;
    const separation = 0.12 + 0.05 * count;
    this.system.stars.forEach((star, i) => {
      const tint = STAR_TINTS[star.Color?.toLowerCase()] ?? 0xffffff;
      const radius = Math.max(0.0006, star.Size * SUN_RADIUS_AU * STAR_SCALE);
      const geometry = new THREE.SphereGeometry(radius, 96, 48);
      // The photosphere, granulated and limb-darkened; its corona shows up close
      const look = starLook(star.Type, tint);
      const surface = new StarSurface(look, radius, this.system.index * 7 + i + 1);
      const mesh = new THREE.Mesh(geometry, surface.surface);
      mesh.userData.starIndex = i;
      surface.corona.position.copy(mesh.position);
      const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowMap, color: tint, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
      const angle = (i / Math.max(1, count)) * Math.PI * 2;
      const offset = count > 1 ? new THREE.Vector3(Math.cos(angle) * separation, 0, Math.sin(angle) * separation) : new THREE.Vector3();
      mesh.position.copy(offset);
      glow.position.copy(offset);
      surface.corona.position.copy(offset);
      const light = new THREE.PointLight(tint, (STAR_POWER[star.Type] ?? 1.2) / Math.sqrt(count), 0, 0);
      light.position.copy(offset);
      this.root.add(mesh, surface.corona, glow, light);
      this.stars.push({ mesh, glow, radius, offset, light, surface, info: star, look });
      this.disposables.push(geometry, surface, glow.material);
    });
  }

  private buildPlanets() {
    for (const data of this.system.planets) {
      const radius = Math.max(2e-5, (data.diameter / 2 / KM_PER_AU) * PLANET_SCALE);
      const texture = planetTexture(data);
      const geometry = new THREE.SphereGeometry(radius, 48, 24);
      const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: GAS_TYPES.has(data.planet_type) ? 0.9 : 0.75,
        metalness: data.planet_type === "Metallic" ? 0.6 : 0.05,
        emissive: HOT_TYPES.has(data.planet_type) ? new THREE.Color(data.planet_type === "Radioactive" ? 0x7dff4a : 0xff5a1f) : new THREE.Color(0x000000),
        emissiveIntensity: HOT_TYPES.has(data.planet_type) ? 0.35 : 0,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotation.z = (data.axial_tilt * Math.PI) / 180;
      mesh.userData.planetIndex = data.index;
      this.root.add(mesh);
      this.disposables.push(texture, geometry, material);

      if (data.atmosphere && !/none|vacuum/i.test(data.atmosphere)) {
        const shell = new THREE.Mesh(
          new THREE.SphereGeometry(radius * 1.06, 48, 24),
          new THREE.ShaderMaterial({
            uniforms: { uColor: { value: getFallbackColorForPlanetType(data.planet_type).clone().lerp(new THREE.Color(0x9fc8ff), 0.6) } },
            vertexShader: ATMOSPHERE_VERTEX,
            fragmentShader: ATMOSPHERE_FRAGMENT,
            blending: THREE.AdditiveBlending,
            transparent: true,
            depthWrite: false,
            side: THREE.FrontSide,
          })
        );
        mesh.add(shell);
        this.disposables.push(shell.geometry, shell.material as THREE.Material);
      }

      const inclination = getOrbitalInclination(data.name);
      const ascendingNode = getAscendingNode(data.name);
      const eccentricity = Math.min(0.9, data.eccentricity_factor ?? 0.1);
      const points: THREE.Vector3[] = [];
      for (let i = 0; i < 360; i++) {
        points.push(calculateEllipticalPosition((i / 360) * Math.PI * 2, data.orbital_radius, eccentricity, inclination, ascendingNode));
      }
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMaterial = new THREE.LineBasicMaterial({ color: 0x6f8fd8, transparent: true, opacity: 0.28, depthWrite: false });
      const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
      orbit.userData.opacity = 0.28;
      this.root.add(orbit);
      this.disposables.push(orbitGeometry, orbitMaterial);

      this.planets.push({
        data,
        mesh,
        orbit,
        radius,
        inclination,
        ascendingNode,
        eccentricity,
        angularVelocity: (2 * Math.PI) / data.orbital_period_seconds,
        position: new THREE.Vector3(),
      });
    }
  }

  get outerRadius() {
    return Math.max(1, ...this.system.planets.map((p) => p.orbital_radius));
  }

  planetPosition(index: number): THREE.Vector3 | null {
    const body = this.planets.find((p) => p.data.index === index);
    return body ? body.position : null;
  }

  planet(index: number): PlanetBody | undefined {
    return this.planets.find((p) => p.data.index === index);
  }

  get starOffsets(): THREE.Vector3[] {
    return this.stars.map((s) => s.offset.clone());
  }

  // Distance from a point to the closest surface in the system (for the depth range)
  nearestSurface(point: THREE.Vector3): number {
    let best = Infinity;
    for (const p of this.planets) best = Math.min(best, point.distanceTo(p.position) - p.radius);
    for (const s of this.stars) best = Math.min(best, point.distanceTo(s.offset) - s.radius);
    return best;
  }

  // While the planet frame draws a planet in full detail, its sphere here steps aside
  setDetailed(indices: number[]) {
    for (const p of this.planets) p.mesh.visible = !indices.includes(p.data.index);
  }

  // Repaints a planet's sphere with its real base color once the rendering data is
  // known, so it matches the detailed planet it stands in for
  setPlanetColor(index: number, color: THREE.Color) {
    const body = this.planet(index);
    if (!body) return;
    const material = body.mesh.material as THREE.MeshStandardMaterial;
    const previous = material.map;
    const texture = planetTexture(body.data, color);
    material.map = texture;
    material.needsUpdate = true;
    this.disposables.push(texture);
    if (previous) {
      previous.dispose();
      this.disposables = this.disposables.filter((d) => d !== previous);
    }
    const shell = body.mesh.children[0] as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial> | undefined;
    shell?.material.uniforms.uColor.value.copy(color).lerp(new THREE.Color(0x9fc8ff), 0.6);
  }

  setSelectedPlanet(index: number | null) {
    for (const p of this.planets) {
      const material = p.orbit.material as THREE.LineBasicMaterial;
      const selected = p.data.index === index;
      material.color.set(selected ? 0x7ee8ff : 0x6f8fd8);
      p.orbit.userData.opacity = selected ? 0.75 : 0.28;
    }
  }

  // Orbit lines off for a clean photo, back on right after
  setOrbitsVisible(visible: boolean) {
    for (const p of this.planets) p.orbit.visible = visible;
  }

  // cameraLocal: camera position in this system's frame (AU)
  update(dt: number, cameraLocal: THREE.Vector3) {
    this.simulatedSeconds += dt * this.timeScale;
    this.root.position.copy(cameraLocal).negate();

    for (const p of this.planets) {
      const angle = p.data.current_orbital_angle + p.angularVelocity * this.simulatedSeconds;
      calculateEllipticalPosition(angle, p.data.orbital_radius, p.eccentricity, p.inclination, p.ascendingNode, p.position);
      p.mesh.position.copy(p.position);
      p.mesh.rotation.y = ((this.simulatedSeconds / Math.max(1, Math.abs(p.data.rotation_period_seconds))) * Math.PI * 2) % (Math.PI * 2);
    }

    const wall = performance.now() / 1000;
    for (const s of this.stars) {
      // The glow keeps a minimum apparent size so the star reads as a star from afar;
      // up close it gives way to the corona, so the surface can be seen
      const distance = cameraLocal.distanceTo(s.offset);
      const near = THREE.MathUtils.smoothstep(s.radius * 40 / Math.max(distance, 1e-9), 0.6, 2.5);
      const scale = Math.max(s.radius * 16, distance * 0.09);
      s.glow.scale.setScalar(scale);
      s.glow.material.opacity = this.presence * (1 - 0.85 * near);
      s.surface.update(wall, near * this.presence);
      s.mesh.rotation.y = StarSurface.spinAt(wall);
    }
    for (const p of this.planets) (p.orbit.material as THREE.LineBasicMaterial).opacity = p.orbit.userData.opacity * this.presence;
  }

  // 0..1 how much the system has taken over from the galaxy's point of light: the
  // two crossfade with distance, so arriving and leaving never pop
  presence = 0;

  static presenceAt(distanceAU: number) {
    // Even in log distance: 4800 AU (just a point of light) to 150 AU (all there)
    const x = THREE.MathUtils.clamp(Math.log(4800 / Math.max(distanceAU, 1e-9)) / Math.log(32), 0, 1);
    return x * x * (3 - 2 * x);
  }

  // Nearest planet to a screen point, using its projected radius (with a minimum).
  pickPlanet(clientX: number, clientY: number, project: (relative: THREE.Vector3) => { x: number; y: number } | null, cameraLocal: THREE.Vector3, minPx = 18): PlanetBody | null {
    let best: PlanetBody | null = null;
    let bestDistance = Infinity;
    const relative = new THREE.Vector3();
    for (const p of this.planets) {
      relative.copy(p.position).sub(cameraLocal);
      const screen = project(relative);
      if (!screen) continue;
      const d = Math.hypot(screen.x - clientX, screen.y - clientY);
      if (d < minPx && d < bestDistance) {
        best = p;
        bestDistance = d;
      }
    }
    return best;
  }

  // The body under a screen point, planet or star. Each counts as hit within its radius
  // on screen (with a minimum, so small ones can be tapped); when several are, the one
  // whose centre is nearest relative to its size wins: a tap on the star's disc picks
  // the star even when an inner planet's dot sits over it, a tap on the dot the planet
  pickBody(clientX: number, clientY: number, project: (relative: THREE.Vector3) => { x: number; y: number } | null, cameraLocal: THREE.Vector3): { kind: "planet"; body: PlanetBody } | { kind: "star"; index: number } | null {
    let best: { kind: "planet"; body: PlanetBody } | { kind: "star"; index: number } | null = null;
    let bestScore = 1;
    const relative = new THREE.Vector3();
    const edge = new THREE.Vector3();
    const consider = (center: THREE.Vector3, radius: number, minPx: number, hit: NonNullable<typeof best>) => {
      relative.copy(center).sub(cameraLocal);
      const screen = project(relative);
      if (!screen) return;
      edge.copy(relative).add(new THREE.Vector3(radius, 0, 0));
      const rim = project(edge);
      const radiusPx = Math.max(minPx, rim ? Math.hypot(rim.x - screen.x, rim.y - screen.y) : 0);
      const score = Math.hypot(screen.x - clientX, screen.y - clientY) / radiusPx;
      if (score < bestScore) {
        bestScore = score;
        best = hit;
      }
    };
    for (const p of this.planets) consider(p.position, p.radius, 18, { kind: "planet", body: p });
    this.stars.forEach((s, i) => consider(s.offset, s.radius, 22, { kind: "star", index: i }));
    return best;
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
    this.root.clear();
  }
}
