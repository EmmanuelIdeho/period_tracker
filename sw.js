//Note that when updating any of the resources listed in the APP_STATIC_RESOURCES array, 
//the only constant or function that must be updated within this service worker is the value of VERSION.
//However, it is a good practice to update the version number as it makes it easier for devs, including yourself, to see which version of the service worker is currently running in the browser.
//Updating VERSION is important when making changes to any application resource, including the CSS, HTML, and JS code, and image assets. 
//The version number, or any change to the service worker file, is the only way to force an update of the app for your users.
const VERSION = "v1";

const CACHE_NAME = `period-tracker-${VERSION}`;

const APP_STATIC_RESOURCES = [
    "/",
    "/cycle.html",
    "/style.css",
    "/app.js",
    "/android-chrome-512x512.png",
    "site.webmanifest",
  ];

//The `install` event happens when the app is used for the first time, or when a new version of the service worker is detected by the browser.
//This function will listen for this event, filling the cache with the PWA's static resources upon installation.
self.addEventListener("install", (e) => {
    e.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        cache.addAll(APP_STATIC_RESOURCES);
        })(),
    );
});

//We use the `activate` event to delete old caches to avoid running out of space. We iterate over named Cache objects, deleting all but the current one, and then set the service worker as the controller for the PWA.
self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
        const names = await caches.keys();
        await Promise.all(
            names.map((name) => {
            if (name !== CACHE_NAME) {
                return caches.delete(name);
            }
            }),
        );
        await clients.claim();
        })(),
);
});


//We can take advantage of the `fetch` event, to prevent an installed PWA from making requests if the user is online.
//Listening to the fetch event makes it possible to intercept all requests and respond with cached responses instead of going to the network.
self.addEventListener("fetch", (event) => {
    // when seeking an HTML page
    if (event.request.mode === "navigate") {
      // Return to the cycle.html page
      event.respondWith(caches.match("/"));
      return;
    }
  
    // For every other request type
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request.url);
        if (cachedResponse) {
          // Return the cached response if it's available.
          return cachedResponse;
        }
        // Respond with a HTTP 404 response status.
        return new Response(null, { status: 404 });
      })(),
    );
  });