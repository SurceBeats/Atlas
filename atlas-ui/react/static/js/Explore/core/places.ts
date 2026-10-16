// atlas-ui/react/static/js/Explore/core/places.ts
//
// Saved places: spots of the universe the pilot wants to come back to (a galaxy, a star
// system or a planet), each with its Stargate link. Kept in the same storage the
// original Atlas used for its bookmarks (key _atlasLocations, encoded by Utils/b64), so
// places saved before the 3D explorer are still here.

import { ATLAS_KEYS, getItem, setItem } from "../../Utils/b64.tsx";
import type { Coordinates } from "../api.ts";
import { stargatePath } from "../ui/universe.ts";

export type PlaceKind = "galaxy" | "system" | "planet";

export interface SavedPlace {
  id: string;
  name: string;
  type: PlaceKind;
  timestamp: number;
  stargateUrl: string;
  // Where it points (older entries only have the Stargate link: decoded on load)
  coordinates?: Coordinates;
  system?: number | null;
  planet?: number | null;
  planetName?: string | null;
  // Context shown under the name
  galaxyName?: string | null;
  systemName?: string | null;
}

export interface PlaceTarget {
  coordinates: Coordinates;
  system: number | null;
  planet: number | null;
  planetName: string | null;
}

const MAX_PLACES = 200;
export const PLACES_EVENT = "atlas-places-changed";

// "coordinates=x,y,z[&system=i[&planet=name]][&page=n]" out of a Stargate link
export function decodeStargate(url: string): PlaceTarget | null {
  const match = url.match(/\/stargate\/([A-Za-z0-9\-_=]+)/);
  if (!match) return null;
  try {
    const params = new URLSearchParams(atob(match[1].replace(/-/g, "+").replace(/_/g, "/")));
    const coordinates = (params.get("coordinates") ?? "").split(",").map((v) => parseInt(v, 10));
    if (coordinates.length !== 3 || coordinates.some((v) => !Number.isFinite(v))) return null;
    const system = params.get("system");
    return { coordinates: coordinates as Coordinates, system: system !== null ? parseInt(system, 10) : null, planet: null, planetName: params.get("planet") };
  } catch {
    return null;
  }
}

// Where a saved place points, whatever its age
export function placeTarget(place: SavedPlace): PlaceTarget | null {
  if (place.coordinates) return { coordinates: place.coordinates, system: place.system ?? null, planet: place.planet ?? null, planetName: place.planetName ?? null };
  return decodeStargate(place.stargateUrl);
}

const sameTarget = (a: PlaceTarget | null, b: PlaceTarget | null) =>
  !!a && !!b && a.coordinates.join(",") === b.coordinates.join(",") && a.system === b.system && (a.planet !== null && b.planet !== null ? a.planet === b.planet : (a.planetName ?? "").toLowerCase() === (b.planetName ?? "").toLowerCase());

export function loadPlaces(): SavedPlace[] {
  try {
    const list = JSON.parse(getItem(ATLAS_KEYS.LOCATIONS) ?? "[]");
    return Array.isArray(list) ? list.filter((p) => p && typeof p.name === "string" && typeof p.stargateUrl === "string").sort((a, b) => b.timestamp - a.timestamp) : [];
  } catch {
    return [];
  }
}

function store(list: SavedPlace[]) {
  try {
    setItem(ATLAS_KEYS.LOCATIONS, JSON.stringify(list.slice(0, MAX_PLACES)));
  } catch {
    /* storage full or blocked: kept for this session only */
  }
  window.dispatchEvent(new CustomEvent(PLACES_EVENT));
}

export function findPlace(target: PlaceTarget): SavedPlace | null {
  return loadPlaces().find((p) => sameTarget(placeTarget(p), target)) ?? null;
}

// Saves (or refreshes) a place; the same destination is never kept twice
export function savePlace(target: PlaceTarget, details: { name: string; type: PlaceKind; galaxyName?: string | null; systemName?: string | null }): SavedPlace {
  const place: SavedPlace = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
    stargateUrl: stargatePath(target.coordinates, target.system, target.planetName),
    ...target,
    ...details,
  };
  const rest = loadPlaces().filter((p) => !sameTarget(placeTarget(p), target));
  store([place, ...rest]);
  return place;
}

export function renamePlace(id: string, name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;
  store(loadPlaces().map((p) => (p.id === id ? { ...p, name: trimmed } : p)));
}

export function removePlace(id: string) {
  store(loadPlaces().filter((p) => p.id !== id));
}
