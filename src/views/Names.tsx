import { useStore } from "../state/store";
import { useNav } from "../state/nav";
import { IconChevron } from "../components/icons";

// Sélection de noms d'Allah, bien connus, pour l'apprentissage.
// Ce n'est volontairement pas la liste de référence complète des 99
// (les listes varient selon les sources) — c'est un tracker.
const NAMES: { t: string; fr: string }[] = [
  { t: "Ar-Rahman", fr: "Le Tout-Miséricordieux" },
  { t: "Ar-Rahim", fr: "Le Très-Miséricordieux" },
  { t: "Al-Malik", fr: "Le Souverain" },
  { t: "Al-Quddus", fr: "Le Pur" },
  { t: "As-Salam", fr: "La Paix" },
  { t: "Al-Mu'min", fr: "Le Rassurant" },
  { t: "Al-Muhaymin", fr: "Le Gardien" },
  { t: "Al-'Aziz", fr: "Le Puissant" },
  { t: "Al-Jabbar", fr: "Le Contraignant" },
  { t: "Al-Mutakabbir", fr: "Le Suprême" },
  { t: "Al-Khaliq", fr: "Le Créateur" },
  { t: "Al-Bari'", fr: "Le Producteur" },
  { t: "Al-Musawwir", fr: "Le Façonneur" },
  { t: "Al-Ghaffar", fr: "Le Grand Pardonneur" },
  { t: "Al-Wahhab", fr: "Le Donateur" },
  { t: "Ar-Razzaq", fr: "Le Pourvoyeur" },
  { t: "Al-Fattah", fr: "Celui qui ouvre" },
  { t: "Al-'Alim", fr: "L'Omniscient" },
  { t: "Al-Hakim", fr: "Le Sage" },
  { t: "Al-Wadud", fr: "Le Tout-Aimant" },
  { t: "Al-Hayy", fr: "Le Vivant" },
  { t: "Al-Qayyum", fr: "Le Subsistant par Lui-même" },
  { t: "An-Nur", fr: "La Lumière" },
  { t: "Al-Hadi", fr: "Le Guide" },
  { t: "As-Sabur", fr: "Le Patient" },
];

export default function Names() {
  const { state, update } = useStore();
  const go = useNav();
  const learned = Object.values(state.namesLearned).filter(Boolean).length;

  const toggle = (i: number) =>
    update((d) => {
      d.namesLearned[i] = !d.namesLearned[i];
    });

  return (
    <>
      <div className="subhead">
        <button className="back" onClick={() => go("plus")} aria-label="Retour">
          <IconChevron size={22} />
        </button>
        <h2>Noms d'Allah</h2>
      </div>

      <div className="card">
        <div className="row">
          <h3>À apprendre</h3>
          <span className="stat-lbl">{learned}/{NAMES.length} appris</span>
        </div>
        <p className="sub">Touche un nom une fois mémorisé.</p>
        {NAMES.map((n, i) => {
          const on = state.namesLearned[i] ?? false;
          return (
            <div key={i} className={"check" + (on ? " done" : "")} onClick={() => toggle(i)}>
              <span className="box">✓</span>
              <span className="txt">
                <strong>{n.t}</strong> — <span className="muted">{n.fr}</span>
              </span>
            </div>
          );
        })}
      </div>

      <p className="tiny muted center" style={{ marginBottom: 8 }}>
        Sélection pour l'apprentissage — les listes des 99 noms varient selon les sources.
      </p>
    </>
  );
}
