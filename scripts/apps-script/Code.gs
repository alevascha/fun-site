/**
 * Ale's Fun Lab — newsletter / waitlist signups into this Google Sheet.
 *
 * Install: open the Sheet → Extensions → Apps Script → paste this file as
 * Code.gs → Deploy → New deployment → Web app (Execute as: Me, Who has
 * access: Anyone) → copy the /exec URL into SITE.newsletter in the site.
 *
 * Protection layers
 *  - Site key        only requests carrying SITE_KEY are accepted
 *  - Honeypot        hidden "website" field must be empty (bots fill it)
 *  - Time trap       form must be open ≥ 2.5 s before submitting
 *  - Rate limits     ≤ 30 signups/minute overall, 1 per email per 10 min
 *  - Email checks    syntax, length, disposable-domain blocklist, and a
 *                    real MX/A DNS lookup so made-up domains are rejected
 *  - Double opt-in   a confirmation email; only clicked links become
 *                    "confirmado" — fake or mistyped addresses stay pending
 *  - Formula guard   values starting with = + - @ are stored as text
 */

const SITE_KEY = 'flab_6aec59d0853784ae037c26e0';
const SITE_URL = 'https://fun.alevasquez.dev';
const HEADERS = ['Fecha', 'Email', 'Lista', 'Idioma', 'Origen', 'Estado', 'Confirmado el', 'Token'];
const LISTS = ['newsletter', 'waitlist'];
const MIN_FILL_MS = 2500;
const MAX_PER_MINUTE = 30;

const DISPOSABLE = [
  'mailinator.com', '10minutemail.com', 'guerrillamail.com', 'guerrillamail.net', 'sharklasers.com', 'yopmail.com',
  'tempmail.com', 'temp-mail.org', 'trashmail.com', 'getnada.com', 'dispostable.com', 'maildrop.cc', 'fakeinbox.com',
  'throwawaymail.com', 'mintemail.com', 'mohmal.com', 'emailondeck.com', 'spamgourmet.com', 'mailnesia.com',
  'tempail.com', 'moakt.com', 'burnermail.io', 'inboxkitten.com', 'discard.email', 'mailcatch.com', 'tempr.email',
];

function sheet_() {
  const sh = SpreadsheetApp.getActive().getSheets()[0];
  const first = sh.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (first.join('|') !== HEADERS.join('|')) {
    sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold');
    sh.setFrozenRows(1);
  }
  return sh;
}

// Store user-provided text safely (no formulas).
function safe_(v) {
  const s = String(v == null ? '' : v).slice(0, 200);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function domainAcceptsMail_(domain) {
  const cache = CacheService.getScriptCache();
  const hit = cache.get('dns:' + domain);
  if (hit) return hit === '1';
  let ok = false;
  try {
    for (const type of ['MX', 'A']) {
      const res = UrlFetchApp.fetch('https://dns.google/resolve?name=' + encodeURIComponent(domain) + '&type=' + type, { muteHttpExceptions: true });
      const data = JSON.parse(res.getContentText());
      if (data.Status === 0 && data.Answer && data.Answer.length) { ok = true; break; }
    }
  } catch (err) {
    ok = true; // DNS lookup failed on our side — don't punish the person
  }
  cache.put('dns:' + domain, ok ? '1' : '0', 21600);
  return ok;
}

function doPost(e) {
  const p = (e && e.parameter) || {};
  // Silent drops: bots get the same response as people.
  if (p.key !== SITE_KEY) return json_({ ok: true });
  if (p.website) return json_({ ok: true });
  if (Number(p.elapsed || 0) < MIN_FILL_MS) return json_({ ok: true });

  const email = String(p.email || '').trim().toLowerCase();
  const list = LISTS.indexOf(p.list) >= 0 ? p.list : 'newsletter';
  const lang = p.language === 'es' ? 'es' : 'en';
  const source = safe_(p.source || '');

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json_({ ok: false, error: 'invalid' });
  const domain = email.split('@')[1];
  if (DISPOSABLE.indexOf(domain) >= 0) return json_({ ok: false, error: 'disposable' });

  const cache = CacheService.getScriptCache();
  const minuteKey = 'rate:' + Math.floor(Date.now() / 60000);
  const count = Number(cache.get(minuteKey) || 0);
  if (count >= MAX_PER_MINUTE) return json_({ ok: false, error: 'busy' });
  cache.put(minuteKey, String(count + 1), 120);
  if (cache.get('cool:' + email + ':' + list)) return json_({ ok: true });
  cache.put('cool:' + email + ':' + list, '1', 600);

  if (!domainAcceptsMail_(domain)) return json_({ ok: false, error: 'domain' });

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    const rows = sh.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][1]).toLowerCase() === email && rows[i][2] === list) {
        if (rows[i][5] === 'pendiente') sendConfirmation_(email, list, lang, rows[i][7]);
        return json_({ ok: true }); // already on the list
      }
    }
    const token = Utilities.getUuid();
    sh.appendRow([new Date(), safe_(email), list, lang, source, 'pendiente', '', token]);
    sendConfirmation_(email, list, lang, token);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

