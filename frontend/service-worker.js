import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

// Предварительное кэширование ресурсов
precacheAndRoute(self.__WB_MANIFEST);

// Кэширование для API
registerRoute(
  ({url}) => url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate()
);

// Кэширование для статических ресурсов
registerRoute(
  ({request}) => request.destination === 'script' ||
                 request.destination === 'style' ||
                 request.destination === 'image',
  new StaleWhileRevalidate()
);
