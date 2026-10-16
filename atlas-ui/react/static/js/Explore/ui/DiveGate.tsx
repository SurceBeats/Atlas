// atlas-ui/react/static/js/Explore/ui/DiveGate.tsx
//
// The front door. Every new visit lands here, already adrift in space: a nebula slowly
// turning, a spiral galaxy far ahead and stars streaming past (they follow the pointer a
// little, as if looking around from the cockpit). Over it, the ATLAS3 mark and a single
// button, "Dive into the void", drawn in WebGL; its last words keep decrypting into
// something else (space, the universe, god's plan...) out of Matrix-style glyphs.
//
// The click is the gesture browsers need before any sound: the soundtrack and the drive
// start on it (onIgnite). The ship then accelerates, the stars stretch into streaks, and
// at full speed the screen burns white into the hyperspace tunnel (onDive).

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { DeepSpace } from "./DeepSpace.ts";
import { useDecrypt } from "./kit.tsx";
import { readUniverseConfig } from "./universe.ts";
import { ComfortNotice, useComfortAsked } from "./ComfortNotice.tsx";

// Seconds from the click to the jump into hyperspace
export const DIVE_SECONDS = 1.0;

const PREFIX = "DIVE INTO ";
const DESTINATIONS = ["THE VOID", "SPACE", "THE UNIVERSE", "GOD'S PLAN", "CREATION", "INFINITY", "THE COSMOS", "THE UNKNOWN", "THE ABYSS", "ETERNITY", "THE SINGULARITY", "THE MULTIVERSE", "THE BIT BANG", "THE STARS"];
const GLYPHS = "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789Z#$%&*+=<>";
const HOLD_SECONDS = 2.6; // each destination stays readable this long
const DECRYPT_SECONDS = 0.75;

const VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT = /* glsl */ `
  uniform sampler2D uText;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uHover;
  uniform float uPress;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 px = vUv * uRes;
    vec2 p = px - uRes * 0.5;
    // Rounded frame
    float radius = uRes.y * 0.22;
    vec2 q = abs(p) - (uRes * 0.5 - 8.0) + radius;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
    float inside = 1.0 - smoothstep(-1.0, 1.0, d);
    float rim = exp(-abs(d) * 0.45);
    float halo = exp(-max(d, 0.0) * 0.08) * (1.0 - inside);

    vec3 cyan = vec3(0.32, 0.88, 1.0);
    vec3 violet = vec3(0.62, 0.45, 1.0);

    // A light running round the frame
    float angle = atan(p.y / uRes.y, p.x / uRes.x);
    float run = pow(0.5 + 0.5 * sin(angle * 2.0 - uTime * 2.4), 8.0);
    vec3 rimColor = mix(cyan, violet, 0.5 + 0.5 * sin(angle + uTime));

    // Glass fill: faint gradient, scanlines, and glyph sparks drifting up
    vec3 fill = mix(vec3(0.0, 0.035, 0.06), vec3(0.0, 0.1, 0.15), uHover) * (1.0 - vUv.y * 0.4);
    fill *= 0.85 + 0.15 * sin(px.y * 1.6);
    vec2 cell = floor(vec2(px.x / 7.0, px.y / 7.0 - uTime * (6.0 + 6.0 * hash(vec2(floor(px.x / 7.0), 1.0)))));
    float spark = step(0.992, hash(cell)) * (0.5 + 0.5 * sin(uTime * 7.0 + hash(cell) * 40.0));
    fill += cyan * spark * 0.35;

    // Text: chromatic split that widens on hover, and a soft bloom
    float split = (0.0012 + 0.0025 * uHover) * (1.0 + 0.5 * sin(uTime * 13.0) * uPress);
    float r = texture2D(uText, vUv + vec2(split, 0.0)).a;
    float g = texture2D(uText, vUv).a;
    float b = texture2D(uText, vUv - vec2(split, 0.0)).a;
    float bloom = 0.0;
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.785398;
      bloom += texture2D(uText, vUv + vec2(cos(a) / uRes.x, sin(a) / uRes.y) * 5.0).a;
    }
    bloom /= 8.0;
    vec3 text = vec3(r, g, b) * mix(cyan, vec3(1.0), 0.55) + cyan * bloom * (0.55 + 0.4 * uHover);

    // Click: a ring rushing out from the centre
    float ring = uPress > 0.0 ? exp(-pow((length(p / uRes.y) - uPress * 3.0) * 6.0, 2.0)) * (1.0 - uPress) : 0.0;

    vec3 color = fill * inside + text * inside + rimColor * rim * (0.35 + 0.65 * run + 0.5 * uHover) + cyan * halo * (0.12 + 0.18 * uHover) + cyan * ring * 1.5;
    float alpha = clamp(inside * 0.9 + rim + halo * 0.6 + ring, 0.0, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`;

