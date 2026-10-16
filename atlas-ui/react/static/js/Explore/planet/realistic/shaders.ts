// atlas-ui/react/static/js/Explore/planet/realistic/shaders.ts
//
// The realistic planet: surface, cloud deck and atmosphere.
//
// - Surface: one procedural height field per family (continents and mountains, dunes,
//   craters, ice ridges, lava plates, gas bands...), shaded with bump mapping from screen
//   derivatives (a single height evaluation per pixel), GGX highlights (ocean glint,
//   metal, ice), cloud shadows, night-side city lights and glowing lava.
// - Clouds: a shell just above the surface, drifting with its own spin.
// - Atmosphere: single scattering (Rayleigh + Mie) through a shell around the planet:
//   blue limb, reddened sunsets at the terminator, forward glow towards the star.
//
// All features live on the unit sphere in the planet's own frame, so they turn with it.

import { LIGHTING, NOISE } from "./glsl.ts";
import { RING_DENSITY } from "./rings.ts";

const PALETTE = /* glsl */ `
uniform vec3 uDeep, uShallow, uLow, uMid, uHigh, uPeak, uAccent, uEmissive;
uniform float uSea, uRelief, uContinentScale, uIceCap, uVegetation, uSpecular, uRoughness, uMetal;
uniform float uEmission, uCityLights, uCraters, uBands, uStorms, uClouds, uTime, uCloudSpin;
uniform vec3 uSeed;
uniform vec3 uCloudColor;
// Per-planet structure: variant of the family (0..3), twist of the shapes, feature size
uniform float uVariant, uWarp, uFeature, uLifeGlow, uBandFreq, uBloom;
// Kind within a family that holds several planet types (see PlanetLook.style)
uniform float uStyle;
`;

// Cloud density on the unit sphere (shared by the cloud shell and the surface shadows)
const CLOUDS = /* glsl */ `
vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }

float cloudDensity(vec3 p, float octaves) {
  vec3 r = rotY(p, uCloudSpin);
  float lat = r.y;
  // Weather is stretched east-west by the planet's spin, and swirls into systems
  vec3 q = vec3(r.x * 2.0, r.y * 3.4, r.z * 2.0) + uSeed * 1.7;
  vec3 w = vec3(fbmN(q * 0.7 + vec3(0.0, 0.0, uTime * 0.004), 4.0), fbmN(q * 0.7 + vec3(5.2, 1.3, uTime * 0.003), 4.0), fbmN(q * 0.7 + vec3(2.7, 8.1, 0.0), 4.0));
  float n = fbmN(q + w * 2.2, octaves);
  // Wispy edges: high frequencies eat into the thin parts
  float erosion = fbmN(q * 4.0 + w, max(octaves - 2.0, 2.0)) * 0.22;
  float cover = mix(0.38, -0.25, uClouds);
  // Clear belts near the subtropics, the most cloud at mid latitudes
  cover += 0.1 * cos(lat * 9.0);
  // Soft edges: thin cloud thickens gradually into the dense cores
  return smoothstep(cover, cover + 0.6, n - erosion * (1.0 - smoothstep(cover + 0.1, cover + 0.45, n)));
}
`;

export const SURFACE_VERTEX = /* glsl */ `
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

export const SURFACE_FRAGMENT = /* glsl */ `
${NOISE}
${LIGHTING}
${PALETTE}
${CLOUDS}
uniform mat3 uWorldToObject;
varying vec3 vObj;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
#if defined(HAS_RINGS)
${RING_DENSITY}
uniform vec3 uRingNormal;
uniform float uPlanetRadius;
#endif

// Bump mapping from screen derivatives of the height (Mikkelsen)
vec3 bumped(vec3 pos, vec3 n, float h) {
  vec3 dpx = dFdx(pos), dpy = dFdy(pos);
  float dhx = dFdx(h), dhy = dFdy(h);
  vec3 r1 = cross(dpy, n), r2 = cross(n, dpx);
  float det = dot(dpx, r1);
  vec3 grad = sign(det) * (dhx * r1 + dhy * r2);
  return normalize(abs(det) * n - grad);
}

// Impact craters: bowl, raised rim, at two scales
float craterField(vec3 p, float scale) {
  vec3 c = cellular(p * scale);
  float size = 0.25 + 0.3 * fract(c.z * 7.13);
  float t = c.x / size;
  float bowl = t < 1.0 ? (t * t - 1.0) : 0.0;
  float rim = exp(-pow((t - 1.0) / 0.18, 2.0)) * 0.35;
  float present = step(0.45, fract(c.z * 3.71));
  return (bowl + rim) * present;
}

#if defined(FAMILY_DIAMOND)
// What a diamond facet sees, inside or out: black space, faint stars, the glow of the
// galaxy, and the star (a sharp disc and a softer halo)
vec3 diamondSky(vec3 d) {
  float s = max(dot(d, uLightDir), 0.0);
  vec3 star = uSunColor * uSunIntensity * (pow(s, 600.0) * 30.0 + pow(s, 40.0) * 0.6 + pow(s, 6.0) * 0.05);
  float stars = step(0.9985, hash33(floor(d * 240.0)).x) * 0.15;
  float galaxy = exp(-pow(dot(d, normalize(vec3(0.25, 1.0, 0.15))) / 0.3, 2.0)) * 0.035;
  return star + vec3(stars) + vec3(0.55, 0.6, 0.8) * galaxy;
}
#endif

