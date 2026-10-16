// atlas-ui/react/static/js/Explore/galaxy/SpatialIndex.test.ts
// Run with: npm run test:explore

import { test } from "node:test";
import assert from "node:assert/strict";
import { GalaxyModel, type GalaxyInfo } from "./GalaxyModel.ts";
import { SpatialIndex } from "./SpatialIndex.ts";

function galaxy(type: string, numSystems: number, maxSystems = numSystems): GalaxyInfo {
  return {
    name: `Test_${type}-42`,
    galaxy_type: type,
    coordinates: [1234, 5678, 91011],
    num_systems: numSystems,
    max_systems: maxSystems,
    growth_per_minute: 0,
    black_holes: 4,
    pulsars: 10,
    quasars: 0,
    spatial_seed: "0123456789abcdef",
  };
}

for (const type of ["Spiral", "Elliptical", "Dwarf"]) {
  test(`${type}: every index of a small galaxy maps to a unique leaf and back`, () => {
    const N = 4000;
    const index = new SpatialIndex(new GalaxyModel(galaxy(type, N)));
    for (let i = 0; i < N; i++) {
      const [x, y, z] = index.locate(i);
      const inLeaf = index.systemsInLeaf(x, y, z, N);
      assert.ok(inLeaf.includes(i), `index ${i} not found in its own leaf (got ${inLeaf.join(",")})`);
      for (const other of inLeaf) assert.ok(other >= 0 && other < N);
    }
  });

  test(`${type}: child counts always add up to the parent count`, () => {
    const index = new SpatialIndex(new GalaxyModel(galaxy(type, 20_000_000_000)));
    const stack: Array<[number, number, number, number, number]> = [[0, 0, 0, 0, 20_000_000_000]];
    let visited = 0;
    while (stack.length && visited < 3000) {
      const [d, ix, iy, iz, count] = stack.pop()!;
      visited++;
      const t = index.table(d, ix, iy, iz);
      let sum = 0;
      for (let c = 0; c < 8; c++) {
        const cc = index.childCount(t, c, count);
        sum += cc;
        if (cc > 0 && d < 6) stack.push([d + 1, ix * 2 + (c & 1), iy * 2 + ((c >> 1) & 1), iz * 2 + ((c >> 2) & 1), cc]);
      }
      assert.equal(sum, count);
    }
  });

  test(`${type}: huge galaxies keep the index <-> position bijection`, () => {
    const N = 47_000_000_000;
    const index = new SpatialIndex(new GalaxyModel(galaxy(type, N)));
    for (let k = 0; k < 400; k++) {
      const i = Math.floor((k * 0.6180339887 % 1) * N);
      const [x, y, z] = index.locate(i);
      assert.ok(index.systemsInLeaf(x, y, z, N).includes(i), `index ${i} lost`);
    }
  });
}

test("positions do not depend on how many systems exist (cosmic growth)", () => {
  const small = new SpatialIndex(new GalaxyModel(galaxy("Spiral", 1_000_000, 5_000_000_000)));
  const large = new SpatialIndex(new GalaxyModel(galaxy("Spiral", 3_000_000_000, 5_000_000_000)));
  for (let i = 0; i < 2000; i += 7) {
    assert.deepEqual(small.locate(i), large.locate(i));
  }
});

test("the first rank of a node is the first rank of one of its children", () => {
  const index = new SpatialIndex(new GalaxyModel(galaxy("Spiral", 1e10)));
  for (let d = 0; d < 10; d++) {
    const t = index.table(d, 0, 0, 0);
    index.childOf(t, 0);
    assert.equal(index.outRank, 0);
  }
});

test("spiral galaxies are thin disks", () => {
  const model = new GalaxyModel(galaxy("Spiral", 30_000_000_000));
  const index = new SpatialIndex(model);
  let inDisk = 0;
  const samples = 2000;
  for (let k = 0; k < samples; k++) {
    const [, y] = index.locate(k * 15_000_007);
    if (Math.abs(y) < 2500) inDisk++;
  }
  assert.ok(inDisk / samples > 0.7, `only ${((100 * inDisk) / samples).toFixed(1)}% of systems in the disk`);
});

test("layout is deterministic across instances", () => {
  const a = new SpatialIndex(new GalaxyModel(galaxy("Elliptical", 1e9)));
  const b = new SpatialIndex(new GalaxyModel(galaxy("Elliptical", 1e9)));
  for (const i of [0, 1, 2, 999, 123456789, 999999999]) assert.deepEqual(a.locate(i), b.locate(i));
});