// The words, glyph by glyph: the destination decrypts in, then holds with the odd glitch
class MatrixText {
  private index = 0;
  private since = 0;
  private flicker = new Map<number, { glyph: string; until: number }>();

  text(time: number): string {
    if (time - this.since > HOLD_SECONDS + DECRYPT_SECONDS) {
      this.index = (this.index + 1) % DESTINATIONS.length;
      this.since = time;
    }
    const word = DESTINATIONS[this.index];
    const t = (time - this.since) / DECRYPT_SECONDS;
    const settled = Math.floor(Math.min(1, t) * word.length);
    let out = PREFIX;
    for (let i = 0; i < word.length; i++) {
      const ch = word[i];
      if (ch === " ") out += " ";
      else if (i >= settled) out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      else out += this.glitch(PREFIX.length + i, ch, time);
    }
    // The fixed words glitch too, now and then
    return out
      .split("")
      .map((ch, i) => (i < PREFIX.length && ch !== " " ? this.glitch(i, ch, time) : ch))
      .join("");
  }

  private glitch(slot: number, ch: string, time: number) {
    const current = this.flicker.get(slot);
    if (current && current.until > time) return current.glyph;
    if (Math.random() < 0.004) {
      const glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      this.flicker.set(slot, { glyph, until: time + 0.06 + Math.random() * 0.1 });
      return glyph;
    }
    return ch;
  }
}

