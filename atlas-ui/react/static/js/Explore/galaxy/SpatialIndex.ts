// atlas-ui/react/static/js/Explore/galaxy/SpatialIndex.ts
//
// Exact, deterministic bijection between system indices [0, N) and positions in space.
//
// The galaxy volume is an octree. Every node owns a contiguous range of "ranks" (local
// indices) and distributes them over its 8 children with a small integer weight table
// (n[0..7], S = sum n). Ranks are dealt in blocks of S slots; inside a block the slot
// order is a low-discrepancy interleave, so any prefix of ranks is spread over the
// children proportionally to their mass. That gives three properties we rely on:
//
//   * index -> position is O(depth) and never depends on N, so a system keeps its
//     position forever while the galaxy keeps growing over cosmic time;
//   * child counts for any N are O(1), so the renderer can walk the tree top-down;
//   * rank 0 of a node is rank 0 of its first child, so the "representative star"
//     of a distant region is the same star you find when you fly into it.

import { GalaxyModel, type Box } from "./GalaxyModel.ts";
import { mix, mix3, rand01, gauss } from "../core/hash.ts";

const QUANTUM = 64;
const MIN_SHARE = 1 / (4 * QUANTUM);
const TABLE_CACHE_LIMIT = 160000;

// A node table packed in one allocation (hundreds of thousands live at once):
//   [0] S | [1..8] n[c] | [9..17] occStart[c] | slots[S] | rankInSlot[S] | occ[S]
export type NodeTable = Uint8Array;
const T_N = 1;
const T_OCC_START = 9;
const T_SLOTS = 18;

export class SpatialIndex {
  readonly model: GalaxyModel;
  readonly H: number;
  readonly maxDepth: number;
  private young: Array<Map<number, NodeTable>>;
  private old: Array<Map<number, NodeTable>>;
  private youngSize = 0;
  private noiseSeed: number;
  private jitterSeed: number;
  private weights = new Float64Array(8);
  private current = new Float64Array(8);
  private quantized = new Uint8Array(8);
  private seen = new Uint8Array(8);
  private box: Box = { x0: 0, x1: 0, y0: 0, y1: 0, z0: 0, z1: 0 };

  // Results of childOf(), kept in fields to avoid allocating in hot loops
  outChild = 0;
  outRank = 0;

  constructor(model: GalaxyModel) {
    this.model = model;
    this.H = model.halfSize;
    this.maxDepth = model.maxDepth;
    this.noiseSeed = mix(model.seed, 0x51ed270b);
    this.jitterSeed = mix(model.seed, 0x2545f491);
    this.young = this.emptyGeneration();
    this.old = this.emptyGeneration();
  }

  cellSize(depth: number): number {
    return (2 * this.H) / Math.pow(2, depth);
  }

  nodeBox(depth: number, ix: number, iy: number, iz: number, out: Box): Box {
    const size = this.cellSize(depth);
    out.x0 = -this.H + ix * size;
    out.x1 = out.x0 + size;
    out.y0 = -this.H + iy * size;
    out.y1 = out.y0 + size;
    out.z0 = -this.H + iz * size;
    out.z1 = out.z0 + size;
    return out;
  }

  // Two-generation cache: when the young generation fills up it becomes the old one and
  // anything still in use gets promoted back on access. O(1), no per-entry bookkeeping.
  table(depth: number, ix: number, iy: number, iz: number): NodeTable {
    const side = Math.pow(2, depth);
    const key = (ix * side + iy) * side + iz; // < 2^51 because maxDepth <= 17
    let t = this.young[depth].get(key);
    if (t) return t;
    t = this.old[depth].get(key);
    if (!t) t = this.computeTable(depth, ix, iy, iz);
    if (this.youngSize >= TABLE_CACHE_LIMIT) {
      this.old = this.young;
      this.young = this.emptyGeneration();
      this.youngSize = 0;
    }
    this.young[depth].set(key, t);
    this.youngSize++;
    return t;
  }

