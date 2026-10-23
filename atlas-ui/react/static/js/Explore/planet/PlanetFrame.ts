// atlas-ui/react/static/js/Explore/planet/PlanetFrame.ts
//
// The innermost frame: one planet with its full rendering (the realistic planet with its
// effects, see realistic/, and the MoonSystem), living inside the shared engine.
//
// Units: the planet radius is 2.5, the scale the moon orbits were made for. The planet
// stays at the origin of its scene; instead,
// this frame owns a camera that is placed every frame at
//   (cameraInSystem - planetInSystem) * unitsPerAU
// and shares the main camera's orientation and field of view.

import * as THREE from "three";
import { MoonSystem } from "../../3DComponents/MoonSystem.tsx";
import type { StarInfo, Timing } from "../api.ts";
import { RealisticPlanet } from "./realistic/RealisticPlanet.ts";
import { planetLook } from "./realistic/looks.ts";
import { effectKinds } from "./realistic/effects.ts";

export const PLANET_UNITS_RADIUS = 2.5;

const STAR_COLORS: Record<string, number> = {
  red: 0xff3300,
  yellow: 0xffffaa,
  blue: 0x88ccff,
  orange: 0xffaa44,
  white: 0xffffff,
  purple: 0xbb88ff,
};

const STAR_BASE_INTENSITIES: Record<string, number> = {
  "Red Dwarf": 1.0,
  "Yellow Dwarf": 2.0,
  "Blue Giant": 8.0,
  "Red Giant": 3.0,
  "White Dwarf": 2.5,
  "Neutron Star": 1.5,
};

const LIGHT_DISTANCE = 200;
const MOON_SUNLIGHT = 2.2;
const MOON_AMBIENT = 0.06;

// Eclipses: the planet (a sphere at the origin of this frame) blocking the star's light.
// Exact per fragment, no shadow map: behind the planet and within its radius of the axis
// towards the star means in shadow. The edge softens with distance (the star has a
// size: penumbra), and a planet with an atmosphere bends some reddened sunlight into its
// umbra, as Earth does onto the Moon
const ECLIPSE_GLSL = /* glsl */ `
  varying vec3 vEclipseWorld;
  uniform vec3 uEclipseLight;
  uniform float uEclipseRadius;
  uniform float uEclipseGlow;
  vec3 eclipseLight(vec3 p) {
    float t = dot(p, uEclipseLight);
    if (t > 0.0) return vec3(1.0);
    float d = length(p - t * uEclipseLight);
    float soft = uEclipseRadius * 0.04 + (-t) * 0.012;
    float lit = smoothstep(uEclipseRadius - soft, uEclipseRadius + soft, d);
    return mix(vec3(0.55, 0.16, 0.06) * uEclipseGlow, vec3(1.0), lit);
  }
`;

export interface PlanetFrameSource {
  dataUrl: string;
  stars: StarInfo[];
  starOffsets: THREE.Vector3[]; // star positions in the system frame (AU)
  visualRadiusAU: number; // radius of the planet sphere drawn by the system layer
  maxOrbitalRadius: number;
  timing: Timing;
  // Most noise octaves the realistic renderer may use (graphics quality)
  maxOctaves?: number;}

// What the cockpit shows about a moon (from the planet's rendering data)
export interface MoonInfo {
  name: string;
  type: string;
  origin: string;
  radiusKm: number;
  semiMajorAxisKm: number;
  periodDays: number;
  eccentricity: number;
  inclinationDeg: number;
  tidallyLocked: boolean;
  massKg: number;
  densityKgM3: number;
}

export class PlanetFrame {
  readonly scene = new THREE.Scene();
  readonly camera = new THREE.PerspectiveCamera(60, 1, 0.01, 5000);
  ready = false;
  error: string | null = null;
  moonCount = 0;
  moons: MoonInfo[] = [];
  // The moon the camera is visiting, if any: the near plane follows it in
  private focusMoon: string | null = null;

