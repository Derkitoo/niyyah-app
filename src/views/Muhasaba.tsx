import { useStore, type MuhasabaEntry } from "../state/store";
import { useNav } from "../state/nav";
import { monthKey, monthLabel } from "../lib/date";
import { IconChevron, IconMirror } from "../components/icons";

const FIELDS: { key: keyof MuhasabaEntry; label: string; placeholder: string }[] = [
  { key: "gratitude", label: "Ma plus grande gratitude", placeholder: "Ce mois-ci, je remercie Allah pour…" },
  { key: "closer", label: "Ce qui m'a rapproché d'Allah", placeholder: "Une adoration, un effort, un changement…" },
  { key: "improve", label: "Ce que je veux corriger", placeholder: "Avec Son aide…" },
  { key: "intention", label: "Mon intention pour le mois prochain", placeholder: "In shā'a Allah…" },
];

const EMPTY: MuhasabaEntry = { gratitude: "", closer: "", improve: "", intention: "" };

export default function Muhasaba() {
  const { state, update } = useStore();
  const go = useNav();
  const mk = monthKey();
  const entry = state.muhasaba[mk] ?? EMPTY;

  const set = (key: keyof MuhasabaEntry, v: string) =>
    update((d) => {
      const e = (d.muhasaba[mk] ??= { ...EMPTY });
      e[key] = v;
    });

  return (
    <>
      <div className="subhead">
        <button className="back" onClick={() => go("plus")} aria-label="Retour">
          <IconChevron size={22} />
        </button>
        <h2>Muhasaba</h2>
      </div>

      <div className="card intro-card" style={{ background: "var(--surface-2)" }}>
        <div className="tile lg"><IconMirror size={26} /></div>
        <h3 style={{ fontSize: 17 }}>Bilan · {monthLabel(mk)}</h3>
        <p className="sub-c">Un moment d'introspection sincère, entre toi et ton Seigneur.</p>
        <p className="quote" style={{ margin: 0, padding: 0 }}>
          « Faites vos comptes avant qu'on ne vous les fasse. » — ʻUmar ibn al-Khaṭṭāb
        </p>
      </div>

      {FIELDS.map((f) => (
        <div className="card" key={f.key}>
          <label className="lab" style={{ margin: "0 0 8px" }}>{f.label}</label>
          <textarea
            className="field"
            rows={3}
            placeholder={f.placeholder}
            value={entry[f.key]}
            onChange={(e) => set(f.key, e.target.value)}
          />
        </div>
      ))}
    </>
  );
}
