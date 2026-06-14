import { useState } from "react";
import { useStore, uid } from "../state/store";
import { todayKey, shiftKey, frShortDay } from "../lib/date";
import { IconPlus, IconTrash } from "../components/icons";

export default function Habits() {
  const { state, update } = useStore();
  const [name, setName] = useState("");
  const today = todayKey();
  const days = Array.from({ length: 7 }, (_, i) => shiftKey(today, -(6 - i)));

  const add = () => {
    const n = name.trim();
    if (!n) return;
    update((d) => d.habitDefs.push({ id: uid(), name: n }));
    setName("");
  };

  const remove = (id: string) =>
    update((d) => {
      d.habitDefs = d.habitDefs.filter((h) => h.id !== id);
    });

  const toggle = (id: string, key: string) =>
    update((d) => {
      const day = (d.habits[key] ??= {});
      day[id] = !day[id];
    });

  return (
    <>
      <div className="card">
        <h3>Nouvelle habitude</h3>
        <div className="flex">
          <input
            className="field grow"
            placeholder="Ex. Lecture du Qur'an"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
          />
          <button className="btn" onClick={add}>
            <IconPlus />
          </button>
        </div>
      </div>

      {state.habitDefs.length === 0 && (
        <p className="empty">Aucune habitude pour l'instant.</p>
      )}

      {state.habitDefs.map((h) => (
        <div className="card" key={h.id}>
          <div className="row" style={{ marginBottom: 10 }}>
            <strong style={{ color: "var(--green)", fontSize: 14.5 }}>{h.name}</strong>
            <button className="icon-btn" onClick={() => remove(h.id)} aria-label="Supprimer">
              <IconTrash />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {days.map((key) => {
              const on = state.habits[key]?.[h.id] ?? false;
              return (
                <div key={key} style={{ textAlign: "center" }}>
                  <div className="tiny muted" style={{ marginBottom: 4 }}>
                    {key === today ? "Auj." : frShortDay(key).slice(0, 2)}
                  </div>
                  <div className={"mini" + (on ? " on" : "")} onClick={() => toggle(h.id, key)}>
                    ✓
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <p className="quote">Petit à petit, avec constance. C'est le secret.</p>
    </>
  );
}