  private emptyGeneration(): Array<Map<number, NodeTable>> {
    return Array.from({ length: this.maxDepth + 1 }, () => new Map<number, NodeTable>());
  }

  private computeTable(depth: number, ix: number, iy: number, iz: number): NodeTable {
    const parent = this.nodeBox(depth, ix, iy, iz, { x0: 0, x1: 0, y0: 0, y1: 0, z0: 0, z1: 0 });
    const gaussians = this.model.relevantGaussians(parent);
    const childSize = this.cellSize(depth + 1);
    const w = this.weights;
    const box = this.box;

    // Multiplicative cascade: large cells keep the galaxy morphology untouched (noise there
    // shows up as visible cubes), cells below ~1000 ly get log-normal clumping, which is
    // what makes stellar associations and voids.
    const noise = childSize > 1000 ? 0 : Math.min(0.55, 0.11 * Math.log2(1000 / childSize) + 0.08);
    const nodeHash = mix3(mix(this.noiseSeed, depth), ix, iy, iz);

    let total = 0;
    for (let c = 0; c < 8; c++) {
      box.x0 = parent.x0 + (c & 1) * childSize;
      box.x1 = box.x0 + childSize;
      box.y0 = parent.y0 + ((c >> 1) & 1) * childSize;
      box.y1 = box.y0 + childSize;
      box.z0 = parent.z0 + ((c >> 2) & 1) * childSize;
      box.z1 = box.z0 + childSize;
      let m = this.model.massInBox(box, gaussians);
      if (noise > 0 && m > 0) m *= Math.exp(noise * gauss(mix(nodeHash, c)));
      w[c] = m;
      total += m;
    }

    const n = this.quantized;
    n.fill(0);
    let S = 0;
    if (total > 0) {
      let best = 0;
      for (let c = 0; c < 8; c++) {
        const share = w[c] / total;
        let q = Math.round(share * QUANTUM);
        if (q === 0 && share > MIN_SHARE) q = 1;
        n[c] = q;
        S += q;
        if (w[c] > w[best]) best = c;
      }
      if (S === 0) {
        n[best] = 1;
        S = 1;
      }
    } else {
      // Should not happen for nodes that received systems; spread evenly as a fallback
      n.fill(1);
      S = 8;
    }

    const t = new Uint8Array(T_SLOTS + 3 * S);
    t[0] = S;
    for (let c = 0; c < 8; c++) {
      t[T_N + c] = n[c];
      t[T_OCC_START + c + 1] = t[T_OCC_START + c] + n[c];
    }

    // Smooth weighted round-robin: any prefix of the slot sequence is proportional
    const rankBase = T_SLOTS + S;
    const occBase = T_SLOTS + 2 * S;
    const seen = this.seen;
    seen.fill(0);
    const cur = this.current;
    cur.fill(0);
    const rotation = nodeHash & 7;
    for (let s = 0; s < S; s++) {
      let pick = -1;
      for (let k = 0; k < 8; k++) {
        const c = (k + rotation) & 7;
        if (n[c] === 0) continue;
        cur[c] += n[c];
        if (pick < 0 || cur[c] > cur[pick]) pick = c;
      }
      cur[pick] -= S;
      t[T_SLOTS + s] = pick;
      t[rankBase + s] = seen[pick]++;
    }

    for (let s = 0; s < S; s++) {
      const c = t[T_SLOTS + s];
      t[occBase + t[T_OCC_START + c] + t[rankBase + s]] = s;
    }
    return t;
  }

  // Maps a node-local rank to (child, child-local rank) into outChild / outRank.
  childOf(t: NodeTable, rank: number) {
    const S = t[0];
    const block = Math.floor(rank / S);
    const o = rank - block * S;
    const c = t[T_SLOTS + o];
    this.outChild = c;
    this.outRank = block * t[T_N + c] + t[T_SLOTS + S + o];
  }

