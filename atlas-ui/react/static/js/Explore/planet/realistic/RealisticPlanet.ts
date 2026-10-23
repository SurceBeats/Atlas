// atlas-ui/react/static/js/Explore/planet/realistic/RealisticPlanet.ts
//
// Puts the realistic planet together on top of the planet mesh of a PlanetFrame: the
// surface material on the mesh itself, a cloud shell and an atmosphere shell around it.
// The frame drives it every frame with the star direction, the planet's rotation and
// how big the planet is on screen (which sets how much detail the noise resolves).

import * as THREE from "three";
import type { PlanetLook } from "./looks.ts";
import { RealisticRings, type RingsData } from "./rings.ts";
import { PlanetEffects, type EffectKind } from "./effects.ts";
import { ATMOSPHERE_FRAGMENT, ATMOSPHERE_VERTEX, CLOUD_FRAGMENT, HAZE_FRAGMENT, SURFACE_FRAGMENT, SURFACE_VERTEX } from "./shaders.ts";

export interface RealisticFrameState {
  lightDir: THREE.Vector3; // towards the star, world (frame) space
  sunColor: THREE.Color;
  camera: THREE.PerspectiveCamera;
  viewportHeight: number;
  maxOctaves: number;
  // Seconds since the cosmic origin (animation clock) and the planet's rotation period
  elapsed: number;
  rotationPeriod: number;
  // Towards the galaxy's core, in the galaxy's frame (what a mirror world reflects); zero
  // outside a galaxy
  galacticCore?: THREE.Vector3;
}

const SUN_INTENSITY = 1.45;

export class RealisticPlanet {
  private surface: THREE.ShaderMaterial;
  private cloudMesh: THREE.Mesh | null = null;
  private hazeMesh: THREE.Mesh | null = null;
  private atmosphereMesh: THREE.Mesh | null = null;
  private atmosphereMaterial: THREE.ShaderMaterial | null = null;
  private shared: Record<string, THREE.IUniform>;
  private worldToObject = new THREE.Matrix3();
  private atmosphereRadius = 0;
  private rings: RealisticRings | null = null;

