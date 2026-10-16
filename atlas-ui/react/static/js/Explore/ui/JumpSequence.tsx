// atlas-ui/react/static/js/Explore/ui/JumpSequence.tsx
//
// The jump readout at the top of the screen when the ship is sent somewhere it did not
// fly to: a random spot of the universe on the first visit, or the far end of a
// Stargate. Each line resolves as the ship really gets there: coordinates, galaxy,
// star system, planet.

import React, { useEffect, useState } from "react";
import type { ExplorerState } from "../Explorer.ts";
import type { Coordinates } from "../api.ts";
import { useDecrypt } from "./kit.tsx";

export interface JumpPlan {
  kind: "random" | "stargate";
  coordinates: Coordinates;
  system: number | null;
  planet: number | null;
}

const pretty = (name: string) => name.replace(/_/g, " ");

type StepKind = "coords" | "galaxy" | "system" | "planet";

const STEP_STYLE: Record<StepKind, { label: string; chip: string; text: string; icon: React.ReactNode }> = {
  coords: {
    label: "Coords",
    chip: "bg-blue-900/50 text-blue-300 border-blue-500/30",
    text: "text-blue-100",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 3v18M3 12h18" opacity={0.5} />
        <circle cx={12} cy={12} r={4} />
      </g>
    ),
  },
  galaxy: {
    label: "Galaxy",
    chip: "bg-purple-900/50 text-purple-300 border-purple-500/30",
    text: "text-purple-100",
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
    chip: "bg-cyan-900/50 text-cyan-300 border-cyan-500/30",
    text: "text-cyan-100",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx={12} cy={12} r={2.5} fill="currentColor" />
        <ellipse cx={12} cy={12} rx={9} ry={4} opacity={0.6} />
      </g>
    ),
  },
  planet: {
    label: "Planet",
    chip: "bg-pink-900/50 text-pink-300 border-pink-500/30",
    text: "text-pink-100",
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth={1.5}>
        <circle cx={12} cy={12} r={5.5} />
        <path d="M3 14c4 2 14 0 18-4" opacity={0.6} />
      </g>
    ),
  },
};

function StepLine({ kind, value, locked }: { kind: StepKind; value: string; locked: boolean }) {
  const style = STEP_STYLE[kind];
  const shown = useDecrypt(value);
  return (
    <div key={kind} className="flex items-center gap-3 animate-[fadeIn_0.35s_ease-out]">
      <svg width={24} height={24} viewBox="0 0 24 24" className={`shrink-0 ${locked ? "text-emerald-300" : style.text}`}>
        {style.icon}
      </svg>
      <span className={`px-2 py-1 text-[10px] font-mono uppercase rounded border shrink-0 ${style.chip}`}>{style.label}</span>
      <span className={`text-sm font-mono truncate ${locked ? "text-emerald-100" : style.text}`}>{shown}</span>
    </div>
  );
}

export function JumpSequence({ plan, state, onDone }: { plan: JumpPlan; state: ExplorerState; onDone: () => void }) {
  const here = state.galaxy && state.galaxy.coordinates.join(",") === plan.coordinates.join(",") ? state.galaxy : null;
  const steps: Array<{ kind: StepKind; value: string }> = [{ kind: "coords", value: `[${plan.coordinates.map((v) => v.toLocaleString("en")).join(", ")}]` }];
  if (here) steps.push({ kind: "galaxy", value: pretty(here.name) });
  if (here && plan.system !== null && state.system && state.system.index === plan.system) steps.push({ kind: "system", value: pretty(state.system.name) });
  if (here && plan.planet !== null && state.orbiting && state.orbiting.index === plan.planet) steps.push({ kind: "planet", value: pretty(state.orbiting.name) });
  const wanted = 2 + (plan.system !== null ? 1 : 0) + (plan.planet !== null ? 1 : 0);

  // Steps already reached stay reached even if the view moves on (leaving orbit, ...)
  const [seen, setSeen] = useState(steps);
  useEffect(() => {
    if (steps.length > seen.length) setSeen(steps);
  }, [steps.length]);
  // Every line gets its moment on screen, even when the ship reaches two places in a row
  const [shownCount, setShownCount] = useState(1);
  useEffect(() => {
    if (shownCount >= seen.length) return;
    const next = setTimeout(() => setShownCount((n) => n + 1), shownCount === 1 ? 700 : 1300);
    return () => clearTimeout(next);
  }, [shownCount, seen.length]);
  const shown = Math.min(shownCount, seen.length);
  const locked = shown >= wanted;
  const current = seen[shown - 1];

  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    if (!locked) return;
    const fade = setTimeout(() => setLeaving(true), 2600);
    const done = setTimeout(onDone, 3200);
    return () => {
      clearTimeout(fade);
      clearTimeout(done);
    };
  }, [locked]);
  // The user may take the controls on the way: do not hang around forever
  useEffect(() => {
    const timeout = setTimeout(onDone, 45000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className={`w-[min(32rem,calc(100vw-2rem))] transition-all duration-500 ${leaving ? "opacity-0 -translate-y-2" : "opacity-100 translate-y-0"}`}>
      <div className={`relative rounded-xl border px-4 py-3 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-colors duration-700 ${locked ? "bg-gradient-to-r from-emerald-950/85 to-blue-950/85 border-emerald-400/40" : "bg-gradient-to-r from-slate-950/85 to-blue-950/85 border-cyan-500/40"}`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-mono uppercase tracking-[0.3em] ${locked ? "text-emerald-300/90" : "text-cyan-300/80"}`}>
            {plan.kind === "stargate" ? "Stargate" : "Jump protocol"} · {locked ? "location locked" : "in transit"}
          </span>
          <span className="flex gap-1">
            {Array.from({ length: wanted }, (_, i) => (
              <span key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i < shown ? (locked ? "bg-emerald-300" : "bg-cyan-300") : "bg-white/15"}`} />
            ))}
          </span>
        </div>
        <StepLine key={current.kind} kind={current.kind} value={current.value} locked={locked} />
      </div>
    </div>
  );
}
