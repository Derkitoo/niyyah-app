import { useEffect, useRef, useState, type ReactNode } from "react";
import { NavContext, type View } from "./state/nav";
import { useStore } from "./state/store";
import { frLong, hijriLong, greeting, toKey, addDays } from "./lib/date";
import { fastInfo } from "./lib/fasting";
import { PRAYER_LABEL, buildPrayerEvents } from "./lib/prayer";
import { showLocalNotification } from "./lib/notify";
import { getPushStatus, sendPrayerSchedule } from "./lib/push";
import { playAdhan } from "./lib/adhan";
import { isNative, scheduleNativePrayers } from "./lib/native";
import { Ornament, IconHome, IconPray, IconBook, IconCheck, IconGrid } from "./components/icons";

import Today from "./views/Today";
import Salah from "./views/Salah";
import Quran from "./views/Quran";
import Habits from "./views/Habits";
import Plus from "./views/Plus";
import Ramadan from "./views/Ramadan";
import Fasting from "./views/Fasting";
import Dua from "./views/Dua";
import Muhasaba from "./views/Muhasaba";
import Names from "./views/Names";
import Settings from "./views/Settings";

const ALL_VIEWS: View[] = [
  "today", "salah", "quran", "habits", "plus",
  "ramadan", "fasting", "dua", "muhasaba", "names", "settings",
];

function initialView(): View {
  const h = (typeof location !== "undefined" ? location.hash.slice(1) : "") as View;
  return ALL_VIEWS.includes(h) ? h : "today";
}

const TITLES: Partial<Record<View, string>> = {
  salah: "Mes prières",
  quran: "Qur'an",
  habits: "Mes habitudes",
  plus: "Plus",
};

const PLUS_GROUP: View[] = ["plus", "ramadan", "fasting", "dua", "muhasaba", "names", "settings"];

export default function App() {
  const [view, setView] = useState<View>(initialView);
  const { state, update } = useStore();

  // Planificateur de rappels de jeûne (best-effort, app au premier plan).
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    const tick = () => {
      if (!("Notification" in window) || Notification.permission !== "granted") return;
      const now = new Date();
      const tkey = toKey(now);
      const nowMin = now.getHours() * 60 + now.getMinutes();

      // 1) Rappel de jeûne (la veille au soir)
      const f = stateRef.current.fasting;
      if (f.remindersEnabled) {
        const [hh, mm] = f.reminderTime.split(":").map(Number);
        const past = now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm);
        if (past && f.lastNotified !== tkey) {
          const info = fastInfo(addDays(now, 1), f.weekdays);
          if (info.reasons.length && !info.forbidden) {
            showLocalNotification(
              "Niyyah — jeûne demain",
              `Demain : ${info.reasons.join(" · ")}. Pense au suhoor 🌙`
            );
            update((d) => { d.fasting.lastNotified = tkey; });
          }
        }
      }

      // 2) Rappels à l'heure de chaque prière (notif + adhan, app ouverte)
      const p = stateRef.current.prayer;
      if ((p.notify || p.adhan) && p.cache && p.cache.date === tkey) {
        const fired = p.notified && p.notified.date === tkey ? p.notified.prayers : [];
        for (const k of ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"]) {
          const t = p.cache.timings[k];
          if (!t) continue;
          const [ph, pm] = t.split(":").map(Number);
          const diff = nowMin - (ph * 60 + pm);
          if (diff >= 0 && diff < 30 && !fired.includes(k)) {
            if (p.notify) showLocalNotification("Niyyah — " + (PRAYER_LABEL[k] || k), `C'est l'heure de ${PRAYER_LABEL[k] || k} (${t}) 🕌`);
            if (p.adhan) playAdhan();
            update((d) => {
              const np = d.prayer;
              if (!np.notified || np.notified.date !== tkey) np.notified = { date: tkey, prayers: [] };
              np.notified.prayers.push(k);
            });
          }
        }
      }
    };
    tick();
    const id = window.setInterval(tick, 60000);
    return () => window.clearInterval(id);
  }, [update]);

  // Thème clair / sombre
  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme;
  }, [state.settings.theme]);

  // Personnalisation d'apparence (accent, style de cartes, navigation, arrondi)
  useEffect(() => {
    const r = document.documentElement;
    r.dataset.accent = state.settings.accent ?? "indigo";
    r.dataset.cardstyle = state.settings.cardStyle ?? "doux";
    r.dataset.nav = state.settings.navStyle ?? "flottante";
    r.style.setProperty("--radius", (state.settings.radius ?? 22) + "px");
  }, [state.settings.accent, state.settings.cardStyle, state.settings.navStyle, state.settings.radius]);

  // App NATIVE (Capacitor) : programme les prières en notifications locales (adhan)
  useEffect(() => {
    if (!isNative()) return;
    (async () => {
      try {
        await scheduleNativePrayers(stateRef.current.prayer, stateRef.current.prayer.adhan);
      } catch {
        /* ignore */
      }
    })();
  }, [state.prayer.cache?.date, state.prayer.adhan, state.prayer.notify]);

  // Resynchronise le planning de prière côté serveur (à l'ouverture + chaque jour)
  useEffect(() => {
    if (!state.settings.pushPrayer) return;
    let cancelled = false;
    (async () => {
      try {
        if (!(await getPushStatus())) return;
        const events = await buildPrayerEvents(stateRef.current.prayer, 7);
        if (!cancelled) await sendPrayerSchedule(stateRef.current.settings.pushServerUrl, events);
      } catch {
        /* hors-ligne / serveur indispo : on retentera à la prochaine ouverture */
      }
    })();
    return () => { cancelled = true; };
  }, [state.settings.pushPrayer, state.prayer.cache?.date]);

  const renderView = () => {
    switch (view) {
      case "today": return <Today />;
      case "salah": return <Salah />;
      case "quran": return <Quran />;
      case "habits": return <Habits />;
      case "plus": return <Plus />;
      case "ramadan": return <Ramadan />;
      case "fasting": return <Fasting />;
      case "dua": return <Dua />;
      case "muhasaba": return <Muhasaba />;
      case "names": return <Names />;
      case "settings": return <Settings />;
    }
  };

  const title = TITLES[view];

  const tabs: { v: View; label: string; icon: ReactNode; group?: View[] }[] = [
    { v: "today", label: "Aujourd'hui", icon: <IconHome /> },
    { v: "salah", label: "Salât", icon: <IconPray /> },
    { v: "quran", label: "Qur'an", icon: <IconBook /> },
    { v: "habits", label: "Habitudes", icon: <IconCheck /> },
    { v: "plus", label: "Plus", icon: <IconGrid />, group: PLUS_GROUP },
  ];

  return (
    <NavContext.Provider value={setView}>
      <div className="app">
        <header className="header">
          <div className="ornament"><Ornament size={150} /></div>
          <div className="greet">
            {greeting()}{state.settings.name ? `, ${state.settings.name}` : ""}
          </div>
          <h1>Niyyah</h1>
          <div className="dates">
            {frLong()}
            <br />
            <span className="hijri">{hijriLong()}</span>
          </div>
        </header>

        <main className="content">
          {title && <div className="view-title">{title}</div>}
          {renderView()}
        </main>

        <nav className="nav">
          {tabs.map((t) => {
            const active = t.group ? t.group.includes(view) : view === t.v;
            return (
              <button
                key={t.v}
                className={active ? "active" : ""}
                onClick={() => setView(t.v)}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </NavContext.Provider>
  );
}
