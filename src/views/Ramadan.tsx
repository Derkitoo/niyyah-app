import { useStore, type RamadanDay } from "../state/store";
import { IconMoon } from "../components/icons";

const FIELDS: { key: keyof RamadanDay; label: string }[] = [
  { key: "fast", label: "Jeûne" },
  { key: "taraweeh", label: "Taraweeh" },
  { key: "quran", label: "Qur'an" },
  { key: "sadaqa", label: "Sadaqa" },
];

export default function Ramadan() {
  const { state, update } = useStore();
  const { enabled, days } = state.ramadan;

  const count = (f: keyof RamadanDay) =>
    Object.values(days).filter((d) => d[f]).length;

  const toggle = (n: number, f: keyof RamadanDay) =>
    update((d) => {
      const day = (d.ramadan.days[n] ??= {});
      day[f] = !day[f];
    });

  const setEnabled = () =>
    update((d) => {
      d.ramadan.enabled = !d.ramadan.enabled;
    });

  if (!enabled) {
    return (
      <div className="card intro-card" style={{ padding: "34px 22px" }}>
        <div className="tile xl">
          <IconMoon size={34} />
        </div>
        <h3 style={{ fontSize: 18 }}>Mode Ramadan</h3>
        <p className="sub-c">
          Active un tracker de 30 jours : jeûne, tarāwīh, Qur'an et sadaqa,
          avec les 10 dernières nuits mises en valeur.
        </p>
        <button className="btn block" onClick={setEnabled}>
          Activer le mode Ramadan
        </button>
      </div>
    );
  }

  const completed = Object.values(days).reduce(
    (s, d) => s + FIELDS.filter((f) => d[f.key]).length,
    0
  );

  return (
    <>
      <div className="hero-stat">
        <div className="eyebrow">Ramadan Mubārak</div>
        <div className="hs-title">30 jours de lumière</div>
        <div className="hs-sub">{completed} actes accomplis</div>
      </div>

      <div className="stats">
        <div className="stat"><div className="n">{count("fast")}</div><div className="l">jours jeûnés</div></div>
        <div className="stat"><div className="n">{count("taraweeh")}</div><div className="l">taraweeh</div></div>
        <div className="stat"><div className="n">{count("sadaqa")}</div><div className="l">sadaqa</div></div>
      </div>

      <div className="card">
        <h3>30 jours de barakah</h3>
        <div className="rmd-head">
          <span />
          {FIELDS.map((f) => <span key={f.key}>{f.label}</span>)}
        </div>
        {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => {
          const laylat = n >= 21 && n % 2 === 1;
          return (
            <div key={n} className={"rmd-day" + (laylat ? " laylat" : "")}>
              <span className="d">{n}</span>
              {FIELDS.map((f) => {
                const on = days[n]?.[f.key] ?? false;
                return (
                  <div key={f.key} className={"mini" + (on ? " on" : "")} onClick={() => toggle(n, f.key)}>
                    ✓
                  </div>
                );
              })}
            </div>
          );
        })}
        <p className="tiny muted center" style={{ marginTop: 10 }}>
          Nuits impaires des 10 dernières surlignées — recherche Laylat al-Qadr ☾
        </p>
      </div>

      <button className="btn ghost sm block" onClick={setEnabled}>
        Désactiver le mode Ramadan
      </button>
    </>
  );
}