function DiveButton({ onDive, disabled, onHover }: { onDive: () => void; disabled: boolean; onHover: (hover: boolean) => void }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(0);
  const pressRef = useRef(-1);
  const diveRef = useRef(onDive);
  diveRef.current = onDive;

  useEffect(() => {
    const mount = mountRef.current!;
    const width = Math.min(560, window.innerWidth * 0.88);
    const height = Math.round(width * 0.2);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const ctx = canvas.getContext("2d")!;
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;

    const material = new THREE.ShaderMaterial({
      uniforms: { uText: { value: texture }, uRes: { value: new THREE.Vector2(width, height) }, uTime: { value: 0 }, uHover: { value: 0 }, uPress: { value: 0 } },
      vertexShader: VERTEX,
      fragmentShader: FRAGMENT,
      transparent: true,
    });
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material));
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const matrix = new MatrixText();
    const font = `600 ${Math.round(height * ratio * 0.3)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
    let frame = 0;
    let last = performance.now();
    const start = last;
    const render = (now: number) => {
      frame = requestAnimationFrame(render);
      const time = (now - start) / 1000;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      material.uniforms.uHover.value += (hoverRef.current - material.uniforms.uHover.value) * Math.min(1, dt * 8);
      if (pressRef.current >= 0) pressRef.current = Math.min(1, pressRef.current + dt * 1.4);
      material.uniforms.uPress.value = Math.max(0, pressRef.current);
      material.uniforms.uTime.value = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const text = matrix.text(time);
      // Letter-spaced by hand, scaled down if the longest destination would not fit
      const spacing = canvas.height * 0.06;
      const widths = text.split("").map((ch) => ctx.measureText(ch).width + spacing);
      const total = widths.reduce((a, b) => a + b, 0);
      const scale = Math.min(1, (canvas.width * 0.84) / total);
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.scale(scale, scale);
      let x = -total / 2;
      ctx.fillStyle = "#fff";
      text.split("").forEach((ch, i) => {
        ctx.fillText(ch, x + widths[i] / 2, 0);
        x += widths[i];
      });
      ctx.restore();
      texture.needsUpdate = true;
      renderer.render(scene, camera);
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      texture.dispose();
      material.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      role="button"
      tabIndex={0}
      aria-label="Dive into the void"
      className={`relative select-none outline-none ${disabled ? "pointer-events-none" : "cursor-pointer"}`}
      onPointerEnter={() => {
        hoverRef.current = 1;
        onHover(true);
      }}
      onPointerLeave={() => {
        hoverRef.current = 0;
        onHover(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          pressRef.current = 0;
          diveRef.current();
        }
      }}
      onClick={() => {
        pressRef.current = 0;
        diveRef.current();
      }}
    />
  );
}

// Readouts in the corners, like a ship's instruments waking up
function Telemetry({ accelerating }: { accelerating: boolean }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 120);
    return () => clearInterval(timer);
  }, []);
  const coordinate = (seed: number) => String(Math.floor((Math.sin(tick * 0.07 + seed) * 0.5 + 0.5) * 9_999_999)).padStart(7, "0");
  const lines = accelerating ? ["DRIVE ENGAGED", "JUMP FIELD STABLE", "ENTERING HYPERSPACE"] : ["SYSTEMS NOMINAL", "DRIFTING", `SCAN ${coordinate(1)} · ${coordinate(2)} · ${coordinate(3)}`];
  return (
    <>
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-cyan-200/40 leading-5 pointer-events-none">
        {lines.map((line) => (
          <div key={line.slice(0, 6)}>{line}</div>
        ))}
      </div>
      <div className="hidden sm:block absolute top-6 right-6 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-200/30 text-right leading-5 pointer-events-none">
        <div>{accelerating ? "VELOCITY ∞" : `VELOCITY ${(0.12 + 0.02 * Math.sin(tick * 0.2)).toFixed(3)} C`}</div>
        <div>∞ GALAXIES · ∞ SYSTEMS</div>
      </div>
    </>
  );
}

// ---- the universe's own readout ---------------------------------------------------------
//
// The universe this page opens on, as the ship's instruments read it: its primordial
// seed (and the SHA-256 it is hashed into), the moment of its Big Bang, its age ticking
// live, and how far it has developed towards the evolution limit, shown on a logarithmic
// timeline from the first second to 1.9 million years.

const EVOLUTION_LIMIT_SECONDS = 1_900_000 * 365.25 * 86400;
const CORE_CONTINUUM_SEED = "1.618033988749895";
const YEAR = 365.25 * 86400;
const EPOCHS: Array<{ label: string; seconds: number }> = [
  { label: "1 s", seconds: 1 },
  { label: "1 h", seconds: 3600 },
  { label: "1 d", seconds: 86400 },
  { label: "1 yr", seconds: YEAR },
  { label: "100 yr", seconds: 100 * YEAR },
  { label: "10 kyr", seconds: 10_000 * YEAR },
  { label: "1.9 Myr", seconds: EVOLUTION_LIMIT_SECONDS },
];
const logPosition = (seconds: number) => Math.min(1, Math.max(0, Math.log10(Math.max(seconds, 1)) / Math.log10(EVOLUTION_LIMIT_SECONDS)));

interface UniverseFacts {
  seed: string;
  hash: string;
  origin: number; // unix seconds of the Big Bang
  name: string;
}

function useUniverseFacts(): UniverseFacts | null {
  const [facts, setFacts] = useState<UniverseFacts | null>(null);
  useEffect(() => {
    const config = readUniverseConfig();
    fetch("/api/universe/config", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((data) => {
        if (!data?.success) return;
        const seed = String(data.seed_str ?? config?.seed_str ?? "");
        const name = config?.remote ? `Remote universe · ${config.node_id ?? ""}`.trim() : seed === CORE_CONTINUUM_SEED ? "The Core Continuum" : "Your own universe";
        setFacts({ seed, hash: String(data.seed_hash ?? ""), origin: Number(data.cosmic_origin_time ?? config?.cosmic_origin_time ?? 0), name });
      })
      .catch(() => {});
  }, []);
  return facts;
}

// Live clock for the age and the development (a few times a second is plenty)
function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now() / 1000);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now() / 1000), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}

function formatAge(seconds: number) {
  if (seconds < 0) return "Not yet born";
  const years = Math.floor(seconds / YEAR);
  const days = Math.floor((seconds % YEAR) / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${years}Y ${String(days).padStart(3, "0")}D ${pad(hours)}H ${pad(minutes)}M ${pad(secs)}S`;
}

