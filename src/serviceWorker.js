// cache files and requests
const cacheName = "files";
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      cache.addAll([
        "/assets/logo_200.png",
        "/index.js",
        "/favicon-16x16.png",
        "/favicon-32x32.png",
        "/android-chrome-192x192.png",
        "https://fonts.googleapis.com/css?family=Comfortaa:300,400,500,600,700&display=swap"
      ]);
    })
  );
});

// return requests with cached resources
self.addEventListener("fetch", event => {
  // event.respondWith(
  //   caches.match(event.request).then(response => {
  //     if (response) {
  //       return response;
  //     }
  //     const requestToCache = event.request.clone();
  //     return fetch(requestToCache).then(response => {
  //       if (!response || response.status !== 200) {
  //         return response;
  //       }

  //       const responseToCache = response.clone();
  //       caches.open(cacheName).then(cache => {
  //         cache.put(requestToCache, responseToCache);
  //       });
  //       return response;
  //     });
  //   })
  // );
  event.respondWith(
    caches.open(cacheName).then(cache =>
      cache.match(event.request).then(response => {
        if (response) {
          return response;
        }
      })
    )
  );
  event.waitUntil(updateCache(event.request.clone()));
});

// Add an event listener for push API events
self.addEventListener("push", event => {
  event.waitUntil(
    self.registration.showNotification(
      "Push notifications changing your business!"
    )
  );
});

// After using cached resource to respond to a request
// update the cached resource

const updateCache = request => {
  return caches.open(cacheName).then(cache => {
    return fetch(request).then(response => {
      return cache.put(request, response.clone()).then(() => {
        return response;
      });
      // check if we have a cached version of the request to notify the user of updates
    });
  });
};
