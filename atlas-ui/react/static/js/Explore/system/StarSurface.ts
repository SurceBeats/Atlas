// atlas-ui/react/static/js/Explore/system/StarSurface.ts
//
// A star seen up close, as solar telescopes show ours:
//
//   granulation      the boiling top of the convection zone: bright cells of rising gas
//                    ringed by dark lanes where it sinks, drifting and renewing
//   supergranules    the larger pattern the cells are organised in
//   limb darkening   the edge dimmer and redder than the centre (we see cooler, higher
//                    layers there)
//   sunspots         dark umbrae in lighter penumbrae, in belts either side of the
//                    equator; faculae, bright patches, near the limb
//   corona           a faint, streaming halo around the disc
//
// Each kind of star its own: dwarfs like the Sun; red giants with a few huge, slow
// cells; blue giants white-hot and finely grained; white dwarfs small and smooth;
// neutron stars a blinding point in a blue magnetosphere.

import * as THREE from "three";
import { NOISE } from "../planet/realistic/glsl.ts";

export interface StarLook {
  color: THREE.Color; // photosphere colour
  cells: number; // granulation scale (cells across the disc)
  spots: number; // 0..1 sunspot activity
  churn: number; // speed of the convection
  smooth: number; // 0..1 how featureless (degenerate stars)
  corona: number; // corona size, in star radii
  temperature: number; // K, for the console
}

// What each type of star looks like (temperatures are typical surface values)
export function starLook(type: string, tint: number): StarLook {
  const color = new THREE.Color(tint);
  switch (type) {
    case "Red Giant":
      return { color, cells: 7, spots: 0.25, churn: 0.25, smooth: 0, corona: 1.6, temperature: 3800 };
    case "Blue Giant":
      return { color, cells: 70, spots: 0, churn: 1.6, smooth: 0.15, corona: 2.6, temperature: 25000 };
    case "White Dwarf":
      return { color, cells: 140, spots: 0, churn: 0.4, smooth: 0.8, corona: 1.8, temperature: 12000 };
    case "Neutron Star":
      return { color: new THREE.Color(0xbfdcff), cells: 200, spots: 0, churn: 0.2, smooth: 1, corona: 4, temperature: 600000 };
    case "Red Dwarf":
      return { color, cells: 34, spots: 0.85, churn: 0.8, smooth: 0, corona: 1.7, temperature: 3200 };
    default:
      // (the system's tint for a yellow star is almost white, made for its glow from
      // afar; the photosphere up close is a warmer gold)
      return { color: color.clone().lerp(new THREE.Color(0xffc861), 0.6), cells: 46, spots: 0.55, churn: 1, smooth: 0, corona: 2, temperature: 5800 };
  }
}

const SURFACE_VERTEX = /* glsl */ `
varying vec3 vObj;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vObj = normalize(position);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const SURFACE_FRAGMENT = /* glsl */ `
${NOISE}
uniform float uTime;
uniform vec3 uColor;
uniform float uCells;
uniform float uSpots;
uniform float uChurn;
uniform float uSmooth;
uniform vec3 uSeed;
varying vec3 vObj;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec3 p = normalize(vObj);
  float mu = max(dot(normalize(vNormal), normalize(vView)), 0.0);
  float t = uTime * 0.02 * uChurn;
  // Granulation: rounded cells, brightest where the hot gas wells up in the middle,
  // ringed by narrow, ragged dark lanes where it sinks; slowly renewing
  vec3 g = p * uCells + uSeed + vec3(t, -t * 0.7, t * 0.4);
  vec3 warp = vec3(snoise(g * 0.45 + t), snoise(g * 0.45 - t + 7.0), snoise(g * 0.45 + 13.0));
  vec3 cells = cellular(g + 0.6 * warp);
  float edge = cells.y - cells.x + 0.12 * snoise(g * 2.3);
  float lanes = smoothstep(0.02, 0.32, edge);
  float dome = 1.0 - smoothstep(0.0, 0.9, cells.x);
  float granule = 0.66 + 0.2 * lanes + 0.16 * dome + 0.06 * (fract(cells.z * 7.3) - 0.5);
  // Supergranulation and a faint mottling over the whole disc
  float super = fbmN(p * uCells * 0.18 + uSeed * 0.3 + vec3(t * 0.3), 4.0);
  float shade = mix(granule * (0.92 + 0.12 * super), 1.0, uSmooth);
  // Sunspots in belts either side of the equator: dark umbra, lighter penumbra
  float belt = smoothstep(0.55, 0.25, abs(abs(p.y) - 0.28));
  float spotField = fbmN(p * 3.2 + uSeed + vec3(0.0, 0.0, uTime * 0.0015), 5.0);
  float penumbra = smoothstep(0.42, 0.52, spotField) * belt * uSpots;
  float umbra = smoothstep(0.55, 0.62, spotField) * belt * uSpots;
  shade *= 1.0 - 0.45 * penumbra - 0.45 * umbra;
  // Faculae: bright patches that show near the limb
  float faculae = smoothstep(0.35, 0.6, fbmN(p * 9.0 + uSeed + 3.0, 4.0)) * (1.0 - mu) * (1.0 - uSmooth) * 0.5;
  // Limb darkening (quadratic law), redder towards the edge
  float limb = 1.0 - 0.55 * (1.0 - mu) - 0.2 * (1.0 - mu) * (1.0 - mu);
  vec3 color = uColor * mix(vec3(1.0), vec3(1.0, 0.62, 0.38), (1.0 - mu) * 0.7 * (1.0 - uSmooth));
  // (bright, but kept below the tonemapper's shoulder so the surface still reads)
  color *= shade * limb * 1.05 + faculae;
  // The hottest stars burn towards white
  color = mix(color, vec3(1.0), uSmooth * 0.35);
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

