// atlas-ui/react/static/js/Explore/ui/StargatePanel.tsx
//
// Stargate links: a URL that carries whoever opens it to where the ship is now (the
// galaxy, the star system or the planet in orbit). The gate "aligns" before the link
// is handed over, as it always did.
//
// The gate also keeps the pilot's saved places (see core/places): any destination can
// be saved, renamed, copied as a link, removed, and travelled back to from here.

import React, { useEffect, useMemo, useState } from "react";
import type { Explorer, ExplorerState } from "../Explorer.ts";
import { Button, Panel } from "./kit.tsx";
import { stargatePath, type UniverseConfig } from "./universe.ts";
import { findPlace, loadPlaces, PLACES_EVENT, placeTarget, removePlace, renamePlace, savePlace, type PlaceKind, type SavedPlace } from "../core/places.ts";
import { amount, t } from "../../i18n/i18n.ts";

const pretty = (name: string) => name.replace(/_/g, " ");

const ALIGNED = "Stargate Aligned";

type Depth = "galaxy" | "system" | "planet";

const ALIGN_PHASES = [
  { chars: "01", ms: 20, steps: 18 },
  { chars: "0123456789", ms: 15, steps: 22 },
  { chars: "0123456789ABCDEF", ms: 10, steps: 30 },
  { chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/~", ms: 6, steps: 50 },
];

// Aligned once per session; later openings are instant
const ALIGNED_KEY = "stargateAnimationShown";

function useAlignment(enabled: boolean) {
  const [text, setText] = useState(() => (sessionStorage.getItem(ALIGNED_KEY) ? t(ALIGNED) : t("Aligning Stargate…")));
  const [aligned, setAligned] = useState(() => !!sessionStorage.getItem(ALIGNED_KEY));
  useEffect(() => {
    if (!enabled || aligned) return;
    let cancelled = false;
    (async () => {
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      for (const phase of ALIGN_PHASES) {
        for (let i = 0; i < phase.steps; i++) {
          if (cancelled) return;
          setText(Array.from({ length: 22 }, () => phase.chars[Math.floor(Math.random() * phase.chars.length)]).join(""));
          await sleep(phase.ms);
        }
      }
      const final = t(ALIGNED);
      for (let i = 1; i <= final.length; i++) {
        if (cancelled) return;
        setText(final.slice(0, i));
        await sleep(25);
      }
      sessionStorage.setItem(ALIGNED_KEY, "true");
      setAligned(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, aligned]);
  return { text, aligned };
}

// ---- saved places -----------------------------------------------------------------

function usePlaces() {
  const [places, setPlaces] = useState<SavedPlace[]>(() => loadPlaces());
  useEffect(() => {
    const refresh = () => setPlaces(loadPlaces());
    window.addEventListener(PLACES_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(PLACES_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  return places;
}

// (`label` and `plural` in English: translated when shown)
const KIND_STYLE: Record<PlaceKind, { label: string; plural: string; color: string; icon: React.ReactNode }> = {
  galaxy: {
    label: "Galaxy",
    plural: "Galaxies",
    color: "text-purple-300",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
        <path d="M12 12c3-4 8-3 8 1s-6 7-10 5" />
        <path d="M12 12c-3 4-8 3-8-1s6-7 10-5" />
        <circle cx={12} cy={12} r={1.2} fill="currentColor" />
      </g>
    ),
  },
  system: {
    label: "System",
    plural: "Systems",
    color: "text-cyan-300",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx={12} cy={12} r={2.5} fill="currentColor" />
        <ellipse cx={12} cy={12} rx={9} ry={4} opacity={0.6} />
      </g>
    ),
  },
  planet: {
    label: "Planet",
    plural: "Planets",
    color: "text-pink-300",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx={12} cy={12} r={5.5} />
        <path d="M3 14c4 2 14 0 18-4" opacity={0.6} />
      </g>
    ),
  },
};

const ago = (timestamp: number) => {
  const minutes = Math.max(0, (Date.now() - timestamp) / 60000);
  if (minutes < 1) return t("Saved just now");
  if (minutes < 60) return t("Saved %lld min ago", Math.floor(minutes));
  if (minutes < 60 * 24) return t("Saved %lld h ago", Math.floor(minutes / 60));
  if (minutes < 60 * 24 * 30) return t("Saved %lld d ago", Math.floor(minutes / 60 / 24));
  return t("Saved %@", new Date(timestamp).toLocaleDateString());
};

const IconButton: React.FC<{ title: string; onClick: () => void; danger?: boolean; children: React.ReactNode }> = ({ title, onClick, danger, children }) => (
  <button title={title} aria-label={title} onClick={onClick} className={`w-7 h-7 shrink-0 flex items-center justify-center rounded-md border border-white/10 bg-white/5 transition-colors ${danger ? "hover:bg-red-500/20 hover:text-red-200 text-gray-400" : "hover:bg-white/15 text-gray-300"}`}>
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  </button>
);

function PlaceRow({ place, disabled, onGo }: { place: SavedPlace; disabled: boolean; onGo: (place: SavedPlace) => void }) {
  const [mode, setMode] = useState<"idle" | "rename" | "confirm">("idle");
  const [name, setName] = useState(place.name);
  const [copied, setCopied] = useState(false);
  const target = placeTarget(place);
  const kind = KIND_STYLE[place.type] ?? KIND_STYLE.galaxy;
  const context = [place.type === "planet" ? place.systemName : null, place.type !== "galaxy" ? place.galaxyName : null].filter(Boolean).join(" · ");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${place.stargateUrl.slice(place.stargateUrl.indexOf("/stargate/"))}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };
  const commit = () => {
    renamePlace(place.id, name);
    setMode("idle");
  };

  return (
    <div className="group rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors px-2.5 py-2">
      <div className="flex items-center gap-2.5">
        <svg width={22} height={22} viewBox="0 0 24 24" className={`shrink-0 ${kind.color}`}>
          {kind.icon}
        </svg>
        <div className="min-w-0 flex-1">
          {mode === "rename" ? (
            <input
              autoFocus
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") (setName(place.name), setMode("idle"));
                e.stopPropagation();
              }}
              onBlur={commit}
              className="w-full bg-black/40 border border-cyan-400/40 rounded px-1.5 py-0.5 text-sm text-white outline-none"
            />
          ) : (
            <div className="text-sm text-gray-100 truncate">{place.name}</div>
          )}
          <div className="text-[10px] text-gray-500 truncate">
            <span className={kind.color}>{t(kind.label)}</span>
            {context && <> · {context}</>}
            {target && <span className="font-mono"> · {target.coordinates.join(", ")}</span>}
          </div>
        </div>
        {mode !== "confirm" && (
          <Button tone="primary" className="shrink-0 px-2.5" disabled={disabled || !target} onClick={() => onGo(place)}>
            {t("Go")}
          </Button>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 mt-1.5 pl-[32px]">
        <span className="text-[10px] text-gray-600">{copied ? <span className="text-cyan-300">{t("Link copied")}</span> : ago(place.timestamp)}</span>
        {mode === "confirm" ? (
          <div className="flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]">
            <span className="text-[11px] text-red-200/90">{t("Remove this place?")}</span>
            <button onClick={() => setMode("idle")} className="px-2 py-0.5 rounded text-[11px] text-gray-300 bg-white/5 hover:bg-white/15 border border-white/10">
              {t("Keep")}
            </button>
            <button onClick={() => removePlace(place.id)} className="px-2 py-0.5 rounded text-[11px] text-red-100 bg-red-500/30 hover:bg-red-500/50 border border-red-400/40">
              {t("Remove")}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <IconButton title={t("Rename")} onClick={() => setMode("rename")}>
              <path d="M4 20h4L19 9l-4-4L4 16v4z" />
              <path d="M13.5 6.5l4 4" />
            </IconButton>
            <IconButton title={t("Copy Stargate link")} onClick={copy}>
              <rect x={9} y={9} width={11} height={11} rx={2} />
              <path d="M5 15V5a1 1 0 0 1 1-1h10" />
            </IconButton>
            <IconButton title={t("Remove")} danger onClick={() => setMode("confirm")}>
              <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
}

function SavedPlaces({ places, remote, onGo }: { places: SavedPlace[]; remote: boolean; onGo: (place: SavedPlace) => void }) {
  const [filter, setFilter] = useState<PlaceKind | "all">("all");
  const counts = useMemo(() => ({ all: places.length, galaxy: places.filter((p) => p.type === "galaxy").length, system: places.filter((p) => p.type === "system").length, planet: places.filter((p) => p.type === "planet").length }), [places]);
  const shown = filter === "all" ? places : places.filter((p) => p.type === filter);

  if (places.length === 0) {
    return (
      <div className="py-6 text-center">
        <svg width={34} height={34} viewBox="0 0 24 24" className="mx-auto text-cyan-300/50 mb-2" fill="none" stroke="currentColor" strokeWidth={1.3}>
          <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z" />
        </svg>
        <div className="text-sm text-gray-200">{t("No saved places yet")}</div>
        <p className="text-xs text-gray-500 mt-1 max-w-[16rem] mx-auto">{t("Save where your ship is from the Link tab, and come back to it from here at any time.")}</p>
      </div>
    );
  }
  return (
    <div>
      {remote && <p className="text-[11px] text-fuchsia-200/80 mb-2">{t("These places belong to your own universe: return home to travel to them.")}</p>}
      <div className="flex gap-1 mb-2 overflow-x-auto">
        {(["all", "galaxy", "system", "planet"] as const).map((kind) => (
          <button
            key={kind}
            disabled={kind !== "all" && counts[kind] === 0}
            onClick={() => setFilter(kind)}
            className={`shrink-0 px-2 py-1 rounded-md text-[11px] border transition-colors disabled:opacity-30 ${filter === kind ? "border-cyan-400/60 bg-cyan-400/10 text-cyan-100" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`}
          >
            {kind === "all" ? t("All") : t(KIND_STYLE[kind].plural)} <span className="text-gray-500">{counts[kind]}</span>
          </button>
        ))}
      </div>
      <div className="space-y-1.5 max-h-[min(22rem,50dvh)] overflow-y-auto overscroll-contain pr-0.5">
        {shown.map((place) => (
          <PlaceRow key={place.id} place={place} disabled={remote} onGo={onGo} />
        ))}
      </div>
    </div>
  );
}

// ---- the gate -------------------------------------------------------------------------

export function StargatePanel({ explorer, state, universe, onClose }: { explorer: Explorer; state: ExplorerState; universe: UniverseConfig | null; onClose: () => void }) {
  const remote = !!universe?.remote;
  const { text, aligned } = useAlignment(!remote);
  const ship = state.ship;
  const coordinates = ship?.coordinates ?? state.coordinates;
  const places = usePlaces();
  const [tab, setTab] = useState<"link" | "saved">("link");

  const planetName = (() => {
    if (!ship || ship.planet === null) return null;
    if (state.orbiting && state.orbiting.index === ship.planet) return state.orbiting.name;
    if (state.system && state.system.index === ship.system) return state.system.planets.find((p) => p.index === ship.planet)?.name ?? null;
    return null;
  })();
  const deepest: Depth = planetName ? "planet" : ship ? "system" : "galaxy";
  const [depth, setDepth] = useState<Depth>(deepest);
  useEffect(() => setDepth(deepest), [deepest]);
  const [copied, setCopied] = useState(false);

  if (!coordinates) return null;
  const system = depth !== "galaxy" && ship ? ship.system : null;
  // The link carries the generated planet name: the registry resolves its owner
  const path = stargatePath(coordinates, system, depth === "planet" ? planetName : null);
  const url = `${window.location.origin}${path}`;
  const target = { coordinates, system, planet: depth === "planet" && ship ? ship.planet : null, planetName: depth === "planet" ? planetName : null };
  const saved = findPlace(target);
  const galaxyName = state.galaxy ? pretty(state.galaxy.name) : null;
  // As everybody sees them: an owner's name for the place, or the generated one
  const ownedSystemName = ship ? state.owners.system(ship.system)?.name ?? state.shipSystemName : null;
  const systemName = ship ? ownedSystemName ?? t("System #%@", amount(ship.system)) : null;
  const shownPlanetName = planetName && ship && ship.planet !== null ? state.owners.planetName({ index: ship.planet, name: planetName }, ship.system) : null;

  const toggleSaved = () => {
    if (saved) {
      removePlace(saved.id);
      return;
    }
    const name = depth === "planet" && shownPlanetName ? shownPlanetName : depth === "system" ? systemName ?? t("Star system") : galaxyName ?? coordinates.join(", ");
    savePlace(target, { name, type: depth, galaxyName, systemName: depth === "planet" ? systemName : null });
  };

  const go = (place: SavedPlace) => {
    const where = placeTarget(place);
    if (!where) return;
    onClose();
    explorer.goToPlace(where.coordinates, where.system, where.planet, where.planetName);
  };

  const levels: Array<{ depth: Depth; label: string; name: string | null }> = [
    { depth: "galaxy", label: t("Galaxy"), name: state.galaxy ? pretty(state.galaxy.name) : coordinates.join(", ") },
    { depth: "system", label: t("System"), name: ship ? ownedSystemName ?? `#${amount(ship.system)}` : null },
    { depth: "planet", label: t("Planet"), name: shownPlanetName },
  ];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the field is selectable */
    }
  };

  return (
    <Panel className="w-[min(420px,calc(100vw-1.5rem))] p-4 pointer-events-auto">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg width={22} height={22} viewBox="0 0 24 24" className={remote ? "text-red-300" : aligned ? "text-cyan-300" : "text-cyan-300 animate-spin"}>
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={1.5}>
              <path d="M14 12a6 6 0 1 1-6-6" />
              <path d="M10 12a6 6 0 1 1 6 6" opacity={0.5} />
            </g>
          </svg>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500">Stargate</div>
            <div className={`font-mono text-sm ${remote ? "text-red-300" : aligned ? "text-cyan-200" : "text-cyan-400/80"}`}>{remote ? t("Remote Universe") : text}</div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-white leading-none px-1" title={t("Close")}>
          ✕
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 mb-3 rounded-lg bg-black/30 border border-white/10">
        {(["link", "saved"] as const).map((id) => (
          <button key={id} onClick={() => setTab(id)} className={`py-1.5 rounded-md text-xs transition-colors ${tab === id ? "bg-white/10 text-white" : "text-gray-400 hover:text-gray-200"}`}>
            {id === "link" ? (
              t("Link")
            ) : (
              <>
                {t("Saved places")} <span className="text-gray-500">{places.length}</span>
              </>
            )}
          </button>
        ))}
      </div>

      {tab === "saved" ? (
        <SavedPlaces places={places} remote={remote} onGo={go} />
      ) : remote ? (
        <p className="text-xs text-gray-400 leading-relaxed">{t("Stargate links are disabled in remote universes: a gate points into one seed, and this one is not yours. Return to your own universe to open one.")}</p>
      ) : (
        <div className={`transition-opacity duration-300 ${aligned ? "opacity-100" : "opacity-30 pointer-events-none"}`}>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5">{t("Destination")}</div>
          <div className="grid grid-cols-3 gap-1.5 mb-3">
            {levels.map((level) => (
              <button
                key={level.depth}
                disabled={!level.name}
                onClick={() => setDepth(level.depth)}
                className={`text-left px-2 py-1.5 rounded-lg border transition-colors disabled:opacity-30 ${depth === level.depth ? "border-cyan-400/60 bg-cyan-400/10" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
              >
                <div className="text-[10px] uppercase tracking-wider text-gray-500">{level.label}</div>
                <div className="text-xs text-gray-100 truncate">{level.name ?? "—"}</div>
              </button>
            ))}
          </div>
          <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-cyan-100/90 outline-none select-text" />
          <div className="flex gap-2 mt-2.5">
            <Button tone="primary" className="flex-1" onClick={copy}>
              {copied ? t("Copied") : t("Copy link")}
            </Button>
            {typeof navigator.share === "function" && (
              <Button className="flex-1" onClick={() => navigator.share({ title: "The Atlas", text: t("Check out this Stargate destination on The Atlas!"), url }).catch(() => {})}>
                {t("Share")}
              </Button>
            )}
            <Button className={`flex-1 flex items-center justify-center gap-1.5 whitespace-nowrap ${saved ? "!border-amber-300/50 !bg-amber-300/10 text-amber-100" : ""}`} onClick={toggleSaved} title={saved ? t("Remove from your saved places") : t("Keep this destination in your saved places")}>
              <svg width={13} height={13} viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round">
                <path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z" />
              </svg>
              {saved ? t("Saved") : t("Save")}
            </Button>
          </div>
        </div>
      )}
    </Panel>
  );
}
