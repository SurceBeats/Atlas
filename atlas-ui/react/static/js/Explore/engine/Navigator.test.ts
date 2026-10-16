// atlas-ui/react/static/js/Explore/engine/Navigator.test.ts
//
// Flying by hand: thrust builds up over about five seconds, and the ship coasts to a
// stop once the keys are let go.

import { test } from "node:test";
import assert from "node:assert/strict";
import { Navigator } from "./Navigator.ts";

// Holds keys down without a DOM (the navigator reads them from its key set)
function press(nav: Navigator, ...keys: string[]) {
  const held = (nav as unknown as { keys: Set<string> }).keys;
  held.clear();
  keys.forEach((k) => held.add(k));
}

function run(nav: Navigator, seconds: number, dt = 1 / 60) {
  for (let t = 0; t < seconds - 1e-9; t += dt) nav.update(dt);
}

test("thrust builds up over about five seconds", () => {
  const nav = new Navigator();
  nav.setDistance(10);
  press(nav, "w");
  run(nav, 2.5);
  assert.ok(nav.throttleLevel > 0.45 && nav.throttleLevel < 0.55, `half way at 2.5 s, got ${nav.throttleLevel}`);
  run(nav, 2.6);
  assert.equal(nav.throttleLevel, 1);
});

test("the ship keeps moving after the keys are let go, then stops", () => {
  const nav = new Navigator();
  nav.setDistance(10);
  press(nav, "w");
  run(nav, 5);
  press(nav);
  const before = nav.focus.clone();
  run(nav, 0.3);
  assert.ok(nav.focus.distanceTo(before) > 1, "coasts on");
  run(nav, 0.6);
  assert.equal(nav.throttleLevel, 0);
  const stopped = nav.focus.clone();
  run(nav, 1);
  assert.ok(nav.focus.distanceTo(stopped) < 1e-9, "at rest");
});

test("changing course kills the old motion instead of dragging it along", () => {
  const nav = new Navigator();
  nav.setDistance(10);
  nav.yaw = 0;
  press(nav, "w");
  run(nav, 5);
  // Hard slide right: after a while the ship moves right, not on along its old course
  press(nav, "e");
  run(nav, 6);
  const before = nav.focus.clone();
  run(nav, 0.5);
  const moved = nav.focus.clone().sub(before).normalize();
  const right = { x: Math.cos(nav.yaw), z: -Math.sin(nav.yaw) };
  assert.ok(moved.x * right.x + moved.z * right.z > 0.98, `heading right, got ${moved.toArray()}`);
});

test("coasting keeps its course when the view turns", () => {
  const nav = new Navigator();
  nav.setDistance(10);
  press(nav, "w");
  run(nav, 5);
  press(nav);
  const a = nav.focus.clone();
  run(nav, 0.2);
  const course = nav.focus.clone().sub(a).normalize();
  nav.yaw += 1.2; // looking elsewhere
  const b = nav.focus.clone();
  run(nav, 0.2);
  const after = nav.focus.clone().sub(b).normalize();
  assert.ok(course.dot(after) > 0.999, "still on the same course");
});

test("left and right turn the ship", () => {
  const nav = new Navigator();
  nav.yaw = 0;
  press(nav, "d");
  run(nav, 1);
  assert.ok(nav.yaw < -0.7, `turned right, got ${nav.yaw}`);
  press(nav, "arrowleft");
  run(nav, 2);
  assert.ok(nav.yaw > 0.5, `turned left, got ${nav.yaw}`);
});

test("strafing banks the ship, climbing lifts it", () => {
  const nav = new Navigator();
  press(nav, "e");
  run(nav, 4);
  assert.ok(nav.strafe > 0.5, `strafe right, got ${nav.strafe}`);
  press(nav, "r");
  run(nav, 4);
  assert.ok(nav.climb > 0.5, `climb, got ${nav.climb}`);
});
