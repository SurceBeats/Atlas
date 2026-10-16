// atlas-ui/react/static/js/Explore/planet/planetColors.ts

import * as THREE from "three";

export interface PlanetColorConfig {
  baseColor: THREE.Color;
  secondaryColor?: THREE.Color;
  accentColor?: THREE.Color;
  emissiveColor?: THREE.Color;
}

export function hexToThreeColor(hexColor: string): THREE.Color {
  const hex = hexColor.replace("#", "");

  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  return new THREE.Color(r, g, b);
}

export function rgbArrayToThreeColor(rgbArray: number[]): THREE.Color {
  if (rgbArray.length >= 3) {
    return new THREE.Color(rgbArray[0], rgbArray[1], rgbArray[2]);
  }

  return new THREE.Color(0.5, 0.5, 0.5);
}

export function getPlanetBaseColor(pythonData: any): THREE.Color {
  if (pythonData.ocean_color) {
    if (typeof pythonData.ocean_color === "string") {
      return hexToThreeColor(pythonData.ocean_color);
    } else if (Array.isArray(pythonData.ocean_color)) {
      return rgbArrayToThreeColor(pythonData.ocean_color);
    }
  }

  if (pythonData.planet_info?.base_color) {
    if (typeof pythonData.planet_info.base_color === "string") {
      return hexToThreeColor(pythonData.planet_info.base_color);
    } else if (Array.isArray(pythonData.planet_info.base_color)) {
      return rgbArrayToThreeColor(pythonData.planet_info.base_color);
    }
  }

  if (pythonData.base_color) {
    if (typeof pythonData.base_color === "string") {
      return hexToThreeColor(pythonData.base_color);
    } else if (Array.isArray(pythonData.base_color)) {
      return rgbArrayToThreeColor(pythonData.base_color);
    }
  }

  const planetType = pythonData.planet_info?.type || pythonData.type || "Unknown";
  const fallbackColor = getFallbackColorForPlanetType(planetType);

  return fallbackColor;
}

export function getFallbackColorForPlanetType(planetType: string): THREE.Color {
  const fallbackColors: Record<string, string> = {
    "Gas Giant": "#FFA500",
    Anomaly: "#FFFFFF",
    Rocky: "#808080",
    Icy: "#ADD8E6",
    Oceanic: "#0000FF",
    Desert: "#FFD700",
    Lava: "#FF0000",
    Arid: "#800000",
    Swamp: "#008000",
    Tundra: "#F0F8FF",
    Forest: "#006400",
    Savannah: "#F4A460",
    Cave: "#D1D1D1",
    Crystalline: "#00FFFF",
    Metallic: "#C0C0C0",
    Toxic: "#800080",
    Radioactive: "#00FF00",
    Magma: "#FF4500",
    "Molten Core": "#FF8C00",
    Carbon: "#090909",
    Diamond: "#87CEFA",
    "Super Earth": "#90EE90",
    "Sub Earth": "#006400",
    "Frozen Gas Giant": "#ADD8E6",
    Nebulous: "#FFC0CB",
    Aquifer: "#00FFFF",
    Exotic: "#FF00FF",
  };

  const hexColor = fallbackColors[planetType] || "#FFFFFF";
  return hexToThreeColor(hexColor);
}

export function generateSecondaryColors(baseColor: THREE.Color, seed: number = 12345): PlanetColorConfig {
  let s = seed;
  const random = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };

  const config: PlanetColorConfig = { baseColor: baseColor.clone() };

  const hsl = { h: 0, s: 0, l: 0 };
  baseColor.getHSL(hsl);

  config.secondaryColor = new THREE.Color().setHSL(hsl.h, Math.max(0, Math.min(1, hsl.s + (random() - 0.5) * 0.2)), Math.max(0, Math.min(1, hsl.l + (random() - 0.5) * 0.3)));

  config.accentColor = new THREE.Color().setHSL((hsl.h + (random() - 0.5) * 0.1) % 1, Math.max(0, Math.min(1, hsl.s * (0.8 + random() * 0.4))), Math.max(0, Math.min(1, hsl.l * (0.6 + random() * 0.8))));

  config.emissiveColor = new THREE.Color().setHSL(hsl.h, hsl.s * 0.8, Math.min(1, hsl.l * 1.5));

  return config;
}

export function getLegacyOceanColor(): THREE.Color {
  return new THREE.Color(0.1, 0.3, 0.6);
}
