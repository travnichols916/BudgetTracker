const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

const FILES_TO_CACHE = [
    '/',
    './index.html',
    './css/styles.css',
    './js/index.js',
    './js/idb.js',
    './manifest.json',
    './icons/icon-512x512.png',
    './icons/icon-384x384.png',
    './icons/icon-192x192.png',
    './icons/icon-152x152.png',
    './icons/icon-144x144.png',
    './icons/icon-128x128.png',
    './icons/icon-96x96.png',
    './icons/icon-72x72.png',
];
// Cache resources
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME);
            return cache.addAll(FILES_TO_CACHE)
        })
    )
self.skipWaiting();
});
//activate service worker and delete outdated cache
self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (keyList) {
            // `keyList` contains all cache names under your username.github.io
            // filter out ones that has this app prefix to create keeplist
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeeplist.push(CACHE_NAME);

            return Promise.all(keyList.map(function (key, i) {
                if (cacheKeeplist.indexOf(key) === -1) {
                    console.log('deleting cache : ' + keyList[i] );
                    return caches.delete(keyList[i]);
                }
            }));
        })
    );
    self.clients.claim();
});
// Respond with cached resources
self.addEventListener('fetch', function (e) {
    console.log('fetch request : ' + e.request.url);
    // e.respondWith(
    //     caches.open(e.request).then(function (request) {
    //         return fetch (e.request).then((response)=>{
    //             return response
    //         }) .catch((error) => {caches.match(e.request)})
            
            
    //         // if (request) { // if cache is available, respond with cache
    //         //     console.log('responding with cache : ' + e.request.url);
    //         //     return request
    //         // } else {       // if there are no cache, try fetching request
    //         //     console.log('file is not cached, fetching : ' + e.request.url);
    //         //     return fetch(e.request)
    //         // }

    //     })
    // )
    if (e.request.url.includes('/')) {
        e.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return fetch(e.request)
                    .then(response => {
                        if (response.status === 200) {
                            cache.put(e.request.url, response.clone());
                        }
                        return response;
                    })
                    .catch (err => {
                        return cache.match(e.request);
                    })
            }).catch(err => console.log(err))
        )
        return
    }

    e.respondWith(
        fetch(e.request).catch(() => {
            return caches.match(e.request).then(response => {
                if (response) {
                    return response;
                } else if (e.request.headers.get("accept").include("text/html")) {
                    return caches.match("/")
                }
            })
        })
    )
});