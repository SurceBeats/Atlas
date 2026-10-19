// atlas-ui/react/static/js/Layouts/__onboarding__.tsx
//
// The Atlas Initialization Protocol: the very first screen, before any universe exists.
// The same deep space as the explorer's front door (see Explore/ui/DeepSpace), and one
// question: the shared universe, or one of your own from a seed. Initializing plays the
// birth of that universe (see Explore/ui/Creation) while the server creates it, and
// ends on the front door.

import React, { useCallback, useEffect, useRef, useState } from "react";
import { DeepSpace } from "../Explore/ui/DeepSpace.ts";
import { Creation, CREATION_EPOCHS, CREATION_PRELUDE, type CreationEpoch } from "../Explore/ui/Creation.ts";
import { useDecrypt } from "../Explore/ui/kit.tsx";
import { Genesis } from "../Explore/audio/Genesis.ts";
import { ComfortNotice, useComfortAsked } from "../Explore/ui/ComfortNotice.tsx";
import { reducedFlashing } from "../Explore/core/comfort.ts";
import contentFilter from "../Utils/ContentFilter.jsx";
import { t } from "../i18n/i18n.ts";

interface OnboardingLayoutProps {
  version: string;
  versionHash: string;
}

type Choice = "default" | "custom";
type Phase = "choosing" | "creating";

const SEED_MAX = 20;

// The universe the server made, for the captions of its birth
interface BornUniverse {
  seed: string;
  origin: number;
}

const formatOrigin = (origin: number) => new Date(origin * 1000).toISOString().slice(0, 19).replace("T", " ") + " UTC";

// Where each epoch sits on the timeline: a short Euclidean stretch before the transition
// surface (τ < 0, no time yet), then cosmic time on a logarithmic scale
const EUCLIDEAN = 0.16;
const LOG_FROM = -43;
const LOG_TO = 17;
const timelineAt = (epoch: CreationEpoch) =>
  epoch.tau !== undefined ? EUCLIDEAN * epoch.tau : EUCLIDEAN + (1 - EUCLIDEAN) * Math.min(Math.max((Math.log10(epoch.seconds) - LOG_FROM) / (LOG_TO - LOG_FROM), 0), 1);
const TIMELINE_MARKS = [
  { label: "τ < 0", at: 0, align: "left" },
  { label: "Σₜ", at: EUCLIDEAN, align: "center" },
  { label: "1 s", at: EUCLIDEAN + (1 - EUCLIDEAN) * (43 / 60), align: "center" },
  { label: "1 yr", at: EUCLIDEAN + (1 - EUCLIDEAN) * (50.5 / 60), align: "center" },
  { label: "1 Gyr", at: 1, align: "right" },
];
const superscript = (n: number) => String(n).replace(/\d/g, (d) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[Number(d)]);

// Before time: entanglement entropy filling the torus towards its limit, read straight
// from the animation every frame
function EntropyGauge({ entropy, accent }: { entropy: () => number; accent: string }) {
  const bar = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const e = entropy();
      if (bar.current) bar.current.style.width = `${e * 100}%`;
      if (label.current) label.current.textContent = `log n ≈ 10${superscript(Math.round(123 * e))}`;
      frame = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame);
  }, [entropy]);
  return (
    <div className="mt-3 flex items-center gap-3 font-mono text-[10px] text-gray-500 animate-[fadeIn_0.8s_ease-out]">
      <span>Sₑₙₜ / Sₘₐₓ</span>
      <div className="relative w-28 sm:w-40 h-px bg-white/15">
        <div ref={bar} className={`absolute left-0 top-0 h-px ${accent}`} />
      </div>
      <span ref={label} className="tabular-nums" />
    </div>
  );
}

