// atlas-ui/react/static/js/Explore/galaxy/NeighborLayer.ts
//
// The cells of the universe grid around the camera, seen from the current galaxy. Each
// one is drawn as a distant galaxy of its real type and orientation, placed in the
// direction of its grid offset, about a million light years per cell.
//
// The neighbourhood streams: as the camera pans or backs out across the grid, the cells
// within `reach` of the camera's cell are fetched in batches and fade in, and the ones
// left behind are dropped.

import * as THREE from "three";
import { hashString, SeededRng } from "../core/hash.ts";
import type { Coordinates } from "../api.ts";

export interface NeighborGalaxy {
  coordinates: Coordinates;
  name: string;
  galaxy_type: string;
  num_systems: number;
}

export interface PlacedNeighbor extends NeighborGalaxy {
  position: THREE.Vector3; // galaxy frame of the current galaxy, ly
}

export type NeighborFetcher = (coordinates: Coordinates[]) => Promise<NeighborGalaxy[]>;

const TYPE_RADIUS: Record<string, number> = { Spiral: 45000, Elliptical: 50000, Dwarf: 7000 };
// Size of a cell of the universe grid, ly: about a million light years, as between real
// neighbouring galaxies. The same for every galaxy, so a dwarf looks small among its
// neighbours and a giant elliptical big
export const CELL_SPACING_LY = 24 * 45000;
const MAX_COORDINATE = 10_000_000;
// Server limit for one batch lookup
const BATCH = 216;
// Distinct drawings per galaxy type; each galaxy also gets its own orientation
const TEXTURE_VARIANTS = 4;
const FADE_IN_SECONDS = 0.8;

function galaxyTexture(type: string, seed: number): THREE.Texture {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const rng = new SeededRng(seed);
  const c = size / 2;
  ctx.globalCompositeOperation = "lighter";

  const blob = (x: number, y: number, r: number, color: string, alpha: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color.replace("ALPHA", String(alpha)));
    g.addColorStop(1, color.replace("ALPHA", "0"));
    ctx.fillStyle = g;
    ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };

  if (type === "Spiral") {
    blob(c, c, size * 0.42, "rgba(255,225,190,ALPHA)", 0.25);
    const arms = rng.int(2, 4);
    const pitch = rng.range(0.25, 0.4);
    for (let i = 0; i < 2600; i++) {
      const arm = i % arms;
      const t = Math.pow(rng.next(), 0.7);
      const radius = 8 + t * size * 0.44;
      const angle = (arm * Math.PI * 2) / arms + Math.log(radius / 8) / pitch + rng.gauss() * 0.22;
      const x = c + Math.cos(angle) * radius;
      const y = c + Math.sin(angle) * radius;
      blob(x, y, 3 + rng.next() * 5, t > 0.3 ? "rgba(150,180,255,ALPHA)" : "rgba(255,220,170,ALPHA)", 0.12);
    }
    blob(c, c, size * 0.12, "rgba(255,235,200,ALPHA)", 0.9);
  } else if (type === "Elliptical") {
    ctx.save();
    ctx.translate(c, c);
    ctx.scale(1, rng.range(0.55, 0.95));
    blob(0, 0, size * 0.48, "rgba(255,215,170,ALPHA)", 0.55);
    blob(0, 0, size * 0.18, "rgba(255,235,205,ALPHA)", 0.9);
    ctx.restore();
  } else {
    for (let i = 0; i < 9; i++) blob(c + rng.gauss() * size * 0.12, c + rng.gauss() * size * 0.08, size * rng.range(0.08, 0.2), "rgba(185,200,255,ALPHA)", 0.35);
    for (let i = 0; i < 300; i++) blob(c + rng.gauss() * size * 0.15, c + rng.gauss() * size * 0.1, 2.5, "rgba(220,230,255,ALPHA)", 0.25);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Where in its cell a galaxy sits (fraction of a cell on each axis). Jitter so the
// neighbourhood does not look like a lattice, but always inside its own cell. `rng` is
// left ready for the galaxy's other draws
function cellJitter(rng: SeededRng) {
  const jitter = () => THREE.MathUtils.clamp(rng.gauss() * 0.18, -0.35, 0.35);
  return new THREE.Vector3(jitter(), jitter(), jitter());
}

const neighborSeed = (coordinates: Coordinates) => hashString(`neighbor:${coordinates.join(",")}`);

// A galaxy's disk lies in the XZ plane of its own frame; the sprite is drawn in XY
const DISK_ORIENTATION = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 2);
const DEPART_FADE_SECONDS = 0.7;

