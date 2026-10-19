// atlas-ui/react/static/js/Explore/engine/Labels.ts
//
// World-anchored DOM labels, positioned every frame without going through React.
// Their words may be somebody's (an owner's name for a place): always set as text.

import { sealPath } from "../ui/seals.ts";

const SVG = "http://www.w3.org/2000/svg";

export type LabelKind = "star" | "planet" | "moon" | "poi" | "cluster" | "exotic" | "galaxy" | "hover" | "selected" | "ship";

interface Label {
  el: HTMLDivElement;
  text: string;
  sub: string;
  kind: LabelKind;
  seal: string | null;
  placed: boolean;
}

const KIND_CLASSES: Record<LabelKind, string> = {
  star: "text-[11px] text-sky-100/80 cursor-pointer pointer-events-auto",
  ship: "text-xs text-emerald-300 font-semibold cursor-pointer pointer-events-auto",
  planet: "text-xs text-emerald-100 cursor-pointer pointer-events-auto",
  moon: "text-[11px] text-violet-100 cursor-pointer pointer-events-auto",
  poi: "text-[11px] text-amber-200/90 cursor-pointer pointer-events-auto",
  cluster: "text-[11px] text-violet-200/90 cursor-pointer pointer-events-auto",
  exotic: "text-[11px] text-fuchsia-200 cursor-pointer pointer-events-auto",
  galaxy: "text-xs text-sky-100 cursor-pointer pointer-events-auto",
  hover: "text-xs text-white",
  selected: "text-xs text-cyan-200",
};

const MARKERS: Record<LabelKind, string> = {
  star: "",
  ship: '<span class="inline-block w-0 h-0 -ml-[7px] -mt-[12px] absolute left-0 top-0 border-l-[7px] border-r-[7px] border-t-[12px] border-l-transparent border-r-transparent border-t-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-bounce"></span>',
  planet: '<span class="inline-block w-3 h-3 -ml-1.5 -mt-1.5 absolute left-0 top-0 rounded-full border border-emerald-300/70"></span>',
  moon: '<span class="inline-block w-2.5 h-2.5 -ml-[5px] -mt-[5px] absolute left-0 top-0 rounded-full border border-violet-300/80 shadow-[0_0_5px_rgba(196,181,253,0.7)]"></span>',
  poi: '<span class="inline-block w-2 h-2 -ml-1 -mt-1 absolute left-0 top-0 rotate-45 border border-amber-300/80"></span>',
  cluster: '<span class="inline-block w-4 h-4 -ml-2 -mt-2 absolute left-0 top-0 rounded-full border border-dashed border-violet-300/70"></span>',
  exotic: '<span class="inline-block w-3 h-3 -ml-1.5 -mt-1.5 absolute left-0 top-0 rounded-full border-2 border-fuchsia-300/80 shadow-[0_0_6px_rgba(240,171,252,0.8)]"></span>',
  galaxy: '<span class="inline-block w-5 h-5 -ml-2.5 -mt-2.5 absolute left-0 top-0 rounded-full border border-sky-200/60 border-dashed"></span>',
  hover: '<span class="inline-block w-6 h-6 -ml-3 -mt-3 absolute left-0 top-0 rounded-full border border-white/70"></span>',
  selected: '<span class="inline-block w-7 h-7 -ml-3.5 -mt-3.5 absolute left-0 top-0 rotate-45 border border-cyan-300/90 animate-pulse"></span>',
};

export class LabelLayer {
  private container: HTMLDivElement;
  private labels = new Map<string, Label>();
  private clickHandlers = new Map<string, () => void>();
  private doubleClickHandlers = new Map<string, () => void>();
  private rect: DOMRect = new DOMRect();

  // `wheelTarget` receives wheel events that land on clickable labels, so zooming
  // keeps working when the cursor happens to sit on top of one
  constructor(parent: HTMLElement, private wheelTarget?: HTMLElement) {
    this.container = document.createElement("div");
    this.container.className = "absolute inset-0 pointer-events-none overflow-hidden select-none";
    // A finger landing on a label is a tap on it, never the browser's own pan or zoom
    this.container.style.touchAction = "none";
    parent.appendChild(this.container);
  }

