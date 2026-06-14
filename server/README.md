# Niyyah — serveur Web Push

Donne des **rappels de jeûne garantis même quand l'app est fermée** (vrai push
en arrière-plan), ce que la PWA seule ne peut pas faire.

## Démarrage local

```bash
cd server
npm install
npm start          # http://localhost:4000
```

Au 1er lancement, les **clés VAPID** sont générées dans `vapid.json` (ne pas
les versionner — déjà dans `.gitignore`).

## Endpoints

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/vapidPublicKey` | clé publique VAPID (lue par l'app) |
| POST | `/subscribe` | `{ subscription, prefs }` — enregistre un appareil |
| POST | `/unsubscribe` | `{ endpoint }` — désinscrit |
| POST | `/prayer-schedule` | `{ endpoint, events }` — programme les rappels de prière |
| POST | `/test` | envoie une notif de test à tous les abonnés |
| GET | `/` | état (nb d'abonnés) |

`prefs` = `{ weekdays:number[], reminderTime:"HH:MM" }`.
`events` = `[{ ts:number (epoch ms), name:string }]` — l'app calcule les
horaires des 7 prochains jours en **timestamps absolus** (pas de souci de
fuseau horaire) et les envoie ; le client les rafraîchit à chaque ouverture.

Le **planificateur** (dans `index.js`) tourne chaque minute :
- **jeûne** : à l'heure du rappel de chaque abonné, si **demain** est un jour
  de jeûne recommandé (`fasting.js`), il envoie un push ;
- **prière** : il déclenche chaque `event` dont l'heure vient de passer
  (fenêtre de 5 min), puis purge les anciens.

## Tester en local (chaîne complète)

1. `cd server && npm install && npm start`
2. Dans l'app : `cd .. && npm run build && npm run preview`
   (le push exige un service worker → utiliser le build, pas le dev)
3. Ouvre l'app, va dans **Plus → Réglages → Notifications en arrière-plan**,
   garde l'URL `http://localhost:4000`, clique **Activer**.
4. `curl -X POST http://localhost:4000/test` → la notification doit apparaître.

## Limites & mise en production

- Le planificateur utilise l'**heure locale du serveur** (le fuseau de chaque
  utilisateur n'est pas encore transmis — à ajouter dans `prefs`).
- Stockage des abonnements en **fichier JSON** (ok pour démarrer ; passer à une
  vraie base pour la prod).
- **Déploiement** : héberger ce serveur (Render, Railway, Fly.io, un VPS…) et
  mettre l'app sur HTTPS (Netlify/Vercel). Renseigner l'URL publique du serveur
  dans les réglages de l'app. Garder un process manager (pm2) ou un cron.
- Sécurité : ajouter un rate-limit et éventuellement une clé d'API sur
  `/subscribe` selon l'usage.
