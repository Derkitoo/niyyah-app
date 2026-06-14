import { useStore, PRAYERS, type Prayer } from "../state/store";
import { todayKey, shiftKey, frShortDay } from "../lib/date";
import PrayerTimes from "../components/PrayerTimes";

export default function Salah() {
  const { state, update } = useStore();
  const today = todayKey();

  const allDone = (key: string) => PRAYERS.every((p) => state.salah[key]?.[p.key]);
  const dayCount = (key: string) => PRAYERS.filter((p) => state.salah[key]?.[p.key]).length;

  // streak (aujourd'hui peut être incomplet sans casser la série)
  let streak = 0;
  const start = allDone(today) ? 0 : 1;
  for (let n = start; ; n++) {
    if (allDone(shiftKey(today, -n))) streak++;
    else break;
  }

  // 7 derniers jours (du plus ancien au plus récent)
  const days = Array.from({ length: 7 }, (_, i) => shiftKey(today, -(6 - i)));
  const weekDone = days.reduce((s, k) => s + dayCount(k), 0);
  const weekPct = Math.round((weekDone / 35) * 100);

  const toggle = (key: string, p: Prayer) =>
    update((d) => {
      const day = (d.salah[key] ??= {});
      day[p] = !day[p];
    });

  return (
    <>
      <PrayerTimes />

      <div className="stats">
        <div className="stat">
          <div className="n">{streak}</div>
          <div className="l">jours d'affilée</div>
        </div>
        <div className="stat">
          <div className="n">{weekDone}</div>
          <div className="l">prières / 7 j</div>
        </div>
        <div className="stat">
          <div className="n">{weekPct}%</div>
          <div className="l">cette semaine</div>
        </div>
      </div>

      <div className="card">
        <h3>7 derniers jours</h3>
        <p className="sub">Touche une pastille pour cocher la prière.</p>
        <div style={{ display: "grid", gridTemplateColumns: "44px repeat(5, 1fr)", gap: 6, alignItems: "center" }}>
          <span />
          {PRAYERS.map((p) => (
            <span key={p.key} className="tiny muted center">{p.label.slice(0, 3)}</span>
          ))}
          {days.map((key) => (
            <Row key={key} dayKey={key} today={today} toggle={toggle} state={state} />
          ))}
        </div>
      </div>

      <p className="quote">
        « En vérité, la prière demeure, pour les croyants, une prescription
        à des temps déterminés. »
      </p>
    </>
  );
}

function Row({
  dayKey,
  today,
  toggle,
  state,
}: {
  dayKey: string;
  today: string;
  toggle: (k: string, p: Prayer) => void;
  state: ReturnType<typeof useStore>["state"];
}) {
  return (
    <>
      <span className="tiny muted center" style={{ fontWeight: dayKey === today ? 700 : 400, color: dayKey === today ? "var(--green)" : undefined }}>
        {dayKey === today ? "Auj." : frShortDay(dayKey)}
      </span>
      {PRAYERS.map((p) => {
        const on = state.salah[dayKey]?.[p.key] ?? false;
        return (
          <div
            key={p.key}
            className={"mini" + (on ? " on" : "")}
            onClick={() => toggle(dayKey, p.key)}
          >
            ✓
          </div>
        );
      })}
    </>
  );
}