function formatOrigin(origin: number) {
  return new Date(origin * 1000).toISOString().slice(0, 19).replace("T", " ") + " UTC";
}

// The hash, streaming: a bright scan line runs along it
function HashStream({ hash }: { hash: string }) {
  const shown = useDecrypt(hash, 1400);
  const [scan, setScan] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setScan((s) => (s + 1) % (hash.length + 24)), 45);
    return () => clearInterval(timer);
  }, [hash.length]);
  return (
    <span className="break-all">
      {shown.split("").map((ch, i) => {
        const d = scan - i;
        const lit = d >= 0 && d < 10 ? 1 - d / 10 : 0;
        return (
          <span key={i} style={{ color: `rgba(${Math.round(120 + 135 * lit)}, ${Math.round(200 + 55 * lit)}, 255, ${0.28 + 0.6 * lit})` }}>
            {ch}
          </span>
        );
      })}
    </span>
  );
}

function Readout({ label, value, accent, mono = true }: { label: string; value: React.ReactNode; accent: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-0.5">{label}</div>
      <div className={`${mono ? "font-mono" : ""} text-xs sm:text-sm truncate ${accent}`}>{value}</div>
    </div>
  );
}

function UniverseReadout({ visible }: { visible: boolean }) {
  const facts = useUniverseFacts();
  const now = useNow(73);
  const seed = useDecrypt(facts?.seed ?? "", 900);
  const origin = useDecrypt(facts ? formatOrigin(facts.origin) : "", 1100);
  if (!facts) return null;
  const age = now - facts.origin;
  const development = Math.max(0, (age / EVOLUTION_LIMIT_SECONDS) * 100);
  const at = logPosition(age);

  return (
    <div className={`absolute bottom-0 inset-x-0 px-4 pb-4 sm:pb-7 flex justify-center pointer-events-none transition-all ease-in ${visible ? "opacity-100 duration-300" : "opacity-0 translate-y-3 duration-700"}`}>
      <div className="w-full max-w-5xl animate-[fadeIn_1.8s_ease-out]" style={{ animationDelay: "0.6s", animationFillMode: "both" }}>
        <div className="flex items-center gap-3 mb-2.5">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-cyan-300/70 whitespace-nowrap">{facts.name}</span>
          <span className="h-px flex-1 bg-gradient-to-r from-cyan-300/30 to-transparent" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2.5">
          <Readout label="Primordial seed" value={seed || "—"} accent="text-cyan-100" />
          <Readout label="Big Bang" value={origin} accent="text-violet-200" />
          <Readout label="Age" value={formatAge(age)} accent="text-emerald-200" />
          <Readout label="Development" value={`${development.toFixed(15)}%`} accent="text-amber-200" />
        </div>

        {/* Where the universe stands between its first second and the evolution limit */}
        <div className="relative mt-4 mb-1 h-6">
          <div className="absolute inset-x-0 top-2 h-px bg-white/15" />
          <div className="absolute left-0 top-2 h-px bg-gradient-to-r from-cyan-300/20 via-cyan-300/70 to-amber-200" style={{ width: `${at * 100}%` }} />
          {EPOCHS.map((epoch, i) => {
            const x = logPosition(epoch.seconds) * 100;
            const passed = age >= epoch.seconds;
            // The first and last labels lean inwards, so they stay on screen
            const edge = i === 0 ? "items-start" : i === EPOCHS.length - 1 ? "items-end -translate-x-full" : "items-center -translate-x-1/2";
            return (
              <div key={epoch.label} className={`absolute top-0 flex flex-col ${edge}`} style={{ left: `${x}%` }}>
                <span className={`w-px h-2.5 mt-[3px] ${passed ? "bg-cyan-200/70" : "bg-white/25"}`} />
                <span className={`text-[8px] sm:text-[9px] font-mono mt-1 whitespace-nowrap ${passed ? "text-cyan-200/70" : "text-gray-600"}`}>{epoch.label}</span>
              </div>
            );
          })}
          <div className="absolute top-2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${at * 100}%` }}>
            <span className="block w-2.5 h-2.5 rounded-full bg-amber-200 shadow-[0_0_12px_rgba(253,230,138,0.95)]" />
            <span className="absolute inset-0 rounded-full bg-amber-200/60 animate-ping" />
          </div>
        </div>

        <div className="hidden sm:flex items-baseline gap-3 mt-3 text-[10px] font-mono">
          <span className="uppercase tracking-[0.3em] text-gray-600 shrink-0">SHA-256</span>
          <HashStream hash={facts.hash} />
        </div>
      </div>
    </div>
  );
}

