// atlas-ui/react/static/js/Explore/planet/realistic/looks.ts
//
// What a planet looks like, from the data the generator gives it: its type picks a
// family of surface (Earth-like, desert, barren, ice, lava, gas, metal, crystal...) and a
// palette; the generator's base colour tints it so every planet keeps the colour it has
// from afar; temperature, atmosphere and life adjust the rest.
//
// Every planet also draws its own structure from its seed: a variant of its family (a
// pangaea or an archipelago, Europa-like cracks or Enceladus stripes, dune seas or a
// great rift...) and continuous shape parameters (scale, warping, sea level, feature
// size), so no two planets of a type share a shape. Deterministic from the planet seed.

import * as THREE from "three";

export type Family = "terran" | "desert" | "barren" | "metal" | "crystal" | "diamond" | "ice" | "lava" | "gas" | "veiled" | "radioactive" | "exotic" | "anomaly";

export interface PlanetLook {
  family: Family;
  // Structure: which variant of its family (0..3), and how it is shaped
  variant: number;
  // Which kind within a family that holds several types: lava 0 lava world, 1 magma
  // ocean, 2 molten core; gas 0 gas giant, 1 ice giant, 2 nebulous
  style: number;
  warp: number; // how much the shapes twist (0..1.2)
  featureScale: number; // size of the secondary features (craters, plates, facets...)
  // Surface palette (linear colours)
  deep: THREE.Color; // ocean depths, or lowest ground
  shallow: THREE.Color; // shallow water / basins
  low: THREE.Color; // lowlands
  mid: THREE.Color; // plains / hills
  high: THREE.Color; // mountains
  peak: THREE.Color; // snow / bright crests
  accent: THREE.Color; // vegetation, crystal tint, band accent...
  emissive: THREE.Color; // glow of lava, fissures, cities
  seaLevel: number; // in height units; < -1 means no ocean
  relief: number; // bump strength
  continentScale: number;
  iceCap: number; // latitude (0..1 of sin) where polar ice starts; > 1 = none
  vegetation: number; // 0..1
  specular: number; // 0..1 shininess of the land (metal, ice, crystal)
  roughness: number;
  metal: number;
  emission: number; // 0..1
  cityLights: number; // 0..1
  craters: number; // 0..1
  lifeGlow: number; // 0..1, glowing veins of silicon life
  bloom: number; // 0..1, plankton blooms in the oceans (microbial life)
  // Clouds
  clouds: number; // coverage 0..1
  cloudColor: THREE.Color;
  // Atmosphere: colour of the scattered light, thickness (fraction of the radius) and
  // density (0 = none)
  atmosphere: THREE.Color;
  atmosphereHeight: number;
  atmosphereDensity: number;
  // Gas giants
  bands: number;
  bandFrequency: number;
  storms: number;
  seed: THREE.Vector3;
}

const c = (hex: number) => new THREE.Color(hex);

function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
}

function seedNumber(data: any): number {
  const raw = String(data?.seeds?.planet_seed ?? data?.seeds?.shape_seed ?? data?.planet_info?.name ?? "atlas");
  let h = 2166136261;
  for (let i = 0; i < raw.length; i++) h = Math.imul(h ^ raw.charCodeAt(i), 16777619);
  return Math.abs(h) || 1;
}

// Mix towards the generator's colour, but only so far: a planet listed as pure #0000FF
// should read as blue, not as a flat primary
function tint(color: THREE.Color, base: THREE.Color, amount: number) {
  const hsl = { h: 0, s: 0, l: 0 };
  base.getHSL(hsl);
  const muted = new THREE.Color().setHSL(hsl.h, Math.min(hsl.s, 0.55), THREE.MathUtils.clamp(hsl.l, 0.25, 0.6));
  return color.clone().lerp(muted, amount);
}

// A little hue/brightness drift per planet, so two planets of a type differ in colour too
function drift(color: THREE.Color, rnd: () => number, hue = 0.03, light = 0.12) {
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  return new THREE.Color().setHSL((hsl.h + (rnd() - 0.5) * hue + 1) % 1, hsl.s, THREE.MathUtils.clamp(hsl.l * (1 + (rnd() - 0.5) * light), 0, 1));
}