void main() {
  vec3 p = normalize(vObj);
  vec3 ng = normalize(vWorldNormal);
  vec3 v = normalize(cameraPosition - vWorldPos);
  vec3 q = p * uContinentScale + uSeed;
  float lat = p.y;
  float alat = abs(lat);

  vec3 albedo;
  float height;          // for bumps, in radii
  float spec = uSpecular, rough = uRoughness, metal = uMetal;
  vec3 emission = vec3(0.0);
  float wet = 0.0;       // 1 over open water
  float landMask = 0.0;  // where cities may be

#if defined(FAMILY_TERRAN)
  // Continents: big coherent shapes, twisted by the planet's own warp. Variants: 0 a few
  // continents, 1 an archipelago, 2 a single supercontinent, 3 continents split by rifts
  vec3 w = vec3(fbmN(q * 0.8 + vec3(5.2, 1.3, 2.8), 3.0), fbmN(q * 0.8 + vec3(1.7, 9.2, 4.1), 3.0), fbmN(q * 0.8 + vec3(8.3, 2.8, 6.6), 3.0));
  float k = uVariant < 0.5 ? 0.9 : uVariant < 1.5 ? 2.2 : uVariant < 2.5 ? 0.6 : 1.1;
  float cont = fbm(q * k + w * (0.35 + uWarp * 0.4)) * 1.5;
  if (uVariant > 1.5 && uVariant < 2.5) cont += dot(p, normalize(uSeed - 50.0)) * 0.45;
  if (uVariant > 2.5) cont -= pow(1.0 - abs(snoise(q * 1.3 + w)), 10.0) * 0.6;
  float landF = smoothstep(uSea, uSea + 0.06, cont);
  // Mountain belts along the edges of the continents, like colliding plates
  float belt = exp(-pow((cont - uSea - 0.22) / 0.16, 2.0));
  float mountains = ridged(q * 2.4 * uFeature + w, uOctaves - 1.0) * (0.35 + belt) * smoothstep(uSea, uSea + 0.3, cont);
  float h = cont + mountains * 0.5 * uRelief;
  // Climate: wet tropics and temperate belts, dry subtropics, drier far inland
  float coastal = 1.0 - smoothstep(0.0, 0.5, cont - uSea);
  float moisture = fbmN(q * 1.1 + vec3(3.0), 4.0) * 0.8 + 0.3 * (1.0 - smoothstep(0.12, 0.35, alat)) - 0.35 * exp(-pow((alat - 0.42) / 0.12, 2.0)) + 0.25 * coastal;
  float altitude = clamp((h - uSea) / 1.2, 0.0, 1.0);
  // Ground: soil and rock by altitude, then vegetation where it is wet and warm enough
  vec3 soil = mix(uLow, uMid, smoothstep(0.05, 0.4, altitude));
  soil = mix(soil, uHigh, smoothstep(0.4, 0.7, altitude));
  vec3 green = mix(uAccent, uAccent * 1.35, 0.5 + 0.5 * fbmN(q * 3.0, 3.0));
  float veg = uVegetation * smoothstep(-0.15, 0.3, moisture) * (1.0 - smoothstep(0.35, 0.6, altitude)) * (1.0 - smoothstep(0.6, 0.85, alat));
  vec3 land = mix(soil, green, veg);
  // Dry belts turn to sand
  vec3 sand = mix(uMid, vec3(0.74, 0.6, 0.4), 0.55);
  land = mix(land, sand, (1.0 - veg) * smoothstep(-0.05, -0.4, moisture) * 0.8);
  // Water: deeper is darker
  // Shelves along the coasts, then the open ocean drops away
  float depth = clamp((uSea - cont) / 0.18, 0.0, 1.0);
  vec3 water = mix(uShallow, uDeep, smoothstep(0.0, 0.6, depth));
  // Microbial life: plankton blooms swirling in the currents, turquoise and milky green
  if (uBloom > 0.0) {
    vec3 bw = vec3(fbmN(q * 3.0 + 2.0, 3.0), fbmN(q * 3.0 + 6.0, 3.0), 0.0);
    float bloom = smoothstep(0.25, 0.6, fbmN(q * 5.0 + bw * 2.5, 5.0)) * (1.0 - smoothstep(0.3, 0.7, alat));
    water = mix(water, vec3(0.08, 0.42, 0.38), bloom * 0.55 * uBloom);
  }
  albedo = mix(water, land, landF);
  wet = 1.0 - landF;
  landMask = landF * (1.0 - smoothstep(0.4, 0.6, altitude));
  // Ice: polar caps (wavy edge) and high peaks; frozen seas too
  float ice = smoothstep(uIceCap, uIceCap + 0.04, alat + 0.06 * fbmN(q * 4.0, 3.0) + altitude * 0.35 * landF);
  ice = max(ice, smoothstep(0.82, 0.95, altitude + mountains * 0.15) * landF);
  albedo = mix(albedo, uPeak, ice);
  wet *= 1.0 - ice;
  landMask *= 1.0 - ice;
  height = (landF > 0.0 ? max(h - uSea, 0.0) : 0.0) * 0.012 * uRelief + (1.0 - landF) * fbmN(p * 60.0 + vec3(uTime * 0.02), 2.0) * 0.0004;
  spec = mix(0.04, 1.0, wet);
  rough = mix(0.85, 0.12, wet);

#elif defined(FAMILY_DESERT)
  vec3 w = vec3(fbmN(q + vec3(5.2, 1.3, 2.8), 3.0), fbmN(q + vec3(1.7, 9.2, 4.1), 3.0), 0.0);
  float base = fbm(q + w * 0.6);
  // Dark rocky plateaus (hamada), sand seas (ergs) in the basins, dry river valleys
  float rock = smoothstep(-0.12, 0.25, fbmN(q * 1.6 + vec3(7.0) + w * 0.5, uOctaves));
  float erg = smoothstep(0.05, -0.3, base) * (1.0 - rock);
  float valleys = 1.0 - smoothstep(0.0, 0.05, abs(fbmN(q * 2.3 + w * 0.8, 5.0)));
  valleys *= 1.0 - erg;
  // Dune fields: long crests across the prevailing wind, broken by noise
  float dunePhase = dot(p, normalize(vec3(0.8, 0.15, 0.55))) * 90.0 + fbmN(q * 3.0, 3.0) * 6.0;
  float dunes = pow(0.5 + 0.5 * sin(dunePhase), 3.0) * erg;
  float h = base * 0.6 + rock * 0.3 - valleys * 0.2 + ridged(q * 3.0, uOctaves - 2.0) * rock * 0.3;
  vec3 sand = mix(uLow, uPeak, 0.25 + 0.25 * fbmN(q * 8.0, 3.0));
  albedo = mix(uMid, uLow, smoothstep(-0.25, 0.25, base + fbmN(q * 5.0, 4.0) * 0.25));
  albedo = mix(albedo, sand, erg * (0.6 + 0.4 * dunes));
  albedo = mix(albedo, uHigh, rock * (0.55 + 0.25 * fbmN(q * 9.0, 4.0)));
  albedo = mix(albedo, uHigh * 0.8, valleys * 0.5);
  // Variants: 0 dune seas, 1 a great rift valley, 2 cratered like Mars, 3 terraced mesas
  if (uVariant > 0.5 && uVariant < 1.5) {
    float rift = pow(1.0 - abs(snoise(q * 0.55 + w * 0.6)), 28.0) * smoothstep(0.75, 0.3, alat);
    h -= rift * 0.9;
    albedo = mix(albedo, uHigh * 0.65, rift * 0.8);
  } else if (uVariant > 1.5 && uVariant < 2.5) {
    float cr = craterField(p, 4.5 * uFeature) * 0.6 + craterField(p + 3.1, 12.0 * uFeature) * 0.3 * clamp(uOctaves - 4.0, 0.0, 1.0);
    h += cr * (0.5 + uCraters);
    albedo *= 1.0 + cr * 0.25;
  } else if (uVariant > 2.5) {
    float steps = 5.0;
    float terraced = floor(h * steps) / steps + smoothstep(0.0, 0.25, fract(h * steps)) / steps;
    h = mix(h, terraced, rock);
    albedo = mix(albedo, uHigh * 1.2, smoothstep(0.05, 0.0, fract(h * steps)) * rock * 0.5);
  }
  // Frost on the poles of cold deserts
  albedo = mix(albedo, uPeak * 1.1, smoothstep(0.9, 0.97, alat + fbmN(q * 4.0, 3.0) * 0.04) * 0.7);
  height = (h * 0.009 + dunes * 0.0008) * uRelief;
  landMask = 1.0 - valleys;

#elif defined(FAMILY_BARREN) || defined(FAMILY_RADIOACTIVE)
  vec3 w = vec3(fbmN(q * 0.9, 3.0), fbmN(q * 0.9 + 4.4, 3.0), fbmN(q * 0.9 + 8.8, 3.0)) * uWarp;
  float base = fbm(q * 1.2 + w);
  float rough1 = ridged(q * 3.0 * uFeature + w, uOctaves - 2.0);
  float f = uFeature;
  float craters = craterField(p, 4.0 * f) * 0.6 + craterField(p + 3.7, 11.0 * f) * 0.3 * clamp(uOctaves - 4.0, 0.0, 1.0) + craterField(p + 9.1, 26.0 * f) * 0.15 * clamp(uOctaves - 6.0, 0.0, 1.0);
  craters *= uCraters;
  float h = base * 0.6 + rough1 * 0.25 + craters;
  albedo = mix(uLow, uMid, smoothstep(-0.4, 0.4, base + fbmN(q * 7.0, 4.0) * 0.3));
  albedo = mix(albedo, uHigh, smoothstep(0.45, 0.8, rough1));
  // Variants: 0 saturated with craters, 1 dark lava plains (maria) like the Moon,
  // 2 tectonic scarps and fractures, 3 a giant impact basin with ring walls
  if (uVariant > 0.5 && uVariant < 1.5) {
    float maria = smoothstep(0.05, -0.15, fbmN(q * 0.8 + w, 5.0));
    albedo = mix(albedo, uLow * 0.45, maria);
    h = mix(h, base * 0.15, maria * 0.8);
    craters *= 1.0 - maria * 0.7;
  } else if (uVariant > 1.5 && uVariant < 2.5) {
    float scarps = pow(1.0 - abs(snoise(q * 1.8 + w * 2.0)), 14.0) + pow(1.0 - abs(snoise(q * 4.2 + 7.0)), 18.0) * 0.6;
    h += scarps * 0.5;
    albedo = mix(albedo, uHigh * 1.15, scarps * 0.4);
  } else if (uVariant > 2.5) {
    vec3 centre = normalize(uSeed - 50.0);
    float d = acos(clamp(dot(p, centre), -1.0, 1.0)) / 0.9;
    float basin = (d < 1.0 ? (d * d - 1.0) * 0.8 : 0.0) + exp(-pow((d - 1.0) / 0.08, 2.0)) * 0.5 + exp(-pow((d - 1.45) / 0.06, 2.0)) * 0.25;
    h += basin;
    albedo = mix(albedo, uLow * 0.7, smoothstep(1.0, 0.6, d) * 0.5);
  }
  // Fresh crater rims are brighter, floors darker
  albedo *= 1.0 + craters * 0.35;
  height = h * 0.008 * uRelief;
  landMask = 0.4;
#if defined(FAMILY_RADIOACTIVE)
  // The crust is split open over glowing ore; luminous sludge pools in the craters and
  // basins, with a blue Cherenkov core where it is deepest; the ground around fissures
  // and pools is stained a sickly yellow-green, and hot spots flare and fade
  vec3 cells = cellular(q * 3.0 + w * 0.5);
  float gap = cells.y - cells.x;
  float fissure = 1.0 - smoothstep(0.0, 0.05, gap);
  vec3 fineCells = cellular(q * 9.0 + w);
  float fineCracks = (1.0 - smoothstep(0.0, 0.03, fineCells.y - fineCells.x)) * 0.5 * clamp(uOctaves - 4.0, 0.0, 1.0);
  float pools = max(smoothstep(-0.18, -0.38, craters), smoothstep(-0.3, -0.5, base + fbmN(q * 4.0, 3.0) * 0.15));
  float deep = max(smoothstep(-0.35, -0.6, craters), smoothstep(-0.45, -0.65, base));
  float stain = max(1.0 - smoothstep(0.0, 0.22, gap), smoothstep(-0.02, -0.3, craters)) * (0.6 + 0.4 * fbmN(q * 6.0, 3.0));
  float flare = smoothstep(0.55, 0.9, snoise(q * 1.4 + vec3(uTime * 0.03)));
  float pulse = 0.7 + 0.3 * sin(uTime * 1.3 + cells.z * 20.0);
  albedo = mix(albedo, mix(vec3(0.42, 0.46, 0.1), uEmissive * 0.4, 0.4), clamp(stain, 0.0, 1.0) * 0.55);
  albedo = mix(albedo, uEmissive * 0.3, max(fissure * 0.6, pools));
  emission = uEmissive * (fissure * 1.6 + fineCracks + pools * (0.9 + 0.3 * pulse) + flare * (fissure + stain) * 0.8) * pulse * uEmission;
  emission += vec3(0.35, 0.65, 1.0) * deep * (0.8 + 0.2 * pulse) * uEmission;
  // Sludge lies flat in the hollows
  height = mix(height, -0.001 * uRelief, pools);
  // It glows bright enough to be seen in daylight too
  emission *= 1.5;
#endif

#elif defined(FAMILY_METAL)
  // A world of bare metal: broad plains that once flowed and set mirror-smooth, scoured
  // and frosted elsewhere, and crusted with oxide (rust, verdigris, tarnish, temper
  // colours) in the low ground and on the oldest surfaces, dull and rough, so it reads
  // as metal and never as a gem. Impacts expose fresh, bright metal. Variants: 0 smooth
  // seas of metal under oxidised highlands, 1 brushed (long grooves), 2 cast (frozen
  // flow ripples), 3 armour plates
  vec3 w = vec3(fbmN(q, 3.0), fbmN(q + 4.4, 3.0), fbmN(q + 8.8, 3.0)) * uWarp;
  float base = fbm(q * 1.1 + w);
  float detail = fbmN(q * 6.0 * uFeature + w, uOctaves - 2.0);
  vec3 dir = normalize(hash33(uSeed) - 0.5);
  float along = dot(p, dir);
  float grooves = pow(abs(sin((along * 160.0 + fbmN(q * 2.0, 3.0) * 8.0) * uFeature)), 6.0);
  float grooveAmount = uVariant > 0.5 && uVariant < 1.5 ? 1.0 : 0.15;
  float flow = sin((base * 30.0 + along * 12.0) * uFeature);
  float castAmount = uVariant > 1.5 && uVariant < 2.5 ? 1.0 : 0.0;
  float seams = 0.0;
  if (uVariant > 2.5) {
    vec3 plates = cellular(q * 3.0 * uFeature + w * 0.4);
    seams = 1.0 - smoothstep(0.0, 0.025, plates.y - plates.x);
  }
  float craters = craterField(p, 5.0 * uFeature) * uCraters * 0.6 + craterField(p + 2.2, 14.0 * uFeature) * uCraters * 0.3;
  float fresh = smoothstep(0.0, -0.3, craters);
  // Smooth seas where the metal pooled and set
  float sea = uVariant < 0.5 ? smoothstep(0.0, -0.2, base) : smoothstep(-0.25, -0.45, base) * 0.6;
  float oxide = smoothstep(0.0, 0.35, fbmN(q * 2.2 + w + 3.0, uOctaves - 1.0) + base * 0.5 - 0.05);
  oxide *= (1.0 - fresh) * (1.0 - sea);
  vec3 bare = mix(uLow, uMid, smoothstep(-0.5, 0.5, base + detail * 0.3));
  bare = mix(bare, uMid * 1.15, max(fresh * 0.6, sea * 0.3));
  vec3 crust = mix(uAccent, uHigh * 0.6, 0.3) * (0.5 + 0.5 * fbmN(q * 12.0, 3.0));
  albedo = mix(bare, crust, oxide);
  albedo = mix(albedo, uHigh, seams * 0.8);
  metal = 1.0 - oxide * 0.95;
  spec = mix(1.0, 0.08, oxide);
  rough = mix(uRoughness * (1.0 + grooves * grooveAmount * 0.6 + detail * 0.4) * (1.0 - sea * 0.7), 0.85, oxide);
  height = (base * 0.005 * (1.0 - sea * 0.8) + craters * 0.006 - seams * 0.004 + grooves * grooveAmount * 0.0006 + flow * castAmount * 0.0015 + oxide * detail * 0.002) * uRelief;
  landMask = 0.3;

#elif defined(FAMILY_CRYSTAL)
  // Fields of crystal breaking out of dark rock: each crystal a flat, tilted face that
  // flashes when it catches the star, coloured by thin-film interference. Variants:
  // 0 clustered fields, 1 long shards (aligned), 2 geodes (rings of crystals in
  // basins), 3 a fine druse covering everything
  vec3 w = vec3(fbmN(q, 3.0), fbmN(q + 4.4, 3.0), fbmN(q + 8.8, 3.0)) * uWarp;
  float base = fbm(q * 1.2 + w);
  vec3 sq = q;
  if (uVariant > 0.5 && uVariant < 1.5) sq += normalize(hash33(uSeed) - 0.5) * dot(q, normalize(hash33(uSeed) - 0.5)) * 2.5;
  float scale = (uVariant > 2.5 ? 16.0 : 6.0) * uFeature;
  vec3 cells = cellular(sq * scale + w);
  float field = uVariant > 2.5 ? 1.0 : smoothstep(-0.05, 0.2, fbmN(q * 1.4 + w + 2.0, 5.0));
  if (uVariant > 1.5 && uVariant < 2.5) {
    vec3 geode = cellular(q * 1.6 * uFeature);
    float ring = exp(-pow((geode.x - 0.38) / 0.12, 2.0));
    field = max(field * 0.3, ring);
  }
  float edges = 1.0 - smoothstep(0.0, 0.05, cells.y - cells.x);
  vec3 tilt = hash33(vec3(cells.z * 131.0, cells.z * 17.0, 3.0)) - 0.5;
  vec3 crystal = mix(uMid, uHigh, fract(cells.z * 9.1));
  crystal = mix(crystal, uAccent, smoothstep(0.85, 1.0, fract(cells.z * 4.7)) * 0.7);
  albedo = mix(uLow * (0.8 + 0.3 * base), crystal, field * (1.0 - edges * 0.6));
  height = (base * 0.004 + field * (dot(p, tilt) * 0.05 + (1.0 - cells.x) * 0.004)) * uRelief;
  rough = mix(0.7, uRoughness, field);
  spec = mix(0.05, 1.0, field);
  landMask = 0.2;

#elif defined(FAMILY_DIAMOND)
  // A diamond world. The crust is grown crystal: grains, each a crystal with its own
  // cleavage directions, cut into flat facets along three families of planes, with
  // growth terraces and triangular etch pits (trigons) on the faces. Its colour is not
  // painted on: it is the light it reflects, refracts and disperses (see the shading
  // below). Variants: 0 polycrystalline grains, 1 a single giant crystal (big facets,
  // stepped terraces), 2 diamond breaking through plains of dark graphite, 3 frosted
  // (a fine, sugar-like crust of tiny crystals)
  vec3 w = vec3(fbmN(q, 3.0), fbmN(q + 4.4, 3.0), fbmN(q + 8.8, 3.0)) * uWarp;
  bool oneCrystal = uVariant > 0.5 && uVariant < 1.5;
  vec3 grains = cellular(q * 1.8 * uFeature + w * 0.5);
  float grainId = oneCrystal ? 0.37 : grains.z;
  float boundary = oneCrystal ? 0.0 : 1.0 - smoothstep(0.0, 0.03, grains.y - grains.x);
  // Each grain its own growth direction (for the zoning seen inside)
  vec3 a1 = normalize(hash33(uSeed + grainId * 13.0 + 1.0) - 0.5);
  float k = (uVariant < 0.5 ? 14.0 : oneCrystal ? 7.0 : uVariant < 2.5 ? 16.0 : 40.0) * uFeature;
  // Facets: irregular flat faces, stretched a little along the grain's direction
  vec3 fq = q * k + a1 * dot(q, a1) * k * 0.6 + w * 0.6;
  vec3 facets = cellular(fq);
  vec3 cellId = vec3(facets.z * 97.0, grainId * 31.0, facets.z * 13.0);
  float edge = facets.y - facets.x;
  // Each facet leans its own way (applied to the normal below)
  vec3 facetTilt = hash33(cellId + uSeed) - 0.5;
  float base = fbm(q * 0.8);
  // Growth terraces across the faces of a big crystal; small triangular etch pits
  float terraceS = dot(q, a1) * k * 1.5;
  float terrace = oneCrystal ? 1.0 - smoothstep(0.0, 0.06, min(fract(terraceS), 1.0 - fract(terraceS))) : 0.0;
  vec3 pits = cellular(fq * 3.0);
  float trigon = smoothstep(0.12, 0.08, pits.x) * step(0.75, fract(pits.z * 5.3)) * clamp(uOctaves - 4.0, 0.0, 1.0);
  // Graphite plains (variant 2): the same carbon, unpressed, dark and dully lustrous
  float graphite = uVariant > 1.5 && uVariant < 2.5 ? smoothstep(0.05, -0.15, fbmN(q * 1.3 + w, 5.0)) : 0.0;
  albedo = mix(uLow, uHigh * (0.8 + 0.4 * fbmN(q * 9.0, 3.0)), graphite);
  height = (base * 0.003 - boundary * 0.003 - trigon * 0.002 - terrace * 0.001) * uRelief;
  rough = mix(uVariant > 2.5 ? 0.08 : uRoughness, 0.4, graphite);
  spec = 1.0;
  landMask = 0.1;

#elif defined(FAMILY_ICE)
  // Variants after the real icy moons: 0 Europa (long double ridges, rust-stained
  // lineae), 1 Enceladus (smooth, with "tiger stripes" at one pole), 2 Callisto (dirty
  // ice saturated with bright craters), 3 Triton (cantaloupe dimples)
  vec3 w = vec3(fbmN(q, 3.0), fbmN(q + 4.4, 3.0), fbmN(q + 8.8, 3.0)) * uWarp;
  float base = fbm(q * 1.4 + w);
  float lines = 0.0;
  float craters = craterField(p, 6.0 * uFeature) * uCraters * 0.4;
  albedo = mix(uLow, uMid, smoothstep(-0.4, 0.4, base));
  if (uVariant < 0.5) {
    float l1 = pow(1.0 - abs(snoise(q * 3.0 * uFeature + w * 2.0)), 22.0);
    float l2 = pow(1.0 - abs(snoise(q * 7.0 * uFeature + 4.0 + w)), 26.0) * clamp(uOctaves - 4.0, 0.0, 1.0);
    lines = max(l1, l2 * 0.8);
    albedo = mix(albedo, uAccent, lines * 0.85);
    // Chaos terrain: blotches where the crust broke and refroze
    albedo = mix(albedo, uAccent * 0.8, smoothstep(0.55, 0.75, fbmN(q * 2.0 + 9.0, 4.0)) * 0.5);
  } else if (uVariant < 1.5) {
    vec3 pole = vec3(0.0, -1.0, 0.0);
    float polar = smoothstep(0.55, 0.85, dot(p, pole));
    float stripes = pow(abs(sin(dot(p, normalize(vec3(1.0, 0.0, 0.4))) * 28.0 + fbmN(q * 2.0, 3.0) * 2.0)), 14.0) * polar;
    lines = stripes;
    albedo = mix(uMid * 1.05, uAccent * 0.9, stripes * 0.8);
    craters *= smoothstep(0.3, -0.1, dot(p, pole));
  } else if (uVariant < 2.5) {
    craters = craterField(p, 5.0 * uFeature) * 0.7 + craterField(p + 3.0, 13.0 * uFeature) * 0.4 + craterField(p + 7.0, 30.0) * 0.2 * clamp(uOctaves - 5.0, 0.0, 1.0);
    albedo = mix(uAccent * 0.6, uLow, smoothstep(-0.3, 0.3, base));
    albedo = mix(albedo, uMid * 1.1, smoothstep(0.1, 0.4, craters));
  } else {
    vec3 dimples = cellular(q * 9.0 * uFeature + w);
    float cup = smoothstep(0.0, 0.5, dimples.x);
    lines = (1.0 - smoothstep(0.0, 0.08, dimples.y - dimples.x)) * 0.6;
    albedo = mix(albedo * 0.92, albedo * 1.05, cup);
    albedo = mix(albedo, uAccent, lines * 0.4);
    base += cup * 0.4;
  }
  height = (base * 0.004 + lines * 0.002 + craters * 0.005) * uRelief;
  landMask = 0.2;

#elif defined(FAMILY_LAVA)
  vec3 warp = vec3(fbmN(q * 2.0, 3.0), fbmN(q * 2.0 + 4.1, 3.0), fbmN(q * 2.0 + 8.3, 3.0));
  float flicker = 0.85 + 0.15 * snoise(q * 6.0 + vec3(uTime * 0.4));
  float crust = fbm(q * 3.0);
  float glow;
  vec3 hot;
  if (uStyle < 0.5) {
    // Lava world: a black crust of plates, irregular (warped cells) and of many sizes;
    // glowing seams between them, and pools of molten rock in the low ground
    vec3 cells = cellular(q * 5.5 + warp * 1.4);
    vec3 fine = cellular(q * 14.0 + warp * 2.0);
    float seam = cells.y - cells.x;
    float cracks = (1.0 - smoothstep(0.0, 0.035 + 0.03 * uEmission, seam)) * (0.6 + 0.4 * snoise(q * 9.0));
    cracks = max(cracks, (1.0 - smoothstep(0.0, 0.03, fine.y - fine.x)) * 0.35 * clamp(uOctaves - 4.0, 0.0, 1.0));
    float molten = smoothstep(0.42 - uEmission * 0.3, 0.62 - uEmission * 0.3, -fbm(q * 0.8 + warp * 0.5 + vec3(0.0, 0.0, uTime * 0.003)));
    glow = clamp(max(cracks, molten), 0.0, 1.0) * flicker;
    albedo = mix(uLow, uMid, smoothstep(-0.3, 0.4, crust));
    albedo = mix(albedo, uHigh, smoothstep(0.4, 0.8, fract(cells.z * 7.0)) * 0.35);
    albedo *= 1.0 - glow * 0.9;
    // Deep red at the edges of a flow, orange, then yellow where it is hottest
    hot = mix(vec3(0.55, 0.06, 0.01), vec3(1.0, 0.42, 0.06), smoothstep(0.2, 0.7, glow));
    hot = mix(hot, vec3(1.0, 0.78, 0.35), smoothstep(0.8, 1.0, glow) * molten);
    height = (crust * 0.005 + (1.0 - glow) * 0.006 * (1.0 - cells.x)) * uRelief;
  } else if (uStyle < 1.5) {
    // Magma ocean: the whole surface is molten. Convection wells up hot in the middle of
    // each cell (yellow), cools as it spreads (orange, red) and skins over into dark
    // rafts of crust that drift and pile up where the cells meet, cracking as they go
    float t = uTime * 0.003;
    vec3 conv = cellular(q * 2.0 * uFeature + warp * 0.9 + vec3(0.0, 0.0, t));
    float streak = fbmN(q * 9.0 + warp * 2.5 + vec3(t * 3.0), uOctaves - 1.0);
    float raft = smoothstep(0.4, 0.14, conv.y - conv.x + streak * 0.12);
    raft *= smoothstep(-0.25, 0.15, fbmN(q * 6.0 + warp * 2.0 + vec3(t * 2.0), 4.0) + 0.3);
    vec3 rc = cellular(q * 12.0 + warp * 2.0);
    float raftCracks = (1.0 - smoothstep(0.0, 0.04, rc.y - rc.x)) * raft;
    float heat = clamp(1.0 - conv.x * 2.2 + streak * 0.35, 0.0, 1.0);
    glow = clamp((1.0 - raft) * (0.55 + 0.45 * heat) + raftCracks * 0.6, 0.0, 1.0) * flicker;
    albedo = mix(mix(uLow, uMid, smoothstep(-0.3, 0.4, crust)), vec3(0.04, 0.015, 0.008), 1.0 - raft);
    hot = mix(vec3(0.6, 0.08, 0.01), vec3(1.0, 0.45, 0.07), heat);
    hot = mix(hot, vec3(1.0, 0.85, 0.45), smoothstep(0.75, 1.0, heat) * (1.0 - raft));
    height = (raft * 0.004 + crust * 0.002 * raft + streak * 0.0004) * uRelief;
  } else {
    // Molten core: the crust has been torn open down to the mantle. Huge dark slabs drift
    // apart over wide chasms of white-hot rock; each slab still glows red along its
    // edges as it cools, and is crazed with fine glowing cracks
    vec3 slabs = cellular(q * 1.6 * uFeature + warp * 0.6);
    float gap = slabs.y - slabs.x + snoise(q * 5.0) * 0.025;
    float chasm = 1.0 - smoothstep(0.04, 0.1 + 0.04 * uEmission, gap);
    float rim = exp(-max(gap, 0.0) / 0.12) * (1.0 - chasm);
    vec3 fine = cellular(q * 10.0 + warp * 1.5);
    float crazing = (1.0 - smoothstep(0.0, 0.025, fine.y - fine.x)) * clamp(uOctaves - 3.0, 0.0, 1.0) * (0.3 + 0.7 * rim);
    glow = clamp(chasm + rim * 0.55 + crazing * 0.45, 0.0, 1.0) * flicker;
    albedo = mix(uLow, uHigh, smoothstep(-0.3, 0.5, crust)) * (1.0 - chasm);
    albedo = mix(albedo, vec3(0.22, 0.1, 0.07), rim * 0.6);
    hot = mix(vec3(0.7, 0.12, 0.02), vec3(1.0, 0.55, 0.12), smoothstep(0.3, 0.8, glow));
    hot = mix(hot, vec3(1.0, 0.93, 0.75), chasm);
    height = ((1.0 - chasm) * 0.008 + crust * 0.003 - crazing * 0.001) * uRelief;
  }
  hot = mix(hot, uEmissive * 1.2, 0.2);
  emission = hot * glow * (0.9 + 1.1 * uEmission);

#elif defined(FAMILY_GAS) || defined(FAMILY_VEILED)
  vec3 g = p;
  // Storms: a few vortices twist the flow around them
  for (int i = 0; i < 3; i++) {
    vec3 centre = normalize(hash33(uSeed + float(i) * 17.0) - 0.5);
    centre.y *= 0.5;
    centre = normalize(centre);
    float r = 0.12 + 0.12 * hash33(uSeed + float(i) * 5.0).x;
    float d = distance(g, centre);
    float swirl = smoothstep(r, 0.0, d) * uStorms * 3.5;
    if (swirl > 0.0) {
      vec3 axis = centre;
      float a = swirl;
      g = g * cos(a) + cross(axis, g) * sin(a) + axis * dot(axis, g) * (1.0 - cos(a));
    }
  }
  float t = uTime * 0.01;
  // No solid surface: each band runs at its own speed, east or west, so the clouds shear
  g = rotY(g, uTime * 0.0004 * sin(g.y * uBandFreq * 0.5 + uSeed.x));
  float turbulence = fbmN(vec3(g.x * 2.5, g.y * 9.0, g.z * 2.5) + uSeed + vec3(t, 0.0, -t), uOctaves);
  float y = g.y + turbulence * 0.05 * (0.6 + uBands);
  // Waves curl along the edges where bands slide past each other
  y += sin(atan(g.z, g.x) * 22.0 + y * 60.0 + t * 3.0) * 0.006 * clamp(uOctaves - 3.0, 0.0, 1.0);
  float band = sin(y * uBandFreq + sin(y * 5.0 + uSeed.y) * 1.5);
  float fine = fbmN(vec3(g.x * 6.0, g.y * 40.0, g.z * 6.0) + uSeed + vec3(t * 2.0), uOctaves - 1.0);
  float b = band * (0.35 + uBands * 0.75) + fine * 0.45;
  albedo = mix(uMid, uLow, smoothstep(-0.6, 0.6, b));
  albedo = mix(albedo, uHigh, smoothstep(0.55, 1.0, b) * 0.8);
  albedo = mix(albedo, uAccent, smoothstep(-0.7, -1.0, b) * 0.6);
  // Storm ovals stand out in their own colour
  for (int i = 0; i < 3; i++) {
    vec3 centre = normalize(hash33(uSeed + float(i) * 17.0) - 0.5);
    centre.y *= 0.5;
    centre = normalize(centre);
    float r = 0.12 + 0.12 * hash33(uSeed + float(i) * 5.0).x;
    float oval = smoothstep(r * 0.7, r * 0.3, distance(p, centre)) * uStorms;
    albedo = mix(albedo, mix(uAccent, uHigh, 0.3 * float(i)), oval * 0.55);
  }
#if defined(FAMILY_GAS)
  // Variants: 0 Jupiter (as above), 1 Saturn (a hexagonal jet stream round the pole),
  // 2 Neptune (a dark spot and bright high clouds), 3 turbulent (no clear bands)
  if (uVariant > 0.5 && uVariant < 1.5) {
    float ang = atan(p.z, p.x);
    float hexR = 0.33 * (1.0 + 0.08 * cos(6.0 * ang + uSeed.x));
    float rad = length(p.xz);
    float hex = exp(-pow((rad - hexR) / 0.025, 2.0)) * step(0.0, p.y);
    albedo = mix(albedo, uAccent, hex * 0.6);
    albedo = mix(albedo, albedo * 0.75, smoothstep(hexR, hexR * 0.5, rad) * step(0.0, p.y) * 0.5);
  } else if (uVariant > 1.5 && uVariant < 2.5) {
    vec3 spotC = normalize(vec3(0.6, -0.35, 0.7) + (hash33(uSeed) - 0.5) * 0.5);
    float spot = smoothstep(0.16, 0.06, distance(p, spotC));
    albedo = mix(albedo, uAccent * 0.45, spot);
    float streaks = smoothstep(0.55, 0.8, fbmN(vec3(g.x * 3.0, g.y * 30.0, g.z * 3.0) + uSeed + 9.0, 4.0));
    albedo = mix(albedo, vec3(0.95), streaks * 0.75);
  } else if (uVariant > 2.5) {
    float churn = fbmN(g * 4.0 + vec3(t), uOctaves);
    albedo = mix(albedo, mix(uLow, uHigh, 0.5 + 0.5 * churn), 0.6);
  }
  if (uStyle > 0.5 && uStyle < 1.5) {
    // Ice giant: a deep methane haze softens the bands into faint stripes; bright methane
    // clouds ride high above it in long streaks, and a paler haze hoods one pole
    albedo = mix(albedo, mix(uLow, uMid, 0.5 + 0.5 * band), 0.5);
    float streaks = smoothstep(0.45, 0.8, fbmN(vec3(g.x * 3.0, g.y * 28.0, g.z * 3.0) + uSeed + 13.0, 4.0));
    streaks *= smoothstep(0.08, 0.25, alat) * (1.0 - smoothstep(0.7, 0.85, alat));
    albedo = mix(albedo, uHigh, streaks * 0.85);
    albedo = mix(albedo, mix(uLow, uHigh, 0.55), smoothstep(0.6, 0.92, lat) * 0.6);
  }
#endif
  // Hazy, darker poles
  albedo *= 1.0 - smoothstep(0.75, 0.98, alat) * 0.35;
  // Nothing to cast bumps: the light sinks into the haze
  height = 0.0;
  emission = uEmissive * uEmission * smoothstep(0.2, 0.9, fine + band * 0.3) * 0.6;

#elif defined(FAMILY_EXOTIC)
  // Exotic matter: a glassy, iridescent crust laid out in an impossible geometry, glowing
  // along its seams; the pattern slowly drifts as if alive. Variants: 0 hexagons,
  // 1 triangles, 2 concentric shells, 3 interference waves
  vec3 w = vec3(fbmN(q, 3.0), fbmN(q + 4.4, 3.0), fbmN(q + 8.8, 3.0)) * uWarp;
  float drift = uTime * 0.01;
  float pattern;
  if (uVariant < 0.5) {
    vec3 cells = cellular(q * 6.0 * uFeature + w * 0.3);
    pattern = 1.0 - smoothstep(0.0, 0.06, cells.y - cells.x);
  } else if (uVariant < 1.5) {
    vec3 a = vec3(dot(q, vec3(1.0, 0.0, 0.0)), dot(q, vec3(-0.5, 0.0, 0.866)), dot(q, vec3(-0.5, 0.0, -0.866))) * 8.0 * uFeature + p.y * 5.0;
    vec3 fr = abs(fract(a) - 0.5);
    pattern = 1.0 - smoothstep(0.0, 0.05, min(min(fr.x, fr.y), fr.z));
  } else if (uVariant < 2.5) {
    float r = acos(clamp(dot(p, normalize(uSeed - 50.0)), -1.0, 1.0));
    pattern = pow(abs(sin(r * 30.0 * uFeature - drift * 3.0 + fbmN(q, 3.0) * 2.0)), 20.0);
  } else {
    pattern = pow(abs(sin(dot(p, normalize(hash33(uSeed) - 0.5)) * 40.0 + drift * 4.0) * sin(dot(p, normalize(hash33(uSeed + 3.0) - 0.5)) * 40.0 - drift * 3.0)), 6.0);
  }
  float base = fbm(q * 1.5 + w + vec3(drift));
  albedo = mix(uLow, uMid, smoothstep(-0.5, 0.5, base));
  albedo = mix(albedo, uHigh, pattern * 0.5);
  float pulse = 0.7 + 0.3 * sin(uTime * 0.8 + base * 6.0);
  emission = uEmissive * pattern * pulse * uEmission * 1.6;
  height = (base * 0.004 + pattern * 0.002) * uRelief;
  spec = 0.8;
  rough = uRoughness;

#elif defined(FAMILY_ANOMALY)
  // An anomaly: a black, light-swallowing body wrapped in slow whorls of something that
  // glows, flowing towards one point. It barely reflects the star; it lights itself
  vec3 sink = normalize(uSeed - 50.0);
  float toSink = acos(clamp(dot(p, sink), -1.0, 1.0));
  vec3 axis = sink;
  float a = toSink * 4.0 - uTime * 0.05;
  vec3 g = p * cos(a) + cross(axis, p) * sin(a) + axis * dot(axis, p) * (1.0 - cos(a));
  float whorl = fbmN(g * 3.0 * uFeature + vec3(uTime * 0.01), uOctaves);
  float filaments = pow(1.0 - abs(whorl), 12.0);
  albedo = mix(uLow, uHigh, smoothstep(0.2, 0.7, whorl) * 0.3);
  emission = uEmissive * (filaments * 1.5 + exp(-toSink * 3.0) * 1.2) * uEmission;
  height = whorl * 0.002;
  spec = 0.1;
#endif

  vec3 n = bumped(vWorldPos, ng, height * 1.6);
#if defined(FAMILY_DIAMOND)
  // Flat facets: one normal per face, leaning its own way (no bump seams at the edges)
  vec3 lean = facetTilt - p * dot(facetTilt, p);
  n = normalize(n + normalize(transpose(uWorldToObject) * lean) * length(lean) * 1.3 * (1.0 - graphite));
#endif

  // Cloud shadows: the deck as seen from the star, slightly offset
#if !defined(FAMILY_GAS) && !defined(FAMILY_VEILED)
  float shadow = 1.0;
  if (uClouds > 0.01) {
    vec3 toSunObj = uWorldToObject * uLightDir;
    shadow = 1.0 - 0.4 * cloudDensity(normalize(p + toSunObj * 0.006), max(uOctaves - 3.0, 3.0));
  }
#else
  float shadow = 1.0;
#endif
#if defined(HAS_RINGS)
  // The rings' shadow: where the ray to the star crosses the ring plane
  float ln = dot(uLightDir, uRingNormal);
  if (abs(ln) > 1e-4) {
    float tr = -dot(vWorldPos, uRingNormal) / ln;
    if (tr > 0.0) shadow *= 1.0 - 0.85 * ringDensity(length(vWorldPos + uLightDir * tr) / uPlanetRadius);
  }
#endif

  float day = daylight(n, ng);
  vec3 sun = uSunColor * uSunIntensity;
  vec3 ambient = vec3(0.012, 0.014, 0.02) + albedo * 0.015;
  vec3 diffuse = albedo * (1.0 - metal) * sun * day * shadow;
#if defined(FAMILY_GAS) || defined(FAMILY_VEILED)
  // A deep atmosphere, not a surface: the light wraps softly past the terminator and the
  // limb darkens, as the line of sight runs through more haze
  float nlGas = dot(ng, uLightDir);
  diffuse = albedo * sun * smoothstep(-0.12, 0.55, nlGas) * (0.35 + 0.65 * max(nlGas, 0.0)) * mix(0.5, 1.0, pow(max(dot(ng, v), 0.0), 0.5)) * shadow;
#endif
  vec3 f0 = mix(vec3(0.02), albedo, metal) * mix(1.0, 3.0, spec * (1.0 - metal));
  vec3 highlight = specularGGX(n, v, max(rough, 0.05), f0) * sun * shadow * spec * smoothstep(-0.02, 0.1, dot(ng, uLightDir));
  float sunUp = smoothstep(-0.02, 0.1, dot(ng, uLightDir));
  vec3 r = reflect(-v, n);
#if defined(FAMILY_METAL)
  // Metal mirrors its surroundings: the dark sky above, a faint glow of the galaxy, and
  // the star's highlight stretched along the grooves
  // (a broad, polished sheen, unlike the pin-point sparks of crystal and diamond)
  ambient += metal * (albedo * (0.03 + 0.08 * smoothstep(-0.3, 0.6, r.y)) + albedo * pow(max(dot(r, uLightDir), 0.0), 3.0) * 0.1 * sunUp);
  highlight += metal * albedo * sun * pow(max(dot(r, uLightDir), 0.0), 14.0) * 0.5 * sunUp * shadow;
#elif defined(FAMILY_CRYSTAL)
  // Faces flash when they catch the star; thin-film colours shift with the angle
  float glint = pow(max(dot(r, uLightDir), 0.0), 300.0) * 5.0;
  highlight += sun * glint * spec * sunUp;
  vec3 iridescence = 0.5 + 0.5 * cos(6.2831 * (dot(n, v) * 1.8 + vec3(0.0, 0.33, 0.67)));
  diffuse = mix(diffuse, diffuse * iridescence * 1.5, spec * 0.45);
  ambient += albedo * 0.05 * spec;
#elif defined(FAMILY_DIAMOND)
  // Diamond is not lit like rock. What you see is (1) the sky and the star mirrored in
  // each facet (fresnel: 17 % head-on, a mirror at grazing angles); (2) light that went
  // in, bounced off a facet behind and came back out, bent by refraction and split into
  // colours (dispersion, the "fire"), or trapped inside (the dark facets that make the
  // sparkle read); (3) the stone itself, seen in depth: its body colour, growth zones,
  // inclusions, and the sunlight it soaks up
  float nv = max(dot(n, v), 0.0);
  float F = 0.17 + 0.83 * pow(1.0 - nv, 5.0);
  vec3 mirrored = diamondSky(r) * F;
  vec3 back = normalize(-ng + (hash33(cellId * 3.1 + 7.0) - 0.5) * 1.4);
  // Into the stone (parallax): look a little way below the facet
  vec3 inward = refract(-normalize(uWorldToObject * v), p, 1.0 / 2.42);
  vec3 pIn = p + inward * 0.04;
  float zoning = 0.5 + 0.5 * sin(dot(pIn * uContinentScale, a1) * k * 2.0 + fbmN(pIn * 6.0, 3.0) * 2.0);
  float inclusions = smoothstep(0.7, 0.9, fbmN(pIn * 18.0 + uSeed, 3.0));
  vec3 body = albedo * (0.75 + 0.25 * zoning) * (1.0 - inclusions * 0.7);
  float soak = smoothstep(-0.1, 0.5, dot(ng, uLightDir));
  // (dispersion a little stronger than real diamond's, so the fire reads from orbit)
  vec3 iorRGB = vec3(2.36, 2.42, 2.52);
  vec3 fireRGB = vec3(0.0);
  for (int c = 0; c < 3; c++) {
    vec3 tin = refract(-v, n, 1.0 / iorRGB[c]);
    vec3 tout = refract(reflect(tin, back), -n, iorRGB[c]);
    if (dot(tout, tout) > 0.0) {
      vec3 d = normalize(tout);
      // Where the traced ray leads: the star itself (fire), or the sunlit body of the
      // stone, glowing with the light it has soaked up
      float glow = pow(0.5 + 0.5 * dot(d, uLightDir), 5.0);
      fireRGB[c] = diamondSky(d)[c] + (body * sun)[c] * glow * soak * 0.9;
    }
  }
  fireRGB *= (1.0 - F) * shadow;
  vec3 inner = body * sun * soak * 0.06 * shadow;
  // Facet edges and grain boundaries catch a thin line of light
  inner += sun * soak * (1.0 - smoothstep(0.0, 0.025, edge)) * 0.05 * (1.0 - boundary);
  vec3 stone = mirrored + fireRGB + inner;
  diffuse = mix(stone, diffuse, graphite);
  highlight *= graphite;
  ambient = mix(vec3(0.004, 0.005, 0.008) + albedo * 0.01, ambient, graphite);
#endif
  vec3 color = diffuse + highlight + ambient;

  // Silicon life: a network of faintly glowing veins over the ground, brighter at night
  if (uLifeGlow > 0.0) {
    float veins = pow(1.0 - abs(snoise(q * 5.0)), 20.0) + pow(1.0 - abs(snoise(q * 13.0 + 3.0)), 24.0) * 0.6;
    float pulse = 0.7 + 0.3 * sin(uTime * 0.6 + snoise(q * 2.0) * 6.0);
    emission += vec3(0.35, 0.85, 1.0) * veins * pulse * uLifeGlow * 0.9;
  }

  // Night side: cities and glowing ground
  float night = 1.0 - smoothstep(-0.12, 0.08, dot(ng, uLightDir));
  if (uCityLights > 0.0) {
    float clusters = smoothstep(0.15, 0.45, fbmN(q * 4.0 + vec3(11.0), 3.0));
    float sprawl = smoothstep(0.25, 0.65, snoise(q * 70.0)) + smoothstep(0.55, 0.8, snoise(q * 160.0)) * 0.6;
    color += vec3(1.0, 0.72, 0.38) * clusters * sprawl * landMask * night * uCityLights * 1.6;
  }
  color += emission * (0.35 + 0.65 * night);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const CLOUD_FRAGMENT = /* glsl */ `
${NOISE}
${LIGHTING}
${PALETTE}
${CLOUDS}
varying vec3 vObj;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
void main() {
  vec3 p = normalize(vObj);
  vec3 ng = normalize(vWorldNormal);
  float d = cloudDensity(p, uOctaves);
  if (d < 0.01) discard;
  vec3 v = normalize(cameraPosition - vWorldPos);
  float nl = dot(ng, uLightDir);
  // Soft terminator; thin edges glow when back-lit
  float lit = smoothstep(-0.18, 0.35, nl);
  float rim = pow(1.0 - max(dot(ng, v), 0.0), 3.0) * max(dot(-v, uLightDir), 0.0);
  vec3 sun = uSunColor * uSunIntensity;
  vec3 color = uCloudColor * (sun * (lit * (0.85 + 0.15 * d) + rim * 0.5) + vec3(0.01));
  // Sunset tint along the terminator
  color *= mix(vec3(1.0), vec3(1.0, 0.6, 0.35), smoothstep(0.25, 0.0, nl) * step(-0.18, nl));
  gl_FragColor = vec4(color, pow(d, 1.3) * 0.85);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

export const ATMOSPHERE_VERTEX = /* glsl */ `
varying vec3 vWorldPos;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

// Single scattering through the shell, planet at the world origin
export const ATMOSPHERE_FRAGMENT = /* glsl */ `
uniform vec3 uLightDir;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform float uPlanetRadius;
uniform float uAtmosphereRadius;
uniform vec3 uBetaR;
uniform float uBetaM;
uniform float uScaleR;
uniform float uScaleM;
varying vec3 vWorldPos;

vec2 sphere(vec3 o, vec3 d, float r) {
  float b = dot(o, d);
  float c = dot(o, o) - r * r;
  float h = b * b - c;
  if (h < 0.0) return vec2(1e9, -1e9);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}

void main() {
  vec3 o = cameraPosition;
  vec3 d = normalize(vWorldPos - cameraPosition);
  vec2 shell = sphere(o, d, uAtmosphereRadius);
  if (shell.x > shell.y) discard;
  vec2 ground = sphere(o, d, uPlanetRadius);
  float t0 = max(shell.x, 0.0);
  float t1 = shell.y;
  if (ground.x > 0.0 && ground.x < t1) t1 = ground.x;
  if (t1 <= t0) discard;

  const int STEPS = 12;
  const int LIGHT_STEPS = 4;
  float ds = (t1 - t0) / float(STEPS);
  vec3 sumR = vec3(0.0), sumM = vec3(0.0);
  float depthR = 0.0, depthM = 0.0;
  for (int i = 0; i < STEPS; i++) {
    vec3 x = o + d * (t0 + ds * (float(i) + 0.5));
    float h = length(x) - uPlanetRadius;
    float hr = exp(-h / uScaleR) * ds;
    float hm = exp(-h / uScaleM) * ds;
    depthR += hr;
    depthM += hm;
    // Light path to the star; in the planet's shadow there is none
    vec2 toSun = sphere(x, uLightDir, uAtmosphereRadius);
    vec2 blocked = sphere(x, uLightDir, uPlanetRadius * 0.998);
    if (blocked.x > 0.0) continue;
    float dl = toSun.y / float(LIGHT_STEPS);
    float lr = 0.0, lm = 0.0;
    for (int j = 0; j < LIGHT_STEPS; j++) {
      vec3 y = x + uLightDir * dl * (float(j) + 0.5);
      float hy = length(y) - uPlanetRadius;
      lr += exp(-hy / uScaleR) * dl;
      lm += exp(-hy / uScaleM) * dl;
    }
    vec3 tau = uBetaR * (depthR + lr) + uBetaM * 1.1 * (depthM + lm);
    vec3 attenuation = exp(-tau);
    sumR += attenuation * hr;
    sumM += attenuation * hm;
  }
  float mu = dot(d, uLightDir);
  float phaseR = 3.0 / (16.0 * 3.14159) * (1.0 + mu * mu);
  float g = 0.76;
  float phaseM = 3.0 / (8.0 * 3.14159) * ((1.0 - g * g) * (1.0 + mu * mu)) / ((2.0 + g * g) * pow(1.0 + g * g - 2.0 * g * mu, 1.5));
  vec3 color = uSunColor * uSunIntensity * 1.6 * (sumR * uBetaR * phaseR + sumM * uBetaM * phaseM);
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;
