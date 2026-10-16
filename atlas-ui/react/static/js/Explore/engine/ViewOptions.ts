// atlas-ui/react/static/js/Explore/engine/ViewOptions.ts
//
// What the cockpit shows, independent of the graphics quality: the ship seen from the
// chase camera, the universe grid around the galaxy map and the flight HUD; and whether
// the ship makes its sounds; and which ship it is. Stored per browser in localStorage.

import { SHIP_KINDS, type ShipKind } from "./ShipView.ts";

export interface ViewOptions {
  shipView: boolean; // the saucer in front of the camera
  universeGrid: boolean; // the cube cells of the universe around the current galaxy
  flightHud: boolean; // speed / light speed / distance left while travelling
  soundEffects: boolean; // the ship's sounds (flights, jumps, selections)
  ship: ShipKind; // the craft in front of the chase camera
}

// The options shown as on/off switches
export type ViewToggle = Exclude<keyof ViewOptions, "ship">;

const STORAGE_KEY = "atlas-view-options";

export const DEFAULT_VIEW_OPTIONS: ViewOptions = { shipView: true, universeGrid: true, flightHud: true, soundEffects: true, ship: "saucer" };

// Bumped when a default changes. Saving any option stores them all, so an older copy
// holds the old default of options nobody chose: those fall back to the new one
const REVISION = 2;
const RESET_BY_REVISION: Record<number, ViewToggle[]> = { 2: ["universeGrid"] };

export function loadViewOptions(): ViewOptions {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (stored && typeof stored === "object") {
      const options = { ...DEFAULT_VIEW_OPTIONS };
      const revision = typeof stored.revision === "number" ? stored.revision : 1;
      const reset = new Set(Object.entries(RESET_BY_REVISION).flatMap(([at, keys]) => (revision < Number(at) ? keys : [])));
      for (const key of Object.keys(DEFAULT_VIEW_OPTIONS) as ViewToggle[]) {
        if (key !== ("ship" as string) && !reset.has(key) && typeof stored[key] === "boolean") options[key] = stored[key];
      }
      if (SHIP_KINDS.includes(stored.ship)) options.ship = stored.ship;
      return options;
    }
  } catch {
    // Private mode or blocked storage: defaults
  }
  return { ...DEFAULT_VIEW_OPTIONS };
}

export function saveViewOptions(options: ViewOptions) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...options, revision: REVISION }));
  } catch {
    // Not persisted, still applied for this session
  }
}
