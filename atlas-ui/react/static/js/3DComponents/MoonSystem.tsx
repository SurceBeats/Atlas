// atlas-ui/react/static/js/3DComponents/MoonSystem.tsx

import * as THREE from "three";
import { createNoise3D } from "simplex-noise";

interface MoonData {
  name: string;
  properties: {
    mass_kg: number;
    radius_km: number;
    density_kg_m3: number;
    type: string;
    origin: string;
  };
  orbit: {
    semi_major_axis_km: number;
    eccentricity: number;
    inclination_deg: number;
    orbital_period_seconds: number;
    orbital_period_days: number;
    current_angle: number;
    initial_phase?: number;
    argument_of_periapsis?: number;
    longitude_of_ascending_node?: number;
    position?: { x: number; y: number; z: number };
  };
  rotation: {
    rotation_period_s: number;
    rotation_period_hours: number;
    angular_velocity_rad_s: number;
    is_tidally_locked: boolean;
  };
  visuals: {
    base_color: string;
    roughness: number;
    metalness: number;
    normal_strength: number;
    relative_size: number;
    has_atmosphere: boolean;
    atmosphere_color?: string;
    atmosphere_opacity?: number;
  };
  surface?: {
    craters: Array<{
      position: { lat: number; lon: number };
      radius: number;
      depth: number;
    }>;
    maria?: Array<{
      position: { lat: number; lon: number };
      radius: number;
      darkness: number;
    }>;
    cracks?: Array<{
      start: { lat: number; lon: number };
      end: { lat: number; lon: number };
      width: number;
      brightness: number;
    }>;
    brightness_variation: number;
  };
  procedural?: {
    seed: number;
    noise_scale: number;
    crater_density: number;
    surface_variation: number;
  };
  tidal_heating?: {
    tidal_power_watts: number;
    surface_temperature_k: number;
    temperature_increase_k: number;
    has_volcanism: boolean;
    volcanism_intensity: number;
    atmosphere_enhancement: number;
    tidal_bulge_amplitude_m: number;
    eccentricity_contribution: number;
    q_factor: number;
  };
}

interface MoonSystemData {
  count: number;
  roche_limit: number;
  hill_radius: number;
  moons: MoonData[];
  render_settings: {
    max_visible_distance: number;
    lod_distances: number[];
  };
  cosmic_origin_time: number;
  planet_mass: number;
  planet_radius: number;
}

export class MoonSystem {
  private scene: THREE.Scene;
  private planetRadius: number;
  private moonMeshes: THREE.Group[] = [];
  private orbitalLines: THREE.Group[] = [];
  private smallMoonIndicators: THREE.Mesh[] = [];
  private moonData: MoonSystemData | null = null;
  private cosmicOriginTime: number;
  private lastRelaxationCheck: number = 0;

  // Moon mesh resolution: distant (a few pixels to a third of the screen) and visited.
  // The fine one is enough for the smallest craters of reliefModel (~3.5°)
  static readonly LOW_SEGMENTS = 64;
  static readonly HIGH_SEGMENTS = 192;

  // Rebuild a moon's surface at the resolution its view needs, keeping its relief
  public setMoonDetail(name: string, high: boolean): void {
    const moonData = this.moonData?.moons.find((m) => m.name === name);
    const mesh = this.scene.getObjectByName(`moon-surface-${name}`) as THREE.Mesh | undefined;
    if (!moonData || !mesh || !(mesh.geometry instanceof THREE.SphereGeometry)) return;
    const segments = high ? MoonSystem.HIGH_SEGMENTS : MoonSystem.LOW_SEGMENTS;
    const old = mesh.geometry;
    if (old.parameters.widthSegments === segments) return;
    const geometry = new THREE.SphereGeometry(old.parameters.radius, segments, Math.floor(segments * 0.75), old.parameters.phiStart);
    this.generateProceduralSurface(geometry, moonData, old.parameters.radius);
    mesh.geometry = geometry;
    old.dispose();
  }

  private moonMaterials: Map<string, THREE.MeshStandardMaterial> = new Map();

  private camera: THREE.Camera;
  private planetPosition: THREE.Vector3;
  private timeOffset: number = 0;

  private orbitalLinesFadeEnabled: boolean = true;
  private orbitalLinesVisible: boolean = true;
  private orbitalLinesTargetOpacity: number = 1.0;
  private orbitalLinesCurrentOpacity: number = 1.0;
  private lastCameraPosition: THREE.Vector3 = new THREE.Vector3();
  private lastCameraTarget: THREE.Vector3 = new THREE.Vector3();
  private lastInteractionTime: number = 0;
  private fadeOutTimer: number | null = null;
  private initialShowTimer: number | null = null;
  private cameraMovementThreshold: number = 0.01;
  private fadeOutDelay: number = 3000;
  private initialShowDuration: number = 5000;
  private fadeSpeed: number = 0.05;

  constructor(scene: THREE.Scene, planetRadius: number, camera: THREE.Camera, planetPosition: THREE.Vector3, cosmicOriginTime: number) {
    this.scene = scene;
    this.planetRadius = planetRadius;
    this.camera = camera;
    this.planetPosition = planetPosition;
    this.cosmicOriginTime = cosmicOriginTime;

    this.lastCameraPosition.copy(this.camera.position);
    if (this.camera instanceof THREE.PerspectiveCamera) {
      const direction = new THREE.Vector3();
      this.camera.getWorldDirection(direction);
      this.lastCameraTarget.copy(direction);
    }

    this.startInitialShowTimer();

    this.initializeMaterials();
  }

  private initializeMaterials(): void {
    this.moonMaterials.set(
      "rocky",
      new THREE.MeshStandardMaterial({
        color: 0x8b8680,
        roughness: 0.9,
        metalness: 0.1,
        normalScale: new THREE.Vector2(0.8, 0.8),
      }),
    );

    this.moonMaterials.set(
      "icy",
      new THREE.MeshStandardMaterial({
        color: 0xe0e0f0,
        roughness: 0.3,
        metalness: 0.05,
        normalScale: new THREE.Vector2(0.4, 0.4),
      }),
    );

    this.moonMaterials.set(
      "asteroidal",
      new THREE.MeshStandardMaterial({
        color: 0x4a3e2a,
        roughness: 0.95,
        metalness: 0.15,
        normalScale: new THREE.Vector2(1.2, 1.2),
      }),
    );

    this.moonMaterials.set(
      "captured",
      new THREE.MeshStandardMaterial({
        color: 0x6b5b4a,
        roughness: 0.8,
        metalness: 0.08,
        normalScale: new THREE.Vector2(0.9, 0.9),
      }),
    );
  }

  public loadMoonSystem(moonSystemData: MoonSystemData): void {
    this.moonData = moonSystemData;

    if (moonSystemData.cosmic_origin_time) {
      this.cosmicOriginTime = moonSystemData.cosmic_origin_time;
    }

    this.clearMoons();
    this.createMoons();
  }