  private source: PlanetFrameSource;
  private mesh: THREE.Mesh;
  private moonSystem: MoonSystem;
  private lights: THREE.DirectionalLight[] = [];
  private fillLight: THREE.DirectionalLight;
  private data: any = null;
  private disposed = false;
  private realistic: RealisticPlanet | null = null;
  private sunDirection = new THREE.Vector3(1, 0, 0);
  // Height of the view in pixels (sets the detail of the realistic planet)
  viewportHeight = 900;

  constructor(source: PlanetFrameSource) {
    this.source = source;

    const geometry = new THREE.SphereGeometry(PLANET_UNITS_RADIUS, 128, 64);
    this.mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x808080 }));
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.scene.add(this.mesh);

    this.moonSystem = new MoonSystem(this.scene, PLANET_UNITS_RADIUS, this.camera, new THREE.Vector3(), source.timing.cosmic_origin_time);

    const stars = source.stars.length ? source.stars : [{ Type: "Yellow Dwarf", Color: "yellow", Size: 1 }];
    stars.forEach((star, index) => {
      const light = new THREE.DirectionalLight(STAR_COLORS[star.Color?.toLowerCase()] ?? 0xffffff, 1);
      light.target.position.set(0, 0, 0);
      // No shadow map: the planet's shaders never sample one, and the moons (the only shadow receivers) orbit outside any useful shadow frustum. It
      // only cost a second render of the whole scene every frame
      light.castShadow = false;
      this.scene.add(light, light.target);
      this.lights.push(light);
    });
    this.fillLight = new THREE.DirectionalLight(0xffffff, 0.005);
    this.scene.add(this.fillLight);

    // The star lights above follow the classic renderer, whose falloff leaves an outer
    // planet's light at its 0.05 floor: fine for the planet (its shaders bring their
    // own lighting) but it leaves the moons, the only standard materials here, black.
    // They get real sunlight of their own, and a faint glow on the night side
    this.moonLight = new THREE.DirectionalLight(STAR_COLORS[stars[0].Color?.toLowerCase()] ?? 0xffffff, MOON_SUNLIGHT);
    this.moonLight.target.position.set(0, 0, 0);
    this.scene.add(this.moonLight, this.moonLight.target, new THREE.AmbientLight(0x9fb4d0, MOON_AMBIENT));
  }

  private moonLight: THREE.DirectionalLight;
  private eclipse = {
    uEclipseLight: { value: new THREE.Vector3(1, 0, 0) },
    uEclipseRadius: { value: PLANET_UNITS_RADIUS },
    uEclipseGlow: { value: 0 },
  };

  // Teach every moon's material about the planet's shadow (see ECLIPSE_GLSL). Only the
  // direct sunlight is dimmed; the faint ambient glow of the night side stays
  private applyEclipses() {
    this.scene.traverse((object) => {
      const mesh = object as THREE.Mesh;
      if (!mesh.isMesh || !mesh.name.startsWith("moon-surface-")) return;
      const material = mesh.material as THREE.MeshStandardMaterial;
      if (material.userData.eclipse) return;
      material.userData.eclipse = true;
      // After the moon's own changes (MoonSystem's per-pixel detail)
      const moonDetail = material.onBeforeCompile;
      material.onBeforeCompile = (shader, renderer) => {
        moonDetail.call(material, shader, renderer);
        Object.assign(shader.uniforms, this.eclipse);
        shader.vertexShader = shader.vertexShader
          .replace("#include <common>", "#include <common>\nvarying vec3 vEclipseWorld;")
          .replace("#include <fog_vertex>", "#include <fog_vertex>\nvEclipseWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;");
        shader.fragmentShader = shader.fragmentShader
          .replace("#include <common>", `#include <common>\n${ECLIPSE_GLSL}`)
          .replace("#include <lights_fragment_end>", "#include <lights_fragment_end>\n{ vec3 eclipse = eclipseLight(vEclipseWorld); reflectedLight.directDiffuse *= eclipse; reflectedLight.directSpecular *= eclipse; }");
      };
      material.needsUpdate = true;
    });
  }

  // How much sunlight reaches a moon's centre (1 in full light, 0 in the umbra)
  moonSunlight(name: string): number {
    const p = this.moonPosition(name);
    if (!p) return 1;
    const light = this.eclipse.uEclipseLight.value;
    const t = p.dot(light);
    if (t > 0) return 1;
    const d = p.clone().addScaledVector(light, -t).length();
    const soft = PLANET_UNITS_RADIUS * 0.04 + -t * 0.012;
    return THREE.MathUtils.smoothstep(d, PLANET_UNITS_RADIUS - soft, PLANET_UNITS_RADIUS + soft);
  }

  // Units of this frame per astronomical unit of the system frame
  get unitsPerAU() {
    return PLANET_UNITS_RADIUS / this.source.visualRadiusAU;
  }

  async load() {
    try {
      const response = await fetch(this.source.dataUrl, { credentials: "same-origin" });
      const result = await response.json();
      if (!result.success) throw new Error(result.error || "Failed to fetch planet data");
      if (this.disposed) return;

      const planet = result.planet_data;
      const timing = result.timing;
      const rendering = result.rendering_data ?? {};
      // Same shape ModularPlanetRenderer builds from this endpoint
      this.data = {
        planet_info: rendering.planet_info ?? { name: planet.name, type: planet.planet_type, base_color: "#808080", radius: planet.diameter / 15000, orbital_radius: planet.orbital_radius },
        surface_elements: rendering.surface_elements,
        atmosphere: rendering.atmosphere,
        rings: rendering.rings,
        moons: rendering.moons,
        effects_3d: rendering.effects_3d,
        shader_uniforms: rendering.shader_uniforms,
        universal_actions: rendering.universal_actions,
        stellar_composition: rendering.stellar_composition,
        timing: {
          cosmic_origin_time: timing.cosmic_origin_time,
          current_time_seconds: timing.current_time_seconds,
          elapsed_time: timing.elapsed_time,
          initial_orbital_angle: planet.initial_orbital_angle,
          current_orbital_angle: planet.current_orbital_angle,
          max_orbital_radius: timing.max_orbital_radius,
          system_max_orbital_radius: planet.system_max_orbital_radius,
        },
        original_planet_data: planet,
        seeds: rendering.seeds,
      };

      const planetType = String(this.data.planet_info?.type ?? planet.planet_type ?? "").replace(/_/g, " ");
      const look = planetLook(this.data);
      // A Super Puff's haze: its scale height H = kT / (mu m_H g), hydrogen and helium (mu
      // 2.3) at its temperature under its own (feeble) gravity, as a fraction of its radius.
      // The haze thins out over a few of them, so that is how soft its edge is; the
      // scattering glow reaches some eight above it
      let hazeHeight = 0;
      if (planetType === "Super Puff") {
        const kelvin = Math.max(Number(planet.surface_temperature ?? 15) + 273.15, 20);
        const metres = (1.380649e-23 * kelvin) / (2.3 * 1.6735575e-27 * Math.max(Number(planet.gravity ?? 1), 0.05));
        hazeHeight = THREE.MathUtils.clamp(metres / (Number(planet.diameter) * 500), 0.004, 0.08);
        look.atmosphereHeight = Math.max(0.03, hazeHeight * 8);
      }
      this.realistic = new RealisticPlanet(look, this.mesh, this.scene, PLANET_UNITS_RADIUS, this.data.rings, effectKinds(this.data), planetType === "Super Ringed", hazeHeight);

      // A Super Ringed planet's rings: dense ice inside its Roche limit, a dusty disc beyond
      // it. (The generator's Roche limit, km; without moons it sends none, so the same
      // formula: a gas giant's, with satellites of 1000 kg/m³)
      if (planetType === "Super Ringed") {
        const radiusKm = Number(planet.diameter) / 2;
        const rocheKm = this.data.moons?.roche_limit ?? 2.456 * radiusKm * Math.pow(Number(planet.density) / 1000, 1 / 3);
        this.realistic.setRingRoche(rocheKm / radiusKm);
      }

      if (this.data.moons?.moons?.length) {
        this.moonCount = this.data.moons.moons.length;
        this.moons = this.data.moons.moons.map((moon: any) => ({
          name: moon.name,
          type: moon.properties?.type ?? "unknown",
          origin: moon.properties?.origin ?? "unknown",
          radiusKm: moon.properties?.radius_km ?? 0,
          semiMajorAxisKm: moon.orbit?.semi_major_axis_km ?? 0,
          periodDays: moon.orbit?.orbital_period_days ?? 0,
          eccentricity: moon.orbit?.eccentricity ?? 0,
          inclinationDeg: moon.orbit?.inclination_deg ?? 0,
          tidallyLocked: !!moon.rotation?.is_tidally_locked,
          massKg: moon.properties?.mass_kg ?? 0,
          densityKgM3: moon.properties?.density_kg_m3 ?? 0,
        }));
        this.moonSystem.loadMoonSystem({
          ...this.data.moons,
          cosmic_origin_time: timing.cosmic_origin_time,
          planet_mass: planet.mass || 1e24,
          planet_radius: PLANET_UNITS_RADIUS,
          moons: this.data.moons.moons.map((moon: any) => ({
            ...moon,
            rotation: {
              rotation_period_s: moon.orbit.orbital_period_seconds || 86400,
              rotation_period_hours: (moon.orbit.orbital_period_seconds || 86400) / 3600,
              angular_velocity_rad_s: (2 * Math.PI) / (moon.orbit.orbital_period_seconds || 86400),
              is_tidally_locked: true,
            },
          })),
        });
        // An atmosphere lets reddened light into the umbra; airless planets cast a black one
        const air = String(planet.atmosphere ?? "").toLowerCase();
        this.eclipse.uEclipseGlow.value = air && air !== "none" && !air.includes("no atmosphere") ? 0.35 : 0;
        this.applyEclipses();
      }
      this.ready = true;
    } catch (error) {
      this.error = error instanceof Error ? error.message : String(error);
    }
  }

  /**
   * @param cameraLocal  camera position in the system frame (AU)
   * @param planetLocal  planet center in the system frame (AU)
   * @param orientation  main camera orientation
   * @param cosmicNow    current (possibly accelerated) cosmic time, unix seconds
   * @param timeOffset   seconds of simulated time ahead of the wall clock
   * @param galacticCore towards the galaxy's core, in the galaxy's frame (what a mirror
   *                     world reflects); zero outside a galaxy
   */
  update(dt: number, cameraLocal: THREE.Vector3, planetLocal: THREE.Vector3, orientation: THREE.Quaternion, cosmicNow: number, timeOffset: number, galacticCore = new THREE.Vector3()) {
    const scale = this.unitsPerAU;
    this.camera.position.copy(cameraLocal).sub(planetLocal).multiplyScalar(scale);
    this.camera.quaternion.copy(orientation);
    const distance = this.camera.position.length();
    let near = Math.max(0.002, Math.min(distance - PLANET_UNITS_RADIUS, distance * 0.5) * 0.5);
    // Visiting a moon: it is much closer than the planet, keep it inside the near plane
    const moon = this.focusMoon ? this.moonPosition(this.focusMoon) : null;
    if (moon) near = Math.min(near, Math.max(0.0002, (moon.distanceTo(this.camera.position) - this.moonRadiusUnits(this.focusMoon!)) * 0.5));
    this.camera.near = near;
    this.camera.far = distance + 4000;
    this.camera.updateMatrixWorld();

    if (!this.ready || !this.data) return;
    const planet = this.data.original_planet_data;
    const elapsed = cosmicNow - this.source.timing.cosmic_origin_time;

    this.mesh.rotation.y = (elapsed * ((2 * Math.PI) / (planet.rotation_period_seconds || 86400))) % (2 * Math.PI);
    this.mesh.rotation.z = ((planet.axial_tilt || 0) * Math.PI) / 180;

    // Light comes from the real direction of each star. Its intensity follows the
    // original renderer's (scaled) orbit, which the moons were tuned for.
    const relative = planet.orbital_radius / Math.max(this.source.maxOrbitalRadius, 1e-9);
    const classicDistance = 20 + relative * 80;
    let total = 0;
    const intensities = this.lights.map((_, i) => {
      const star = this.source.stars[i];
      const base = STAR_BASE_INTENSITIES[star?.Type] ?? 2.0;
      const intensity = Math.min(3, Math.max(0.05, (base * 300) / (classicDistance * classicDistance)));
      total += intensity;
      return intensity;
    });
    total = Math.min(3, total);
    this.lights.forEach((light, i) => {
      const starPosition = this.source.starOffsets[i] ?? new THREE.Vector3();
      const towardsStar = starPosition.clone().sub(planetLocal).normalize();
      light.position.copy(towardsStar).multiplyScalar(LIGHT_DISTANCE);
      light.intensity = i === 0 ? total : intensities[i] * 0.35;
      if (i === 0) {
        this.moonLight.position.copy(light.position);
        this.eclipse.uEclipseLight.value.copy(towardsStar);
        this.sunDirection.copy(towardsStar);
      }
    });
    if (this.realistic) {
      this.realistic.update({
        lightDir: this.sunDirection,
        // Starlight, a little warmer or cooler than white by the star's type
        sunColor: new THREE.Color(1, 1, 1).lerp(this.lights[0]?.color ?? new THREE.Color(1, 1, 1), 0.3),
        camera: this.camera,
        viewportHeight: this.viewportHeight,
        maxOctaves: this.source.maxOctaves ?? 7.5,
        elapsed,
        rotationPeriod: Math.abs(planet.rotation_period_seconds || 86400),
        galacticCore,
      });
    }
    const awayFromStar = planetLocal.clone().normalize();
    this.fillLight.position.copy(awayFromStar).multiplyScalar(LIGHT_DISTANCE * 0.5);

    this.moonSystem.setTimeOffset(timeOffset);
    this.moonSystem.update();
    // The classic viewer rings small moons so they can be spotted from afar; around the
    // moon we are visiting that ring would fill the screen
    if (this.focusMoon) {
      for (const name of [`moon-indicator-${this.focusMoon}`, `moon-indicator-hitarea-${this.focusMoon}`]) {
        const indicator = this.scene.getObjectByName(name);
        if (indicator) indicator.visible = false;
      }
    }
  }

  // Moon under a screen ray (NDC), for picking
  moonAt(ndc: THREE.Vector2): any | null {
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(ndc, this.camera);
    return this.moonSystem.getMoonAtPosition(raycaster);
  }

  moonPosition(name: string): THREE.Vector3 | null {
    return this.moonSystem.getMoonPosition(name);
  }

  // Radius of a moon as drawn here (frame units), as the MoonSystem sizes it
  moonRadiusUnits(name: string): number {
    const moon = this.data?.moons?.moons?.find((m: any) => m.name === name);
    return PLANET_UNITS_RADIUS * (moon?.visuals?.relative_size ?? 0.02);
  }

  // A moon's position relative to the planet centre, in the system frame (AU)
  moonOffsetAU(name: string, out = new THREE.Vector3()): THREE.Vector3 | null {
    const position = this.moonPosition(name);
    return position ? out.copy(position).divideScalar(this.unitsPerAU) : null;
  }

  moonRadiusAU(name: string): number {
    return this.moonRadiusUnits(name) / this.unitsPerAU;
  }

  setFocusMoon(name: string | null) {
    if (name === this.focusMoon) return;
    // Only the moon being visited carries the fine mesh
    if (this.focusMoon) this.moonSystem.setMoonDetail(this.focusMoon, false);
    if (name) this.moonSystem.setMoonDetail(name, true);
    this.focusMoon = name;
  }

  // Screen position (NDC, z < 1 when in front of the camera) of a moon
  projectMoon(name: string, out = new THREE.Vector3()): THREE.Vector3 | null {
    const position = this.moonPosition(name);
    return position ? out.copy(position).project(this.camera) : null;
  }

  dispose() {
    this.disposed = true;
    this.realistic?.dispose();
    this.realistic = null;
    this.moonSystem.dispose();
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
    this.lights.forEach((l) => l.dispose());
    this.scene.clear();
  }
}
