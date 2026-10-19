/// <reference types="vite/client" />
// atlas-ui/react/static/js/Explore/ui/faqData.ts
//
// The Atlas F.A.Q. in the pilot's language. English is faqEnglish.ts; the other
// languages are static/l10n/faq/faq.<lang>.json, the Apple app's translations of it
// (same sections, same questions in the same order), loaded when the archive opens. The
// Core Continuum's age is "%@" in all of them, filled in here.

import { currentLanguage, num } from "../../i18n/i18n.ts";
import { FAQ_PAPERS, FAQ_SECTIONS, FAQ_STATS, type FaqSection } from "./faqEnglish.ts";

export type { FaqQuestion, FaqSection } from "./faqEnglish.ts";

export interface FaqData {
  sections: FaqSection[];
  papers: typeof FAQ_PAPERS;
  stats: typeof FAQ_STATS;
}

const TRANSLATIONS = import.meta.glob<FaqData>("../../../l10n/faq/*.json", { import: "default" });

// With one decimal, as the browser's region writes it
const yearsSinceCoreContinuum = () => {
  const diffYears = Math.abs(Date.now() - new Date("1986-04-17").getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  return num(diffYears, 1);
};

function withAge(data: FaqData): FaqData {
  const years = yearsSinceCoreContinuum();
  return { ...data, sections: data.sections.map((s) => ({ ...s, questions: s.questions.map((q) => ({ ...q, answer: q.answer.replace("%@", years) })) })) };
}

const ENGLISH: FaqData = { sections: FAQ_SECTIONS, papers: FAQ_PAPERS, stats: FAQ_STATS };

export const FAQ_ENGLISH: FaqData = withAge(ENGLISH);

// A translation is shown only while it follows the English question by question
function follows(data: FaqData, english: FaqData) {
  return (
    data.sections?.length === english.sections.length &&
    data.sections.every((s, i) => s.id === english.sections[i].id && s.questions?.length === english.sections[i].questions.length) &&
    data.papers?.length === english.papers.length &&
    data.stats?.length === english.stats.length
  );
}

// The archive in the pilot's language (English when it has no translation)
export async function loadFaq(): Promise<FaqData> {
  const load = TRANSLATIONS[`../../../l10n/faq/faq.${currentLanguage()}.json`];
  if (!load) return FAQ_ENGLISH;
  try {
    const data = await load();
    return follows(data, ENGLISH) ? withAge(data) : FAQ_ENGLISH;
  } catch {
    return FAQ_ENGLISH;
  }
}