  private clearMoons(): void {
    this.orbitalLines.forEach((group) => {
      this.scene.remove(group);
      group.traverse((child) => {
        if (child instanceof THREE.Line) {
          child.geometry.dispose();
          if (child.material instanceof THREE.Material) {
            child.material.dispose();
          }
        }
      });
    });
    this.orbitalLines = [];

    this.moonMeshes.forEach((moonGroup) => {
      this.scene.remove(moonGroup);
      moonGroup.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((material) => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.moonMeshes = [];
  }

  private createMoons(): void {
    if (!this.moonData) {
      return;
    }

    this.moonData.moons.forEach((moonData, index) => {
      const moonGroup = this.createMoonMesh(moonData, index);
      this.moonMeshes.push(moonGroup);
      this.scene.add(moonGroup);
    });
  }

  private createMoonMesh(moonData: MoonData, index: number): THREE.Group {
    const moonGroup = new THREE.Group();
    moonGroup.name = `moon-${moonData.name}`;

    const relativeSize = moonData.visuals.relative_size;
    const moonRadius = this.planetRadius * relativeSize;

    // Light mesh while the moon is a small thing in the sky; setMoonDetail swaps in the
    // fine one (same relief) when the camera visits it
    const horizontalSegments = MoonSystem.LOW_SEGMENTS;
    const verticalSegments = Math.floor(horizontalSegments * 0.75);

    const moonSeed = moonData.procedural?.seed || 0;
    const phiStart = (moonSeed * 0.618034) % (Math.PI * 2);

    const geometry = new THREE.SphereGeometry(moonRadius, horizontalSegments, verticalSegments, phiStart);

    this.generateProceduralSurface(geometry, moonData, moonRadius);

    let moonMaterial: THREE.MeshStandardMaterial;

    switch (moonData.properties.type) {
      case "icy":
        moonMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.2,
          metalness: 0.05,
          transparent: false,
        });
        break;
      case "asteroidal":
        moonMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.95,
          metalness: 0.15,
          transparent: false,
        });
        break;
      case "captured":
        moonMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.8,
          metalness: 0.08,
          transparent: false,
        });
        break;
      default:
        moonMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.8,
          metalness: 0.1,
          transparent: false,
        });
        break;
    }

    this.applyMoonTexture(moonMaterial, moonData);

    switch (moonData.properties.type) {
      case "icy":
        const moonSeed = moonData.procedural?.seed || 0;
        const brightnessNoise = this.createSeededRandom(moonSeed + 9999)();
        let materialBrightness = 1.0;

        if (brightnessNoise > 0.8) {
          materialBrightness = 1.4;
        } else if (brightnessNoise > 0.6) {
          materialBrightness = 1.2;
        } else if (brightnessNoise < 0.2) {
          materialBrightness = 0.6;
        } else if (brightnessNoise < 0.4) {
          materialBrightness = 0.8;
        }

        moonMaterial.emissive = new THREE.Color(0x4a6b8a).multiplyScalar(0.05 * materialBrightness);
        moonMaterial.emissiveIntensity = 0.6 * materialBrightness;
        moonMaterial.envMapIntensity = 1.0 * materialBrightness;
        moonMaterial.roughness = Math.max(0.05, 0.15 / materialBrightness);
        moonMaterial.metalness = 0.02;
        moonMaterial.transparent = true;
        moonMaterial.opacity = Math.min(1.0, 0.95 + (materialBrightness - 1.0) * 0.1);
        break;

      case "asteroidal":
        moonMaterial.emissive = new THREE.Color(0x2a1a0a).multiplyScalar(0.03);
        moonMaterial.emissiveIntensity = 0.3;
        moonMaterial.envMapIntensity = 0.1;
        moonMaterial.roughness = 0.98;
        moonMaterial.metalness = 0.18;
        break;

      case "captured":
        moonMaterial.emissive = new THREE.Color(0x5a4a3a).multiplyScalar(0.04);
        moonMaterial.emissiveIntensity = 0.4;
        moonMaterial.envMapIntensity = 0.3;
        moonMaterial.roughness = 0.75;
        moonMaterial.metalness = 0.12;
        break;

      default:
        moonMaterial.emissive = new THREE.Color(0x8b6914).multiplyScalar(0.04);
        moonMaterial.emissiveIntensity = 0.4;
        moonMaterial.envMapIntensity = 0.4;
        moonMaterial.roughness = 0.85;
        moonMaterial.metalness = 0.08;
        break;
    }

    moonMaterial.transparent = false;
    moonMaterial.side = THREE.FrontSide;

    moonMaterial.aoMapIntensity = 0.8;

    moonMaterial.normalScale = new THREE.Vector2(1.0, 1.0);

    const moonMesh = new THREE.Mesh(geometry, moonMaterial);
    moonMesh.name = `moon-surface-${moonData.name}`;

    moonMesh.castShadow = true;
    moonMesh.receiveShadow = true;

    moonMesh.userData = {
      moonData: moonData,
      moonIndex: index,
      isMoon: true,
    };

    moonGroup.add(moonMesh);

    this.createOrbitalTrail(moonData, index);

    const indicatorRadius = Math.max(moonRadius * 2, this.planetRadius * 0.04);

    const hitAreaGeometry = new THREE.CircleGeometry(indicatorRadius, 32);
    const hitAreaMaterial = new THREE.MeshBasicMaterial({
      side: THREE.DoubleSide,
      depthTest: false,
      depthWrite: false,
      colorWrite: false,
    });
    const hitAreaMesh = new THREE.Mesh(hitAreaGeometry, hitAreaMaterial);
    hitAreaMesh.name = `moon-indicator-hitarea-${moonData.name}`;
    hitAreaMesh.renderOrder = 998;
    hitAreaMesh.userData = { isMoonIndicator: true, moonData: moonData };
    moonGroup.add(hitAreaMesh);

    const ringGeometry = new THREE.RingGeometry(indicatorRadius * 0.85, indicatorRadius, 48);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff44,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide,
      depthTest: false,
    });
    const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
    ringMesh.name = `moon-indicator-${moonData.name}`;
    ringMesh.renderOrder = 999;
    ringMesh.userData = { isMoonIndicator: true, moonData: moonData };
    moonGroup.add(ringMesh);
    this.smallMoonIndicators.push(ringMesh);
    this.smallMoonIndicators.push(hitAreaMesh);

    if (moonData.visuals.has_atmosphere && moonData.visuals.atmosphere_color) {
      const atmosphereGeometry = new THREE.SphereGeometry(moonRadius * 1.05, 16, 8);
      const atmosphereMaterial = new THREE.MeshBasicMaterial({
        color: moonData.visuals.atmosphere_color,
        transparent: true,
        opacity: moonData.visuals.atmosphere_opacity || 0.1,
        side: THREE.BackSide,
      });
      const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
      atmosphereMesh.name = `moon-atmosphere-${moonData.name}`;
      moonGroup.add(atmosphereMesh);
    }

    this.updateMoonPosition(moonGroup, moonData, 0, index);

    return moonGroup;
  }

  private generateProceduralSurface(geometry: THREE.SphereGeometry, moonData: MoonData, moonRadius: number): void {
    const moonSeed = moonData.procedural?.seed || 0;

    const noise3D = createNoise3D(this.createSeededRandom(moonSeed));

    const positions = geometry.attributes.position.array as Float32Array;

    const relaxationFactor = this.calculateHydrostaticRelaxation(moonData);
    const reliefAt = this.reliefModel(moonData, noise3D);

    // The relief at full strength (fraction of the radius), per vertex. Relaxation only
    // ever scales it down (see updateMoonSurfaceRelaxation), so the moon rounds off
    // without changing shape
    const amplitude = moonRadius;
    const displacementAmount = amplitude * (1.0 - relaxationFactor);
    const directions = new Float32Array(positions.length);
    const relief = new Float32Array(positions.length / 3);
    const direction = new THREE.Vector3();

    for (let i = 0; i < positions.length; i += 3) {
      direction.set(positions[i], positions[i + 1], positions[i + 2]).normalize();
      const height = reliefAt(direction);
      directions[i] = direction.x;
      directions[i + 1] = direction.y;
      directions[i + 2] = direction.z;
      relief[i / 3] = height;
      const r = moonRadius + height * displacementAmount;
      positions[i] = direction.x * r;
      positions[i + 1] = direction.y * r;
      positions[i + 2] = direction.z * r;
    }

    geometry.userData.relaxation = { directions, relief, radius: moonRadius, amplitude, factor: relaxationFactor };
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  // Height of the surface (fraction of the radius) in a direction from the centre.
  // Built like real small bodies rather than from raw noise:
  //  - a broad shape: near-spherical for icy and rocky moons, lumpy and elongated for
  //    asteroids and captured bodies
  //  - impact craters: the generator's own (position, size, depth) plus a population of
  //    smaller ones from its crater density. Each is a bowl with a raised rim and a
  //    skirt of ejecta; big ones get a flat floor
  //  - on icy moons, the generator's cracks as double ridges along great circles
  //  - a fine, low texture
  // No high-frequency noise: that is what turned small moons into spikes
  private reliefModel(moonData: MoonData, noise3D: (x: number, y: number, z: number) => number): (dir: THREE.Vector3) => number {
    const type = moonData.properties.type;
    const procedural: any = moonData.procedural ?? {};
    const surface: any = (moonData as any).surface ?? {};
    const rng = this.createSeededRandom((procedural.seed || 0) % 1e9 + 4242);
    const variation = procedural.surface_variation ?? 0.15;

    const lumpiness = type === "asteroidal" ? 0.14 : type === "captured" ? 0.09 : type === "icy" ? 0.025 : 0.035;
    const lumps = lumpiness * (0.7 + variation * 2);
    // Irregular bodies are elongated along a seeded axis
    const stretch = type === "asteroidal" ? 0.18 : type === "captured" ? 0.1 : 0;
    const axis = new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize();

    const toVector = (lat: number, lon: number) => {
      const la = (lat * Math.PI) / 180;
      const lo = (lon * Math.PI) / 180;
      return new THREE.Vector3(Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo));
    };

    // Smallest crater the mesh can draw cleanly, in radians
    const minCrater = 0.06;
    interface Crater {
      centre: THREE.Vector3;
      radius: number;
      depth: number;
      reach: number; // cos of the angle beyond which it has no effect
    }
    const craters: Crater[] = [];
    const addCrater = (centre: THREE.Vector3, radius: number, depth: number) => {
      radius = Math.max(minCrater, radius);
      craters.push({ centre, radius, depth, reach: Math.cos(Math.min(Math.PI, radius * 2.4)) });
    };
    for (const crater of surface.craters ?? []) {
      // The generator's radius (0.01–0.1) is a fraction of the half circumference
      addCrater(toVector(crater.position.lat, crater.position.lon), crater.radius * Math.PI, crater.depth * 0.55);
    }
    const density = procedural.crater_density ?? 0.5;
    const extra = Math.round(density * (type === "icy" ? 22 : 45));
    for (let i = 0; i < extra; i++) {
      // Many small, few large (a rough power law)
      const size = minCrater * (1 + Math.pow(rng(), 3) * 3.5);
      addCrater(new THREE.Vector3(rng() * 2 - 1, rng() * 2 - 1, rng() * 2 - 1).normalize(), size, 0.25 + rng() * 0.25);
    }

    interface Ridge {
      a: THREE.Vector3;
      b: THREE.Vector3;
      normal: THREE.Vector3;
      width: number;
      height: number;
    }
    const ridges: Ridge[] = [];
    if (type === "icy") {
      for (const crack of surface.cracks ?? []) {
        const a = toVector(crack.start.lat, crack.start.lon);
        const b = toVector(crack.end.lat, crack.end.lon);
        const normal = new THREE.Vector3().crossVectors(a, b);
        if (normal.lengthSq() < 1e-6) continue;
        ridges.push({ a, b, normal: normal.normalize(), width: 0.018 + crack.width * 2.5, height: 0.006 + crack.brightness * 0.012 });
      }
    }

    const tmp = new THREE.Vector3();
    return (dir: THREE.Vector3) => {
      // Broad shape: two octaves of smooth noise, plus the elongation
      let h = (noise3D(dir.x * 1.1, dir.y * 1.1, dir.z * 1.1) * 0.7 + noise3D(dir.x * 2.3 + 7, dir.y * 2.3, dir.z * 2.3) * 0.3) * lumps;
      if (stretch) {
        const along = dir.dot(axis);
        h += stretch * (along * along - 0.33);
      }

      for (const c of craters) {
        const cos = dir.dot(c.centre);
        if (cos < c.reach) continue;
        const t = Math.acos(Math.min(1, cos)) / c.radius;
        const depth = c.depth * c.radius;
        if (t < 1) {
          // Bowl, floor flattened on the larger craters
          const bowl = t * t - 1;
          h += depth * Math.max(bowl, c.radius > 0.15 ? -0.75 : -1);
        }
        // Raised rim, then ejecta fading outwards
        h += depth * 0.32 * Math.exp(-Math.pow((t - 1) / 0.16, 2));
        if (t > 1) h += depth * 0.08 * Math.exp(-(t - 1) * 3);
      }

      for (const r of ridges) {
        const offset = Math.abs(dir.dot(r.normal));
        if (offset > r.width * 3) continue;
        // Only between the crack's ends
        if (tmp.crossVectors(r.a, dir).dot(r.normal) < 0 || tmp.crossVectors(dir, r.b).dot(r.normal) < 0) continue;
        const d = offset / r.width;
        // Two ridges with a trough between them, like Europa's double ridges
        h += r.height * (Math.exp(-Math.pow(d - 0.7, 2) * 6) + Math.exp(-Math.pow(d + 0.7, 2) * 6) - 0.8 * Math.exp(-d * d * 10));
      }

      // Fine texture: low, and smooth enough for the mesh to follow
      h += noise3D(dir.x * 7 + 3, dir.y * 7, dir.z * 7) * 0.004 * (0.5 + variation * 3);
      return h;
    };
  }

  private applyMoonTexture(material: THREE.MeshStandardMaterial, moonData: MoonData): void {
    this.createProceduralColorTexture(material, moonData);
  }

  private createProceduralColorTexture(material: THREE.MeshStandardMaterial, moonData: MoonData): void {
    const textureSize = 256;
    const canvas = document.createElement("canvas");
    canvas.width = textureSize;
    canvas.height = textureSize;
    const ctx = canvas.getContext("2d")!;

    const pythonBaseColor = moonData.visuals.base_color;
    let baseColor: { r: number; g: number; b: number };

    if (pythonBaseColor && pythonBaseColor.startsWith("#")) {
      const hex = pythonBaseColor.slice(1);
      baseColor = {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    } else {
      switch (moonData.properties.type) {
        case "icy":
          baseColor = { r: 160, g: 170, b: 190 };
          break;
        case "asteroidal":
          baseColor = { r: 74, g: 62, b: 42 };
          break;
        case "captured":
          baseColor = { r: 107, g: 91, b: 74 };
          break;
        default:
          baseColor = { r: 139, g: 134, b: 128 };
          break;
      }
    }

    const rawColorSeed = moonData.procedural?.seed || Math.abs(moonData.name.split("").reduce((a, b) => a + b.charCodeAt(0), 0));

    const normalizedSeed = Math.abs(rawColorSeed) % 1000000;
    const finalColorSeed = normalizedSeed === 0 ? 12345 : normalizedSeed;

    const colorNoise = createNoise3D(this.createSeededRandom(finalColorSeed + 777));

    let colorVariationR = 0,
      colorVariationG = 0,
      colorVariationB = 0;

    const baseX = (finalColorSeed % 100) * 0.1;
    const baseY = ((finalColorSeed / 100) % 100) * 0.1;
    const baseZ = ((finalColorSeed / 10000) % 100) * 0.1;

    switch (moonData.properties.type) {
      case "icy":
        colorVariationR = colorNoise(baseX + 1, baseY + 2, baseZ + 3) * 120;
        colorVariationG = colorNoise(baseX + 4, baseY + 5, baseZ + 6) * 100;
        colorVariationB = colorNoise(baseX + 7, baseY + 8, baseZ + 9) * 110;

        const iceShift = colorNoise(baseX * 0.5, baseY * 0.5, baseZ * 0.5);
        const secondaryShift = colorNoise(baseX * 0.3, baseY * 0.7, baseZ * 0.4);
        const brightnessShift = colorNoise(baseX * 0.8, baseY * 0.2, baseZ * 0.6);

        let brightnessFactor = 1.0;
        if (brightnessShift > 0.4) {
          brightnessFactor = 1.4;
        } else if (brightnessShift > 0.1) {
          brightnessFactor = 1.2;
        } else if (brightnessShift < -0.4) {
          brightnessFactor = 0.6;
        } else if (brightnessShift < -0.1) {
          brightnessFactor = 0.8;
        }

        if (iceShift > 0.3) {
          colorVariationR -= 40;
          colorVariationG += 50;
          colorVariationB += 60;
        } else if (iceShift < -0.3) {
          colorVariationR += 60;
          colorVariationG -= 20;
          colorVariationB += 20;
        } else if (secondaryShift > 0.4) {
          colorVariationR += 40;
          colorVariationG += 35;
          colorVariationB -= 30;
          brightnessFactor *= 0.9;
        } else if (secondaryShift < -0.4) {
          colorVariationR -= 30;
          colorVariationG -= 20;
          colorVariationB += 50;
        }

        colorVariationR *= brightnessFactor;
        colorVariationG *= brightnessFactor;
        colorVariationB *= brightnessFactor;
        break;

      case "asteroidal":
        colorVariationR = colorNoise(baseX + 10, baseY + 11, baseZ + 12) * 60;
        colorVariationG = colorNoise(baseX + 13, baseY + 14, baseZ + 15) * 55;
        colorVariationB = colorNoise(baseX + 16, baseY + 17, baseZ + 18) * 50;
        break;

      case "captured":
        colorVariationR = colorNoise(baseX + 19, baseY + 20, baseZ + 21) * 50;
        colorVariationG = colorNoise(baseX + 22, baseY + 23, baseZ + 24) * 45;
        colorVariationB = colorNoise(baseX + 25, baseY + 26, baseZ + 27) * 40;
        break;

      default:
        colorVariationR = colorNoise(baseX + 28, baseY + 29, baseZ + 30) * 55;
        colorVariationG = colorNoise(baseX + 31, baseY + 32, baseZ + 33) * 50;
        colorVariationB = colorNoise(baseX + 34, baseY + 35, baseZ + 36) * 45;
        break;
    }

    const originalColor = { ...baseColor };
    baseColor = {
      r: Math.max(20, Math.min(255, baseColor.r + colorVariationR)),
      g: Math.max(20, Math.min(255, baseColor.g + colorVariationG)),
      b: Math.max(30, Math.min(255, baseColor.b + colorVariationB)),
    };

    ctx.fillStyle = `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`;
    ctx.fillRect(0, 0, textureSize, textureSize);

    const textureSeed = (finalColorSeed * 7919 + 41) % 233280;
    const noise3D = createNoise3D(this.createSeededRandom(textureSeed));
    const imageData = ctx.getImageData(0, 0, textureSize, textureSize);
    const data = imageData.data;

    for (let y = 0; y < textureSize; y++) {
      for (let x = 0; x < textureSize; x++) {
        const index = (y * textureSize + x) * 4;
        const u = x / textureSize;
        const v = y / textureSize;

        const longitude = (u - 0.5) * 2 * Math.PI;
        const latitude = (v - 0.5) * Math.PI;

        const sphereX = Math.cos(latitude) * Math.cos(longitude);
        const sphereY = Math.cos(latitude) * Math.sin(longitude);
        const sphereZ = Math.sin(latitude);

        const textureVariationSeed = (textureSeed * 17 + 8901) % 1000;
        const scaleVariation = 0.5 + (textureVariationSeed / 1000) * 1.0;
        const intensityVariation = 0.8 + (textureVariationSeed / 1000) * 0.4;

        let colorVariation = 0;

        switch (moonData.properties.type) {
          case "icy":
            colorVariation += noise3D(sphereX * (2 * scaleVariation), sphereY * (2 * scaleVariation), sphereZ * (2 * scaleVariation)) * (0.5 * intensityVariation);
            colorVariation += noise3D(sphereX * (6 * scaleVariation), sphereY * (6 * scaleVariation), sphereZ * (6 * scaleVariation)) * (0.3 * intensityVariation);
            colorVariation += noise3D(sphereX * (15 * scaleVariation), sphereY * (15 * scaleVariation), sphereZ * (15 * scaleVariation)) * (0.2 * intensityVariation);

            const shimmer = noise3D(sphereX * 30, sphereY * 30, sphereZ * 30) * 0.1;
            colorVariation += shimmer * intensityVariation;
            break;

          case "asteroidal":
            colorVariation += noise3D(sphereX * (1.2 * scaleVariation), sphereY * (1.2 * scaleVariation), sphereZ * (1.2 * scaleVariation)) * (0.75 * intensityVariation);
            colorVariation += noise3D(sphereX * (4 * scaleVariation), sphereY * (4 * scaleVariation), sphereZ * (4 * scaleVariation)) * (0.55 * intensityVariation);
            colorVariation += noise3D(sphereX * (10 * scaleVariation), sphereY * (10 * scaleVariation), sphereZ * (10 * scaleVariation)) * (0.35 * intensityVariation);
            colorVariation += noise3D(sphereX * (25 * scaleVariation), sphereY * (25 * scaleVariation), sphereZ * (25 * scaleVariation)) * (0.22 * intensityVariation);
            break;

          case "captured":
            colorVariation += noise3D(sphereX * (1.8 * scaleVariation), sphereY * (1.8 * scaleVariation), sphereZ * (1.8 * scaleVariation)) * (0.6 * intensityVariation);
            colorVariation += noise3D(sphereX * (5 * scaleVariation), sphereY * (5 * scaleVariation), sphereZ * (5 * scaleVariation)) * (0.38 * intensityVariation);
            colorVariation += noise3D(sphereX * (12 * scaleVariation), sphereY * (12 * scaleVariation), sphereZ * (12 * scaleVariation)) * (0.2 * intensityVariation);
            break;

          default:
            colorVariation += noise3D(sphereX * (2.0 * scaleVariation), sphereY * (2.0 * scaleVariation), sphereZ * (2.0 * scaleVariation)) * (0.55 * intensityVariation);
            colorVariation += noise3D(sphereX * (6 * scaleVariation), sphereY * (6 * scaleVariation), sphereZ * (6 * scaleVariation)) * (0.33 * intensityVariation);
            colorVariation += noise3D(sphereX * (16 * scaleVariation), sphereY * (16 * scaleVariation), sphereZ * (16 * scaleVariation)) * (0.18 * intensityVariation);
            break;
        }

        let r, g, b;

        if (moonData.properties.type === "icy") {
          r = baseColor.r;
          g = baseColor.g;
          b = baseColor.b;

          if (colorVariation > 0) {
            const shift = colorVariation * 0.5;
            r = r * (1 - shift * 0.15);
            g = g * (1 + shift * 0.2);
            b = b * (1 + shift * 0.25);
          } else {
            const shift = Math.abs(colorVariation) * 0.5;
            r = r * (1 + shift * 0.1);
            g = g * (1 - shift * 0.15);
            b = b * (1 + shift * 0.05);
          }

          const brightness = 1.0 + colorVariation * 0.3;
          r = r * brightness;
          g = g * brightness;
          b = b * brightness;

          const pixelNoise = noise3D(sphereX * 8, sphereY * 8, sphereZ * 8);

          if (pixelNoise > 0.5) {
            r = Math.min(255, r * 1.05);
            g = Math.min(255, g * 1.08);
            b = Math.min(255, b * 1.1);
          } else if (pixelNoise < -0.5) {
            r = r * 0.95;
            g = g * 0.97;
            b = b * 1.02;
          }

          r = Math.max(0, Math.min(255, r));
          g = Math.max(0, Math.min(255, g));
          b = Math.max(0, Math.min(255, b));
        } else {
          const brightness = 1.0 + colorVariation;
          r = Math.max(0, Math.min(255, baseColor.r * brightness));
          g = Math.max(0, Math.min(255, baseColor.g * brightness));
          b = Math.max(0, Math.min(255, baseColor.b * brightness));
        }

        data[index] = r;
        data[index + 1] = g;
        data[index + 2] = b;
        data[index + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;

    const moonSeed = moonData.procedural?.seed || 0;
    const textureOffset = (moonSeed * 0.618034) % 1.0;

    texture.offset.x = textureOffset;
    texture.repeat.set(1, 1);

    material.map = texture;
    material.needsUpdate = true;
  }

  private drawCrater(ctx: CanvasRenderingContext2D, size: number, crater: any): void {
    const x = ((crater.position.lon + 180) / 360) * size;
    const y = ((90 - crater.position.lat) / 180) * size;
    const radius = Math.max(20, crater.radius * size * 0.8);

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.95)");
    gradient.addColorStop(0.2, "rgba(10, 10, 10, 0.8)");
    gradient.addColorStop(0.5, "rgba(40, 40, 40, 0.6)");
    gradient.addColorStop(0.8, "rgba(100, 100, 100, 0.4)");
    gradient.addColorStop(0.95, "rgba(180, 180, 180, 0.3)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.9, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.strokeStyle = "rgba(220, 220, 220, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.95, 0, 2 * Math.PI);
    ctx.stroke();
  }

  private createSeededRandom(seed: number): () => number {
    let t = seed * 9301 + 49297;
    return () => {
      t = (t * 9301 + 49297) % 233280;
      return t / 233280;
    };
  }

  private calculateHydrostaticRelaxation(moonData: MoonData): number {
    const radius_m = moonData.properties.radius_km * 1000;
    const mass_kg = moonData.properties.mass_kg;
    const density_kg_m3 = moonData.properties.density_kg_m3;

    if (!isFinite(radius_m) || !isFinite(mass_kg) || !isFinite(density_kg_m3) || radius_m <= 0 || mass_kg <= 0 || density_kg_m3 <= 0) {
      return 0.0;
    }

    const G = 6.6743e-11;
    const surface_gravity = (G * mass_kg) / (radius_m * radius_m);

    if (!isFinite(surface_gravity) || surface_gravity <= 0) {
      return 0.0;
    }

    let viscosity: number;

    switch (moonData.properties.type) {
      case "icy":
        const tidalHeating = moonData.tidal_heating?.tidal_power_watts || 0;

        const surface_area = 4 * Math.PI * radius_m * radius_m;
        const tidal_flux = tidalHeating / surface_area;

        if (tidal_flux > 1000) {
          viscosity = 1e12;
        } else if (tidal_flux > 100) {
          viscosity = 1e15;
        } else if (tidal_flux > 10) {
          viscosity = 1e18;
        } else if (tidal_flux > 1) {
          viscosity = 1e20;
        } else {
          viscosity = 1e21;
        }
        break;
      case "asteroidal":
        viscosity = 1e26;
        break;
      case "captured":
        viscosity = 1e24;
        break;
      default:
        if (radius_m > 500000) {
          viscosity = 1e22;
        } else if (radius_m > 100000) {
          viscosity = 1e23;
        } else {
          viscosity = 1e25;
        }
        break;
    }

    let shear_modulus: number;
    switch (moonData.properties.type) {
      case "icy":
        const tidalHeating = moonData.tidal_heating?.tidal_power_watts || 0;
        if (tidalHeating > 1e12) {
          shear_modulus = 1e9;
        } else {
          shear_modulus = 3.5e9;
        }
        break;
      case "asteroidal":
      case "captured":
      default:
        shear_modulus = 30e9;
        break;
    }

    const relaxation_timescale = viscosity / shear_modulus;

    if (!isFinite(relaxation_timescale) || relaxation_timescale <= 0) {
      return 0.0;
    }

    // The simulated moment, not the wall clock: when time runs faster, so does this
    const cosmic_age_seconds = Date.now() / 1000 - this.cosmicOriginTime + this.timeOffset;

    if (!isFinite(cosmic_age_seconds) || cosmic_age_seconds < 0) {
      return 0.0;
    }

    const relaxation_progress = cosmic_age_seconds / relaxation_timescale;

    const relaxation_factor = 1.0 - Math.exp(-relaxation_progress);

    return Math.max(0.0, Math.min(1.0, relaxation_factor));
  }

  // Hydrostatic relaxation as time goes by: the relief computed at creation is scaled
  // by how far gravity has pulled the moon towards a sphere. Same shape throughout,
  // only gentler, and only rewritten when the change would show
  private updateMoonSurfaceRelaxation(moonGroup: THREE.Group, moonData: MoonData): void {
    const moonMesh = moonGroup.getObjectByName(`moon-surface-${moonData.name}`) as THREE.Mesh;
    const state = moonMesh?.geometry.userData.relaxation as { directions: Float32Array; relief: Float32Array; radius: number; amplitude: number; factor: number } | undefined;
    if (!moonMesh || !state) return;

    const factor = this.calculateHydrostaticRelaxation(moonData);
    // Below a thousandth of the relief nothing moves on screen
    if (Math.abs(factor - state.factor) < 1e-3) return;
    state.factor = factor;

    const geometry = moonMesh.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const amount = state.amplitude * (1 - factor);
    for (let i = 0, v = 0; i < positions.length; i += 3, v++) {
      const r = state.radius + state.relief[v] * amount;
      positions[i] = state.directions[i] * r;
      positions[i + 1] = state.directions[i + 1] * r;
      positions[i + 2] = state.directions[i + 2] * r;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  }

  private drawMaria(ctx: CanvasRenderingContext2D, size: number, maria: any, mariaSeed: number = 0): void {
    const x = ((maria.position.lon + 180) / 360) * size;
    const y = ((90 - maria.position.lat) / 180) * size;
    const radius = Math.max(15, maria.radius * size * 0.4);

    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(10, 10, 10, ${maria.darkness * 0.9})`);
    gradient.addColorStop(0.6, `rgba(25, 25, 25, ${maria.darkness * 0.7})`);
    gradient.addColorStop(1, `rgba(40, 40, 40, ${maria.darkness * 0.3})`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fill();

    const seededMariaRandom = this.createSeededRandom(mariaSeed + Math.floor(x + y));
    ctx.fillStyle = `rgba(60, 50, 40, ${maria.darkness * 0.2})`;
    for (let i = 0; i < 5; i++) {
      const spotX = x + (seededMariaRandom() - 0.5) * radius * 0.8;
      const spotY = y + (seededMariaRandom() - 0.5) * radius * 0.8;
      ctx.beginPath();
      ctx.arc(spotX, spotY, 2 + seededMariaRandom() * 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  private calculateOrbitalParameters(moonData: MoonData): {
    semiMajorAxis: number;
    eccentricity: number;
    inclination: number;
    argumentOfPeriapsis: number;
    longitudeOfAscendingNode: number;
  } {
    const maxMoonDistance = Math.max(...this.moonData!.moons.map((m) => m.orbit.semi_major_axis_km));
    const relativeDistance = moonData.orbit.semi_major_axis_km / maxMoonDistance;

    const logScale = Math.log10(1 + relativeDistance * 9);

    const isGasGiant = moonData.properties.origin === "co-formation" && moonData.properties.density_kg_m3 < 1500;

    const minDistanceMultiplier = isGasGiant ? 2.5 : 1.8;
    const scaledRocheLimit = this.planetRadius * minDistanceMultiplier;
    const minSafeDistance = scaledRocheLimit * 1.2;
    const baseOrbitScale = this.planetRadius * 4;
    const scaledDistance = minSafeDistance + logScale * baseOrbitScale;
    const maxViewDistance = this.planetRadius * 10;
    const semiMajorAxis = Math.min(scaledDistance, maxViewDistance);

    const originalEccentricity = moonData.orbit.eccentricity;
    const compressionFactor = 0.5;
    const eccentricityScaleFactor = Math.min(3.0, 1.0 / compressionFactor);
    const eccentricity = Math.min(0.8, originalEccentricity * eccentricityScaleFactor);

    const visualInclinationMultiplier = 3.0;
    const visualInclination = Math.min(moonData.orbit.inclination_deg * visualInclinationMultiplier, 60);
    const inclination = THREE.MathUtils.degToRad(visualInclination);

    const argumentOfPeriapsis = moonData.orbit.argument_of_periapsis || 0;
    const longitudeOfAscendingNode = moonData.orbit.longitude_of_ascending_node || 0;

    return {
      semiMajorAxis,
      eccentricity,
      inclination,
      argumentOfPeriapsis,
      longitudeOfAscendingNode,
    };
  }

  private createOrbitalTrail(moonData: MoonData, index: number): void {
    const orbitalParams = this.calculateOrbitalParameters(moonData);
    const a = orbitalParams.semiMajorAxis;
    const e = orbitalParams.eccentricity;
    const inclinationRad = orbitalParams.inclination;
    const argumentOfPeriapsis = orbitalParams.argumentOfPeriapsis;
    const longitudeOfAscendingNode = orbitalParams.longitudeOfAscendingNode;

    const points: THREE.Vector3[] = [];
    const segments = 128;

    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;

      const r = (a * (1 - e * e)) / (1 + e * Math.cos(angle));

      const orbitX = r * Math.cos(angle + argumentOfPeriapsis);
      const orbitY = r * Math.sin(angle + argumentOfPeriapsis);
      const orbitZ = 0;

      const cosInc = Math.cos(inclinationRad);
      const sinInc = Math.sin(inclinationRad);
      const cosNode = Math.cos(longitudeOfAscendingNode);
      const sinNode = Math.sin(longitudeOfAscendingNode);

      const x1 = orbitX;
      const y1 = orbitY * cosInc - orbitZ * sinInc;
      const z1 = orbitY * sinInc + orbitZ * cosInc;

      const x = x1 * cosNode - y1 * sinNode;
      const y = x1 * sinNode + y1 * cosNode;
      const z = z1;

      points.push(new THREE.Vector3(x, z, -y));
    }

    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);

    let lineColor: number;
    switch (moonData.properties.type) {
      case "icy":
        lineColor = 0x6699ff;
        break;
      case "asteroidal":
        lineColor = 0x8b4513;
        break;
      case "captured":
        lineColor = 0xff6666;
        break;
      default:
        lineColor = 0xffaa66;
        break;
    }

    const segmentGroup = new THREE.Group();
    segmentGroup.name = `moon-orbit-${moonData.name}`;

    // A dashed orbit: one dash every three points. All dashes in a single LineSegments
    // (one draw call instead of one per dash)
    const dashPoints: THREE.Vector3[] = [];
    for (let i = 0; i + 1 < points.length; i += 3) dashPoints.push(points[i], points[i + 1]);
    if (dashPoints.length >= 2) {
      const dashMaterial = new THREE.LineBasicMaterial({ color: lineColor, opacity: 0.0, transparent: true, linewidth: 1 });
      const dashes = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(dashPoints), dashMaterial);
      dashes.name = `moon-orbit-segment-${moonData.name}`;
      segmentGroup.add(dashes);
    }
    orbitGeometry.dispose();

    const orbitLine = segmentGroup;

    orbitLine.visible = false;

    orbitLine.position.copy(this.planetPosition);

    this.scene.add(orbitLine);

    if (!this.orbitalLines) {
      this.orbitalLines = [];
    }
    this.orbitalLines.push(orbitLine);
  }

  private drawIceCracks(ctx: CanvasRenderingContext2D, size: number, crack: any): void {
    const startX = ((crack.start.lon + 180) / 360) * size;
    const startY = ((90 - crack.start.lat) / 180) * size;
    const endX = ((crack.end.lon + 180) / 360) * size;
    const endY = ((90 - crack.end.lat) / 180) * size;

    const lineWidth = Math.max(8, crack.width * size * 500);

    ctx.shadowColor = `rgba(150, 200, 255, 1.0)`;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, crack.brightness * 3.0)})`;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.shadowColor = `rgba(100, 150, 255, 0.8)`;
    ctx.shadowBlur = 30;
    ctx.strokeStyle = `rgba(200, 230, 255, ${Math.min(1, crack.brightness * 2.5)})`;
    ctx.lineWidth = lineWidth * 0.7;

    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
  }

  public setTimeOffset(offset: number): void {
    this.timeOffset = offset;
  }

  public getTimeOffset(): number {
    return this.timeOffset;
  }

  public update(): void {
    if (!this.moonData) return;

    if (this.detectCameraMovement()) {
      this.onCameraMovement();
    }
    this.updateOrbitalLinesFade();

    const currentTime = Date.now() / 1000;

    if (!isFinite(this.cosmicOriginTime)) {
      return;
    }

    const cosmicTimeElapsed = currentTime - this.cosmicOriginTime + this.timeOffset;

    if (!isFinite(cosmicTimeElapsed)) {
      return;
    }

    if (cosmicTimeElapsed < 0) {
      return;
    }

    // Relaxation is slow; checking it twice a (real) second is plenty at any time scale
    const checkRelaxation = performance.now() - this.lastRelaxationCheck > 500;
    if (checkRelaxation) this.lastRelaxationCheck = performance.now();

    this.moonData.moons.forEach((moonData, index) => {
      if (index < this.moonMeshes.length) {
        this.updateMoonPosition(this.moonMeshes[index], moonData, cosmicTimeElapsed, index);
        if (checkRelaxation) this.updateMoonSurfaceRelaxation(this.moonMeshes[index], moonData);
      }
    });

    this.updateLOD();
  }

  private updateMoonPosition(moonGroup: THREE.Group, moonData: MoonData, elapsedTimeSeconds: number, index: number = 0): void {
    if (!isFinite(elapsedTimeSeconds)) {
      return;
    }

    const period = moonData.orbit.orbital_period_seconds;
    if (!isFinite(period) || period <= 0) {
      return;
    }

    const meanMotion = (2 * Math.PI) / period;

    const initialPhase = moonData.orbit.initial_phase || 0;
    const meanAnomaly = (meanMotion * elapsedTimeSeconds + initialPhase) % (2 * Math.PI);

    if (!isFinite(meanAnomaly)) {
      return;
    }

    const orbitalParams = this.calculateOrbitalParameters(moonData);
    const a = orbitalParams.semiMajorAxis;
    const e = orbitalParams.eccentricity;
    const inclinationRad = orbitalParams.inclination;
    const argumentOfPeriapsis = orbitalParams.argumentOfPeriapsis;
    const longitudeOfAscendingNode = orbitalParams.longitudeOfAscendingNode;

    let E = meanAnomaly;
    for (let i = 0; i < 5; i++) {
      const newE = meanAnomaly + e * Math.sin(E);
      if (!isFinite(newE)) {
        break;
      }
      E = newE;
    }

    if (!isFinite(E)) {
      return;
    }

    const sqrt1PlusE = Math.sqrt(1 + e);
    const sqrt1MinusE = Math.sqrt(1 - e);
    const sinHalfE = Math.sin(E / 2);
    const cosHalfE = Math.cos(E / 2);

    if (!isFinite(sqrt1PlusE) || !isFinite(sqrt1MinusE) || !isFinite(sinHalfE) || !isFinite(cosHalfE)) {
      return;
    }

    const trueAnomaly = 2 * Math.atan2(sqrt1PlusE * sinHalfE, sqrt1MinusE * cosHalfE);

    if (!isFinite(trueAnomaly)) {
      return;
    }

    const r = (a * (1 - e * e)) / (1 + e * Math.cos(trueAnomaly));

    const trueAnomalyWithPeriapsis = trueAnomaly + argumentOfPeriapsis;
    const orbitX = r * Math.cos(trueAnomalyWithPeriapsis);
    const orbitY = r * Math.sin(trueAnomalyWithPeriapsis);
    const orbitZ = 0;

    if (!isFinite(orbitX) || !isFinite(orbitY) || !isFinite(orbitZ)) {
      return;
    }

    const cosInc = Math.cos(inclinationRad);
    const sinInc = Math.sin(inclinationRad);

    if (!isFinite(cosInc) || !isFinite(sinInc)) {
      return;
    }

    if (!isFinite(longitudeOfAscendingNode)) {
      return;
    }

    let x1 = orbitX;
    let y1 = orbitY * cosInc - orbitZ * sinInc;
    let z1 = orbitY * sinInc + orbitZ * cosInc;

    const cosNode = Math.cos(longitudeOfAscendingNode);
    const sinNode = Math.sin(longitudeOfAscendingNode);

    if (!isFinite(cosNode) || !isFinite(sinNode)) {
      return;
    }

    const x = x1 * cosNode - y1 * sinNode;
    const y = x1 * sinNode + y1 * cosNode;
    const z = z1;

    if (!isFinite(x) || !isFinite(y) || !isFinite(z)) {
      return;
    }

    if (!isFinite(this.planetPosition.x) || !isFinite(this.planetPosition.y) || !isFinite(this.planetPosition.z)) {
      return;
    }

    const threejsX = x;
    const threejsY = z;
    const threejsZ = -y;

    const finalX = this.planetPosition.x + threejsX;
    const finalY = this.planetPosition.y + threejsY;
    const finalZ = this.planetPosition.z + threejsZ;

    if (!isFinite(finalX) || !isFinite(finalY) || !isFinite(finalZ)) {
      return;
    }

    moonGroup.position.set(finalX, finalY, finalZ);

    const moonMesh = moonGroup.getObjectByName(`moon-surface-${moonData.name}`);
    if (moonMesh) {
      this.applyTidalLockingWithLibration(moonMesh, moonData, trueAnomaly, elapsedTimeSeconds);
    }
  }

  private calculatePeriapsisWithPrecession(moonData: MoonData, elapsedTimeSeconds: number): number {
    const baseArgumentOfPeriapsis = moonData.orbit.argument_of_periapsis || 0;

    if (!isFinite(elapsedTimeSeconds) || !isFinite(baseArgumentOfPeriapsis)) {
      return baseArgumentOfPeriapsis;
    }

    const planetRadiusKm = this.planetRadius;
    const moonDistanceKm = moonData.orbit.semi_major_axis_km;

    if (!isFinite(moonDistanceKm) || moonDistanceKm <= 0) {
      return baseArgumentOfPeriapsis;
    }

    const relativeDistance = moonDistanceKm / planetRadiusKm;

    if (relativeDistance > 10) {
      return baseArgumentOfPeriapsis;
    }

    const j2Coefficient = 0.001;
    const meanMotion = (2 * Math.PI) / moonData.orbit.orbital_period_seconds;
    const inclination = (moonData.orbit.inclination_deg * Math.PI) / 180;

    if (!isFinite(meanMotion) || !isFinite(inclination)) {
      return baseArgumentOfPeriapsis;
    }

    const j2PrecessionRate = (3 / 2) * j2Coefficient * meanMotion * Math.pow(planetRadiusKm / moonDistanceKm, 2) * Math.cos(inclination);

    if (!isFinite(j2PrecessionRate)) {
      return baseArgumentOfPeriapsis;
    }

    const precessionAngle = j2PrecessionRate * elapsedTimeSeconds;

    const result = (baseArgumentOfPeriapsis + precessionAngle) % (2 * Math.PI);
    if (!isFinite(result)) {
      return baseArgumentOfPeriapsis;
    }

    return result;
  }

  private applyTidalLockingWithLibration(moonMesh: THREE.Object3D, moonData: MoonData, trueAnomaly: number, elapsedTimeSeconds: number): void {
    if (!isFinite(trueAnomaly)) {
      return;
    }

    const isTidallyLocked = moonData.rotation?.is_tidally_locked ?? true;

    if (isTidallyLocked) {
      moonMesh.lookAt(this.planetPosition);

      const e = moonData.orbit.eccentricity;

      if (isFinite(e) && e >= 0 && e < 1) {
        const librationAngle = 2 * e * Math.sin(trueAnomaly);

        const inclination = (moonData.orbit.inclination_deg * Math.PI) / 180;
        const opticalLibration = inclination * Math.sin(trueAnomaly) * 0.1;

        if (isFinite(librationAngle) && isFinite(opticalLibration)) {
          const totalLibration = librationAngle + opticalLibration;

          if (isFinite(totalLibration)) {
            moonMesh.rotateY(totalLibration);
          }
        }
      }
    } else {
      const angularVelocity = moonData.rotation?.angular_velocity_rad_s ?? (2 * Math.PI) / moonData.orbit.orbital_period_seconds;

      if (isFinite(angularVelocity) && angularVelocity > 0) {
        const currentTime = Date.now() / 1000;
        const cosmicOriginTime = this.moonData?.cosmic_origin_time || 0;
        const currentCosmicAge = currentTime - cosmicOriginTime;

        const totalRotationAngle = angularVelocity * currentCosmicAge;

        if (isFinite(totalRotationAngle)) {
          moonMesh.rotation.y = totalRotationAngle % (2 * Math.PI);
        }
      }
    }
  }

  private updateLOD(): void {
    if (!this.moonData) return;

    const cameraPosition = this.camera.position;
    const frustum = new THREE.Frustum();
    const cameraMatrix = new THREE.Matrix4();
    cameraMatrix.multiplyMatrices((this.camera as any).projectionMatrix, (this.camera as any).matrixWorldInverse);
    frustum.setFromProjectionMatrix(cameraMatrix);

    this.moonMeshes.forEach((moonGroup, index) => {
      const distance = cameraPosition.distanceTo(moonGroup.position);
      const moonData = this.moonData!.moons[index];

      const inFrustum = frustum.containsPoint(moonGroup.position);
      if (!inFrustum && distance > this.moonData!.render_settings.lod_distances[1]) {
        moonGroup.visible = false;
        return;
      }

      const maxVisibleDistance = this.moonData!.render_settings.max_visible_distance * 2;
      moonGroup.visible = distance < maxVisibleDistance;
      if (!moonGroup.visible) return;

      const moonRadius = moonData.properties.radius_km;
      const apparentSize = moonRadius / distance;
      let lodLevel = 2;

      if (distance < this.moonData!.render_settings.lod_distances[0] || apparentSize > 0.001) {
        lodLevel = 0;
      } else if (distance < this.moonData!.render_settings.lod_distances[1] || apparentSize > 0.0001) {
        lodLevel = 1;
      }

      const moonMesh = moonGroup.getObjectByName(`moon-surface-${moonData.name}`) as THREE.Mesh;
      if (moonMesh && moonMesh.geometry instanceof THREE.SphereGeometry) {
        this.applyGeometryLOD(moonMesh, lodLevel, distance);
      }

      const maxDistance = this.moonData!.render_settings.max_visible_distance;
      if (distance > maxDistance * 0.5) {
        const fadeScale = Math.max(0.3, 1 - (distance - maxDistance * 0.5) / (maxDistance * 0.5));
        moonGroup.scale.setScalar(fadeScale);
      } else {
        moonGroup.scale.setScalar(1.0);
      }
    });
  }

  private applyGeometryLOD(moonMesh: THREE.Mesh, lodLevel: number, distance: number): void {
    const currentGeometry = moonMesh.geometry as THREE.SphereGeometry;

    let widthSegments: number, heightSegments: number;

    switch (lodLevel) {
      case 0:
        widthSegments = 32;
        heightSegments = 16;
        break;
      case 1:
        widthSegments = 16;
        heightSegments = 8;
        break;
      default:
        widthSegments = 8;
        heightSegments = 4;
        break;
    }

    const material = moonMesh.material as THREE.MeshStandardMaterial;
    if (distance > 1000) {
      material.roughness = Math.min(1.0, material.roughness + 0.1);
      material.metalness = Math.max(0.0, material.metalness - 0.05);
    }
  }

  public getMoonAtPosition(raycaster: THREE.Raycaster): MoonData | null {
    const intersects = raycaster.intersectObjects(this.scene.children, true);

    for (const intersect of intersects) {
      if (intersect.object.userData?.isMoon) {
        return intersect.object.userData.moonData;
      }
      if (intersect.object.userData?.isMoonIndicator) {
        return intersect.object.userData.moonData;
      }
    }

    return null;
  }

  public getMoonPosition(moonName: string): THREE.Vector3 | null {
    const moonGroup = this.moonMeshes.find((group) => group.name === `moon-${moonName}`);
    if (moonGroup) {
      return moonGroup.position.clone();
    }
    return null;
  }

  public dispose(): void {
    if (this.fadeOutTimer) {
      clearTimeout(this.fadeOutTimer);
      this.fadeOutTimer = null;
    }
    if (this.initialShowTimer) {
      clearTimeout(this.initialShowTimer);
      this.initialShowTimer = null;
    }

    this.clearMoons();
    this.moonMaterials.forEach((material) => material.dispose());
    this.moonMaterials.clear();
  }

  private startInitialShowTimer(): void {
    this.orbitalLinesTargetOpacity = 0.0;
    this.orbitalLinesCurrentOpacity = 0.0;
    this.lastInteractionTime = Date.now();

    this.initialShowTimer = null;
  }

  private detectCameraMovement(): boolean {
    const currentPosition = this.camera.position.clone();
    const currentDirection = new THREE.Vector3();
    this.camera.getWorldDirection(currentDirection);

    const positionChanged = currentPosition.distanceTo(this.lastCameraPosition) > this.cameraMovementThreshold;
    const directionChanged = currentDirection.distanceTo(this.lastCameraTarget) > this.cameraMovementThreshold;

    if (positionChanged || directionChanged) {
      this.lastCameraPosition.copy(currentPosition);
      this.lastCameraTarget.copy(currentDirection);
      return true;
    }
    return false;
  }

  private isCameraMoving(): boolean {
    return this.detectCameraMovement();
  }

  private onCameraMovement(): void {
    this.lastInteractionTime = Date.now();

    if (this.fadeOutTimer) {
      clearTimeout(this.fadeOutTimer);
      this.fadeOutTimer = null;
    }

    if (this.initialShowTimer) {
      clearTimeout(this.initialShowTimer);
      this.initialShowTimer = null;
    }

    this.fadeInOrbitalLines();

    this.fadeOutTimer = window.setTimeout(() => {
      this.fadeOutOrbitalLines();
      this.fadeOutTimer = null;
    }, this.fadeOutDelay);
  }

  private fadeInOrbitalLines(): void {
    if (!this.orbitalLinesFadeEnabled) return;
    this.orbitalLinesTargetOpacity = 0.4;
  }

  private fadeOutOrbitalLines(): void {
    if (!this.orbitalLinesFadeEnabled) return;
    this.orbitalLinesTargetOpacity = 0.0;
  }

  private updateOrbitalLinesFade(): void {
    if (!this.orbitalLinesFadeEnabled) return;

    const opacityDiff = this.orbitalLinesTargetOpacity - this.orbitalLinesCurrentOpacity;
    if (Math.abs(opacityDiff) > 0.001) {
      this.orbitalLinesCurrentOpacity += opacityDiff * this.fadeSpeed;

      this.orbitalLines.forEach((orbitGroup) => {
        if (orbitGroup.name && orbitGroup.name.startsWith("moon-orbit-")) {
          const shouldBeVisible = this.orbitalLinesCurrentOpacity > 0.05;
          orbitGroup.visible = shouldBeVisible;

          if (shouldBeVisible) {
            orbitGroup.traverse((child) => {
              if (child instanceof THREE.Line && child.material instanceof THREE.LineBasicMaterial && child.name && child.name.startsWith("moon-orbit-segment-")) {
                // Opacity is a uniform: no need to flag the material for recompilation
                (child.material as THREE.LineBasicMaterial).opacity = this.orbitalLinesCurrentOpacity;
              }
            });
          }
        }
      });
    }

    const time = Date.now() / 1000;
    const pulseEffect = 0.5 + Math.sin(time * 4) * 0.4;
    const indicatorOpacity = this.orbitalLinesCurrentOpacity * pulseEffect;

    this.smallMoonIndicators.forEach((indicator) => {
      if (indicator.material instanceof THREE.MeshBasicMaterial) {
        indicator.visible = this.orbitalLinesCurrentOpacity > 0.05;
        indicator.material.opacity = indicatorOpacity;

        if (indicator.parent) {
          const worldPos = new THREE.Vector3();
          indicator.parent.getWorldPosition(worldPos);
          indicator.lookAt(this.camera.position);
        }
      }
    });
  }

  public enableOrbitalLinesFade(enabled: boolean): void {
    this.orbitalLinesFadeEnabled = enabled;
    if (!enabled) {
      this.orbitalLinesTargetOpacity = 0.4;
      this.orbitalLinesCurrentOpacity = 0.4;
      this.updateOrbitalLinesFade();
    }
  }

  public isOrbitalLinesFadeEnabled(): boolean {
    return this.orbitalLinesFadeEnabled;
  }
}
