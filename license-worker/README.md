# Lab Pro license server

Cloudflare Worker that the Lab Pro Figma plugins call to unlock Pro features.
One Lemon Squeezy license key works in every plugin the plan includes, and is
linked to at most 2 Figma accounts (`figma.currentUser.id`), so shared keys
stop working. See the comment at the top of `src/index.js` for the API.

## Endpoints

All take `POST` with JSON `{ license_key, figma_user_id, plugin }` and answer
`{ ok: true, plan, plugins }` or `{ ok: false, reason }`.

| Path | What it does |
|---|---|
| `/v1/activate` | Checks the key and links it to this Figma account (the plugin's "Enter license") |
| `/v1/check` | Periodic check that the key is still valid and linked (cached 6 h) |
| `/v1/deactivate` | Frees this account's slot (the plugin's "Remove license") |

`reason` is one of `invalid_key`, `expired`, `disabled`, `wrong_plugin`,
`too_many_accounts`, `not_activated`, `bad_request`, `server_error`.

## Setup (already done)

1. `npx wrangler login`
2. `npx wrangler kv namespace create LICENSES` → id in `wrangler.toml`

## Before launch

1. In Lemon Squeezy, create the products with **license keys enabled**:
   Lab Pro yearly, Lab Pro lifetime, and one product per plugin. Set the
   activation limit to **2** (one per Figma account).
2. In `wrangler.toml`, fill in:
   - `STORE_ID`: Settings → Stores in Lemon Squeezy.
   - `PRODUCTS`: product (or variant) IDs → `"all"` for Lab Pro, or the
     plugin slug for single plugins, e.g.
     `{"123": "all", "124": "all", "456": "contrast-checker"}`.
3. `npm run deploy`

No Lemon Squeezy API key is needed: the license endpoints are public.

## Plugins

- Add the Worker's URL to each plugin's `manifest.json`
  `networkAccess.allowedDomains`, and ask for the `currentuser` permission.
- Send `figma.currentUser.id` as `figma_user_id` and the plugin's slug
  (same as the Fun Lab tool id, e.g. `contrast-checker`) as `plugin`.

## Moving a customer to another Figma account

Lemon Squeezy dashboard → the customer's license key → deactivate the old
instance (named `figma-<id>`). The next check from that account unlinks it and
the customer can activate on the new one.

## Tests

`npm test` runs the Worker against an in-memory KV and a fake Lemon Squeezy.
