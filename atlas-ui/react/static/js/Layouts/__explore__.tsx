// atlas-ui/react/static/js/Layouts/__explore__.tsx
//
// The cockpit: a thin HUD over the universe. Top: where the ship is. Bottom: the
// console (travel status, current target, quick destinations). The galaxy map adds
// the landmarks panel; J opens the hyperjump computer.
//
// Every text is in the pilot's language (i18n/i18n.ts); the names of places are never
// translated, and an owner's name for a place replaces the generated one (core/owners).

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
import { propertyLine, type Ownership } from "../Explore/core/owners.ts";
import { sealPath } from "../Explore/ui/seals.ts";
import { CrossingVeil, MultiversePanel, type Crossing } from "../Explore/ui/MultiversePanel.tsx";
import { StargatePanel } from "../Explore/ui/StargatePanel.tsx";
import { JumpSequence, type JumpPlan } from "../Explore/ui/JumpSequence.tsx";
import { readUniverseConfig, type UniverseConfig } from "../Explore/ui/universe.ts";
import { L, amount, num, t } from "../i18n/i18n.ts";
import { LanguageSelect } from "../i18n/LanguageSelect.tsx";

const CENTER: Coordinates = [5000000, 5000000, 5000000];

// The soundtrack, shuffled (see Music). MP3: every browser decodes it, AAC not everywhere
const TRACKS = ["atlas-origin", "atlas-air-born", "atlas-deep-dive", "atlas-the-family"].map((name) => `/static/audio/${name}.mp3`);

const pretty = (name: string) => name.replace(/_/g, " ");

// A touch screen, without a mouse
const TOUCH = typeof window !== "undefined" && !!window.matchMedia?.("(pointer: coarse)").matches;

const POI_GROUPS: Array<{ kinds: PointOfInterest["kind"][]; title: string; accent: string }> = [
  { kinds: ["core", "quasar", "torus"], title: "Galactic center", accent: "text-amber-300" },
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

// ---- names, as everybody sees them ---------------------------------------------------

// The system the view is in (or the ship's): planets are named within it
const viewSystem = (state: ExplorerState) => state.system?.index ?? state.ship?.system ?? null;

const planetName = (state: ExplorerState, planet: { index: number; name: string }) => state.owners.planetName(planet, viewSystem(state));

// The ship's system, as it is called now
const shipSystemTitle = (state: ExplorerState) => (state.ship && state.owners.system(state.ship.system)?.name) ?? state.shipSystemName;

// (the Singularity Void is a name of its own, before there are galaxies: never "… galaxy")
const galaxyKind = (type: string) => (type === "Singularity Void" ? type : t("%@ galaxy", L(type)));

// ---- small pieces ---------------------------------------------------------------------

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

// An owner's seal (one of the twenty the registry knows), in the owners' emerald
const SealIcon: React.FC<{ id: string | null; size?: number }> = ({ id, size = 13 }) => {
  const path = sealPath(id);
  if (!path) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0 text-emerald-200" aria-hidden="true">
      <path d={path} fill="currentColor" />
    </svg>
  );
};

// Whose a place is, since when, and its owner's note (all of it the owner's own words,
// shown as text)
function OwnerLine({ own }: { own: Ownership }) {
  return (
    <div className="mt-1.5 min-w-0">
      <div className="flex items-center gap-1.5 text-xs text-emerald-200 min-w-0">
        <SealIcon id={own.seal} />
        <span className="truncate">{propertyLine(own)}</span>
      </div>
      {own.note && <div className="text-xs italic text-gray-400 mt-0.5 break-words">{t("“%@”", own.note)}</div>}
    </div>
  );
}

// Up one level (Esc), always in the same place: its words and key on a wide screen, the
// arrow alone on a phone
function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button onClick={onClick} title={label} aria-label={label} className="shrink-0 whitespace-nowrap">
      <span className="hidden sm:inline">
        {label}
        <Key>Esc</Key>
      </span>
      <span className="sm:hidden text-sm leading-none px-0.5" aria-hidden="true">
        ‹
      </span>
    </Button>
  );
}

