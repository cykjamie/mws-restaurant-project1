const appName = "restaurant-reviews"
const staticCacheName = appName + "-v1.0";

const contentImgsCache = appName + "-images";

var allCaches = [
    staticCacheName,
    contentImgsCache
  ];

/** At Service Worker Install time, cache all static assets */
self.addEventListener('install', function(event) {
    event.waitUntil(
      caches.open(staticCacheName).then(function(cache) {
        return cache.addAll([
          '/', // this caches index.html
          '/restaurant.html',
          '/css/styles.css',
          '/js/dbhelper.js',
          //'/js/secret.js',
          '/js/main.js',
          '/js/restaurant_info.js',
          'js/register.js', // In the video I forgot to add this newly created file
          'data/restaurants.json'
          // add other static assets here like logos, svg icons or any
          // other asset needed for your app UI 
          // (Don't add restaurant images, as they are not part of your
          // application's UI)
        ]);
      })
    );
  });

/** At Service Worker Activation, Delete previous caches, if any */
self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith(appName) &&
                   !allCaches.includes(cacheName);
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });

/** Hijack fetch requests and respond accordingly */
self.addEventListener('fetch', function(event) {
  const requestUrl = new URL(event.request.url);

  // only highjack request made to our app (not mapbox maps or leaflet, for example)
  if (requestUrl.origin === location.origin) {

    // Since requests made to restaurant.html have search params (like ?id=1), the url can't be used as the
    // key to access the cache, so just respondWith restaurant.html if pathname startsWith '/restaurant.html'
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
      event.respondWith(caches.match('/restaurant.html'));
      return; // Done handling request, so exit early.
    }
  }

    // Default behavior: respond with cached elements, if any, falling back to network.
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  });
