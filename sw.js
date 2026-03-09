const cacheName = 'distrito-zero-v1'; // Mude para v2 quando fizer grandes mudanças
const assets = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'https://cdn-icons-png.flaticon.com/512/626/626610.png',
  'https://fonts.googleapis.com/css2?family=Permanent+Marker&display=swap'
];

// Instalação: Salva os arquivos essenciais no cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
      console.log('SW: Cacheando arquivos essenciais');
      return cache.addAll(assets);
    })
  );
});

// Ativação: Limpa caches de versões anteriores
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== cacheName) {
          console.log('SW: Removendo cache antigo', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// Busca (Fetch): Tenta o cache primeiro, se não tiver, vai na rede
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request).catch(() => {
        // Opcional: Retornar uma página offline caso a rede falhe e não tenha cache
        console.log('SW: Falha na rede e sem cache para:', e.request.url);
      });
    })
  );
});