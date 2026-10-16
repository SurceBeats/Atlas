// atlas-ui/react/static/js/Explore/core/comfort.ts
//
// Reduced flashing, for photosensitive pilots. The choice is the one the previous Atlas
// already stored (Utils/PhotosensitivityManager, key atlas_photosensitivity_mode), so
// it carries over; until someone has chosen, the explorer asks once.
//
// With it on: no white flashes or shock rings in jumps and crossings, gentler hyperspace,
// and a dimmer, slower inflation in the birth of a universe.

import { PhotosensitivityManager } from "../../Utils/PhotosensitivityManager.tsx";

const KEY = "atlas_photosensitivity_mode";
export const COMFORT_EVENT = "photosensitivityChange";

export function reducedFlashing(): boolean {
  return PhotosensitivityManager.isEnabled();
}

// Has the pilot ever been asked?
export function comfortChosen(): boolean {
  try {
    return localStorage.getItem(KEY) !== null;
  } catch {
    // Storage blocked: do not nag on every visit
    return true;
  }
}

export function setReducedFlashing(enabled: boolean) {
  if (enabled) PhotosensitivityManager.enable();
  else PhotosensitivityManager.disable();
}
