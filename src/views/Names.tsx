import { useStore } from "../state/store";
import { useNav } from "../state/nav";
import { IconChevron } from "../components/icons";

// Sélection de noms d'Allah, bien connus, pour l'apprentissage.
// Ce n'est volontairement pas la liste de référence complète des 99
// (les listes varient selon les sources) — c'est un tracker.
const NAMES: { t: string; fr: string; ar: string }[] = [
  { t: "Ar-Rahman", fr: "Le Tout-Miséricordieux", ar: "الرَّحمَٰن" },
  { t: "Ar-Rahim", fr: "Le Très-Miséricordieux", ar: "الرَّحيم" },
  { t: "Al-Malik", fr: "Le Souverain", ar: "المَلِك" },
  { t: "Al-Quddus", fr: "Le Pur", ar: "القُدُّوس" },
  { t: "As-Salam", fr: "La Paix", ar: "السَّلام" },
  { t: "Al-Mu'min", fr: "Le Rassurant", ar: "المُؤمِن" },
  { t: "Al-Muhaymin", fr: "Le Gardien", ar: "المُهَيمِن" },
  { t: "Al-'Aziz", fr: "Le Puissant", ar: "العَزيز" },
  { t: "Al-Jabbar", fr: "Le Contraignant", ar: "الجَبَّار" },
  { t: "Al-Mutakabbir", fr: "Le Suprême", ar: "المُتَكَبِّر" },
  { t: "Al-Khaliq", fr: "Le Créateur", ar: "الخَالِق" },
  { t: "Al-Bari'", fr: "Le Producteur", ar: "البَارِئ" },
  { t: "Al-Musawwir", fr: "Le Façonneur", ar: "المُصَوِّر" },
  { t: "Al-Ghaffar", fr: "Le Grand Pardonneur", ar: "الغَفَّار" },
  { t: "Al-Wahhab", fr: "Le Donateur", ar: "الوَهَّاب" },
  { t: "Ar-Razzaq", fr: "Le Pourvoyeur", ar: "الرَّزَّاق" },
  { t: "Al-Fattah", fr: "Celui qui ouvre", ar: "الفَتَّاح" },
  { t: "Al-'Alim", fr: "L'Omniscient", ar: "العَليم" },
  { t: "Al-Hakim", fr: "Le Sage", ar: "الحَكيم" },
  { t: "Al-Wadud", fr: "Le Tout-Aimant", ar: "الوَدُود" },
  { t: "Al-Hayy", fr: "Le Vivant", ar: "الحَيّ" },
  { t: "Al-Qayyum", fr: "Le Subsistant par Lui-même", ar: "القَيَّوم" },
  { t: "An-Nur", fr: "La Lumière", ar: "النُّور" },
  { t: "Al-Hadi", fr: "Le Guide", ar: "الهَادي" },
  { t: "As-Sabur", fr: "Le Patient", ar: "الصَّبُور" },
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
          <div>
            <div className="eyebrow">Asmā’ Allāh al-Ḥusnā</div>
            <h3 style={{ marginTop: 4, marginBottom: 0 }}>Les plus beaux noms</h3>
          </div>
          <div style={{ textAlign: "right" }}>
            <div className="stat-big" style={{ fontSize: 26 }}>{learned}</div>
            <div className="stat-lbl">/ {NAMES.length} appris</div>
          </div>
        </div>
        <div className="progress" style={{ marginTop: 12 }}>
          <span style={{ width: `${(learned / NAMES.length) * 100}%` }} />
        </div>
      </div>

      <div className="name-grid">
        {NAMES.map((n, i) => {
          const on = state.namesLearned[i] ?? false;
          return (
            <div key={i} className={"name-card" + (on ? " on" : "")} onClick={() => toggle(i)}>
              <div className="nm-ar arabic">{n.ar}</div>
              <div className="nm-tr">{n.t}</div>
              <div className="nm-fr">{n.fr}</div>
            </div>
          );
        })}
      </div>

      <p className="tiny muted center" style={{ margin: "14px 0 8px" }}>
        Touche un nom une fois mémorisé · sélection pour l'apprentissage.
      </p>
    </>
  );
}
