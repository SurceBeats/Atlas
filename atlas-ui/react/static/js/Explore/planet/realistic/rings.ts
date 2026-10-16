// atlas-ui/react/static/js/Explore/planet/realistic/rings.ts
//
// Planetary rings as a thin disc: the generator's bands, each broken into hundreds of
// ringlets and gaps, lit by the star on the side facing it and glowing through on the
// other, with the planet's shadow across them. The surface shader uses the same density
// function to darken the ground under the rings' shadow.

import * as THREE from "three";

export const MAX_RING_BANDS = 6;

// Ring optical depth at radius r (planet radii), shared with the surface shader
export const RING_DENSITY = /* glsl */ `
uniform vec2 uRingBands[${MAX_RING_BANDS}];
uniform int uRingBandCount;
uniform float uRingSeed;

float ringHash(float x) { return fract(sin(x * 127.1 + uRingSeed) * 43758.5453); }
float ringNoise(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(ringHash(i), ringHash(i + 1.0), f); }

float ringDensity(float r) {
  float density = 0.0;
  for (int i = 0; i < ${MAX_RING_BANDS}; i++) {
    if (i >= uRingBandCount) break;
    vec2 band = uRingBands[i];
    float width = band.y - band.x;
    float inside = smoothstep(band.x, band.x + width * 0.04, r) * (1.0 - smoothstep(band.y - width * 0.06, band.y, r));
    // Denser towards the middle of a band
    float t = (r - band.x) / max(width, 1e-4);
    density = max(density, inside * (0.55 + 0.45 * sin(t * 3.14159)));
  }
  // Ringlets at three scales, and a few sharp gaps
  float ringlets = 0.55 + 0.25 * ringNoise(r * 40.0) + 0.15 * ringNoise(r * 160.0) + 0.1 * ringNoise(r * 700.0);
  float gaps = smoothstep(0.02, 0.06, ringNoise(r * 22.0 + 3.0)) * smoothstep(0.0, 0.03, ringNoise(r * 75.0 + 9.0));
  return clamp(density * ringlets * mix(1.0, gaps, 0.6), 0.0, 1.0);
}
`;

const RING_VERTEX = /* glsl */ `
varying vec3 vWorldPos;
varying vec3 vLocal;
void main() {
  vLocal = position;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

const RING_FRAGMENT = /* glsl */ `
${RING_DENSITY}
uniform vec3 uLightDir;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform vec3 uRingNormal;
uniform float uPlanetRadius;
uniform vec3 uRingColor;
varying vec3 vWorldPos;
varying vec3 vLocal;

void main() {
  float r = length(vLocal.xy) / uPlanetRadius;
  float density = ringDensity(r);
  if (density < 0.01) discard;
  // Planet shadow: is the planet between this point and the star?
  float b = dot(vWorldPos, uLightDir);
  float shadow = 1.0;
  if (b < 0.0) {
    float d = length(vWorldPos - b * uLightDir);
    shadow = smoothstep(uPlanetRadius * 0.97, uPlanetRadius * 1.03, d);
  }
  // Lit face: diffuse; far face: the light that makes it through (thin parts glow)
  vec3 v = normalize(cameraPosition - vWorldPos);
  float sunSide = sign(dot(uRingNormal, uLightDir));
  float viewSide = sign(dot(uRingNormal, v));
  float lit = abs(dot(uRingNormal, uLightDir));
  float brightness = sunSide == viewSide ? 0.25 + 0.75 * lit : (1.0 - density) * 0.9 * lit + 0.05;
  // Forward scattering: rings brighten looking towards the star
  brightness += pow(max(dot(-v, uLightDir), 0.0), 8.0) * 0.6 * (1.0 - density);
  vec3 tone = uRingColor * (0.8 + 0.4 * ringNoise(r * 55.0 + 17.0));
  vec3 color = tone * uSunColor * uSunIntensity * brightness * shadow + tone * 0.01;
  gl_FragColor = vec4(color, density * 0.92);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export interface RingsData {
  inner_radius: number;
  outer_radius: number;
  planet_radius: number;
  tilt_factor: number;
  shape_seed: number;
  bands: Array<{ inner: number; outer: number }>;
}

export class RealisticRings {
  readonly mesh: THREE.Mesh;
  readonly normal = new THREE.Vector3();
  readonly bands: THREE.Vector2[];
  readonly bandCount: number;
  readonly seed: number;
  private material: THREE.ShaderMaterial;

  constructor(data: RingsData, planetRadius: number, color: THREE.Color, shared: Record<string, THREE.IUniform>) {
    // Same orientation as the classic rings: the ring plane tilted about X
    const unit = 1 / (data.planet_radius || 200);
    const tilt = Math.asin((data.tilt_factor || 0.2) * 0.5);
    this.bands = Array.from({ length: MAX_RING_BANDS }, (_, i) => {
      const band = data.bands[i];
      return band ? new THREE.Vector2(band.inner * unit, band.outer * unit) : new THREE.Vector2(0, 0);
    });
    this.bandCount = Math.min(data.bands.length, MAX_RING_BANDS);
    this.seed = (data.shape_seed % 1000) / 10;
    const inner = Math.min(...data.bands.map((b) => b.inner)) * unit * planetRadius;
    const outer = Math.max(...data.bands.map((b) => b.outer)) * unit * planetRadius;

    const geometry = new THREE.RingGeometry(inner * 0.98, outer * 1.02, 256, 1);
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        uLightDir: shared.uLightDir,
        uSunColor: shared.uSunColor,
        uSunIntensity: shared.uSunIntensity,
        uRingBands: { value: this.bands },
        uRingBandCount: { value: this.bandCount },
        uRingSeed: { value: this.seed },
        uRingNormal: { value: this.normal },
        uPlanetRadius: { value: planetRadius },
        uRingColor: { value: color },
      },
      vertexShader: RING_VERTEX,
      fragmentShader: RING_FRAGMENT,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.name = "realistic-rings";
    // RingGeometry lies in XY: lay it in XZ, then tilt like the classic rings
    this.mesh.rotation.set(-Math.PI / 2 + tilt, 0, 0);
    this.mesh.updateMatrixWorld();
    this.normal.set(0, 0, 1).applyQuaternion(this.mesh.quaternion).normalize();
    this.mesh.renderOrder = 1;
  }

  dispose() {
    this.mesh.removeFromParent();
    this.mesh.geometry.dispose();
    this.material.dispose();
  }
}