function LocationBar({ state, shipTitle }: { state: ExplorerState; shipTitle: string | null }) {
  const parts: Array<{ label: string; sub: string }> = [];
  if (state.galaxy) parts.push({ label: pretty(state.galaxy.name), sub: `${galaxyKind(state.galaxy.galaxy_type)} · ${state.galaxy.coordinates.join(", ")}` });
  if (shipTitle) parts.push({ label: shipTitle, sub: state.ship ? t("system #%@", amount(state.ship.system)) : "" });
  if (state.orbiting) parts.push({ label: planetName(state, state.orbiting), sub: t("in orbit · %@", L(state.orbiting.planet_type)) });
  if (state.visitingMoon) parts.push({ label: pretty(state.visitingMoon.name), sub: t("%@ moon", L(state.visitingMoon.type)) });
  return (
    <div className="flex items-center gap-3 pointer-events-auto min-w-0">
      <a href="/" className="shrink-0 text-sm font-bold tracking-[0.35em] text-white/90 hover:text-white" title={t("The Atlas, third version")}>
        ATLAS<span className="text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">3</span>
      </a>
      <div className="flex items-center gap-2 pl-3 border-l border-white/15 min-w-0">
        <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" title={t("Your ship")} />
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

// Where up one level leads from here, if anywhere
function upLabel(state: ExplorerState): string | null {
  if (state.mode === "system") return t("Leave system");
  if (state.mode === "galaxy") return state.universeView ? null : state.mapView ? t("To the universe") : t("Galaxy view");
  return null;
}

function TargetBlock({ explorer, state }: { explorer: Explorer; state: ExplorerState }) {
  const target = state.target;
  // Picking another planet while in orbit shows it as the next stop
  const otherPlanet = target?.kind === "planet" && state.orbiting && target.planet.index !== state.orbiting.index;
  const system = viewSystem(state);

  if (target?.kind === "star") {
    const s = target.star;
    const temperature = target.temperature >= 100000 ? `${amount(target.temperature / 1000, 3)}k K` : `${amount(target.temperature)} K`;
    return (
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-amber-200/90 truncate">{t("Star · %@", L(s.Type))}</div>
            <div className="text-base font-semibold text-white truncate">{target.name}</div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button tone="primary" onClick={() => explorer.engage()}>
              {t("Approach")}
              <Key>⏎</Key>
            </Button>
            <Button onClick={() => explorer.clearTarget()}>✕</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 mt-1.5">
          <Stat label={t("Type")} value={L(s.Type)} />
          <Stat label={t("Colour")} value={L(s.Color.charAt(0).toUpperCase() + s.Color.slice(1))} />
          <Stat label={t("Radius")} value={`${amount(s.Size, 3)} R☉`} />
          <Stat label={t("Surface")} value={`≈ ${temperature}`} />
        </div>
      </div>
    );
  }

  if (target?.kind === "moon") {
    const m = target.moon;
    const visiting = state.visitingMoon?.name === m.name;
    const period = m.periodDays >= 1 ? t("%@ days", num(m.periodDays, 2)) : t("%@ h", num(m.periodDays * 24, 1));
    const around = state.orbiting ? planetName(state, state.orbiting) : null;
    return (
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-violet-300/90 truncate">
              {visiting ? t("Visiting") : t("Moon")} · {L(m.type)} · {around ? t("around %@", around) : ""}
            </div>
            <div className="text-base font-semibold text-white truncate">{pretty(m.name)}</div>
          </div>
          <div className="flex gap-2 shrink-0">
            {visiting ? (
              <BackButton label={around ? t("Back to %@", around) : t("Back to the planet")} onClick={() => explorer.goUp()} />
            ) : (
              <>
                <Button tone="primary" onClick={() => explorer.engage()}>
                  {t("Visit")}
                  <Key>⏎</Key>
                </Button>
                <Button onClick={() => explorer.clearTarget()}>✕</Button>
              </>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 mt-1.5">
          <Stat label={t("Diameter")} value={`${amount(Math.round(m.radiusKm * 2))} km`} />
          <Stat label={t("Orbit")} value={`${amount(Math.round(m.semiMajorAxisKm))} km`} />
          <Stat label={t("Period")} value={period} />
          <Stat label={t("Rotation")} value={m.tidallyLocked ? t("Tidally locked") : t("Free")} />
          <Stat label={t("Eccentricity")} value={num(m.eccentricity, 3)} />
          <Stat label={t("Inclination")} value={`${num(m.inclinationDeg, 1)}°`} />
          <Stat label={t("Density")} value={`${amount(Math.round(m.densityKgM3))} kg/m³`} />
          <Stat label={t("Origin")} value={L(m.origin.replace(/-/g, " "))} />
        </div>
        <div className="text-[10px] text-gray-500 mt-1 truncate">{t("Mass %@ kg", m.massKg.toExponential(2))}</div>
      </div>
    );
  }

  if (state.orbiting && !otherPlanet) {
    const p = state.orbiting;
    const own = system !== null ? state.owners.planet(p.index, system) : null;
    return (
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300/80">{t("In orbit · %@", L(p.planet_type))}</div>
            <div className="text-base font-semibold text-white truncate">{planetName(state, p)}</div>
          </div>
          <BackButton label={t("Leave orbit")} onClick={() => explorer.goUp()} />
        </div>
        {own && <OwnerLine own={own} />}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 mt-1.5">
          <Stat label={t("Diameter")} value={`${amount(Math.round(p.diameter))} km`} />
          <Stat label={t("Gravity")} value={`${num(p.gravity, 1)} m/s²`} />
          <Stat label={t("Temperature")} value={`${num(p.surface_temperature, 0)} °C`} />
          <Stat label={t("Atmosphere")} value={L(p.atmosphere)} />
          <Stat label={t("Day")} value={t("%@ h", num(Math.abs(p.rotation_period_seconds) / 3600, 1))} />
          <Stat label={t("Year")} value={t("%@ yr", num(p.orbital_period_seconds / 31557600, 2))} />
          <Stat label={t("Life")} value={L(p.life_forms)} />
          <Stat label={t("Moons")} value={state.planetDetail?.loading ? "…" : (state.planetDetail?.moons ?? 0)} />
        </div>
        <div className="text-[10px] text-gray-500 mt-1 truncate">{p.elements.map(L).join(" · ")}</div>
      </div>
    );
  }

  if (target?.kind === "system") {
    const s = target.summary;
    const isShip = state.ship?.system === target.index;
    const owner = state.owners.system(target.index)?.owner;
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-300/80">
            {isShip ? t("Your ship is here") : t("Target locked")} · {t("system #%@", amount(target.index))}
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <SealIcon id={state.owners.system(target.index)?.seal ?? null} size={14} />
            <div className="text-base font-semibold text-white truncate">{s ? state.owners.systemName(target.index, s.name) : t("Scanning…")}</div>
          </div>
          {s && (
            <div className="text-xs text-gray-400 truncate">
              {owner ? `${t("Property of %@", owner)} · ` : ""}
              {s.stars.map((st) => L(st.Type)).join(" + ")} · {t("%lld planets", s.num_planets)}
            </div>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button tone="primary" onClick={() => explorer.engage()}>
            {isShip ? t("Return") : t("Engage")}
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
          <div className="text-[10px] uppercase tracking-[0.2em] text-amber-300/80">{L(target.poi.kind)}</div>
          <div className="text-base font-semibold text-white">{L(target.poi.name)}</div>
          <div className="text-xs text-gray-400 truncate">{L(target.poi.description)}</div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button tone="primary" onClick={() => explorer.engage()}>
            {t("Fly there")}
            <Key>⏎</Key>
          </Button>
          <Button onClick={() => explorer.clearTarget()}>✕</Button>
        </div>
      </div>
    );
  }

  if (target?.kind === "planet") {
    const p = target.planet;
    const own = system !== null ? state.owners.planet(p.index, system) : null;
    return (
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-300/80">
            {state.orbiting ? t("Next stop · leaving %@", planetName(state, state.orbiting)) : t("Planet")} · {L(p.planet_type)}
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <SealIcon id={own?.seal ?? null} size={14} />
            <div className="text-base font-semibold text-white truncate">{planetName(state, p)}</div>
          </div>
          <div className="text-xs text-gray-400 truncate">
            {own?.owner ? `${t("Property of %@", own.owner)} · ` : ""}
            {t("%@ AU from the star", num(p.orbital_radius, 2))} · {amount(Math.round(p.diameter))} km · {L(p.life_forms)}
          </div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button tone="primary" onClick={() => explorer.engage()}>
            {t("Go into orbit")}
            <Key>⏎</Key>
          </Button>
          <Button onClick={() => explorer.clearTarget()}>✕</Button>
        </div>
      </div>
    );
  }

  // A pointer clicks; a touch screen taps
  const hint = TOUCH
    ? state.mapView
      ? t("Galaxy map. Tap any star to target it, pick a landmark, or follow the green marker back to your ship.")
      : state.mode === "system"
        ? t("Tap a planet to target it · double-tap to go straight into orbit.")
        : t("Tap a star to target it · double-tap to jump straight there.")
    : state.mapView
      ? t("Galaxy map. Click any star to target it, pick a landmark, or follow the green marker back to your ship.")
      : state.mode === "system"
        ? t("Click a planet to target it · double-click to go straight into orbit.")
        : t("Click a star to target it · double-click to jump straight there.");
  const up = upLabel(state);
  // In a system: its owner
  const systemOwner = state.mode === "system" && !state.orbiting && state.system ? state.owners.system(state.system.index) : null;
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-gray-400">{hint}</div>
        {/* Up one level: out of the system, out to the galaxy map, out to the universe */}
        {up && <BackButton label={up} onClick={() => explorer.goUp()} />}
      </div>
      {systemOwner && <OwnerLine own={systemOwner} />}
    </div>
  );
}

// Back to the present (and real-time speed). Lit when the simulation has wandered off
// the real time, quiet when it is already there
function TimeReset({ drift, onReset }: { drift: number; onReset: () => void }) {
  const away = Math.abs(drift) > 30;
  return (
    <button
      onClick={onReset}
      disabled={!away}
      title={away ? t("Back to the present") : t("Running in real time")}
      aria-label={t("Back to the present")}
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
  const system = viewSystem(state);
  if (state.mode === "system" && state.system) {
    // In orbit: the moons come first, then the way back to the planet when visiting one.
    // (On a phone the way back reads "‹ planet", with what it does under it)
    if (state.visitingMoon && state.orbiting) {
      const name = planetName(state, state.orbiting);
      chips.push(
        <button key="back" onClick={() => explorer.goUp()} className="shrink-0 text-left px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition-colors">
          <div className="text-xs leading-tight text-emerald-300">
            <span className="hidden sm:inline">{t("Back to %@", name)}</span>
            <span className="sm:hidden">‹ {name}</span>
          </div>
          <div className="text-[10px] text-gray-500 leading-tight">
            <span className="hidden sm:inline">{t("planet · Esc")}</span>
            <span className="sm:hidden">{t("back to the planet")}</span>
          </div>
        </button>
      );
    }
    state.moons.filter((m) => m.name !== state.visitingMoon?.name).forEach((m) => chips.push(<Chip key={`m${m.name}`} onClick={() => explorer.focusMoon(m.name)} title={pretty(m.name)} sub={t("%@ moon · %@ km", L(m.type), amount(Math.round(m.radiusKm * 2)))} accent="text-violet-200" />));
    state.system.planets.filter((p) => p.index !== state.orbiting?.index).forEach((p) => chips.push(<Chip key={`p${p.index}`} onClick={() => explorer.focusPlanet(p.index)} title={state.owners.planetName(p, system)} sub={`${L(p.planet_type)} · ${num(p.orbital_radius, 1)} AU`} accent="text-emerald-200" />));
  } else if (state.mode === "galaxy" && !state.mapView) {
    state.nearby.forEach((n) => chips.push(<Chip key={`n${n.index}`} onClick={() => explorer.selectSystem(n.index)} title={n.name} sub={`${n.distance} · ${n.starType}`} accent="text-sky-200" />));
  }
  if (state.mode === "galaxy" && state.ship && (state.mapView || state.target?.kind !== "system" || state.target.index !== state.ship.system)) {
    chips.unshift(<Chip key="home" onClick={() => explorer.returnToShip()} title={t("Return to ship")} sub={`${shipSystemTitle(state) ?? t("your system")} · H`} accent="text-emerald-300" />);
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
      ? target.summary
        ? state.owners.systemName(target.index, target.summary.name)
        : t("System #%@", amount(target.index))
      : target.kind === "planet"
        ? state.owners.planetName(target.planet, system)
        : target.kind === "moon"
          ? pretty(target.moon.name)
          : target.kind === "star"
            ? target.name
            : L(target.poi.name);

  return (
    <Panel className="relative w-[min(720px,calc(100vw-1.5rem))] px-3 pt-3 pb-2.5 pointer-events-auto">
      <button
        onClick={() => toggle(!collapsed)}
        className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-6 rounded-full bg-slate-900/90 border border-white/15 text-gray-300 hover:text-white hover:border-cyan-300/50 backdrop-blur-md transition-colors"
        title={collapsed ? t("Show the console") : t("Hide the console")}
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
            <span className="text-cyan-300">{t("Target ").trim()}</span> <span className="text-gray-200">{targetName}</span> <span className="text-gray-500">{t(" · tap to open")}</span>
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
              <span className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mr-1">{t("Time")}</span>
              {TIME_SCALES.map((scale) => (
                <button key={scale.value} onClick={() => explorer.setTimeScale(scale.value)} className={`shrink-0 whitespace-nowrap px-2 py-0.5 rounded-md text-[11px] ${state.timeScale === scale.value ? "bg-cyan-400/90 text-slate-950" : "text-gray-300 hover:bg-white/10"}`}>
                  {scale.label}
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
// same width while its value races up or down. The decimal mark is the region's
const SUFFIXES = ["", "k", "M", "B", "T", "Q"];
function sig3(n: number): string {
  if (!Number.isFinite(n) || n <= 0) return num(0, 2);
  let i = 0;
  while (n >= 999.5 && i < SUFFIXES.length - 1) {
    n /= 1000;
    i++;
  }
  if (n >= 999.5) return n.toExponential(1).replace("e+", "e") + SUFFIXES[i];
  return (n >= 99.95 ? num(n, 0) : n >= 9.995 ? num(n, 1) : num(n, 2)) + SUFFIXES[i];
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
      <div className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-cyan-300/70 truncate">{label}</div>
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
      write(refs.c, c >= 1 ? `${sig3(c)}×` : num(c, 2));
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
        <HudReadout label={t("Velocity")} primary valueRef={refs.speed} unitRef={refs.speedUnit} trendRef={refs.trend} />
        <HudReadout label={t("Light speed")} valueRef={refs.c} unitRef={refs.cUnit} />
        <HudReadout label={t("Remaining")} valueRef={refs.remaining} unitRef={refs.remainingUnit} />
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
      <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5">{t("Find a system")}</div>
      <div className="flex gap-1.5 mb-3">
        <input value={systemInput} onChange={(e) => setSystemInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && findSystem()} placeholder={state.galaxy ? `# 0 – ${amount(state.galaxy.num_systems - 1)}` : "#"} className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-400/60" />
        <Button onClick={findSystem}>{t("Find")}</Button>
      </div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">{t("Landmarks")}</div>
      {POI_GROUPS.map((group) => {
        const items = state.pois.filter((p) => group.kinds.includes(p.kind));
        if (items.length === 0) return null;
        const expanded = open === group.title;
        return (
          <div key={group.title}>
            <button onClick={() => setOpen(expanded ? null : group.title)} className="w-full flex justify-between items-center py-1 text-xs hover:text-white">
              <span className={group.accent}>{t(group.title)}</span>
              <span className="text-gray-500">
                {items.length} {expanded ? "▾" : "▸"}
              </span>
            </button>
            {expanded && (
              <div className="pl-2 pb-1 space-y-0.5">
                {items.slice(0, 80).map((poi) => (
                  <button key={poi.id} onClick={() => (explorer.flyToPoi(poi), onPick?.())} className="block w-full text-left text-[11px] font-mono px-1.5 py-1 sm:py-0.5 rounded hover:bg-white/10 text-gray-400">
                    {L(poi.name)}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <div className="mt-3 pt-2 border-t border-white/10 space-y-1 text-[11px] text-gray-400">
        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">{t("Legend")}</div>
        <div className="flex items-center gap-2">
          <span className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-emerald-400" /> {t("Your ship")}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rotate-45 border border-amber-300/80" /> {t("Galactic core")}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-dashed border-violet-300/70" /> {t("Star cluster")}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-fuchsia-300/80" /> {t("Black hole · pulsar")}
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border border-dashed border-sky-200/60" /> {t("Neighbour galaxy (zoom out)")}
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
          <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/80">{t("Hyperjump computer")}</div>
          <div className="text-lg font-semibold text-white mb-3">{t("Where to?")}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">{t("Galaxy coordinates (0 – %@)", amount(10_000_000))}</div>
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
              {t("Jump")}
              <Key>⏎</Key>
            </Button>
            <Button
              className="flex-1"
              onClick={async () => {
                const location = await fetchRandomLocation();
                jump(location.coordinates, location.system);
              }}
            >
              {t("Somewhere random")}
            </Button>
          </div>
          {recent.length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1">{t("Recently visited")}</div>
              <div className="space-y-0.5">
                {recent.map((g) => (
                  <button key={g.coordinates.join(",")} onClick={() => jump(g.coordinates)} className="w-full flex justify-between gap-3 text-xs px-2 py-1 rounded hover:bg-white/10">
                    <span className="text-gray-200 truncate">{pretty(g.name)}</span>
                    <span className="text-gray-500 font-mono shrink-0">
                      {L(g.type)} · {g.coordinates.join(",")}
                    </span>
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
  { key: "soundEffects", label: "Sound effects", description: "Quiet ship sounds for flights, jumps and selections" },
];

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

const LEVELS = Object.keys(QUALITY_PROFILES) as QualityLevel[];

// A quality as a square: one to four signal bars for a level, a sparkle for Auto
function QualityTile({ level, active, onClick }: { level: QualityLevel | null; active: boolean; onClick: () => void }) {
  const label = level ? L(QUALITY_PROFILES[level].label) : t("Auto");
  const bars = level ? LEVELS.indexOf(level) + 1 : 0;
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      aria-label={level ? t("%@ quality", label) : t("Automatic quality")}
      title={level ? t("%@ quality", label) : t("Automatic quality")}
      className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-1.5 min-h-[56px] rounded-[10px] border transition-colors ${active ? "border-cyan-400/70 bg-cyan-400/[0.12] text-cyan-200" : "border-white/10 bg-white/5 hover:bg-white/10 text-gray-300"}`}
    >
      <span className="h-4 flex items-end">
        {level ? (
          <span className="flex items-end gap-[2px]">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="w-[3px] rounded-[1px] bg-current" style={{ height: 5 + i * 3, opacity: i < bars ? 1 : 0.2 }} />
            ))}
          </span>
        ) : (
          <svg width={16} height={16} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M10 2.5l1.6 4.9 4.9 1.6-4.9 1.6L10 15.5l-1.6-4.9L3.5 9l4.9-1.6zM18 13l.9 2.6 2.6.9-2.6.9L18 20l-.9-2.6-2.6-.9 2.6-.9z" />
          </svg>
        )}
      </span>
      <span className={`text-[10px] truncate max-w-full px-0.5 ${active ? "text-cyan-200" : "text-gray-400"}`}>{label}</span>
    </button>
  );
}

function SettingsPanel({ explorer, state, onClose }: { explorer: Explorer; state: ExplorerState; onClose: () => void }) {
  const [calm, setCalm] = useState(() => reducedFlashing());
  const choose = (level: QualityLevel | null) => {
    // Antialiasing and shadows live in the WebGL context: those switches reload the page
    // (the URL keeps the ship's location, so nothing is lost)
    if (explorer.setQuality(level)) window.location.reload();
  };
  const profile = QUALITY_PROFILES[state.quality];
  const fps = profile.fps ? t("%lld fps", profile.fps) : t("uncapped");
  const stars = t("%lldk stars", Math.round(profile.maxStars / 1000));
  return (
    <Panel className="w-[19rem] max-w-full p-4 pointer-events-auto">
      <div className="flex justify-between items-center mb-3">
        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">{t("Graphics quality")}</div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xs" aria-label={t("Close")}>
          ✕
        </button>
      </div>
      {/* Auto (what this device affords) and the four levels, side by side */}
      <div className="flex gap-1.5">
        <QualityTile level={null} active={state.qualityAuto} onClick={() => choose(null)} />
        {LEVELS.map((level) => (
          <QualityTile key={level} level={level} active={!state.qualityAuto && state.quality === level} onClick={() => choose(level)} />
        ))}
      </div>
      <p className="mt-2.5 text-[11px] text-gray-400 leading-snug">{state.qualityAuto ? `${t("%@, chosen for this device", L(profile.label))} · ${fps} · ${stars}` : `${L(profile.description)} · ${fps} · ${stars}`}</p>
      <div className="mt-3 text-[11px] text-gray-500 flex justify-between">
        <span>{t("Rendering at")}</span>
        <span className="font-mono text-gray-300">{t("%lld fps", state.fps)}</span>
      </div>
      <p className="mt-1 text-[10px] text-gray-600">{t("When nothing moves the frame rate drops on its own to save battery.")}</p>

      <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-4 mb-2">{t("View")}</div>
      <div className="space-y-1">
        {VIEW_TOGGLES.map(({ key, label, description }) => (
          <Toggle key={key} label={t(label)} description={t(description)} checked={state.view[key]} onChange={(value) => explorer.setViewOption(key, value)} />
        ))}
      </div>

      <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-4 mb-2">{t("Accessibility")}</div>
      <Toggle
        label={t("Reduced flashing")}
        description={t("No white flashes in jumps and crossings, gentler hyperspace. For photosensitive pilots")}
        checked={calm}
        onChange={(value) => {
          setReducedFlashing(value);
          setCalm(value);
        }}
      />

      <LanguageSelect className="mt-4 pt-3 border-t border-white/10" />
    </Panel>
  );
}

function Help({ onClose }: { onClose: () => void }) {
  const rows: Array<[string, string]> = [
    [t("Drag"), t("Look around")],
    [t("Scroll / pinch"), t("Zoom across scales")],
    [t("Right drag / Shift"), t("Pan")],
    ["W S · ↑ ↓", t("Thrust forward / back")],
    ["A D · ← →", t("Turn")],
    ["Q E · R F", t("Slide sideways · up / down")],
    [t("Click"), t("Target a star or planet")],
    [t("Double-click · ⏎"), t("Engage: travel / go into orbit")],
    ["Esc", t("Back out one level")],
    ["M", t("Galaxy map")],
    ["H", t("Return to your ship")],
    ["J", t("Hyperjump to another galaxy")],
    ["P", t("Take a photo, with a QR code to this place")],
  ];
  return (
    <Modal onClose={onClose}>
      <Panel className="p-6 max-w-md">
        <div className="text-lg font-semibold text-white mb-1">{t("Welcome aboard")}</div>
        <p className="text-sm text-gray-400 mb-4">{t("Your ship is docked at a star. Every point of light out there is a real star system you can travel to: pick a target, engage, and go into orbit around its planets.")}</p>
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
            {t("Let's go")}
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
      <div className="flex items-center rounded-lg border border-fuchsia-400/40 bg-fuchsia-500/10 text-xs overflow-hidden" title={t("Exploring a remote universe from node %@", universe.node_id)}>
        <button onClick={onOpen} className="flex items-center gap-1.5 px-3 py-1.5 text-fuchsia-100 hover:bg-fuchsia-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-300 animate-pulse" />
          {t("Remote")} · <span className="max-w-[9rem] truncate">{universe.seed_str || universe.seed_name || t("unknown seed")}</span>
        </button>
        <button onClick={() => onCross({ url: "/multiverse/exit", name: t("your universe"), home: true })} className="px-2.5 py-1.5 border-l border-fuchsia-400/30 text-fuchsia-200/80 hover:bg-fuchsia-500/20 hover:text-white" title={t("Back to your own universe")}>
          {t("Exit")}
        </button>
      </div>
    );
  }
  return (
    <button onClick={onOpen} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/15 text-gray-200 border border-white/10 transition-colors" title={t("Universes discovered through the P2P network")}>
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse" />
      {t("Multiverse")}
    </button>
  );
}

// ---- line icons, shared by the top bar, the menu and the corners ----------------------

const Line: React.FC<{ size?: number; width?: number; className?: string; children: React.ReactNode }> = ({ size = 16, width = 1.6, className = "", children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    {children}
  </svg>
);

const StargateGlyph: React.FC<{ size?: number; className?: string }> = ({ size = 14, className = "text-cyan-300" }) => (
  <Line size={size} className={className}>
    <path d="M14 12a6 6 0 1 1-6-6" />
    <path d="M10 12a6 6 0 1 1 6 6" opacity={0.55} />
  </Line>
);

const CameraGlyph: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <Line size={size}>
    <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.4-2h5.8l1.4 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
    <circle cx={12} cy={13} r={3.4} />
  </Line>
);

const GearGlyph: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <Line size={size} width={1.7}>
    <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03z" />
  </Line>
);

// A keyboard: the controls (the F.A.Q. keeps the question mark)
const KeyboardGlyph: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <Line size={size}>
    <rect x={2.5} y={6} width={19} height={12} rx={2} />
    <path d="M6 9.5h.01M9 9.5h.01M12 9.5h.01M15 9.5h.01M18 9.5h.01M6 12.2h.01M9 12.2h.01M12 12.2h.01M15 12.2h.01M18 12.2h.01M8 15h8" />
  </Line>
);

const FaqGlyph: React.FC<{ size?: number; className?: string }> = ({ size = 15, className = "" }) => (
  <Line size={size} width={1.7} className={className}>
    <circle cx={12} cy={12} r={9.5} />
    <path d="M9.2 9.3a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.5-2.8 4" />
    <path d="M12 17.3v.2" />
  </Line>
);

const PinGlyph: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <Line size={size} width={1.7}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx={12} cy={10} r={2.3} />
  </Line>
);

// The hyperjump: a bolt lying on its side
const BoltGlyph: React.FC<{ size?: number }> = ({ size = 15 }) => (
  <Line size={size}>
    <path d="M2.5 13.5h7.5l-2 5.5 13.5-8.5h-7.5l2-5.5z" />
  </Line>
);

// A line icon, struck through when its sound is off
const SoundIcon: React.FC<{ on: boolean; size?: number; tone?: boolean; children: React.ReactNode }> = ({ on, size = 15, tone = true, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={tone ? (on ? "text-cyan-300" : "text-gray-500") : ""} aria-hidden="true">
    {children}
    {!on && <path d="M4 4l16 16" />}
  </svg>
);

const MusicGlyph: React.FC<{ on: boolean; size?: number; tone?: boolean }> = ({ on, size, tone }) => (
  <SoundIcon on={on} size={size} tone={tone}>
    <path d="M9 18V5l11-2v13" />
    <circle cx={6} cy={18} r={3} />
    <circle cx={17} cy={16} r={3} />
  </SoundIcon>
);

const SpeakerGlyph: React.FC<{ on: boolean; size?: number; tone?: boolean }> = ({ on, size, tone }) => (
  <SoundIcon on={on} size={size} tone={tone}>
    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" />
    {on && <path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" />}
  </SoundIcon>
);

type MenuActions = Record<"multiverse" | "exitRemote" | "stargate" | "ship" | "map" | "hyperjump" | "photo" | "settings" | "help" | "faq" | "music" | "sounds", () => void>;

// The menu's pieces live out here: defined inside it, every render (several a second,
// with the console's readouts) would make new components and remount the buttons, so a
// tap could land on one that was being replaced
const MenuHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="px-4 pt-2.5 pb-1 text-[10px] uppercase tracking-[0.2em] text-gray-500">{children}</div>;

const MenuItem: React.FC<{ onClick: () => void; label: React.ReactNode; hint?: string; icon: React.ReactNode; accent?: string }> = ({ onClick, label, hint, icon, accent = "text-gray-100" }) => (
  <button onClick={onClick} className="w-full flex items-center gap-3 px-4 min-h-[42px] text-left text-sm hover:bg-white/10 active:bg-white/15 transition-colors">
    <span className="w-5 shrink-0 flex justify-center text-gray-400">{icon}</span>
    <span className={`flex-1 min-w-0 truncate ${accent}`}>{label}</span>
    {hint && <span className="text-[11px] text-gray-500 truncate max-w-[45%]">{hint}</span>}
  </button>
);

// A square button with its icon and a word under it
const MenuTile: React.FC<{ onClick: () => void; label: string; icon: React.ReactNode; accent?: string }> = ({ onClick, label, icon, accent = "text-gray-200" }) => (
  <button onClick={onClick} aria-label={label} className="flex-1 min-w-0 flex flex-col items-center justify-center gap-1.5 min-h-[58px] rounded-[10px] bg-white/5 border border-white/[0.08] hover:bg-white/10 active:bg-white/15 transition-colors">
    <span className={`h-[18px] flex items-center ${accent}`}>{icon}</span>
    <span className="text-[10px] text-gray-400 truncate max-w-full px-0.5">{label}</span>
  </button>
);

// Below the large breakpoint the top bar does not fit: everything goes behind a
// hamburger, in a sheet that drops from the top right. Opening it closes any open panel
// (`onOpen`); a touch anywhere else closes it
function MobileMenu({ universe, musicMuted, soundEffects, ship, appPublished, onOpen, actions }: { universe: UniverseConfig | null; musicMuted: boolean; soundEffects: boolean; ship: ShipKind; appPublished: boolean; onOpen: () => void; actions: MenuActions }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close, true);
    return () => document.removeEventListener("pointerdown", close, true);
  }, [open]);
  // Each button closes the sheet, unless told otherwise
  const run = (action: () => void, closes = true) => () => {
    if (closes) setOpen(false);
    action();
  };
  return (
    <div ref={rootRef} className="lg:hidden relative pointer-events-auto shrink-0">
      <button
        onClick={() => {
          if (!open) onOpen();
          setOpen(!open);
        }}
        className="relative w-10 h-10 flex items-center justify-center rounded-lg bg-slate-950/70 border border-white/15 backdrop-blur-md"
        aria-label={t("Menu")}
        aria-expanded={open}
      >
        {[-6, 0, 6].map((y, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 w-5 h-0.5 -ml-2.5 -mt-px rounded bg-gray-100 transition-all duration-300"
            style={{ transform: open ? (i === 1 ? "scaleX(0)" : `rotate(${i === 0 ? 45 : -45}deg)`) : `translateY(${y}px)`, opacity: open && i === 1 ? 0 : 1 }}
          />
        ))}
        {universe?.remote && !open && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-fuchsia-400 border border-black" />}
      </button>
      <div className={`absolute right-0 top-12 w-[min(19rem,calc(100vw-1.5rem))] origin-top-right transition-all duration-200 ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}>
        {/* (scrolls inside itself rather than run off a short screen) */}
        <Panel className="py-1.5 max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain">
          {universe?.remote ? (
            <>
              <MenuItem onClick={run(actions.multiverse)} label={t("Multiverse")} hint={`${t("Remote")} · ${universe.seed_str || universe.seed_name}`} accent="text-fuchsia-200" icon={<span className="w-1.5 h-1.5 rounded-full bg-fuchsia-300 animate-pulse" />} />
              <MenuItem onClick={run(actions.exitRemote)} label={t("Return to your universe")} accent="text-fuchsia-200" icon={<span className="text-fuchsia-300 text-sm leading-none">‹</span>} />
            </>
          ) : (
            <MenuItem onClick={run(actions.multiverse)} label={t("Multiverse")} hint={t("P2P universes")} icon={<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />} />
          )}

          <MenuHeading>{t("Explore")}</MenuHeading>
          <MenuItem onClick={run(actions.stargate)} label="Stargate" hint={t("Links & saved places")} icon={<StargateGlyph size={16} />} />
          <MenuItem onClick={run(actions.map)} label={t("Galaxy map")} hint={t("Navigate")} icon={<PinGlyph size={16} />} />
          <MenuItem onClick={run(actions.hyperjump)} label={t("Hyperjump")} hint={t("Another galaxy")} icon={<BoltGlyph size={16} />} />

          <MenuHeading>{t("Ship & settings")}</MenuHeading>
          <div className="flex gap-1.5 px-2 py-1">
            <MenuTile onClick={run(actions.photo)} label={t("Photo")} icon={<CameraGlyph size={18} />} />
            <MenuTile onClick={run(actions.ship)} label={t("Hangar")} icon={<ShipIcon kind={ship} size={18} />} accent="text-cyan-200" />
            {/* The sound switches leave the menu open: their tiles show the change at once */}
            <MenuTile onClick={run(actions.music, false)} label={musicMuted ? t("Music off") : t("Music")} icon={<MusicGlyph on={!musicMuted} size={18} tone={false} />} accent={musicMuted ? "text-gray-500" : "text-cyan-200"} />
            <MenuTile onClick={run(actions.sounds, false)} label={soundEffects ? t("Sounds") : t("Sounds off")} icon={<SpeakerGlyph on={soundEffects} size={18} tone={false} />} accent={soundEffects ? "text-cyan-200" : "text-gray-500"} />
            <MenuTile onClick={run(actions.settings)} label={t("Graphics")} icon={<GearGlyph size={18} />} />
          </div>
          <MenuItem onClick={run(actions.help)} label={t("Controls")} icon={<KeyboardGlyph size={16} />} />
          <MenuItem onClick={run(actions.faq)} label={t("F.A.Q.")} icon={<FaqGlyph size={16} />} />
          <LanguageSelect className="px-4 min-h-[42px]" />

          <div className="my-1.5 border-t border-white/10" />
          <div className="flex items-center justify-between px-4 py-2">
            <a href="https://www.banshee.pro" target="_blank" rel="noopener noreferrer" className="opacity-70 hover:opacity-100">
              <img src="https://www.banshee.pro/images/banshee-logo.png" alt="Banshee" className="h-3.5 w-auto max-w-[100px] object-contain" />
            </a>
            <a href="https://x.com/surcebeats" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white">
              @SurceBeats
            </a>
          </div>
          {appPublished && (
            <div className="px-3 pt-0.5 pb-2">
              <AppStoreLink />
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

// ---- the hangar: which ship flies in front of the camera ---------------------------------

const SHIPS: Array<{ kind: ShipKind; name: string; description: string }> = [
  { kind: "saucer", name: "Saucer", description: "A disc with a ventral drive ring. Steady and smooth" },
  { kind: "interceptor", name: "Interceptor", description: "A delta wing with twin engines. Banks hard into every turn" },
];

// Each ship's silhouette, as the button and the hangar draw it
const ShipIcon: React.FC<{ kind: ShipKind; size?: number; className?: string }> = ({ kind, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" className={className} aria-hidden="true">
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
        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-400">{t("Hangar")}</div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-xs" aria-label={t("Close")}>
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
                <span className={`block text-sm ${active ? "text-cyan-200" : "text-gray-200"}`}>{t(ship.name)}</span>
                <span className="block text-[10px] text-gray-500 leading-snug">{t(ship.description)}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-[10px] text-gray-600">{t("Seen from the chase camera when Ship view is on.")}</p>
    </Panel>
  );
}

// ---- the Apple apps ------------------------------------------------------------------

const APP_STORE_ID = "6823729371";
// The universal link to the app's page: the App Store opens it in the visitor's own country
const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`;
const APP_PUBLISHED_KEY = "atlas-app-published";

// Whether the app is on the App Store yet, as Apple's public lookup says (once per
// session; the browser also caches the answer for a day). Until it is, no link
function useAppPublished(): boolean {
  const [published, setPublished] = useState(() => {
    try {
      return sessionStorage.getItem(APP_PUBLISHED_KEY) === "1";
    } catch {
      return false;
    }
  });
  useEffect(() => {
    try {
      if (sessionStorage.getItem(APP_PUBLISHED_KEY) !== null) return;
    } catch {
      /* storage unavailable: ask anyway */
    }
    let alive = true;
    fetch(`https://itunes.apple.com/lookup?id=${APP_STORE_ID}`, { credentials: "omit" })
      .then((r) => r.json())
      .then((body) => {
        const found = (body?.resultCount ?? 0) > 0;
        try {
          sessionStorage.setItem(APP_PUBLISHED_KEY, found ? "1" : "0");
        } catch {
          /* storage unavailable */
        }
        if (alive) setPublished(found);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return published;
}

const AppleGlyph: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className="text-black -mt-px shrink-0" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
    />
  </svg>
);

// The way to the Apple apps at the foot of the menu: white, with the Apple logo, like the
// button bottom right on a wide screen
function AppStoreLink() {
  return (
    <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white hover:bg-gray-200 active:bg-gray-300 transition-colors">
      <AppleGlyph size={22} />
      <span className="min-w-0 text-left leading-tight">
        <span className="block text-[9px] uppercase tracking-[0.15em] text-gray-600 truncate">{t("Download on the App Store")}</span>
        {/* (device names: never translated) */}
        <span className="block text-sm font-medium text-black whitespace-nowrap">iPhone · iPad · Mac</span>
      </span>
      <span className="ml-auto text-gray-500 text-sm">›</span>
    </a>
  );
}

// Square, icon-only buttons for the bottom-right corner
const CORNER_BUTTON = "w-8 h-8 flex items-center justify-center rounded-lg bg-slate-950/60 hover:bg-white/15 border border-white/10 backdrop-blur-md transition-colors";

// Bottom corners: who made this (left) and the sound, the archive and the author (right)
function Corners({ onFaq, musicMuted, onToggleMusic, sfxOn, onToggleSfx, appPublished }: { onFaq: () => void; musicMuted: boolean; onToggleMusic: () => void; sfxOn: boolean; onToggleSfx: () => void; appPublished: boolean }) {
  return (
    <>
      <a href="https://www.banshee.pro" target="_blank" rel="noopener noreferrer" className="hidden lg:flex absolute bottom-3 left-3 items-center gap-2 px-2 py-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-white/5 transition-opacity pointer-events-auto" title="Banshee Technologies">
        <img src="https://www.banshee.pro/images/banshee-logo.png" alt="Banshee" className="h-3.5 w-auto max-w-[110px] object-contain" draggable={false} />
      </a>
      <div className="hidden lg:flex absolute bottom-3 right-3 items-center gap-1.5 pointer-events-auto">
        <button onClick={onToggleMusic} className={CORNER_BUTTON} title={musicMuted ? t("Play the soundtrack") : t("Mute the soundtrack")} aria-label={musicMuted ? t("Play the soundtrack") : t("Mute the soundtrack")} aria-pressed={!musicMuted}>
          <MusicGlyph on={!musicMuted} />
        </button>
        <button onClick={onToggleSfx} className={CORNER_BUTTON} title={sfxOn ? t("Mute the sound effects") : t("Turn the sound effects on")} aria-label={sfxOn ? t("Mute the sound effects") : t("Turn the sound effects on")} aria-pressed={sfxOn}>
          <SpeakerGlyph on={sfxOn} />
        </button>
        <button onClick={onFaq} className={CORNER_BUTTON} title={t("The Atlas F.A.Q.")} aria-label={t("The Atlas F.A.Q.")}>
          <FaqGlyph className="text-gray-300" />
        </button>
        <a href="https://x.com/surcebeats" target="_blank" rel="noopener noreferrer" className={CORNER_BUTTON} title={t("%@ on X", "@SurceBeats")} aria-label={t("%@ on X", "@SurceBeats")}>
          <svg width={13} height={13} viewBox="0 0 24 24" className="text-gray-300">
            <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </a>
        {/* The Apple apps, once they are on the App Store: white, so it stands apart */}
        {appPublished && (
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-gray-200 transition-colors"
            title={`${t("Download on the App Store")} · iPhone · iPad · Mac`}
            aria-label={`${t("Download on the App Store")} · iPhone · iPad · Mac`}
          >
            <AppleGlyph size={15} />
          </a>
        )}
      </div>
    </>
  );
}

// A touch outside the open drop-down closes it. The top bar counts as inside: its buttons
// switch between the panels themselves
function useOutsideClose(open: boolean, refs: Array<React.RefObject<HTMLElement | null>>, close: () => void) {
  const closeRef = useRef(close);
  closeRef.current = close;
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!refs.some((ref) => ref.current?.contains(e.target as Node))) closeRef.current();
    };
    document.addEventListener("pointerdown", onDown, true);
    return () => document.removeEventListener("pointerdown", onDown, true);
  }, [open]);
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
      .then((taken) => taken && setPhotoNote(t("Photo saved")))
      .catch(() => setPhotoNote(t("The photo could not be saved")));
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
  const appPublished = useAppPublished();
  const music = useMemo(() => new Music(TRACKS), []);
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

  // The drop-down panels: one at a time, closed by a touch anywhere else
  const topBarRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const landmarksRef = useRef<HTMLDivElement>(null);
  const openPanel = (panel: "stargate" | "hangar" | "settings" | null) => {
    setShowStargate(panel === "stargate");
    setShowHangar(panel === "hangar");
    setShowSettings(panel === "settings");
  };
  const togglePanel = (panel: "stargate" | "hangar" | "settings", shown: boolean) => openPanel(shown ? null : panel);
  useOutsideClose(showStargate || showHangar || showSettings, [panelRef, topBarRef], () => openPanel(null));
  useOutsideClose(showLandmarks, [landmarksRef], () => setShowLandmarks(false));

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
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
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
    openPanel(null);
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

  const toggleMusic = () => {
    music.setMuted(!musicMuted);
    setMusicMuted(!musicMuted);
  };

  return (
    <div className="fixed inset-0 bg-black text-gray-200 overflow-hidden font-sans select-none">
      <div ref={containerRef} className="absolute inset-0" />
      <div ref={flashRef} className="absolute inset-0 z-[60] bg-white opacity-0 pointer-events-none" />
      <Presence show={!!photoNote}>
        <div className="absolute top-20 inset-x-0 z-[60] flex justify-center pointer-events-none">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-950/85 border border-cyan-300/30 backdrop-blur-md font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-100">
            <span className="text-cyan-300">
              <CameraGlyph size={14} />
            </span>
            {lastPhotoNote.current}
          </div>
        </div>
      </Presence>

      {explorer && state && (
        <>
          {/* Above every overlay (HUD, readouts, drop-down panels), below the modals (z-50),
              so the mobile menu always opens on top */}
          <div ref={topBarRef} className="absolute top-0 inset-x-0 z-[45] p-3 flex justify-between items-start gap-3 pointer-events-none bg-gradient-to-b from-black/70 to-transparent">
            <LocationBar state={state} shipTitle={shipSystemTitle(state)} />
            <MobileMenu
              universe={universe}
              musicMuted={musicMuted}
              soundEffects={state.view.soundEffects}
              ship={state.view.ship}
              appPublished={appPublished}
              onOpen={() => (openPanel(null), setShowLandmarks(false))}
              actions={{
                multiverse: () => setShowMultiverse(true),
                exitRemote: () => cross({ url: "/multiverse/exit", name: t("your universe"), home: true }),
                stargate: () => openPanel("stargate"),
                ship: () => openPanel("hangar"),
                map: () => explorer.openMap(),
                hyperjump: () => setShowHyperjump(true),
                // After the sheet has closed, so it is not in the way of the flash
                photo: () => setTimeout(() => photoRef.current(), 250),
                settings: () => openPanel("settings"),
                help: () => setShowHelp(true),
                faq: () => setShowFaq(true),
                music: toggleMusic,
                sounds: () => explorer.setViewOption("soundEffects", !state.view.soundEffects),
              }}
            />
            <div className="hidden lg:flex gap-2 pointer-events-auto shrink-0">
              <MultiverseLink universe={universe} onOpen={() => setShowMultiverse(true)} onCross={cross} />
              <Button onClick={() => togglePanel("stargate", showStargate)} title={t("Stargate links and saved places")} className="flex items-center gap-1.5">
                <StargateGlyph />
                Stargate
              </Button>
              <Button onClick={() => explorer.openMap()}>
                {t("Galaxy map")}
                <Key>M</Key>
              </Button>
              <Button onClick={() => setShowHyperjump(true)}>
                {t("Hyperjump")}
                <Key>J</Key>
              </Button>
              <Button onClick={() => photoRef.current()} title={t("Take a photo (P): PNG with a QR code to this place")} aria-label={t("Take a photo")} className="flex items-center !px-2.5">
                <CameraGlyph />
              </Button>
              <Button onClick={() => togglePanel("hangar", showHangar)} title={t("Hangar: choose your ship")} aria-label={t("Hangar: choose your ship")} className="flex items-center !px-2">
                <ShipIcon kind={state.view.ship} size={17} className="text-cyan-200" />
              </Button>
              <Button onClick={() => togglePanel("settings", showSettings)} title={t("Graphics & view")} aria-label={t("Graphics & view")} className="flex items-center !px-2.5">
                <GearGlyph />
              </Button>
              <Button onClick={() => setShowHelp(true)} title={t("Controls")} aria-label={t("Controls")} className="flex items-center !px-2.5">
                <KeyboardGlyph />
              </Button>
            </div>
          </div>

          {jumpPlan && (
            <div className="absolute top-16 inset-x-0 flex justify-center pointer-events-none">
              <JumpSequence plan={jumpPlan} state={state} onDone={() => setJumpPlan(null)} />
            </div>
          )}

          {/* Drop-down panels: right under the top bar, above the console, and never
              taller than the screen (they scroll inside themselves) */}
          <div ref={panelRef}>
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
          </div>

          <Corners onFaq={() => setShowFaq(true)} musicMuted={musicMuted} onToggleMusic={toggleMusic} sfxOn={state.view.soundEffects} onToggleSfx={() => explorer.setViewOption("soundEffects", !state.view.soundEffects)} appPublished={appPublished} />

          {state.mapView && !state.arrival && state.pois.length > 0 && (
            <div className="absolute top-20 left-3 pointer-events-none hidden md:block">
              <MapPanel explorer={explorer} state={state} />
            </div>
          )}

          {/* On small screens the map's landmarks and search live behind a button */}
          <div ref={landmarksRef}>
            {state.mapView && !state.arrival && state.pois.length > 0 && (
              <div className="md:hidden absolute top-16 left-3 z-30 pointer-events-auto animate-[fadeIn_0.3s_ease-out]">
                <button
                  onClick={() => setShowLandmarks((v) => !v)}
                  aria-expanded={showLandmarks}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border backdrop-blur-md transition-colors ${showLandmarks ? "bg-cyan-400/15 border-cyan-400/50 text-cyan-100" : "bg-slate-950/70 border-white/15 text-gray-200"}`}
                >
                  <PinGlyph />
                  {t("Landmarks")}
                  <span className="text-gray-500">{state.pois.length}</span>
                </button>
              </div>
            )}
            <Presence show={showLandmarks && state.mapView && !state.arrival}>
              <Drop className="md:hidden absolute top-[6.25rem] left-3 z-30" origin="top left" style={{ width: "min(18rem, calc(100vw - 1.5rem))" }}>
                <MapPanel explorer={explorer} state={state} onPick={() => setShowLandmarks(false)} />
              </Drop>
            </Presence>
          </div>

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
            <div className="absolute inset-x-0 top-[22%] flex justify-center pointer-events-none px-4">
              <div className="text-center animate-[fadeIn_1.2s_ease-out]">
                <div className="text-[11px] uppercase tracking-[0.5em] text-cyan-300/80 mb-2">{t("ARRIVING AT")}</div>
                <div className="text-4xl sm:text-5xl font-light tracking-wide text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]">{state.arrival.name}</div>
                <div className="text-sm text-gray-300 mt-2 drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]">
                  {galaxyKind(state.arrival.type)} · {t("%lld star systems", state.arrival.systems)}
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
                <Button onClick={() => explorer.loadGalaxy(CENTER)}>{t("Return to the center of the universe")}</Button>
              </Panel>
            </div>
          )}

          {/* Under the top bar, out of the way of the primordial torus at the centre */}
          {state.mode === "galaxy" && state.galaxy?.num_systems === 0 && !state.arrival && (
            <div className="absolute top-20 inset-x-0 px-3 flex justify-center pointer-events-none animate-[fadeIn_0.6s_ease-out]">
              <Panel className="px-4 py-3 max-w-sm text-center pointer-events-auto">
                <div className="text-[10px] uppercase tracking-[0.2em] text-fuchsia-300/80 mb-1">{L(state.galaxy.galaxy_type)}</div>
                <div className="text-xs text-gray-300 mb-2.5">{t("Before time: no star system has formed yet. Only the primordial torus, everywhere at once.")}</div>
                <Button onClick={() => setShowHyperjump(true)}>{t("Hyperjump somewhere else")}</Button>
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
