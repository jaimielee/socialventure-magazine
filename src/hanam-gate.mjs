import { mastheadMarkup, bylineMarkup } from './character-markup.mjs';
import { css, js, characterAssets } from './generated/site-design.mjs';
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
    const characterAsset = characterAssets[path];
    if (characterAsset) {
      if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', {status:405});
      return new Response(request.method === 'HEAD' ? null : Uint8Array.from(atob(characterAsset.base64), char => char.charCodeAt(0)), {headers:{
        'Content-Type':characterAsset.type, 'Cache-Control':'public, max-age=86400', 'X-Content-Type-Options':'nosniff'
      }});
    }
    const designAsset = path === '/design/site-20261110-brand.css' ? [css, 'text/css']
      : path === '/design/site-20261110-brand.js' ? [js, 'application/javascript'] : null;
    if (designAsset) {
      if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', {status:405});
      return new Response(request.method === 'HEAD' ? null : designAsset[0], {headers:{
        'Content-Type':designAsset[1] + '; charset=utf-8', 'Cache-Control':'public, max-age=3600',
        'X-Content-Type-Options':'nosniff'
      }});
    }
    const isBoard = path === '/hanam' || path === '/hanam.html' || path.startsWith('/hanam/');
    if (!isBoard) return decorate(await fetchAssets(request, env), request, path);
    if (path === '/hanam/login') {
      return new Response(null, { status: 303, headers: { ...boardHeaders, Location: '/hanam/' } });
    }
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: boardHeaders });
    }
    const response = await fetchAssets(request, env);
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(boardHeaders)) headers.set(key, value);
    return decorate(new Response(response.body, { status: response.status, headers }), request, path);
  },
};

// Inject a shared theme while retaining the complete existing Cloudflare asset collection.
function decorate(response, request, path) {
  if (request.method !== 'GET' || response.status !== 200 || !response.headers.get('Content-Type')?.includes('text/html') || path === '/admin' || path.startsWith('/admin/')) return response;
  const page = path.split('/').filter(Boolean)[0] || 'home';
  return new HTMLRewriter()
    .on('html', {element(el) {el.setAttribute('data-sv-design', '20261110'); el.setAttribute('data-sv-page', page);}})
    .on('body > .min-h-screen > header > a', {element(el) {if(el.getAttribute('href') === '/') el.setInnerContent('소셜가 제미씨의 일일');}})
    .on('main a.group[data-note-modal] h2', {element(el) {if (page === 'home') el.tagName = 'h3';}})
    .on('main > section:first-child', {element(el) {if(page === 'home') el.setInnerContent(mastheadMarkup, {html:true});}})
    .on('a.group[data-note-modal]', {element(el) {el.append(bylineMarkup, {html:true});}})
    .on('[data-insight-card] > div > div', {element(el) {el.append(bylineMarkup, {html:true});}})
    .on('main > header', {element(el) {if (['insights','articles','collections'].includes(page) && path.split('/').filter(Boolean).length > 1) el.append(bylineMarkup, {html:true});}})
    .on('[data-jemissi]', {element(el) {el.remove();}})
    .on('link[rel="icon"]', {element(el) {el.setAttribute('type', 'image/png');el.setAttribute('sizes', '64x64');el.setAttribute('href', '/character/jemissi-icon-v1.png');}})
    .on('[data-sv-theme]' , {element(el) {el.remove();}})
    .on('head', {element(el) {el.append('<link rel="stylesheet" href="/design/site-20261110-brand.css" data-sv-theme><script defer src="/design/site-20261110-brand.js" data-sv-theme></script>', {html:true});}})
    .transform(response);
}

// Preserve files that existed only in the recovered manual deployment. Cloudflare's
// keep_assets inherits the latest upload, which can differ from the active version.
// Do not delete this immutable version until the full original inventory is migrated.
const preservedOrigin = 'https://7caac0ef-socialventure-magazine.b095226.workers.dev';
async function fetchAssets(request, env) {
  const current = await env.ASSETS.fetch(request);
  if (current.status !== 404 || !['GET', 'HEAD'].includes(request.method)) return current;
  const url = new URL(request.url);
  const origin = new URL(preservedOrigin);
  url.protocol = origin.protocol; url.host = origin.host;
  const headers = new Headers();
  for (const key of ['Accept', 'Range', 'If-None-Match', 'If-Modified-Since']) {
    const value = request.headers.get(key); if (value) headers.set(key, value);
  }
  try {
    const original = await fetch(url, {method:request.method, headers, redirect:'manual'});
    if (original.status === 404) return current;
    const resultHeaders = new Headers(original.headers);
    const location = resultHeaders.get('Location');
    if (location) {
      const target = new URL(location, preservedOrigin);
      if (target.origin === preservedOrigin) resultHeaders.set('Location', target.pathname + target.search + target.hash);
    }
    return new Response(original.body, {status:original.status, headers:resultHeaders});
  } catch {
    return new Response('Original file temporarily unavailable', {status:503, headers:{'Retry-After':'60'}});
  }
}
