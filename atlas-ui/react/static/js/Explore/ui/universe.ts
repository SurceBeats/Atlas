// atlas-ui/react/static/js/Explore/ui/universe.ts
//
// Which universe this page explores (ours, or a remote one from the multiverse), and
// Stargate links into it.

import type { Coordinates } from "../api.ts";

export interface UniverseConfig {
  remote: boolean;
  seed_name: string;
  node_id: string;
  seed_str: string;
  cosmic_origin_time: number;
}

export function readUniverseConfig(): UniverseConfig | null {
  try {
    const element = document.getElementById("data-universe-config");
    return element ? (JSON.parse(element.textContent || "null") as UniverseConfig) : null;
  } catch {
    return null;
  }
}

// Same format the server decodes (pymodules/__atlas_stargate.py): url-safe base64 of
// "coordinates=x,y,z[&system=i[&planet=name]]"
export function stargatePath(coordinates: Coordinates, system: number | null = null, planetName: string | null = null): string {
  let data = `coordinates=${coordinates.join(",")}`;
  if (system !== null) {
    data += `&system=${system}`;
    if (planetName) data += `&planet=${planetName}`;
  }
  return `/stargate/${btoa(data).replace(/\+/g, "-").replace(/\//g, "_")}`;
}