// Captions of the birth, as a documentary would set them: cosmic time, the epoch, the
// temperature of the universe and its equation, a timeline, and the universe's own facts
function CreationCaptions({ epoch, born, kind, entropy }: { epoch: number; born: BornUniverse | null; kind: Choice; entropy: () => number }) {
  const current = epoch >= 0 ? CREATION_EPOCHS[epoch] : CREATION_PRELUDE;
  const last = epoch === CREATION_EPOCHS.length - 1;
  const primordial = current.tau !== undefined;
  const time = useDecrypt(t(current.time), 320);
  const name = kind === "default" ? "The Core Continuum" : born ? born.seed : t("Your own universe");
  const accent = kind === "default" ? "text-cyan-200/80" : "text-violet-200/80";
  return (
    <>
      {/* An epigraph over the torus, as a film opens, gone once it begins to collapse */}
      <div className={`absolute inset-x-6 top-[14%] sm:top-[16%] text-center pointer-events-none transition-opacity duration-1000 ${epoch < 1 ? "opacity-100" : "opacity-0"}`}>
        <div className="font-serif italic text-lg sm:text-2xl text-white/70 animate-[fadeIn_2.4s_ease-out] text-balance">{t("“Even the void has a memory limit.”")}</div>
        <div className="mt-2 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-gray-500 animate-[fadeIn_3.2s_ease-out]">{t("PRIMORDIAL 4D TORUS HYPOTHESIS")}</div>
      </div>
      {/* A faint shade under the captions, so they read over the bright plasma too */}
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      <div className="absolute left-5 right-5 sm:left-10 sm:right-10 bottom-8 sm:bottom-10 pointer-events-none [text-shadow:0_1px_2px_rgba(0,0,0,0.85),0_0_14px_rgba(0,0,0,0.6)]">
        <div key={epoch} className="animate-[fadeIn_0.6s_ease-out] min-h-[6.75rem] flex flex-col justify-end">
          {last ? (
            <>
              <div className="text-xl sm:text-2xl font-light text-white tracking-wide">{name}</div>
              <div className={`mt-1 text-[10px] sm:text-[11px] uppercase tracking-[0.35em] ${accent}`}>{t("Universe created")}</div>
              {born && <div className="mt-1 font-mono text-[11px] text-gray-400">{t("Big Bang %@", formatOrigin(born.origin))}</div>}
            </>
          ) : (
            <>
              <div className="font-mono text-lg sm:text-2xl font-light text-white/95">{time}</div>
              <div className={`mt-1 text-[10px] sm:text-[11px] uppercase tracking-[0.35em] ${accent}`}>{t(current.title)}</div>
              {current.temperature && <div className="mt-1 font-mono text-[11px] text-gray-400">T ≈ {current.temperature}</div>}
              {current.formula && <div className="mt-1 font-serif italic text-[12px] sm:text-[13px] text-gray-500 truncate">{current.formula}</div>}
            </>
          )}
        </div>
        {primordial && <EntropyGauge entropy={entropy} accent={kind === "default" ? "bg-cyan-200/70" : "bg-violet-200/70"} />}
        {/* No time before the transition surface, then cosmic time on a logarithmic scale */}
        <div className="relative mt-4 h-px">
          <div className="absolute top-0 h-px border-t border-dashed border-white/15" style={{ left: 0, width: `${EUCLIDEAN * 100}%` }} />
          <div className="absolute top-0 h-px bg-white/15" style={{ left: `${EUCLIDEAN * 100}%`, right: 0 }} />
          <div className="absolute left-0 top-0 h-px bg-white/60 transition-[width] duration-700 ease-out" style={{ width: `${timelineAt(current) * 100}%` }} />
          <div className={`absolute top-0 w-1.5 h-1.5 -mt-[2.5px] -ml-[3px] rounded-full bg-white transition-[left] duration-700 ease-out ${primordial ? "animate-pulse" : ""}`} style={{ left: `${timelineAt(current) * 100}%` }} />
        </div>
        <div className="relative h-4 mt-1.5 font-mono text-[9px] text-gray-600">
          {TIMELINE_MARKS.map((mark) => (
            <span key={mark.label} className={`absolute top-0 whitespace-nowrap ${mark.align === "center" ? "-translate-x-1/2" : mark.align === "right" ? "-translate-x-full" : ""}`} style={{ left: `${mark.at * 100}%` }}>
              {t(mark.label)}
            </span>
          ))}
        </div>
      </div>
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-cyan-200/40 leading-5 pointer-events-none">
        <div>{t("ATLAS INITIALIZATION PROTOCOL")}</div>
        <div>{primordial ? t("PRIMORDIAL STATE · τ < 0") : last ? t("UNIVERSE CREATED") : t("UNIVERSE EXPANDING")}</div>
      </div>
    </>
  );
}

// In English, translated when shown (the Core Continuum keeps its name)
const OPTIONS: Array<{ value: Choice; title: string; kicker: string; description: string; points: string[] }> = [
  {
    value: "default",
    title: "The Core Continuum",
    kicker: "Shared universe",
    description: "The primordial universe, the same for everyone. Explore the cosmos we all traverse as one.",
    points: ["Stargate links work with anyone", "Visit and be visited across the multiverse"],
  },
  {
    value: "custom",
    title: "Design the Multiverse",
    kicker: "Your own universe",
    description: "A universe of your own, born from a seed and its own moment of creation.",
    points: ["Choose a seed, or let chance decide", "Entirely shaped by your decision"],
  },
];