interface Cell {
  state: "loading" | "ready" | "empty";
  mesh?: THREE.Mesh;
  neighbor?: PlacedNeighbor;
  born?: number; // seconds, for the fade in
  baseRadius?: number;
  baseOrientation?: THREE.Quaternion;
}

export class NeighborLayer {
  readonly root = new THREE.Group();
  readonly spacing = CELL_SPACING_LY;
  private center: Coordinates;
  private reach: number;
  private fetcher: NeighborFetcher;
  // Keyed by grid offset from the current galaxy, "dx,dy,dz"
  private cells = new Map<string, Cell>();
  private cameraCell: [number, number, number] | null = null;
  private textures = new Map<string, THREE.Texture>();
  private geometries = new Map<number, THREE.PlaneGeometry>();
  private disposed = false;
  private lattice!: THREE.LineSegments;
  private cell!: THREE.LineSegments;
  // The current galaxy sits at its own jittered spot of its cell; the frame is centred
  // on it, so every position here is shifted by that much (ly)
  private shift = new THREE.Vector3();
  // A neighbour turning into the galaxy we are jumping to: it settles into the disk's
  // orientation and real size as we approach
  private morphing: { key: string; amount: number; radius: number } | null = null;
  // The sprite of the galaxy we just arrived in, fading out as the real one appears
  private arrived: { cell: Cell; fadeFrom: number | null } | null = null;

  constructor(center: Coordinates, reach: number, fetcher: NeighborFetcher) {
    this.reach = Math.max(1, reach);
    this.fetcher = fetcher;
    this.center = center;
    this.setCenter(center);
    this.buildGrid();
  }

  private setCenter(center: Coordinates) {
    this.center = center;
    this.shift = cellJitter(new SeededRng(neighborSeed(center))).multiplyScalar(this.spacing);
    // The current galaxy is drawn by its own layer
    this.cells.set("0,0,0", { state: "empty" });
    this.cameraCell = null;
  }

  // The loaded neighbour at these coordinates, if any
  find(coordinates: Coordinates): PlacedNeighbor | null {
    return this.cells.get(coordinates.map((v, i) => v - this.center[i]).join(","))?.neighbor ?? null;
  }

  // Ease the sprite at `coordinates` (0..1) towards how the real galaxy will look:
  // disk-on orientation and its real radius
  morph(coordinates: Coordinates | null, amount = 0, radius = 0) {
    this.morphing = coordinates ? { key: coordinates.map((v, i) => v - this.center[i]).join(","), amount, radius } : null;
  }

  // The jump landed: the galaxy at `center` becomes the current one. The frame moves to
  // it (every position shifts by its old position), its sprite stays until
  // `releaseArrived()` and the galaxy we left becomes a neighbour like any other
  recenter(center: Coordinates) {
    const delta = center.map((v, i) => v - this.center[i]);
    const arrivedKey = delta.join(",");
    const arrived = this.cells.get(arrivedKey);
    const origin = arrived?.neighbor?.position.clone() ?? new THREE.Vector3();
    if (this.arrived) this.dropArrived();
    const cells = new Map<string, Cell>();
    for (const [key, entry] of this.cells) {
      if (key === arrivedKey || key === "0,0,0") continue;
      // Requests in flight answer for the old centre; they will be asked for again
      if (entry.state === "loading") continue;
      const offset = key.split(",").map((v, i) => Number(v) - delta[i]);
      entry.neighbor?.position.sub(origin);
      cells.set(offset.join(","), entry);
    }
    this.cells = cells;
    if (arrived?.neighbor) {
      arrived.neighbor.position.sub(origin);
      this.arrived = { cell: arrived, fadeFrom: null };
    }
    this.morphing = null;
    this.setCenter(center);
    return origin;
  }

  // The real galaxy is on screen: fade its stand-in out
  releaseArrived() {
    if (this.arrived && this.arrived.fadeFrom === null) this.arrived.fadeFrom = performance.now() / 1000;
  }

  private dropArrived() {
    if (!this.arrived) return;
    this.removeCell(this.arrived.cell);
    this.arrived = null;
  }

