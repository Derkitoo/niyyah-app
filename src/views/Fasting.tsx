import { useState } from "react";
import { useStore } from "../state/store";
import { useNav } from "../state/nav";
import { todayKey, monthKey, hijriDayMonth } from "../lib/date";
import {
  fastInfo,
  upcomingFasts,
  fastsInMonth,
  WEEKDAYS_SHORT,
  FASTING_DISCLAIMER,
} from "../lib/fasting";
import { requestPermission, permissionState, notificationsSupported } from "../lib/notify";
import { usePrayerTimes } from "../lib/prayer";
import { IconChevron } from "../components/icons";

// ordre d'affichage des chips : Lun … Dim
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const SPECIAL_BADGE: Record<string, string> = {
  arafah: "‘Arafa",
  ashura: "‘Āshūrā’",
  tasua: "Tasū‘ā",
  white: "Jour blanc",
};

export default function Fasting() {
  const { state, update } = useStore();
  const go = useNav();
  const { timings } = usePrayerTimes();
  const f = state.fasting;
  const k = todayKey();
  const today = fastInfo(new Date(), f.weekdays);
  const fastedToday = f.log[k] ?? false;

  const totalVoluntary = Object.values(f.log).filter(Boolean).length;
  const thisMonth = Object.entries(f.log).filter(([key, v]) => v && key.startsWith(monthKey())).length;

  const upcoming = upcomingFasts(f.weekdays, 60);

  // navigation par mois (mois courant = 0, automatique pour n'importe quelle année)
  const [monthOffset, setMonthOffset] = useState(0);
  const base = new Date();
  const shown = new Date(base.getFullYear(), base.getMonth() + monthOffset, 1);
  const monthFasts = fastsInMonth(shown.getFullYear(), shown.getMonth(), f.weekdays);
  const monthLbl = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(shown);
  const fmtRow = (date: Date) =>
    new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" }).format(date);

  const toggleToday = () =>
    update((d) => {
      d.fasting.log[k] = !d.fasting.log[k];
    });

  const toggleWeekday = (wd: number) =>
    update((d) => {
      const set = new Set(d.fasting.weekdays);
      set.has(wd) ? set.delete(wd) : set.add(wd);
      d.fasting.weekdays = [...set];
    });

  const enableReminders = async () => {
    const perm = await requestPermission();
    update((d) => {
      d.fasting.remindersEnabled = perm === "granted";
    });
  };
  const disableReminders = () =>
    update((d) => {
      d.fasting.remindersEnabled = false;
    });

  const perm = permissionState();

  return (
    <>
      <div className="subhead">
        <button className="back" onClick={() => go("plus")} aria-label="Retour">
          <IconChevron size={22} />
        </button>
        <h2>Jeûne</h2>
      </div>

      {/* Aujourd'hui */}
      <div className="card">
        <h3>Aujourd'hui</h3>
        {today.forbidden ? (
          <p className="sub" style={{ color: "var(--danger)", margin: 0 }}>
            Jeûne déconseillé/interdit aujourd'hui — {today.forbidden}.
          </p>
        ) : today.obligatory ? (
          <p className="sub" style={{ margin: 0 }}>Ramadan — jeûne obligatoire. Qu'Allah l'accepte. ☾</p>
        ) : today.reasons.length ? (
          <>
            <p className="sub" style={{ marginTop: 0 }}>
              Jeûne recommandé : <strong style={{ color: "var(--green)" }}>{today.reasons.join(" · ")}</strong>
            </p>
            <div className={"check" + (fastedToday ? " done" : "")} onClick={toggleToday} style={{ borderBottom: "none" }}>
              <span className="box">✓</span>
              <span className="txt">J'ai jeûné aujourd'hui</span>
            </div>
          </>
        ) : (
          <>
            <p className="sub" style={{ marginTop: 0 }}>Pas de jeûne surérogatoire prévu aujourd'hui.</p>
            <div className={"check" + (fastedToday ? " done" : "")} onClick={toggleToday} style={{ borderBottom: "none" }}>
              <span className="box">✓</span>
              <span className="txt">J'ai jeûné aujourd'hui (volontaire)</span>
            </div>
          </>
        )}
      </div>

      {/* Suhoor / Iftar */}
      {timings && (
        <div className="card">
          <h3>Suhoor &amp; Iftar</h3>
          <div className="stats">
            <div className="stat">
              <div className="n">{timings.Imsak || timings.Fajr}</div>
              <div className="l">fin du suhoor (Imsāk)</div>
            </div>
            <div className="stat">
              <div className="n">{timings.Maghrib}</div>
              <div className="l">iftar (Maghrib)</div>
            </div>
            <div className="stat">
              <div className="n">{timings.Fajr}</div>
              <div className="l">Fajr</div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats">
        <div className="stat"><div className="n">{totalVoluntary}</div><div className="l">jeûnes au total</div></div>
        <div className="stat"><div className="n">{thisMonth}</div><div className="l">ce mois-ci</div></div>
        <div className="stat"><div className="n">{upcoming.length ? upcoming.length : 0}</div><div className="l">à venir (60 j)</div></div>
      </div>

      {/* Rappels */}
      <div className="card">
        <h3>Rappels</h3>
        {!notificationsSupported() ? (
          <p className="sub" style={{ margin: 0 }}>Les notifications ne sont pas disponibles sur cet appareil/navigateur.</p>
        ) : f.remindersEnabled ? (
          <>
            <p className="sub" style={{ marginTop: 0 }}>Activés — rappel la veille au soir des jours de jeûne.</p>
            <label className="lab" style={{ marginTop: 0 }}>Heure du rappel</label>
            <input
              className="field"
              type="time"
              value={f.reminderTime}
              onChange={(e) => update((d) => { d.fasting.reminderTime = e.target.value; })}
            />
            <label className="lab">Jours hebdomadaires</label>
            <div className="chips" style={{ justifyContent: "flex-start" }}>
              {WEEKDAY_ORDER.map((wd) => (
                <span
                  key={wd}
                  className={"chip" + (f.weekdays.includes(wd) ? " active" : "")}
                  onClick={() => toggleWeekday(wd)}
                >
                  {WEEKDAYS_SHORT[wd]}
                </span>
              ))}
            </div>
            <p className="tiny muted" style={{ marginTop: 8 }}>
              Sunnah : lundi &amp; jeudi. Jeûner le vendredi seul est déconseillé.
            </p>
            <div className="spacer" />
            <p className="tiny muted">
              Les rappels s'affichent quand l'app est ouverte. Pour des rappels même app fermée,
              installe l'app — le support varie selon l'appareil.
            </p>
            <button className="btn ghost sm block" onClick={disableReminders}>Désactiver les rappels</button>
          </>
        ) : (
          <>
            <p className="sub" style={{ marginTop: 0 }}>
              Reçois un rappel la veille des jours de jeûne recommandé (lundi, jeudi, jours blancs, ‘Arafa, ‘Āshūrā’…).
            </p>
            <button className="btn block" onClick={enableReminders}>Activer les rappels</button>
            {perm === "denied" && (
              <p className="tiny" style={{ color: "var(--danger)", marginBottom: 0 }}>
                Notifications bloquées dans le navigateur — autorise-les dans les réglages du site.
              </p>
            )}
          </>
        )}
      </div>

      {/* Parcourir par mois (n'importe quel mois / année, calcul automatique) */}
      <div className="card">
        <div className="row" style={{ marginBottom: 6 }}>
          <button
            className="icon-btn"
            style={{ fontSize: 22, opacity: monthOffset <= 0 ? 0.3 : 1 }}
            onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
            disabled={monthOffset <= 0}
            aria-label="Mois précédent"
          >‹</button>
          <h3 style={{ margin: 0, textTransform: "capitalize" }}>{monthLbl}</h3>
          <button
            className="icon-btn"
            style={{ fontSize: 22 }}
            onClick={() => setMonthOffset((o) => o + 1)}
            aria-label="Mois suivant"
          >›</button>
        </div>
        {monthFasts.length === 0 && <p className="empty">Aucun jour de jeûne ce mois.</p>}
        {monthFasts.map((mf) => (
          <div key={mf.day} className="row" style={{ padding: "9px 2px", borderBottom: "1px solid var(--line)" }}>
            <div>
              <div style={{ fontSize: 14, color: "var(--ink)", textTransform: "capitalize" }}>{fmtRow(mf.date)}</div>
              <div className="tiny muted">{mf.reasons.join(" · ")}</div>
              <div className="tiny" style={{ color: "var(--gold)", textTransform: "capitalize" }}>{hijriDayMonth(mf.date)}</div>
            </div>
            {mf.special && mf.special !== "white" && (
              <span className="chip active" style={{ cursor: "default" }}>{SPECIAL_BADGE[mf.special]}</span>
            )}
          </div>
        ))}
      </div>

      <p className="tiny muted center" style={{ marginBottom: 8 }}>{FASTING_DISCLAIMER}</p>
      <p className="quote">
        « Quiconque jeûne un jour dans le sentier d'Allah, Allah éloigne son
        visage du Feu de soixante-dix automnes. »
      </p>
    </>
  );
}
