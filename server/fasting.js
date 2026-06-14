// Calcul des jours de jeûne côté serveur (copie de la logique client).
// Node supporte le calendrier islamique umm-al-qura via Intl.

function hijri(date) {
  const parts = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
    month: "numeric",
  }).formatToParts(date);
  const get = (t) => Number(parts.find((p) => p.type === t)?.value);
  return { d: get("day"), m: get("month") };
}

const FULL = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

/** Raisons de jeûne pour une date, ou null (interdit / aucune). */
export function reasonsFor(date, weekdays) {
  const { d, m } = hijri(date);
  const wd = date.getDay();

  // jours où le jeûne est interdit
  if (m === 10 && d === 1) return null; // Aïd al-Fitr
  if (m === 12 && d === 10) return null; // Aïd al-Adha
  if (m === 12 && d >= 11 && d <= 13) return null; // Tashrīq
  if (m === 9) return null; // Ramadan = obligatoire, pas un rappel surérogatoire

  const r = [];
  if (weekdays.includes(wd)) r.push(FULL[wd]);
  if (d >= 13 && d <= 15) r.push("Jour blanc");
  if (m === 1 && d === 9) r.push("Tasū'ā");
  if (m === 1 && d === 10) r.push("'Āshūrā'");
  if (m === 12 && d === 9) r.push("'Arafa");
  return r.length ? r.join(" · ") : null;
}

/** Demain est-il un jour de jeûne recommandé ? renvoie la raison ou null. */
export function isFastTomorrow(weekdays) {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return reasonsFor(t, weekdays);
}
