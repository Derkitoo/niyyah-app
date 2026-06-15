import { useState } from "react";
import { useStore, uid } from "../state/store";
import { useNav } from "../state/nav";
import { IconTrash, IconChevron, IconHand } from "../components/icons";

export default function Dua() {
  const { state, update } = useStore();
  const go = useNav();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const add = () => {
    const t = title.trim();
    const x = text.trim();
    if (!t && !x) return;
    update((d) => d.duas.unshift({ id: uid(), title: t || "Du'ā", text: x }));
    setTitle("");
    setText("");
  };

  const remove = (id: string) =>
    update((d) => {
      d.duas = d.duas.filter((x) => x.id !== id);
    });

  return (
    <>
      <div className="subhead">
        <button className="back" onClick={() => go("plus")} aria-label="Retour">
          <IconChevron size={22} />
          <span style={{ display: "none" }}>retour</span>
        </button>
        <h2>Mes du'ā</h2>
      </div>

      <div className="card">
        <h3>Ajouter une invocation</h3>
        <input
          className="field"
          placeholder="Titre (ex. Pour mes parents)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div className="spacer" />
        <textarea
          className="field"
          rows={3}
          placeholder="Le texte de l'invocation…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="spacer" />
        <button className="btn block" onClick={add}>
          Enregistrer
        </button>
      </div>

      {state.duas.length === 0 && <p className="empty">Aucune du'ā enregistrée.</p>}

      {state.duas.map((d) => (
        <div className="list-item" key={d.id}>
          <div className="row" style={{ alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div className="dua-item-head">
                <div className="tile"><IconHand size={17} /></div>
                <h4>{d.title}</h4>
              </div>
              {d.text && <p>{d.text}</p>}
            </div>
            <button className="icon-btn" onClick={() => remove(d.id)} aria-label="Supprimer">
              <IconTrash />
            </button>
          </div>
        </div>
      ))}

      <p className="quote">« Invoquez-Moi, Je vous répondrai. »</p>
    </>
  );
}
