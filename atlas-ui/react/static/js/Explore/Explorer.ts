// atlas-ui/react/static/js/Explore/Explorer.ts
//
// The ship. You are always docked at some star system of some galaxy; the camera is
// the ship's view. Travelling is flying the camera through a stack of frames
//
//   galaxy (light years, origin = galactic center)
//     └─ system (astronomical units, origin = system barycenter)
//          └─ planet (planet radii: full planet renderer, effects and moons)
//
// Moving between frames never cuts: the navigator is re-expressed in the new units
// (Navigator.rebase) while the camera keeps flying.

import * as THREE from "three";
import { Engine } from "./engine/Engine.ts";
import { Navigator } from "./engine/Navigator.ts";
import { LabelLayer } from "./engine/Labels.ts";
import { GalaxyLayer, type PickedStar } from "./galaxy/GalaxyLayer.ts";
import { galaxyRadius, type GalaxyInfo, type PointOfInterest } from "./galaxy/GalaxyModel.ts";
import { SystemLayer, AU_PER_LY, type PlanetBody } from "./system/SystemLayer.ts";
import { PlanetFrame, type MoonInfo } from "./planet/PlanetFrame.ts";
import { ExoticLayer } from "./galaxy/ExoticLayer.ts";
import { CELL_SPACING_LY, NeighborLayer, type PlacedNeighbor } from "./galaxy/NeighborLayer.ts";
import { QUALITY_PROFILES, needsReload, saveQuality, type QualityLevel, type QualityProfile } from "./engine/Quality.ts";
import { hashString } from "./core/hash.ts";
import { getPlanetBaseColor } from "./planet/planetColors.ts";
import { ShipView } from "./engine/ShipView.ts";
import { loadViewOptions, saveViewOptions, type ViewOptions } from "./engine/ViewOptions.ts";
import { sfx } from "./audio/Sfx.ts";
import { COMFORT_EVENT, reducedFlashing } from "./core/comfort.ts";
import { composePhoto, photoOrigin, savePhoto, type PhotoPlace } from "./ui/photo.ts";
import { readUniverseConfig, stargatePath } from "./ui/universe.ts";
import { fetchGalaxy, fetchNeighbourGalaxies, fetchSystem, planetRenderingUrl, SystemDirectory, type Coordinates, type SystemSummary, type SystemDetail, type PlanetDetail, type StarInfo, type Timing } from "./api.ts";

export type Mode = "loading" | "galaxy" | "system";

export type Target = { kind: "system"; index: number; summary: SystemSummary | null; position: THREE.Vector3 | null } | { kind: "poi"; poi: PointOfInterest } | { kind: "planet"; planet: PlanetDetail } | { kind: "moon"; moon: MoonInfo } | { kind: "star"; index: number; star: StarInfo; name: string; temperature: number } | null;

export interface ShipLocation {
  coordinates: Coordinates;
  system: number;
  planet: number | null;
}

export interface NearbySystem {
  index: number;
  name: string;
  starType: string;
  planets: number;
  distance: string;
}

export interface ExplorerState {
  mode: Mode;
  status: string | null;
  error: string | null;
  coordinates: Coordinates | null;
  galaxy: GalaxyInfo | null;
  pois: PointOfInterest[];
  ship: ShipLocation | null;
  shipSystemName: string | null;
  target: Target;
  system: SystemDetail | null;
  orbiting: PlanetDetail | null;
  planetDetail: { loading: boolean; moons: number } | null;
  // Moons of the planet in orbit, and the one the ship is visiting
  moons: MoonInfo[];
  visitingMoon: MoonInfo | null;
  // speed in ly per second, remaining in ly (straight line to where the ship stops)
  travel: { label: string; progress: number; speed?: number; remaining?: number } | null;
  mapView: boolean;
  nearby: NearbySystem[];
  arrival: { name: string; type: string; systems: number } | null;
  timeScale: number;
  cosmicTime: number;
  // Seconds the simulated time has drifted from the real present (0 in real time)
  timeDrift: number;
  readout: { primary: string; secondary: string };
  quality: QualityLevel;
  view: ViewOptions;
  fps: number;
}

const BASE_FOV = 60;

// Entered well before the system shows (see SystemLayer.presenceAt) so it fades in
const ENTER_SYSTEM_LY = 0.08; // ~5000 AU
const EXIT_SYSTEM_AU = 9000;
const SYSTEM_ARRIVAL_AU = 60;
// Saved per universe: the multiverse can switch seeds and coordinates mean nothing across them
function universeKey(): string {
  try {
    const config = JSON.parse(document.getElementById("data-universe-config")?.textContent || "{}");
    return String(config.seed_str || config.seed_name || "local");
  } catch {
    return "local";
  }
}
const SHIP_STORAGE_KEY = `atlas-ship:${universeKey()}`;
const RECENT_STORAGE_KEY = `atlas-recent-galaxies:${universeKey()}`;

export function formatDistanceLy(ly: number): string {
  if (ly >= 1000) return `${(ly / 1000).toFixed(ly >= 10000 ? 0 : 1)} kly`;
  if (ly >= 1) return `${ly.toFixed(ly >= 100 ? 0 : 1)} ly`;
  const au = ly * AU_PER_LY;
  return au >= 1 ? `${au.toFixed(au >= 100 ? 0 : 1)} AU` : `${Math.round(au * 1.496e8).toLocaleString()} km`;
}

function formatDistanceAu(au: number): string {
  if (au >= 0.1) return `${au.toFixed(au >= 100 ? 0 : 2)} AU`;
  const km = au * 1.496e8;
  return km >= 1e6 ? `${(km / 1e6).toFixed(1)} M km` : `${Math.round(km).toLocaleString()} km`;
}

const pretty = (name: string) => name.replace(/_/g, " ");

export function loadStoredShip(): ShipLocation | null {
  try {
    const raw = localStorage.getItem(SHIP_STORAGE_KEY);
    if (!raw) return null;
    const ship = JSON.parse(raw);
    if (Array.isArray(ship.coordinates) && ship.coordinates.length === 3 && Number.isFinite(ship.system)) return ship;
  } catch {
    /* storage unavailable */
  }
  return null;
}

