import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Предварительное кэширование ресурсов
precacheAndRoute(self.__WB_MANIFEST);

// Стратегия кэширования для API
registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate()
);

// Стратегия кэширования для статических ресурсов
registerRoute(
  ({request}) => request.destination === 'script' ||
                 request.destination === 'style' ||
                 request.destination === 'image',
  new StaleWhileRevalidate()
);

//const CACHE_NAME = 'my-app-cache-v1';
//const OFFLINE_URL = '/offline.html';
//const urlsToCache = [
//  '/',
//  '/index.html',
//  '/static/js/main.chunk.js',
//  '/static/js/0.chunk.js',
//  '/static/js/bundle.js',
//  '/static/css/main.chunk.css',
//  '/manifest.json',
//  '/favicon.ico',
//  OFFLINE_URL
//];
//
//self.addEventListener('install', (event) => {
//  event.waitUntil(
//    caches.open(CACHE_NAME)
//      .then((cache) => {
//        console.log('Opened cache');
//        return cache.addAll(urlsToCache);
//      })
//  );
//});
//
//self.addEventListener('fetch', (event) => {
//  if (event.request.mode === 'navigate') {
//    event.respondWith(
//      fetch(event.request)
//        .catch(() => {
//          return caches.match(OFFLINE_URL)
//            .then((response) => {
//              if (response) {
//                return response;
//              }
//              return new Response('Вы находитесь в офлайн-режиме', {
//                status: 503,
//                statusText: 'Service Unavailable',
//                headers: new Headers({ 'Content-Type': 'text/plain' })
//              });
//            });
//        })
//    );
//  } else {
//    event.respondWith(
//      caches.match(event.request)
//        .then((response) => {
//          return response || fetch(event.request)
//            .catch(() => {
//              return new Response('Нет подключения к сети', {
//                status: 503,
//                statusText: 'Service Unavailable',
//                headers: new Headers({ 'Content-Type': 'text/plain' })
//              });
//            });
//        })
//    );
//  }
//});
//
//self.addEventListener('activate', (event) => {
//  const cacheWhitelist = [CACHE_NAME];
//  event.waitUntil(
//    caches.keys().then((cacheNames) => {
//      return Promise.all(
//        cacheNames.map((cacheName) => {
//          if (cacheWhitelist.indexOf(cacheName) === -1) {
//            return caches.delete(cacheName);
//          }
//        })
//      );
//    })
//  );
//});