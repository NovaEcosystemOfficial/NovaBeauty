importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.0.0/firebase-messaging-compat.js");

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

async function initializeFirebaseMessaging() {
  const response = await fetch("/firebase-messaging-sw-config.json", { cache: "no-store" });

  if (!response.ok) {
    return null;
  }

  const config = await response.json();

  if (!config.apiKey || !config.projectId || !config.messagingSenderId || !config.appId) {
    return null;
  }

  firebase.initializeApp(config);
  return firebase.messaging();
}

initializeFirebaseMessaging()
  .then((messaging) => {
    if (!messaging) {
      return;
    }

    messaging.onBackgroundMessage((payload) => {
      const notification = payload.notification || {};
      const data = payload.data || {};
      const title = notification.title || data.title || "NovaBeauty";
      const body = notification.body || data.description || "";
      const url = data.action || "/notifications";

      self.registration.showNotification(title, {
        body,
        icon: "/icons/icon-192.png",
        badge: "/icons/icon-192.png",
        data: { url }
      });
    });
  })
  .catch(() => undefined);

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/notifications";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      return self.clients.openWindow(url);
    })
  );
});
