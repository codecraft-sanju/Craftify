// public/sw.js
self.addEventListener('push', function(event) {
    const data = event.data ? event.data.json() : {};
    
    const options = {
        body: data.body || 'Aapko ek naya update mila hai!',
        icon: '/gifticon.svg', // Aap yahan apna logo path dal sakte hain
        badge: '/vite.svg',
        data: {
            url: data.url || '/my-shop'
        }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Giftomize Update', options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // Agar window pehle se open hai toh usko focus karo
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes(event.notification.data.url) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Agar open nahi hai toh naya tab kholo
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});