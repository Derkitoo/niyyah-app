// Notifications locales NATIVES (Capacitor) — adhan avec son personnalisé,
// déclenchées sur l'appareil même app fermée / écran verrouillé.
//
// Sur le web, `isNative()` renvoie false et rien n'est exécuté.

import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import type { PrayerSettings } from "../state/store";
import { buildPrayerEvents } from "./prayer";

export const isNative = (): boolean => Capacitor.isNativePlatform();

/** Programme les prières des 7 prochains jours en notifications locales natives. */
export async function scheduleNativePrayers(p: PrayerSettings, withAdhan: boolean): Promise<void> {
  if (!isNative()) return;

  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== "granted") return;

  // (Android) canal avec son adhan — le son vient de res/raw/adhan.(mp3|wav)
  try {
    await LocalNotifications.createChannel({
      id: "adhan",
      name: "Adhan",
      description: "Appel à la prière",
      importance: 5,
      visibility: 1,
      sound: withAdhan ? "adhan" : undefined,
    });
  } catch {
    /* iOS : pas de canaux, le son est défini par notification */
  }

  // annule les notifications déjà programmées
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length) {
    await LocalNotifications.cancel({
      notifications: pending.notifications.map((n) => ({ id: n.id })),
    });
  }

  // programme les prochaines (limite raisonnable)
  const events = (await buildPrayerEvents(p, 7)).slice(0, 60);
  if (!events.length) return;

  await LocalNotifications.schedule({
    notifications: events.map((e, i) => ({
      id: i + 1,
      title: `Niyyah — ${e.name}`,
      body: `C'est l'heure de ${e.name} 🕌`,
      schedule: { at: new Date(e.ts) },
      channelId: "adhan",
      sound: withAdhan ? "adhan" : undefined,
    })),
  });
}
