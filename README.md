# Niyyah — Agenda du Deen (application)

Application web de productivité spirituelle, déclinée du planner Niyyah.
**Local-first** : toutes les données restent sur l'appareil (aucun compte,
aucun serveur, fonctionne hors-ligne). Installable comme une app (PWA).

## Stack

- **React 18 + TypeScript + Vite**
- **vite-plugin-pwa** (manifest + service worker, installable & offline)
- État global maison via React Context, persisté dans `localStorage`
  (clé `niyyah.v1`)
- Design system Niyyah écrit à la main (`src/styles.css`), zéro dépendance UI
- Dates grégoriennes **et hégiriennes** via `Intl` (calendrier umm-al-qura)

## Lancer en développement

```bash
cd niyyah-app
npm install      # déjà fait
npm run dev      # http://localhost:5173
```

## Construire / prévisualiser la version de production

```bash
npm run build    # typecheck + build dans dist/
npm run preview  # sert dist/ localement
```

## Fonctionnalités (v1)

| Écran | Contenu |
|---|---|
| **Horaires de prière** | Intégrés sur Aujourd'hui & Salât (API Aladhan, ville ou géoloc), prochaine prière en direct, suhoor/iftar dans Jeûne. Cache hors-ligne. |
| **Aujourd'hui** | Horaires + prochaine prière · suivi des 5 salât · habitudes · dhikr (tasbih) · gratitude · bannière jeûne |
| **Salât** | Streak (jours d'affilée), 7 derniers jours, % de la semaine |
| **Qur'an** | Suivi du Khatm (30 juz), compteur de khatm complétés |
| **Habitudes** | Créer/supprimer des habitudes, grille 7 jours |
| **Jeûne** | Calendrier des jeûnes surérogatoires (lundi/jeudi configurables, jours blancs 13-14-15, ‘Arafa, ‘Āshūrā’/Tasū‘ā), jours **interdits** marqués (Aïd, Tashrīq), journal des jeûnes + **rappels** |
| **Ramadan** | Mode activable, tracker 30 jours (jeûne, taraweeh, Qur'an, sadaqa), 10 dernières nuits surlignées |
| **Du'ā** | Collection personnelle d'invocations |
| **Muhasaba** | Bilan mensuel (gratitude, ce qui rapproche d'Allah, à corriger, intention) |
| **Noms d'Allah** | Tracker d'apprentissage (sélection de noms) |
| **Réglages** | Prénom · **thème clair/sombre** · horaires de prière (ville/méthode/géoloc) · notifications push serveur · réinitialisation |

## Architecture

```
src/
  main.tsx              point d'entrée
  App.tsx               en-tête, navigation, barre du bas
  styles.css            design system Niyyah
  state/
    store.tsx           types, état par défaut, persistance localStorage
    nav.tsx             contexte de navigation (View)
  lib/
    date.ts             clés de date, FR + hégirien (Intl)
  components/
    icons.tsx           icônes SVG + ornement géométrique
  views/                Today, Salah, Quran, Habits, Ramadan, Dua,
                        Muhasaba, Names, Settings, Plus
```

## Notifications de jeûne — état & limites

Le calcul des jours (logique dans `src/lib/fasting.ts`) est **fiable et
hors-ligne** : dates hégiriennes via `Intl` (umm-al-qura), jours interdits
exclus, événements détectés.

Les **rappels** (`src/lib/notify.ts` + planificateur dans `App.tsx`)
fonctionnent quand l'app est **ouverte / au premier plan** : un rappel la
veille au soir (heure configurable) si le lendemain est un jour de jeûne.

⚠️ Limite de la plateforme web : sans backend **Web Push**, on ne peut pas
garantir une notification quand l'app est **fermée**. Pour des rappels
garantis en arrière-plan, ajouter un service Web Push (VAPID + petit serveur,
ou Supabase/Firebase) — c'est l'étape suivante si tu veux des notifications
type app native.

> Dates basées sur le calendrier calculé umm-al-qura → peuvent varier de ±1
> jour selon l'observation locale du croissant.

## ⚠️ Contenu religieux

Comme pour le planner : les citations sont des reformulations FR fidèles au
sens, et l'écran « Noms d'Allah » est un *tracker* d'une sélection (pas la
liste de référence des 99, qui varie selon les sources). **À faire relire**
par une personne de confiance avant toute diffusion publique.

## Web Push (notifications garanties app fermée)

Un serveur Web Push est fourni dans [`server/`](server/README.md) (Express +
web-push + VAPID). Le client s'abonne via un **service worker dédié**
(`public/push-sw.js`, scope `/push/`) pour ne pas interférer avec le SW PWA.
Activation dans **Réglages → Notifications en arrière-plan**.

Chaîne de test local : démarrer `server/` (`npm start`), faire `npm run build &&
npm run preview` côté app (le push exige le build, pas le dev), puis Activer et
`curl -X POST http://localhost:4000/test`.

## Pistes pour la suite

- **Déployer** : héberger `server/` (Render/Railway/Fly) + l'app en HTTPS
  (Netlify/Vercel) pour des notifications réellement en arrière-plan.
- **Fuseau horaire** par abonné dans le scheduler push (actuellement heure
  serveur).
- **Sync cloud / multi-appareils** (comptes) — backend type Supabase/Firebase.
- **Export / import** des données (sauvegarde JSON).
- **Langues** (FR/EN/AR) et **notifications de prière** (à l'heure de chaque salât).
- **Stores natifs** : envelopper la PWA avec Capacitor.
