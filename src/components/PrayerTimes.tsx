import { usePrayerTimes, nextPrayer, fmtIn, PRAYER_KEYS, PRAYER_LABEL } from "../lib/prayer";

/** Carte des horaires de prière du jour, avec la prochaine prière mise en valeur. */
export default function PrayerTimes() {
  const { timings, label, loading, error, configured, refresh } = usePrayerTimes();

  if (!configured) {
    return (
      <div className="card">
        <h3>Horaires de prière</h3>
        <p className="sub" style={{ margin: 0 }}>
          Choisis ta ville dans <em>Plus → Réglages → Horaires de prière</em> pour
          afficher les horaires.
        </p>
      </div>
    );
  }

  const next = timings ? nextPrayer(timings) : null;

  return (
    <div className="card">
      <div className="row">
        <h3>Horaires · {label}</h3>
        <button className="icon-btn" onClick={() => refresh()} aria-label="Actualiser" title="Actualiser">↻</button>
      </div>

      {loading && !timings && <p className="sub" style={{ margin: 0 }}>Chargement…</p>}
      {error && !timings && <p className="sub" style={{ margin: 0, color: "var(--danger)" }}>{error}</p>}

      {timings && (
        <>
          {next && (
            <div className="row" style={{ background: "var(--cream-2)", borderRadius: 12, padding: "10px 12px", marginBottom: 10 }}>
              <div>
                <div className="tiny muted">Prochaine prière</div>
                <div style={{ fontSize: 16, color: "var(--green)", fontWeight: 600 }}>
                  {PRAYER_LABEL[next.name]} · {next.time}
                </div>
              </div>
              <div className="tiny" style={{ color: "var(--gold)" }}>{fmtIn(next.inMin)}</div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, textAlign: "center" }}>
            {PRAYER_KEYS.map((k) => {
              const isNext = next?.name === k;
              return (
                <div key={k} style={{
                  padding: "8px 2px", borderRadius: 10,
                  background: isNext ? "var(--green)" : "transparent",
                  color: isNext ? "var(--cream)" : "var(--ink)",
                }}>
                  <div className="tiny" style={{ color: isNext ? "var(--gold-l)" : "var(--green-soft)" }}>
                    {PRAYER_LABEL[k]}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{timings[k]}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
