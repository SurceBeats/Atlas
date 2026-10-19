/// <reference types="vite/client" />
// atlas-ui/react/static/js/i18n/i18n.ts
//
// The Atlas in the pilot's language. The English text is the key and the fallback, as in
// the Apple app, whose translations these are (static/l10n/app/<lang>.json, copied as
// they are from its l10n/ folder). What only the web shows lives next to them, in
// static/l10n/web/<lang>.json, with the same shape (web/en.json holds only the English
// plural forms of the web's own texts with a count, as the app's en.json does for its).
//
//   t("Leave orbit")                 a fixed text
//   t("Back to %@", name)            %@ a text, %lld a number, %1$@ by position
//   t("%lld planets", n)             a count: its plural form (Intl.PluralRules) and
//                                    the number as the region writes it
//   L(planet.planet_type)            a text from data (l10n/data-keys.json in the app):
//                                    its translation, or itself
//
// Names (of planets, galaxies, owners' places), units and keys are never translated.
// Numbers and dates follow the browser's region (5,3 m/s² in Spain), whatever the
// language. Changing the language reloads the page.

// English needs no table, only the plural forms of its texts with a count
import appEnglish from "../../l10n/app/en.json";
import webEnglish from "../../l10n/web/en.json";

type Entry = string | Partial<Record<Intl.LDMLPluralRule, string>>;
type Table = Record<string, Entry>;

export const LANGUAGES: Array<{ code: string; name: string }> = [
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "it", name: "Italiano" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" },
  { code: "pt", name: "Português" },
  { code: "ru", name: "Русский" },
  { code: "uk", name: "Українська" },
  { code: "zh-Hans", name: "简体中文" },
];

const STORAGE_KEY = "atlas-language";

const appTables = import.meta.glob<Table>(["../../l10n/app/*.json", "!../../l10n/app/en.json"], { import: "default" });
const webTables = import.meta.glob<Table>(["../../l10n/web/*.json", "!../../l10n/web/en.json"], { import: "default" });
const englishPlurals: Table = { ...(appEnglish as Table), ...(webEnglish as Table) };

let language = "en";
let table: Table = {};
let rules = new Intl.PluralRules("en");
const englishRules = rules;

// A browser language tag, as one of ours (or null). Chinese only in its simplified script
function match(tag: string): string | null {
  const lower = tag.toLowerCase();
  if (lower.startsWith("zh")) return /^zh(-hans|-cn|-sg|-my)?(-|$)/.test(lower) && !/-(hant|tw|hk|mo)(-|$)/.test(lower) ? "zh-Hans" : null;
  const primary = lower.split("-")[0];
  return LANGUAGES.some((l) => l.code === primary) ? primary : null;
}

function storedLanguage(): string | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored && LANGUAGES.some((l) => l.code === stored) ? stored : null;
  } catch {
    return null;
  }
}

// The pilot's choice, or the first of the browser's languages we speak, or English
export function preferredLanguage(): string {
  const stored = storedLanguage();
  if (stored) return stored;
  for (const tag of navigator.languages?.length ? navigator.languages : [navigator.language]) {
    const found = tag && match(tag);
    if (found) return found;
  }
  return "en";
}

export function currentLanguage(): string {
  return language;
}

// Before the first render: the tables of the language in use
export async function loadLanguage(): Promise<void> {
  const code = preferredLanguage();
  document.documentElement.lang = code;
  if (code === "en") return;
  try {
    const [app, web] = await Promise.all([appTables[`../../l10n/app/${code}.json`]?.() ?? {}, webTables[`../../l10n/web/${code}.json`]?.() ?? {}]);
    table = { ...app, ...web };
    language = code;
    rules = new Intl.PluralRules(code);
  } catch {
    // Unreachable: the page stays in English
    document.documentElement.lang = "en";
  }
}

// Saved for the next visits, and the page comes back in it
export function setLanguage(code: string) {
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    /* storage unavailable: only this once */
  }
  window.location.reload();
}

// ---- numbers and dates, as the browser's region writes them -------------------------

const numberFormats = new Map<string, Intl.NumberFormat>();
function numberFormat(min: number, max: number): Intl.NumberFormat {
  const key = `${min}:${max}`;
  let format = numberFormats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(undefined, { minimumFractionDigits: min, maximumFractionDigits: max });
    numberFormats.set(key, format);
  }
  return format;
}

/** A number with exactly that many decimals (5.3 here, 5,3 there) */
export function num(value: number, decimals: number): string {
  return numberFormat(decimals, decimals).format(value);
}

/** A number with up to that many decimals, and its thousands grouped */
export function amount(value: number, maxDecimals = 0): string {
  return numberFormat(0, maxDecimals).format(value);
}

/** A date, numeric (16/10/2026 here, 10/16/2026 there) */
export function date(value: Date | number): string {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "numeric", day: "numeric" });
}

// ---- texts --------------------------------------------------------------------------

const SPECIFIER = /%(?:(\d+)\$)?(lld|ld|d|@|%)/g;

function format(text: string, args: Array<string | number>): string {
  let next = 0;
  return text.replace(SPECIFIER, (whole, position: string | undefined, kind: string) => {
    if (kind === "%") return "%";
    const value = args[position ? parseInt(position, 10) - 1 : next++];
    if (value === undefined) return whole;
    return typeof value === "number" ? (kind === "@" ? String(value) : amount(value)) : value;
  });
}

/** A fixed text in the pilot's language, its %@ / %lld filled with `args` */
export function t(key: string, ...args: Array<string | number>): string {
  let entry: Entry | undefined = table[key];
  let plural = rules;
  if (entry === undefined) {
    entry = englishPlurals[key] ?? key;
    plural = englishRules;
  }
  if (typeof entry !== "string") {
    const count = args.find((a): a is number => typeof a === "number") ?? 0;
    entry = entry[plural.select(count)] ?? entry.other ?? key;
  }
  return args.length > 0 || entry.includes("%") ? format(entry, args) : entry;
}

/** A text that comes from data (a planet's type, an element…): its translation, or itself */
export function L(english: string): string {
  const entry = table[english];
  return typeof entry === "string" ? entry : english;
}
