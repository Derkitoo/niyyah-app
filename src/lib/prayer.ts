// Horaires de prière via l'API Aladhan (https://aladhan.com/prayer-times-api).
// Mise en cache du jour dans le store → fonctionne hors-ligne après le 1er chargement.

import { useCallback, useEffect, useState } from "react";
import { useStore, type PrayerSettings } from "../state/store";
import { toKey } from "./date";

export const METHODS: { id: number; label: string }[] = [
  { id: 12, label: "UOIF (France)" },
  { id: 3, label: "Ligue islamique mondiale" },
  { id: 2, label: "ISNA (Amérique du Nord)" },
  { id: 5, label: "Autorité égyptienne" },
  { id: 4, label: "Umm al-Qura (Arabie)" },
  { id: 1, label: "Univ. des sciences, Karachi" },
];

export const PRAYER_KEYS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
export const PRAYER_LABEL: Record<string, string> = {
  Fajr: "Fajr",
  Sunrise: "Shourouk",
  Dhuhr: "Dhuhr",
  Asr: "Asr",
  Maghrib: "Maghrib",
  Isha: "Isha",
  Imsak: "Imsak",
};

const ddmmyyyy = (d: Date) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}-${p(d.getMonth() + 1)}-${d.getFullYear()}`;
};
const clean = (t?: string) => (t ?? "").slice(0, 5);

export async function fetchTimings(p: PrayerSettings, date = new Date()) {
  const dstr = ddmmyyyy(date);
  let url: string;
  let label: string;
  if (p.useGeo && p.lat != null && p.lng != null) {
    url = `https://api.aladhan.com/v1/timings/${dstr}?latitude=${p.lat}&longitude=${p.lng}&method=${p.method}`;
    label = "Ma position";
  } else {
    const city = encodeURIComponent(p.city || "Paris");
    const country = encodeURIComponent(p.country || "France");
    url = `https://api.aladhan.com/v1/timingsByCity/${dstr}?city=${city}&country=${country}&method=${p.method}`;
    label = `${p.city || "Paris"}, ${p.country || "France"}`;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const json = await res.json();
  const t = json?.data?.timings;
  if (!t) throw new Error("Réponse invalide");
  const timings: Record<string, string> = {};
  ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha", "Imsak"].forEach((k) => {
    timings[k] = clean(t[k]);
  });
  return { date: toKey(date), label, timings };
}

export interface PrayerEvent { ts: number; name: string; }

/** Construit les horaires des `days` prochains jours en timestamps absolus
 *  (epoch ms) — calculés en heure locale, donc sans ambiguïté de fuseau. */
export async function buildPrayerEvents(p: PrayerSettings, days = 7): Promise<PrayerEvent[]> {
  const order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  const now = Date.now();
  const events: PrayerEvent[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    let data;
    try {
      data = await fetchTimings(p, date);
    } catch {
      continue;
    }
    for (const k of order) {
      const t = data.timings[k];
      if (!t) continue;
      const [hh, mm] = t.split(":").map(Number);
      const ts = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh, mm, 0, 0).getTime();
      if (ts > now) events.push({ ts, name: PRAYER_LABEL[k] || k });
    }
  }
  return events;
}

export interface NextPrayer { name: string; time: string; inMin: number; }

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

export function nextPrayer(timings: Record<string, string>): NextPrayer | null {
  const order = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
  if (!order.every((k) => timings[k])) return null;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const k of order) {
    const m = toMin(timings[k]);
    if (m > nowMin) return { name: k, time: timings[k], inMin: m - nowMin };
  }
  // après Isha → prochaine = Fajr du lendemain
  return { name: "Fajr", time: timings["Fajr"], inMin: 24 * 60 - nowMin + toMin(timings["Fajr"]) };
}

export const fmtIn = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? `dans ${h} h ${String(m).padStart(2, "0")}` : `dans ${m} min`;
};

/** Hook : horaires du jour (cache si même jour, sinon fetch). */
export function usePrayerTimes() {
  const { state, update } = useStore();
  const p = state.prayer;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayK = toKey(new Date());
  const cache = p.cache && p.cache.date === todayK ? p.cache : null;
  const configured = p.useGeo ? p.lat != null : !!p.city;

  const refresh = useCallback(async () => {
    if (!configured) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTimings(p);
      update((d) => {
        d.prayer.cache = data;
      });
    } catch {
      setError("Horaires indisponibles (hors-ligne ou ville introuvable).");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured, p.method, p.city, p.country, p.useGeo, p.lat, p.lng, update]);

  useEffect(() => {
    if (configured && !cache) refresh();
  }, [configured, cache, refresh]);

  return {
    timings: cache?.timings ?? null,
    label: cache?.label ?? "",
    loading,
    error,
    configured,
    refresh,
  };
}
