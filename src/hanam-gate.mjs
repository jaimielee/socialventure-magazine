// The owner requested direct-link access on 2026-11-10.
// Keep the current assets, routing normalization and board response headers.
const boardHeaders = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
};
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let path;
    try {
      path = decodeURIComponent(url.pathname).replace(/\\/g, '/').replace(/\/{2,}/g, '/');
    } catch {
      return new Response('Bad request', { status: 400 });
    }
    const segments = [];
    for (const segment of path.split('/')) {
      if (segment === '..') segments.pop();
      else if (segment && segment !== '.') segments.push(segment);
    }
    path = '/' + segments.join('/');
    if (path !== '/hanam' && path !== '/hanam.html' && !path.startsWith('/hanam/')) {
      return env.ASSETS.fetch(request);
    }
    if (path === '/hanam/login') {
      return new Response(null, { status: 303, headers: { ...boardHeaders, Location: '/hanam/' } });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: boardHeaders });
    }
    const response = await env.ASSETS.fetch(request);
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(boardHeaders)) headers.set(key, value);
    return new Response(response.body, { status: response.status, headers });
  },
};