  // `onDoubleClick` is the label's "engage" (travel / go into orbit), like double-
  // clicking the object itself. `seal`: its owner's emblem, before the name
  upsert(id: string, kind: LabelKind, text: string, sub = "", onClick?: () => void, onDoubleClick?: () => void, seal: string | null = null) {
    let label = this.labels.get(id);
    if (!label) {
      const el = document.createElement("div");
      el.className = "absolute left-0 top-0 whitespace-nowrap will-change-transform";
      el.style.display = "none";
      // A second click soon after is a double click. Timed here rather than with the
      // browser's dblclick, which touch screens do not send
      let lastClick = 0;
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const now = performance.now();
        if (now - lastClick < 350) {
          lastClick = 0;
          this.doubleClickHandlers.get(id)?.();
          return;
        }
        lastClick = now;
        this.clickHandlers.get(id)?.();
      });
      el.addEventListener("pointerdown", (e) => e.stopPropagation());
      el.addEventListener(
        "wheel",
        (e) => {
          e.preventDefault();
          this.wheelTarget?.dispatchEvent(new WheelEvent("wheel", e));
        },
        { passive: false }
      );
      this.container.appendChild(el);
      label = { el, text: "", sub: "", kind, seal: null, placed: false };
      this.labels.set(id, label);
    }
    if (onClick) this.clickHandlers.set(id, onClick);
    if (onDoubleClick) this.doubleClickHandlers.set(id, onDoubleClick);
    if (label.text !== text || label.sub !== sub || label.kind !== kind || label.seal !== seal) {
      label.text = text;
      label.sub = sub;
      label.kind = kind;
      label.seal = seal;
      label.el.className = `absolute left-0 top-0 whitespace-nowrap will-change-transform ${KIND_CLASSES[kind]}`;
      // The marker is ours; the words are set as text
      label.el.innerHTML = MARKERS[kind];
      const body = document.createElement("span");
      body.className = "absolute left-3 -top-2 font-mono tracking-wide drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]";
      const path = sealPath(seal);
      if (path) {
        const icon = document.createElementNS(SVG, "svg");
        icon.setAttribute("viewBox", "0 0 24 24");
        icon.setAttribute("class", "inline-block w-3 h-3 mr-1 -mt-0.5 align-middle text-emerald-200");
        const shape = document.createElementNS(SVG, "path");
        shape.setAttribute("d", path);
        shape.setAttribute("fill", "currentColor");
        icon.appendChild(shape);
        body.appendChild(icon);
      }
      body.appendChild(document.createTextNode(text));
      for (const line of sub.split("\n").filter(Boolean)) {
        const row = document.createElement("span");
        row.className = "block text-[10px] opacity-60";
        row.textContent = line;
        body.appendChild(row);
      }
      label.el.appendChild(body);
    }
  }

  // Every label at once (0 = gone), e.g. while the jump drive runs
  setFade(amount: number) {
    const value = amount >= 0.999 ? "" : amount.toFixed(3);
    if (this.container.style.opacity !== value) this.container.style.opacity = value;
  }

  beginFrame() {
    this.rect = this.container.getBoundingClientRect();
    this.labels.forEach((l) => (l.placed = false));
  }

  place(id: string, x: number, y: number, opacity = 1) {
    const label = this.labels.get(id);
    if (!label) return;
    const rect = this.rect;
    label.placed = true;
    label.el.style.display = "block";
    label.el.style.opacity = String(opacity);
    label.el.style.transform = `translate(${(x - rect.left).toFixed(1)}px, ${(y - rect.top).toFixed(1)}px)`;
  }

  endFrame() {
    this.labels.forEach((l) => {
      if (!l.placed) l.el.style.display = "none";
    });
  }

  remove(id: string) {
    const label = this.labels.get(id);
    if (!label) return;
    label.el.remove();
    this.labels.delete(id);
    this.clickHandlers.delete(id);
    this.doubleClickHandlers.delete(id);
  }

  removeWhere(predicate: (id: string) => boolean) {
    Array.from(this.labels.keys())
      .filter(predicate)
      .forEach((id) => this.remove(id));
  }

  dispose() {
    this.container.remove();
    this.labels.clear();
    this.clickHandlers.clear();
    this.doubleClickHandlers.clear();
  }
}
