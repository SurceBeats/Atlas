// atlas-ui/react/static/js/Explore/galaxy/GalaxyModel.ts
//
// Continuous mass model of a galaxy, derived only from its spatial seed and type.
// Units are light years. The disk lies on the XZ plane, +Y is the galactic north pole.
//
// The model answers one question very precisely: "which fraction of the galaxy's
// systems lives inside this box?". Gaussian components are integrated exactly (erf),
// the disk is integrated exactly on Y and sampled on XZ. SpatialIndex turns those
// fractions into an exact, deterministic index <-> position mapping.

import { hashString, SeededRng } from "../core/hash.ts";

export interface GalaxyInfo {
  name: string;
  galaxy_type: string;
  coordinates: [number, number, number];
  num_systems: number;
  max_systems: number;
  growth_per_minute: number;
  black_holes: number;
  pulsars: number;
  quasars: number;
  spatial_seed: string;
  stargate_url?: string;
}

export interface Box {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
  z0: number;
  z1: number;
}

export type ComponentKind = "bulge" | "bar" | "halo" | "spheroid" | "blob" | "globular" | "open";

export interface GaussianComponent {
  kind: ComponentKind;
  cx: number;
  cy: number;
  cz: number;
  sx: number;
  sy: number;
  sz: number;
  mass: number;
  reach: number; // beyond this distance on any axis the contribution is negligible
  color: [number, number, number];
}

export interface DiskComponent {
  mass: number;
  scaleLength: number;
  scaleHeight: number;
  radius: number;
  arms: number;
  pitch: number;
  phase: number;
  armWidth: number;
  armAmplitude: number;
  armStart: number;
}

// ("torus": the primordial torus, at the heart of a Singularity Void)
export type PoiKind = "core" | "globular" | "open" | "blackhole" | "pulsar" | "quasar" | "torus";

export interface PointOfInterest {
  id: string;
  kind: PoiKind;
  name: string;
  position: [number, number, number];
  radius: number;
  description: string;
}

const DISK_COLOR_ARM: [number, number, number] = [0.45, 0.62, 1.0];
const DISK_COLOR_INTERARM: [number, number, number] = [1.0, 0.8, 0.58];
const BULGE_COLOR: [number, number, number] = [1.0, 0.74, 0.42];
const HALO_COLOR: [number, number, number] = [0.95, 0.82, 0.7];
const GLOBULAR_COLOR: [number, number, number] = [1.0, 0.85, 0.62];
const OPEN_COLOR: [number, number, number] = [0.55, 0.72, 1.0];
const BLOB_COLOR: [number, number, number] = [0.75, 0.8, 1.0];

const SQRT2 = Math.SQRT2;
const TWO_PI = Math.PI * 2;
const DISK_GRID = 1024;

// Numerical Recipes erfc: fractional error < 1.2e-7 everywhere, accurate in the tails.
function erfc(x: number): number {
  const z = Math.abs(x);
  const t = 1 / (1 + 0.5 * z);
  const r = t * Math.exp(-z * z - 1.26551223 + t * (1.00002368 + t * (0.37409196 + t * (0.09678418 + t * (-0.18628806 + t * (0.27886807 + t * (-1.13520398 + t * (1.48851587 + t * (-0.82215223 + t * 0.17087277)))))))));
  return x >= 0 ? r : 2 - r;
}

// Fraction of a 1D normal distribution (center c, sigma s) inside [a, b].
function gaussianInterval(a: number, b: number, c: number, s: number): number {
  const u = (a - c) / (s * SQRT2);
  const v = (b - c) / (s * SQRT2);
  if (u >= 0) return 0.5 * (erfc(u) - erfc(v));
  if (v <= 0) return 0.5 * (erfc(-v) - erfc(-u));
  return 1 - 0.5 * (erfc(-u) + erfc(v));
}

// Fraction of a two-sided exponential profile exp(-|y|/h)/(2h) inside [a, b].
function exponentialInterval(a: number, b: number, h: number): number {
  if (a >= 0) return 0.5 * (Math.exp(-a / h) - Math.exp(-b / h));
  if (b <= 0) return 0.5 * (Math.exp(b / h) - Math.exp(a / h));
  return 1 - 0.5 * (Math.exp(a / h) + Math.exp(-b / h));
}

