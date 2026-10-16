// atlas-ui/react/static/js/Explore/ui/kit.tsx
//
// The cockpit's building blocks: glass panels, buttons and key hints.

import React from "react";

export const Panel: React.FC<{ className?: string; children: React.ReactNode }> = ({ className = "", children }) => <div className={`bg-slate-950/75 backdrop-blur-md border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] ${className}`}>{children}</div>;

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: "primary" | "ghost" }> = ({ tone = "ghost", className = "", ...props }) => (
  <button
    {...props}
    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${tone === "primary" ? "bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.45)]" : "bg-white/5 hover:bg-white/15 text-gray-200 border border-white/10"} ${className}`}
  />
);

// Keyboard hint: pointless on touch screens, so only from the small breakpoint up
export const Key: React.FC<{ children: React.ReactNode }> = ({ children }) => <kbd className="hidden sm:inline ml-1.5 px-1 rounded border border-current/30 text-[10px] opacity-70 font-mono">{children}</kbd>;

// ---- entering and leaving --------------------------------------------------------

const PRESENCE_MS = 260;
const EASE_OUT = "cubic-bezier(0.16, 1, 0.3, 1)";
const PresenceContext = React.createContext(true);

// Keeps its content on screen while it animates out. Whatever is inside (a Modal, a
// Drop) reads whether it is entering/shown or leaving from the context
export function Presence({ show, children }: { show: boolean; children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(show);
  const [visible, setVisible] = React.useState(false);
  React.useEffect(() => {
    if (show) {
      setMounted(true);
      // Two frames: the hidden state must be painted before the transition starts
      let second = 0;
      const first = requestAnimationFrame(() => (second = requestAnimationFrame(() => setVisible(true))));
      return () => {
        cancelAnimationFrame(first);
        cancelAnimationFrame(second);
      };
    }
    setVisible(false);
    const timer = setTimeout(() => setMounted(false), PRESENCE_MS);
    return () => clearTimeout(timer);
  }, [show]);
  if (!mounted) return null;
  return <PresenceContext.Provider value={visible}>{children}</PresenceContext.Provider>;
}

// Full-screen dimmer that closes on a click outside its content. The dimmer fades, the
// content rises into place
export const Modal: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => {
  const visible = React.useContext(PresenceContext);
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto p-4" style={{ opacity: visible ? 1 : 0, transition: `opacity ${PRESENCE_MS}ms ease` }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-full flex"
        style={{ transform: visible ? "none" : "translateY(14px) scale(0.965)", transition: `transform ${PRESENCE_MS + 60}ms ${EASE_OUT}` }}
      >
        {children}
      </div>
    </div>
  );
};

// A panel dropping from the top bar: it unfolds from its corner
export const Drop: React.FC<{ className?: string; style?: React.CSSProperties; origin?: string; children: React.ReactNode }> = ({ className = "", style, origin = "top right", children }) => {
  const visible = React.useContext(PresenceContext);
  return (
    <div
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(-10px) scale(0.96)",
        transformOrigin: origin,
        transition: `opacity ${PRESENCE_MS - 40}ms ease, transform ${PRESENCE_MS + 40}ms ${EASE_OUT}`,
      }}
    >
      {children}
    </div>
  );
};

const SCRAMBLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";

// Text that resolves out of scrambled characters, left to right
export function useDecrypt(text: string, duration = 520): string {
  const [shown, setShown] = React.useState(text);
  React.useEffect(() => {
    const start = performance.now();
    let frame = 0;
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / duration);
      const settled = Math.floor(t * text.length);
      let out = text.slice(0, settled);
      for (let i = settled; i < text.length; i++) out += text[i] === " " ? " " : SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)];
      setShown(out);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, duration]);
  return shown;
}
