// Calcul des jours de jeûne surérogatoire (et des jours où il est interdit).
//
// ⚠️ Les dates hégiriennes proviennent du calendrier umm-al-qura (calculé).
// Elles peuvent différer de ±1 jour de la vision locale du croissant.
// À vérifier avec ta mosquée / l'observation locale. Contenu à faire relire.

import { toKey, addDays } from "./date";

const WEEKDAYS_FULL = [
  "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi",
];
export const WEEKDAYS_SHORT = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

/** Jour & mois hégiriens (umm-al-qura). */
function hijri(date: Date): { d: number; m: number; y: number } {
  const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).formatToParts(date);
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { d: get("day"), m: get("month"), y: get("year") };
}

export interface FastInfo {
  /** Si non nul, le jeûne est interdit ce jour (raison). */
  forbidden: string | null;
  /** Ramadan : jeûne obligatoire. */
  obligatory: boolean;
  /** Raisons de jeûne recommandé (déclenchent les rappels). */
  reasons: string[];
  /** Opportunités saisonnières (informatives, sans rappel quotidien). */
  seasonal: string[];
  /** Événement fort pour mise en valeur. */
  special: "arafah" | "ashura" | "tasua" | "white" | null;
}

export function fastInfo(date: Date, weekdays: number[]): FastInfo {
  const { d, m } = hijri(date);
  const wd = date.getDay();

  let forbidden: string | null = null;
  if (m === 10 && d === 1) forbidden = "Aïd al-Fitr";
  else if (m === 12 && d === 10) forbidden = "Aïd al-Adha";
  else if (m === 12 && (d === 11 || d === 12 || d === 13)) forbidden = "Jours de Tashrīq";

  const obligatory = m === 9; // Ramadan

  const reasons: string[] = [];
  const seasonal: string[] = [];
  let special: FastInfo["special"] = null;

  if (!forbidden && !obligatory) {
    // hebdomadaire (configurable)
    if (weekdays.includes(wd)) reasons.push(WEEKDAYS_FULL[wd]);

    // jours blancs (Ayyām al-bīḍ) : 13, 14, 15
    if (d === 13 || d === 14 || d === 15) {
      reasons.push("Jour blanc (Ayyām al-bīḍ)");
      special = "white";
    }

    // événements
    if (m === 1 && d === 9) { reasons.push("Tasū'ā"); special = "tasua"; }
    if (m === 1 && d === 10) { reasons.push("'Āshūrā'"); special = "ashura"; }
    if (m === 12 && d === 9) { reasons.push("Jour de 'Arafa"); special = "arafah"; }

    // saisonnier (informatif)
    if (m === 12 && d >= 1 && d <= 8) seasonal.push("10 premiers jours de Dhū-l-Ḥijja");
    if (m === 10 && d >= 2) seasonal.push("6 jours de Shawwāl");
    if (m === 8) seasonal.push("Mois de Sha'bān");
  }

  return { forbidden, obligatory, reasons, seasonal, special };
}

export interface UpcomingFast {
  key: string;
  date: Date;
  reasons: string[];
  special: FastInfo["special"];
}

/** Prochains jours de jeûne recommandé sur `horizon` jours (aujourd'hui inclus). */
export function upcomingFasts(weekdays: number[], horizon = 45): UpcomingFast[] {
  const out: UpcomingFast[] = [];
  const start = new Date();
  for (let i = 0; i < horizon; i++) {
    const date = addDays(start, i);
    const info = fastInfo(date, weekdays);
    if (info.reasons.length && !info.forbidden) {
      out.push({ key: toKey(date), date, reasons: info.reasons, special: info.special });
    }
  }
  return out;
}

export interface MonthFast {
  day: number;
  date: Date;
  reasons: string[];
  special: FastInfo["special"];
}

/** Tous les jours de jeûne recommandé d'un mois grégorien donné (any année). */
export function fastsInMonth(year: number, month: number, weekdays: number[]): MonthFast[] {
  const out: MonthFast[] = [];
  const days = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= days; d++) {
    const date = new Date(year, month, d);
    const info = fastInfo(date, weekdays);
    if (info.reasons.length && !info.forbidden) {
      out.push({ day: d, date, reasons: info.reasons, special: info.special });
    }
  }
  return out;
}

export const FASTING_DISCLAIMER =
  "Dates basées sur le calendrier umm-al-qura (calculé) — peuvent varier de ±1 jour selon l'observation locale du croissant.";
