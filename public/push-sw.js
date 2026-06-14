/* Service worker dédié aux notifications push Niyyah (scope /push/).
   Séparé du service worker PWA (Workbox) pour ne pas interférer. */

self.addEventListener("push", (event) => {
  let data = { title: "Niyyah", body: "" };
  try {
    if (event.data) data = event.data.json();
  } catch (e) {
    data.body = event.data ? event.data.text() : "";
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Niyyah", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "niyyah-push",
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) return client.focus();
      }
      return self.clients.openWindow("/");
    })
  );
});
