// atlas-ui/react/static/js/Explore/ui/FaqPanel.tsx
//
// The universe archive: the F.A.Q. as a ship's database. Sections on the left (a picker
// of its own on small screens), a search across every answer, questions that unfold in
// place, and the research papers as the last section.

import React, { useEffect, useMemo, useRef, useState } from "react";
import { FAQ_PAPERS, FAQ_SECTIONS, FAQ_STATS } from "./faqData.ts";
import { Modal, Panel } from "./kit.tsx";

const PAPERS_ID = "research-papers";
const PAPERS_TITLE = "Research papers";
const THANKS_ID = "thank-you";
const THANKS_TITLE = "Thank you";

// Every entry of the archive's index: the F.A.Q. sections, the papers, and the thanks
const INDEX = [
  ...FAQ_SECTIONS.map((s) => ({ id: s.id, title: s.title, count: s.questions.length as number | null })),
  { id: PAPERS_ID, title: PAPERS_TITLE, count: FAQ_PAPERS.length as number | null },
  { id: THANKS_ID, title: THANKS_TITLE, count: null as number | null },
];

function Thanks() {
  return (
    <div className="mb-5 max-w-2xl">
      <div className="text-[11px] uppercase tracking-[0.25em] text-gray-500 mb-3">{THANKS_TITLE}</div>
      <p className="text-sm text-gray-300 leading-relaxed">
        The Atlas is the work of a great many hours: nights and weekends spent on noise functions, orbits and shaders, on rewriting what was already working because it could be better, and on chasing a universe that would feel real. None of it would exist without the people around it.
      </p>
      <div className="mt-5 space-y-3">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm text-white">To my family</div>
          <p className="text-sm text-gray-400 leading-relaxed mt-1">For being where it all began, and a living legacy. Thank you for making me who I am today.</p>
        </div>
        <div className="rounded-lg border border-rose-300/20 bg-rose-300/[0.04] p-4">
          <div className="text-sm text-white">To my wife, María</div>
          <p className="text-sm text-gray-400 leading-relaxed mt-1">For believing in this from the very first star, even when the sheer complexity of it scared her, or when she worried that taking it too far might get me into trouble. And for every hour this universe borrowed from ours.</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm text-white">To my brother, Néstor</div>
          <p className="text-sm text-gray-400 leading-relaxed mt-1">For the ideas, the tests and the honest opinions along the way, and for ignoring me whenever he is not busy being the CTO of HomeDock OS.</p>
        </div>
        <div className="rounded-lg border border-cyan-300/15 bg-cyan-300/[0.03] p-4">
          <div className="text-sm text-white">To SpaceX and PLD Space</div>
          <p className="text-sm text-gray-400 leading-relaxed mt-1">For the inspiration: for reminding us, launch after launch, that space is not just something to imagine. Space is love, and we all share the same feeling when we look up. The ships of The Atlas carry their names because they earned it.</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <div className="text-sm text-white">And to you</div>
          <p className="text-sm text-gray-400 leading-relaxed mt-1">To everyone who shares this work, or simply takes a moment to look at it. A universe is only worth making if someone comes to explore it. Thank you for being here.</p>
        </div>
      </div>
      <p className="mt-5 text-xs text-gray-500">
        Claudio González ·{" "}
        <a href="https://www.banshee.pro" target="_blank" rel="noopener noreferrer" className="text-cyan-300/80 hover:text-cyan-200">
          Banshee
        </a>
      </p>
    </div>
  );
}