const pick = <T>(rnd: () => number, items: T[]) => items[Math.floor(rnd() * items.length) % items.length];

const ATMOSPHERES: Record<string, { color: number; density: number }> = {
  Breathable: { color: 0x4f8dff, density: 1 },
  Thick: { color: 0xc8b89a, density: 1.8 },
  Thin: { color: 0x9fb8e0, density: 0.35 },
  "Carbon Dioxide": { color: 0xe0a070, density: 1.2 },
  Methane: { color: 0x5aa7d8, density: 1 },
  Nitrogen: { color: 0x5f8fff, density: 0.9 },
  "Oxygen-Rich": { color: 0x6fa0ff, density: 1.1 },
  "Sulfur Dioxide": { color: 0xe8d36a, density: 1.4 },
  Superheated: { color: 0xff7a40, density: 1.5 },
  Acidic: { color: 0xa8d060, density: 1.3 },
  Toxic: { color: 0xb070d0, density: 1.4 },
  Hydrogen: { color: 0xf0b8c8, density: 1 },
  Helium: { color: 0xf6ecc8, density: 0.9 },
  Ammonia: { color: 0xe6d890, density: 1.1 },
  Ionic: { color: 0x40c8ff, density: 1 },
  Plasma: { color: 0xff70c0, density: 1.2 },
  "Exotic Gases": { color: 0xc070ff, density: 1.2 },
  "Water Vapor": { color: 0x9cd0ff, density: 1.2 },
  Frozen: { color: 0xd8ecff, density: 0.6 },
};

