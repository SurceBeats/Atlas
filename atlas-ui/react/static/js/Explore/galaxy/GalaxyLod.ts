// atlas-ui/react/static/js/Explore/galaxy/GalaxyLod.ts
//
// View-dependent walk of the spatial octree. Produces two layers, both relative to
// `origin` so they can be uploaded as float32 without losing precision near the camera:
//
//   * glow:  unresolved regions (octree nodes) drawn as soft light, brightness ∝ count;
//   * stars: real systems with their global index. Each unresolved region contributes its
//            representative system, close regions are enumerated completely.

import { SpatialIndex, type NodeTable } from "./SpatialIndex.ts";
import { mix, rand01 } from "../core/hash.ts";

export interface LodRequest {
  id: number;
  camera: [number, number, number];
  forward: [number, number, number];
  fovY: number;
  aspect: number;
  viewportHeight: number;
  numSystems: number;
  origin: [number, number, number];
  maxNodes: number;
  maxStars: number;
  splitAngle?: number;
}

export interface LodResult {
  id: number;
  origin: [number, number, number];
  glowCount: number;
  glowPositions: Float32Array;
  glowSizes: Float32Array;
  glowColors: Float32Array;
  glowWeights: Float32Array;
  starCount: number;
  starPositions: Float32Array;
  starColors: Float32Array;
  starSizes: Float32Array;
  starWeights: Float32Array; // how many systems the point stands for (1 when resolved)
  starIndices: Float64Array;
  starExact: Uint8Array;
  // Representative systems of the regions above each point (nearest first, -1 past the
  // root): a coarser LOD drew the point's light at one of them, so a point that is new
  // here can grow out of there
  starAncestors: Float64Array;
  elapsedMs: number;
}

// Same distribution as SolarSystem.generate_star (uniform choice). Used only until the
// real star type is fetched from the server.
export const STAR_TYPES = ["Red Dwarf", "Yellow Dwarf", "Blue Giant", "Red Giant", "White Dwarf", "Neutron Star"];
export const STAR_TYPE_COLORS: Record<string, [number, number, number]> = {
  "Red Dwarf": [1.0, 0.45, 0.3],
  "Yellow Dwarf": [1.0, 0.93, 0.72],
  "Blue Giant": [0.62, 0.78, 1.0],
  "Red Giant": [1.0, 0.68, 0.4],
  "White Dwarf": [0.92, 0.95, 1.0],
  "Neutron Star": [0.8, 0.65, 1.0],
};
export const STAR_TYPE_LUMINOSITY: Record<string, number> = {
  "Red Dwarf": 0.55,
  "Yellow Dwarf": 1.0,
  "Blue Giant": 2.4,
  "Red Giant": 1.7,
  "White Dwarf": 0.65,
  "Neutron Star": 0.5,
};

export function guessStarType(globalIndex: number, seed: number): string {
  return STAR_TYPES[Math.floor(rand01(mix(seed, globalIndex)) * STAR_TYPES.length)];
}

interface LodNode {
  d: number;
  ix: number;
  iy: number;
  iz: number;
  count: number;
  parent: LodNode | null;
  childIdx: number;
  table: NodeTable | null;
  priority: number;
  projected: number;
}

const SPLIT_ANGLE = 0.018; // radians a region may cover before it is split
const ENUMERATE_BELOW = 40; // regions with fewer systems are drawn star by star when close
const ENUMERATE_ANGLE = 0.02;
const MIN_GLOW_COUNT = 6;
export const STAR_ANCESTORS = 8;

class MaxHeap {
  items: LodNode[] = [];

  push(n: LodNode) {
    const a = this.items;
    a.push(n);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p].priority >= a[i].priority) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }

  pop(): LodNode | undefined {
    const a = this.items;
    if (a.length === 0) return undefined;
    const top = a[0];
    const last = a.pop()!;
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && a[l].priority > a[m].priority) m = l;
        if (r < a.length && a[r].priority > a[m].priority) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }

  get size() {
    return this.items.length;
  }
}

export class GalaxyLod {
  private index: SpatialIndex;
  private starSeed: number;
  private scratch = new Float64Array(3);
  private colorScratch = new Float32Array(3);

