// atlas-ui/react/static/js/Explore/api.ts
//
// Client for the stateless /api/v2 endpoints (pymodules/__universe_routes_explore.py).

import type { GalaxyInfo } from "./galaxy/GalaxyModel.ts";

export type Coordinates = [number, number, number];

export interface StarInfo {
  Type: string;
  Color: string;
  Size: number;
}

export interface SystemSummary {
  index: number;
  name: string;
  star_system_type: string;
  num_planets: number;
  stars: StarInfo[];
}

export interface PlanetDetail {
  index: number;
  name: string;
  planet_type: string;
  diameter: number;
  mass: number;
  density: number;
  gravity: number;
  orbital_radius: number;
  orbital_period_seconds: number;
  orbital_speed: number;
  axial_tilt: number;
  rotation_period_seconds: number;
  surface_temperature: number;
  // The type's temperature at the mean distance, and the atmosphere's factor on it: with
  // them its temperature anywhere along its orbit (planetTemperatureAt)
  mean_temperature?: number;
  atmosphere_factor?: number;
  atmosphere: string;
  life_forms: string;
  elements: string[];
  eccentricity_factor: number;
  initial_orbital_angle: number;
  current_orbital_angle: number;
  relative_orbital_radius: number;
  stargate_url: string;
}

// A planet's temperature (°C) at `elapsed` seconds since the cosmic origin, as the generator
// works it out (Planet.temperature_at, same operations in the same order): radiative
// equilibrium scales the mean temperature, in kelvin, by sqrt(a/d) at the distance d of
// that moment; the atmosphere multiplies it above 0 °C and divides it below; nothing is
// colder than the cosmic background. The loaded surface_temperature without the new fields
export function planetTemperatureAt(p: PlanetDetail, elapsed: number): number {
  if (p.mean_temperature === undefined || p.atmosphere_factor === undefined) return p.surface_temperature;
  const angleVelocity = (2 * Math.PI) / p.orbital_period_seconds;
  const angle = (p.initial_orbital_angle + elapsed * angleVelocity) % (2 * Math.PI);
  const a = p.orbital_radius;
  const e = p.eccentricity_factor;
  let d = (a * (1 - e ** 2)) / (1 + e * Math.cos(angle));
  if (d < 0.1) d = 0.1;
  let kelvin = p.mean_temperature + 273.15;
  kelvin *= (a / d) ** 0.5;
  let celsius = kelvin - 273.15;
  const f = p.atmosphere_factor;
  celsius = celsius >= 0 ? celsius * f : celsius / f;
  return Math.max(celsius, -270.45);
}

export interface SystemDetail extends SystemSummary {
  planets: PlanetDetail[];
  max_orbital_radius: number;
  stargate_url: string;
}

export interface Timing {
  cosmic_origin_time: number;
  current_time: number;
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { credentials: "same-origin", ...init });
  const data = await response.json();
  if (!response.ok || data.success === false) throw new Error(data.error || `Request failed: ${response.status}`);
  return data as T;
}

const galaxyPath = (c: Coordinates) => `/api/v2/galaxy/${c[0]}/${c[1]}/${c[2]}`;

export async function fetchGalaxy(coordinates: Coordinates): Promise<{ galaxy: GalaxyInfo; timing: Timing }> {
  return getJson(galaxyPath(coordinates));
}

export async function fetchSystem(coordinates: Coordinates, index: number): Promise<{ system: SystemDetail; timing: Timing }> {
  return getJson(`${galaxyPath(coordinates)}/system/${index}`);
}

export function planetRenderingUrl(coordinates: Coordinates, systemIndex: number, planetIndex: number) {
  return `${galaxyPath(coordinates)}/system/${systemIndex}/planet/${planetIndex}/rendering-data`;
}

export async function fetchNeighbourGalaxies(coordinates: Coordinates[]): Promise<Array<{ coordinates: Coordinates; name: string; galaxy_type: string; num_systems: number }>> {
  const data = await getJson<{ galaxies: any[] }>("/api/v2/galaxies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ coordinates }),
  });
  return data.galaxies;
}

export async function fetchCurrentLocation(): Promise<{ coordinates: Coordinates; system: number | null } | null> {
  try {
    const response = await fetch("/api/current-location", { credentials: "same-origin" });
    const data = await response.json();
    if (!data.galaxy_coordinates) return null;
    return { coordinates: data.galaxy_coordinates, system: data.system_index ?? null };
  } catch {
    return null;
  }
}

export interface RandomLocation {
  coordinates: Coordinates;
  system: number | null;
  planet: number | null;
  galaxyName: string;
  systemName: string | null;
  planetName: string | null;
}

export async function fetchRandomLocation(): Promise<RandomLocation> {
  const data = await getJson<any>("/api/generate-random-location");
  const c = data.coordinates;
  return {
    coordinates: [c.x, c.y, c.z],
    system: data.system_index ?? null,
    planet: data.planet_index ?? null,
    galaxyName: data.galaxy_name,
    systemName: data.system_name ?? null,
    planetName: data.planet_name ?? null,
  };
}

// Batches summary lookups: callers ask for single systems, the network sees one POST
// per animation burst. Results are cached for the lifetime of the page.
export class SystemDirectory {
  private coordinates: Coordinates;
  private cache = new Map<number, SystemSummary>();
  private waiting = new Map<number, Array<(s: SystemSummary | null) => void>>();
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(coordinates: Coordinates) {
    this.coordinates = coordinates;
  }

  peek(index: number): SystemSummary | undefined {
    return this.cache.get(index);
  }

  get(index: number): Promise<SystemSummary | null> {
    const cached = this.cache.get(index);
    if (cached) return Promise.resolve(cached);
    return new Promise((resolve) => {
      const list = this.waiting.get(index);
      if (list) list.push(resolve);
      else this.waiting.set(index, [resolve]);
      if (!this.timer) this.timer = setTimeout(() => this.flush(), 60);
    });
  }

  private async flush() {
    this.timer = null;
    const batch = Array.from(this.waiting.entries()).slice(0, 256);
    for (const [index] of batch) this.waiting.delete(index);
    if (this.waiting.size > 0) this.timer = setTimeout(() => this.flush(), 60);

    try {
      const data = await getJson<{ systems: SystemSummary[] }>(`${galaxyPath(this.coordinates)}/systems`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ indices: batch.map(([index]) => index) }),
      });
      const byIndex = new Map(data.systems.map((s) => [s.index, s]));
      for (const [index, resolvers] of batch) {
        const summary = byIndex.get(index) ?? null;
        if (summary) this.cache.set(index, summary);
        resolvers.forEach((r) => r(summary));
      }
    } catch {
      for (const [, resolvers] of batch) resolvers.forEach((r) => r(null));
    }
  }
}
