// atlas-ui/react/static/js/Layouts/__explore__.tsx
//
// The cockpit: a thin HUD over the universe. Top: where the ship is. Bottom: the
// console (travel status, current target, quick destinations). The galaxy map adds
// the landmarks panel; J opens the hyperjump computer.

import React, { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Explorer, loadStoredShip, recentGalaxies, type ExplorerState } from "../Explore/Explorer.ts";
import type { PointOfInterest } from "../Explore/galaxy/GalaxyModel.ts";
import { fetchCurrentLocation, fetchRandomLocation, type Coordinates } from "../Explore/api.ts";
import { loadQuality, QUALITY_PROFILES, type QualityLevel } from "../Explore/engine/Quality.ts";
import type { ViewToggle } from "../Explore/engine/ViewOptions.ts";
import type { ShipKind } from "../Explore/engine/ShipView.ts";
import { Button, Drop, Key, Modal, Panel, Presence } from "../Explore/ui/kit.tsx";
import { FaqPanel } from "../Explore/ui/FaqPanel.tsx";
import { DiveGate, DIVE_SECONDS } from "../Explore/ui/DiveGate.tsx";
import { Music } from "../Explore/audio/Music.ts";
import { sfx } from "../Explore/audio/Sfx.ts";
import { reducedFlashing, setReducedFlashing } from "../Explore/core/comfort.ts";
import { CrossingVeil, MultiversePanel, type Crossing } from "../Explore/ui/MultiversePanel.tsx";
import { StargatePanel } from "../Explore/ui/StargatePanel.tsx";
import { JumpSequence, type JumpPlan } from "../Explore/ui/JumpSequence.tsx";
import { readUniverseConfig, type UniverseConfig } from "../Explore/ui/universe.ts";

const CENTER: Coordinates = [5000000, 5000000, 5000000];

const pretty = (name: string) => name.replace(/_/g, " ");

const POI_GROUPS: Array<{ kinds: PointOfInterest["kind"][]; title: string; accent: string }> = [
  { kinds: ["core", "quasar"], title: "Galactic center", accent: "text-amber-300" },
  { kinds: ["globular"], title: "Globular clusters", accent: "text-orange-200" },
  { kinds: ["open"], title: "Open clusters", accent: "text-sky-300" },
  { kinds: ["blackhole"], title: "Black holes", accent: "text-fuchsia-300" },
  { kinds: ["pulsar"], title: "Pulsars", accent: "text-cyan-300" },
];

const TIME_SCALES: Array<{ label: string; value: number }> = [
  { label: "1×", value: 1 },
  { label: "1 h/s", value: 3600 },
  { label: "1 d/s", value: 86400 },
  { label: "1 mo/s", value: 2.6e6 },
  { label: "1 yr/s", value: 3.15e7 },
];

interface DeepLink {
  coordinates: Coordinates;
  system: number | null;
  planet: number | null;
  via: string | null;
}

function parseHash(): DeepLink | null {
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const g = params.get("g");
  if (!g) return null;
  const parts = g.split(",").map((v) => parseInt(v, 10));
  if (parts.length !== 3 || parts.some((v) => !Number.isFinite(v))) return null;
  const s = params.get("s");
  const p = params.get("p");
  return { coordinates: parts as Coordinates, system: s !== null ? parseInt(s, 10) : null, planet: p !== null ? parseInt(p, 10) : null, via: params.get("via") };
}

function writeHash(state: ExplorerState) {
  const ship = state.ship;
  if (!ship) return;
  const params = new URLSearchParams();
  params.set("g", ship.coordinates.join(","));
  params.set("s", String(ship.system));
  if (ship.planet !== null) params.set("p", String(ship.planet));
  const hash = `#${params.toString()}`;
  if (window.location.hash !== hash) window.history.replaceState(null, "", hash);
}


const Stat: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex justify-between gap-3 text-xs py-0.5">
    <span className="text-gray-500">{label}</span>
    <span className="text-gray-100 text-right">{value}</span>
  </div>
);

const Chip: React.FC<{ onClick: () => void; title: string; sub?: string; accent?: string }> = ({ onClick, title, sub, accent = "text-gray-200" }) => (
  <button onClick={onClick} className="shrink-0 text-left px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition-colors">
    <div className={`text-xs leading-tight ${accent}`}>{title}</div>
    {sub && <div className="text-[10px] text-gray-500 leading-tight">{sub}</div>}
  </button>
);

