self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({
        type: 'window',
      })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url == '/' && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow('/');
      })
  );
});

self.addEventListener('push', function (event) {
  const data = event.data.json();
  const title = data.title;
  const options = {
    body: data.body,
    icon: data.icon,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