function wrapAngle(a: number): number {
  a = a % TWO_PI;
  if (a > Math.PI) a -= TWO_PI;
  if (a < -Math.PI) a += TWO_PI;
  return a;
}

const GREEK = ["Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa", "Lambda", "Mu", "Nu", "Xi", "Omicron", "Pi", "Rho", "Sigma", "Tau", "Upsilon", "Phi", "Chi", "Psi", "Omega"];

// The radius is the first draw of the galaxy's generator
function pickRadius(type: GalaxyModel["type"], rng: SeededRng) {
  if (type === "Spiral") return rng.range(32000, 60000);
  if (type === "Elliptical") return rng.range(28000, 75000);
  if (type === "Dwarf") return rng.range(3500, 9000);
  return 2000;
}

// The radius a galaxy will have, without building its model (ly)
export function galaxyRadius(info: GalaxyInfo) {
  const t = info.galaxy_type;
  const type = t === "Spiral" || t === "Elliptical" || t === "Dwarf" ? t : "Void";
  return pickRadius(type, new SeededRng(hashString(`${info.spatial_seed}:${info.coordinates.join(",")}`)));
}

export class GalaxyModel {
  readonly info: GalaxyInfo;
  readonly seed: number;
  readonly type: "Spiral" | "Elliptical" | "Dwarf" | "Void";
  readonly radius: number;
  readonly halfSize: number;
  readonly maxDepth: number;
  readonly gaussians: GaussianComponent[] = [];
  disk: DiskComponent | null = null;
  readonly pois: PointOfInterest[] = [];
  private diskSurfaceTotal = 1;
  private surfaceGrid: Float32Array | null = null;
  private armGrid: Float32Array | null = null;
  private largeGaussians: GaussianComponent[] = [];
  private sortedSmall: GaussianComponent[] | null = null;
  private maxSmallReach = 0;

