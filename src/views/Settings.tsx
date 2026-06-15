import { useEffect, useState } from "react";
import { useStore } from "../state/store";
import { useNav } from "../state/nav";
import { METHODS, buildPrayerEvents } from "../lib/prayer";
import { requestPermission } from "../lib/notify";
import { pushSupported, getPushStatus, subscribePush, unsubscribePush, sendPrayerSchedule } from "../lib/push";
import { playAdhan, unlockAdhan, stopAdhan } from "../lib/adhan";
import { IconChevron } from "../components/icons";

export default function Settings() {
  const { state, update, reset } = useStore();
  const go = useNav();
  const [confirm, setConfirm] = useState(false);
  const [geoMsg, setGeoMsg] = useState("");
  const p = state.prayer;

  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMsg, setPushMsg] = useState("");
  useEffect(() => { getPushStatus().then(setPushOn); }, []);

  const togglePrayerNotify = async () => {
    if (!p.notify) {
      const perm = await requestPermission();
      update((d) => { d.prayer.notify = perm === "granted"; });
    } else {
      update((d) => { d.prayer.notify = false; });
    }
  };

  const [adhanMsg, setAdhanMsg] = useState("");
  const toggleAdhan = async () => {
    if (!p.adhan) {
      await unlockAdhan(); // geste utilisateur → débloque l'autoplay
      update((d) => { d.prayer.adhan = true; });
    } else {
      update((d) => { d.prayer.adhan = false; });
    }
  };
  const testAdhan = async () => {
    const ok = await playAdhan();
    setAdhanMsg(ok ? "▶️ Lecture… (Stop pour arrêter)" : "Ajoute un fichier public/adhan.mp3 (introuvable ou bloqué).");
  };

  const togglePush = async () => {
    setPushBusy(true);
    setPushMsg("");
    try {
      if (pushOn) {
        await unsubscribePush(state.settings.pushServerUrl);
        setPushOn(false);
        update((d) => { d.settings.pushPrayer = false; });
        setPushMsg("Désactivé.");
      } else {
        await subscribePush(state.settings.pushServerUrl, {
          weekdays: state.fasting.weekdays,
          reminderTime: state.fasting.reminderTime,
        });
        setPushOn(true);
        setPushMsg("Activé ✓ — teste avec POST /test sur le serveur.");
      }
    } catch (e) {
      setPushMsg(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setPushBusy(false);
    }
  };

  const togglePushPrayer = async () => {
    setPushBusy(true);
    setPushMsg("");
    try {
      if (!state.settings.pushPrayer) {
        const events = await buildPrayerEvents(state.prayer, 7);
        await sendPrayerSchedule(state.settings.pushServerUrl, events);
        update((d) => { d.settings.pushPrayer = true; });
        setPushMsg(`Prières programmées : ${events.length} rappels sur 7 jours.`);
      } else {
        try { await sendPrayerSchedule(state.settings.pushServerUrl, []); } catch { /* ignore */ }
        update((d) => { d.settings.pushPrayer = false; });
        setPushMsg("Rappels de prière serveur désactivés.");
      }
    } catch (e) {
      setPushMsg(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setPushBusy(false);
    }
  };

  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoMsg("Géolocalisation non disponible sur cet appareil.");
      return;
    }
    setGeoMsg("Localisation en cours…");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        update((d) => {
          d.prayer.useGeo = true;
          d.prayer.lat = pos.coords.latitude;
          d.prayer.lng = pos.coords.longitude;
          d.prayer.cache = undefined;
        });
        setGeoMsg("Position enregistrée ✓");
      },
      () => setGeoMsg("Position refusée — saisis ta ville ci-dessous."),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  return (
    <>
      <div className="subhead">
        <button className="back" onClick={() => go("plus")} aria-label="Retour">
          <IconChevron size={22} />
        </button>
        <h2>Réglages</h2>
      </div>

      <div className="card">
        <label className="lab" style={{ marginTop: 0 }}>Ton prénom</label>
        <input
          className="field"
          placeholder="Comment t'appeler ?"
          value={state.settings.name}
          onChange={(e) => update((d) => { d.settings.name = e.target.value; })}
        />
        <p className="sub" style={{ margin: "10px 0 0" }}>
          Affiché sur l'écran d'accueil.
        </p>
      </div>

      <div className="card">
        <h3>Apparence</h3>
        <p className="sub" style={{ marginTop: 0 }}>Thème</p>
        <div className="chips" style={{ justifyContent: "flex-start" }}>
          <span
            className={"chip" + (state.settings.theme === "light" ? " active" : "")}
            onClick={() => update((d) => { d.settings.theme = "light"; })}
          >
            ☀️ Clair
          </span>
          <span
            className={"chip" + (state.settings.theme === "dark" ? " active" : "")}
            onClick={() => update((d) => { d.settings.theme = "dark"; })}
          >
            🌙 Sombre
          </span>
        </div>

        <label className="lab">Couleur d'accent</label>
        <div className="swatches">
          {([
            { id: "indigo", name: "Indigo", color: "#3b3a82" },
            { id: "sage", name: "Sauge", color: "#3c6b54" },
            { id: "plum", name: "Prune", color: "#6d3b6e" },
            { id: "blue", name: "Nuit", color: "#27508a" },
          ] as const).map((a) => (
            <button
              key={a.id}
              className={"swatch" + ((state.settings.accent ?? "indigo") === a.id ? " active" : "")}
              style={{ background: a.color }}
              aria-label={a.name}
              onClick={() => update((d) => { d.settings.accent = a.id; })}
            />
          ))}
        </div>
      </div>

      <div className="card">
        <h3>Mise en page</h3>

        <label className="lab" style={{ marginTop: 0 }}>Style des cartes</label>
        <div className="chips" style={{ justifyContent: "flex-start" }}>
          {([
            { id: "doux", label: "Doux" },
            { id: "contour", label: "Contour" },
            { id: "eleve", label: "Élevé" },
          ] as const).map((c) => (
            <span
              key={c.id}
              className={"chip" + ((state.settings.cardStyle ?? "doux") === c.id ? " active" : "")}
              onClick={() => update((d) => { d.settings.cardStyle = c.id; })}
            >
              {c.label}
            </span>
          ))}
        </div>

        <label className="lab">Navigation</label>
        <div className="chips" style={{ justifyContent: "flex-start" }}>
          {([
            { id: "flottante", label: "Flottante" },
            { id: "pleine", label: "Pleine largeur" },
          ] as const).map((n) => (
            <span
              key={n.id}
              className={"chip" + ((state.settings.navStyle ?? "flottante") === n.id ? " active" : "")}
              onClick={() => update((d) => { d.settings.navStyle = n.id; })}
            >
              {n.label}
            </span>
          ))}
        </div>

        <label className="lab">Arrondi des coins</label>
        <input
          type="range"
          className="range"
          min={14}
          max={30}
          step={2}
          value={state.settings.radius ?? 22}
          onChange={(e) => update((d) => { d.settings.radius = Number(e.target.value); })}
        />
        <p className="tiny muted" style={{ margin: 0 }}>{state.settings.radius ?? 22} px</p>
      </div>

      <div className="card">
        <h3>Horaires de prière</h3>
        <p className="sub" style={{ marginTop: 0 }}>Méthode de calcul</p>
        <select
          className="field"
          value={p.method}
          onChange={(e) => update((d) => { d.prayer.method = Number(e.target.value); d.prayer.cache = undefined; })}
        >
          {METHODS.map((m) => (
            <option key={m.id} value={m.id}>{m.label}</option>
          ))}
        </select>

        <label className="lab">Ville</label>
        <input
          className="field"
          placeholder="Paris"
          value={p.city}
          onChange={(e) => update((d) => { d.prayer.city = e.target.value; d.prayer.useGeo = false; d.prayer.cache = undefined; })}
        />
        <label className="lab">Pays</label>
        <input
          className="field"
          placeholder="France"
          value={p.country}
          onChange={(e) => update((d) => { d.prayer.country = e.target.value; d.prayer.useGeo = false; d.prayer.cache = undefined; })}
        />

        <div className="spacer" />
        <button className="btn ghost block" onClick={useMyLocation}>
          📍 Utiliser ma position
        </button>
        {p.useGeo && <p className="tiny muted" style={{ marginBottom: 0 }}>Position GPS active.</p>}
        {geoMsg && <p className="tiny" style={{ color: "var(--green-soft)", marginBottom: 0 }}>{geoMsg}</p>}

        <div className={"check" + (p.notify ? " done" : "")} onClick={togglePrayerNotify} style={{ borderBottom: "none", marginTop: 6 }}>
          <span className="box">✓</span>
          <span className="txt">Rappels à l'heure de chaque prière</span>
        </div>
        {p.notify && (
          <p className="tiny muted" style={{ margin: 0 }}>
            S'affichent quand l'app est ouverte. Pour des rappels même app fermée,
            active les notifications serveur ci-dessous.
          </p>
        )}

        <div className={"check" + (p.adhan ? " done" : "")} onClick={toggleAdhan} style={{ borderBottom: "none", marginTop: 6 }}>
          <span className="box">✓</span>
          <span className="txt">Jouer l'adhan à l'heure (app ouverte)</span>
        </div>
        <div className="flex" style={{ marginTop: 6 }}>
          <button className="btn ghost sm grow" onClick={testAdhan}>▶ Tester l'adhan</button>
          <button className="btn ghost sm grow" onClick={() => { stopAdhan(); setAdhanMsg(""); }}>■ Stop</button>
        </div>
        {adhanMsg && <p className="tiny muted" style={{ marginBottom: 0 }}>{adhanMsg}</p>}
        <p className="tiny muted" style={{ marginBottom: 0 }}>
          Dépose ton fichier <strong>adhan.mp3</strong> dans le dossier <code>public/</code> de l'app.
        </p>
      </div>

      <div className="card">
        <h3>Notifications en arrière-plan</h3>
        <p className="sub" style={{ marginTop: 0 }}>
          Rappels de jeûne garantis même app fermée (nécessite le serveur Web Push).
          Requiert l'app installée / servie en HTTPS.
        </p>
        {!pushSupported() ? (
          <p className="tiny muted" style={{ margin: 0 }}>Push non supporté sur cet appareil/navigateur.</p>
        ) : (
          <>
            <label className="lab" style={{ marginTop: 0 }}>URL du serveur push</label>
            <input
              className="field"
              placeholder="http://localhost:4000"
              value={state.settings.pushServerUrl}
              onChange={(e) => update((d) => { d.settings.pushServerUrl = e.target.value; })}
            />
            <div className="spacer" />
            <button className={"btn block" + (pushOn ? " ghost" : "")} onClick={togglePush} disabled={pushBusy}>
              {pushBusy ? "…" : pushOn ? "Désactiver" : "Activer les notifications serveur"}
            </button>
            {pushOn && (
              <div
                className={"check" + (state.settings.pushPrayer ? " done" : "")}
                onClick={() => !pushBusy && togglePushPrayer()}
                style={{ borderBottom: "none", marginTop: 8 }}
              >
                <span className="box">✓</span>
                <span className="txt">Rappels de prière en arrière-plan (adhan)</span>
              </div>
            )}
            {pushMsg && <p className="tiny" style={{ color: "var(--green-soft)", marginBottom: 0 }}>{pushMsg}</p>}
          </>
        )}
      </div>

      <div className="card">
        <h3>Tes données</h3>
        <p className="sub">
          Tout est stocké uniquement sur cet appareil (hors-ligne). Rien n'est
          envoyé sur Internet, aucun compte requis.
        </p>
        {!confirm ? (
          <button className="btn danger block" onClick={() => setConfirm(true)}>
            Réinitialiser toutes les données
          </button>
        ) : (
          <div>
            <p className="tiny" style={{ color: "var(--danger)", marginTop: 0 }}>
              Cette action efface tout définitivement. Confirmer ?
            </p>
            <div className="flex">
              <button className="btn ghost grow" onClick={() => setConfirm(false)}>Annuler</button>
              <button className="btn danger grow" onClick={() => { reset(); setConfirm(false); go("today"); }}>
                Tout effacer
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="quote">
        Niyyah — Agenda du Deen<br />
        <span className="tiny">« Organise ta dunya, n'oublie jamais ton akhira »</span>
      </p>
    </>
  );
}
