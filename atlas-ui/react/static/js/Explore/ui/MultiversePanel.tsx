// atlas-ui/react/static/js/Explore/ui/MultiversePanel.tsx
//
// The multiverse, from the cockpit: every universe this Atlas has discovered through the
// P2P network (grouped by seed), and the way into any of them, or back home. Crossing
// over is left to the caller (it spins the jump drive up before the page changes).

import React, { useEffect, useMemo, useState } from "react";
import contentFilter from "../../Utils/ContentFilter.jsx";
import { SeedSanitizer } from "../../Utils/SeedSanitizer.tsx";
import { Button, Modal, Panel } from "./kit.tsx";
import type { UniverseConfig } from "./universe.ts";
import { reducedFlashing } from "../core/comfort.ts";
import { t } from "../../i18n/i18n.ts";

interface Peer {
  peer_id: string;
  seed: string;
  seed_name: string;
  cosmic_origin_time: number;
  last_seen: number;
  status: "ACTIVE" | "INACTIVE" | "STALE" | "ARCHIVED" | "UNKNOWN";
}

interface PeerGroup {
  seed: string;
  seed_name: string;
  cosmic_origin_time: number;
  count: number;
  peers: Peer[];
}

export interface Crossing {
  url: string;
  name: string;
  home: boolean;
}

const STATUS: Record<string, { dot: string; text: string; dim: string }> = {
  ACTIVE: { dot: "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse", text: "text-emerald-300", dim: "" },
  INACTIVE: { dot: "bg-amber-400", text: "text-amber-300", dim: "opacity-85" },
  STALE: { dot: "bg-orange-400", text: "text-orange-300", dim: "opacity-70" },
  ARCHIVED: { dot: "bg-gray-500", text: "text-gray-400", dim: "opacity-50" },
  UNKNOWN: { dot: "bg-red-400", text: "text-red-300", dim: "opacity-60" },
};

const AUTO_REFRESH_KEY = "atlasMultiverseAutoRefresh";
const NOTICE_KEY = "atlasMultiversePortMessageDismissed";
// The Core Continuum seed: shown with its 1986 Bit Bang when a peer has it
const CORE_CONTINUUM_SEED = "1.618033988749895";

const blocked = (group: PeerGroup) => contentFilter.filterContent(group.seed_name).isBlocked || contentFilter.filterContent(group.seed).isBlocked;

function formatBitBang(timestamp: number) {
  if (!timestamp) return t("Unknown origin");
  const date = new Date(timestamp * 1000);
  return Number.isNaN(date.getTime()) ? t("Invalid date") : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatLastSeen(timestamp: number) {
  if (!timestamp) return t("never");
  const minutes = Math.floor((Date.now() - timestamp * 1000) / 60000);
  if (minutes < 1) return t("just now");
  if (minutes < 60) return t("%lldm ago", minutes);
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? t("%lldh ago", hours) : t("%lldd ago", Math.floor(hours / 24));
}

function readFlag(key: string, fallback: boolean) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value === "true";
  } catch {
    return fallback;
  }
}

function writeFlag(key: string, value: boolean) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    /* storage unavailable */
  }
}