  constructor(info: GalaxyInfo) {
    this.info = info;
    this.seed = hashString(`${info.spatial_seed}:${info.coordinates.join(",")}`);
    const rng = new SeededRng(this.seed);

    const type = info.galaxy_type;
    this.type = type === "Spiral" || type === "Elliptical" || type === "Dwarf" ? type : "Void";

    this.radius = pickRadius(this.type, rng);

    this.halfSize = this.radius * 1.3;
    // Deepest cells are roughly one light year wide (capped so node keys fit in a double).
    this.maxDepth = Math.min(17, Math.max(8, Math.ceil(Math.log2((2 * this.halfSize) / 1.0))));

    const capacity = Math.max(info.max_systems, info.num_systems, 1);
    const clusterFloor = (members: number) => Math.min(0.02, members / capacity);

    if (this.type === "Spiral") {
      const R = this.radius;
      const arms = rng.pick([2, 2, 2, 3, 4, 4, 5]);
      this.disk = {
        mass: 0.74,
        scaleLength: R * rng.range(0.22, 0.3),
        scaleHeight: rng.range(280, 520),
        radius: R,
        arms,
        pitch: (rng.range(11, 24) * Math.PI) / 180,
        phase: rng.range(0, TWO_PI),
        armWidth: R * rng.range(0.035, 0.06),
        armAmplitude: rng.range(3.5, 6.5),
        armStart: R * rng.range(0.08, 0.18),
      };

      const bulgeSigma = R * rng.range(0.045, 0.075);
      this.addGaussian("bulge", 0, 0, 0, bulgeSigma, bulgeSigma * rng.range(0.55, 0.8), bulgeSigma, 0.14, BULGE_COLOR);
      if (rng.next() < 0.45) {
        const barLength = R * rng.range(0.1, 0.18);
        this.addGaussian("bar", 0, 0, 0, barLength, bulgeSigma * 0.45, bulgeSigma * 0.55, 0.04, BULGE_COLOR);
      }
      this.addGaussian("halo", 0, 0, 0, R * 0.38, R * 0.3, R * 0.38, 0.03, HALO_COLOR);

      const globulars = rng.int(25, 70);
      for (let i = 0; i < globulars; i++) {
        const r = R * Math.abs(rng.gauss()) * 0.32;
        const dir = this.randomDirection(rng);
        const sigma = rng.range(25, 70);
        this.addGaussian("globular", dir[0] * r, dir[1] * r * 0.8, dir[2] * r, sigma, sigma, sigma, Math.max(rng.range(1.5e-4, 5e-4), clusterFloor(400)), GLOBULAR_COLOR);
      }

      const disk = this.disk!;
      const openClusters = rng.int(90, 220);
      for (let i = 0; i < openClusters; i++) {
        // Open clusters are born inside the spiral arms
        const radius = disk.armStart + Math.abs(rng.gauss()) * disk.scaleLength * 1.4;
        const arm = rng.int(0, disk.arms - 1);
        const angle = disk.phase + (arm * TWO_PI) / disk.arms + Math.log(radius / disk.armStart) / Math.tan(disk.pitch) + rng.gauss() * 0.08;
        const sigma = rng.range(6, 22);
        this.addGaussian("open", radius * Math.cos(angle), rng.gauss() * disk.scaleHeight * 0.4, radius * Math.sin(angle), sigma, sigma * 0.8, sigma, Math.max(rng.range(4e-6, 2.5e-5), clusterFloor(120)), OPEN_COLOR);
      }
    } else if (this.type === "Elliptical") {
      const R = this.radius;
      const q1 = rng.range(0.55, 1.0);
      const q2 = rng.range(0.4, 0.95);
      const shells: Array<[number, number]> = [
        [0.06, 0.32],
        [0.17, 0.38],
        [0.42, 0.25],
      ];
      for (const [scale, mass] of shells) {
        const s = R * scale;
        this.addGaussian("spheroid", 0, 0, 0, s, s * q2, s * q1, mass, BULGE_COLOR);
      }
      const globulars = rng.int(120, 320);
      for (let i = 0; i < globulars; i++) {
        const r = R * Math.abs(rng.gauss()) * 0.45;
        const dir = this.randomDirection(rng);
        const sigma = rng.range(25, 80);
        this.addGaussian("globular", dir[0] * r, dir[1] * r * q2, dir[2] * r * q1, sigma, sigma, sigma, Math.max(rng.range(6e-5, 2.2e-4), clusterFloor(400)), GLOBULAR_COLOR);
      }
    } else if (this.type === "Dwarf") {
      const R = this.radius;
      const blobs = rng.int(3, 7);
      for (let i = 0; i < blobs; i++) {
        const r = R * rng.range(0, 0.45);
        const dir = this.randomDirection(rng);
        const s = R * rng.range(0.1, 0.32);
        this.addGaussian("blob", dir[0] * r, dir[1] * r * 0.4, dir[2] * r, s, s * rng.range(0.3, 0.7), s * rng.range(0.6, 1.0), rng.range(0.5, 1.5), BLOB_COLOR);
      }
      const clusters = rng.int(4, 16);
      for (let i = 0; i < clusters; i++) {
        const r = R * Math.abs(rng.gauss()) * 0.3;
        const dir = this.randomDirection(rng);
        const sigma = rng.range(8, 30);
        this.addGaussian("open", dir[0] * r, dir[1] * r * 0.4, dir[2] * r, sigma, sigma, sigma, Math.max(rng.range(0.004, 0.012), clusterFloor(60)), OPEN_COLOR);
      }
      // Normalise blob masses so that all mass fractions add up to ~1
      const total = this.gaussians.reduce((sum, g) => sum + g.mass, 0);
      for (const g of this.gaussians) g.mass /= total;
    }

    if (this.disk) this.diskSurfaceTotal = this.integrateDiskSurface();
    this.buildPointsOfInterest(rng);
  }

  private randomDirection(rng: SeededRng): [number, number, number] {
    const u = rng.range(-1, 1);
    const theta = rng.range(0, TWO_PI);
    const s = Math.sqrt(1 - u * u);
    return [s * Math.cos(theta), u, s * Math.sin(theta)];
  }

