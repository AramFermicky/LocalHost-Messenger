// Этот файл должен находиться в корне проекта для работы Firebase Cloud Messaging
// Не изменяйте его, если не уверены в том, что делаете

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Ваш Firebase конфиг
const firebaseConfig = {
  apiKey: "AIzaSyCPjjwqSk6EG6k3QZ6Yf5UzqDo5LEfo6GY",
  authDomain: "localhost-mini.firebaseapp.com",
  databaseURL: "https://localhost-mini-default-rtdb.firebaseio.com",
  projectId: "localhost-mini",
  storageBucket: "localhost-mini.firebasestorage.app",
  messagingSenderId: "465050030132",
  appId: "1:465050030132:web:49058758de3b054379ba61"
};

try {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Обработка фоновых уведомлений
  messaging.onBackgroundMessage(payload => {
    console.log('[service worker] Получено сообщение ', payload);
    const notificationTitle = 'Новое сообщение';
    const notificationOptions = {
      body: payload.data.text,
      icon: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💬</text></svg>',
      badge: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💬</text></svg>'
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
  });
} catch (error) {
  console.error("Ошибка инициализации сервис-воркера:", error);
}