function sendConfirmation_(email, list, lang, token) {
  const base = ScriptApp.getService().getUrl();
  const confirm = base + '?confirm=' + token;
  const unsub = base + '?unsubscribe=' + token;
  const es = lang === 'es';
  const what = list === 'waitlist'
    ? (es ? 'la lista de espera de Lab Pro' : 'the Lab Pro waitlist')
    : (es ? "la newsletter de Ale's Fun Lab" : "the Ale's Fun Lab newsletter");
  const subject = es ? 'Confirma tu suscripción ✦' : 'Confirm your subscription ✦';
  const html =
    '<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:auto;padding:24px;color:#111011">' +
    '<h1 style="font-family:Georgia,serif;font-weight:300;font-size:28px;margin:0 0 12px">Ale\'s Fun Lab</h1>' +
    '<p style="font-size:16px;line-height:1.6">' + (es ? 'Hola: confirma que quieres unirte a ' : 'Hi! Please confirm you want to join ') + what + '.</p>' +
    '<p><a href="' + confirm + '" style="display:inline-block;background:#111011;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">' +
    (es ? 'Confirmar suscripción' : 'Confirm subscription') + '</a></p>' +
    '<p style="font-size:13px;color:#6b6866;line-height:1.6">' +
    (es ? 'Si no fuiste tú, ignora este correo y no recibirás nada más. ' : 'If this wasn’t you, ignore this email and you won’t hear from us again. ') +
    '<a href="' + unsub + '" style="color:#6b6866">' + (es ? 'Darme de baja' : 'Unsubscribe') + '</a></p></div>';
  MailApp.sendEmail({ to: email, subject: subject, htmlBody: html, name: "Ale's Fun Lab" });
}

function page_(title, message, lang) {
  const back = lang === 'es' ? 'Volver al lab' : 'Back to the lab';
  return HtmlService.createHtmlOutput(
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:15vh auto;padding:24px;text-align:center;color:#111011">' +
    '<h1 style="font-family:Georgia,serif;font-weight:300;font-size:34px">' + title + '</h1>' +
    '<p style="font-size:17px;line-height:1.6;color:#46423f">' + message + '</p>' +
    '<p><a href="' + SITE_URL + (lang === 'es' ? '/es' : '/') + '" target="_top" style="display:inline-block;background:#111011;color:#fff;padding:12px 20px;border-radius:999px;text-decoration:none;font-weight:600">' + back + '</a></p></div>'
  ).setTitle("Ale's Fun Lab");
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  const token = p.confirm || p.unsubscribe;
  if (!token) return page_("Ale's Fun Lab", '✦', 'en');
  const sh = sheet_();
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][7] === token) {
      const lang = rows[i][3] === 'es' ? 'es' : 'en';
      const es = lang === 'es';
      if (p.confirm) {
        if (rows[i][5] !== 'confirmado') sh.getRange(i + 1, 6, 1, 2).setValues([['confirmado', new Date()]]);
        return page_(es ? '¡Listo! 🎉' : 'You’re in! 🎉', es ? 'Tu suscripción está confirmada. Gracias por sumarte.' : 'Your subscription is confirmed. Thanks for joining.', lang);
      }
      sh.getRange(i + 1, 6, 1, 2).setValues([['baja', new Date()]]);
      return page_(es ? 'Te diste de baja' : 'You’re unsubscribed', es ? 'No recibirás más correos.' : 'You won’t receive any more emails.', lang);
    }
  }
  return page_('🤔', 'This link is no longer valid. · Este enlace ya no es válido.', 'en');
}

// Run once from the editor (▶ setup) to create the header row and grant
// the permissions (Sheets, email, external requests) before deploying.
function setup() {
  sheet_();
  domainAcceptsMail_('gmail.com');
}
