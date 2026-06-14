import { useNav, type View } from "../state/nav";
import { IconMoon, IconFast, IconHand, IconMirror, IconStarList, IconSettings, IconChevron } from "../components/icons";
import type { ReactNode } from "react";

const ITEMS: { view: View; icon: ReactNode; title: string; sub: string }[] = [
  { view: "fasting", icon: <IconFast />, title: "Jeûne", sub: "Lundi/jeudi, jours blancs, ‘Arafa, ‘Āshūrā’ + rappels" },
  { view: "ramadan", icon: <IconMoon />, title: "Ramadan", sub: "Jeûne, taraweeh, sadaqa — 30 jours" },
  { view: "dua", icon: <IconHand />, title: "Mes du'ā", sub: "Tes invocations enregistrées" },
  { view: "muhasaba", icon: <IconMirror />, title: "Muhasaba", sub: "Bilan mensuel & introspection" },
  { view: "names", icon: <IconStarList />, title: "Noms d'Allah", sub: "Apprends les plus beaux noms" },
  { view: "settings", icon: <IconSettings />, title: "Réglages", sub: "Prénom, données, à propos" },
];

export default function Plus() {
  const go = useNav();
  return (
    <>
      {ITEMS.map((it) => (
        <div className="menu-item" key={it.view} onClick={() => go(it.view)}>
          <div className="mi-ic">{it.icon}</div>
          <div>
            <div className="mi-t">{it.title}</div>
            <div className="mi-s">{it.sub}</div>
          </div>
          <span className="mi-arrow"><IconChevron /></span>
        </div>
      ))}
    </>
  );
}