export function planetLook(data: any): PlanetLook {
  const planet = data.original_planet_data ?? data.planet_info ?? {};
  const type: string = String(data.planet_info?.type ?? planet.planet_type ?? "Rocky").replace(/_/g, " ");
  const baseHex = data.planet_info?.base_color;
  const base = typeof baseHex === "string" ? new THREE.Color(baseHex) : new THREE.Color(0x808080);
  const seed = seedNumber(data);
  const rnd = seededRandom(seed);
  // The generator gives surface temperatures in degrees Celsius
  const temperature: number = Number(planet.surface_temperature ?? data.planet_info?.surface_temperature ?? 15);
  const life: string = String(planet.life_forms ?? data.life_forms?.type ?? "None");
  const atmosphereType: string = String(data.atmosphere?.type ?? planet.atmosphere ?? "None");
  const air = ATMOSPHERES[atmosphereType];

  const look: PlanetLook = {
    family: "barren",
    variant: Math.floor(rnd() * 4),
    style: 0,
    warp: 0.3 + rnd() * 0.9,
    featureScale: 0.7 + rnd() * 0.9,
    deep: c(0x05162e),
    shallow: c(0x0f4f6e),
    low: c(0x4f6b2e),
    mid: c(0x7a6a48),
    high: c(0x6b625a),
    peak: c(0xf2f4f6),
    accent: c(0x2f5a1e),
    emissive: c(0xffa040),
    seaLevel: -2,
    relief: 0.8 + rnd() * 0.6,
    continentScale: 0.8 + rnd() * 1.1,
    iceCap: 2,
    vegetation: 0,
    specular: 0.05,
    roughness: 0.85,
    metal: 0,
    emission: 0,
    cityLights: life === "Intelligent Life" ? 1 : 0,
    craters: 0,
    lifeGlow: life === "Silicon-Based Life" ? 1 : 0,
    bloom: life === "Bacteria" ? 1 : life === "Animal Life" || life === "Vegetation" ? 0.35 : life === "Vegetable Animals" ? 0.6 : 0,
    clouds: 0,
    cloudColor: c(0xffffff),
    atmosphere: air ? c(air.color) : c(0x88aaff),
    atmosphereHeight: 0.025,
    atmosphereDensity: air ? air.density : 0,
    bands: 0,
    bandFrequency: 10 + rnd() * 12,
    storms: 0,
    seed: new THREE.Vector3(rnd() * 100, rnd() * 100, rnd() * 100),
  };
  const jitter = (amount: number) => (rnd() - 0.5) * 2 * amount;

  // Polar ice from the temperature: none on hot worlds, wide caps on cold ones
  // (Earth, ~15 °C: caps from about 70° of latitude; a -40 °C world freezes to the tropics)
  const capFromTemperature = () => THREE.MathUtils.clamp(0.88 + (temperature - 15) / 160 + jitter(0.04), 0.3, 2);

  switch (type) {
    case "Oceanic":
    case "Aquifer":
      look.family = "terran";
      look.seaLevel = (type === "Oceanic" ? 0.22 : 0.12) + jitter(0.06);
      look.deep = tint(c(0x020f26), base, 0.08);
      look.shallow = type === "Aquifer" ? c(0x13808a) : tint(c(0x0b4a70), base, 0.12);
      look.vegetation = 0.7;
      look.clouds = 0.38;
      look.iceCap = capFromTemperature();
      break;
    case "Super Earth":
    case "Sub Earth":
    case "Forest":
      look.family = "terran";
      look.seaLevel = (type === "Forest" ? -0.02 : 0.03) + jitter(0.08);
      look.relief *= type === "Super Earth" ? 1.4 : 1;
      look.vegetation = type === "Forest" ? 1 : 0.75;
      look.accent = drift(tint(c(type === "Forest" ? 0x1f4a17 : 0x2f5a1e), base, 0.2), rnd);
      look.low = drift(tint(c(0x43642a), base, 0.15), rnd);
      look.clouds = 0.42;
      look.iceCap = capFromTemperature();
      break;
    case "Savannah":
      look.family = "terran";
      look.seaLevel = -0.16 + jitter(0.06);
      look.vegetation = 0.45;
      look.low = drift(tint(c(0xa08a4a), base, 0.25), rnd);
      look.mid = c(0x8a7244);
      look.accent = c(0x56602a);
      look.clouds = 0.28;
      look.iceCap = capFromTemperature();
      break;
    case "Swamp":
      look.family = "terran";
      look.seaLevel = 0.04 + jitter(0.04);
      look.deep = c(0x0d2018);
      look.shallow = c(0x2d4a2a);
      look.low = drift(c(0x3a4a22), rnd);
      look.accent = c(0x26381a);
      look.vegetation = 1;
      look.relief *= 0.5;
      look.clouds = 0.55;
      look.iceCap = 2;
      break;
    case "Tundra":
      look.family = "terran";
      look.seaLevel = -0.08 + jitter(0.06);
      look.low = c(0x6a6a52);
      look.mid = c(0x8a8676);
      look.accent = c(0x4d5a3e);
      look.vegetation = 0.3;
      look.iceCap = 0.45 + jitter(0.08);
      look.clouds = 0.45;
      break;
    case "Desert":
    case "Arid":
      look.family = "desert";
      // Sahara-like for deserts, Mars-like rust for arid worlds
      look.low = drift(tint(c(type === "Desert" ? 0xc0925a : 0xa8623c), base, 0.2), rnd);
      look.mid = tint(c(type === "Desert" ? 0xa0703f : 0x8a4a2e), base, 0.2);
      look.high = c(type === "Desert" ? 0x5e4430 : 0x4a2c20);
      look.peak = c(type === "Desert" ? 0xe0c494 : 0xd8b8a0);
      look.relief *= 1.1;
      look.craters = type === "Arid" ? 0.5 : 0.15;
      look.clouds = type === "Arid" ? 0.08 : 0.04;
      look.atmosphereHeight = 0.02;
      if (!air) {
        look.atmosphere = c(0xd8a070);
        look.atmosphereDensity = 0.45;
      }
      break;
    case "Rocky":
    case "Cave":
    case "Carbon":
      look.family = "barren";
      look.low = drift(tint(c(type === "Carbon" ? 0x141414 : 0x6e6a66), base, type === "Carbon" ? 0.1 : 0.25), rnd);
      look.mid = tint(c(type === "Carbon" ? 0x22201e : 0x86807a), base, 0.2);
      look.high = c(type === "Carbon" ? 0x2e2c2a : 0x9a948c);
      look.peak = c(type === "Carbon" ? 0x403c3a : 0xb8b2aa);
      look.craters = type === "Cave" ? 0.6 : 0.6 + rnd() * 0.4;
      look.relief *= type === "Cave" ? 1.6 : 1.2;
      look.specular = type === "Carbon" ? 0.35 : 0.04;
      look.roughness = type === "Carbon" ? 0.4 : 0.9;
      break;
    case "Metallic": {
      look.family = "metal";
      // Each world its own alloy, and the oxide that alloy grows: rust on steel and iron,
      // verdigris on copper, dull tarnish on gold, temper colours on titanium
      const alloy = pick(rnd, [
        [0x8c8f94, 0xb4b7bc, 0x5a5d62, 0x7a3418], // steel
        [0xa0643e, 0xc88a5c, 0x6a3c24, 0x2f8a74], // copper
        [0xb08c40, 0xd8b868, 0x6a5020, 0x5a4a2a], // gold
        [0x7a8088, 0x9aa4b0, 0x46505c, 0x4a3a8a], // titanium
        [0x707070, 0x9a9a9a, 0x3a3a3a, 0x8a3c16], // iron
      ]);
      look.low = tint(c(alloy[0]), base, 0.12);
      look.mid = c(alloy[1]);
      look.high = c(alloy[2]);
      look.accent = c(alloy[3]);
      look.specular = 1;
      look.roughness = 0.12 + rnd() * 0.2;
      look.metal = 1;
      look.craters = 0.4 + rnd() * 0.4;
      break;
    }
    case "Crystalline":
      look.family = "crystal";
      look.low = c(0x1a1626); // dark rock between the crystal fields
      look.mid = drift(tint(c(0x6ad8e8), base, 0.45), rnd, 0.25, 0.2);
      look.high = drift(tint(c(0x9a7ae8), base, 0.3), rnd, 0.25, 0.2);
      look.accent = c(pick(rnd, [0xff70d0, 0x70ffd8, 0xffd070, 0x80a0ff]));
      look.specular = 1;
      look.roughness = 0.06;
      look.craters = 0.15;
      break;
    case "Diamond": {
      look.family = "diamond";
      // Colourless, blue, yellow or pink diamond
      const gem = pick(rnd, [0xeaf2ff, 0xbfe0ff, 0xfff0c0, 0xffd4ea]);
      // Body colour of the stone; graphite for the unpressed carbon plains
      look.low = c(gem);
      look.mid = c(0xffffff);
      look.high = c(0x26282c);
      look.accent = c(0x9ad8ff);
      look.specular = 1;
      look.roughness = 0.03;
      break;
    }
    case "Icy":
      look.family = "ice";
      look.low = drift(c(0xc8dcec), rnd, 0.04);
      look.mid = c(0xe6f0f8);
      look.high = c(0xa8c4dc);
      look.accent = tint(c(pick(rnd, [0x6a9ac0, 0x9a6a50, 0x7a6a90])), base, 0.3);
      look.specular = 0.6;
      look.roughness = 0.3;
      look.craters = 0.3 + rnd() * 0.5;
      look.clouds = 0.15;
      break;
    case "Lava":
    case "Magma":
    case "Molten Core":
      look.family = "lava";
      look.style = type === "Magma" ? 1 : type === "Molten Core" ? 2 : 0;
      look.low = c(0x1a1412);
      look.mid = c(0x2a201c);
      look.high = c(0x3a302a);
      look.emissive = tint(c(type === "Molten Core" ? 0xffb040 : 0xff5a1a), base, 0.2);
      look.emission = (type === "Molten Core" ? 1 : type === "Magma" ? 0.85 : 0.7) * (0.85 + rnd() * 0.3);
      look.relief *= 1.2;
      if (!air) {
        look.atmosphere = c(0xff6a30);
        look.atmosphereDensity = 0.6;
      }
      break;
    case "Gas Giant":
    case "Frozen Gas Giant":
    case "Nebulous": {
      look.family = "gas";
      const frozen = type === "Frozen Gas Giant";
      const nebulous = type === "Nebulous";
      look.style = frozen ? 1 : nebulous ? 2 : 0;
      // Ice giants (Uranus, Neptune): deep azure under a methane haze
      look.low = drift(tint(c(frozen ? 0x5aa6d0 : nebulous ? 0xd8a0d0 : 0xd8b088), base, frozen ? 0.2 : 0.35), rnd, 0.05);
      look.mid = drift(tint(c(frozen ? 0x2f6fb0 : nebulous ? 0xa070c8 : 0xb07a50), base, frozen ? 0.15 : 0.3), rnd, 0.05);
      look.high = c(frozen ? 0xe8f6ff : nebulous ? 0xf0d0f0 : 0xf0e0c8);
      look.accent = c(frozen ? 0x123a78 : nebulous ? 0x7050c0 : 0x8a4a30);
      look.bands = (frozen ? 0.6 : nebulous ? 0.6 : 1) * (0.7 + rnd() * 0.6);
      look.storms = (frozen ? 0.7 : 1) * (0.4 + rnd() * 0.9);
      look.emission = nebulous ? 0.25 : 0;
      look.emissive = c(0xc080ff);
      look.atmosphere = frozen ? c(0x8ad0f0) : nebulous ? c(0xd090f0) : c(0xe8c8a0);
      // Ice giants are seen deeper into: a thinner veil over their blue
      look.atmosphereDensity = frozen ? 0.55 : 1.2;
      look.atmosphereHeight = 0.03;
      break;
    }
    case "Toxic":
      look.family = "veiled";
      look.low = drift(tint(c(0xa8b050), base, 0.25), rnd);
      look.mid = tint(c(0x7a8a30), base, 0.25);
      look.high = c(0xd0d088);
      look.bandFrequency = 5 + rnd() * 6;
      look.atmosphere = air ? look.atmosphere : c(0xb8c060);
      look.atmosphereDensity = Math.max(look.atmosphereDensity, 1.6);
      look.atmosphereHeight = 0.04;
      break;
    case "Radioactive":
      look.family = "radioactive";
      look.low = drift(c(0x26261e), rnd);
      look.mid = c(0x3a3a2c);
      look.high = c(0x4a4a3a);
      look.emissive = c(pick(rnd, [0x7dff4a, 0x4affa0, 0xc8ff40]));
      look.emission = 1;
      look.craters = 0.7;
      // Ionised air glows green, whatever it is made of
      look.atmosphere = (air ? c(air.color) : c(0x8aff70)).lerp(c(0x8aff70), 0.65);
      look.atmosphereDensity = Math.max(air ? air.density : 0, 0.5);
      break;
    case "Exotic":
      look.family = "exotic";
      look.low = drift(tint(c(0x281848), base, 0.4), rnd, 0.3);
      look.mid = drift(tint(c(0x5a3a9a), base, 0.4), rnd, 0.3);
      look.high = c(0xe0d0ff);
      look.accent = c(pick(rnd, [0xff40c0, 0x40ffe0, 0xffd040, 0x8060ff]));
      look.emissive = look.accent.clone();
      look.emission = 0.7;
      look.specular = 0.8;
      look.roughness = 0.15;
      if (!air) {
        look.atmosphere = c(0xc070ff);
        look.atmosphereDensity = 0.8;
      }
      break;
    case "Anomaly":
      look.family = "anomaly";
      look.low = c(0x020206);
      look.mid = c(0x0a0814);
      look.high = c(0x1a1430);
      look.accent = c(pick(rnd, [0x8a5cff, 0x40c0ff, 0xff5c8a]));
      look.emissive = look.accent.clone();
      look.emission = 1;
      look.atmosphereDensity = 0;
      break;
  }

  // Life makes it greener; nothing grows on frozen or boiling worlds
  if (look.family === "terran" && (temperature < -60 || temperature > 85)) look.vegetation *= 0.2;
  if (look.family !== "terran" && look.family !== "desert") look.cityLights *= look.family === "barren" || look.family === "ice" ? 0.6 : 0;
  look.clouds = THREE.MathUtils.clamp(look.clouds * (0.7 + rnd() * 0.6) * (look.atmosphereDensity > 0 ? 1 : 0), 0, 0.85);
  return look;
}
