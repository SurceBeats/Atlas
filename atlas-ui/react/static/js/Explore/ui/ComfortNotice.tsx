// atlas-ui/react/static/js/Explore/ui/ComfortNotice.tsx
//
// The photosensitivity warning, asked once (see core/comfort). It waits for an answer:
// nobody should be carried into a flash without having read it.

import React, { useState } from "react";
import { comfortChosen, setReducedFlashing } from "../core/comfort.ts";
import { t } from "../../i18n/i18n.ts";

export function useComfortAsked() {
  const [asked, setAsked] = useState(() => comfortChosen());
  return [asked, () => setAsked(true)] as const;
}

export function ComfortNotice({ onChosen }: { onChosen: (reduced: boolean) => void }) {
  const choose = (reduced: boolean) => {
    setReducedFlashing(reduced);
    onChosen(reduced);
  };
  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-4 animate-[fadeIn_0.6s_ease-out]">
      <div role="alertdialog" aria-labelledby="comfort-title" aria-describedby="comfort-text" className="w-full max-w-md rounded-xl border border-amber-200/25 bg-slate-950/85 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.6)] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="text-amber-200 shrink-0">
            <path d="M12 3l9.5 16.5h-19z" />
            <path d="M12 10v4.5M12 17.2v.3" />
          </svg>
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em] text-amber-200/80">{t("BEFORE YOU DIVE")}</div>
            <div id="comfort-title" className="text-lg text-white font-light">{t("Photosensitivity warning")}</div>
          </div>
        </div>
        <p id="comfort-text" className="mt-3 text-sm text-gray-300 leading-relaxed">
          {t("The Atlas contains flashes of light and fast-moving patterns: jumps through hyperspace, wormholes, the birth of a universe. If you are sensitive to them, reduce flashing.")}
        </p>
        <p className="mt-2 text-xs text-gray-500">{t("You can change this at any time in Graphics & view.")}</p>
        <div className="mt-5 flex flex-col-reverse sm:flex-row gap-2">
          <button onClick={() => choose(true)} className="flex-1 px-4 py-2.5 rounded-lg text-sm border border-amber-200/40 bg-amber-200/10 text-amber-100 hover:bg-amber-200/20 transition-colors">
            {t("Reduce flashing")}
          </button>
          <button autoFocus onClick={() => choose(false)} className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.45)] transition-colors">
            {t("Continue")}
          </button>
        </div>
      </div>
    </div>
  );
}
