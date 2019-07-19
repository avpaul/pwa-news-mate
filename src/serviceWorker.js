// cache files and requests
const cacheName = "files";
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll([
        "/assets/logo_200.png",
        "/index.js",
        "/favicon-16x16.png",
        "../favicon-32x32.png",
        "https://fonts.googleapis.com/css?family=Comfortaa:300,400,500,600,700&display=swap"
      ]);
    })
  );
});

// return requests with cached resources
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) {
        return response;
      }
      const requestToCache = event.request.clone();
      return fetch(requestToCache).then(response => {
        if (!response || response.status !== 200) {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(cacheName).then(cache => {
          cache.put(requestToCache, responseToCache);
        });
        return response;
      });
    })
  );
});

// Add an event listener for push API events
self.addEventListener("push", event => {
  event.waitUntil(
    self.registration.showNotification(
      "Push notifications changing your business!",
      { "icon": "/android-chrome-192x192.png" }
    )
  );
});
