/* Lab Pro license server (Cloudflare Worker).

   The Figma plugins call this instead of Lemon Squeezy directly so that one
   license works in every plugin while staying tied to the buyer's Figma
   accounts:

   - POST /v1/activate   { license_key, figma_user_id, plugin }
       Checks the key with Lemon Squeezy and links it to this Figma account
       (up to MAX_ACCOUNTS accounts per key). Each linked account is one
       Lemon Squeezy activation, so it shows up in the Lemon Squeezy
       dashboard, where it can also be deactivated by hand.
   - POST /v1/check      { license_key, figma_user_id, plugin }
       Periodic check from a plugin: is the key still valid (not refunded,
       expired or disabled) and is this account still linked? Cached briefly.
   - POST /v1/deactivate { license_key, figma_user_id }
       Frees this account's slot (the "Remove license" button in a plugin).

   Every answer is { ok: true, plan, plugins } or { ok: false, reason }.
   `plugins` is "all" for Lab Pro, or the one plugin slug a single-plugin
   license unlocks.

   KV (LICENSES) stores, per SHA-256 of the key (never the key itself), the
   linked Figma account IDs and their Lemon Squeezy instance IDs.

   Config (wrangler.toml [vars]):
   - STORE_ID: our Lemon Squeezy store, so keys from other stores fail.
   - PRODUCTS: JSON map of Lemon Squeezy product or variant ID → "all" or a
     plugin slug, e.g. {"123": "all", "456": "contrast-checker"}.
   - MAX_ACCOUNTS: Figma accounts per key (default 2).
   - LS_API: Lemon Squeezy API base, overridable for tests. */

const CHECK_TTL = 6 * 60 * 60; // seconds a successful /check is cached
const CORS = {
  'Access-Control-Allow-Origin': '*', // Figma plugin iframes have a null origin
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
};

const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...CORS } });
const fail = (reason, status = 200) => json({ ok: false, reason }, status);

