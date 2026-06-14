# Déploiement de Niyyah

Deux briques :
- **L'app** (PWA statique) → hébergeur statique en **HTTPS** (Netlify / Vercel / Cloudflare Pages).
- **Le serveur push** (Node) → hébergeur Node (Render / Railway / Fly.io). *Optionnel* : seulement pour les notifications **app fermée**.

> Tu dois créer les comptes d'hébergement toi-même (je ne peux pas le faire).
> Tout le reste est prêt.

---

## Étape 1 — Déployer l'app (le plus important)

Ça suffit déjà pour **installer Niyyah sur ton téléphone** et utiliser : horaires
de prière, jeûne, habitudes, **adhan in-app**, thème, etc. (tout le local-first).

### Option A — Netlify (sans Git, le plus rapide)
1. `npm run build` → génère `dist/`.
2. Va sur **app.netlify.com/drop** et **glisse le dossier `dist/`**.
3. Tu obtiens une URL HTTPS du type `https://niyyah-xxx.netlify.app`. 🎉
4. Sur ton téléphone, ouvre l'URL dans Chrome → menu → **« Ajouter à l'écran d'accueil »**.

### Option B — Vercel / Netlify avec Git (mises à jour auto)
1. Mets le dossier `niyyah-app/` sur un repo GitHub.
2. Importe le repo dans Vercel (preset **Vite**) ou Netlify (`netlify.toml` déjà fourni).
3. Build command `npm run build`, publish/output `dist`.

> ⚠️ **HTTPS obligatoire** pour les service workers / notifications — tous ces
> hébergeurs le fournissent automatiquement.

---

## Étape 2 — Déployer le serveur push (notifs app fermée)

### a) Générer des clés VAPID stables
```bash
cd server
npm install
npm run genkeys
```
→ copie les deux lignes affichées (`VAPID_PUBLIC=…`, `VAPID_PRIVATE=…`).

### b) Héberger (exemple Render)
1. Crée un **Web Service** sur render.com, connecté à ton repo.
2. **Root Directory** : `server`
3. **Build** : `npm install` — **Start** : `npm start`
4. **Environment** → ajoute :
   - `VAPID_PUBLIC` = (la valeur générée)
   - `VAPID_PRIVATE` = (la valeur générée)
   - `PORT` est fourni automatiquement par Render.
5. Déploie → tu obtiens `https://niyyah-push-xxx.onrender.com`.

### c) Relier l'app au serveur
Deux options :
- **Simple** : dans l'app → *Réglages → URL du serveur push* → colle l'URL Render.
- **Par défaut au build** : déploie l'app avec la variable
  `VITE_PUSH_SERVER_URL=https://niyyah-push-xxx.onrender.com` (Netlify/Vercel →
  *Environment variables*), puis rebuild.

### d) Tester
- App (HTTPS) → *Réglages* → **Activer les notifications serveur** → autorise.
- `curl -X POST https://niyyah-push-xxx.onrender.com/test` → la notif arrive,
  même app fermée. ✅

---

## Limites connues (à améliorer plus tard)
- **Abonnements en fichier JSON** : sur les hébergeurs à disque éphémère (Render
  free), ils sont perdus à chaque redéploiement/veille → il faut se réabonner.
  Pour de la vraie prod : stocker dans une base (Postgres/Supabase/Redis).
- **Fuseau horaire du rappel de jeûne** : basé sur l'heure du serveur (les
  rappels de **prière** utilisent des timestamps absolus, donc OK).
- **Veille du service gratuit** : Render free s'endort ; le planificateur ne
  tourne pas pendant la veille. Pour des rappels fiables 24/7 → offre payante
  ou un cron externe qui « réveille » le service.

## Rappel : app native (adhan même fermée, sans serveur)
Pour l'adhan en arrière-plan **sans dépendre d'un serveur**, l'app **native**
(Capacitor) reste la meilleure voie — voir [CAPACITOR.md](CAPACITOR.md).
