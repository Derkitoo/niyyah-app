// Notifications locales (best-effort).
//
// Limite honnête de la plateforme web : sans backend Web Push, on ne peut pas
// garantir un rappel quand l'app est complètement fermée. Ici les rappels
// s'affichent quand l'app est ouverte / au premier plan. Pour des rappels
// garantis app fermée → ajouter un backend Web Push (étape suivante).

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function permissionState(): NotificationPermission {
  if (!notificationsSupported()) return "denied";
  return Notification.permission;
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return "denied";
  if (Notification.permission !== "default") return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

export function showLocalNotification(title: string, body: string): void {
  if (!notificationsSupported() || Notification.permission !== "granted") return;
  const opts: NotificationOptions = {
    body,
    icon: "icon-192.png",
    badge: "icon-192.png",
    tag: "niyyah-fast",
  };
  // Préférer la notification via le service worker (meilleur comportement en PWA).
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .getRegistration()
      .then((reg) => {
        if (reg) reg.showNotification(title, opts);
        else new Notification(title, opts);
      })
      .catch(() => {
        try { new Notification(title, opts); } catch { /* ignore */ }
      });
  } else {
    try { new Notification(title, opts); } catch { /* ignore */ }
  }
}
