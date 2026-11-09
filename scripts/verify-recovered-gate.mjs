import assert from 'node:assert/strict';
import worker from '../src/hanam-gate.mjs';
// Routing fixtures; real HTMLRewriter and injected assets are verified against Worker preview.
globalThis.HTMLRewriter = class {on(){return this;} transform(response){return response;}};
let calls=0;
const env={ASSETS:{fetch:async request=>{calls++;return new Response(request.method==='HEAD'?null:'board fixture',{headers:{'Content-Type':'text/html'}})}}};
const req=(path,options)=>new Request('https://local.test'+path,options);
for(const path of ['/','/about/','/hanam','/hanam/','/hanam.html','/%68anam','/hanam/attachment.pdf']){
 const before=calls;const r=await worker.fetch(req(path),env);assert.equal(r.status,200);assert.equal(calls,before+1);assert.equal(await r.text(),'board fixture');
}
let r=await worker.fetch(req('/hanam/'),env);assert.equal(r.headers.get('cache-control'),'private, no-store');assert.equal(r.headers.get('x-robots-tag'),'noindex, nofollow');assert.equal(r.headers.get('set-cookie'),null);
for(const method of ['GET','POST']){r=await worker.fetch(req('/hanam/login',{method}),env);assert.equal(r.status,303);assert.equal(r.headers.get('location'),'/hanam/');}
assert.equal((await worker.fetch(req('/hanam/',{method:'PUT'}),env)).status,405);
assert.equal((await worker.fetch(req('/hanam/',{method:'HEAD'}),env)).status,200);
assert.equal((await worker.fetch(req('/%ZZ'),env)).status,400);
r=await worker.fetch(req('/hanam/',{headers:{Cookie:'__Host-hanam_session=invalid'}}),env);assert.equal(r.status,200);
console.log('PASS direct board access without secrets/cookies, aliases, assets, legacy login redirect, HEAD, methods, malformed URL and headers.');

const theme = await worker.fetch(req('/design/site-20261110.css'),env);
assert.match(theme.headers.get('content-type'),/text\/css/);assert.match(await theme.text(),/prefers-reduced-motion/);
assert.equal((await worker.fetch(req('/design/site-20261110.js',{method:'POST'}),env)).status,405);

const realFetch = globalThis.fetch;
let forwarded;
globalThis.fetch = async (url, options) => {forwarded = {url:String(url),options};return new Response('preserved attachment');};
const missingEnv = {ASSETS:{fetch:async()=>new Response('missing',{status:404})}};
const oldAsset = await worker.fetch(req('/old-attachment.pdf',{headers:{Cookie:'private=value',Authorization:'private'}}), missingEnv);
assert.equal(await oldAsset.text(),'preserved attachment');
assert.equal(new URL(forwarded.url).hostname,'7caac0ef-socialventure-magazine.b095226.workers.dev');
assert.equal(forwarded.options.headers.get('Cookie'),null);assert.equal(forwarded.options.headers.get('Authorization'),null);
globalThis.fetch = realFetch;
console.log('PASS preserved-version fallback for otherwise missing files without forwarding credentials.');
