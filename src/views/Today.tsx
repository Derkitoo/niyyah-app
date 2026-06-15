import { useState } from "react";
import { useStore, PRAYERS, DHIKR_PRESETS, type Prayer } from "../state/store";
import { useNav } from "../state/nav";
import { todayKey } from "../lib/date";
import { fastInfo } from "../lib/fasting";
import { IconFast, IconChevron } from "../components/icons";
import PrayerTimes from "../components/PrayerTimes";
import { usePrayerTimes, nextPrayer, fmtIn } from "../lib/prayer";

// Nom arabe par clé d'horaire de l'API Aladhan
const AR_BY_API: Record<string, string> = {
  Fajr: "الفجر",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};
const FR_BY_API: Record<string, string> = {
  Fajr: "Fajr",
  Dhuhr: "Dhuhr",
  Asr: "Asr",
  Maghrib: "Maghrib",
  Isha: "Isha",
};

/** Bloc « héros » : prochaine prière mise en valeur sur un fond dégradé. */
function NextPrayerHero({ arabic }: { arabic: boolean }) {
  const { timings, configured } = usePrayerTimes();
  const next = timings ? nextPrayer(timings) : null;

  if (!configured || !next) {
    return (
      <div className="hero">
        <div className="eyebrow hero-eyebrow">Prochaine prière</div>
        <div className="hero-name">Configure ta ville</div>
        <div className="hero-in">Plus → Réglages → Horaires</div>
      </div>
    );
  }

  return (
    <div className="hero">
      <div className="eyebrow hero-eyebrow">Prochaine prière</div>
      <div className="hero-name">
        {FR_BY_API[next.name] ?? next.name}
        {arabic && AR_BY_API[next.name] && (
          <span className="arabic hero-ar"> {AR_BY_API[next.name]}</span>
        )}
      </div>
      <div className="hero-time">{next.time}</div>
      <div className="hero-in">{fmtIn(next.inMin)}</div>
    </div>
  );
}

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
  const [presetIdx, setPresetIdx] = useState(0);
  const preset = DHIKR_PRESETS[presetIdx];

  const arabic = state.settings.arabic ?? true;
  const hero = (state.settings.layoutHome ?? "heros") === "heros";
  const salahStyle = state.settings.salahStyle ?? "pastilles";

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
      const cur = d.dhikr[k] ?? 0;
      if (cur < preset.target) d.dhikr[k] = cur + 1;
    });
  const resetDhikr = () =>
    update((d) => {
      d.dhikr[k] = 0;
    });

  const ringPct = (doneCount / 5) * 100;

  return (
    <>
      {hero && <NextPrayerHero arabic={arabic} />}

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

        {salahStyle === "pastilles" && (
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
        )}

        {salahStyle === "liste" && (
          <div className="salah-list">
            {PRAYERS.map((p) => (
              <button
                key={p.key}
                className={"salah-li" + (salah[p.key] ? " done" : "")}
                onClick={() => togglePrayer(p.key)}
              >
                <span className="salah-li-name">
                  {p.label}
                  {arabic && <span className="arabic salah-li-ar"> {p.ar}</span>}
                </span>
                <span className="salah-li-box">✓</span>
              </button>
            ))}
          </div>
        )}

        {salahStyle === "anneau" && (
          <div className="salah-ring-wrap">
            <div className="salah-ring">
              <svg viewBox="0 0 120 120" width="118" height="118">
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--cream-2)" strokeWidth="11" />
                <circle
                  cx="60" cy="60" r="52" fill="none" stroke="var(--primary)" strokeWidth="11"
                  strokeLinecap="round" strokeDasharray={2 * Math.PI * 52}
                  strokeDashoffset={2 * Math.PI * 52 * (1 - ringPct / 100)}
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dashoffset .5s cubic-bezier(.2,.7,.3,1)" }}
                />
              </svg>
              <div className="salah-ring-num">
                <span className="salah-ring-big">{doneCount}</span>
                <span className="salah-ring-small">/5</span>
              </div>
            </div>
            <div className="salah-ring-dots">
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
        )}
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
          {DHIKR_PRESETS.map((p, i) => (
            <span
              key={p.fr}
              className={"chip" + (i === presetIdx ? " active" : "")}
              onClick={() => setPresetIdx(i)}
            >
              {p.fr}
            </span>
          ))}
        </div>
        <button className={"tap" + (dhikr >= preset.target ? " complete" : "")} onClick={tapDhikr} aria-label={`Compter ${preset.fr}`}>
          {arabic ? (
            <span className="arabic tap-ar">{preset.ar}</span>
          ) : (
            <span className="tap-name">{preset.fr}</span>
          )}
          <span className="tap-count">{dhikr}</span>
          {dhikr >= preset.target ? (
            <span className="tap-hint done-hint">✓ {preset.target} accomplis</span>
          ) : (
            <span className="tap-hint">/ {preset.target} · appuie</span>
          )}
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
