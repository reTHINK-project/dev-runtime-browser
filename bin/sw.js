(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.sw = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

var PRECACHE = 'precache-v1';
var RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
var PRECACHE_URLS = ['index.html', './', // Alias for index.html
'styles.css', '../../styles/main.css', 'demo.js'];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', function (event) {
  // event.waitUntil(
  //   caches.open(PRECACHE)
  //     .then(cache => cache.addAll(PRECACHE_URLS))
  //     .then(self.skipWaiting())
  // );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', function (event) {
  var currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(caches.keys().then(function (cacheNames) {
    return cacheNames.filter(function (cacheName) {
      return !currentCaches.includes(cacheName);
    });
  }).then(function (cachesToDelete) {
    return Promise.all(cachesToDelete.map(function (cacheToDelete) {
      return caches.delete(cacheToDelete);
    }));
  }).then(function () {
    return self.clients.claim();
  }));
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', function (event) {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(caches.match(event.request).then(function (cachedResponse) {
      if (cachedResponse) {
        return cachedResponse;
      }

      return caches.open(RUNTIME).then(function (cache) {
        return fetch(event.request).then(function (response) {
          // Put a copy of the response in the runtime cache.
          return cache.put(event.request, response.clone()).then(function () {
            return response;
          });
        });
      });
    }));
  }
});

},{}]},{},[1])(1)
});

//# sourceMappingURL=sw.js.map
