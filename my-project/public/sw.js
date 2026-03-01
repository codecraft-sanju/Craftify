// public/sw.js

// 1. Listen for background push notifications
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {};

  const title = data.title || "Giftomize Notification";
  const options = {
    body: data.body || "You have a new update.",
    icon: "/vite.svg", // Aap yaha apne logo ka path daal sakte hain
    badge: "/vite.svg", // Chota icon jo Android status bar me dikhta hai
    data: {
      url: data.url || "/" // Backend se humne '/my-shop' bheja hai
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 2. Handle click on the notification
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      // URL jaha redirect karna hai
      const urlToOpen = new URL(event.notification.data.url, self.location.origin).href;

      // Agar tab pehle se open hai, toh usko focus karo
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Agar tab close hai, toh naya window open karo
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});