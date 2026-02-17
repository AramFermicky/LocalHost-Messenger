const CACHE_NAME = 'localhost-mini-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/auth.html',
  '/chat.html',
  '/login.html',
  '/register.html',
  '/profile.html',
  '/settings.html',
  '/style.css',
  '/firebase-messaging-sw.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем кэшированный ресурс, если он есть
        if (response) {
          return response;
        }
        
        // Иначе запрашиваем с сервера
        return fetch(event.request).then(
          response => {
            // Проверяем, валиден ли ответ
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Кэшируем ответ для будущих запросов
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        );
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});