const KEY_RE = /^[A-Za-z0-9-]{8,100}$/;
const FIGMA_RE = /^[A-Za-z0-9_:-]{1,64}$/;
const SLUG_RE = /^[a-z0-9-]{1,40}$/;

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Lemon Squeezy's license API takes form data and needs no API key.
async function lemon(env, action, params) {
  const res = await fetch(`${env.LS_API || 'https://api.lemonsqueezy.com'}/v1/licenses/${action}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON error page */ }
  if (!data) throw new Error(`Lemon Squeezy ${action} returned ${res.status}`);
  return data;
}

// What a key unlocks, from its product/variant. null = not one of our products.
function entitlement(env, meta) {
  let map = {};
  try { map = JSON.parse(env.PRODUCTS || '{}'); } catch { /* misconfigured */ }
  const hit = map[String(meta?.variant_id)] ?? map[String(meta?.product_id)];
  if (!hit) return null;
  return hit === 'all' ? { plan: 'lab-pro', plugins: 'all' } : { plan: 'single', plugins: hit };
}

// Shared checks on a Lemon Squeezy validate/activate response.
function judge(env, data, plugin) {
  if (env.STORE_ID && String(data.meta?.store_id) !== String(env.STORE_ID)) return { reason: 'invalid_key' };
  const status = data.license_key?.status;
  if (status === 'expired') return { reason: 'expired' };
  if (status === 'disabled') return { reason: 'disabled' };
  const ent = entitlement(env, data.meta);
  if (!ent) return { reason: 'invalid_key' };
  if (ent.plugins !== 'all' && plugin && ent.plugins !== plugin) return { reason: 'wrong_plugin', ...ent };
  return { ent };
}

async function readRecord(env, hash) {
  return (await env.LICENSES.get(`lic:${hash}`, 'json')) || { accounts: [] };
}
const writeRecord = (env, hash, rec) => env.LICENSES.put(`lic:${hash}`, JSON.stringify({ ...rec, updated: new Date().toISOString() }));

async function activate(env, { license_key, figma_user_id, plugin }) {
  const hash = await sha256(license_key);
  const rec = await readRecord(env, hash);
  const linked = rec.accounts.find(a => a.figma === figma_user_id);

  const check = await lemon(env, 'validate', linked ? { license_key, instance_id: linked.instance } : { license_key });
  if (!check.license_key) return fail('invalid_key');
  const verdict = judge(env, check, plugin);
  if (verdict.reason) return json({ ok: false, reason: verdict.reason, plugins: verdict.plugins });

  if (linked && check.valid) return json({ ok: true, ...verdict.ent });
  if (linked) rec.accounts = rec.accounts.filter(a => a !== linked); // instance was removed in the dashboard

  const max = Number(env.MAX_ACCOUNTS) || 2;
  if (rec.accounts.length >= max) return json({ ok: false, reason: 'too_many_accounts', max });

  const act = await lemon(env, 'activate', { license_key, instance_name: `figma-${figma_user_id}` });
  if (!act.activated) return fail(/limit/i.test(act.error || '') ? 'too_many_accounts' : 'invalid_key');
  rec.accounts.push({ figma: figma_user_id, instance: act.instance.id, at: new Date().toISOString() });
  await writeRecord(env, hash, rec);
  return json({ ok: true, ...verdict.ent });
}

// Applies a cached entitlement to the plugin asking.
const forPlugin = (ent, plugin) => (ent.plugins !== 'all' && plugin && ent.plugins !== plugin
  ? { ok: false, reason: 'wrong_plugin', ...ent }
  : { ok: true, ...ent });

async function check(env, { license_key, figma_user_id, plugin }) {
  const hash = await sha256(license_key);
  const cacheKey = `chk:${hash}:${figma_user_id}`;
  const cached = await env.LICENSES.get(cacheKey, 'json');
  if (cached) return json(forPlugin(cached, plugin));

  const rec = await readRecord(env, hash);
  const linked = rec.accounts.find(a => a.figma === figma_user_id);
  if (!linked) return fail('not_activated');

  const data = await lemon(env, 'validate', { license_key, instance_id: linked.instance });
  if (!data.license_key) return fail('invalid_key');
  const verdict = judge(env, data, null);
  if (verdict.reason) return fail(verdict.reason);
  if (!data.valid) { // the instance was deactivated in the dashboard: free the slot
    rec.accounts = rec.accounts.filter(a => a !== linked);
    await writeRecord(env, hash, rec);
    return fail('not_activated');
  }
  await env.LICENSES.put(cacheKey, JSON.stringify(verdict.ent), { expirationTtl: CHECK_TTL });
  return json(forPlugin(verdict.ent, plugin));
}

async function deactivate(env, { license_key, figma_user_id }) {
  const hash = await sha256(license_key);
  const rec = await readRecord(env, hash);
  const linked = rec.accounts.find(a => a.figma === figma_user_id);
  if (!linked) return json({ ok: true });
  await lemon(env, 'deactivate', { license_key, instance_id: linked.instance });
  rec.accounts = rec.accounts.filter(a => a !== linked);
  await writeRecord(env, hash, rec);
  await env.LICENSES.delete(`chk:${hash}:${figma_user_id}`);
  return json({ ok: true });
}

const ROUTES = { '/v1/activate': activate, '/v1/check': check, '/v1/deactivate': deactivate };

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
    const { pathname } = new URL(request.url);
    if (pathname === '/' && request.method === 'GET') return json({ ok: true, service: 'lab-pro-licenses' });
    const handler = ROUTES[pathname];
    if (!handler) return fail('not_found', 404);
    if (request.method !== 'POST') return fail('method_not_allowed', 405);

    let body;
    try { body = await request.json(); } catch { return fail('bad_request', 400); }
    const { license_key, figma_user_id, plugin } = body || {};
    if (!KEY_RE.test(license_key || '') || !FIGMA_RE.test(figma_user_id || '') || (plugin != null && !SLUG_RE.test(plugin))) {
      return fail('bad_request', 400);
    }
    try {
      return await handler(env, { license_key: license_key.trim(), figma_user_id, plugin });
    } catch (err) {
      console.error(err);
      return fail('server_error', 502);
    }
  },
};