// The section picker for small screens: a button that unfolds the index under it
function SectionPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
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
  const current = INDEX.find((entry) => entry.id === value) ?? INDEX[0];
  return (
    <div ref={rootRef} className="md:hidden relative mb-3">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition-colors ${open ? "border-cyan-400/50 bg-cyan-400/10" : "border-white/10 bg-white/5"}`}>
        <span className="min-w-0">
          <span className="block text-[10px] uppercase tracking-[0.25em] text-gray-500">Section</span>
          <span className="block text-sm text-gray-100 truncate">{current.title}</span>
        </span>
        <svg width={16} height={16} viewBox="0 0 24 24" className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      <div
        className="absolute z-10 left-0 right-0 top-full mt-1.5 rounded-lg border border-white/15 bg-slate-950/95 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden"
        style={{ opacity: open ? 1 : 0, transform: open ? "none" : "translateY(-6px) scale(0.98)", transformOrigin: "top", pointerEvents: open ? "auto" : "none", transition: "opacity 160ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <div className="max-h-[50dvh] overflow-y-auto overscroll-contain py-1">
          {INDEX.map((entry) => {
            const active = entry.id === value;
            return (
              <button
                key={entry.id}
                onClick={() => {
                  onChange(entry.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left text-sm border-l-2 transition-colors ${entry.id === PAPERS_ID ? "mt-1 border-t border-t-white/10" : ""} ${active ? "border-l-cyan-300 bg-cyan-400/10 text-white" : "border-l-transparent text-gray-300 active:bg-white/10"}`}
              >
                <span className="truncate">{entry.title}</span>
                <span className="text-xs text-gray-600 shrink-0">{entry.count ?? <span className="text-rose-300/70">♥</span>}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Papers() {
  return (
    <div className="mb-5">
      <div className="text-[11px] uppercase tracking-[0.25em] text-gray-500 mb-2">{PAPERS_TITLE}</div>
      <p className="text-sm text-gray-400 mb-3">The ideas behind The Atlas, written up as papers. Open access, on Zenodo.</p>
      <div className="grid sm:grid-cols-2 gap-2">
        {FAQ_PAPERS.map((paper) => (
          <a key={paper.href} href={paper.href} target="_blank" rel="noopener noreferrer" className="group flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-cyan-400/30 p-3 transition-colors">
            <svg width={26} height={26} viewBox="0 0 24 24" className="shrink-0 text-cyan-300/80 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinejoin="round">
              <path d="M6 3h8l4 4v14H6z" />
              <path d="M14 3v4h4M9 12h6M9 15h6M9 18h4" />
            </svg>
            <span className="min-w-0">
              <span className="block text-sm text-gray-100 group-hover:text-white">{paper.title}</span>
              <span className="block text-[11px] text-gray-500 mt-0.5">Zenodo · open access</span>
              <span className="block text-[11px] text-cyan-300/80 mt-1.5 group-hover:text-cyan-200">Read the paper →</span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const lower = text.toLowerCase();
  const parts: React.ReactNode[] = [];
  let from = 0;
  for (let at = lower.indexOf(query, from); at !== -1; at = lower.indexOf(query, from)) {
    parts.push(text.slice(from, at), <mark key={at} className="bg-cyan-400/25 text-cyan-100 rounded px-0.5">{text.slice(at, at + query.length)}</mark>);
    from = at + query.length;
  }
  parts.push(text.slice(from));
  return parts;
}

export function FaqPanel({ onClose }: { onClose: () => void }) {
  const [sectionId, setSectionId] = useState(FAQ_SECTIONS[0].id);
  const [open, setOpen] = useState<string | null>(`${FAQ_SECTIONS[0].id}:0`);
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  // Searching looks through every section at once
  const visible = useMemo(() => {
    if (!q) return FAQ_SECTIONS.filter((s) => s.id === sectionId);
    return FAQ_SECTIONS.map((s) => ({ ...s, questions: s.questions.filter((item) => item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)) })).filter((s) => s.questions.length > 0);
  }, [q, sectionId]);
  const matches = visible.reduce((n, s) => n + s.questions.length, 0);

  const choose = (id: string) => {
    setQuery("");
    setSectionId(id);
    setOpen(`${id}:0`);
  };

  return (
    <Modal onClose={onClose}>
      <Panel className="w-[min(960px,calc(100vw-2rem))] h-[min(680px,calc(100vh-2rem))] flex flex-col overflow-hidden select-text">
        <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-white/10">
          <div className="shrink-0">
            <div className="hidden sm:block text-[10px] uppercase tracking-[0.3em] text-cyan-300/80">Universe archive</div>
            <div className="text-lg text-white font-light tracking-wide whitespace-nowrap">The Atlas F.A.Q.</div>
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="flex-1 min-w-0 max-w-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-cyan-400/50"
          />
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg leading-none px-1" title="Close">
            ✕
          </button>
        </div>

        <div className="hidden sm:grid grid-cols-6 border-b border-white/10">
          {FAQ_STATS.map((stat) => (
            <div key={stat.label} className="px-3 py-2 text-center border-r border-white/5 last:border-r-0" title={stat.description}>
              <div className="text-base text-cyan-200 font-mono">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-1 min-h-0">
          <nav className="hidden md:block w-60 shrink-0 border-r border-white/10 overflow-y-auto py-2">
            {INDEX.map((entry) => {
              const active = !q && entry.id === sectionId;
              return (
                <button
                  key={entry.id}
                  onClick={() => choose(entry.id)}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors border-l-2 ${entry.id === PAPERS_ID ? "mt-2 pt-3 border-t border-t-white/10" : ""} ${active ? "border-l-cyan-300 bg-cyan-400/10 text-white" : "border-l-transparent text-gray-400 hover:text-gray-100 hover:bg-white/5"}`}
                >
                  {entry.title}
                  <span className="ml-1 text-gray-600">{entry.count ?? <span className="text-rose-300/70">♥</span>}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            <SectionPicker value={sectionId} onChange={choose} />
            {q && <div className="text-xs text-gray-500 mb-3">{matches === 0 ? "Nothing in the archive matches that." : `${matches} answer${matches === 1 ? "" : "s"} found`}</div>}
            {!q && sectionId === PAPERS_ID && <Papers />}
            {!q && sectionId === THANKS_ID && <Thanks />}
            {visible.map((section) => (
              <div key={section.id} className="mb-5">
                <div className="text-[11px] uppercase tracking-[0.25em] text-gray-500 mb-2">{section.title}</div>
                <div className="space-y-1.5">
                  {section.questions.map((item, i) => {
                    const id = `${section.id}:${i}`;
                    const expanded = q ? true : open === id;
                    return (
                      <div key={id} className={`rounded-lg border transition-colors ${item.highlight ? "border-cyan-400/25" : "border-white/10"} ${expanded ? "bg-white/[0.06]" : "bg-white/[0.02] hover:bg-white/5"}`}>
                        <button onClick={() => setOpen(expanded && !q ? null : id)} className="w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left">
                          <span className={`text-sm ${item.highlight ? "text-cyan-200" : "text-gray-100"}`}>{highlight(item.question, q)}</span>
                          <span className={`text-gray-400 text-lg leading-none transition-transform duration-200 ${expanded ? "rotate-45" : ""}`}>+</span>
                        </button>
                        <div className={`grid transition-all duration-300 ease-out ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                          <div className="overflow-hidden">
                            <p className="px-4 pb-3 text-sm leading-relaxed text-gray-300">{highlight(item.answer, q)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </Modal>
  );
}
