import test from 'node:test';
import assert from 'node:assert/strict';
import {initial,refresh,deposit,collect,plan,routeLength,sortMaterial,status} from '../src/model.js';
test('critical level generates one alert, collection resolves it',()=>{const s=refresh(initial());const b=s.bins[0];deposit(s,b.id,25,10);assert.equal(b.fill,100);assert.equal(status(b.fill),'Crítico');refresh(s);assert.equal(s.alerts.filter(a=>a.bin===b.id&&!a.done).length,1);collect(s,b.id);assert.equal(b.fill,0);assert.equal(s.alerts.filter(a=>a.bin===b.id&&!a.done).length,0);assert.equal(s.collections,1)});
test('disconnected sensor rejects readings',()=>{const s=initial();s.bins[0].online=false;assert.equal(deposit(s,s.bins[0].id),false);assert.equal(s.bins[0].fill,78)});
test('optimized route includes the same eligible stops and never exceeds baseline',()=>{const s=initial(),r=plan(s.bins);assert.equal(r.optimized.length,2);assert.deepEqual(r.optimized.map(b=>b.id).sort(),r.traditional.map(b=>b.id).sort());assert.ok(routeLength(r.optimized)<=routeLength(r.traditional))});
test('classification conserves collected material',()=>{const s=initial();collect(s,s.bins[0].id);let mass=s.stock;sortMaterial(s,'PET',10);sortMaterial(s,'HDPE',100);assert.equal(s.stock,0);assert.equal(s.sorted.PET+s.sorted.HDPE,mass)});
test('acknowledged alerts do not regenerate until condition clears',()=>{const s=refresh(initial());const a=s.alerts[0];a.done=true;refresh(s);assert.equal(s.alerts.length,1);collect(s,a.bin);deposit(s,a.bin,100,40);assert.equal(s.alerts.filter(a=>!a.done).length,1)});