function validateSeed(seed: string): string {
  if (seed.length > SEED_MAX) return t("%lld characters at most", SEED_MAX);
  const result = contentFilter.filterSeed(seed);
  return result.isBlocked ? (result.reason ? t(result.reason) : t("That seed is not allowed")) : "";
}

// A readable random seed: syllables and a number
function randomSeed() {
  const syllables = ["ka", "lo", "ri", "ven", "tor", "sa", "mi", "nox", "el", "dra", "qu", "or", "zen", "ta", "lu", "ix"];
  let seed = "";
  while (seed.length < 8) seed += syllables[Math.floor(Math.random() * syllables.length)];
  return `${seed[0].toUpperCase()}${seed.slice(1)}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

const OptionIcon: React.FC<{ value: Choice }> = ({ value }) => (
  <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" className={value === "default" ? "text-cyan-300" : "text-violet-300"}>
    {value === "default" ? (
      <>
        <path d="M12 12c3-4 8-3 8 1s-6 7-10 5" />
        <path d="M12 12c-3 4-8 3-8-1s6-7 10-5" />
        <circle cx={12} cy={12} r={1.3} fill="currentColor" />
      </>
    ) : (
      <>
        <circle cx={12} cy={12} r={2.2} fill="currentColor" />
        <circle cx={12} cy={12} r={5.5} opacity={0.7} />
        <circle cx={12} cy={12} r={9} opacity={0.4} strokeDasharray="2 2.6" />
      </>
    )}
  </svg>
);

const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({ version }) => {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [seed, setSeed] = useState("");
  const [seedError, setSeedError] = useState("");
  const [phase, setPhase] = useState<Phase>("choosing");
  const [failure, setFailure] = useState("");
  const [epoch, setEpoch] = useState(-1);
  const [born, setBorn] = useState<BornUniverse | null>(null);
  const spaceRef = useRef<HTMLDivElement>(null);
  const deepRef = useRef<DeepSpace | null>(null);
  const creationRef = useRef<HTMLDivElement>(null);
  const creation = useRef<Creation | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const score = useRef<Genesis | null>(null);
  const [comfortAsked, markComfortAsked] = useComfortAsked();

  useEffect(() => {
    if (!spaceRef.current) return;
    const deep = new DeepSpace(spaceRef.current);
    deepRef.current = deep;
    return () => deep.dispose();
  }, []);
  useEffect(
    () => () => {
      creation.current?.dispose();
      score.current?.stop();
    },
    []
  );

  const ready = !!choice && phase === "choosing" && !(choice === "custom" && seedError);
  const letterbox = phase === "creating" && epoch < CREATION_EPOCHS.length - 1;
  const entropy = useCallback(() => creation.current?.entropy ?? 0, []);

  const changeSeed = (value: string) => {
    if (value.length > SEED_MAX) return;
    setSeed(value);
    setSeedError(validateSeed(value));
  };

  const initialize = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!ready || !creationRef.current) return;
    setPhase("creating");
    setFailure("");
    setEpoch(-1);
    setBorn(null);

    // The click is the gesture sound needs: the score for the birth (see Explore/audio/Genesis)
    score.current?.stop();
    score.current = null;
    try {
      const AudioCtor: typeof AudioContext | undefined = window.AudioContext ?? (window as any).webkitAudioContext;
      if (AudioCtor) {
        audio.current ??= new AudioCtor();
        audio.current.resume();
        score.current = new Genesis(audio.current);
        score.current.start(entropy);
      }
    } catch {
      /* silent birth */
    }

    // The primordial torus appears at once and holds until the server has made the universe
    creation.current?.dispose();
    creation.current = new Creation(creationRef.current, choice === "default" ? "core" : "custom", choice === "custom" ? seed.trim() : "core-continuum", {
      onCollapse: (untilBang) => score.current?.collapse(untilBang),
      onBang: () => score.current?.bang(),
      onEpoch: (index) => {
        setEpoch(index);
        score.current?.cue(CREATION_EPOCHS[index].cue);
      },
      onDone: () => (window.location.href = "/"),
    }, reducedFlashing());

    const form = new FormData();
    form.append("universe_type", choice!);
    if (choice === "custom" && seed.trim()) form.append("custom_seed", seed.trim());
    try {
      const response = await fetch("/onboarding", { method: "POST", body: form });
      if (!response.ok) throw new Error(t("The server answered %@", String(response.status)));
      // The universe exists: read its seed and the moment of its Big Bang for the captions
      try {
        const config = await (await fetch("/api/universe/config")).json();
        if (config?.success) setBorn({ seed: String(config.seed_str), origin: Number(config.cosmic_origin_time) });
      } catch {
        /* captions without the facts */
      }
      creation.current.release();
    } catch (error) {
      creation.current?.dispose();
      creation.current = null;
      score.current?.stop();
      score.current = null;
      setFailure(error instanceof Error ? error.message : t("The universe could not be created"));
      setPhase("choosing");
    }
  };

  return (
    <div className="fixed inset-0 bg-black text-gray-200 overflow-hidden select-none">
      <div ref={spaceRef} className="absolute inset-0 pointer-events-none" />

      {/* Instruments in the corners */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-cyan-200/40 leading-5 pointer-events-none">
        <div>{t("ATLAS INITIALIZATION PROTOCOL")}</div>
        <div>{t("Awaiting directive")}</div>
      </div>
      <div className="hidden sm:block absolute bottom-6 right-6 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-cyan-200/30 text-right leading-5 pointer-events-none">
        <div>v{version}</div>
        <div>{t("∞ GALAXIES · ∞ SYSTEMS")}</div>
      </div>

      <form
        onSubmit={initialize}
        className={`absolute inset-0 overflow-y-auto overscroll-contain flex flex-col items-center px-4 py-16 sm:py-10 transition-all ease-in ${phase === "creating" ? "opacity-0 scale-95 blur-[2px] pointer-events-none duration-500" : "opacity-100 duration-300"}`}
      >
        <div className="my-auto w-full max-w-3xl flex flex-col items-center">
          <div className="text-center animate-[fadeIn_1.6s_ease-out]">
            <div className="text-4xl sm:text-5xl font-bold tracking-[0.5em] pl-[0.5em] text-white/95 drop-shadow-[0_0_24px_rgba(0,0,0,0.9)]">
              ATLAS<span className="text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.9)]">3</span>
            </div>
            <div className="mt-3 text-[10px] sm:text-[11px] uppercase tracking-[0.3em] sm:tracking-[0.45em] text-cyan-100/60">{t("Initialization protocol")}</div>
            <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed text-balance">{t("Will you journey through a shared universe, or forge a new one of your own?")}</p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 w-full">
            {OPTIONS.map((option, i) => {
              const selected = choice === option.value;
              const accent = option.value === "default" ? "cyan" : "violet";
              return (
                <div
                  key={option.value}
                  role="radio"
                  aria-checked={selected}
                  tabIndex={0}
                  onClick={() => phase === "choosing" && setChoice(option.value)}
                  onKeyDown={(e) => (e.key === " " || e.key === "Enter") && phase === "choosing" && (e.preventDefault(), setChoice(option.value))}
                  style={{ animationDelay: `${0.2 + i * 0.12}s`, animationFillMode: "both" }}
                  className={`relative text-left rounded-xl border p-5 sm:p-6 backdrop-blur-md cursor-pointer outline-none transition-all duration-300 animate-[fadeIn_0.9s_ease-out] ${
                    selected
                      ? accent === "cyan"
                        ? "bg-cyan-400/[0.08] border-cyan-300/60 shadow-[0_0_40px_rgba(34,211,238,0.18)]"
                        : "bg-violet-400/[0.08] border-violet-300/60 shadow-[0_0_40px_rgba(167,139,250,0.2)]"
                      : "bg-slate-950/60 border-white/10 hover:bg-slate-900/70 hover:border-white/25 focus-visible:border-white/30"
                  }`}
                >
                  <span className={`absolute top-4 right-4 w-4 h-4 rounded-full border transition-colors ${selected ? (accent === "cyan" ? "border-cyan-300 bg-cyan-300/90" : "border-violet-300 bg-violet-300/90") : "border-white/30"}`}>
                    {selected && <span className="absolute inset-[4px] rounded-full bg-slate-950" />}
                  </span>
                  <OptionIcon value={option.value} />
                  <div className={`mt-3 text-[10px] uppercase tracking-[0.3em] ${accent === "cyan" ? "text-cyan-300/80" : "text-violet-300/80"}`}>{t(option.kicker)}</div>
                  <div className="text-lg sm:text-xl text-white font-light tracking-wide mt-0.5">{option.value === "default" ? option.title : t(option.title)}</div>
                  <p className="text-sm text-gray-400 leading-relaxed mt-2">{t(option.description)}</p>
                  <ul className="mt-3 space-y-1">
                    {option.points.map((point) => (
                      <li key={point} className="flex items-center gap-2 text-xs text-gray-400">
                        <span className={`w-1 h-1 rounded-full ${accent === "cyan" ? "bg-cyan-300" : "bg-violet-300"}`} />
                        {t(point)}
                      </li>
                    ))}
                  </ul>

                  {option.value === "custom" && (
                    <div className={`grid transition-all duration-300 ease-out ${selected ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"}`} onClick={(e) => e.stopPropagation()}>
                      <div className="overflow-hidden">
                        <label className="block text-[10px] uppercase tracking-[0.25em] text-gray-500 mb-1.5">{t("Seed (optional)")}</label>
                        <div className="flex gap-1.5">
                          <input
                            value={seed}
                            onChange={(e) => changeSeed(e.target.value)}
                            maxLength={SEED_MAX}
                            placeholder={t("Empty for a random seed")}
                            disabled={phase !== "choosing"}
                            className={`min-w-0 flex-1 bg-black/40 border rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-600 outline-none transition-colors select-text ${seedError ? "border-red-400/60" : "border-white/15 focus:border-violet-300/60"}`}
                          />
                          <button type="button" title={t("A random seed")} aria-label={t("A random seed")} onClick={() => changeSeed(randomSeed())} className="shrink-0 w-10 flex items-center justify-center rounded-lg border border-white/15 bg-white/5 hover:bg-white/15 text-gray-300">
                            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round">
                              <rect x={4} y={4} width={16} height={16} rx={3} />
                              <circle cx={9} cy={9} r={1} fill="currentColor" />
                              <circle cx={15} cy={15} r={1} fill="currentColor" />
                              <circle cx={15} cy={9} r={1} fill="currentColor" />
                              <circle cx={9} cy={15} r={1} fill="currentColor" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex justify-between text-[11px] mt-1">
                          <span className={seedError ? "text-red-300" : "text-gray-600"}>{seedError || t("Up to %lld characters, or roll the dice", SEED_MAX)}</span>
                          <span className="text-gray-600 font-mono shrink-0 pl-2">
                            {seed.length}/{SEED_MAX}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-7 flex flex-col items-center gap-3 animate-[fadeIn_1.2s_ease-out]" style={{ animationDelay: "0.5s", animationFillMode: "both" }}>
            <button
              type="submit"
              disabled={!ready}
              className={`min-w-[15rem] px-6 py-3 rounded-xl font-mono text-sm uppercase tracking-[0.35em] transition-all duration-300 ${
                ready ? "bg-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:bg-cyan-300 active:scale-[0.98]" : phase === "choosing" ? "bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed" : "bg-cyan-400/70 text-slate-950"
              }`}
            >
              {phase === "creating" ? t("Creating…") : choice ? t("Initialize") : t("Choose a universe")}
            </button>
            {failure && <div className="text-xs text-red-300">{t("%@. Try again.", failure)}</div>}
            <div className="text-[10px] uppercase tracking-[0.3em] text-gray-600">{t("Other universes can be visited later through the multiverse")}</div>
          </div>
        </div>
      </form>

      {/* The birth of the universe, over everything, framed like a film until it is done */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-700 ${phase === "creating" ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
        <div ref={creationRef} className="absolute inset-0" />
        <div className={`absolute inset-x-0 top-0 h-[6vh] max-h-14 bg-black transition-transform duration-[1400ms] ease-in-out pointer-events-none ${letterbox ? "translate-y-0" : "-translate-y-full"}`} />
        <div className={`absolute inset-x-0 bottom-0 h-[6vh] max-h-14 bg-black transition-transform duration-[1400ms] ease-in-out pointer-events-none ${letterbox ? "translate-y-0" : "translate-y-full"}`} />
        {phase === "creating" && <CreationCaptions epoch={epoch} born={born} kind={choice ?? "default"} entropy={entropy} />}
      </div>

      {!comfortAsked && <ComfortNotice onChosen={markComfortAsked} />}
    </div>
  );
};

export default OnboardingLayout;
