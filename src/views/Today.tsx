import { useState } from "react";
import { useStore, PRAYERS, type Prayer } from "../state/store";
import { useNav } from "../state/nav";
import { todayKey } from "../lib/date";
import { fastInfo } from "../lib/fasting";
import { IconFast, IconChevron } from "../components/icons";
import PrayerTimes from "../components/PrayerTimes";

const DHIKR_PRESETS = ["SubhanAllah", "Alhamdulillah", "Allahu Akbar", "Astaghfirullah", "La ilaha illa Allah"];

export default function Today() {
  const { state, update } = useStore();
  const go = useNav();
  const k = todayKey();
  const fast = fastInfo(new Date(), state.fasting.weekdays);
  const showFastBanner = fast.reasons.length > 0 && !fast.forbidden;
  const salah = state.salah[k] ?? {};
  const doneCount = PRAYERS.filter((p) => salah[p.key]).length;
  const grat = state.gratitude[k] ?? ["", "", ""];
  const dhikr = state.dhikr[k] ?? 0;
  const [preset, setPreset] = useState(DHIKR_PRESETS[0]);

  const togglePrayer = (p: Prayer) =>
    update((d) => {
      const day = (d.salah[k] ??= {});
      day[p] = !day[p];
    });

  const toggleHabit = (id: string) =>
    update((d) => {
      const day = (d.habits[k] ??= {});
      day[id] = !day[id];
    });

  const setGrat = (i: number, v: string) =>
    update((d) => {
      const arr = (d.gratitude[k] ??= ["", "", ""]);
      arr[i] = v;
    });

  const tapDhikr = () =>
    update((d) => {
      d.dhikr[k] = (d.dhikr[k] ?? 0) + 1;
    });
  const resetDhikr = () =>
    update((d) => {
      d.dhikr[k] = 0;
    });

  return (
    <>
      <PrayerTimes />

      {/* Bannière jeûne recommandé */}
      {showFastBanner && (
        <div
          className="menu-item"
          style={{ background: "var(--green)", border: "none" }}
          onClick={() => go("fasting")}
        >
          <div className="mi-ic" style={{ background: "rgba(255,255,255,.12)", color: "var(--gold-l)" }}>
            <IconFast />
          </div>
          <div>
            <div className="mi-t" style={{ color: "var(--cream)" }}>Jeûne recommandé aujourd'hui</div>
            <div className="mi-s" style={{ color: "var(--gold-l)" }}>{fast.reasons.join(" · ")}</div>
          </div>
          <span className="mi-arrow" style={{ color: "var(--gold-l)" }}><IconChevron /></span>
        </div>
      )}

      {/* Salât du jour */}
      <div className="card">
        <div className="row">
          <h3>Mes 5 prières</h3>
          <span className="stat-lbl">{doneCount}/5</span>
        </div>
        <div className="salah-row">
          {PRAYERS.map((p) => (
            <button
              key={p.key}
              className={"prayer" + (salah[p.key] ? " done" : "")}
              onClick={() => togglePrayer(p.key)}
            >
              <span className="dot">✓</span>
              <span className="lbl">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Habitudes du jour */}
      <div className="card">
        <h3>Habitudes du jour</h3>
        {state.habitDefs.length === 0 && (
          <p className="empty">Ajoute des habitudes dans l'onglet Habitudes.</p>
        )}
        {state.habitDefs.map((h) => {
          const on = state.habits[k]?.[h.id] ?? false;
          return (
            <div
              key={h.id}
              className={"check" + (on ? " done" : "")}
              onClick={() => toggleHabit(h.id)}
            >
              <span className="box">✓</span>
              <span className="txt">{h.name}</span>
            </div>
          );
        })}
      </div>

      {/* Dhikr */}
      <div className="card dhikr">
        <h3>Dhikr</h3>
        <div className="chips">
          {DHIKR_PRESETS.map((p) => (
            <span
              key={p}
              className={"chip" + (p === preset ? " active" : "")}
              onClick={() => setPreset(p)}
            >
              {p}
            </span>
          ))}
        </div>
        <button className="tap" onClick={tapDhikr} aria-label={`Compter ${preset}`}>
          <span className="tap-name">{preset}</span>
          <span className="tap-count">{dhikr}</span>
          <span className="tap-hint">appuie pour compter</span>
        </button>
        <div className="dhikr-actions">
          <button className="btn ghost sm" onClick={resetDhikr}>
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Gratitude */}
      <div className="card">
        <h3>Alhamdulillah pour…</h3>
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ marginBottom: 8 }}>
            <input
              className="field"
              placeholder={`Gratitude ${i + 1}`}
              value={grat[i] ?? ""}
              onChange={(e) => setGrat(i, e.target.value)}
            />
          </div>
        ))}
      </div>

      <p className="quote">
        « Les œuvres les plus aimées d'Allah sont les plus régulières,
        même si elles sont petites. »
      </p>
    </>
  );
}
