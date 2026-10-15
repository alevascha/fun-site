// Runs the Worker against an in-memory KV and a fake Lemon Squeezy.
//   npm test
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';

const KEY = 'AAAA-BBBB-CCCC-DDDD';
const SINGLE_KEY = 'SING-LEPL-UGIN-KEY1';

function memoryKV() {
  const m = new Map();
  return {
    m,
    async get(k, type) { const v = m.get(k); return v == null ? null : type === 'json' ? JSON.parse(v) : v; },
    async put(k, v) { m.set(k, v); },
    async delete(k) { m.delete(k); },
  };
}

// Fake Lemon Squeezy: Lab Pro product 100, single Contrast Checker product 200.
let ls;
function fakeLemon() {
  const state = {
    keys: {
      [KEY]: { product_id: 100, status: 'active', limit: 5, instances: new Set() },
      [SINGLE_KEY]: { product_id: 200, status: 'active', limit: 5, instances: new Set() },
    },
    calls: [],
    n: 0,
  };
  globalThis.fetch = async (url, init) => {
    const action = url.split('/').pop();
    const p = Object.fromEntries(new URLSearchParams(init.body));
    state.calls.push(action);
    const k = state.keys[p.license_key];
    const reply = obj => new Response(JSON.stringify(obj), { status: 200 });
    if (!k) return reply({ valid: false, activated: false, error: 'license_key not found.' });
    const lic = { status: k.status, activation_limit: k.limit, activation_usage: k.instances.size };
    const meta = { store_id: 1, product_id: k.product_id, variant_id: k.product_id + 1 };
    if (action === 'activate') {
      if (k.instances.size >= k.limit) return reply({ activated: false, error: 'This license key has reached the activation limit.', license_key: lic, meta });
      const id = `inst-${++state.n}`;
      k.instances.add(id);
      return reply({ activated: true, error: null, license_key: lic, instance: { id }, meta });
    }
    if (action === 'validate') {
      const instOk = !p.instance_id || k.instances.has(p.instance_id);
      return reply({ valid: k.status === 'active' && instOk, error: instOk ? null : 'instance not found', license_key: lic, meta });
    }
    if (action === 'deactivate') { k.instances.delete(p.instance_id); return reply({ deactivated: true }); }
    return reply({ error: 'unknown' });
  };
  return state;
}

let env;
beforeEach(() => {
  ls = fakeLemon();
  env = { LICENSES: memoryKV(), STORE_ID: '1', PRODUCTS: JSON.stringify({ 100: 'all', 200: 'contrast-checker' }), MAX_ACCOUNTS: '2', LS_API: 'https://ls.test' };
});

const call = async (path, body) => (await worker.fetch(new Request(`https://w.test${path}`, { method: 'POST', body: JSON.stringify(body) }), env)).json();

test('Lab Pro key unlocks every plugin on the first Figma account', async () => {
  const r = await call('/v1/activate', { license_key: KEY, figma_user_id: 'u1', plugin: 'type-scale' });
  assert.deepEqual(r, { ok: true, plan: 'lab-pro', plugins: 'all' });
  const r2 = await call('/v1/activate', { license_key: KEY, figma_user_id: 'u1', plugin: 'contrast-checker' });
  assert.equal(r2.ok, true);
  assert.equal(ls.keys[KEY].instances.size, 1, 'same account in a second plugin uses no extra activation');
});

test('a third Figma account is refused', async () => {
  await call('/v1/activate', { license_key: KEY, figma_user_id: 'u1', plugin: 'type-scale' });
  await call('/v1/activate', { license_key: KEY, figma_user_id: 'u2', plugin: 'type-scale' });
  const r = await call('/v1/activate', { license_key: KEY, figma_user_id: 'u3', plugin: 'type-scale' });
  assert.deepEqual(r, { ok: false, reason: 'too_many_accounts', max: 2 });
});

test('removing the license from one account frees the slot', async () => {
  await call('/v1/activate', { license_key: KEY, figma_user_id: 'u1' });
  await call('/v1/activate', { license_key: KEY, figma_user_id: 'u2' });
  await call('/v1/deactivate', { license_key: KEY, figma_user_id: 'u1' });
  const r = await call('/v1/activate', { license_key: KEY, figma_user_id: 'u3' });
  assert.equal(r.ok, true);
});

test('a single-plugin key only unlocks its own plugin', async () => {
  const ok = await call('/v1/activate', { license_key: SINGLE_KEY, figma_user_id: 'u1', plugin: 'contrast-checker' });
  assert.deepEqual(ok, { ok: true, plan: 'single', plugins: 'contrast-checker' });
  const other = await call('/v1/check', { license_key: SINGLE_KEY, figma_user_id: 'u1', plugin: 'type-scale' });
  assert.equal(other.reason, 'wrong_plugin');
});

test('check is cached, and an unknown account is not activated', async () => {
  await call('/v1/activate', { license_key: KEY, figma_user_id: 'u1' });
  const before = ls.calls.length;
  await call('/v1/check', { license_key: KEY, figma_user_id: 'u1', plugin: 'type-scale' });
  await call('/v1/check', { license_key: KEY, figma_user_id: 'u1', plugin: 'gradient-generator' });
  assert.equal(ls.calls.length - before, 1, 'second check served from cache');
  const r = await call('/v1/check', { license_key: KEY, figma_user_id: 'stranger', plugin: 'type-scale' });
  assert.equal(r.reason, 'not_activated');
});

test('refunded or expired keys stop working', async () => {
  await call('/v1/activate', { license_key: KEY, figma_user_id: 'u1' });
  ls.keys[KEY].status = 'expired';
  const r = await call('/v1/activate', { license_key: KEY, figma_user_id: 'u1' });
  assert.equal(r.reason, 'expired');
  ls.keys[KEY].status = 'disabled';
  const r2 = await call('/v1/activate', { license_key: KEY, figma_user_id: 'u2' });
  assert.equal(r2.reason, 'disabled');
});

test('keys from another store or unknown products are rejected', async () => {
  env.STORE_ID = '999';
  assert.equal((await call('/v1/activate', { license_key: KEY, figma_user_id: 'u1' })).reason, 'invalid_key');
  env.STORE_ID = '1';
  env.PRODUCTS = '{}';
  assert.equal((await call('/v1/activate', { license_key: KEY, figma_user_id: 'u1' })).reason, 'invalid_key');
  assert.equal((await call('/v1/activate', { license_key: 'NOPE-NOPE-NOPE', figma_user_id: 'u1' })).reason, 'invalid_key');
});

test('an activation removed in the Lemon Squeezy dashboard unlinks the account', async () => {
  await call('/v1/activate', { license_key: KEY, figma_user_id: 'u1' });
  ls.keys[KEY].instances.clear();
  const r = await call('/v1/check', { license_key: KEY, figma_user_id: 'u1' });
  assert.equal(r.reason, 'not_activated');
});

test('the raw key is never stored', async () => {
  await call('/v1/activate', { license_key: KEY, figma_user_id: 'u1' });
  for (const [k, v] of env.LICENSES.m) { assert.ok(!k.includes(KEY) && !v.includes(KEY)); }
});

test('bad input and CORS preflight', async () => {
  const bad = await worker.fetch(new Request('https://w.test/v1/activate', { method: 'POST', body: '{"license_key":"x"}' }), env);
  assert.equal(bad.status, 400);
  const pre = await worker.fetch(new Request('https://w.test/v1/activate', { method: 'OPTIONS' }), env);
  assert.equal(pre.status, 204);
  assert.equal(pre.headers.get('Access-Control-Allow-Origin'), '*');
});