  constructor(
    private look: PlanetLook,
    private mesh: THREE.Mesh,
    private scene: THREE.Scene,
    private radius: number,
    rings?: (RingsData & { has_rings?: boolean }) | null,
    kinds: Set<EffectKind> = new Set(),
    // A Super Ringed planet's rings: a dense ring inside the Roche limit, a dusty disc beyond
    // it (setRingRoche)
    superRings = false,
    // A Super Puff's haze: its scale height (fraction of the radius), 0 for none
    hazeHeight = 0
  ) {
    this.shared = {
      uLightDir: { value: new THREE.Vector3(1, 0, 0) },
      uSunColor: { value: new THREE.Color(1, 1, 1) },
      uSunIntensity: { value: SUN_INTENSITY },
      uOctaves: { value: 6 },
      uTime: { value: 0 },
      uCloudSpin: { value: 0 },
      uWorldToObject: { value: this.worldToObject },
      uDeep: { value: look.deep },
      uShallow: { value: look.shallow },
      uLow: { value: look.low },
      uMid: { value: look.mid },
      uHigh: { value: look.high },
      uPeak: { value: look.peak },
      uAccent: { value: look.accent },
      uEmissive: { value: look.emissive },
      uSea: { value: look.seaLevel },
      uRelief: { value: look.relief },
      uContinentScale: { value: look.continentScale },
      uIceCap: { value: look.iceCap },
      uVegetation: { value: look.vegetation },
      uSpecular: { value: look.specular },
      uRoughness: { value: look.roughness },
      uMetal: { value: look.metal },
      uEmission: { value: look.emission },
      uCityLights: { value: look.cityLights },
      uCraters: { value: look.craters },
      uBands: { value: look.bands },
      uStorms: { value: look.storms },
      uClouds: { value: look.clouds },
      uCloudColor: { value: look.cloudColor },
      uSeed: { value: look.seed },
      uVariant: { value: look.variant },
      uStyle: { value: look.style },
      uWarp: { value: look.warp },
      uFeature: { value: look.featureScale },
      uLifeGlow: { value: look.lifeGlow },
      uBandFreq: { value: look.bandFrequency },
      uBloom: { value: look.bloom },
      // xyz towards the galaxy's core (its disc on XZ), w 1 inside one
      uGalaxy: { value: new THREE.Vector4() },
    };

    const defines: Record<string, string> = { [`FAMILY_${look.family.toUpperCase()}`]: "" };
    if (rings?.has_rings && rings.bands?.length) {
      // Rocky and icy debris, a touch of the planet's own colour
      const ringColor = new THREE.Color(0xcdbfa4).lerp(look.mid, 0.25);
      this.rings = new RealisticRings(rings, radius, ringColor, this.shared, superRings);
      scene.add(this.rings.mesh);
      defines.HAS_RINGS = "";
      Object.assign(this.shared, {
        uRingBands: { value: this.rings.bands },
        uRingBandCount: { value: this.rings.bandCount },
        uRingSeed: { value: this.rings.seed },
        uRingSuper: { value: superRings ? 1 : 0 },
        ...this.rings.structure,
        uRingNormal: { value: this.rings.normal },
        uPlanetRadius: { value: radius },
      });
    }
    this.surface = new THREE.ShaderMaterial({ uniforms: this.shared, vertexShader: SURFACE_VERTEX, fragmentShader: SURFACE_FRAGMENT, defines });
    mesh.material = this.surface;
    if (hazeHeight > 0) {
      // A Super Puff's surface is the deep, opaque part, a few scale heights under the top of
      // its haze, which is drawn translucent over it
      const old = mesh.geometry;
      mesh.geometry = new THREE.SphereGeometry(radius * (1 - hazeHeight * 3), 128, 64);
      old.dispose();
    }

    if (look.clouds > 0.01) {
      const material = new THREE.ShaderMaterial({ uniforms: this.shared, vertexShader: SURFACE_VERTEX, fragmentShader: CLOUD_FRAGMENT, defines, transparent: true, depthWrite: false });
      this.cloudMesh = new THREE.Mesh(new THREE.SphereGeometry(radius * 1.007, 128, 64), material);
      this.cloudMesh.name = "realistic-clouds";
      scene.add(this.cloudMesh);
    }

    if (hazeHeight > 0) {
      // A Super Puff's haze: thick enough to hide everything at the centre of the disc,
      // thinning out towards the limb as the line of sight climbs above the haze, so the
      // planet has no edge and the stars show through its outer reaches
      const material = new THREE.ShaderMaterial({
        uniforms: { ...this.shared, uPlanetRadius: { value: radius }, uHaze: { value: new THREE.Vector4(hazeHeight, 1, 0, 0) } },
        vertexShader: SURFACE_VERTEX,
        fragmentShader: HAZE_FRAGMENT,
        defines,
        transparent: true,
        depthWrite: false,
        side: THREE.FrontSide,
      });
      this.hazeMesh = new THREE.Mesh(new THREE.SphereGeometry(radius * (1 + hazeHeight * 4), 128, 64), material);
      this.hazeMesh.name = "realistic-haze";
      // After the clouds, before the atmosphere's glow
      this.hazeMesh.renderOrder = 1;
      scene.add(this.hazeMesh);
    }

    if (look.atmosphereDensity > 0) {
      this.atmosphereRadius = radius * (1 + look.atmosphereHeight);
      const thickness = this.atmosphereRadius - radius;
      const scaleR = thickness * 0.25;
      const scaleM = thickness * 0.1;
      // Scattering by colour: the atmosphere's colour is what it scatters most, so the
      // sunlight it lets through is reddened in proportion
      const weights = new THREE.Vector3(look.atmosphere.r, look.atmosphere.g, look.atmosphere.b);
      weights.divideScalar(Math.max(weights.x, weights.y, weights.z, 1e-3));
      const betaR = weights.multiplyScalar((0.22 * look.atmosphereDensity) / scaleR);
      const betaM = (0.035 * look.atmosphereDensity) / scaleM;
      this.atmosphereMaterial = new THREE.ShaderMaterial({
        uniforms: {
          uLightDir: this.shared.uLightDir,
          uSunColor: this.shared.uSunColor,
          uSunIntensity: this.shared.uSunIntensity,
          uPlanetRadius: { value: radius },
          uAtmosphereRadius: { value: this.atmosphereRadius },
          uBetaR: { value: betaR },
          uBetaM: { value: betaM },
          uScaleR: { value: scaleR },
          uScaleM: { value: scaleM },
        },
        vertexShader: ATMOSPHERE_VERTEX,
        fragmentShader: ATMOSPHERE_FRAGMENT,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      });
      this.atmosphereMesh = new THREE.Mesh(new THREE.SphereGeometry(this.atmosphereRadius, 128, 64), this.atmosphereMaterial);
      this.atmosphereMesh.name = "realistic-atmosphere";
      // After the planet, so it lays its glow over the ground
      this.atmosphereMesh.renderOrder = 2;
      scene.add(this.atmosphereMesh);
    }

    // Worlds with a thick, Earth-like atmosphere have auroras of their own
    if (look.family === "terran" && look.atmosphereDensity >= 0.8) kinds.add("aurora");
    this.effects = new PlanetEffects(kinds, { scene, radius, seed: Math.floor(look.seed.x * 1e4 + look.seed.y * 1e2), shared: this.shared });
  }

