// atlas-ui/react/static/js/i18n/LanguageSelect.tsx
//
// The language picker: each language by its own name, never translated. Choosing one
// saves it and reloads the page in it.

import React from "react";
import { currentLanguage, LANGUAGES, setLanguage, t } from "./i18n.ts";

export function LanguageSelect({ className = "" }: { className?: string }) {
  return (
    <label className={`flex items-center justify-between gap-3 ${className}`}>
      <span className="flex items-center gap-2 text-sm text-gray-200">
        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="text-cyan-300 shrink-0">
          <circle cx={12} cy={12} r={9.5} />
          <path d="M2.5 12h19M12 2.5c2.6 2.6 3.9 5.8 3.9 9.5s-1.3 6.9-3.9 9.5c-2.6-2.6-3.9-5.8-3.9-9.5s1.3-6.9 3.9-9.5z" />
        </svg>
        {t("Language")}
      </span>
      <select
        value={currentLanguage()}
        onChange={(e) => setLanguage(e.target.value)}
        className="min-w-0 bg-black/40 border border-white/15 rounded-lg px-2 py-1 text-xs text-gray-100 outline-none focus:border-cyan-400/60 cursor-pointer"
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.name}
          </option>
        ))}
      </select>
    </label>
  );
}
