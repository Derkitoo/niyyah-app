// Client Web Push — s'abonne au serveur Niyyah pour des rappels garantis
// (même app fermée). Utilise un service worker dédié (scope /push/).

const SW_URL = "/push-sw.js";
const SCOPE = "/push/";

export function pushSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    typeof window !== "undefined" &&
    "PushManager" in window
  );
}

const trim = (u: string) => u.replace(/\/+$/, "");

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function getReg(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration(SCOPE);
  return existing ?? (await navigator.serviceWorker.register(SW_URL, { scope: SCOPE }));
}

export async function getPushStatus(): Promise<boolean> {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.getRegistration(SCOPE);
  const sub = await reg?.pushManager.getSubscription();
  return !!sub;
}

export async function subscribePush(
  server: string,
  prefs: { weekdays: number[]; reminderTime: string }
): Promise<void> {
  if (!pushSupported()) throw new Error("Notifications push non supportées sur cet appareil.");
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Permission de notification refusée.");

  const reg = await getReg();
  await navigator.serviceWorker.ready.catch(() => undefined);

  const keyRes = await fetch(`${trim(server)}/vapidPublicKey`);
  if (!keyRes.ok) throw new Error("Serveur injoignable.");
  const { publicKey } = await keyRes.json();

  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });

  const res = await fetch(`${trim(server)}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: sub, prefs }),
  });
  if (!res.ok) throw new Error("Échec de l'enregistrement sur le serveur.");
}

/** Envoie au serveur le planning des prières (timestamps absolus). */
export async function sendPrayerSchedule(
  server: string,
  events: { ts: number; name: string }[]
): Promise<void> {
  const reg = await navigator.serviceWorker.getRegistration(SCOPE);
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) throw new Error("Abonne-toi d'abord aux notifications serveur.");
  const res = await fetch(`${trim(server)}/prayer-schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint: sub.endpoint, events }),
  });
  if (!res.ok) throw new Error("Échec de la programmation côté serveur.");
}

export async function unsubscribePush(server: string): Promise<void> {
  const reg = await navigator.serviceWorker.getRegistration(SCOPE);
  const sub = await reg?.pushManager.getSubscription();
  if (!sub) return;
  try {
    await fetch(`${trim(server)}/unsubscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    });
  } catch {
    /* on désabonne quand même côté client */
  }
  await sub.unsubscribe();
}