export function DiveGate({ onIgnite, onDive }: { onIgnite: () => void; onDive: () => void }) {
  const [phase, setPhase] = useState<"drifting" | "accelerating" | "leaving" | "gone">("drifting");
  const [comfortAsked, markComfortAsked] = useComfortAsked();
  const spaceRef = useRef<HTMLDivElement>(null);
  const deepRef = useRef<DeepSpace | null>(null);

  useEffect(() => {
    if (!spaceRef.current) return;
    const deep = new DeepSpace(spaceRef.current);
    deepRef.current = deep;
    return () => {
      deep.dispose();
      deepRef.current = null;
    };
  }, []);

  if (phase === "gone") return null;

  const dive = () => {
    if (phase !== "drifting" || !comfortAsked) return;
    setPhase("accelerating");
    onIgnite();
    deepRef.current?.accelerate(DIVE_SECONDS);
    // At full speed: into hyperspace, and the door fades under the flash
    setTimeout(() => {
      setPhase("leaving");
      onDive();
    }, DIVE_SECONDS * 1000);
    setTimeout(() => setPhase("gone"), DIVE_SECONDS * 1000 + 700);
  };

  const accelerating = phase !== "drifting";
  return (
    <div className={`absolute inset-0 z-50 flex items-center justify-center bg-black transition-opacity ease-out ${phase === "leaving" ? "opacity-0 duration-500 pointer-events-none" : "opacity-100 duration-300"}`}>
      <div ref={spaceRef} className="absolute inset-0 pointer-events-none" />
      <Telemetry accelerating={accelerating} />
      <UniverseReadout visible={!accelerating} />
      <div className={`relative -mt-32 sm:-mt-24 flex flex-col items-center gap-10 px-4 transition-all ease-in ${accelerating ? "opacity-0 scale-125 blur-[2px] duration-[900ms]" : "opacity-100 duration-300"}`}>
        <div className="text-center animate-[fadeIn_2.4s_ease-out]">
          <div className="text-4xl sm:text-6xl font-bold tracking-[0.5em] pl-[0.5em] text-white/95 drop-shadow-[0_0_24px_rgba(0,0,0,0.9)]">
            ATLAS<span className="text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.9)]">3</span>
          </div>
          <div className="mt-4 text-[10px] sm:text-[11px] uppercase tracking-[0.22em] sm:tracking-[0.45em] text-cyan-100/60">A procedural universe, in real time</div>
        </div>
        <DiveButton onDive={dive} disabled={accelerating} onHover={(hover) => deepRef.current?.setAnticipation(hover ? 1 : 0)} />
        <div className="text-[10px] uppercase tracking-[0.35em] text-gray-500 flex items-center gap-2">
          <svg width={12} height={12} viewBox="0 0 24 24" className="text-gray-500">
            <path fill="currentColor" d="M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06A9 9 0 0 0 14 3.23z" />
          </svg>
          Best with sound on
        </div>
      </div>
      {!comfortAsked && <ComfortNotice onChosen={markComfortAsked} />}
    </div>
  );
}
