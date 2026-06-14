import { useStore } from "../state/store";

export default function Quran() {
  const { state, update } = useStore();
  const juz = state.quran.juz;
  const done = Object.values(juz).filter(Boolean).length;
  const pct = Math.round((done / 30) * 100);

  const toggle = (n: number) =>
    update((d) => {
      d.quran.juz[n] = !d.quran.juz[n];
    });

  const completeKhatm = () =>
    update((d) => {
      d.quran.khatmCount += 1;
      d.quran.juz = {};
    });

  return (
    <>
      <div className="card">
        <div className="row">
          <h3>Khatm en cours</h3>
          <span className="stat-lbl">{done}/30 juz</span>
        </div>
        <div className="progress"><span style={{ width: `${pct}%` }} /></div>
        <div className="row" style={{ marginTop: 14 }}>
          <div>
            <div className="stat-big">{state.quran.khatmCount}</div>
            <div className="stat-lbl">khatm complétés</div>
          </div>
          {done === 30 && (
            <button className="btn gold sm" onClick={completeKhatm}>
              Valider le Khatm ☾
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <h3>Les 30 juz</h3>
        <p className="sub">Coche chaque partie terminée.</p>
        <div className="juz-grid">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
            <div
              key={n}
              className={"juz" + (juz[n] ? " on" : "")}
              onClick={() => toggle(n)}
            >
              {n}
            </div>
          ))}
        </div>
      </div>

      <p className="quote">
        « Lis ! Au nom de ton Seigneur qui a créé. »
      </p>
    </>
  );
}
