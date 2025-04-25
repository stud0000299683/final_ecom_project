module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{html,js,css,json,ico,png,jpg,jpeg,gif,svg,woff,woff2,eot,ttf}'
  ],
  swDest: 'build/service-worker.js',
  clientsClaim: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 дней
        }
      }
    },
    {
      urlPattern: new RegExp('^https://your-api-domain.com'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60 // 5 минут
        }
      }
    }
  ]
};