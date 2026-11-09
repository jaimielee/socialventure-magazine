import assert from 'node:assert/strict';
import worker from '../src/hanam-gate.mjs';
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
