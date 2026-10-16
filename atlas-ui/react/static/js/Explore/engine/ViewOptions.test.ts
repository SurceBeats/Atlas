// atlas-ui/react/static/js/Explore/engine/ViewOptions.test.ts
//
// The universe grid is on by default, also for those whose options were saved while it
// was off by default; turning it off from now on sticks.

import { test } from "node:test";
import assert from "node:assert/strict";

const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (key: string) => store.get(key) ?? null,
  setItem: (key: string, value: string) => void store.set(key, value),
  removeItem: (key: string) => void store.delete(key),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
};

const { loadViewOptions, saveViewOptions } = await import("./ViewOptions.ts");

test("the grid is on with nothing saved", () => {
  store.clear();
  assert.equal(loadViewOptions().universeGrid, true);
});

test("options saved before the change show the grid, and keep the rest", () => {
  store.set("atlas-view-options", JSON.stringify({ shipView: false, universeGrid: false, flightHud: false, soundEffects: false, ship: "interceptor" }));
  const options = loadViewOptions();
  assert.equal(options.universeGrid, true);
  assert.deepEqual({ ...options, universeGrid: undefined }, { shipView: false, universeGrid: undefined, flightHud: false, soundEffects: false, ship: "interceptor" });
});

test("turning the grid off now is remembered", () => {
  store.clear();
  saveViewOptions({ ...loadViewOptions(), universeGrid: false });
  assert.equal(loadViewOptions().universeGrid, false);
});