  constructor(index: SpatialIndex) {
    this.index = index;
    this.starSeed = mix(index.model.seed, 0x7f4a7c15);
  }

  starTypeOf(globalIndex: number): string {
    return guessStarType(globalIndex, this.starSeed);
  }

  private globalIndex(node: LodNode, rank: number): number {
    let n = node;
    while (n.parent) {
      rank = this.index.parentRank(n.parent.table!, n.childIdx, rank);
      n = n.parent;
    }
    return rank;
  }

  run(req: LodRequest): LodResult {
    const start = performance.now();
    const index = this.index;
    const [cx, cy, cz] = req.camera;
    const [fx, fy, fz] = req.forward;
    const halfDiag = Math.atan(Math.tan(req.fovY / 2) * Math.sqrt(1 + req.aspect * req.aspect));
    const viewCos = Math.cos(Math.min(Math.PI, halfDiag + 0.35));
    const pixelAngle = req.fovY / req.viewportHeight;
    const splitAngle = req.splitAngle ?? SPLIT_ANGLE;

    const glowPos: number[] = [];
    const glowSize: number[] = [];
    const glowColor: number[] = [];
    const glowWeight: number[] = [];
    const starPos: number[] = [];
    const starColor: number[] = [];
    const starSize: number[] = [];
    const starWeight: number[] = [];
    const starIndex: number[] = [];
    const starExact: number[] = [];
    const starAncestors: number[] = [];
    const [ox, oy, oz] = req.origin;
    const ancestry = new Array<number>(STAR_ANCESTORS);
    // Representatives of `node` (if `self`) and the regions above it
    const ancestorsOf = (node: LodNode, self: boolean) => {
      let n: LodNode | null = self ? node : node.parent;
      for (let k = 0; k < STAR_ANCESTORS; k++) {
        ancestry[k] = n ? this.globalIndex(n, 0) : -1;
        n = n?.parent ?? null;
      }
      return ancestry;
    };

    const evaluate = (node: LodNode) => {
      const size = index.cellSize(node.d);
      const x0 = -index.H + node.ix * size;
      const y0 = -index.H + node.iy * size;
      const z0 = -index.H + node.iz * size;
      const dx = Math.max(x0 - cx, 0, cx - (x0 + size));
      const dy = Math.max(y0 - cy, 0, cy - (y0 + size));
      const dz = Math.max(z0 - cz, 0, cz - (z0 + size));
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      node.projected = dist === 0 ? Infinity : (size * 1.7320508) / dist;

      const mx = x0 + size / 2 - cx;
      const my = y0 + size / 2 - cy;
      const mz = z0 + size / 2 - cz;
      const centerDist = Math.sqrt(mx * mx + my * my + mz * mz) || 1;
      const angularRadius = Math.asin(Math.min(1, (size * 0.8660254) / centerDist));
      const cosToCenter = (mx * fx + my * fy + mz * fz) / centerDist;
      const visible = dist === 0 || Math.acos(Math.max(-1, Math.min(1, cosToCenter))) - angularRadius < Math.acos(viewCos);
      node.priority = node.projected * (visible ? 1 : 0.15);
    };

    const pushStar = (globalIndex: number, x: number, y: number, z: number, exact: boolean, weight: number, ancestors: number[]) => {
      for (let k = 0; k < STAR_ANCESTORS; k++) starAncestors.push(ancestors[k]);
      const type = this.starTypeOf(globalIndex);
      const color = STAR_TYPE_COLORS[type];
      starPos.push(x - ox, y - oy, z - oz);
      starColor.push(color[0], color[1], color[2]);
      starSize.push(STAR_TYPE_LUMINOSITY[type]);
      starWeight.push(weight);
      starIndex.push(globalIndex);
      starExact.push(exact ? 1 : 0);
    };

    // Depth at which a cell around this node is below ~1.5 px: descending further would
    // only refine positions nobody can see, and costs one table per level.
    const sharpDepth = (node: LodNode) => {
      let depth = node.d;
      let cell = index.cellSize(node.d);
      const dist = node.projected === Infinity ? 0 : (cell * 1.7320508) / node.projected;
      while (depth < index.maxDepth && (dist === 0 || cell / dist > pixelAngle * 1.5)) {
        depth++;
        cell /= 2;
      }
      return depth;
    };

    const enumerate = (node: LodNode) => {
      const limit = Math.min(node.count, 256);
      const depth = sharpDepth(node);
      // The region's own representative is where its light was drawn before it resolved
      const ancestors = ancestorsOf(node, true).slice();
      for (let r = 0; r < limit; r++) {
        const g = this.globalIndex(node, r);
        index.descend(node.d, node.ix, node.iy, node.iz, r, depth, g, this.scratch, 0);
        pushStar(g, this.scratch[0], this.scratch[1], this.scratch[2], depth === index.maxDepth, 1, ancestors);
      }
    };

    const finalize = (node: LodNode) => {
      const size = index.cellSize(node.d);
      if (node.count >= MIN_GLOW_COUNT) {
        const x0 = -index.H + node.ix * size;
        const y0 = -index.H + node.iy * size;
        const z0 = -index.H + node.iz * size;
        glowPos.push(x0 + size / 2 - ox, y0 + size / 2 - oy, z0 + size / 2 - oz);
        glowSize.push(size);
        index.model.colorOfBox({ x0, x1: x0 + size, y0, y1: y0 + size, z0, z1: z0 + size }, this.colorScratch, 0);
        glowColor.push(this.colorScratch[0], this.colorScratch[1], this.colorScratch[2]);
        glowWeight.push(node.count);
      }

      if (starIndex.length >= req.maxStars) return;
      // Representative system: descend just deep enough for sub-pixel accuracy
      const depth = sharpDepth(node);
      const g = this.globalIndex(node, 0);
      index.descend(node.d, node.ix, node.iy, node.iz, 0, depth, g, this.scratch, 0);
      pushStar(g, this.scratch[0], this.scratch[1], this.scratch[2], depth === index.maxDepth, node.count, ancestorsOf(node, false));
    };

    const heap = new MaxHeap();
    if (req.numSystems > 0) {
      const root: LodNode = { d: 0, ix: 0, iy: 0, iz: 0, count: req.numSystems, parent: null, childIdx: 0, table: null, priority: 0, projected: 0 };
      evaluate(root);
      heap.push(root);
    }

    let finalized = 0;
    while (heap.size > 0) {
      const node = heap.pop()!;
      if (node.d >= index.maxDepth) {
        enumerate(node);
        finalized++;
        continue;
      }
      if (node.count <= ENUMERATE_BELOW && node.projected > ENUMERATE_ANGLE && starIndex.length + node.count <= req.maxStars) {
        enumerate(node);
        finalized++;
        continue;
      }
      if (node.count === 1 || node.projected < splitAngle || finalized + heap.size + 8 > req.maxNodes) {
        finalize(node);
        finalized++;
        continue;
      }

      const t = index.table(node.d, node.ix, node.iy, node.iz);
      node.table = t;
      for (let c = 0; c < 8; c++) {
        const count = index.childCount(t, c, node.count);
        if (count === 0) continue;
        const child: LodNode = {
          d: node.d + 1,
          ix: node.ix * 2 + (c & 1),
          iy: node.iy * 2 + ((c >> 1) & 1),
          iz: node.iz * 2 + ((c >> 2) & 1),
          count,
          parent: node,
          childIdx: c,
          table: null,
          priority: 0,
          projected: 0,
        };
        evaluate(child);
        heap.push(child);
      }
    }

    return {
      id: req.id,
      origin: req.origin,
      glowCount: glowWeight.length,
      glowPositions: new Float32Array(glowPos),
      glowSizes: new Float32Array(glowSize),
      glowColors: new Float32Array(glowColor),
      glowWeights: new Float32Array(glowWeight),
      starCount: starIndex.length,
      starPositions: new Float32Array(starPos),
      starColors: new Float32Array(starColor),
      starSizes: new Float32Array(starSize),
      starWeights: new Float32Array(starWeight),
      starIndices: new Float64Array(starIndex),
      starExact: new Uint8Array(starExact),
      starAncestors: new Float64Array(starAncestors),
      elapsedMs: performance.now() - start,
    };
  }
}
