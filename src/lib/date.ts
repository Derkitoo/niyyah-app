// Utilitaires de date — clés de stockage + affichage FR & hégirien (via Intl).

const pad = (n: number) => String(n).padStart(2, "0");

/** Clé jour : "AAAA-MM-JJ" en heure locale. */
export const toKey = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Clé mois : "AAAA-MM". */
export const monthKey = (d: Date = new Date()): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

export const todayKey = (): string => toKey(new Date());

export const addDays = (d: Date, n: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

/** Décale une clé jour de n jours. */
export const shiftKey = (key: string, n: number): string => {
  const [y, m, day] = key.split("-").map(Number);
  return toKey(addDays(new Date(y, m - 1, day), n));
};

export const frLong = (d: Date = new Date()): string =>
  new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);

export const frShortDay = (key: string): string => {
  const [y, m, day] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(
    new Date(y, m - 1, day)
  );
};

/** Date hégirienne (calendrier umm al-qura) en français. */
export const hijriLong = (d: Date = new Date()): string => {
  try {
    return new Intl.DateTimeFormat("fr-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
};

/** Date hégirienne courte : "13 safar". */
export const hijriDayMonth = (d: Date): string => {
  try {
    return new Intl.DateTimeFormat("fr-u-ca-islamic-umalqura", {
      day: "numeric",
      month: "long",
    }).format(d);
  } catch {
    return "";
  }
};

export const monthLabel = (key: string): string => {
  const [y, m] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(
    new Date(y, m - 1, 1)
  );
};

/** Salutation selon l'heure. */
export const greeting = (): string => {
  const h = new Date().getHours();
  if (h < 5) return "Layl mubarak";
  if (h < 12) return "Sabah al-khayr";
  if (h < 18) return "As-salamu alaykum";
  return "Masa al-khayr";
};