export function recentGalaxies(): Array<{ coordinates: Coordinates; name: string; type: string }> {
  try {
    return JSON.parse(localStorage.getItem(RECENT_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export class Explorer {
  state: ExplorerState = {
    mode: "loading",
    status: "Powering up the ship…",
    error: null,
    coordinates: null,
    galaxy: null,
    pois: [],
    ship: null,
    shipSystemName: null,
    target: null,
    system: null,
    orbiting: null,
    planetDetail: null,
    moons: [],
    visitingMoon: null,
    travel: null,
    mapView: false,
    nearby: [],
    arrival: null,
    timeScale: 1,
    cosmicTime: 0,
    timeDrift: 0,
    readout: { primary: "", secondary: "" },
    quality: "medium",
    view: loadViewOptions(),
    fps: 0,
  };

  private listeners = new Set<() => void>();
  private engine: Engine;
  private navigator: Navigator;
  private labels: LabelLayer;
  private galaxy: GalaxyLayer | null = null;
  private directory: SystemDirectory | null = null;
  private systemLayer: SystemLayer | null = null;
  private systemPosition: THREE.Vector3 | null = null; // galaxy frame (ly) of the loaded system
  private planetFrame: PlanetFrame | null = null;
  // Planet the frame draws; it outlives `orbiting` while the ship pulls away
  private framePlanet: number | null = null;
  // The planet we flew away from to another one, kept detailed while it recedes
  private departingFrame: { frame: PlanetFrame; index: number } | null = null;
  private pendingSystem: Promise<{ system: SystemDetail; timing: Timing }> | null = null;
  private pendingPlanet: number | null = null;
  private travelIndex: number | null = null; // travel requested, exact position still being located
  private destination: { index: number; position: THREE.Vector3 } | null = null; // system we are flying to
  private shipPosition: THREE.Vector3 | null = null; // galaxy frame (ly) of the docked system
  private hover: PickedStar | null = null;
  private hoverPlanet: PlanetBody | null = null;
  private pointer: { x: number; y: number } | null = null;
  private lastLabelRefresh = 0;
  private lastNearbyRefresh = 0;
  private nearbyStars: Array<{ index: number; position: THREE.Vector3 }> = [];
  private cameraWorld = new THREE.Vector3(); // galaxy frame, ly
  private cameraLocal = new THREE.Vector3(); // current navigator frame
  private forward = new THREE.Vector3();
  private quaternion = new THREE.Quaternion();
  private lastEmit = 0;
  private lastExposureMeasure = 0;
  private disposeFrame: () => void;
  private loadToken = 0;
  private arrivalTimer: ReturnType<typeof setTimeout> | null = null;
  private warpBurst = 0;
  private warpFov = 0;
  private driveStart: number | null = null;
  // Ship speed for the flight HUD (ly per real second, smoothed)
  private lastCameraWorld: THREE.Vector3 | null = null;
  private speed = 0;
  private quality: QualityProfile;
  private exotics: ExoticLayer | null = null;
  private neighbors: NeighborLayer | null = null;
  // A hyperjump in flight to a neighbouring galaxy (galaxy frame, ly)
  private jump: { coordinates: Coordinates; position: THREE.Vector3; radius: number; distance: number } | null = null;
  // The hyperjump on screen (seconds, performance clock): the drive charges until
  // `enterAt`, the ship rides the tunnel until `exitAt` is set and reached
  private jumpFx: { start: number; enterAt: number; exitAt: number | null; entered: boolean; exited: boolean; quietEntry: boolean } | null = null;
  private pointerMoved = false;
  private lastHoverPick = 0;
  private shipView: ShipView;
  private lastYaw = 0;
  private lastPitch = 0;
  private shipFloor = 1;
  private lastFloorMeasure = 0;

  constructor(container: HTMLElement, quality: QualityProfile) {
    this.quality = quality;
    this.state = { ...this.state, quality: quality.level };
    this.engine = new Engine(container, quality);
    this.shipView = new ShipView(this.engine.renderer, this.state.view.ship);
    this.labels = new LabelLayer(container, this.engine.renderer.domElement);
    this.navigator = new Navigator({
      onClick: (x, y) => this.handleClick(x, y),
      onHover: (x, y) => {
        this.pointer = { x, y };
        this.pointerMoved = true;
      },
      rayAt: (x, y) => this.engine.rayDirection(x, y, new THREE.Vector3()),
      onUserMove: () => this.cancelArrival(),
      onDoubleClick: (x, y) => this.handleDoubleClick(x, y),
    });
    this.navigator.attach(this.engine.renderer.domElement);
    // The HUD lives next to the canvas, in the same full-screen root
    this.navigator.attachOverlay(container.parentElement ?? container);
    this.engine.renderer.domElement.addEventListener("pointerleave", () => (this.pointer = null));
    window.addEventListener("keydown", this.handleKey);
    this.disposeFrame = this.engine.onFrame((dt) => this.frame(dt));
    this.engine.start();
    sfx.setEnabled(this.state.view.soundEffects);
    this.engine.calm = reducedFlashing();
    window.addEventListener(COMFORT_EVENT, this.onComfort);
  }

  private onComfort = () => {
    this.engine.calm = reducedFlashing();
  };

  // ---- state plumbing -------------------------------------------------------------

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  getState = () => this.state;

  private setState(patch: Partial<ExplorerState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }

  private dockShip(system: number, planet: number | null, name: string | null) {
    if (!this.state.coordinates) return;
    const ship: ShipLocation = { coordinates: this.state.coordinates, system, planet };
    try {
      localStorage.setItem(SHIP_STORAGE_KEY, JSON.stringify(ship));
    } catch {
      /* storage unavailable */
    }
    this.setState({ ship, shipSystemName: name ?? this.state.shipSystemName });
  }

  private rememberGalaxy(galaxy: GalaxyInfo) {
    try {
      const list = recentGalaxies().filter((g) => g.coordinates.join(",") !== galaxy.coordinates.join(","));
      list.unshift({ coordinates: galaxy.coordinates, name: galaxy.name, type: galaxy.galaxy_type });
      localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(list.slice(0, 8)));
    } catch {
      /* storage unavailable */
    }
  }

  // ---- arriving in a galaxy -------------------------------------------------------

  // Far enough to see the neighbouring galaxies around this one, and a few cells of the
  // grid beyond (more of them stream in with the quality)
  private galaxyMaxDistance(radius: number) {
    return Math.max(radius * 16, CELL_SPACING_LY * (0.4 + 0.4 * this.quality.galaxyReach));
  }

  // The neighbourhood streams in by itself as the camera moves across the grid; it is
  // decoration, the galaxy works without it
  private loadNeighbors(center: Coordinates) {
    this.neighbors = new NeighborLayer(center, this.quality.galaxyReach, fetchNeighbourGalaxies);
    this.neighbors.setGridVisible(this.state.view.universeGrid);
    this.engine.deepScene.add(this.neighbors.root);
  }

  private disposeExtras(keepNeighbors = false) {
    if (this.exotics) {
      this.engine.deepScene.remove(this.exotics.root);
      this.exotics.dispose();
      this.exotics = null;
    }
    if (this.neighbors && !keepNeighbors) {
      this.engine.deepScene.remove(this.neighbors.root);
      this.neighbors.dispose();
      this.neighbors = null;
    }
    this.engine.setLenses([]);
  }

  // Every galaxy has a deterministic arrival system for jumps that do not name one
  private arrivalSystem(galaxy: GalaxyInfo) {
    return hashString(`arrival:${galaxy.coordinates.join(",")}`) % Math.max(1, galaxy.num_systems);
  }

  // `seamless`: we flew up to this galaxy's stand-in in the neighbourhood and are now
  // in front of it; the frame moves onto it without cutting away
  async loadGalaxy(coordinates: Coordinates, focus: { system?: number | null; planet?: number | null } = {}, seamless: { info: GalaxyInfo } | null = null) {
    const token = ++this.loadToken;
    this.lastCameraWorld = null;
    this.jump = null;
    this.leaveSystem(true);
    this.galaxy?.dispose();
    if (this.galaxy) this.engine.deepScene.remove(this.galaxy.root);
    this.galaxy = null;
    const keepNeighbors = !!seamless && !!this.neighbors;
    this.disposeExtras(keepNeighbors);
    if (keepNeighbors) this.navigator.rebase(this.neighbors!.recenter(coordinates), 1);
    this.shipPosition = null;
    this.destination = null;
    this.labels.removeWhere(() => true);
    if (this.arrivalTimer) clearTimeout(this.arrivalTimer);
    this.setState({ mode: "loading", status: keepNeighbors ? null : "Dropping out of hyperspace…", error: null, coordinates, target: null, system: null, orbiting: null, planetDetail: null, moons: [], visitingMoon: null, pois: [], nearby: [], arrival: null, travel: null });

    try {
      const galaxy = seamless?.info ?? (await fetchGalaxy(coordinates)).galaxy;
      if (token !== this.loadToken) return;
      this.directory = new SystemDirectory(coordinates);
      this.rememberGalaxy(galaxy);
      this.setState({ galaxy, status: galaxy.num_systems > 0 && !keepNeighbors ? "Charting the galaxy…" : null });

      const shipSystem = galaxy.num_systems > 0 ? (focus.system != null && focus.system < galaxy.num_systems ? focus.system : this.arrivalSystem(galaxy)) : null;

      const layer = new GalaxyLayer(galaxy, {
        onReady: (pois, radius) => {
          if (token !== this.loadToken) return;
          this.setState({ pois, arrival: { name: pretty(galaxy.name), type: galaxy.galaxy_type, systems: galaxy.num_systems } });
          this.exotics = new ExoticLayer(pois, radius, galaxy.galaxy_type === "Singularity Void" ? "Void" : galaxy.galaxy_type, galaxy.quasars > 0);
          this.engine.deepScene.add(this.exotics.root);
          this.navigator.minDistance = 0.004;
          this.navigator.maxDistance = this.galaxyMaxDistance(radius);
          if (keepNeighbors && this.neighbors) {
            // Already looking at it from where the jump left us: just glide in
            this.navigator.flyTo(new THREE.Vector3(), radius * 2.3, { duration: 3.6, pitch: 0.55, yaw: this.navigator.yaw + 0.4 });
          } else {
            this.loadNeighbors(coordinates);
            this.navigator.focus.set(0, 0, 0);
            this.navigator.yaw = 0.5;
            this.navigator.pitch = 0.75;
            this.navigator.setDistance(radius * 7);
            this.navigator.flyTo(new THREE.Vector3(), radius * 2.3, { duration: 3.2, pitch: 0.55, yaw: 0.9 });
          }

          if (shipSystem !== null) {
            this.dockShip(shipSystem, focus.planet ?? null, null);
            layer.locate(shipSystem).then((position) => {
              if (token !== this.loadToken) return;
              this.shipPosition = position;
              this.directory?.get(shipSystem).then((s) => s && this.setState({ shipSystemName: pretty(s.name) }));
            });
            // Admire the galaxy for a moment, then descend to where the ship is
            this.arrivalTimer = setTimeout(() => {
              if (token !== this.loadToken) return;
              this.setState({ arrival: null });
              this.travelToSystem(shipSystem, focus.planet ?? null);
            }, 4200);
          }
        },
        onLod: () => {
          if (token !== this.loadToken) return;
          // The real galaxy is drawing: its stand-in can go
          this.neighbors?.releaseArrived();
          if (this.state.mode === "loading") {
            this.setState({ mode: "galaxy", status: null });
            // Something to drop out of hyperspace into
            this.endJump();
          }
        },
      });
      layer.setBudget(this.quality);
      this.galaxy = layer;
      this.engine.deepScene.add(layer.root);
      if (galaxy.num_systems === 0) {
        this.setState({ mode: "galaxy", status: null, arrival: { name: pretty(galaxy.name), type: galaxy.galaxy_type, systems: 0 } });
        this.endJump();
      }
    } catch (error) {
      if (token !== this.loadToken) return;
      this.setState({ error: error instanceof Error ? error.message : String(error), status: null });
      this.endJump();
    }
  }

  // ---- the hyperjump --------------------------------------------------------------

  // Spin the drive up for `charge` seconds, then punch into hyperspace; the tunnel holds
  // until endJump(). `quietEntry`: the punch is already sounding (the front door)
  private startJump(charge: number, quietEntry = false) {
    const now = performance.now() / 1000;
    this.jumpFx = { start: now, enterAt: now + charge, exitAt: null, entered: false, exited: false, quietEntry };
    if (charge > 0.05) sfx.hyperCharge(charge);
  }

  // Drop out of hyperspace, after a minimum ride so the tunnel is seen
  private endJump() {
    const fx = this.jumpFx;
    if (!fx || fx.exitAt !== null) return;
    fx.exitAt = Math.max(performance.now() / 1000, fx.enterAt + 1.4);
  }

  // Straight into hyperspace (diving in from the front door): out once the galaxy draws
  jumpIn() {
    this.startJump(0, true);
  }

  // Spin the jump drive up and hold it (crossing to another universe of the multiverse:
  // the page is about to be replaced, so it never spins down)
  engageDrive() {
    this.driveStart = performance.now();
    this.cancelArrival();
    sfx.hyperCharge(2.2);
  }

  hyperjump(coordinates: Coordinates, system: number | null = null, planet: number | null = null) {
    // A neighbour we can see: fly there for real
    const neighbor = this.state.mode === "galaxy" && !this.systemLayer ? this.neighbors?.find(coordinates) : null;
    if (neighbor) {
      this.jumpToNeighbor(neighbor, system, planet);
      return;
    }
    // Anywhere else: charge, into hyperspace, and out in front of the new galaxy
    this.setState({ travel: { label: `Hyperjump to ${coordinates.join(", ")}`, progress: 0 }, arrival: null });
    this.startJump(1.1);
    setTimeout(() => this.loadGalaxy(coordinates, { system, planet }), 1300);
  }

  // A saved place: in this galaxy the ship flies there, anywhere else it jumps. Older
  // places name their planet instead of numbering it: looked up in its system first
  async goToPlace(coordinates: Coordinates, system: number | null, planet: number | null, planetName: string | null = null) {
    if (planet === null && planetName && system !== null) {
      try {
        const { system: detail } = await fetchSystem(coordinates, system);
        planet = detail.planets.find((p) => p.name.toLowerCase() === planetName.toLowerCase())?.index ?? null;
      } catch {
        /* the system alone, then */
      }
    }
    const here = !!this.galaxy && this.state.coordinates?.join(",") === coordinates.join(",");
    if (!here) {
      this.hyperjump(coordinates, system, planet);
      return;
    }
    if (system === null) this.openMap();
    else if (planet !== null && this.systemLayer?.system.index === system) this.focusPlanet(planet);
    else this.travelToSystem(system, planet);
  }

  // Turn towards the neighbour, cross the intergalactic gap nose first and stop in front
  // of it, at the distance the galaxy view starts from. On the way its stand-in settles
  // into the real galaxy's size and orientation, so the swap is invisible
  private async jumpToNeighbor(neighbor: PlacedNeighbor, system: number | null, planet: number | null = null) {
    const token = ++this.loadToken;
    this.cancelArrival();
    this.setState({ target: null, arrival: null, travel: { label: `Hyperjump to ${pretty(neighbor.name)}`, progress: 0 } });
    let info: GalaxyInfo;
    try {
      info = (await fetchGalaxy(neighbor.coordinates)).galaxy;
    } catch {
      if (token === this.loadToken) this.loadGalaxy(neighbor.coordinates, { system, planet });
      return;
    }
    if (token !== this.loadToken) return;
    const radius = galaxyRadius(info);
    const distance = radius * 7;
    const position = neighbor.position.clone();
    this.navigator.maxDistance = Math.max(this.navigator.maxDistance, distance);
    // The drive charges, then the ship crosses the gap inside the tunnel, the galaxy
    // growing in its clear eye
    const charge = 1.0;
    this.startJump(charge);
    setTimeout(() => {
      if (token !== this.loadToken) return;
      this.jump = { coordinates: neighbor.coordinates, position, radius, distance };
      this.navigator.flyTo(position, distance, {
        duration: 4,
        onArrive: () => {
          if (token === this.loadToken && this.jump) {
            this.endJump();
            this.loadGalaxy(neighbor.coordinates, { system, planet }, { info });
          }
        },
      });
    }, charge * 1000);
  }

  // ---- targets and travel ---------------------------------------------------------

  async selectSystem(index: number, approximate: THREE.Vector3 | null = null) {
    if (!this.galaxy || !this.directory) return;
    if (this.travelIndex === null) {
      this.cancelArrival();
      sfx.select("star");
    }
    this.setState({ target: { kind: "system", index, summary: this.directory.peek(index) ?? null, position: approximate } });
    const [summary, exact] = await Promise.all([this.directory.get(index), this.galaxy.locate(index)]);
    const target = this.state.target;
    if (target?.kind !== "system" || target.index !== index) return;
    if (summary?.stars[0]) this.galaxy.setRealStarType(index, summary.stars[0].Type);
    this.galaxy.setHighlight(exact);
    this.setState({ target: { kind: "system", index, summary, position: exact } });
  }

  engage() {
    const target = this.state.target;
    if (target?.kind === "system") this.travelToSystem(target.index);
    else if (target?.kind === "poi") this.flyToPoi(target.poi);
    else if (target?.kind === "planet") this.focusPlanet(target.planet.index);
    else if (target?.kind === "moon") this.focusMoon(target.moon.name);
    else if (target?.kind === "star") this.focusStar(target.index);
  }

  // A star of the system we are in, as a target
  selectStar(index: number) {
    const layer = this.systemLayer;
    const star = layer?.stars[index];
    if (!layer || !star) return;
    const letter = layer.stars.length > 1 ? ` ${String.fromCharCode(65 + index)}` : "";
    this.systemLayer?.setSelectedPlanet(null);
    this.setState({ target: { kind: "star", index, star: star.info, name: `${pretty(layer.system.name)}${letter}`, temperature: star.look.temperature } });
    sfx.select("star");
  }

  // Close to a star, on its lit side: near enough to see its surface boil
  focusStar(index: number) {
    const layer = this.systemLayer;
    const star = layer?.stars[index];
    if (!layer || !star) return;
    if (this.state.target?.kind !== "star" || this.state.target.index !== index) this.selectStar(index);
    // Leaving a planet's orbit for the star
    if (this.state.orbiting) {
      this.planetFrame?.setFocusMoon(null);
      this.setState({ orbiting: null, planetDetail: null, moons: [], visitingMoon: null });
    }
    this.navigator.follow = null;
    this.navigator.minDistance = star.radius * 1.25;
    sfx.approach();
    this.navigator.flyTo(star.offset.clone(), star.radius * 4.5, { pitch: 0.25 });
  }

  async travelToSystem(index: number, planetIndex: number | null = null) {
    if (!this.galaxy || !this.state.coordinates) return;
    if (this.systemLayer && this.systemLayer.system.index === index) {
      if (planetIndex != null) this.focusPlanet(planetIndex);
      else this.navigator.flyTo(new THREE.Vector3(), Math.max(this.systemLayer.outerRadius * 2.6, 3));
      return;
    }
    if (this.systemLayer) this.leaveSystem(false);

    this.travelIndex = index;
    await this.selectSystem(index);
    this.travelIndex = null;
    const target = this.state.target;
    if (target?.kind !== "system" || target.index !== index || !target.position) return;

    this.destination = { index, position: target.position.clone() };
    this.pendingSystem = fetchSystem(this.state.coordinates, index);
    this.pendingPlanet = planetIndex;
    this.navigator.follow = null;
    this.navigator.minDistance = (SYSTEM_ARRIVAL_AU * 0.5) / AU_PER_LY;
    const name = target.summary ? pretty(target.summary.name) : `system #${index.toLocaleString()}`;
    this.setState({ travel: { label: `Travelling to ${name}`, progress: 0 }, arrival: null });
    sfx.depart();
    this.navigator.flyTo(target.position, SYSTEM_ARRIVAL_AU / AU_PER_LY, { pitch: 0.35 });
  }

  // The user took the controls: forget the automatic descent of the arrival sequence
  private cancelArrival() {
    if (this.arrivalTimer) {
      clearTimeout(this.arrivalTimer);
      this.arrivalTimer = null;
    }
    if (this.state.arrival) this.setState({ arrival: null });
  }

  flyToPoi(poi: PointOfInterest) {
    this.cancelArrival();
    if (this.state.mode === "system") this.leaveSystem(false);
    this.destination = null;
    this.navigator.follow = null;
    this.galaxy?.setHighlight(null);
    this.setState({ target: { kind: "poi", poi }, arrival: null, travel: { label: `Heading to ${poi.name}`, progress: 0 } });
    sfx.depart();
    this.navigator.flyTo(new THREE.Vector3(...poi.position), this.exotics?.approachDistance(poi) ?? Math.max(poi.radius * 3.5, 0.5));
  }

  focusPlanet(planetIndex: number) {
    const layer = this.systemLayer;
    if (!layer || !this.state.coordinates || !this.systemPosition) return;
    const body = layer.planet(planetIndex);
    if (!body) return;
    layer.setSelectedPlanet(planetIndex);

    if (this.departingFrame?.index === planetIndex) {
      // Turning back to the planet we were flying away from: bring its frame back
      const back = this.departingFrame;
      this.departingFrame = null;
      if (this.planetFrame && this.framePlanet !== null) this.departingFrame = { frame: this.planetFrame, index: this.framePlanet };
      this.planetFrame = back.frame;
      this.framePlanet = back.index;
    }
    if (!this.planetFrame || this.framePlanet !== planetIndex) {
      // The planet being left keeps its full detail while it recedes
      if (this.planetFrame && this.framePlanet !== null) {
        this.departingFrame?.frame.dispose();
        this.departingFrame = { frame: this.planetFrame, index: this.framePlanet };
        this.planetFrame = null;
      }
      this.framePlanet = planetIndex;
      const frame = new PlanetFrame({
        dataUrl: planetRenderingUrl(this.state.coordinates, layer.system.index, planetIndex),
        stars: layer.system.stars,
        starOffsets: layer.starOffsets,
        visualRadiusAU: body.radius,
        maxOrbitalRadius: layer.system.max_orbital_radius,
        timing: { cosmic_origin_time: layer.timing.cosmic_origin_time, current_time: layer.timing.current_time },
        maxOctaves: this.quality.planetDetail,      });
      this.planetFrame = frame;
      this.setState({ planetDetail: { loading: true, moons: 0 }, moons: [] });
      frame.load().then(() => {
        if (this.planetFrame === frame && this.state.orbiting?.index === planetIndex) this.setState({ planetDetail: { loading: false, moons: frame.moonCount }, moons: frame.moons });
      });
    } else {
      // Turning back to the planet we were just leaving: its frame is still live
      const frame = this.planetFrame;
      this.setState({ planetDetail: { loading: !frame.ready, moons: frame.moonCount }, moons: frame.moons });
    }
    this.planetFrame?.setFocusMoon(null);
    this.setState({ visitingMoon: null });

    this.setState({ target: { kind: "planet", planet: body.data }, orbiting: body.data, travel: { label: `Approaching ${pretty(body.data.name)}`, progress: 0 } });
    this.dockShip(layer.system.index, planetIndex, pretty(layer.system.name));
    this.navigator.minDistance = body.radius * 1.12;
    this.navigator.follow = null;
    const track = () => layer.planetPosition(planetIndex);
    sfx.approach();
    this.navigator.flyTo(body.position.clone(), body.radius * 6, {
      track,
      onArrive: () => {
        this.navigator.follow = track;
        sfx.orbit();
      },
    });
  }

  // A moon of the planet in orbit, in the system frame (AU); null until the frame has it
  private moonWorld(name: string, out = new THREE.Vector3()): THREE.Vector3 | null {
    const layer = this.systemLayer;
    const frame = this.planetFrame;
    const orbiting = this.state.orbiting;
    if (!layer || !frame || !orbiting) return null;
    const planet = layer.planetPosition(orbiting.index);
    const offset = frame.moonOffsetAU(name, out);
    return planet && offset ? offset.add(planet) : null;
  }

  selectMoon(name: string) {
    const moon = this.state.moons.find((m) => m.name === name);
    if (moon) {
      this.setState({ target: { kind: "moon", moon } });
      sfx.select("moon");
    }
  }

  // Leave the planet's orbit for one of its moons: fly there and keep up with it
  focusMoon(name: string) {
    const frame = this.planetFrame;
    const moon = this.state.moons.find((m) => m.name === name);
    const start = this.moonWorld(name);
    if (!frame || !moon || !start) return;
    const radius = frame.moonRadiusAU(name);
    frame.setFocusMoon(name);
    this.navigator.follow = null;
    this.navigator.minDistance = radius * 1.15;
    const track = () => this.moonWorld(name);
    this.setState({ target: { kind: "moon", moon }, visitingMoon: moon, travel: { label: `Approaching ${pretty(moon.name)}`, progress: 0 } });
    // Arrive on the day side with the light raking in from the side (the star, at the
    // system's centre, ~55° off the line of sight): craters and ridges cast shadows,
    // as in probe photographs, and the terminator stays in view
    const toStar = start.clone().negate().normalize();
    const yaw = Math.atan2(toStar.x, toStar.z) + 0.95;
    const pitch = THREE.MathUtils.clamp(Math.asin(toStar.y) + 0.2, -1.2, 1.2);
    sfx.approach();
    this.navigator.flyTo(start, radius * 5, {
      yaw,
      pitch,
      track,
      onArrive: () => {
        this.navigator.follow = track;
        sfx.orbit();
      },
    });
  }

  private closePlanetFrame() {
    this.disposeCurrentFrame();
    this.departingFrame?.frame.dispose();
    this.departingFrame = null;
    this.engine.planetPasses = [];
    this.systemLayer?.setDetailed([]);
    this.setState({ orbiting: null, planetDetail: null, moons: [], visitingMoon: null });
  }

  private disposeCurrentFrame() {
    this.planetFrame?.dispose();
    this.planetFrame = null;
    this.framePlanet = null;
  }

  openMap() {
    if (!this.galaxy) return;
    this.cancelArrival();
    if (this.state.mode === "system" && this.systemLayer) {
      this.closePlanetFrame();
      this.leaveSystem(false);
    }
    this.galaxy.setHighlight(this.shipPosition);
    this.setState({ target: null, arrival: null });
    this.navigator.follow = null;
    sfx.depart(0.7);
    this.navigator.flyTo(new THREE.Vector3(), this.galaxy.radius * 2.3, { pitch: 0.6, duration: 3.5 });
  }

  // ---- photos ---------------------------------------------------------------------

  // A photo of what is on screen, as a PNG at the screen's resolution: the frame without
  // the ship, the universe grid, the orbits or the highlight (the HUD is HTML and never
  // in it), stamped with where it was taken and a QR code to fly there
  // `onShot` runs the moment the frame is taken (for the flash), before it is saved
  async takePhoto(onShot?: () => void): Promise<boolean> {
    const coordinates = this.state.coordinates;
    if (this.state.mode === "loading" || !coordinates || !this.galaxy) return false;
    const grid = this.state.view.universeGrid;
    this.neighbors?.setGridVisible(false);
    this.systemLayer?.setOrbitsVisible(false);
    this.galaxy.hideHighlightOnce();
    let frame: HTMLCanvasElement;
    try {
      frame = this.engine.snapshot();
    } finally {
      this.neighbors?.setGridVisible(grid);
      this.systemLayer?.setOrbitsVisible(true);
    }
    sfx.shutter();
    onShot?.();
    const place = this.photoPlace(coordinates);
    const blob = await composePhoto(frame, place);
    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const slug = place.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "space";
    await savePhoto(blob, `atlas-${slug}-${stamp}.png`);
    return true;
  }

  // What the photo shows, from the deepest place in view outwards, and the gate to it
  private photoPlace(coordinates: Coordinates): PhotoPlace {
    const galaxy = this.state.galaxy ? pretty(this.state.galaxy.name) : "Galaxy";
    const galaxyLine = `${galaxy} · ${coordinates.join(", ")}`;
    const system = this.state.mode === "system" ? this.state.system : null;
    const planet = system ? this.state.orbiting : null;
    const moon = planet ? this.state.visitingMoon : null;
    const systemLine = system ? `${pretty(system.name)} · system #${system.index.toLocaleString("en")}` : null;
    const remote = !!readUniverseConfig()?.remote;
    // Gates reach galaxies, systems and planets (a moon's photo opens on its planet)
    const url = remote ? null : `${photoOrigin()}${stargatePath(coordinates, system?.index ?? null, planet?.name ?? null)}`;
    if (moon && planet) return { title: pretty(moon.name), kind: "Moon", lines: [`${pretty(planet.name)} · ${pretty(planet.planet_type)}`, systemLine!, galaxyLine], url };
    if (planet) return { title: pretty(planet.name), kind: `${pretty(planet.planet_type)} planet`, lines: [systemLine!, galaxyLine], url };
    if (system) return { title: pretty(system.name), kind: "Star system", lines: [galaxyLine], url };
    return { title: galaxy, kind: this.state.galaxy ? `${this.state.galaxy.galaxy_type} galaxy` : "Galaxy", lines: [coordinates.join(", ")], url };
  }

  returnToShip() {
    const ship = this.state.ship;
    if (ship) this.travelToSystem(ship.system, ship.planet);
  }

  goUp() {
    if (this.state.mode === "system" && this.systemLayer) {
      if (this.state.visitingMoon && this.state.orbiting) {
        // From a moon, back to the planet it circles
        this.focusPlanet(this.state.orbiting.index);
        return;
      }
      if (this.state.orbiting) {
        // The detailed planet stays up while it recedes and steps aside once it is a
        // speck (see updatePlanetFrame), so it never pops into the plain sphere
        this.planetFrame?.setFocusMoon(null);
        this.setState({ orbiting: null, planetDetail: null, moons: [], visitingMoon: null });
        this.systemLayer.setSelectedPlanet(null);
        this.navigator.follow = null;
        this.navigator.minDistance = 1e-4;
        this.dockShip(this.systemLayer.system.index, null, pretty(this.systemLayer.system.name));
        this.setState({ target: null });
        sfx.approach();
        this.navigator.flyTo(new THREE.Vector3(), this.systemLayer.outerRadius * 2.6);
        return;
      }
      this.openMap();
      return;
    }
    if (this.state.mode === "galaxy") {
      if (this.state.target) {
        this.galaxy?.setHighlight(this.shipPosition);
        this.setState({ target: null });
      } else this.openMap();
    }
  }

  setTimeScale(scale: number) {
    if (this.systemLayer) this.systemLayer.timeScale = scale;
    this.setState({ timeScale: scale });
  }

  // Back to the present, running in real time
  resetTime() {
    this.systemLayer?.resetTime();
    this.setTimeScale(1);
    this.setState({ timeDrift: 0, cosmicTime: this.systemLayer?.cosmicNow ?? Date.now() / 1000 });
  }

  // Returns true when the change needs a page reload (new WebGL context)
  setQuality(level: QualityLevel): boolean {
    const next = QUALITY_PROFILES[level];
    saveQuality(level);
    if (needsReload(this.quality, next)) return true;
    const reachChanged = next.galaxyReach !== this.quality.galaxyReach;
    this.quality = next;
    this.engine.applyQuality(next);
    this.galaxy?.setBudget(next);
    if (reachChanged && this.neighbors && this.galaxy && this.state.coordinates) {
      this.engine.deepScene.remove(this.neighbors.root);
      this.neighbors.dispose();
      this.loadNeighbors(this.state.coordinates);
      if (!this.systemLayer) this.navigator.maxDistance = this.galaxyMaxDistance(this.galaxy.radius);
    }
    this.labels.removeWhere((id) => id.startsWith("star:"));
    this.setState({ quality: level });
    return false;
  }

  setViewOption<K extends keyof ViewOptions>(key: K, value: ViewOptions[K]) {
    const view = { ...this.state.view, [key]: value };
    saveViewOptions(view);
    this.neighbors?.setGridVisible(view.universeGrid);
    sfx.setEnabled(view.soundEffects);
    this.shipView.setKind(view.ship);
    this.setState({ view });
  }

  clearTarget() {
    if (this.state.target && this.state.target.kind !== "planet" && this.state.target.kind !== "moon") sfx.deselect();
    this.galaxy?.setHighlight(this.shipPosition);
    // In orbit the highlighted orbit goes back to the planet we are circling
    if (this.state.target?.kind === "planet") this.systemLayer?.setSelectedPlanet(this.state.orbiting?.index ?? null);
    // Back to where we are: the moon we visit, or the planet we orbit
    if (this.state.visitingMoon) this.setState({ target: { kind: "moon", moon: this.state.visitingMoon } });
    else this.setState({ target: this.state.orbiting ? { kind: "planet", planet: this.state.orbiting } : null });
  }

  // Back to the view of the whole system (from orbit, or from anywhere inside it)
  viewSystem() {
    const layer = this.systemLayer;
    if (!layer) return;
    if (this.state.orbiting) {
      this.goUp();
      return;
    }
    this.navigator.follow = null;
    this.navigator.flyTo(new THREE.Vector3(), Math.max(layer.outerRadius * 2.6, 3));
  }

  // ---- frame switching ------------------------------------------------------------

  private async enterSystem() {
    if (!this.pendingSystem || !this.destination || !this.galaxy) return;
    const request = this.pendingSystem;
    const destination = this.destination;
    this.pendingSystem = null;
    let data: { system: SystemDetail; timing: Timing };
    try {
      data = await request;
    } catch (error) {
      this.setState({ error: error instanceof Error ? error.message : String(error) });
      return;
    }
    if (this.destination !== destination) return;

    const layer = new SystemLayer(data.system, data.timing);
    layer.timeScale = this.state.timeScale;
    this.systemLayer = layer;
    this.systemPosition = destination.position.clone();
    this.shipPosition = destination.position.clone();
    this.engine.nearScene.add(layer.root);
    this.engine.nearSceneVisible = true;
    this.galaxy.setHidden(destination.position);
    this.galaxy.setHighlight(null);

    this.navigator.rebase(destination.position, AU_PER_LY);
    this.navigator.minDistance = 1e-4;
    this.navigator.maxDistance = EXIT_SYSTEM_AU * 3;
    // The flight carries on into the system: keep its HUD until the ship stops
    this.setState({ mode: "system", system: data.system, target: null, travel: this.navigator.isFlying ? this.state.travel : null });
    this.dockShip(data.system.index, null, pretty(data.system.name));
    this.paintPlanets(layer, this.state.coordinates!);
    sfx.arrive();

    const planet = this.pendingPlanet;
    this.pendingPlanet = null;
    if (planet != null) setTimeout(() => this.focusPlanet(planet), 400);
    else if (!this.navigator.isFlying) this.navigator.flyTo(new THREE.Vector3(), Math.max(layer.outerRadius * 2.6, 3), { duration: 2.5, pitch: 0.45 });
  }

  // The system arrives without colors; each planet's rendering data carries its real
  // base color, so fetch them one by one and repaint the plain spheres
  private async paintPlanets(layer: SystemLayer, coordinates: Coordinates) {
    for (const planet of layer.system.planets) {
      if (this.systemLayer !== layer) return;
      try {
        const response = await fetch(planetRenderingUrl(coordinates, layer.system.index, planet.index), { credentials: "same-origin" });
        const result = await response.json();
        const info = result.rendering_data?.planet_info;
        if (result.success && info?.base_color && this.systemLayer === layer) layer.setPlanetColor(planet.index, getPlanetBaseColor({ planet_info: info }));
      } catch {
        // Keeps the per-type palette
      }
    }
  }

  private leaveSystem(silent: boolean) {
    const layer = this.systemLayer;
    if (!layer || !this.systemPosition) {
      this.pendingSystem = null;
      return;
    }
    this.closePlanetFrame();
    const position = this.systemPosition;
    this.navigator.follow = null;
    this.navigator.rebase(position.clone().multiplyScalar(-AU_PER_LY), 1 / AU_PER_LY);
    this.engine.nearScene.remove(layer.root);
    this.engine.nearSceneVisible = false;
    layer.dispose();
    this.systemLayer = null;
    this.systemPosition = null;
    this.destination = null;
    this.galaxy?.setHidden(null);
    this.labels.removeWhere((id) => id.startsWith("planet:") || id.startsWith("sysstar:"));
    if (this.galaxy) {
      this.navigator.minDistance = 0.004;
      this.navigator.maxDistance = this.galaxyMaxDistance(this.galaxy.radius);
    }
    if (!silent) {
      this.setState({ mode: "galaxy", system: null, target: null });
      this.galaxy?.setHighlight(this.shipPosition);
    }
  }

  // ---- input ----------------------------------------------------------------------

  // A moon of the planet in orbit under the cursor
  private pickMoon(x: number, y: number): string | null {
    const frame = this.planetFrame;
    if (!frame?.ready || !this.state.orbiting || this.state.moons.length === 0) return null;
    const rect = this.engine.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    const hit = frame.moonAt(ndc);
    if (hit?.name) return hit.name;
    // Moons are small: also accept a click near their marker
    let best: string | null = null;
    let bestDistance = 18;
    for (const moon of this.state.moons) {
      const p = frame.projectMoon(moon.name);
      if (!p || p.z > 1) continue;
      const d = Math.hypot(((p.x + 1) / 2) * rect.width + rect.left - x, ((1 - p.y) / 2) * rect.height + rect.top - y);
      if (d < bestDistance) {
        bestDistance = d;
        best = moon.name;
      }
    }
    return best;
  }

  private handleClick(x: number, y: number) {
    const moon = this.pickMoon(x, y);
    if (moon) {
      this.selectMoon(moon);
      return;
    }
    if (this.state.mode === "system" && this.systemLayer) {
      const hit = this.systemLayer.pickBody(x, y, (rel) => this.engine.project(rel, { x: 0, y: 0 }), this.cameraLocal);
      if (hit?.kind === "planet") {
        this.systemLayer.setSelectedPlanet(hit.body.data.index);
        this.setState({ target: { kind: "planet", planet: hit.body.data } });
        sfx.select("planet");
      } else if (hit?.kind === "star") this.selectStar(hit.index);
      return;
    }
    if (this.state.mode !== "galaxy" || !this.galaxy) return;
    const picked = this.galaxy.pick(x, y, this.cameraWorld, this.engine.camera, this.engine.renderer.domElement);
    if (picked) this.selectSystem(picked.index, picked.position);
    else this.clearTarget();
  }

  private handleDoubleClick(x: number, y: number) {
    const moon = this.pickMoon(x, y);
    if (moon) {
      this.focusMoon(moon);
      return;
    }
    if (this.state.mode === "system" && this.systemLayer) {
      const hit = this.systemLayer.pickBody(x, y, (rel) => this.engine.project(rel, { x: 0, y: 0 }), this.cameraLocal);
      if (hit?.kind === "planet") this.focusPlanet(hit.body.data.index);
      else if (hit?.kind === "star") this.focusStar(hit.index);
      return;
    }
    if (this.state.mode !== "galaxy" || !this.galaxy) return;
    const picked = this.galaxy.pick(x, y, this.cameraWorld, this.engine.camera, this.engine.renderer.domElement);
    if (picked) this.travelToSystem(picked.index);
  }

  private handleKey = (e: KeyboardEvent) => {
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    if (e.key === "Escape") this.goUp();
    else if (e.key === "Enter") this.engage();
    else if (e.key === "m" || e.key === "M") this.openMap();
    else if (e.key === "h" || e.key === "H") this.returnToShip();
  };

  // ---- per frame ------------------------------------------------------------------

  private frame(dt: number) {
    const nav = this.navigator;
    nav.update(dt);

    nav.cameraPosition(this.cameraLocal);
    if (this.systemLayer && this.systemPosition) {
      this.cameraWorld.copy(this.cameraLocal).divideScalar(AU_PER_LY).add(this.systemPosition);
    } else {
      this.cameraWorld.copy(this.cameraLocal);
    }
    if (this.lastCameraWorld && dt > 0) {
      const instant = this.cameraWorld.distanceTo(this.lastCameraWorld) / dt;
      this.speed += (instant - this.speed) * Math.min(1, dt * 6);
      this.lastCameraWorld.copy(this.cameraWorld);
    } else this.lastCameraWorld = this.cameraWorld.clone();
    nav.orientation(this.quaternion);
    this.engine.camera.quaternion.copy(this.quaternion);
    this.engine.camera.updateMatrixWorld();
    this.engine.camera.getWorldDirection(this.forward);

    // Warp streaks: long flights, plus the burst of a hyperjump
    this.warpBurst = Math.max(0, this.warpBurst - dt * 0.9);
    if (this.driveStart !== null) this.warpBurst = Math.max(this.warpBurst, Math.min(1, (performance.now() - this.driveStart) / 1400));
    this.engine.warp = Math.max(nav.warpIntensity, this.warpBurst);
    if (this.jump) {
      if (!nav.isFlying) {
        // Cancelled on the way (the user took the controls)
        this.jump = null;
        this.neighbors?.morph(null);
        this.endJump();
      } else {
        // The jump drive: streaks peak mid-gap. The stand-in turns into the real galaxy
        // over the last decade of distance
        this.engine.warp = Math.max(this.engine.warp, Math.sin(Math.PI * nav.flightProgress) * 0.9);
        const remaining = this.cameraWorld.distanceTo(this.jump.position) / this.jump.distance;
        const amount = 1 - THREE.MathUtils.smoothstep(Math.log(Math.max(remaining, 1)), 0, Math.log(10));
        this.neighbors?.morph(this.jump.coordinates, amount, this.jump.radius);
      }
    }
    this.updateJump();
    // The ship's hum and rush follow how hard it is flying, and the drive
    const flying = nav.isFlying ? Math.sin(Math.PI * nav.flightProgress) : 0;
    sfx.drive(Math.max(flying, nav.throttleLevel * 0.7), Math.max(this.engine.warp, this.jumpRide));
    // The drive pulls the field of view wide while it runs
    this.warpFov += (this.engine.warp - this.warpFov) * Math.min(1, dt * 3);
    const fov = BASE_FOV + 24 * this.warpFov * (2 - this.warpFov);
    this.labels.setFade(Math.min(1 - THREE.MathUtils.smoothstep(this.warpFov, 0.05, 0.4), this.jumpLabelFade()));
    if (Math.abs(this.engine.camera.fov - fov) > 1e-3) {
      this.engine.camera.fov = fov;
      this.engine.camera.updateProjectionMatrix();
    }
    // Still camera, nothing to animate fast: drop to the idle frame rate
    this.engine.idle = nav.isIdle && this.warpBurst === 0 && this.warpFov < 0.01 && !this.jumpFx;

    const time = performance.now() / 1000;
    if (this.exotics) {
      this.exotics.update(time, this.cameraWorld, this.engine.pixelRatio);
      this.engine.setLenses(this.exotics.lenses(this.cameraWorld, this.engine.camera));
    }
    if (this.neighbors) {
      // The grid is a map aid: it shows from a tenth of the galaxy radius outwards
      const zoomLy = this.systemLayer ? nav.distance / AU_PER_LY : nav.distance;
      const radius = this.galaxy?.radius ?? 1;
      this.neighbors.update(this.cameraWorld, this.engine.exposure, THREE.MathUtils.smoothstep(zoomLy, radius * 0.1, radius * 0.6));
    }
    this.updateShip(dt);

    if (this.galaxy) {
      const focusDistanceLy = this.systemLayer ? nav.distance / AU_PER_LY : nav.distance;
      this.galaxy.update(dt, this.cameraWorld, this.engine.pixelRatio, this.engine.exposure);
      if (performance.now() - this.lastExposureMeasure > (this.engine.idle ? 1500 : 250)) {
        this.lastExposureMeasure = performance.now();
        this.galaxy.measureExposure(this.cameraWorld, this.engine.camera);
      }
      // Eye adaptation, in log space so it feels the same going brighter or darker
      const logExposure = Math.log(this.engine.exposure);
      this.engine.exposure = Math.exp(logExposure + (Math.log(this.galaxy.targetExposure) - logExposure) * Math.min(1, dt * 2.5));
      this.galaxy.maybeRequest(this.cameraWorld, this.forward, focusDistanceLy, (this.engine.camera.fov * Math.PI) / 180, this.engine.camera.aspect, this.engine.viewportHeight);
    }

    if (this.systemLayer) {
      const layer = this.systemLayer;
      layer.presence = SystemLayer.presenceAt(this.cameraLocal.length());
      if (this.systemPosition) this.galaxy?.setHidden(this.systemPosition, layer.presence);
      layer.update(dt, this.cameraLocal);
      const nearest = Math.max(layer.nearestSurface(this.cameraLocal), 1e-9);
      this.engine.nearRange = [Math.max(1e-9, nearest * 0.25), 1e5];
      this.updatePlanetFrame(dt);
    }

    this.checkTransitions();
    this.updateHover();
    this.updateLabels();

    const now = performance.now();
    if (now - this.lastEmit > 200) {
      this.lastEmit = now;
      const remaining = this.systemLayer ? nav.flightRemaining / AU_PER_LY : nav.flightRemaining;
      const travel = this.state.travel ? (nav.isFlying ? { ...this.state.travel, progress: nav.flightProgress, speed: this.speed, remaining } : null) : null;
      this.setState({ readout: this.readout(), cosmicTime: this.systemLayer?.cosmicNow ?? Date.now() / 1000, timeDrift: this.systemLayer?.drift ?? 0, travel, mapView: this.isMapView(), fps: this.engine.fps });
    }
    if (this.state.mode === "galaxy" && now - this.lastNearbyRefresh > 1000) {
      this.lastNearbyRefresh = now;
      this.refreshNearby();
    }
  }

  // The hyperjump's timeline (see the wormhole pass in Engine). While the drive charges
  // a wormhole opens at the vanishing point and everything on screen bends away from it;
  // at the punch its mouth swallows the screen and the ship rides hyperspace (the scene
  // can change behind it unseen); dropping out, a new mouth opens on the destination and
  // widens until it is all there is
  private updateJump() {
    const fx = this.jumpFx;
    const jump = this.engine.jump;
    if (!fx) {
      jump.active = false;
      jump.charge = jump.mouth = jump.exit = jump.flash = 0;
      this.jumpRide = 0;
      return;
    }
    const t = performance.now() / 1000;
    const cover = this.engine.screenCover;
    // Never stuck in hyperspace if the destination fails to answer
    if (fx.exitAt === null && t - fx.enterAt > 20) fx.exitAt = t;
    const charging = fx.enterAt > fx.start ? THREE.MathUtils.smoothstep(t, fx.start, fx.enterAt) : 1;
    jump.active = true;
    jump.charge = t < fx.enterAt ? charging * charging : Math.max(0, 1 - (t - fx.enterAt) * 5);
    if (!fx.entered && t >= fx.enterAt) {
      fx.entered = true;
      if (!fx.quietEntry) sfx.hyperEnter();
    }
    let out = 0;
    if (fx.exitAt !== null && t >= fx.exitAt) {
      out = THREE.MathUtils.clamp((t - fx.exitAt) / 1.1, 0, 1);
      jump.exit = 1;
      jump.mouth = cover * (1 - Math.pow(1 - out, 3));
      if (!fx.exited) {
        fx.exited = true;
        sfx.hyperExit();
      }
    } else {
      jump.exit = 0;
      jump.mouth = cover * Math.pow(t < fx.enterAt ? charging : 1, 2.4);
    }
    jump.flash = 0.7 * Math.exp(-Math.pow((t - fx.enterAt) / 0.12, 2)) + (fx.exitAt !== null ? 0.4 * Math.exp(-Math.pow((t - fx.exitAt - 0.05) / 0.14, 2)) : 0);
    // How deep in hyperspace the ship is: the drive's sound and the streaks in the eye
    this.jumpRide = fx.entered ? 1 - out : charging * 0.5;
    this.engine.warp = Math.max(this.engine.warp, jump.charge * 0.3, this.jumpRide * 0.6);
    if (fx.exitAt !== null && t > fx.exitAt + 1.15) this.jumpFx = null;
  }

  private jumpRide = 0;

  // Labels are drawn over the canvas, outside the wormhole: they leave as the mouth
  // swallows the view, and come back as the new place opens up
  private jumpLabelFade() {
    const jump = this.engine.jump;
    if (!jump.active) return 1;
    const cover = this.engine.screenCover;
    return jump.exit ? THREE.MathUtils.smoothstep(jump.mouth, cover * 0.6, cover) : 1 - THREE.MathUtils.smoothstep(jump.mouth, cover * 0.08, cover * 0.4);
  }

  // The saucer in front of the chase camera: banks with the turn rate of the view and
  // pushes its drive while travelling. Not shown over the galaxy map
  private updateShip(dt: number) {
    const nav = this.navigator;
    let yawDelta = nav.yaw - this.lastYaw;
    yawDelta = Math.atan2(Math.sin(yawDelta), Math.cos(yawDelta));
    const pitchDelta = nav.pitch - this.lastPitch;
    this.lastYaw = nav.yaw;
    this.lastPitch = nav.pitch;
    const rate = dt > 0 ? 1 / dt : 0;
    const flying = nav.isFlying ? Math.sqrt(Math.sin(Math.PI * nav.flightProgress)) : 0;
    // Through a hyperjump the ship stays with the camera: it rides the wormhole while the
    // galaxy changes behind it, and only then steps aside if the view is the map
    const visible = this.state.view.shipView && (!!this.jumpFx || (this.state.mode !== "loading" && !this.isMapView()));
    // Lit by the system's star, or by the galactic core between stars (camera space)
    const light = (this.systemLayer ? this.cameraLocal : this.cameraWorld).clone().negate();
    light.applyQuaternion(this.quaternion.clone().invert());
    // Keep it above the console, whose height changes with what it shows
    if (performance.now() - this.lastFloorMeasure > 250) {
      this.lastFloorMeasure = performance.now();
      const canvas = this.engine.renderer.domElement.getBoundingClientRect();
      const floor = document.querySelector("[data-ship-floor]")?.getBoundingClientRect();
      this.shipFloor = floor && floor.height > 0 && canvas.height > 0 ? (floor.top - canvas.top) / canvas.height : 1;
    }
    this.shipView.update(dt, this.engine.camera.aspect, {
      yawRate: yawDelta * rate,
      pitchRate: pitchDelta * rate,
      thrust: Math.max(flying, nav.throttleLevel),
      strafe: nav.strafe,
      climb: nav.climb,
      warp: this.engine.warp,
      visible,
      light,
      floor: this.shipFloor,
    });
    this.engine.shipPass = this.shipView.visible ? this.shipView : null;
  }

  private isMapView() {
    return this.state.mode === "galaxy" && !!this.galaxy && this.navigator.distance > this.galaxy.radius * 0.5;
  }

  // Up to two planets in full detail: the one we orbit (or are heading to) and the one
  // we just left, until it has shrunk to a speck
  private updatePlanetFrame(dt: number) {
    const layer = this.systemLayer;
    if (!layer) {
      this.engine.planetPasses = [];
      return;
    }
    const timeOffset = layer.cosmicNow - Date.now() / 1000;
    const passes: Array<{ distance: number; pass: { scene: THREE.Scene; camera: THREE.PerspectiveCamera } }> = [];
    const detailedIndices: number[] = [];
    const drive = (frame: PlanetFrame, index: number): boolean => {
      const body = layer.planet(index);
      if (!body) return false;
      const distance = this.cameraLocal.distanceTo(body.position);
      // Full detail while the planet is more than a speck; the plain sphere otherwise
      const detailed = frame.ready && distance < body.radius * 600;
      frame.viewportHeight = this.engine.viewportHeight * this.engine.pixelRatio;
      frame.update(dt, this.cameraLocal, body.position, this.quaternion, layer.cosmicNow, timeOffset);
      if (detailed) {
        passes.push({ distance, pass: { scene: frame.scene, camera: frame.camera } });
        detailedIndices.push(index);
      }
      return detailed;
    };

    if (this.planetFrame && this.framePlanet !== null) {
      const detailed = drive(this.planetFrame, this.framePlanet);
      // Left orbit and the planet has shrunk to a speck: the frame is no longer needed
      if (!this.state.orbiting && !detailed) this.disposeCurrentFrame();
    }
    if (this.departingFrame && !drive(this.departingFrame.frame, this.departingFrame.index)) {
      this.departingFrame.frame.dispose();
      this.departingFrame = null;
    }
    // Farthest first, so the nearer planet is drawn over it
    passes.sort((a, b) => b.distance - a.distance);
    this.engine.planetPasses = passes.map((p) => p.pass);
    layer.setDetailed(detailedIndices);
  }

  private checkTransitions() {
    const nav = this.navigator;
    const target = this.state.target;
    // Zooming manually onto the selected star is the same as asking to travel there
    if (this.state.mode === "galaxy" && !this.destination && this.travelIndex === null && target?.kind === "system" && target.position && nav.distance < 0.006 && nav.focus.distanceTo(target.position) < 0.01) {
      this.travelToSystem(target.index);
    }
    if (this.state.mode === "galaxy" && this.destination && this.pendingSystem && nav.distance < ENTER_SYSTEM_LY && nav.focus.distanceTo(this.destination.position) < ENTER_SYSTEM_LY) {
      this.enterSystem();
      this.pendingSystem = null;
    }
    if (this.state.mode === "system" && this.systemLayer && nav.distance > EXIT_SYSTEM_AU) {
      this.leaveSystem(false);
    }
  }

  private refreshNearby() {
    if (!this.galaxy || !this.directory || this.isMapView()) {
      if (this.state.nearby.length) this.setState({ nearby: [] });
      return;
    }
    const stars = this.galaxy.visibleStars(this.cameraWorld, 6, 300).filter((s) => s.index !== this.state.ship?.system);
    Promise.all(stars.map((s) => this.directory!.get(s.index))).then((summaries) => {
      const nearby: NearbySystem[] = [];
      summaries.forEach((summary, i) => {
        if (!summary) return;
        nearby.push({ index: summary.index, name: pretty(summary.name), starType: summary.stars.map((s) => s.Type).join(" + "), planets: summary.num_planets, distance: formatDistanceLy(stars[i].distance) });
      });
      this.setState({ nearby });
    });
  }

  private updateHover() {
    if (!this.pointer || this.navigator.isFlying) {
      this.hover = null;
      this.hoverPlanet = null;
      return;
    }
    // Picking scans every star on screen: only redo it when the pointer moved
    const now = performance.now();
    if (!this.pointerMoved || now - this.lastHoverPick < 60) return;
    this.pointerMoved = false;
    this.lastHoverPick = now;
    this.hover = null;
    this.hoverPlanet = null;
    if (this.state.mode === "galaxy" && this.galaxy) {
      this.hover = this.galaxy.pick(this.pointer.x, this.pointer.y, this.cameraWorld, this.engine.camera, this.engine.renderer.domElement);
      if (this.hover && this.directory && !this.directory.peek(this.hover.index)) this.directory.get(this.hover.index);
    } else if (this.state.mode === "system" && this.systemLayer) {
      this.hoverPlanet = this.systemLayer.pickPlanet(this.pointer.x, this.pointer.y, (rel) => this.engine.project(rel, { x: 0, y: 0 }), this.cameraLocal);
    }
    this.engine.renderer.domElement.style.cursor = this.hover || this.hoverPlanet ? "pointer" : "grab";
  }

  private projectWorld(worldLy: THREE.Vector3) {
    const rel = worldLy.clone().sub(this.cameraWorld);
    return this.engine.project(rel, { x: 0, y: 0 });
  }

  private updateLabels() {
    const labels = this.labels;
    labels.beginFrame();
    const now = performance.now();
    const mapView = this.isMapView();

    if (this.state.mode === "galaxy" && this.galaxy && this.directory) {
      // The ship, always findable
      if (this.shipPosition) {
        const screen = this.projectWorld(this.shipPosition);
        if (screen) {
          labels.upsert("ship", "ship", "You are here", this.state.shipSystemName ?? "", () => this.returnToShip());
          labels.place("ship", screen.x, screen.y);
        }
      }

      // Neighbouring galaxies, once we have backed out far enough to see them
      if (this.neighbors && this.navigator.distance > this.galaxy.radius * 1.2) {
        for (const n of this.neighbors.nearest(this.navigator.focus, mapView ? 16 : 8)) {
          const screen = this.projectWorld(n.position);
          if (!screen) continue;
          labels.upsert(`galaxy:${n.coordinates.join(",")}`, "galaxy", pretty(n.name), `${n.coordinates.join(", ")}\n${n.galaxy_type} · click to hyperjump`, () => this.hyperjump(n.coordinates));
          labels.place(`galaxy:${n.coordinates.join(",")}`, screen.x, screen.y, 0.85);
        }
      }

      // Landmarks: on the map all the big ones, close up only the nearest few
      const candidates: Array<{ poi: PointOfInterest; distance: number; showRange: number; screen: { x: number; y: number } }> = [];
      for (const poi of this.state.pois) {
        const position = new THREE.Vector3(...poi.position);
        const distance = position.distanceTo(this.cameraWorld);
        const showRange = poi.id === "smbh" ? (this.galaxy.info.num_systems === 0 ? Infinity : 400) : poi.kind === "core" || poi.kind === "quasar" ? Infinity : poi.kind === "globular" || poi.kind === "open" ? Math.max(poi.radius * 120, 2500) : 2500;
        if (distance > showRange || distance < poi.radius * 0.8) continue;
        const screen = this.projectWorld(position);
        if (screen) candidates.push({ poi, distance, showRange, screen });
      }
      candidates.sort((a, b) => a.distance - b.distance);
      const targetPoi = this.state.target?.kind === "poi" ? this.state.target.poi.id : null;
      candidates
        .filter((c, i) => i < (mapView ? 3 : 8) || c.poi.kind === "core" || c.poi.kind === "quasar" || c.poi.id === targetPoi)
        .forEach(({ poi, distance, showRange, screen }) => {
          const id = `poi:${poi.id}`;
          const kind = poi.kind === "globular" || poi.kind === "open" ? "cluster" : poi.kind === "blackhole" || poi.kind === "pulsar" ? "exotic" : "poi";
          labels.upsert(
            id,
            kind,
            poi.name,
            formatDistanceLy(distance),
            () => this.setState({ target: { kind: "poi", poi } }),
            () => this.flyToPoi(poi)
          );
          labels.place(id, screen.x, screen.y, showRange === Infinity ? 1 : Math.min(1, (showRange - distance) / (showRange * 0.3)));
        });

      // Named nearby systems (refreshed a few times per second)
      if (now - this.lastLabelRefresh > 600) {
        this.lastLabelRefresh = now;
        this.nearbyStars = mapView ? [] : this.galaxy.visibleStars(this.cameraWorld, this.quality.starLabels, 400);
        for (const star of this.nearbyStars) {
          this.directory.get(star.index).then((summary) => {
            if (summary?.stars[0]) this.galaxy?.setRealStarType(star.index, summary.stars[0].Type);
          });
        }
        labels.removeWhere((id) => id.startsWith("star:") && !this.nearbyStars.some((s) => `star:${s.index}` === id));
      }
      const targetSystem = this.state.target?.kind === "system" ? this.state.target.index : null;
      for (const star of this.nearbyStars) {
        const summary = this.directory.peek(star.index);
        if (!summary || star.index === targetSystem || star.index === this.state.ship?.system) continue;
        const screen = this.projectWorld(star.position);
        if (!screen) continue;
        labels.upsert(
          `star:${star.index}`,
          "star",
          pretty(summary.name),
          formatDistanceLy(star.position.distanceTo(this.cameraWorld)),
          () => this.selectSystem(star.index, star.position),
          () => this.travelToSystem(star.index)
        );
        labels.place(`star:${star.index}`, screen.x, screen.y, 0.85);
      }

      if (this.hover && this.hover.index !== targetSystem) {
        const summary = this.directory.peek(this.hover.index);
        labels.upsert("hover", "hover", summary ? pretty(summary.name) : `System #${this.hover.index.toLocaleString()}`, summary ? `${summary.stars.map((s) => s.Type).join(" + ")} · ${summary.num_planets} planets` : "scanning…");
        labels.place("hover", this.hover.screen.x, this.hover.screen.y);
      }

      const target = this.state.target;
      if (target?.kind === "system" && target.position) {
        const screen = this.projectWorld(target.position);
        if (screen) {
          labels.upsert("target", "selected", target.summary ? pretty(target.summary.name) : `System #${target.index.toLocaleString()}`, formatDistanceLy(target.position.distanceTo(this.cameraWorld)));
          labels.place("target", screen.x, screen.y);
        }
      }
    }

    if (this.state.mode === "system" && this.systemLayer) {
      const layer = this.systemLayer;
      const orbiting = this.state.orbiting?.index;
      for (const p of layer.planets) {
        const rel = p.position.clone().sub(this.cameraLocal);
        // Hide the label of the planet we are orbiting once it fills the view
        if (p.data.index === orbiting && rel.length() < p.radius * 40) continue;
        const screen = this.engine.project(rel, { x: 0, y: 0 });
        if (!screen) continue;
        const id = `planet:${p.data.index}`;
        labels.upsert(
          id,
          "planet",
          pretty(p.data.name),
          p.data.planet_type,
          () => {
            layer.setSelectedPlanet(p.data.index);
            this.setState({ target: { kind: "planet", planet: p.data } });
          },
          () => this.focusPlanet(p.data.index)
        );
        const targeted = this.state.target?.kind === "planet" && this.state.target.planet.index === p.data.index;
        if (layer.presence < 0.05) continue;
        labels.place(id, screen.x, screen.y, (targeted || this.hoverPlanet === p ? 1 : 0.7) * layer.presence);
      }
      // The moons of the planet in orbit
      const frame = this.planetFrame;
      if (frame?.ready && orbiting !== undefined) {
        const rect = this.engine.renderer.domElement.getBoundingClientRect();
        for (const moon of this.state.moons) {
          const p = frame.projectMoon(moon.name);
          if (!p || p.z > 1 || Math.abs(p.x) > 1.1 || Math.abs(p.y) > 1.1) continue;
          const id = `moon:${moon.name}`;
          const visiting = this.state.visitingMoon?.name === moon.name;
          // The visited moon fills the view: no label on top of it
          if (visiting && !this.navigator.isFlying) continue;
          labels.upsert(id, "moon", pretty(moon.name), `${moon.type} moon`, () => this.selectMoon(moon.name), () => this.focusMoon(moon.name));
          const targeted = this.state.target?.kind === "moon" && this.state.target.moon.name === moon.name;
          labels.place(id, rect.left + ((p.x + 1) / 2) * rect.width, rect.top + ((1 - p.y) / 2) * rect.height, targeted ? 1 : 0.8);
        }
      }
      const starScreen = this.engine.project(this.cameraLocal.clone().negate(), { x: 0, y: 0 });
      if (starScreen && this.navigator.distance > 0.5 && orbiting === undefined) {
        labels.upsert("sysstar:0", "star", pretty(layer.system.name), layer.system.stars.map((s) => s.Type).join(" + "), () => this.selectStar(0), () => this.focusStar(0));
        labels.place("sysstar:0", starScreen.x, starScreen.y, 0.9);
      }
    }

    labels.endFrame();
  }

  private readout(): { primary: string; secondary: string } {
    const nav = this.navigator;
    if (this.state.mode === "system" && this.systemLayer) {
      const visiting = this.state.visitingMoon;
      const moonAt = visiting && this.planetFrame ? this.moonWorld(visiting.name) : null;
      if (visiting && moonAt && this.planetFrame) {
        const radiusAU = this.planetFrame.moonRadiusAU(visiting.name);
        const altitude = ((this.cameraLocal.distanceTo(moonAt) - radiusAU) / radiusAU) * visiting.radiusKm;
        const sunlight = this.planetFrame.moonSunlight(visiting.name);
        const shadow = sunlight < 0.02 ? `eclipsed by ${pretty(this.state.orbiting?.name ?? "the planet")} · ` : sunlight < 0.98 ? "partial eclipse · " : "";
        return { primary: `Visiting ${pretty(visiting.name)}`, secondary: `${shadow}altitude ${Math.max(0, Math.round(altitude)).toLocaleString()} km` };
      }
      if (this.state.orbiting) {
        const body = this.systemLayer.planet(this.state.orbiting.index);
        const altitude = body ? (this.cameraLocal.distanceTo(body.position) - body.radius) * (this.state.orbiting.diameter / 2 / body.radius) : 0;
        return { primary: `Orbiting ${pretty(this.state.orbiting.name)}`, secondary: `altitude ${Math.max(0, Math.round(altitude)).toLocaleString()} km` };
      }
      return { primary: `${formatDistanceAu(this.cameraLocal.length())} from ${pretty(this.systemLayer.system.name)}`, secondary: `${this.systemLayer.system.planets.length} planets in this system` };
    }
    const fromCore = this.cameraWorld.length();
    const fromShip = this.shipPosition ? this.shipPosition.distanceTo(this.cameraWorld) : null;
    return { primary: `${formatDistanceLy(fromCore)} from the galactic core`, secondary: fromShip !== null && fromShip > 0.05 ? `${formatDistanceLy(fromShip)} from your ship` : `focus ${formatDistanceLy(nav.distance)}` };
  }

  dispose() {
    this.loadToken++;
    if (this.arrivalTimer) clearTimeout(this.arrivalTimer);
    window.removeEventListener("keydown", this.handleKey);
    window.removeEventListener(COMFORT_EVENT, this.onComfort);
    this.disposeFrame();
    this.navigator.dispose();
    this.closePlanetFrame();
    this.galaxy?.dispose();
    this.disposeExtras();
    this.systemLayer?.dispose();
    this.labels.dispose();
    this.engine.shipPass = null;
    this.shipView.dispose();
    this.engine.dispose();
  }
}
