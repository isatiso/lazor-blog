var showNotification = true;
var VERSION = '1.0.11';
var NEED_CACHE = false;

self.addEventListener('install', function (event) {
    self.skipWaiting();
    console.log(self);
});

self.addEventListener('activate', function (event) {
    self.skipWaiting();
    // const publicKey = 'BGQA2WKutj-hCwIWzS576InMsfDPVSDKk-dQENMqykDe-UDKdNYuSBvoTEWmbpzRvrrcYZxKI5LuBZutAfo8OTo';
    // const applicationServerKey = urlB64ToUint8Array(publicKey);
    // self.registration.pushManager.subscribe({
    //     userVisibleOnly: true,
    //     applicationServerKey: applicationServerKey
    // }).then(
    //     PushSubscription => {});
    console.log('Activate event:', event);
});

self.addEventListener('push', function (event) {
    console.log('Push event:', event);
    console.log(self);
    const options = {
        dir: 'auto',
        lang: 'utf-8',
        tag: 'banlangen',
        icon: '/assets/xiaohei.png',
        body: '你好哈， push'
    };
    const date = new Date().toLocaleString();
    self.registration.showNotification(date, options);
});

self.addEventListener('fetch', event => {
    if (event.request.method != 'GET') {
        return;
    }

    let bundle_regex = /(\/(.*)\.(js|ttf|woff2|png|ico|jpg|gif))/;
    let forever_regex = /(\/(.*)\.(ttf|woff2))/;
    var this_url = new URL(event.request.url);
    if (this_url.protocol !== 'https:') {
        return;
    }
    var br;
    if (NEED_CACHE && (br = bundle_regex.exec(this_url.pathname))) {
        // console.log(br[2] + '.' + br[3]);
        let cache_name;
        event.respondWith(async function () {
            if ((br = forever_regex.exec(this_url.pathname))) {
                cache_name = 'forever';
            } else {
                cache_name = VERSION;
            }
            const cache = await caches.open(cache_name);
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
                return cachedResponse;
            }

            return fetch(event.request).then(
                function (r) {
                    caches.open(cache_name).then(function (cache) {
                        cache.put(event.request, r);
                    });
                    return r.clone();
                });
        }());
        return;
    }

    fragement = this_url.pathname.split('/').slice(1);
    switch (fragement[0]) {
        case 'inner':
            let res_data = {};
            switch (fragement[1]) {
                case 'callnotification':
                    if (showNotification) {
                        event.respondWith(
                            new Response('{"asd": 123}', {
                                headers: { 'Content-type': 'application/json' }
                            }));
                        const notice = JSON.parse(decodeURIComponent(fragement.slice(4).join('')));
                        const options = {
                            dir: 'auto',
                            lang: 'utf-8',
                            badge: '/assets/xiaohei.png',
                            icon: '/assets/xiaohei.png',
                            body: notice['message'].join('\n'),
                            data: notice
                        };
                        self.registration.showNotification(notice['title'], options);
                    }
                    break;

                case 'set-notice-toggle':
                    const notice = JSON.parse(decodeURIComponent(fragement.slice(4).join('')));
                    showNotification = notice.notice;

                    res_data = {
                        notice: showNotification
                    };

                    event.respondWith(
                        new Response(JSON.stringify(res_data), {
                            headers: { 'Content-type': 'application/json' }
                        }));
                    console.log(showNotification);
                    break;

                case 'get-notice-toggle':
                    res_data = {
                        notice: showNotification
                    };

                    event.respondWith(
                        new Response(JSON.stringify(res_data), {
                            headers: { 'Content-type': 'application/json' }
                        }));
                    console.log(showNotification);
                    break;

                default:
                    break;
            }
            break;

        case 'middle':
            break;
    }
});

self.addEventListener('notificationclick', function (event) {
    console.log('[Service Worker] Notification click Received.', event);

    event.notification.close();

    var focus_list = event.notification.data.focus;

    event.waitUntil(
        clients.matchAll({
            includeUncontrolled: true,
            type: 'all'
        }).then(
            clientList => {
                for (const client of clientList) {
                    var fragement = splitUrl(client.url);
                    if (matchFocus(focus_list, fragement.slice(2))) {
                        return client.focus();
                    }
                }
                for (const client of clientList) {
                    var fragement = splitUrl(client.url);
                    if (fragement[2] === 'chat' || fragement[2] === 'chat-list') {
                        return client.focus();
                    }
                }
            })
    );
});

function splitUrl(url) {
    var fragement = url.split('://');
    if (fragement.length > 1) {
        fragement = fragement.slice(0, 1).concat(fragement[1].split('/'));
    }
    return fragement;
}

function matchFocus(focus_list, match_list) {
    if (match_list.length < focus_list.length) {
        return false;
    }
    for (i = 0; i < focus_list.length; i++) {
        if (match_list[i] !== focus_list[i]) {
            return false;
        }
    }
    return true;
}

function urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

console.log('service worker');