// The corona is drawn on a sheet facing the camera, but every point of it stands for a
// real direction around the star (in the star's own frame), so its streamers belong to
// the star: walk round it and they stay where they are, seen side-on, swinging behind
// the limb. Long helmet streamers over the equator, short fine plumes at the poles; it
// turns slowly with the star
const CORONA_VERTEX = /* glsl */ `
uniform float uR;
uniform float uSize;
uniform mat3 uSpin;
varying vec2 vP;
varying float vSilhouette;
varying vec3 vDir;
varying vec3 vToCamera;
void main() {
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float d = length(mv.xyz);
  vSilhouette = uR * d / sqrt(max(d * d - uR * uR, 1e-12));
  vP = position.xy * uR * uSize;
  mv.xy += vP;
  // The sheet's point as a direction in world space, then in the star's turning frame
  mat3 viewToWorld = transpose(mat3(viewMatrix));
  vDir = uSpin * (viewToWorld * vec3(position.xy, 0.0));
  vToCamera = uSpin * (viewToWorld * vec3(0.0, 0.0, 1.0));
  gl_Position = projectionMatrix * mv;
}
`;

const CORONA_FRAGMENT = /* glsl */ `
${NOISE}
uniform float uTime;
uniform vec3 uColor;
uniform float uSmooth;
uniform float uOpacity;
uniform vec3 uSeed;
uniform float uSize;
varying vec2 vP;
varying float vSilhouette;
varying vec3 vDir;
varying vec3 vToCamera;
void main() {
  float x = length(vP) / vSilhouette;
  if (x < 0.99) discard;
  // Where on the star this ray of corona rises from: the direction across the sky,
  // tilted a little towards the camera the further out it is (a ray leaning towards us
  // is seen projected further from the limb)
  vec3 across = normalize(vDir);
  vec3 dir = normalize(across + normalize(vToCamera) * 0.35 * (1.0 - 1.0 / x));
  float latitude = abs(dir.y);
  // Streamers fixed on the star: broad helmets near the equator, fine plumes at the poles
  float helmets = 0.5 + 0.5 * snoise(dir * 2.2 + uSeed * 0.1 + vec3(0.0, 0.0, uTime * 0.008));
  float fine = 0.5 + 0.5 * snoise(dir * 9.0 + uSeed * 0.2 + vec3(uTime * 0.015));
  float equator = 1.0 - smoothstep(0.15, 0.7, latitude);
  float reach = mix(1.0 + 0.9 * fine, 1.0 + 3.2 * helmets, equator);
  float strength = mix(0.35 + 0.65 * pow(fine, 2.0), 0.4 + 0.6 * helmets, equator);
  float fall = exp(-(x - 1.0) * (3.6 / reach));
  float chromosphere = exp(-(x - 1.0) * 40.0);
  vec3 tint = mix(uColor, vec3(0.65, 0.8, 1.0), uSmooth);
  // Gone well before the edge of the sheet, so the longest streamers never end in a cut
  float edge = 1.0 - smoothstep(uSize * 0.55, uSize * 0.95, x);
  vec3 color = tint * (fall * 0.6 * strength + chromosphere * 0.9) * uOpacity * edge;
  gl_FragColor = vec4(color, 1.0);
}
`;

export class StarSurface {
  readonly surface: THREE.ShaderMaterial;
  readonly corona: THREE.Mesh;
  private coronaMaterial: THREE.ShaderMaterial;
  private spin = new THREE.Matrix4();

  // How far the star has turned (radians): slow, as stars are
  static spinAt(time: number) {
    return (time * 0.01) % (Math.PI * 2);
  }

  constructor(look: StarLook, radius: number, seed: number) {
    const rnd = (k: number) => {
      const x = Math.sin(seed * 12.9898 + k * 78.233) * 43758.5453;
      return x - Math.floor(x);
    };
    const seedVector = new THREE.Vector3(rnd(1) * 50, rnd(2) * 50, rnd(3) * 50);
    this.surface = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: look.color.clone() },
        uCells: { value: look.cells },
        uSpots: { value: look.spots },
        uChurn: { value: look.churn },
        uSmooth: { value: look.smooth },
        uSeed: { value: seedVector },
        uOctaves: { value: 5 },
      },
      vertexShader: SURFACE_VERTEX,
      fragmentShader: SURFACE_FRAGMENT,
    });
    this.coronaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: look.color.clone() },
        uSmooth: { value: look.smooth },
        uOpacity: { value: 0 },
        uSeed: { value: seedVector },
        uR: { value: radius },
        // (room for the longest streamers to fade out: they reach ~4 radii past the limb)
        uSize: { value: look.corona * 1.6 + 3 },
        uSpin: { value: new THREE.Matrix3() },
        uOctaves: { value: 3 },
      },
      vertexShader: CORONA_VERTEX,
      fragmentShader: CORONA_FRAGMENT,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    this.corona = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.coronaMaterial);
    this.corona.frustumCulled = false;
  }

  // `near`: 0 far away (the glow sprite stands for the star) .. 1 up close
  update(time: number, near: number) {
    this.surface.uniforms.uTime.value = time;
    this.coronaMaterial.uniforms.uTime.value = time;
    // The corona turns with the star (world → star frame: the inverse of its spin)
    (this.coronaMaterial.uniforms.uSpin.value as THREE.Matrix3).setFromMatrix4(this.spin.makeRotationY(-StarSurface.spinAt(time)));
    this.coronaMaterial.uniforms.uOpacity.value = near;
    this.corona.visible = near > 0.01;
  }

  dispose() {
    this.surface.dispose();
    this.coronaMaterial.dispose();
    this.corona.geometry.dispose();
  }
}
