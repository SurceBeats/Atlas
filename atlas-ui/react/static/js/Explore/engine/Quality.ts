// atlas-ui/react/static/js/Explore/engine/Quality.ts
//
// Graphics presets. Everything expensive in the explorer reads its budget from here:
// resolution, frame rate (and the lower rate used while nothing moves), how many
// octree regions and real stars the galaxy LOD may produce, shadows and labels.
// Auto (the default) picks a level from what the browser says about the device, afresh
// on every visit; a level chosen by hand is stored per browser in localStorage, until
// Auto is chosen again.

export type QualityLevel = "low" | "medium" | "high" | "ultra";

export interface QualityProfile {
  level: QualityLevel;
  label: string;
  description: string;
  pixelRatioCap: number; // max device pixel ratio used for the canvas
  deepSkyScale: number; // resolution of the galaxy (HDR) pass relative to the canvas
  antialias: boolean; // needs a reload to change
  shadows: boolean; // needs a reload to change
  maxNodes: number; // unresolved regions (glow) per LOD
  maxStars: number; // real systems drawn as points per LOD
  splitAngle: number; // radians a region may cover before it is subdivided
  fps: number; // frame cap while moving (0 = display rate)
  idleFps: number; // frame cap when the camera has been still for a while
  starLabels: number; // named stars labelled around the camera
  galaxyReach: number; // cells of the universe grid loaded around the camera, per axis and side
  planetDetail: number; // most noise octaves of the realistic planet surfaces
}

export const QUALITY_PROFILES: Record<QualityLevel, QualityProfile> = {
  low: {
    level: "low",
    label: "Low",
    description: "Integrated GPUs, laptops on battery, phones",
    pixelRatioCap: 1,
    deepSkyScale: 0.6,
    antialias: false,
    shadows: false,
    maxNodes: 9000,
    maxStars: 12000,
    splitAngle: 0.032,
    fps: 30,
    idleFps: 12,
    starLabels: 4,
    galaxyReach: 1,
    planetDetail: 6,
  },
  medium: {
    level: "medium",
    label: "Medium",
    description: "Balanced default",
    pixelRatioCap: 1.25,
    deepSkyScale: 1,
    antialias: true,
    shadows: true,
    maxNodes: 20000,
    maxStars: 26000,
    splitAngle: 0.024,
    fps: 60,
    idleFps: 24,
    starLabels: 8,
    galaxyReach: 2,
    planetDetail: 7.5,
  },
  high: {
    level: "high",
    label: "High",
    description: "Dedicated GPU",
    pixelRatioCap: 2,
    deepSkyScale: 1,
    antialias: true,
    shadows: true,
    maxNodes: 36000,
    maxStars: 45000,
    splitAngle: 0.018,
    fps: 60,
    idleFps: 30,
    starLabels: 10,
    galaxyReach: 3,
    planetDetail: 8.5,
  },
  ultra: {
    level: "ultra",
    label: "Ultra",
    description: "Everything, as smooth as the display allows",
    pixelRatioCap: 2,
    deepSkyScale: 1,
    antialias: true,
    shadows: true,
    maxNodes: 60000,
    maxStars: 75000,
    splitAngle: 0.014,
    fps: 0,
    idleFps: 60,
    starLabels: 12,
    galaxyReach: 3,
    planetDetail: 9,
  },
};

const STORAGE_KEY = "atlas-quality";

// Auto: a conservative guess from what the browser tells us about the device
export function detectLevel(): QualityLevel {
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as any).deviceMemory || 4;
  const touch = typeof window !== "undefined" && "ontouchstart" in window && window.innerWidth < 900;
  if (touch || cores <= 4 || memory <= 2) return "low";
  if (cores >= 10 && memory >= 8) return "high";
  return "medium";
}

// The level chosen by hand, or null for Auto
export function chosenQuality(): QualityLevel | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as QualityLevel | null;
    if (stored && QUALITY_PROFILES[stored]) return stored;
  } catch {
    /* storage unavailable */
  }
  return null;
}

export function loadQuality(): QualityProfile {
  return QUALITY_PROFILES[chosenQuality() ?? detectLevel()];
}

// A level fixes it; null goes back to Auto
export function saveQuality(level: QualityLevel | null) {
  try {
    if (level) localStorage.setItem(STORAGE_KEY, level);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable */
  }
}

// Whether switching between two profiles needs a fresh WebGL context
export function needsReload(a: QualityProfile, b: QualityProfile) {
  return a.antialias !== b.antialias || a.shadows !== b.shadows;
}
