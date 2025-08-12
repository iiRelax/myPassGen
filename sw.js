/**
 * Service Worker pour PassGen PWA
 */

const CACHE_NAME = 'passgen-v1.0.0';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles.css',
    '/js/app.js',
    '/js/PasswordGenerator.js',
    '/manifest.json',
    'https://cdn.jsdelivr.net/npm/zxcvbn@4.4.2/dist/zxcvbn.js'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installation en cours...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Mise en cache des ressources statiques');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Installation terminée');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Erreur lors de l\'installation:', error);
            })
    );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activation en cours...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('Service Worker: Suppression de l\'ancien cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activation terminée');
                return self.clients.claim();
            })
    );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes non-GET
    if (event.request.method !== 'GET') {
        return;
    }

    // Ignorer les requêtes vers des domaines externes (sauf zxcvbn)
    const url = new URL(event.request.url);
    const isExternal = url.origin !== self.location.origin;
    const isZxcvbn = url.hostname === 'cdn.jsdelivr.net' && url.pathname.includes('zxcvbn');
    
    if (isExternal && !isZxcvbn) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Retourner la version mise en cache si disponible
                if (cachedResponse) {
                    console.log('Service Worker: Ressource servie depuis le cache:', event.request.url);
                    return cachedResponse;
                }

                // Sinon, faire une requête réseau
                console.log('Service Worker: Requête réseau pour:', event.request.url);
                return fetch(event.request)
                    .then((response) => {
                        // Vérifier si la réponse est valide
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Cloner la réponse pour la mettre en cache
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('Service Worker: Erreur réseau:', error);
                        
                        // Retourner une page d'erreur hors ligne pour l'HTML
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return new Response(`
                                <!DOCTYPE html>
                                <html lang="fr">
                                <head>
                                    <meta charset="UTF-8">
                                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                    <title>PassGen - Hors ligne</title>
                                    <style>
                                        body {
                                            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                            display: flex;
                                            flex-direction: column;
                                            align-items: center;
                                            justify-content: center;
                                            min-height: 100vh;
                                            margin: 0;
                                            background: #f8fafc;
                                            color: #1e293b;
                                            text-align: center;
                                            padding: 2rem;
                                        }
                                        .icon { font-size: 4rem; margin-bottom: 1rem; }
                                        h1 { margin-bottom: 0.5rem; color: #2563eb; }
                                        p { margin-bottom: 2rem; color: #64748b; }
                                        button {
                                            background: #2563eb;
                                            color: white;
                                            border: none;
                                            padding: 1rem 2rem;
                                            border-radius: 8px;
                                            cursor: pointer;
                                            font-size: 1rem;
                                        }
                                        button:hover { background: #1d4ed8; }
                                    </style>
                                </head>
                                <body>
                                    <div class="icon">🔐</div>
                                    <h1>PassGen</h1>
                                    <p>L'application est temporairement hors ligne.<br>
                                    Vos données locales et l'historique restent disponibles.</p>
                                    <button onclick="window.location.reload()">
                                        Réessayer
                                    </button>
                                </body>
                                </html>
                            `, {
                                headers: {
                                    'Content-Type': 'text/html; charset=utf-8'
                                }
                            });
                        }
                        
                        throw error;
                    });
            })
    );
});

// Gestion des messages du client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Notification de mise à jour disponible
self.addEventListener('updatefound', () => {
    console.log('Service Worker: Mise à jour disponible');
    
    // Notifier tous les clients connectés
    self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
            client.postMessage({
                type: 'UPDATE_AVAILABLE',
                message: 'Une nouvelle version de PassGen est disponible'
            });
        });
    });
});

// Gestion des erreurs non capturées
self.addEventListener('error', (event) => {
    console.error('Service Worker: Erreur non capturée:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Service Worker: Promesse rejetée:', event.reason);
    event.preventDefault();
});
