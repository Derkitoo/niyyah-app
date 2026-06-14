// Serveur Web Push Niyyah — rappels de jeûne garantis (même app fermée).
//
// Démarrage :  npm install  puis  npm start
// Les clés VAPID sont générées au 1er lancement dans vapid.json.

import express from "express";
import cors from "cors";
import webpush from "web-push";
import fs from "node:fs";
import { isFastTomorrow } from "./fasting.js";

const PORT = process.env.PORT || 4000;
const VAPID_FILE = "./vapid.json";
const SUBS_FILE = "./subscriptions.json";

// --- Clés VAPID ---
// Priorité aux variables d'environnement (recommandé en production : elles
// persistent entre les redéploiements). Sinon fichier local, sinon génération.
let vapid;
if (process.env.VAPID_PUBLIC && process.env.VAPID_PRIVATE) {
  vapid = { publicKey: process.env.VAPID_PUBLIC, privateKey: process.env.VAPID_PRIVATE };
  console.log("→ Clés VAPID lues depuis l'environnement");
} else if (fs.existsSync(VAPID_FILE)) {
  vapid = JSON.parse(fs.readFileSync(VAPID_FILE, "utf8"));
} else {
  vapid = webpush.generateVAPIDKeys();
  fs.writeFileSync(VAPID_FILE, JSON.stringify(vapid, null, 2));
  console.log("→ Clés VAPID générées dans vapid.json (dev). En prod, mets-les en variables d'env.");
}
webpush.setVapidDetails("mailto:contact@niyyah.app", vapid.publicKey, vapid.privateKey);

// --- Abonnements (persistés dans un fichier JSON) ---
let subs = fs.existsSync(SUBS_FILE) ? JSON.parse(fs.readFileSync(SUBS_FILE, "utf8")) : [];
const saveSubs = () => fs.writeFileSync(SUBS_FILE, JSON.stringify(subs, null, 2));

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => res.json({ service: "niyyah-push", subscribers: subs.length }));
app.get("/vapidPublicKey", (_req, res) => res.json({ publicKey: vapid.publicKey }));

app.post("/subscribe", (req, res) => {
  const { subscription, prefs } = req.body || {};
  if (!subscription?.endpoint) return res.status(400).json({ error: "subscription manquante" });
  subs = subs.filter((s) => s.subscription.endpoint !== subscription.endpoint);
  subs.push({
    subscription,
    prefs: prefs || { weekdays: [1, 4], reminderTime: "20:00" },
    lastNotified: null,
    prayerEvents: [],
  });
  saveSubs();
  res.json({ ok: true, subscribers: subs.length });
});

app.post("/unsubscribe", (req, res) => {
  const { endpoint } = req.body || {};
  subs = subs.filter((s) => s.subscription.endpoint !== endpoint);
  saveSubs();
  res.json({ ok: true, subscribers: subs.length });
});

// Programmation des rappels de prière (timestamps absolus calculés par le client)
app.post("/prayer-schedule", (req, res) => {
  const { endpoint, events } = req.body || {};
  const s = subs.find((x) => x.subscription.endpoint === endpoint);
  if (!s) return res.status(404).json({ error: "abonnement introuvable" });
  s.prayerEvents = Array.isArray(events)
    ? events.map((e) => ({ ts: Number(e.ts), name: String(e.name), sent: false }))
    : [];
  saveSubs();
  res.json({ ok: true, scheduled: s.prayerEvents.length });
});

// Notification de test immédiate (pour vérifier la chaîne)
app.post("/test", async (req, res) => {
  const payload = JSON.stringify({ title: "Niyyah — test", body: "Les notifications fonctionnent 🌙" });
  await sendToAll(payload);
  res.json({ ok: true, sent: subs.length });
});

async function send(sub, payload) {
  try {
    await webpush.sendNotification(sub.subscription, payload);
    return true;
  } catch (e) {
    if (e.statusCode === 404 || e.statusCode === 410) return false; // abonnement expiré
    console.error("push error", e.statusCode);
    return true;
  }
}

async function sendToAll(payload) {
  const alive = [];
  for (const s of subs) {
    if (await send(s, payload)) alive.push(s);
  }
  subs = alive;
  saveSubs();
}

// --- Planificateur : chaque minute, à l'heure du rappel, notifier si demain = jeûne ---
setInterval(async () => {
  const now = new Date();
  const tkey = now.toISOString().slice(0, 10);
  const nowMs = now.getTime();
  let changed = false;
  for (const s of subs) {
    // a) rappel de jeûne (la veille au soir)
    const prefs = s.prefs || {};
    const [hh, mm] = (prefs.reminderTime || "20:00").split(":").map(Number);
    const past = now.getHours() > hh || (now.getHours() === hh && now.getMinutes() >= mm);
    if (past && s.lastNotified !== tkey) {
      const reason = isFastTomorrow(prefs.weekdays || [1, 4]);
      if (reason) {
        await send(s, JSON.stringify({
          title: "Niyyah — jeûne demain",
          body: `Demain : ${reason}. Pense au suhoor 🌙`,
        }));
        s.lastNotified = tkey;
        changed = true;
      }
    }

    // b) rappels de prière (timestamps absolus)
    if (Array.isArray(s.prayerEvents) && s.prayerEvents.length) {
      for (const e of s.prayerEvents) {
        // déclenche si l'heure est passée dans les 5 dernières minutes (évite les envois en rafale après un redémarrage)
        if (!e.sent && e.ts <= nowMs && e.ts > nowMs - 5 * 60 * 1000) {
          await send(s, JSON.stringify({
            title: `Niyyah — ${e.name}`,
            body: `C'est l'heure de ${e.name} 🕌`,
          }));
          e.sent = true;
          changed = true;
        }
      }
      // purge des événements de plus de 10 min
      const before = s.prayerEvents.length;
      s.prayerEvents = s.prayerEvents.filter((e) => e.ts > nowMs - 10 * 60 * 1000);
      if (s.prayerEvents.length !== before) changed = true;
    }
  }
  if (changed) saveSubs();
}, 60000);

app.listen(PORT, () => console.log(`Niyyah push server → http://localhost:${PORT}`));