  private addGaussian(kind: ComponentKind, cx: number, cy: number, cz: number, sx: number, sy: number, sz: number, mass: number, color: [number, number, number]) {
    this.gaussians.push({ kind, cx, cy, cz, sx, sy, sz, mass, color, reach: 6 * Math.max(sx, sy, sz) });
  }

  // Unnormalised surface density of the disk at (x, z), including spiral arms.
  diskSurface(x: number, z: number): number {
    const disk = this.disk;
    if (!disk) return 0;
    const R = Math.sqrt(x * x + z * z);
    let sigma = Math.exp(-R / disk.scaleLength);
    if (R > disk.radius) {
      const t = (R - disk.radius) / (0.12 * disk.radius);
      sigma *= Math.exp(-t * t);
    }
    if (R > disk.armStart * 0.5) {
      const fadeIn = Math.min(1, (R - disk.armStart * 0.5) / disk.armStart);
      sigma *= 1 + disk.armAmplitude * this.armStrength(x, z) * fadeIn;
      return sigma * (0.35 + 0.65 * fadeIn);
    }
    return sigma * 0.35;
  }

  // 0..1 proximity to the nearest spiral arm ridge.
  armStrength(x: number, z: number): number {
    const disk = this.disk;
    if (!disk) return 0;
    const R = Math.sqrt(x * x + z * z);
    if (R < disk.armStart * 0.5) return 0;
    const phi = Math.atan2(z, x);
    const spiral = Math.log(Math.max(R, disk.armStart) / disk.armStart) / Math.tan(disk.pitch);
    let arm = 0;
    for (let k = 0; k < disk.arms; k++) {
      const delta = wrapAngle(phi - disk.phase - (k * TWO_PI) / disk.arms - spiral) * R;
      arm = Math.max(arm, Math.exp(-(delta * delta) / (2 * disk.armWidth * disk.armWidth)));
    }
    return arm;
  }

  // The analytic disk (atan2/log per arm) is far too slow to evaluate millions of times,
  // so it is tabulated once on a grid and sampled bilinearly. Arms are thousands of
  // light years wide, so a ~100 ly grid loses nothing visible.
  private ensureDiskGrid() {
    if (this.surfaceGrid || !this.disk) return;
    const G = DISK_GRID;
    const H = this.halfSize;
    const step = (2 * H) / (G - 1);
    this.surfaceGrid = new Float32Array(G * G);
    this.armGrid = new Float32Array(G * G);
    for (let j = 0; j < G; j++) {
      const z = -H + j * step;
      for (let i = 0; i < G; i++) {
        const x = -H + i * step;
        this.surfaceGrid[j * G + i] = this.diskSurface(x, z);
        this.armGrid[j * G + i] = this.armStrength(x, z);
      }
    }
  }

  private sampleGrid(grid: Float32Array, x: number, z: number): number {
    const G = DISK_GRID;
    const u = ((x + this.halfSize) / (2 * this.halfSize)) * (G - 1);
    const v = ((z + this.halfSize) / (2 * this.halfSize)) * (G - 1);
    if (u < 0 || v < 0 || u >= G - 1 || v >= G - 1) return 0;
    const i = Math.floor(u);
    const j = Math.floor(v);
    const fu = u - i;
    const fv = v - j;
    const k = j * G + i;
    return (grid[k] * (1 - fu) + grid[k + 1] * fu) * (1 - fv) + (grid[k + G] * (1 - fu) + grid[k + G + 1] * fu) * fv;
  }

  diskSurfaceFast(x: number, z: number): number {
    this.ensureDiskGrid();
    return this.surfaceGrid ? this.sampleGrid(this.surfaceGrid, x, z) : 0;
  }

  armStrengthFast(x: number, z: number): number {
    this.ensureDiskGrid();
    return this.armGrid ? this.sampleGrid(this.armGrid, x, z) : 0;
  }