export function MultiversePanel({ universe, onClose, onCross }: { universe: UniverseConfig | null; onClose: () => void; onCross: (crossing: Crossing) => void }) {
  const [groups, setGroups] = useState<PeerGroup[] | null>(null);
  const [totalPeers, setTotalPeers] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(() => readFlag(AUTO_REFRESH_KEY, true));
  const [notice, setNotice] = useState(() => !readFlag(NOTICE_KEY, false));

  const scan = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/multiverse/peers", { credentials: "same-origin" });
      const data = await response.json();
      if (data.success) {
        setGroups(data.groups ?? []);
        setTotalPeers(data.total_peers ?? 0);
        setError(null);
      } else setError(data.error || t("The multiverse did not answer."));
    } catch (e) {
      setError(t("Network error: %@", e instanceof Error ? e.message : String(e)));
    } finally {
      setLoading(false);
      setUpdated(new Date());
    }
  };

  useEffect(() => {
    scan();
  }, []);
  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(scan, 30000);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const visible = useMemo(() => (groups ?? []).filter((g) => !blocked(g) && g.peers.length > 0), [groups]);
  const filtered = (groups?.length ?? 0) - visible.length;
  const remote = !!universe?.remote;

  const explore = (group: PeerGroup) => {
    const peer = group.peers.reduce((a, b) => (b.last_seen > a.last_seen ? b : a));
    const params = new URLSearchParams({ seed: group.seed, seed_name: group.seed_name, cosmic_origin_time: String(group.cosmic_origin_time) });
    onCross({ url: `/multiverse/${peer.peer_id}/explore?${params}`, name: SeedSanitizer.sanitizeForDisplay(contentFilter.getDisplayText(group.seed)), home: false });
  };

  return (
    <Modal onClose={onClose}>
      <Panel className="w-[min(1040px,calc(100vw-2rem))] h-[min(720px,calc(100vh-2rem))] flex flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-white/10">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-fuchsia-300/80">{t("P2P universe network")}</div>
            <div className="text-lg text-white font-light tracking-wide">{t("The Multiverse")}</div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-500">
              {t("Peers")} <span className="text-gray-100 font-mono">{totalPeers}</span>
            </span>
            <span className="text-gray-500">
              {t("Universes")} <span className="text-gray-100 font-mono">{visible.length}</span>
            </span>
            {filtered > 0 && (
              <span className="text-gray-500">
                {t("Filtered")} <span className="text-red-300 font-mono">{filtered}</span>
              </span>
            )}
            {updated && <span className="text-gray-600 hidden sm:inline">{updated.toLocaleTimeString()}</span>}
            <Button onClick={scan} disabled={loading}>
              {loading ? t("Scanning…") : t("Refresh")}
            </Button>
            <Button
              onClick={() => {
                writeFlag(AUTO_REFRESH_KEY, !autoRefresh);
                setAutoRefresh(!autoRefresh);
              }}
              className={autoRefresh ? "!border-emerald-400/40 !text-emerald-200" : ""}
            >
              {autoRefresh ? t("Auto on") : t("Auto off")}
            </Button>
            <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none px-1" title={t("Close")}>
              ✕
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {remote && universe && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-950/60 to-indigo-950/60 px-4 py-3">
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-[0.25em] text-fuchsia-300/90 mb-0.5">{t("You are exploring a remote universe")}</div>
                <div className="text-sm text-white font-mono truncate">{SeedSanitizer.sanitizeForDisplay(universe.seed_str) || t("Unknown seed")}</div>
                <div className="text-[11px] text-gray-400 font-mono truncate">{universe.node_id}</div>
              </div>
              <Button tone="primary" onClick={() => onCross({ url: "/multiverse/exit", name: t("your universe"), home: true })}>
                {t("Return to your universe")}
              </Button>
            </div>
          )}

          {notice && (
            <div className="flex items-start gap-3 rounded-xl border border-sky-400/25 bg-sky-950/30 px-4 py-3">
              <div className="flex-1 text-xs leading-relaxed text-gray-300">
                <span className="text-sky-200 font-medium">{t("Private network?")} </span>
                {t("If you're behind a private connection or firewall, open the Atlas ports so other instances can reach yours. That is what lets universes travel across the network.")}
              </div>
              <button
                onClick={() => {
                  writeFlag(NOTICE_KEY, true);
                  setNotice(false);
                }}
                className="text-gray-500 hover:text-white leading-none"
                title={t("Dismiss")}
              >
                ✕
              </button>
            </div>
          )}

          {error && <div className="rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">{error}</div>}

          {groups === null && !error && (
            <div className="flex flex-col items-center justify-center py-20 text-sm text-fuchsia-200/80">
              <div className="w-10 h-10 mb-3 rounded-full border-2 border-fuchsia-400/20 border-t-fuchsia-300 animate-spin" />
              {t("Scanning the multiverse…")}
            </div>
          )}

          {groups !== null && visible.length === 0 && !error && <div className="py-16 text-center text-sm text-gray-400">{t("No other universes found yet. Leave The Atlas running with P2P on: other explorers will appear here as they are discovered.")}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {visible.map((group) => {
              const latest = group.peers.reduce((a, b) => (b.last_seen > a.last_seen ? b : a));
              const status = STATUS[latest.status] ?? STATUS.UNKNOWN;
              const here = remote && universe?.seed_str === group.seed;
              const bitBang = group.seed === CORE_CONTINUUM_SEED ? group.peers.find((p) => new Date(p.cosmic_origin_time * 1000).getFullYear() === 1986)?.cosmic_origin_time ?? group.cosmic_origin_time : group.cosmic_origin_time;
              const peers = [...group.peers].sort((a, b) => b.last_seen - a.last_seen);
              return (
                <div key={group.seed} className={`relative flex flex-col rounded-xl border p-4 transition-colors ${here ? "border-fuchsia-400/60 bg-fuchsia-500/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"} ${status.dim}`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 truncate">{contentFilter.getDisplayText(group.seed_name)}</div>
                      <div className="text-base text-white font-mono truncate" title={group.seed}>
                        {SeedSanitizer.sanitizeForDisplay(contentFilter.getDisplayText(group.seed))}
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 shrink-0 text-[10px] font-mono uppercase ${status.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      {here ? t("exploring") : t(latest.status.toLowerCase())}
                      {group.count > 1 && <span className="ml-1 px-1.5 rounded bg-white/10 text-gray-200">{group.count}</span>}
                    </div>
                  </div>
                  <div className="text-xs space-y-1 mb-3">
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">Bit Bang</span>
                      <span className="text-gray-200">{formatBitBang(bitBang)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-gray-500">{t("Last seen")}</span>
                      <span className="text-gray-200">{formatLastSeen(latest.last_seen)}</span>
                    </div>
                  </div>
                  <details className="mb-3 text-[11px]">
                    <summary className="cursor-pointer text-gray-500 hover:text-gray-300 select-none">
                      {t("%lld Atlas instances", group.count)}
                    </summary>
                    <div className="mt-1.5 space-y-1">
                      {peers.map((peer) => (
                        <div key={peer.peer_id} className="flex justify-between gap-2 rounded bg-black/30 px-2 py-1 font-mono">
                          <span className="truncate text-gray-400">{peer.peer_id}</span>
                          <span className="shrink-0 text-gray-500">{formatLastSeen(peer.last_seen)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                  <div className="mt-auto">
                    <Button tone={here ? "ghost" : "primary"} className="w-full" disabled={here} onClick={() => explore(group)}>
                      {here ? t("You are here") : t("Explore this universe")}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Panel>
    </Modal>
  );
}

// Full-screen veil while the jump drive carries the ship into another universe
export function CrossingVeil({ crossing }: { crossing: Crossing }) {
  const [phase, setPhase] = useState(0);
  const [calm] = useState(() => reducedFlashing());
  useEffect(() => {
    const timers = [setTimeout(() => setPhase(1), 50), setTimeout(() => setPhase(2), 1700)];
    return () => timers.forEach(clearTimeout);
  }, []);
  return (
    <div className="absolute inset-0 pointer-events-auto flex items-center justify-center">
      {/* The screen burns white on the way through, or fades to black with reduced flashing */}
      <div
        className={`absolute inset-0 transition-opacity ${calm ? "duration-1000" : "duration-500"} ${phase === 2 ? "opacity-100" : "opacity-0"}`}
        style={{ background: calm ? "radial-gradient(circle at 50% 50%, #0b2530 0%, #000 70%)" : "radial-gradient(circle at 50% 50%, #ffffff 0%, #a5f3fc 35%, rgba(0,0,0,0) 75%)" }}
      />
      <div className={`relative text-center transition-all duration-700 ${phase >= 1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}>
        <div className="text-[11px] uppercase tracking-[0.5em] text-cyan-200/90 mb-2">{crossing.home ? t("Returning to") : t("Crossing into")}</div>
        <div className="text-3xl sm:text-4xl font-light tracking-wide text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]">{crossing.name}</div>
      </div>
    </div>
  );
}