  private effects: PlanetEffects;

  update(state: RealisticFrameState) {
    const u = this.shared;
    (u.uLightDir.value as THREE.Vector3).copy(state.lightDir).normalize();
    (u.uSunColor.value as THREE.Color).copy(state.sunColor);

    // Detail the view can resolve: an octave per doubling of the planet's size on screen
    const distance = state.camera.position.length();
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(state.camera.fov / 2));
    const pixels = (this.radius / Math.max(distance - this.radius * 0.98, 1e-4) / tanHalf) * state.viewportHeight * 0.5;
    u.uOctaves.value = THREE.MathUtils.clamp(Math.log2(Math.max(pixels, 1)) - 0.5, 2.5, state.maxOctaves);

    u.uTime.value = state.elapsed % 20000;
    const core = state.galacticCore;
    (u.uGalaxy.value as THREE.Vector4).set(core?.x ?? 0, core?.y ?? 0, core?.z ?? 0, core && core.lengthSq() > 0 ? 1 : 0);
    // Clouds run slightly ahead of the ground, as on every planet with weather
    u.uCloudSpin.value = ((state.elapsed / Math.max(state.rotationPeriod, 3600)) * Math.PI * 2 * 0.035) % (Math.PI * 2);

    this.mesh.updateMatrixWorld();
    this.worldToObject.setFromMatrix4(this.mesh.matrixWorld).invert();
    for (const shell of [this.cloudMesh, this.hazeMesh]) {
      if (!shell) continue;
      shell.position.copy(this.mesh.position);
      shell.quaternion.copy(this.mesh.quaternion);
    }
    if (this.atmosphereMesh && this.atmosphereMaterial) {
      // From outside, the near face of the shell; from inside, the far one
      this.atmosphereMaterial.side = distance > this.atmosphereRadius * 1.002 ? THREE.FrontSide : THREE.BackSide;
    }
    this.effects.update(state.elapsed, performance.now() / 1000, this.mesh.quaternion);
  }

  // A Super Ringed planet's Roche limit (planet radii)
  setRingRoche(rocheRadii: number) {
    this.rings?.setRoche(rocheRadii);
  }

  dispose() {
    this.surface.dispose();
    this.rings?.dispose();
    this.effects.dispose();
    for (const mesh of [this.cloudMesh, this.hazeMesh, this.atmosphereMesh]) {
      if (!mesh) continue;
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
  }
}
