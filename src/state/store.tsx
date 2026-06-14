import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// ---- Types ----
export type Prayer = "fajr" | "dhuhr" | "asr" | "maghrib" | "isha";
export const PRAYERS: { key: Prayer; label: string }[] = [
  { key: "fajr", label: "Fajr" },
  { key: "dhuhr", label: "Dhuhr" },
  { key: "asr", label: "Asr" },
  { key: "maghrib", label: "Maghrib" },
  { key: "isha", label: "Isha" },
];

export type SalahDay = Partial<Record<Prayer, boolean>>;
export interface HabitDef { id: string; name: string; }
export interface Dua { id: string; title: string; text: string; }
export interface RamadanDay { fast?: boolean; taraweeh?: boolean; quran?: boolean; sadaqa?: boolean; }
export interface MuhasabaEntry { gratitude: string; closer: string; improve: string; intention: string; }

export interface PrayerSettings {
  method: number; // identifiant méthode de calcul Aladhan
  city: string;
  country: string;
  useGeo: boolean;
  lat?: number;
  lng?: number;
  cache?: { date: string; label: string; timings: Record<string, string> };
  notify: boolean; // rappels à l'heure de chaque prière
  adhan: boolean; // jouer l'adhan (app ouverte)
  notified?: { date: string; prayers: string[] }; // anti-doublon du jour
}

export interface State {
  settings: { name: string; theme: "light" | "dark"; pushServerUrl: string; pushPrayer: boolean };
  prayer: PrayerSettings;
  salah: Record<string, SalahDay>;
  habitDefs: HabitDef[];
  habits: Record<string, Record<string, boolean>>;
  quran: { khatmCount: number; juz: Record<number, boolean> };
  gratitude: Record<string, string[]>;
  dhikr: Record<string, number>;
  ramadan: { enabled: boolean; days: Record<number, RamadanDay> };
  duas: Dua[];
  muhasaba: Record<string, MuhasabaEntry>;
  namesLearned: Record<number, boolean>;
  fasting: {
    log: Record<string, boolean>;
    remindersEnabled: boolean;
    reminderTime: string; // "HH:MM" — rappel la veille au soir
    weekdays: number[]; // jours hebdo (0=Dim … 6=Sam), défaut [1,4] = lundi/jeudi
    lastNotified?: string; // clé jour du dernier rappel envoyé
  };
}

const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_STATE: State = {
  settings: {
    name: "",
    theme: "light",
    pushServerUrl: import.meta.env.VITE_PUSH_SERVER_URL || "http://localhost:4000",
    pushPrayer: false,
  },
  prayer: { method: 12, city: "Paris", country: "France", useGeo: false, notify: false, adhan: false },
  salah: {},
  habitDefs: [
    { id: uid(), name: "Lecture du Qur'an" },
    { id: uid(), name: "Adhkar matin & soir" },
    { id: uid(), name: "Sunnah du jour" },
    { id: uid(), name: "Sadaqa" },
  ],
  habits: {},
  quran: { khatmCount: 0, juz: {} },
  gratitude: {},
  dhikr: {},
  ramadan: { enabled: false, days: {} },
  duas: [
    {
      id: uid(),
      title: "Pour le bien des deux mondes",
      text: "Rabbana atina fi-d-dunya hasana wa fi-l-akhirati hasana wa qina 'adhab an-nar.",
    },
  ],
  muhasaba: {},
  namesLearned: {},
  fasting: {
    log: {},
    remindersEnabled: false,
    reminderTime: "20:00",
    weekdays: [1, 4],
  },
};

const KEY = "niyyah.v1";

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const saved = JSON.parse(raw);
    // fusion défensive avec les valeurs par défaut (nouveaux champs)
    return { ...structuredClone(DEFAULT_STATE), ...saved };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

interface Ctx {
  state: State;
  update: (fn: (draft: State) => void) => void;
  reset: () => void;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota / mode privé : on ignore */
    }
  }, [state]);

  const update = useCallback(
    (fn: (draft: State) => void) =>
      setState((prev) => {
        const next = structuredClone(prev);
        fn(next);
        return next;
      }),
    []
  );

  const reset = useCallback(() => setState(structuredClone(DEFAULT_STATE)), []);

  return (
    <StoreContext.Provider value={{ state, update, reset }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): Ctx {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export { uid };