  private integrateDiskSurface(): number {
    const n = 320;
    const H = this.halfSize;
    const step = (2 * H) / n;
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const x = -H + (i + 0.5) * step;
      for (let j = 0; j < n; j++) {
        sum += this.diskSurface(x, -H + (j + 0.5) * step);
      }
    }
    return sum * step * step;
  }

  // Fraction of the galaxy's systems contained in the box. Gaussians are filtered by the
  // caller (relevantGaussians) so deep nodes only integrate the few components nearby.
  massInBox(box: Box, gaussians: GaussianComponent[] = this.gaussians): number {
    let mass = 0;
    for (let i = 0; i < gaussians.length; i++) {
      const g = gaussians[i];
      const fx = gaussianInterval(box.x0, box.x1, g.cx, g.sx);
      if (fx === 0) continue;
      const fy = gaussianInterval(box.y0, box.y1, g.cy, g.sy);
      if (fy === 0) continue;
      mass += g.mass * fx * fy * gaussianInterval(box.z0, box.z1, g.cz, g.sz);
    }
    const disk = this.disk;
    if (disk) {
      const fy = exponentialInterval(box.y0, box.y1, disk.scaleHeight);
      if (fy > 0) {
        // Cells smaller than a few grid steps are smooth enough for a single sample
        const n = box.x1 - box.x0 > (8 * this.halfSize) / DISK_GRID ? 3 : 1;
        const dx = (box.x1 - box.x0) / n;
        const dz = (box.z1 - box.z0) / n;
        let surface = 0;
        for (let i = 0; i < n; i++) {
          const x = box.x0 + (i + 0.5) * dx;
          for (let j = 0; j < n; j++) {
            surface += this.diskSurfaceFast(x, box.z0 + (j + 0.5) * dz);
          }
        }
        mass += (disk.mass * fy * surface * dx * dz) / this.diskSurfaceTotal;
      }
    }
    return mass;
  }

  relevantGaussians(box: Box): GaussianComponent[] {
    if (!this.sortedSmall) this.indexGaussians();
    const out = this.largeGaussians.slice();
    const small = this.sortedSmall!;
    const reach = this.maxSmallReach;
    // Binary search the first small component whose center could reach the box on X
    let lo = 0;
    let hi = small.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (small[mid].cx < box.x0 - reach) lo = mid + 1;
      else hi = mid;
    }
    for (let i = lo; i < small.length; i++) {
      const g = small[i];
      if (g.cx - reach > box.x1) break;
      if (g.cx + g.reach < box.x0 || g.cx - g.reach > box.x1) continue;
      if (g.cy + g.reach < box.y0 || g.cy - g.reach > box.y1) continue;
      if (g.cz + g.reach < box.z0 || g.cz - g.reach > box.z1) continue;
      out.push(g);
    }
    return out;
  }

  private indexGaussians() {
    const threshold = this.halfSize / 8;
    this.largeGaussians = this.gaussians.filter((g) => g.reach > threshold);
    this.sortedSmall = this.gaussians.filter((g) => g.reach <= threshold).sort((a, b) => a.cx - b.cx);
    this.maxSmallReach = this.sortedSmall.reduce((m, g) => Math.max(m, g.reach), 0);
  }

  // Mass-weighted color of the light coming from a box.
  colorOfBox(box: Box, out: Float32Array, offset: number) {
    let r = 0;
    let g = 0;
    let b = 0;
    let total = 0;
    for (const comp of this.relevantGaussians(box)) {
      const m = comp.mass * gaussianInterval(box.x0, box.x1, comp.cx, comp.sx) * gaussianInterval(box.y0, box.y1, comp.cy, comp.sy) * gaussianInterval(box.z0, box.z1, comp.cz, comp.sz);
      r += comp.color[0] * m;
      g += comp.color[1] * m;
      b += comp.color[2] * m;
      total += m;
    }
    const disk = this.disk;
    if (disk) {
      const cx = (box.x0 + box.x1) / 2;
      const cz = (box.z0 + box.z1) / 2;
      const m = (disk.mass * exponentialInterval(box.y0, box.y1, disk.scaleHeight) * this.diskSurfaceFast(cx, cz) * (box.x1 - box.x0) * (box.z1 - box.z0)) / this.diskSurfaceTotal;
      const arm = this.armStrengthFast(cx, cz);
      r += (DISK_COLOR_ARM[0] * arm + DISK_COLOR_INTERARM[0] * (1 - arm)) * m;
      g += (DISK_COLOR_ARM[1] * arm + DISK_COLOR_INTERARM[1] * (1 - arm)) * m;
      b += (DISK_COLOR_ARM[2] * arm + DISK_COLOR_INTERARM[2] * (1 - arm)) * m;
      total += m;
    }
    if (total > 0) {
      out[offset] = r / total;
      out[offset + 1] = g / total;
      out[offset + 2] = b / total;
    } else {
      out[offset] = 1;
      out[offset + 1] = 0.9;
      out[offset + 2] = 0.8;
    }
  }

  private buildPointsOfInterest(rng: SeededRng) {
    const prefix = this.info.name.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase() || "ATL";

    // A Singularity Void is the universe before its Bit Bang: no core, no black hole, only
    // the primordial torus, in superposition across every cell of the grid (ExoticLayer)
    if (this.type === "Void") {
      this.pois.push({
        id: "torus",
        kind: "torus",
        name: "The primordial torus",
        position: [0, 0, 0],
        radius: 50,
        description: "Before time: closed loops of +ε and −ε, everywhere at once. Nothing has begun yet.",
      });
      return;
    }

    this.pois.push({
      id: "core",
      kind: this.info.quasars > 0 ? "quasar" : "core",
      name: this.info.quasars > 0 ? `${prefix} Quasar Core` : "Galactic Core",
      position: [0, 0, 0],
      radius: this.radius * 0.06,
      description: this.info.quasars > 0 ? "An active galactic nucleus outshining the whole galaxy." : "The dense heart of the galaxy, home of its central supermassive black hole.",
    });

    this.pois.push({
      id: "smbh",
      kind: "blackhole",
      name: `${prefix} A*`,
      position: [0, 0, 0],
      radius: 0.3,
      description: "The supermassive black hole at the very center, millions of suns packed beyond its event horizon.",
    });

    let globularCount = 0;
    let openCount = 0;
    this.gaussians.forEach((g, i) => {
      if (g.kind === "globular") {
        globularCount++;
        this.pois.push({
          id: `gc-${i}`,
          kind: "globular",
          name: `${prefix}-GC ${globularCount}`,
          position: [g.cx, g.cy, g.cz],
          radius: g.sx * 2.5,
          description: "An ancient, tightly bound swarm of old stars orbiting in the halo.",
        });
      } else if (g.kind === "open") {
        openCount++;
        this.pois.push({
          id: `oc-${i}`,
          kind: "open",
          name: `${prefix}-OC ${openCount}`,
          position: [g.cx, g.cy, g.cz],
          radius: g.sx * 2.5,
          description: "A young open cluster, recently born from the gas of a spiral arm.",
        });
      }
    });

    for (let i = 1; i < this.info.black_holes; i++) {
      const pos = this.sampleDiskPosition(rng);
      this.pois.push({ id: `bh-${i}`, kind: "blackhole", name: `${prefix} X-${i}`, position: pos, radius: 0.01, description: "A stellar-mass black hole feeding on a companion star. Look at how it bends the light behind it." });
    }
    const pulsars = Math.min(this.info.pulsars, 24);
    for (let i = 0; i < pulsars; i++) {
      const pos = this.sampleDiskPosition(rng);
      this.pois.push({ id: `psr-${i}`, kind: "pulsar", name: `PSR ${prefix}${String(rng.int(1000, 9999))}${rng.next() < 0.5 ? "+" : "-"}${rng.int(10, 89)} ${GREEK[i % GREEK.length]}`, position: pos, radius: 0.01, description: "A rapidly spinning neutron star sweeping beams of radiation across space like a lighthouse." });
    }
  }

  private sampleDiskPosition(rng: SeededRng): [number, number, number] {
    if (this.disk) {
      const r = this.disk.scaleLength * Math.abs(rng.gauss()) * 1.3 + this.disk.armStart * 0.5;
      const a = rng.range(0, TWO_PI);
      return [r * Math.cos(a), rng.gauss() * this.disk.scaleHeight, r * Math.sin(a)];
    }
    const r = this.radius * Math.abs(rng.gauss()) * 0.25;
    const d = this.randomDirection(rng);
    return [d[0] * r, d[1] * r * 0.6, d[2] * r];
  }
}