  // Galaxies currently loaded, nearest to `point` first
  nearest(point: THREE.Vector3, count: number): PlacedNeighbor[] {
    const list: PlacedNeighbor[] = [];
    for (const cell of this.cells.values()) if (cell.neighbor) list.push(cell.neighbor);
    return list.sort((a, b) => a.position.distanceToSquared(point) - b.position.distanceToSquared(point)).slice(0, count);
  }

  get loadedCount() {
    let n = 0;
    for (const cell of this.cells.values()) if (cell.neighbor) n++;
    return n;
  }

  // ---- streaming ------------------------------------------------------------------

  private refresh(cell: [number, number, number]) {
    const reach = this.reach;
    // Drop what is well behind, with a cell of slack so the edge does not flicker
    for (const [key, entry] of this.cells) {
      if (key === "0,0,0") continue;
      const [dx, dy, dz] = key.split(",").map(Number);
      if (Math.max(Math.abs(dx - cell[0]), Math.abs(dy - cell[1]), Math.abs(dz - cell[2])) <= reach + 1) continue;
      this.removeCell(entry);
      this.cells.delete(key);
    }

    // Ask for the missing cells, nearest first
    const missing: Array<{ key: string; offset: [number, number, number]; d: number }> = [];
    for (let x = -reach; x <= reach; x++)
      for (let y = -reach; y <= reach; y++)
        for (let z = -reach; z <= reach; z++) {
          const offset: [number, number, number] = [cell[0] + x, cell[1] + y, cell[2] + z];
          const key = offset.join(",");
          if (this.cells.has(key)) continue;
          const coords = offset.map((o, i) => this.center[i] + o);
          if (coords.some((v) => v < 0 || v > MAX_COORDINATE)) {
            this.cells.set(key, { state: "empty" });
            continue;
          }
          missing.push({ key, offset, d: x * x + y * y + z * z });
        }
    missing.sort((a, b) => a.d - b.d);
    for (let i = 0; i < missing.length; i += BATCH) this.fetchBatch(missing.slice(i, i + BATCH));
  }

  private async fetchBatch(batch: Array<{ key: string; offset: [number, number, number] }>) {
    const markers = new Map<string, Cell>();
    for (const { key } of batch) {
      const marker: Cell = { state: "loading" };
      this.cells.set(key, marker);
      markers.set(key, marker);
    }
    let galaxies: NeighborGalaxy[];
    try {
      galaxies = await this.fetcher(batch.map(({ offset }) => offset.map((o, i) => this.center[i] + o) as Coordinates));
    } catch {
      // Forget the markers so the cells are asked for again next time the camera moves
      for (const [key, marker] of markers) if (this.cells.get(key) === marker) this.cells.delete(key);
      return;
    }
    if (this.disposed) return;
    const byKey = new Map<string, NeighborGalaxy>();
    for (const galaxy of galaxies) byKey.set(galaxy.coordinates.map((v, i) => v - this.center[i]).join(","), galaxy);
    for (const [key, marker] of markers) {
      // Evicted while in flight
      if (this.cells.get(key) !== marker) continue;
      const galaxy = byKey.get(key);
      if (!galaxy || galaxy.num_systems <= 0) {
        marker.state = "empty";
        continue;
      }
      this.place(marker, galaxy);
    }
  }