function LocationBar({ state }: { state: ExplorerState }) {
  const parts: Array<{ label: string; sub: string }> = [];
  if (state.galaxy) parts.push({ label: pretty(state.galaxy.name), sub: `${state.galaxy.galaxy_type} galaxy · ${state.galaxy.coordinates.join(", ")}` });
  if (state.shipSystemName) parts.push({ label: state.shipSystemName, sub: state.ship ? `system #${state.ship.system.toLocaleString()}` : "" });
  if (state.orbiting) parts.push({ label: pretty(state.orbiting.name), sub: `in orbit · ${state.orbiting.planet_type}` });
  if (state.visitingMoon) parts.push({ label: pretty(state.visitingMoon.name), sub: `${state.visitingMoon.type} moon` });
  return (
    <div className="flex items-center gap-3 pointer-events-auto min-w-0">
      <a href="/" className="shrink-0 text-sm font-bold tracking-[0.35em] text-white/90 hover:text-white" title="The Atlas, third version">
        ATLAS<span className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">3</span>
      </a>
      <div className="flex items-center gap-2 pl-3 border-l border-white/15 min-w-0">
        <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" title="Your ship" />
        {parts.map((p, i) => (
          // Small screens: only where the ship is now (the deepest part)
          <div key={i} className={`items-center gap-2 min-w-0 ${i === parts.length - 1 ? "flex" : "hidden lg:flex"}`}>
            {i > 0 && <span className="text-gray-600 hidden lg:inline">/</span>}
            <div className="min-w-0">
              <div className="text-sm text-white leading-tight truncate">{p.label}</div>
              <div className="text-[10px] text-gray-500 leading-tight truncate">{p.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TargetBlock({ explorer, state }: { explorer: Explorer; state: ExplorerState }) {
  const target = state.target;
  // Picking another planet while in orbit shows it as the next stop
  const otherPlanet = target?.kind === "planet" && state.orbiting && target.planet.index !== state.orbiting.index;

  if (target?.kind === "star") {
    const s = target.star;
    const temperature = target.temperature >= 100000 ? `${(target.temperature / 1000).toLocaleString()}k K` : `${target.temperature.toLocaleString()} K`;
    return (
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/90 truncate">Star · {s.Type}</div>
            <div className="text-base font-semibold text-white truncate">{target.name}</div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button tone="primary" onClick={() => explorer.engage()}>
              Approach<Key>⏎</Key>
            </Button>
            <Button onClick={() => explorer.clearTarget()}>✕</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 mt-1.5">
          <Stat label="Type" value={s.Type} />
          <Stat label="Colour" value={s.Color.charAt(0).toUpperCase() + s.Color.slice(1)} />
          <Stat label="Radius" value={`${s.Size.toLocaleString(undefined, { maximumFractionDigits: 3 })} R☉`} />
          <Stat label="Surface" value={`≈ ${temperature}`} />
        </div>
      </div>
    );
  }

  if (target?.kind === "moon") {
    const m = target.moon;
    const visiting = state.visitingMoon?.name === m.name;
    const period = m.periodDays >= 1 ? `${m.periodDays.toFixed(2)} days` : `${(m.periodDays * 24).toFixed(1)} h`;
    return (
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-violet-300/90 truncate">
              {visiting ? "Visiting" : "Moon"} · {m.type} · {state.orbiting ? `around ${pretty(state.orbiting.name)}` : ""}
            </div>
            <div className="text-base font-semibold text-white truncate">{pretty(m.name)}</div>
          </div>
          <div className="flex gap-2 shrink-0">
            {visiting ? (
              <Button onClick={() => explorer.goUp()}>
                Back to {state.orbiting ? pretty(state.orbiting.name) : "planet"}
                <Key>Esc</Key>
              </Button>
            ) : (
              <>
                <Button tone="primary" onClick={() => explorer.engage()}>
                  Visit<Key>⏎</Key>
                </Button>
                <Button onClick={() => explorer.clearTarget()}>✕</Button>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 mt-1.5">
          <Stat label="Diameter" value={`${Math.round(m.radiusKm * 2).toLocaleString()} km`} />
          <Stat label="Orbit" value={`${Math.round(m.semiMajorAxisKm).toLocaleString()} km`} />
          <Stat label="Period" value={period} />
          <Stat label="Rotation" value={m.tidallyLocked ? "Tidally locked" : "Free"} />
          <Stat label="Eccentricity" value={m.eccentricity.toFixed(3)} />
          <Stat label="Inclination" value={`${m.inclinationDeg.toFixed(1)}°`} />
          <Stat label="Density" value={`${Math.round(m.densityKgM3).toLocaleString()} kg/m³`} />
          <Stat label="Origin" value={m.origin.replace(/-/g, " ")} />
        </div>
        <div className="text-[10px] text-gray-500 mt-1 truncate">Mass {m.massKg.toExponential(2)} kg</div>
      </div>
    );
  }

  if (state.orbiting && !otherPlanet) {
    const p = state.orbiting;
    return (
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300/80">In orbit · {p.planet_type}</div>
            <div className="text-base font-semibold text-white">{pretty(p.name)}</div>
          </div>
          <Button onClick={() => explorer.goUp()}>
            Leave orbit<Key>Esc</Key>
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 mt-1.5">
          <Stat label="Diameter" value={`${Math.round(p.diameter).toLocaleString()} km`} />
          <Stat label="Gravity" value={`${p.gravity.toFixed(1)} m/s²`} />
          <Stat label="Temperature" value={`${p.surface_temperature.toFixed(0)} °C`} />
          <Stat label="Atmosphere" value={p.atmosphere} />
          <Stat label="Day" value={`${(Math.abs(p.rotation_period_seconds) / 3600).toFixed(1)} h`} />
          <Stat label="Year" value={`${(p.orbital_period_seconds / 31557600).toFixed(2)} yr`} />
          <Stat label="Life" value={p.life_forms} />
          <Stat label="Moons" value={state.planetDetail?.loading ? "…" : state.planetDetail?.moons ?? 0} />
        </div>
        <div className="text-[10px] text-gray-500 mt-1 truncate">{p.elements.join(" · ")}</div>
      </div>
    );
  }

  if (target?.kind === "system") {
    const s = target.summary;
    const isShip = state.ship?.system === target.index;
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">{isShip ? "Your ship is here" : "Target locked"} · system #{target.index.toLocaleString()}</div>
          <div className="text-base font-semibold text-white truncate">{s ? pretty(s.name) : "Scanning…"}</div>
          {s && (
            <div className="text-xs text-gray-400 truncate">
              {s.stars.map((st) => st.Type).join(" + ")} · {s.num_planets} planet{s.num_planets === 1 ? "" : "s"}
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button tone="primary" onClick={() => explorer.engage()}>
            {isShip ? "Return" : "Engage"}
            <Key>⏎</Key>
          </Button>
          <Button onClick={() => explorer.clearTarget()}>✕</Button>
        </div>
      </div>
    );
  }

  if (target?.kind === "poi") {
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80">{target.poi.kind}</div>
          <div className="text-base font-semibold text-white">{target.poi.name}</div>
          <div className="text-xs text-gray-400 truncate">{target.poi.description}</div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button tone="primary" onClick={() => explorer.engage()}>
            Fly there<Key>⏎</Key>
          </Button>
          <Button onClick={() => explorer.clearTarget()}>✕</Button>
        </div>
      </div>
    );
  }

  if (target?.kind === "planet") {
    const p = target.planet;
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300/80">
            {state.orbiting ? `Next stop · leaving ${pretty(state.orbiting.name)}` : "Planet"} · {p.planet_type}
          </div>
          <div className="text-base font-semibold text-white">{pretty(p.name)}</div>
          <div className="text-xs text-gray-400">
            {p.orbital_radius.toFixed(2)} AU from the star · {Math.round(p.diameter).toLocaleString()} km · {p.life_forms}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button tone="primary" onClick={() => explorer.engage()}>
            Go into orbit<Key>⏎</Key>
          </Button>
          <Button onClick={() => explorer.clearTarget()}>✕</Button>
        </div>
      </div>
    );
  }

  const hint = state.mapView ? "Galaxy map. Click any star to target it, pick a landmark, or follow the green marker back to your ship." : state.mode === "system" ? "Click a planet to target it · double-click to go straight into orbit." : "Click a star to target it · double-click to jump straight there.";
  return <div className="text-xs text-gray-400">{hint}</div>;
}

// Back to the present (and real-time speed). Lit when the simulation has wandered off
// the real time, quiet when it is already there
function TimeReset({ drift, onReset }: { drift: number; onReset: () => void }) {
  const away = Math.abs(drift) > 30;
  return (
    <button
      onClick={onReset}
      disabled={!away}
      title={away ? "Back to the present" : "Running in real time"}
      aria-label="Back to the present"
      className={`shrink-0 ml-1.5 w-6 h-6 flex items-center justify-center rounded-md border transition-colors ${away ? "border-cyan-400/50 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/25" : "border-white/10 text-gray-600 cursor-default"}`}
    >
      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 12a8.5 8.5 0 1 0 2.5-6" />
        <path d="M3 3.5v4.5h4.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
    </button>
  );
}

function Console({ explorer, state }: { explorer: Explorer; state: ExplorerState }) {
  const chips: React.ReactNode[] = [];
  if (state.mode === "system" && state.system) {
    // In orbit: the moons come first, then the way back to the planet when visiting one
    if (state.visitingMoon && state.orbiting) chips.push(<Chip key="back" onClick={() => explorer.goUp()} title={`Back to ${pretty(state.orbiting.name)}`} sub="planet · Esc" accent="text-emerald-300" />);
    state.moons.filter((m) => m.name !== state.visitingMoon?.name).forEach((m) => chips.push(<Chip key={`m${m.name}`} onClick={() => explorer.focusMoon(m.name)} title={pretty(m.name)} sub={`${m.type} moon · ${Math.round(m.radiusKm * 2).toLocaleString()} km`} accent="text-violet-200" />));
    state.system.planets.filter((p) => p.index !== state.orbiting?.index).forEach((p) => chips.push(<Chip key={`p${p.index}`} onClick={() => explorer.focusPlanet(p.index)} title={pretty(p.name)} sub={`${p.planet_type} · ${p.orbital_radius.toFixed(1)} AU`} accent="text-emerald-200" />));
  } else if (state.mode === "galaxy" && !state.mapView) {
    state.nearby.forEach((n) => chips.push(<Chip key={`n${n.index}`} onClick={() => explorer.selectSystem(n.index)} title={n.name} sub={`${n.distance} · ${n.starType}`} accent="text-sky-200" />));
  }
  if (state.mode === "galaxy" && state.ship && (state.mapView || state.target?.kind !== "system" || state.target.index !== state.ship.system)) {
    chips.unshift(<Chip key="home" onClick={() => explorer.returnToShip()} title="Return to ship" sub={`${state.shipSystemName ?? "your system"} · H`} accent="text-emerald-300" />);
  }

  const [collapsed, setCollapsed] = useState(() => readFlag(CONSOLE_COLLAPSED_KEY));
  const toggle = (value: boolean) => {
    setCollapsed(value);
    writeFlag(CONSOLE_COLLAPSED_KEY, value);
  };
  // The console stays as the pilot left it: collapsed, its header still shows what is
  // targeted, and a tap on it opens it
  const target = state.target;
  const targetName = !target
    ? null
    : target.kind === "system"
      ? (target.summary?.name ?? `System #${target.index.toLocaleString()}`).replace(/_/g, " ")
      : target.kind === "planet"
        ? target.planet.name.replace(/_/g, " ")
        : target.kind === "moon"
          ? target.moon.name.replace(/_/g, " ")
          : target.kind === "star"
            ? target.name
            : target.poi.name;

  return (
    <Panel className="relative w-[min(720px,calc(100vw-1.5rem))] px-3 pt-3 pb-2.5 pointer-events-auto">
      <button
        onClick={() => toggle(!collapsed)}
        className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-6 rounded-full bg-slate-900/90 border border-white/15 text-gray-300 hover:text-white hover:border-cyan-300/50 backdrop-blur-md transition-colors"
        title={collapsed ? "Show the console" : "Hide the console"}
        aria-expanded={!collapsed}
      >
        <svg width={14} height={14} viewBox="0 0 24 24" className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`}>
          <path fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <div className="flex items-center justify-between gap-3 cursor-pointer sm:cursor-default" onClick={() => collapsed && toggle(false)}>
        {state.travel ? (
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-cyan-200 tracking-wide truncate">{state.travel.label}…</div>
            <div className="h-0.5 mt-1 bg-white/10 rounded overflow-hidden">
              <div className="h-full bg-cyan-300 transition-[width] duration-200" style={{ width: `${Math.round(state.travel.progress * 100)}%` }} />
            </div>
          </div>
        ) : collapsed && targetName ? (
          <div className="text-[11px] font-mono truncate">
            <span className="text-cyan-300">Target</span> <span className="text-gray-200">{targetName}</span> <span className="text-gray-500">· tap to open</span>
          </div>
        ) : (
          <div className="text-[11px] font-mono text-gray-300 truncate">{state.readout.primary}</div>
        )}
        <div className="text-[11px] font-mono text-gray-500 shrink-0 hidden sm:block">{state.readout.secondary}</div>
      </div>

      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${collapsed ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr] opacity-100"}`}>
        <div className="overflow-hidden min-h-0">
          <div className="border-t border-white/10 pt-2 mt-2">
            <TargetBlock explorer={explorer} state={state} />
          </div>

          {chips.length > 0 && <div className="flex gap-1.5 mt-2 overflow-x-auto pb-0.5">{chips}</div>}

          {state.mode === "system" && (
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-white/10 overflow-x-auto">
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mr-1">Time</span>
              {TIME_SCALES.map((t) => (
                <button key={t.value} onClick={() => explorer.setTimeScale(t.value)} className={`shrink-0 whitespace-nowrap px-2 py-0.5 rounded-md text-[11px] ${state.timeScale === t.value ? "bg-cyan-400/90 text-slate-950" : "text-gray-300 hover:bg-white/10"}`}>
                  {t.label}
                </button>
              ))}
              <span className="ml-auto pl-2 shrink-0 text-[11px] font-mono text-gray-500 hidden sm:inline">{new Date(state.cosmicTime * 1000).toISOString().slice(0, 16).replace("T", " ")}</span>
              <TimeReset drift={state.timeDrift} onReset={() => explorer.resetTime()} />
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}

const CONSOLE_COLLAPSED_KEY = "atlas-console-collapsed";

function readFlag(key: string) {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(key: string, value: boolean) {
  try {
    localStorage.setItem(key, value ? "1" : "0");
  } catch {
    /* storage unavailable */
  }
}

const SECONDS_PER_YEAR = 31557600;
const AU_PER_LY = 63241.077;
const KM_PER_LY = 9.4607e12;

// Always three significant figures (3.60, 36.0, 360, 3.60k…), so a readout keeps the
// same width while its value races up or down
const SUFFIXES = ["", "k", "M", "B", "T", "Q"];
function sig3(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return "0.00";
  let i = 0;
  while (n >= 999.5 && i < SUFFIXES.length - 1) {
    n /= 1000;
    i++;
  }
  if (n >= 999.5) return n.toExponential(1).replace("e+", "e") + SUFFIXES[i];
  return (n >= 99.95 ? n.toFixed(0) : n >= 9.995 ? n.toFixed(1) : n.toFixed(2)) + SUFFIXES[i];
}

// Speed given in ly per second: ly/h while it makes sense, then AU/h, then km/s
function formatSpeed(lyPerSecond: number) {
  const lyPerHour = lyPerSecond * 3600;
  if (lyPerHour >= 1) return { value: sig3(lyPerHour), unit: "ly/h" };
  if (lyPerHour * AU_PER_LY >= 1) return { value: sig3(lyPerHour * AU_PER_LY), unit: "AU/h" };
  return { value: sig3(lyPerSecond * KM_PER_LY), unit: "km/s" };
}

function formatDistance(ly: number) {
  if (ly >= 0.01) return { value: sig3(ly), unit: "ly" };
  if (ly * AU_PER_LY >= 0.01) return { value: sig3(ly * AU_PER_LY), unit: "AU" };
  return { value: sig3(ly * KM_PER_LY), unit: "km" };
}

// One readout: a label over a value and its unit, in a column of fixed width. The value
// and unit are written by FlightHud's animation loop, straight into the DOM
function HudReadout({ label, primary = false, valueRef, unitRef, trendRef }: { label: string; primary?: boolean; valueRef: React.Ref<HTMLSpanElement>; unitRef: React.Ref<HTMLSpanElement>; trendRef?: React.Ref<HTMLSpanElement> }) {
  return (
    <div className="w-[6.4rem] sm:w-36 text-center whitespace-nowrap">
      <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-cyan-300/70">{label}</div>
      <div className={`relative tabular-nums leading-tight ${primary ? "text-lg sm:text-2xl text-white" : "text-base sm:text-lg text-cyan-100"}`}>
        {trendRef && <span ref={trendRef} className="absolute -left-1 sm:left-0 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs transition-[opacity,color] duration-300 opacity-0" />}
        <span ref={valueRef} />
        <span ref={unitRef} className="text-[10px] sm:text-xs text-cyan-200/80 ml-1" />
      </div>
    </div>
  );
}

// Shown while the ship is in flight: speed, multiple of light speed, distance left.
// The explorer reports them a few times a second; in between they glide (in log space,
// so a climb through orders of magnitude reads as smooth acceleration) at the display's
// frame rate, and a chevron shows whether the ship is speeding up or slowing down
function FlightHud({ travel }: { travel: NonNullable<ExplorerState["travel"]> }) {
  const target = useRef({ speed: travel.speed ?? 0, remaining: travel.remaining });
  target.current = { speed: travel.speed ?? 0, remaining: travel.remaining };
  const refs = {
    speed: useRef<HTMLSpanElement>(null),
    speedUnit: useRef<HTMLSpanElement>(null),
    trend: useRef<HTMLSpanElement>(null),
    c: useRef<HTMLSpanElement>(null),
    cUnit: useRef<HTMLSpanElement>(null),
    remaining: useRef<HTMLSpanElement>(null),
    remainingUnit: useRef<HTMLSpanElement>(null),
  };

  useEffect(() => {
    const floor = 1e-15;
    let speed = Math.log(Math.max(target.current.speed, floor));
    let remaining = Math.log(Math.max(target.current.remaining ?? floor, floor));
    let trend = 0;
    let last = performance.now();
    // The first moments settle from whatever speed the explorer last measured: no trend yet
    const quietUntil = last + 500;
    let frame = 0;
    const write = (ref: React.RefObject<HTMLSpanElement | null>, text: string) => {
      if (ref.current && ref.current.textContent !== text) ref.current.textContent = text;
    };
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const k = 1 - Math.exp(-dt * 6);
      const wanted = Math.log(Math.max(target.current.speed, floor));
      const step = (wanted - speed) * k;
      speed += step;
      if (target.current.remaining !== undefined) remaining += (Math.log(Math.max(target.current.remaining, floor)) - remaining) * k;
      // Rate of change of speed (orders of magnitude per second), smoothed
      trend += ((dt > 0 ? step / dt : 0) - trend) * Math.min(1, dt * 4);

      const lyPerSecond = Math.exp(speed);
      const v = formatSpeed(lyPerSecond);
      write(refs.speed, v.value);
      write(refs.speedUnit, v.unit);
      const c = lyPerSecond * SECONDS_PER_YEAR;
      write(refs.c, c >= 1 ? `${sig3(c)}×` : c.toFixed(2));
      write(refs.cUnit, "c");
      if (target.current.remaining !== undefined) {
        const d = formatDistance(Math.exp(remaining));
        write(refs.remaining, d.value);
        write(refs.remainingUnit, d.unit);
      } else {
        write(refs.remaining, "—");
        write(refs.remainingUnit, "");
      }
      const arrow = refs.trend.current;
      if (arrow) {
        const strength = now < quietUntil ? 0 : Math.min(1, Math.abs(trend) / 1.5);
        arrow.textContent = trend >= 0 ? "▲" : "▼";
        arrow.style.color = trend >= 0 ? "rgb(103,232,249)" : "rgb(252,211,77)";
        arrow.style.opacity = String(strength < 0.08 ? 0 : 0.35 + 0.65 * strength);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="relative px-3 sm:px-6 py-2.5 sm:py-3.5 animate-[fadeIn_0.4s_ease-out] font-mono select-none">
      <span className="absolute left-0 top-0 w-3 h-3 border-l border-t border-cyan-300/60" />
      <span className="absolute right-0 top-0 w-3 h-3 border-r border-t border-cyan-300/60" />
      <span className="absolute left-0 bottom-0 w-3 h-3 border-l border-b border-cyan-300/60" />
      <span className="absolute right-0 bottom-0 w-3 h-3 border-r border-b border-cyan-300/60" />
      <div className="flex items-end justify-center drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]">
        <HudReadout label="Velocity" primary valueRef={refs.speed} unitRef={refs.speedUnit} trendRef={refs.trend} />
        <HudReadout label="Light speed" valueRef={refs.c} unitRef={refs.cUnit} />
        <HudReadout label="Remaining" valueRef={refs.remaining} unitRef={refs.remainingUnit} />
      </div>
    </div>
  );
}

// `onPick`: something was chosen (the mobile sheet closes itself then)
function MapPanel({ explorer, state, onPick }: { explorer: Explorer; state: ExplorerState; onPick?: () => void }) {
  const [open, setOpen] = useState<string | null>(null);
  const [systemInput, setSystemInput] = useState("");

  const findSystem = () => {
    const index = parseInt(systemInput.replace(/[^0-9]/g, ""), 10);
    if (Number.isFinite(index) && state.galaxy && index < state.galaxy.num_systems) {
      explorer.selectSystem(index);
      onPick?.();
    }
  };

  return (
    <Panel className="w-64 max-w-full max-h-[calc(100dvh-15rem)] overflow-y-auto overscroll-contain p-3 pointer-events-auto">
      <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5">Find a system</div>
      <div className="flex gap-1.5 mb-3">
        <input value={systemInput} onChange={(e) => setSystemInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && findSystem()} placeholder={state.galaxy ? `# 0 – ${(state.galaxy.num_systems - 1).toLocaleString()}` : "#"} className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-400/60" />
        <Button onClick={findSystem}>Find</Button>
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Landmarks</div>
      {POI_GROUPS.map((group) => {
        const items = state.pois.filter((p) => group.kinds.includes(p.kind));
        if (items.length === 0) return null;
        const expanded = open === group.title;
        return (
          <div key={group.title}>
            <button onClick={() => setOpen(expanded ? null : group.title)} className="w-full flex justify-between items-center py-1 text-xs hover:text-white">
              <span className={group.accent}>{group.title}</span>
              <span className="text-gray-500">
                {items.length} {expanded ? "▾" : "▸"}
              </span>
            </button>
            {expanded && (
              <div className="pl-2 pb-1 space-y-0.5">
                {items.slice(0, 80).map((poi) => (
                  <button key={poi.id} onClick={() => (explorer.flyToPoi(poi), onPick?.())} className="block w-full text-left text-[11px] font-mono px-1.5 py-1 sm:py-0.5 rounded hover:bg-white/10 text-gray-400">
                    {poi.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div className="mt-3 pt-2 border-t border-white/10 space-y-1 text-[11px] text-gray-400">
        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-emerald-400" /> Your ship
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rotate-45 border border-amber-300/80" /> Galactic core
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-dashed border-violet-300/70" /> Star cluster
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-fuchsia-300/80" /> Black hole · pulsar
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-dashed border-sky-200/60" /> Neighbour galaxy (zoom out)
        </div>
      </div>
    </Panel>
  );
}

function HyperjumpModal({ explorer, state, onClose }: { explorer: Explorer; state: ExplorerState; onClose: () => void }) {
  const [coords, setCoords] = useState<string[]>(() => (state.coordinates ?? CENTER).map(String));
  const recent = useMemo(() => recentGalaxies(), []);
  const valid = coords.every((c) => /^\d+$/.test(c) && parseInt(c, 10) <= 10_000_000);

  const jump = (target: Coordinates, system: number | null = null) => {
    onClose();
    explorer.hyperjump(target, system);
  };

  return (
    <Modal onClose={onClose}>
      <Panel className="p-5 w-[min(420px,calc(100vw-2rem))]">
        <div>
          <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">Hyperjump computer</div>
          <div className="text-lg font-semibold text-white mb-3">Where to?</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Galaxy coordinates (0 – 10,000,000)</div>
          <div className="flex gap-1.5">
            {["x", "y", "z"].map((axis, i) => (
              <input
                key={axis}
                value={coords[i]}
                autoFocus={i === 0}
                onChange={(e) => setCoords((c) => c.map((v, j) => (j === i ? e.target.value.replace(/[^0-9]/g, "") : v)))}
                onKeyDown={(e) => e.key === "Enter" && valid && jump(coords.map((v) => parseInt(v, 10)) as Coordinates)}
                className="w-full min-w-0 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400/60"
                placeholder={axis}
              />
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            <Button tone="primary" className="flex-1" disabled={!valid} onClick={() => jump(coords.map((v) => parseInt(v, 10)) as Coordinates)}>
              Jump<Key>⏎</Key>
            </Button>
            <Button
              className="flex-1"
              onClick={async () => {
                const location = await fetchRandomLocation();
                jump(location.coordinates, location.system);
              }}
            >
              Somewhere random
            </Button>
          </div>
          {recent.length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">Recently visited</div>
              <div className="space-y-0.5">
                {recent.map((g) => (
                  <button key={g.coordinates.join(",")} onClick={() => jump(g.coordinates)} className="w-full flex justify-between text-xs px-2 py-1 rounded hover:bg-white/10">
                    <span className="text-gray-200">{pretty(g.name)}</span>
                    <span className="text-gray-500 font-mono">{g.type} · {g.coordinates.join(",")}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Panel>
    </Modal>
  );
}

const VIEW_TOGGLES: Array<{ key: ViewToggle; label: string; description: string }> = [
  { key: "shipView", label: "Ship view", description: "Chase camera behind your saucer" },
  { key: "universeGrid", label: "Universe grid", description: "The cube cells around this galaxy and its 26 neighbours" },
  { key: "flightHud", label: "Flight HUD", description: "Speed, light speed and distance left while travelling" },
  { key: "soundEffects", label: "Sound effects", description: "Quiet ship sounds for flights, jumps and selections" },];

const Toggle: React.FC<{ label: string; description: string; checked: boolean; onChange: (value: boolean) => void }> = ({ label, description, checked, onChange }) => (
  <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-left transition-colors">
    <span className="min-w-0">
      <span className={`block text-sm ${checked ? "text-cyan-200" : "text-gray-200"}`}>{label}</span>
      <span className="block text-[10px] text-gray-500">{description}</span>
    </span>
    <span className={`shrink-0 w-8 h-4 rounded-full relative transition-colors ${checked ? "bg-cyan-400/80" : "bg-white/15"}`}>
      <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${checked ? "left-[18px]" : "left-0.5"}`} />
    </span>
  </button>
);

// Panels dropping from the top bar: the screen below it, minus a margin
const DROPDOWN_STYLE: React.CSSProperties = { maxHeight: "calc(100dvh - 4.75rem)", maxWidth: "calc(100vw - 1.5rem)" };

function SettingsPanel({ explorer, state, onClose }: { explorer: Explorer; state: ExplorerState; onClose: () => void }) {
  const [calm, setCalm] = useState(() => reducedFlashing());
  const choose = (level: QualityLevel) => {
    // Antialiasing and shadows live in the WebGL context: those switches reload the page
    // (the URL keeps the ship's location, so nothing is lost)
    if (explorer.setQuality(level)) window.location.reload();
  };
  return (
    <Panel className="w-72 max-w-full p-4 pointer-events-auto">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Graphics quality</div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xs">
          ✕
        </button>
      </div>
      <div className="space-y-1.5">
        {(Object.keys(QUALITY_PROFILES) as QualityLevel[]).map((level) => {
          const profile = QUALITY_PROFILES[level];
          const active = state.quality === level;
          return (
            <button key={level} onClick={() => choose(level)} className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${active ? "border-cyan-400/70 bg-cyan-400/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
              <div className={`text-sm ${active ? "text-cyan-200" : "text-gray-200"}`}>{profile.label}</div>
              <div className="text-[10px] text-gray-500">
                {profile.description} · {profile.fps ? `${profile.fps} fps` : "uncapped"} · {Math.round(profile.maxStars / 1000)}k stars
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-[11px] text-gray-500 flex justify-between">
        <span>Rendering at</span>
        <span className="font-mono text-gray-300">{state.fps} fps</span>
      </div>
      <p className="mt-1 text-[10px] text-gray-600">When nothing moves the frame rate drops on its own to save battery.</p>

      <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-4 mb-2">View</div>
      <div className="space-y-1">
        {VIEW_TOGGLES.map(({ key, label, description }) => (
          <Toggle key={key} label={label} description={description} checked={state.view[key]} onChange={(value) => explorer.setViewOption(key, value)} />
        ))}
      </div>

      <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-4 mb-2">Accessibility</div>
      <Toggle
        label="Reduced flashing"
        description="No white flashes in jumps and crossings, gentler hyperspace. For photosensitive pilots"
        checked={calm}
        onChange={(value) => {
          setReducedFlashing(value);
          setCalm(value);
        }}
      />
    </Panel>
  );
}

function Help({ onClose }: { onClose: () => void }) {
  const rows: Array<[string, string]> = [
    ["Drag", "Look around"],
    ["Scroll / pinch", "Zoom across scales"],
    ["Right drag / Shift", "Pan"],
    ["W S · ↑ ↓", "Thrust forward / back"],
    ["A D · ← →", "Turn"],
    ["Q E · R F", "Slide sideways · up / down"],
    ["Click", "Target a star or planet"],
    ["Double-click · ⏎", "Engage: travel / go into orbit"],
    ["Esc", "Back out one level"],
    ["M", "Galaxy map"],
    ["H", "Return to your ship"],
    ["J", "Hyperjump to another galaxy"],
    ["P", "Take a photo, with a QR code to this place"],
  ];
  return (
    <Modal onClose={onClose}>
      <Panel className="p-6 max-w-md">
        <div className="text-lg font-semibold text-white mb-1">Welcome aboard</div>
        <p className="text-sm text-gray-400 mb-4">Your ship is docked at a star. Every point of light out there is a real star system you can travel to: pick a target, engage, and go into orbit around its planets.</p>
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs">
          {rows.map(([k, v]) => (
            <React.Fragment key={k}>
              <span className="text-gray-500">{k}</span>
              <span>{v}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="mt-5 text-right">
          <Button tone="primary" onClick={onClose}>
            Let's go
          </Button>
        </div>
      </Panel>
    </Modal>
  );
}

// Our universe, or one of the multiverse we are visiting (with the way home)
function MultiverseLink({ universe, onOpen, onCross }: { universe: UniverseConfig | null; onOpen: () => void; onCross: (crossing: Crossing) => void }) {
  if (universe?.remote) {
    return (
      <div className="flex items-center rounded-lg border border-fuchsia-400/40 bg-fuchsia-500/10 text-xs overflow-hidden" title={`Exploring a remote universe from node ${universe.node_id}`}>
        <button onClick={onOpen} className="flex items-center gap-1.5 px-3 py-1.5 text-fuchsia-100 hover:bg-fuchsia-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-300 animate-pulse" />
          Remote · <span className="max-w-[9rem] truncate">{universe.seed_str || universe.seed_name || "unknown seed"}</span>
        </button>
        <button onClick={() => onCross({ url: "/multiverse/exit", name: "your universe", home: true })} className="px-2.5 py-1.5 border-l border-fuchsia-400/30 text-fuchsia-200/80 hover:bg-fuchsia-500/20 hover:text-white" title="Back to your own universe">
          Exit
        </button>
      </div>
    );
  }
  return (
    <button onClick={onOpen} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/15 text-gray-200 border border-white/10 transition-colors" title="Universes discovered through the P2P network">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse" />
      Multiverse
    </button>
  );
}

type MenuActions = Record<"multiverse" | "exitRemote" | "stargate" | "ship" | "map" | "hyperjump" | "photo" | "settings" | "help" | "faq" | "music", () => void>;

// Below the large breakpoint the top bar does not fit: everything goes behind a
// hamburger, in a sheet that drops from the top right
function MobileMenu({ universe, musicMuted, actions }: { universe: UniverseConfig | null; musicMuted: boolean; actions: MenuActions }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  // A touch anywhere else closes it
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close, true);
    return () => document.removeEventListener("pointerdown", close, true);
  }, [open]);
  const run = (action: () => void) => () => {
    setOpen(false);
    action();
  };
  const Item = ({ onClick, label, hint, accent = "text-gray-100" }: { onClick: () => void; label: React.ReactNode; hint?: string; accent?: string }) => (
    <button onClick={run(onClick)} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-white/10 active:bg-white/15 transition-colors">
      <span className={accent}>{label}</span>
      {hint && <span className="text-[11px] text-gray-500 truncate">{hint}</span>}
    </button>
  );
  return (
    <div ref={rootRef} className="lg:hidden relative pointer-events-auto shrink-0">
      <button onClick={() => setOpen(!open)} className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-slate-950/70 border border-white/15 backdrop-blur-md" aria-label="Menu" aria-expanded={open}>
        {[-6, 0, 6].map((y, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 w-5 h-0.5 -ml-2.5 -mt-px rounded bg-gray-100 transition-all duration-300"
            style={{ transform: open ? (i === 1 ? "scaleX(0)" : `rotate(${i === 0 ? 45 : -45}deg)`) : `translateY(${y}px)`, opacity: open && i === 1 ? 0 : 1 }}
          />
        ))}
        {universe?.remote && !open && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-fuchsia-400 border border-black" />}
      </button>
      <div className={`absolute right-0 top-12 w-[min(18rem,calc(100vw-1.5rem))] origin-top-right transition-all duration-200 ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
        <Panel className="overflow-hidden py-1.5">
          {universe?.remote ? (
            <>
              <Item onClick={actions.multiverse} label="Multiverse" hint={`Remote · ${universe.seed_str || universe.seed_name}`} accent="text-fuchsia-200" />
              <Item onClick={actions.exitRemote} label="Return to your universe" accent="text-fuchsia-200" />
            </>
          ) : (
            <Item onClick={actions.multiverse} label="Multiverse" hint="P2P universes" />
          )}
          <Item onClick={actions.stargate} label="Stargate" hint="Links & saved places" />
          <Item onClick={actions.map} label="Galaxy map" />
          <Item onClick={actions.hyperjump} label="Hyperjump" hint="Another galaxy" />
          <Item onClick={actions.photo} label="Take a photo" hint="With a QR code to this place" />
          <div className="my-1.5 border-t border-white/10" />
          <Item onClick={actions.ship} label="Hangar" hint="Choose your ship" />
          <Item onClick={actions.settings} label="Graphics & view" />
          <Item onClick={actions.music} label={musicMuted ? "Music: off" : "Music: on"} accent={musicMuted ? "text-gray-400" : "text-cyan-200"} />
          <Item onClick={actions.help} label="Controls" />
          <Item onClick={actions.faq} label="F.A.Q." />
          <div className="my-1.5 border-t border-white/10" />
          <div className="flex items-center justify-between px-4 py-2">
            <a href="https://www.banshee.pro" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100">
              <img src="https://www.banshee.pro/images/banshee-logo.png" alt="Banshee" className="h-3.5 w-auto max-w-[100px] object-contain" />
            </a>
            <a href="https://x.com/surcebeats" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white">
              @SurceBeats
            </a>
          </div>
        </Panel>
      </div>
    </div>
  );
}

// Bottom corners: who made this (left) and the archive plus the author (right)
// ---- the hangar: which ship flies in front of the camera ---------------------------------

const SHIPS: Array<{ kind: ShipKind; name: string; description: string }> = [
  { kind: "saucer", name: "Saucer", description: "A disc with a ventral drive ring. Steady and smooth" },
  { kind: "interceptor", name: "Interceptor", description: "A delta wing with twin engines. Banks hard into every turn" },
];

// Each ship's silhouette, as the button and the hangar draw it
const ShipIcon: React.FC<{ kind: ShipKind; size?: number; className?: string }> = ({ kind, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" className={className}>
    {kind === "saucer" ? (
      <>
        <ellipse cx={12} cy={13} rx={10} ry={2.6} />
        <path d="M8 11.2c.6-2.4 2.1-3.6 4-3.6s3.4 1.2 4 3.6" />
        <path d="M10 15.6l-.8 1.8M14 15.6l.8 1.8" />
      </>
    ) : (
      <>
        <path d="M12 2.5l1.6 6.3 8 8.2v1.6l-6.6-1.4-.6 2.6h-4.8l-.6-2.6L2.4 18.6V17l8-8.2z" />
        <path d="M11 9.5h2v4.5h-2z" />
      </>
    )}
  </svg>
);

function Hangar({ current, onChoose, onClose }: { current: ShipKind; onChoose: (kind: ShipKind) => void; onClose: () => void }) {
  return (
    <Panel className="w-72 max-w-full p-4 pointer-events-auto">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Hangar</div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xs" aria-label="Close">
          ✕
        </button>
      </div>
      <div className="space-y-1.5">
        {SHIPS.map((ship) => {
          const active = ship.kind === current;
          return (
            <button key={ship.kind} onClick={() => onChoose(ship.kind)} className={`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg border transition-colors ${active ? "border-cyan-400/70 bg-cyan-400/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}>
              <span className={`shrink-0 w-11 h-11 rounded-md flex items-center justify-center bg-black/40 border border-white/10 ${active ? "text-cyan-200" : "text-gray-300"}`}>
                <ShipIcon kind={ship.kind} size={30} />
              </span>
              <span className="min-w-0">
                <span className={`block text-sm ${active ? "text-cyan-200" : "text-gray-200"}`}>{ship.name}</span>
                <span className="block text-[10px] text-gray-500 leading-snug">{ship.description}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] text-gray-600">Seen from the chase camera when Ship view is on.</p>
    </Panel>
  );
}

// Square, icon-only buttons for the bottom-right corner
const CORNER_BUTTON = "w-8 h-8 flex items-center justify-center rounded-lg bg-slate-950/60 hover:bg-white/15 border border-white/10 backdrop-blur-md transition-colors";

// A line icon, struck through when its sound is off
const SoundIcon: React.FC<{ on: boolean; children: React.ReactNode }> = ({ on, children }) => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={on ? "text-cyan-300" : "text-gray-500"}>
    {children}
    {!on && <path d="M4 4l16 16" />}
  </svg>
);

function Corners({ onFaq, musicMuted, onToggleMusic, sfxOn, onToggleSfx }: { onFaq: () => void; musicMuted: boolean; onToggleMusic: () => void; sfxOn: boolean; onToggleSfx: () => void }) {
  return (
    <>
      <a href="https://www.banshee.pro" target="_blank" rel="noopener noreferrer" className="hidden lg:flex absolute bottom-3 left-3 items-center gap-2 px-2 py-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-white/5 transition-opacity pointer-events-auto" title="Banshee Technologies">
        <img src="https://www.banshee.pro/images/banshee-logo.png" alt="Banshee" className="h-3.5 w-auto max-w-[110px] object-contain" draggable={false} />
      </a>
      <div className="hidden lg:flex absolute bottom-3 right-3 items-center gap-1.5 pointer-events-auto">
        <button onClick={onToggleMusic} className={CORNER_BUTTON} title={musicMuted ? "Play the soundtrack" : "Mute the soundtrack"} aria-label={musicMuted ? "Play the soundtrack" : "Mute the soundtrack"} aria-pressed={!musicMuted}>
          <SoundIcon on={!musicMuted}>
            <path d="M9 18V5l11-2v13" />
            <circle cx={6} cy={18} r={3} />
            <circle cx={17} cy={16} r={3} />
          </SoundIcon>
        </button>
        <button onClick={onToggleSfx} className={CORNER_BUTTON} title={sfxOn ? "Mute the sound effects" : "Turn the sound effects on"} aria-label={sfxOn ? "Mute the sound effects" : "Turn the sound effects on"} aria-pressed={sfxOn}>
          <SoundIcon on={sfxOn}>
            <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
            {sfxOn && <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />}
          </SoundIcon>
        </button>
        <button onClick={onFaq} className={CORNER_BUTTON} title="The Atlas F.A.Q." aria-label="The Atlas F.A.Q.">
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
            <circle cx={12} cy={12} r={9.5} />
            <path d="M9.2 9.3a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.5-2.8 4" />
            <path d="M12 17.3v.2" />
          </svg>
        </button>
        <a href="https://x.com/surcebeats" target="_blank" rel="noopener noreferrer" className={CORNER_BUTTON} title="@SurceBeats on X" aria-label="@SurceBeats on X">
          <svg width={13} height={13} viewBox="0 0 24 24" className="text-gray-300">
            <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
      </div>
    </>
  );
}

const ExploreLayout: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [explorer, setExplorer] = useState<Explorer | null>(null);
  // Photos: a flash the moment the frame is taken (a soft one with reduced flashing),
  // then a short note once it is saved
  const flashRef = useRef<HTMLDivElement>(null);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const photoRef = useRef<() => void>(() => {});
  photoRef.current = () => {
    if (!explorer) return;
    const flash = () => flashRef.current?.animate(reducedFlashing() ? [{ opacity: 0.12 }, { opacity: 0 }] : [{ opacity: 0.55 }, { opacity: 0 }], { duration: reducedFlashing() ? 700 : 420, easing: "ease-out" });
    explorer
      .takePhoto(flash)
      .then((taken) => taken && setPhotoNote("Photo saved"))
      .catch(() => setPhotoNote("The photo could not be saved"));
  };
  useEffect(() => {
    if (!photoNote) return;
    const timer = setTimeout(() => setPhotoNote(null), 2200);
    return () => clearTimeout(timer);
  }, [photoNote]);
  // The note keeps its text while it fades out
  const lastPhotoNote = useRef("");
  if (photoNote) lastPhotoNote.current = photoNote;
  const [showHyperjump, setShowHyperjump] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  // (/universe-faq, the old F.A.Q. page, lands here as /#faq)
  const [showFaq, setShowFaq] = useState(() => window.location.hash === "#faq");
  const [showStargate, setShowStargate] = useState(false);
  const [showHangar, setShowHangar] = useState(false);
  const [showLandmarks, setShowLandmarks] = useState(false);
  const [jumpPlan, setJumpPlan] = useState<JumpPlan | null>(null);
  const [showMultiverse, setShowMultiverse] = useState(() => window.location.hash === "#multiverse");
  const [crossing, setCrossing] = useState<Crossing | null>(null);
  const universe = useMemo(() => readUniverseConfig(), []);
  const music = useMemo(() => new Music("/static/audio/atlas-space-drift.mp3"), []);
  const [musicMuted, setMusicMuted] = useState(music.muted);
  const [gate, setGate] = useState(true);
  const launchRef = useRef<(() => void) | null>(null);
  const [showHelp, setShowHelp] = useState(() => {
    try {
      return localStorage.getItem("atlas-explore-help") !== "seen";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const instance = new Explorer(containerRef.current, loadQuality());
    setExplorer(instance);
    (window as any).atlasExplorer = instance; // handy from the devtools console

    // Where the ship starts is settled while the front door is up; the jump itself waits
    // for the dive
    const destination = (async (): Promise<{ coordinates: Coordinates; system: number | null; planet: number | null; plan: JumpPlan | null }> => {
      const link = parseHash();
      if (link) return { ...link, plan: link.via === "stargate" ? { kind: "stargate", coordinates: link.coordinates, system: link.system, planet: link.planet } : null };
      const stored = loadStoredShip();
      if (stored) return { ...stored, plan: null };
      const current = await fetchCurrentLocation();
      if (current) return { coordinates: current.coordinates, system: current.system, planet: null, plan: null };
      // Nowhere yet: the ship is thrown at a random spot of the universe
      try {
        const random = await fetchRandomLocation();
        return { ...random, plan: { kind: "random", coordinates: random.coordinates, system: random.system, planet: random.planet } };
      } catch {
        return { coordinates: CENTER, system: null, planet: null, plan: null };
      }
    })();
    launchRef.current = () =>
      destination.then((d) => {
        if (d.plan) setJumpPlan(d.plan);
        instance.loadGalaxy(d.coordinates, { system: d.system, planet: d.planet });
      });

    return () => instance.dispose();
  }, []);

  useEffect(() => {
    (window as any).atlasMusic = music; // devtools, like atlasExplorer
    return () => music.dispose();
  }, [music]);

  // The click on the front door: sound on (it must start inside the click), and the
  // drive charges while the door accelerates
  const ignite = () => {
    music.start();
    sfx.attach(music.context);
    sfx.dive(DIVE_SECONDS);
  };

  // At full speed: into hyperspace, out in front of the first galaxy
  const dive = () => {
    explorer?.jumpIn();
    launchRef.current?.();
    launchRef.current = null;
    setGate(false);
    // First visit: the welcome card waits until the arrival has been seen
    if (showHelp) {
      setShowHelp(false);
      setTimeout(() => setShowHelp(true), 7000);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "j" || e.key === "J") setShowHyperjump(true);
      if (e.key === "?") setShowHelp((v) => !v);
      // (not ⌘P / Ctrl+P, which print)
      if ((e.key === "p" || e.key === "P") && !e.metaKey && !e.ctrlKey && !e.altKey && !e.repeat) photoRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const fallback = useMemo(() => () => null as unknown as ExplorerState, []);
  const state = useSyncExternalStore(explorer?.subscribe ?? (() => () => {}), explorer?.getState ?? fallback);

  // The boot screen (template partial) follows the real start-up and lifts once the
  // first galaxy is drawn
  // first galaxy is drawn. With the front door up, the door takes over from it at once
  useEffect(() => {
    const boot = (window as any).atlasPreloader;
    if (!boot) return;
    if (gate) return boot.done();
    if (!state) return;
    if (state.mode !== "loading" || state.error) boot.done();
    else if (state.status) boot.step(state.status, state.galaxy ? 0.75 : 0.45);
  }, [gate, state?.mode, state?.status, state?.error, !!state?.galaxy]);

  useEffect(() => {
    if (state) writeHash(state);
  }, [state?.ship?.coordinates.join(","), state?.ship?.system, state?.ship?.planet]);

  // Into another universe (or back home): the drive spins up, the screen burns white,
  // and the page reloads on the other side
  const cross = (target: Crossing) => {
    if (crossing) return;
    setShowMultiverse(false);
    setShowHelp(false);
    setShowStargate(false);
    setShowSettings(false);
    setJumpPlan(null);
    setCrossing(target);
    explorer?.engageDrive();
    setTimeout(() => window.location.assign(target.url), 2300);
  };

  const dismissHelp = () => {
    setShowHelp(false);
    try {
      localStorage.setItem("atlas-explore-help", "seen");
    } catch {
      /* private mode */
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-gray-200 overflow-hidden font-sans select-none">
      <div ref={containerRef} className="absolute inset-0" />
      <div ref={flashRef} className="absolute inset-0 z-[60] bg-white opacity-0 pointer-events-none" />
      <Presence show={!!photoNote}>
        <div className="absolute top-20 inset-x-0 z-[60] flex justify-center pointer-events-none">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-950/85 border border-cyan-300/30 backdrop-blur-md font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-100">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300">
              <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.4-2h5.8l1.4 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
              <circle cx={12} cy={13} r={3.4} />
            </svg>
            {lastPhotoNote.current}
          </div>
        </div>
      </Presence>

      {explorer && state && (
        <>
          {/* Above every overlay (HUD, readouts, drop-down panels), below the modals (z-50),
              so the mobile menu always opens on top */}
          <div className="absolute top-0 inset-x-0 z-[45] p-3 flex justify-between items-start gap-3 pointer-events-none bg-gradient-to-b from-black/70 to-transparent">
            <LocationBar state={state} />
            <MobileMenu
              universe={universe}
              musicMuted={musicMuted}
              actions={{
                multiverse: () => setShowMultiverse(true),
                exitRemote: () => cross({ url: "/multiverse/exit", name: "your universe", home: true }),
                stargate: () => (setShowStargate(true), setShowSettings(false), setShowHangar(false)),
                ship: () => (setShowHangar(true), setShowSettings(false), setShowStargate(false)),
                map: () => explorer.openMap(),
                hyperjump: () => setShowHyperjump(true),
                // After the sheet has closed, so it is not in the way of the flash
                photo: () => setTimeout(() => photoRef.current(), 250),
                settings: () => (setShowSettings(true), setShowStargate(false), setShowHangar(false)),
                help: () => setShowHelp(true),
                faq: () => setShowFaq(true),
                music: () => {
                  music.setMuted(!musicMuted);
                  setMusicMuted(!musicMuted);
                },
              }}
            />
            <div className="hidden lg:flex gap-2 pointer-events-auto shrink-0">
              <MultiverseLink universe={universe} onOpen={() => setShowMultiverse(true)} onCross={cross} />
              <Button onClick={() => (setShowStargate((v) => !v), setShowSettings(false), setShowHangar(false))} title="Stargate links and saved places" className="flex items-center gap-1.5">
                <svg width={14} height={14} viewBox="0 0 24 24" className="text-cyan-300" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={1.6}>
                  <path d="M14 12a6 6 0 1 1-6-6" />
                  <path d="M10 12a6 6 0 1 1 6 6" opacity={0.55} />
                </svg>
                Stargate
              </Button>
              <Button onClick={() => explorer.openMap()}>
                Galaxy map<Key>M</Key>
              </Button>
              <Button onClick={() => setShowHyperjump(true)}>
                Hyperjump<Key>J</Key>
              </Button>
              <Button onClick={() => photoRef.current()} title="Take a photo (P): PNG with a QR code to this place" aria-label="Take a photo" className="flex items-center !px-2.5">
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.4-2h5.8l1.4 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
                  <circle cx={12} cy={13} r={3.4} />
                </svg>
              </Button>
              <Button onClick={() => (setShowHangar((v) => !v), setShowSettings(false), setShowStargate(false))} title="Hangar: choose your ship" aria-label="Hangar: choose your ship" className="flex items-center !px-2">
                <ShipIcon kind={state.view.ship} size={17} className="text-cyan-200" />
              </Button>
              <Button onClick={() => (setShowSettings((v) => !v), setShowStargate(false), setShowHangar(false))} title="Graphics & view" aria-label="Graphics & view" className="flex items-center !px-2.5">
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" />
                  <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03z" />
                </svg>
              </Button>
              <Button onClick={() => setShowHelp(true)} title="Controls" aria-label="Controls" className="flex items-center !px-2.5">
                {/* A keyboard: the controls (the F.A.Q. keeps the question mark, bottom right) */}
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                  <rect x={2.5} y={6} width={19} height={12} rx={2} />
                  <path d="M6 9.5h.01M9 9.5h.01M12 9.5h.01M15 9.5h.01M18 9.5h.01M6 12.2h.01M9 12.2h.01M12 12.2h.01M15 12.2h.01M18 12.2h.01M8 15h8" />
                </svg>
              </Button>
            </div>
          </div>

          {jumpPlan && (
            <div className="absolute top-16 inset-x-0 flex justify-center pointer-events-none">
              <JumpSequence plan={jumpPlan} state={state} onDone={() => setJumpPlan(null)} />
            </div>
          )}

          {/* Drop-down panels: above the console, and never taller than the screen */}
          <Presence show={showSettings}>
            <Drop className="absolute top-16 right-3 z-40 overflow-y-auto overscroll-contain rounded-xl" style={DROPDOWN_STYLE}>
              <SettingsPanel explorer={explorer} state={state} onClose={() => setShowSettings(false)} />
            </Drop>
          </Presence>

          <Presence show={showHangar}>
            <Drop className="absolute top-16 right-3 z-40 overflow-y-auto overscroll-contain rounded-xl" style={DROPDOWN_STYLE}>
              <Hangar current={state.view.ship} onChoose={(kind) => explorer.setViewOption("ship", kind)} onClose={() => setShowHangar(false)} />
            </Drop>
          </Presence>

          <Presence show={showStargate}>
            <Drop className="absolute top-16 right-3 z-40 overflow-y-auto overscroll-contain rounded-xl" style={DROPDOWN_STYLE}>
              <StargatePanel explorer={explorer} state={state} universe={universe} onClose={() => setShowStargate(false)} />
            </Drop>
          </Presence>

          <Corners
            onFaq={() => setShowFaq(true)}
            musicMuted={musicMuted}
            onToggleMusic={() => {
              music.setMuted(!musicMuted);
              setMusicMuted(!musicMuted);
            }}
            sfxOn={state.view.soundEffects}
            onToggleSfx={() => explorer.setViewOption("soundEffects", !state.view.soundEffects)}
          />

          {state.mapView && !state.arrival && state.pois.length > 0 && (
            <div className="absolute top-20 left-3 pointer-events-none hidden md:block">
              <MapPanel explorer={explorer} state={state} />
            </div>
          )}

          {/* On small screens the map's landmarks and search live behind a button */}
          {state.mapView && !state.arrival && state.pois.length > 0 && (
            <div className="md:hidden absolute top-16 left-3 z-30 pointer-events-auto animate-[fadeIn_0.3s_ease-out]">
              <button
                onClick={() => setShowLandmarks((v) => !v)}
                aria-expanded={showLandmarks}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border backdrop-blur-md transition-colors ${showLandmarks ? "bg-cyan-400/15 border-cyan-400/50 text-cyan-100" : "bg-slate-950/70 border-white/15 text-gray-200"}`}
              >
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
                  <circle cx={12} cy={10} r={2.3} />
                </svg>
                Landmarks
                <span className="text-gray-500">{state.pois.length}</span>
              </button>
            </div>
          )}
          <Presence show={showLandmarks && state.mapView && !state.arrival}>
            <Drop className="md:hidden absolute top-[6.25rem] left-3 z-30" origin="top left" style={{ width: "min(18rem, calc(100vw - 1.5rem))" }}>
              <MapPanel explorer={explorer} state={state} onPick={() => setShowLandmarks(false)} />
            </Drop>
          </Presence>

          {state.mode !== "loading" && (
            <div data-ship-floor className="absolute bottom-3 inset-x-0 flex justify-center pointer-events-none">
              <Console explorer={explorer} state={state} />
            </div>
          )}

          {state.view.flightHud && state.travel && state.travel.speed !== undefined && !state.arrival && !crossing && (
            <div className={`absolute inset-x-0 flex justify-center pointer-events-none transition-[top] duration-500 ${jumpPlan ? "top-[150px]" : "top-[14%]"}`}>
              <FlightHud travel={state.travel} />
            </div>
          )}

          {state.arrival && (
            <div className="absolute inset-x-0 top-[22%] flex justify-center pointer-events-none">
              <div className="text-center animate-[fadeIn_1.2s_ease-out]">
                <div className="text-[11px] uppercase tracking-[0.5em] text-cyan-300/80 mb-2">Arriving at</div>
                <div className="text-4xl sm:text-5xl font-light tracking-wide text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]">{state.arrival.name}</div>
                <div className="text-sm text-gray-300 mt-2 drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]">
                  {state.arrival.type} galaxy · {state.arrival.systems.toLocaleString()} star systems
                </div>
              </div>
            </div>
          )}

          {state.status && !state.error && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-cyan-400/20 border-t-cyan-300 animate-spin" />
                <div className="text-sm text-cyan-100/80 tracking-wide">{state.status}</div>
              </div>
            </div>
          )}

          {state.error && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Panel className="p-5 max-w-sm text-center">
                <div className="text-red-300 text-sm mb-3">{state.error}</div>
                <Button onClick={() => explorer.loadGalaxy(CENTER)}>Return to the center of the universe</Button>
              </Panel>
            </div>
          )}

          {state.mode === "galaxy" && state.galaxy?.num_systems === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Panel className="p-5 max-w-sm text-center pointer-events-auto">
                <div className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300/80 mb-1">{state.galaxy.galaxy_type}</div>
                <div className="text-sm text-gray-300 mb-3">No star systems have formed here. Only darkness, and whatever lives at its center.</div>
                <Button onClick={() => setShowHyperjump(true)}>Hyperjump somewhere else</Button>
              </Panel>
            </div>
          )}

          <Presence show={showHyperjump}>
            <HyperjumpModal explorer={explorer} state={state} onClose={() => setShowHyperjump(false)} />
          </Presence>
          <Presence show={showHelp}>
            <Help onClose={dismissHelp} />
          </Presence>
          <Presence show={showFaq}>
            <FaqPanel onClose={() => setShowFaq(false)} />
          </Presence>
          <Presence show={showMultiverse}>
            <MultiversePanel universe={universe} onClose={() => setShowMultiverse(false)} onCross={cross} />
          </Presence>
          {crossing && <CrossingVeil crossing={crossing} />}
        </>
      )}

      <DiveGate onIgnite={ignite} onDive={dive} />
    </div>
  );
};

export default ExploreLayout;