  parentRank(t: NodeTable, child: number, childRank: number): number {
    const S = t[0];
    const nc = t[T_N + child];
    const block = Math.floor(childRank / nc);
    const k = childRank - block * nc;
    return block * S + t[T_SLOTS + 2 * S + t[T_OCC_START + child] + k];
  }

  // How many of the node's first `count` ranks fall into `child`.
  childCount(t: NodeTable, child: number, count: number): number {
    const nc = t[T_N + child];
    if (nc === 0) return 0;
    const S = t[0];
    const full = Math.floor(count / S);
    const rem = count - full * S;
    const occBase = T_SLOTS + 2 * S;
    let partial = 0;
    const end = occBase + t[T_OCC_START + child + 1];
    for (let i = occBase + t[T_OCC_START + child]; i < end && t[i] < rem; i++) partial++;
    return full * nc + partial;
  }

  // Descends from a node to `targetDepth` following `rank`, then jitters inside the final
  // cell. With targetDepth === maxDepth the result is the exact, canonical position.
  descend(depth: number, ix: number, iy: number, iz: number, rank: number, targetDepth: number, globalIndex: number, out: Float64Array, offset: number) {
    while (depth < targetDepth) {
      const t = this.table(depth, ix, iy, iz);
      this.childOf(t, rank);
      const c = this.outChild;
      rank = this.outRank;
      ix = ix * 2 + (c & 1);
      iy = iy * 2 + ((c >> 1) & 1);
      iz = iz * 2 + ((c >> 2) & 1);
      depth++;
    }
    const size = this.cellSize(depth);
    const h = mix(this.jitterSeed, globalIndex);
    out[offset] = -this.H + (ix + rand01(mix(h, 1))) * size;
    out[offset + 1] = -this.H + (iy + rand01(mix(h, 2))) * size;
    out[offset + 2] = -this.H + (iz + rand01(mix(h, 3))) * size;
  }

  locate(index: number): [number, number, number] {
    const out = new Float64Array(3);
    this.descend(0, 0, 0, 0, index, this.maxDepth, index, out, 0);
    return [out[0], out[1], out[2]];
  }

  // Inverse of locate() for the leaf cell containing (x, y, z): returns the global
  // indices of the systems living in that cell (empty when there are none).
  systemsInLeaf(x: number, y: number, z: number, numSystems: number): number[] {
    const size = this.cellSize(this.maxDepth);
    const n = Math.pow(2, this.maxDepth);
    const lx = Math.min(n - 1, Math.max(0, Math.floor((x + this.H) / size)));
    const ly = Math.min(n - 1, Math.max(0, Math.floor((y + this.H) / size)));
    const lz = Math.min(n - 1, Math.max(0, Math.floor((z + this.H) / size)));

    const path: Array<{ t: NodeTable; c: number }> = [];
    let count = numSystems;
    for (let d = 0; d < this.maxDepth && count > 0; d++) {
      const shift = this.maxDepth - d - 1;
      const ix = Math.floor(lx / Math.pow(2, shift + 1));
      const iy = Math.floor(ly / Math.pow(2, shift + 1));
      const iz = Math.floor(lz / Math.pow(2, shift + 1));
      const t = this.table(d, ix, iy, iz);
      const c = (Math.floor(lx / Math.pow(2, shift)) & 1) | ((Math.floor(ly / Math.pow(2, shift)) & 1) << 1) | ((Math.floor(lz / Math.pow(2, shift)) & 1) << 2);
      count = this.childCount(t, c, count);
      path.push({ t, c });
    }

    const result: number[] = [];
    for (let r = 0; r < count; r++) {
      let rank = r;
      for (let i = path.length - 1; i >= 0; i--) rank = this.parentRank(path[i].t, path[i].c, rank);
      result.push(rank);
    }
    return result;
  }
}