  private place(cell: Cell, galaxy: NeighborGalaxy) {
    const offset = new THREE.Vector3(galaxy.coordinates[0] - this.center[0], galaxy.coordinates[1] - this.center[1], galaxy.coordinates[2] - this.center[2]);
    const seed = neighborSeed(galaxy.coordinates);
    const rng = new SeededRng(seed);
    const position = offset.add(cellJitter(rng)).multiplyScalar(this.spacing).sub(this.shift);
    const material = new THREE.MeshBasicMaterial({
      map: this.texture(galaxy.galaxy_type, seed),
      color: new THREE.Color(1, 1, 1).multiplyScalar(2.5),
      blending: THREE.AdditiveBlending,
      depthTest: false,
      depthWrite: false,
      transparent: true,
      opacity: 0,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const radius = TYPE_RADIUS[galaxy.galaxy_type] ?? 30000;
    const mesh = new THREE.Mesh(this.geometry(radius), material);
    mesh.rotation.set(rng.range(0, Math.PI), rng.range(0, Math.PI), rng.range(0, Math.PI));
    mesh.frustumCulled = false;
    this.root.add(mesh);
    cell.state = "ready";
    cell.mesh = mesh;
    cell.baseRadius = radius;
    cell.baseOrientation = mesh.quaternion.clone();
    cell.neighbor = { ...galaxy, position };
    cell.born = performance.now() / 1000;
  }

  private removeCell(cell: Cell) {
    if (!cell.mesh) return;
    this.root.remove(cell.mesh);
    (cell.mesh.material as THREE.Material).dispose();
  }

  private texture(type: string, seed: number) {
    const key = `${type}:${seed % TEXTURE_VARIANTS}`;
    let texture = this.textures.get(key);
    if (!texture) {
      texture = galaxyTexture(type, hashString(key));
      this.textures.set(key, texture);
    }
    return texture;
  }

  private geometry(radius: number) {
    let geometry = this.geometries.get(radius);
    if (!geometry) {
      geometry = new THREE.PlaneGeometry(radius * 2, radius * 2);
      this.geometries.set(radius, geometry);
    }
    return geometry;
  }

  // ---- grid -----------------------------------------------------------------------

  // The cube cells of the universe around the camera: a lattice as wide as what is
  // loaded, fading out towards its edge, and the current galaxy's cell outlined brighter.
  // The lattice is built around the camera's cell and rebuilt when it changes, clipped to
  // the bounds of the universe (0 to MAX_COORDINATE on each axis): past them there is
  // nothing, so no grid either.
  private buildGrid() {
    const spacing = this.spacing;
    const cell = new THREE.EdgesGeometry(new THREE.BoxGeometry(spacing, spacing, spacing));
    const material = (color: number, vertexColors: boolean) =>
      new THREE.LineBasicMaterial({ color, vertexColors, transparent: true, blending: THREE.AdditiveBlending, depthTest: false, depthWrite: false, toneMapped: false });
    this.lattice = new THREE.LineSegments(new THREE.BufferGeometry(), material(0x4a7fd0, true));
    this.cell = new THREE.LineSegments(cell, material(0x7fd8ff, false));
    for (const lines of [this.lattice, this.cell]) {
      lines.frustumCulled = false;
      lines.visible = false;
      this.root.add(lines);
    }
  }

  private rebuildLattice(cameraCell: [number, number, number]) {
    const spacing = this.spacing;
    const half = this.reach + 0.5;
    // Cell boundaries on each axis, relative to the camera's cell
    const ticks = cameraCell.map((c, axis) => {
      const lo = Math.max(-half, -this.center[axis] - c - 0.5);
      const hi = Math.min(half, MAX_COORDINATE - this.center[axis] - c + 0.5);
      const list: number[] = [];
      for (let t = -half; t <= half + 1e-6; t++) if (t >= lo - 1e-6 && t <= hi + 1e-6) list.push(t);
      return list;
    });
    const points: number[] = [];
    const colors: number[] = [];
    const shade = (p: number[]) => 1 - THREE.MathUtils.smoothstep(Math.hypot(p[0], p[1], p[2]), half * 0.45, half);
    const segment = (a: number[], b: number[]) => {
      points.push(a[0] * spacing, a[1] * spacing, a[2] * spacing, b[0] * spacing, b[1] * spacing, b[2] * spacing);
      const sa = shade(a);
      const sb = shade(b);
      colors.push(sa, sa, sa, sb, sb, sb);
    };
    // Lines along each axis, through every crossing of the other two
    for (let axis = 0; axis < 3; axis++) {
      const along = ticks[axis];
      const [u, v] = [(axis + 1) % 3, (axis + 2) % 3];
      for (const a of ticks[u])
        for (const b of ticks[v])
          for (let i = 0; i < along.length - 1; i++) {
            const p0 = [0, 0, 0];
            const p1 = [0, 0, 0];
            p0[axis] = along[i];
            p1[axis] = along[i + 1];
            p0[u] = p1[u] = a;
            p0[v] = p1[v] = b;
            segment(p0, p1);
          }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    this.lattice.geometry.dispose();
    this.lattice.geometry = geometry;
  }

  setGridVisible(visible: boolean) {
    this.lattice.visible = visible;
    this.cell.visible = visible;
  }

  // `exposure` is the deep sky exposure: the grid keeps the same on-screen brightness.
  // `gridFade` (0..1) lets the grid step back when the view is down among the stars
  update(cameraWorld: THREE.Vector3, exposure = 1, gridFade = 1) {
    const s = this.spacing;
    // Cell boundaries sit half a cell either side of the (unshifted) cell centres
    const cell: [number, number, number] = [Math.round((cameraWorld.x + this.shift.x) / s), Math.round((cameraWorld.y + this.shift.y) / s), Math.round((cameraWorld.z + this.shift.z) / s)];
    if (!this.cameraCell || cell.some((v, i) => v !== this.cameraCell![i])) {
      this.cameraCell = cell;
      this.refresh(cell);
      this.rebuildLattice(cell);
    }

    // Galaxies fade in when they arrive and out towards the edge of what is loaded
    const now = performance.now() / 1000;
    const edge = (this.reach + 0.5) * s;
    for (const [key, entry] of this.cells) {
      if (!entry.mesh || !entry.neighbor) continue;
      const p = entry.neighbor.position;
      entry.mesh.position.set(p.x - cameraWorld.x, p.y - cameraWorld.y, p.z - cameraWorld.z);
      const age = THREE.MathUtils.clamp((now - (entry.born ?? 0)) / FADE_IN_SECONDS, 0, 1);
      const far = 1 - THREE.MathUtils.smoothstep(p.distanceTo(cameraWorld), edge * 0.7, edge);
      let opacity = age * far;
      if (this.morphing?.key === key) {
        const m = this.morphing;
        entry.mesh.quaternion.slerpQuaternions(entry.baseOrientation!, DISK_ORIENTATION, m.amount);
        entry.mesh.scale.setScalar(THREE.MathUtils.lerp(1, m.radius / entry.baseRadius!, m.amount));
        // Never lost to the edge fade: it is where we are going
        opacity = Math.max(opacity, age * m.amount);
      } else if (entry.baseOrientation && entry.mesh.scale.x !== 1) {
        entry.mesh.quaternion.copy(entry.baseOrientation);
        entry.mesh.scale.setScalar(1);
      }
      (entry.mesh.material as THREE.MeshBasicMaterial).opacity = opacity;
      // Each galaxy is its own draw call: skip the ones that are not there to see (faded
      // out, or smaller than about half a pixel)
      const angular = ((entry.baseRadius ?? 30000) * entry.mesh.scale.x) / Math.max(1, p.distanceTo(cameraWorld));
      entry.mesh.visible = opacity > 0.004 && angular > 0.0006;
    }

    // The stand-in of the galaxy we arrived in, until the real one has taken over
    if (this.arrived?.cell.mesh) {
      const mesh = this.arrived.cell.mesh;
      mesh.position.copy(this.arrived.cell.neighbor!.position).sub(cameraWorld);
      const fade = this.arrived.fadeFrom === null ? 1 : 1 - (now - this.arrived.fadeFrom) / DEPART_FADE_SECONDS;
      if (fade <= 0) this.dropArrived();
      else (mesh.material as THREE.MeshBasicMaterial).opacity = fade;
    }

    if (this.lattice.visible) {
      const level = gridFade / Math.max(exposure, 1e-3);
      const c = this.cameraCell;
      this.lattice.position.set(c[0] * s - this.shift.x - cameraWorld.x, c[1] * s - this.shift.y - cameraWorld.y, c[2] * s - this.shift.z - cameraWorld.z);
      this.cell.position.set(-this.shift.x - cameraWorld.x, -this.shift.y - cameraWorld.y, -this.shift.z - cameraWorld.z);
      (this.lattice.material as THREE.LineBasicMaterial).opacity = Math.min(1, 0.22 * level);
      (this.cell.material as THREE.LineBasicMaterial).opacity = Math.min(1, 0.45 * level);
    }
  }

  dispose() {
    this.disposed = true;
    this.dropArrived();
    for (const entry of this.cells.values()) this.removeCell(entry);
    this.cells.clear();
    for (const texture of this.textures.values()) texture.dispose();
    for (const geometry of this.geometries.values()) geometry.dispose();
    for (const lines of [this.lattice, this.cell]) {
      lines.geometry.dispose();
      (lines.material as THREE.Material).dispose();
    }
    this.root.clear();
  }
}
