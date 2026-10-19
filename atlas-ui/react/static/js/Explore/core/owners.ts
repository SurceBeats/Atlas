// atlas-ui/react/static/js/Explore/core/owners.ts
//
// Who owns what, read-only: places of the Core Continuum are claimed in the Apple app,
// and the owners registry (a Cloudflare worker, the app's worker/) says whose they are.
// A planet may have one owner in the world, and so may a whole star system; the owner's
// name for it replaces the generated one everywhere, for everybody: labels, console,
// map, Stargate panel, photos. The registry is read per galaxy (all its owned places at
// once, so the map can name them) and again per system on arrival.
//
// Everything in it was written by somebody: it is only ever shown as text, never as
// markup. When the registry cannot be reached, the generated names stay.

import type { UniverseConfig } from "../ui/universe.ts";
import type { Coordinates, PlanetDetail } from "../api.ts";
import { date, t } from "../../i18n/i18n.ts";

const REGISTRY = "https://atlas.banshee-devs.workers.dev";

// Only the Core Continuum is for sale: the shared universe, its seed and its Bit Bang
const CORE_CONTINUUM = { seed: "1.618033988749895", origin: 514080000 };

export function isCoreContinuum(universe: UniverseConfig | null): boolean {
  return !!universe && !universe.remote && String(universe.seed_str) === CORE_CONTINUUM.seed && Number(universe.cosmic_origin_time) === CORE_CONTINUUM.origin;
}

// A place somebody owns, as the registry tells it
export interface Ownership {
  key: string; // "x,y,z:system:planet", or "x,y,z:system:*" for a whole system
  kind: "planet" | "system";
  galaxy: Coordinates;
  system: number;
  planet: number | null; // the planet's index in its system
  owner: string | null;
  name: string | null; // null when the owner kept the generated one, or it was hidden
  note: string | null;
  seal: string | null;
  since: number; // seconds since 1970
  parent: string | null; // a planet of a whole system its owner bought (and named): the system's key
}

// "Property of Nova since 16/10/2026" (the date as the browser's region writes dates)
export function propertyLine(place: Ownership): string {
  return t("Property of %@ since %@", place.owner ?? t("someone"), date(place.since * 1000));
}

const keyOf = (system: number, planet: number | null) => `${system}:${planet ?? "*"}`;

// The owned places of one galaxy, by system and planet
export class OwnerBook {
  private places = new Map<string, Ownership>();

  constructor(readonly galaxy: Coordinates | null = null, places: Ownership[] = []) {
    for (const place of places) this.places.set(keyOf(place.system, place.planet), place);
  }

  get isEmpty() {
    return this.places.size === 0;
  }

  // The system's own owner (a whole system bought)
  system(index: number): Ownership | null {
    return this.places.get(keyOf(index, null)) ?? null;
  }

  // Only a planet bought on its own (or named on its own inside a bought system)
  ownPlanet(planet: number, system: number): Ownership | null {
    return this.places.get(keyOf(system, planet)) ?? null;
  }

  // A planet's owner: the planet itself, or its whole system
  planet(planet: number, system: number): Ownership | null {
    return this.ownPlanet(planet, system) ?? this.system(system);
  }

  placesIn(system: number): Ownership[] {
    return [...this.places.values()].filter((p) => p.system === system);
  }

  // What the registry says now about one system replaces what was known of it
  replacing(system: number, fresh: Ownership[]): OwnerBook {
    const kept = [...this.places.values()].filter((p) => p.system !== system);
    return new OwnerBook(this.galaxy, [...kept, ...fresh.filter((p) => p.system === system)]);
  }

  // ---- the names, as everybody sees them ---------------------------------------------

  // A star system: its owner's name for it, or the generated one
  systemName(index: number, generated: string): string {
    return this.system(index)?.name ?? pretty(generated);
  }

  // A planet: the name its own owner gave it, or the generated one. (A whole system's
  // owner names the system; its planets keep their names until named one by one)
  planetName(planet: Pick<PlanetDetail, "index" | "name">, system: number | null): string {
    return (system !== null ? this.ownPlanet(planet.index, system)?.name : null) ?? pretty(planet.name);
  }
}

export const NO_OWNERS = new OwnerBook();

const pretty = (name: string) => name.replace(/_/g, " ");

// One answer of the registry, checked field by field: anything else is dropped
function parse(raw: any): Ownership | null {
  if (!raw || typeof raw !== "object" || typeof raw.key !== "string" || !Number.isInteger(raw.system)) return null;
  const text = (v: unknown) => (typeof v === "string" && v.trim() ? v : null);
  return {
    key: raw.key,
    kind: raw.kind === "system" ? "system" : "planet",
    galaxy: Array.isArray(raw.galaxy) && raw.galaxy.length === 3 ? (raw.galaxy.map(Number) as Coordinates) : [0, 0, 0],
    system: raw.system,
    planet: Number.isInteger(raw.planet) ? raw.planet : null,
    owner: text(raw.owner),
    name: text(raw.name),
    note: text(raw.note),
    seal: text(raw.seal),
    since: Number.isFinite(raw.since) ? raw.since : 0,
    parent: text(raw.parent),
  };
}

// Who owns what in a galaxy, or in one of its systems. The query is written exactly as
// the worker purges its edge cache. Null when the registry did not answer
export async function fetchOwners(galaxy: Coordinates, system: number | null = null): Promise<Ownership[] | null> {
  let query = `galaxy=${galaxy.join(",")}`;
  if (system !== null) query += `&system=${system}`;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${REGISTRY}/v1/owners?${query}`, { signal: controller.signal, credentials: "omit" });
    clearTimeout(timer);
    if (!response.ok) return null;
    const body = await response.json();
    return Array.isArray(body?.places) ? body.places.map(parse).filter((p: Ownership | null): p is Ownership => !!p) : null;
  } catch {
    return null;
  }
}
