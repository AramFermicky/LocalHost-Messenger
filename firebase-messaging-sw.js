importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js');

const firebaseConfig = {
  apiKey: "AIzaSyCPjjwqSk6EG6k3QZ6Yf5UzqDo5LEfo6GY",
  authDomain: "localhost-mini.firebaseapp.com",
  databaseURL: "https://localhost-mini-default-rtdb.firebaseio.com",
  projectId: "localhost-mini",
  storageBucket: "localhost-mini.firebasestorage.app",
  messagingSenderId: "465050030132",
  appId: "1:465050030132:web:49058758de3b054379ba61"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Обработка фоновых уведомлений
messaging.onBackgroundMessage((payload) => {
  console.log('[service worker] Получено сообщение ', payload);
  const notificationTitle = 'Новое сообщение';
  const notificationOptions = {
    body: payload.data.text || 'У вас новое сообщение',
    icon: 'icons/icon-192x192.png',
    badge: 'icons/icon-192x192.png'
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Добавляем обработку кэширования для FCM
self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  // Перенаправляем пользователя в чат при клике на уведомление
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow('/chat.html');
      }
    })
  );
});