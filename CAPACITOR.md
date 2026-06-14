# Niyyah — App native (Capacitor)

Emballe la même app React en **app Android/iOS native**. Intérêt principal :
les **notifications locales avec son d'adhan personnalisé**, déclenchées sur
l'appareil à l'heure de chaque prière — **même app fermée / écran verrouillé**,
et **sans serveur** (tout est programmé on-device).

> Le code est prêt : `src/lib/native.ts` programme les prières via
> `@capacitor/local-notifications`. Sur le web, ce code est ignoré
> (`isNative() === false`), donc la PWA continue de marcher comme avant.

## Pré-requis

- **Android** : [Android Studio](https://developer.android.com/studio) + JDK 17.
- **iOS** : un **Mac** avec Xcode (obligatoire, Apple ne permet pas de builder iOS sous Windows).

## Mettre en place Android (1ʳᵉ fois)

```bash
cd niyyah-app
npm run build            # génère dist/
npx cap add android      # crée le dossier android/
```

### Ajouter le son de l'adhan

1. Place ton fichier audio ici (nom en minuscules, sans espaces) :
   `android/app/src/main/res/raw/adhan.mp3`
2. C'est ce nom (`adhan`) qui est référencé par le canal de notification dans
   `src/lib/native.ts`.

### Lancer

```bash
npx cap sync             # copie le build + plugins dans android/
npx cap open android     # ouvre Android Studio → ▶ Run sur ton tél/émulateur
```

Dans l'app : *Réglages* → règle ta ville → l'app programme automatiquement les
prières. À l'heure dite, la notification tombe **avec l'adhan**, app fermée.

## À chaque modification du code web

```bash
npm run build && npx cap sync
```

## iOS (sur Mac)

```bash
npm run build
npx cap add ios
npx cap open ios         # Xcode : ajouter adhan.caf/.mp3 au bundle, signer, Run
```
Sur iOS, le son se met dans le bundle de l'app et se référence par nom de
fichier (ex. `adhan.wav`). iOS limite la durée du son de notification à ~30 s.

## Notes importantes

- **Son de canal Android** : le son d'un canal est fixé à sa **création**. Si tu
  changes le fichier plus tard, incrémente l'`id` du canal dans `native.ts`
  (ex. `adhan2`) ou réinstalle l'app, sinon Android garde l'ancien son.
- **Programmation glissante** : on programme 7 jours à l'avance ; l'app
  reprogramme à chaque ouverture. (Évolution possible : un service en arrière-plan
  pour reprogrammer sans ouvrir l'app.)
- **Publication** : Android → Google Play (compte développeur 25 $ unique).
  iOS → App Store (99 $/an). Ces comptes sont à créer par toi.
- Tu n'as **pas besoin** du serveur Web Push pour la version native : les
  notifications natives suffisent. Le serveur reste utile pour la version **web**
  (PWA) installée depuis le navigateur.
