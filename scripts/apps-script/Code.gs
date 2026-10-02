/**
 * Ale's Fun Lab - newsletter / waitlist signups into this Google Sheet.
 *
 * Install: open the Sheet -> Extensions -> Apps Script -> paste this file as
 * Code.gs -> Deploy -> New deployment -> Web app (Execute as: Me, Who has
 * access: Anyone) -> copy the /exec URL into SITE.newsletter in the site.
 *
 * Protection layers
 *  - Site key        only requests carrying SITE_KEY are accepted
 *  - Honeypot        hidden "website" field must be empty (bots fill it)
 *  - Time trap       form must be open >= 2.5 s before submitting
 *  - Rate limits     <= 30 signups/minute overall, 1 per email per 10 min
 *  - Email checks    syntax, length, disposable-domain blocklist, and a
 *                    real MX/A DNS lookup so made-up domains are rejected
 *  - Double opt-in   a confirmation email from hi@alevasquez.dev; only clicked links become
 *                    "confirmado" - fake or mistyped addresses stay pending
 *  - Formula guard   values starting with = + - @ are stored as text
 */

const SITE_KEY = 'flab_6aec59d0853784ae037c26e0';
const SITE_URL = 'https://fun.alevasquez.dev';
// Sender for confirmation emails. Must be a Gmail "Send mail as" alias of the
// account that owns this script; if it isn't, mail goes out from the Gmail address.
const FROM = 'hi@alevasquez.dev';
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
    ok = true; // DNS lookup failed on our side \u2014 don't punish the person
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

// Shared look for the email and the confirm/unsubscribe pages: light by
// default, dark when the mail app or browser prefers it.
const THEME_CSS =
  ':root{color-scheme:light dark;supported-color-schemes:light dark}' +
  '@media (prefers-color-scheme:dark){' +
  '.bg{background:#121212!important}.card{background:#1D1C1B!important;border-color:#2E2B29!important}' +
  '.ink{color:#F7F7F7!important}.body{color:#D6D2CE!important}.muted{color:#A29D98!important}' +
  '.btn{background:#F7F7F7!important;color:#111011!important}.chip{background:#2A2725!important}' +
  '.rule{border-color:#2E2B29!important}.link{color:#E2A8FF!important}}' +
  // Outlook.com / Outlook apps dark mode
  '[data-ogsc] .card{background:#1D1C1B!important}[data-ogsc] .ink{color:#F7F7F7!important}' +
  '[data-ogsc] .body{color:#D6D2CE!important}[data-ogsc] .btn{background:#F7F7F7!important;color:#111011!important}';

function sendConfirmation_(email, list, lang, token) {
  const es = lang === 'es';
  // Links open pages on the site, which call doGet(?action=...) in the background.
  const confirm = SITE_URL + (es ? '/es/confirmar' : '/confirm') + '?t=' + token;
  const unsub = SITE_URL + (es ? '/es/baja' : '/unsubscribe') + '?t=' + token;
  const t = (en, sp) => (es ? sp : en);
  const waitlist = list === 'waitlist';
  const what = waitlist ? t('the Lab Pro waitlist', 'la lista de espera de Lab Pro') : t("the Ale's Fun Lab newsletter", "la newsletter de Ale's Fun Lab");
  const subject = t('Confirm your subscription \u2726', 'Confirma tu suscripci\u00F3n \u2726');
  // Emojis as HTML entities: GmailApp garbles characters outside the BMP
  // (surrogate pairs) in htmlBody, entities survive every mail client.
  const perks = waitlist
    ? [['&#x1F680;', t('Be first to know when Lab Pro launches', 'Ent\u00E9rate primero cuando lance Lab Pro')],
       ['&#x1F9E9;', t('Early access to the Figma plugins', 'Acceso anticipado a los plugins de Figma')],
       ['&#x1F4AC;', t('Your feedback shapes what gets built', 'Tu opini\u00F3n define lo que se construye')]]
    : [['&#x1F9EA;', t('New free tools as soon as they ship', 'Herramientas gratis nuevas apenas salen')],
       ['&#x1F4D8;', t('Practical guides on design systems, accessibility and front-end', 'Gu\u00EDas pr\u00E1cticas de design systems, accesibilidad y front-end')],
       ['&#x2726;', t('Early access to Lab Pro and the Figma plugins', 'Acceso anticipado a Lab Pro y los plugins de Figma')]];
  const font = "'Helvetica Neue',Helvetica,Arial,sans-serif";
  const perkRows = perks.map(([icon, label]) =>
    '<tr><td style="padding:6px 0;vertical-align:top;width:44px">' +
    '<div class="chip" style="width:32px;height:32px;line-height:32px;text-align:center;border-radius:10px;background:#F4F0FA;font-size:16px">' + icon + '</div></td>' +
    '<td class="body" style="padding:6px 0;font:400 15px/1.5 ' + font + ';color:#3D3A37;vertical-align:middle">' + label + '</td></tr>').join('');

  const html =
    '<!doctype html><html lang="' + lang + '"><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">' +
    '<style>' + THEME_CSS + '</style></head>' +
    '<body class="bg" style="margin:0;padding:0;background:#F4F2EF">' +
    // Preview text shown in the inbox list
    '<div style="display:none;max-height:0;overflow:hidden;opacity:0">' +
    t('One click to confirm and you\u2019re in.', 'Un clic para confirmar y listo.') + '</div>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" class="bg" style="background:#F4F2EF">' +
    '<tr><td align="center" style="padding:32px 16px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">' +
    // Header: round photo + wordmark ("by Alejandro Vasquez")
    '<tr><td style="padding:0 8px 16px">' +
    '<table role="presentation" cellpadding="0" cellspacing="0"><tr>' +
    '<td style="padding-right:12px;vertical-align:middle">' +
    '<img src="' + SITE_URL + '/email/ale.jpg" width="48" height="48" alt="Alejandro Vasquez" ' +
    'style="display:block;width:48px;height:48px;border-radius:50%;border:2px solid #CD57FF;object-fit:cover"></td>' +
    '<td style="vertical-align:middle">' +
    '<div class="ink" style="font:400 22px/1.1 Georgia,\'Times New Roman\',serif;color:#111011">Ale\u2019s Fun Lab' +
    '<span style="color:#CD57FF"> \u2726</span></div>' +
    '<div class="muted" style="font:500 12px/1.4 ' + font + ';color:#8A8580">' + t('by Alejandro Vasquez', 'por Alejandro Vasquez') + '</div>' +
    '</td></tr></table></td></tr>' +
    // Card
    '<tr><td class="card" style="background:#FFFFFF;border:1px solid #E7E3DE;border-radius:24px;overflow:hidden">' +
    '<div style="height:6px;line-height:6px;font-size:0;background:#CD57FF;background-image:linear-gradient(90deg,#CD57FF,#FF7AB6,#FFCE1F)">&nbsp;</div>' +
    '<div style="padding:36px 32px 32px">' +
    '<p class="muted" style="margin:0 0 12px;font:700 12px/1 ' + font + ';letter-spacing:.14em;text-transform:uppercase;color:#8A6BB0">' +
    t('One last step', 'Un \u00FAltimo paso') + '</p>' +
    '<h1 class="ink" style="margin:0 0 14px;font:400 32px/1.15 Georgia,\'Times New Roman\',serif;color:#111011;letter-spacing:-.01em">' +
    t('Confirm your spot', 'Confirma tu lugar') + '</h1>' +
    '<p class="body" style="margin:0 0 28px;font:400 16px/1.6 ' + font + ';color:#3D3A37">' +
    t('You asked to join ', 'Pediste unirte a ') + what + '. ' +
    t('Tap the button to confirm. It takes a second and keeps the list free of spam.', 'Toca el bot\u00F3n para confirmar. Toma un segundo y mantiene la lista libre de spam.') + '</p>' +
    '<table role="presentation" cellpadding="0" cellspacing="0"><tr><td>' +
    '<a class="btn" href="' + confirm + '" style="display:inline-block;background:#111011;color:#FFFFFF;padding:15px 28px;border-radius:999px;font:600 15px/1 ' + font + ';text-decoration:none">' +
    t('Confirm subscription', 'Confirmar suscripci\u00F3n') + ' &rarr;</a></td></tr></table>' +
    '<p class="muted" style="margin:16px 0 0;font:400 12px/1.5 ' + font + ';color:#8A8580;word-break:break-all">' +
    t('Button not working? Open this link: ', '\u00BFEl bot\u00F3n no funciona? Abre este enlace: ') +
    '<a class="link" href="' + confirm + '" style="color:#8A3FC4">' + confirm + '</a></p>' +
    '<div class="rule" style="border-top:1px solid #EDE9E4;margin:28px 0 20px"></div>' +
    '<p class="ink" style="margin:0 0 8px;font:600 15px/1.4 ' + font + ';color:#111011">' + t('What you\u2019ll get', 'Lo que recibir\u00E1s') + '</p>' +
    '<table role="presentation" cellpadding="0" cellspacing="0" width="100%">' + perkRows + '</table>' +
    '</div></td></tr>' +
    // Footer
    '<tr><td style="padding:20px 8px 0;text-align:center">' +
    '<p class="muted" style="margin:0 0 6px;font:400 12px/1.6 ' + font + ';color:#8A8580">' +
    t('Didn\u2019t sign up? Just ignore this email and you won\u2019t be added.', '\u00BFNo fuiste t\u00FA? Ignora este correo y no se agregar\u00E1 nada.') + '</p>' +
    '<p class="muted" style="margin:0;font:400 12px/1.6 ' + font + ';color:#8A8580">' +
    '<a class="link" href="' + SITE_URL + (es ? '/es' : '/') + '" style="color:#8A3FC4;text-decoration:none">fun.alevasquez.dev</a> &middot; ' +
    '<a class="link" href="' + unsub + '" style="color:#8A8580">' + t('Unsubscribe', 'Darme de baja') + '</a></p>' +
    '</td></tr></table></td></tr></table></body></html>';

  const text = t('Confirm your subscription: ', 'Confirma tu suscripci\u00F3n: ') + confirm + '\n\n' + t('Unsubscribe: ', 'Darme de baja: ') + unsub;
  const opts = { htmlBody: html, name: "Ale's Fun Lab", replyTo: FROM };
  if (GmailApp.getAliases().indexOf(FROM) >= 0) opts.from = FROM;
  GmailApp.sendEmail(email, subject, text, opts);
}

function page_(title, message, lang) {
  const back = lang === 'es' ? 'Volver al lab' : 'Back to the lab';
  return HtmlService.createHtmlOutput(
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="color-scheme" content="light dark">' +
    '<style>body{margin:0;background:#F4F2EF;font-family:Inter,"Helvetica Neue",Arial,sans-serif}' +
    '.wrap{min-height:100vh;display:grid;place-items:center;padding:24px;box-sizing:border-box}' +
    '.card{max-width:480px;width:100%;background:#fff;border:1px solid #E7E3DE;border-radius:28px;overflow:hidden;text-align:center;' +
    'box-shadow:0 30px 60px -30px rgba(205,87,255,.35);animation:rise .7s cubic-bezier(.16,1,.3,1) both}' +
    '.bar{height:6px;background:linear-gradient(90deg,#CD57FF,#FF7AB6,#FFCE1F)}.in{padding:40px 32px}' +
    'h1{font:300 38px/1.1 Georgia,serif;margin:0 0 12px;color:#111011}p{font-size:17px;line-height:1.6;color:#46423F;margin:0 0 28px}' +
    'a{display:inline-block;background:#111011;color:#fff;padding:14px 26px;border-radius:999px;text-decoration:none;font-weight:600;transition:transform .2s}' +
    'a:hover{transform:translateY(-2px)}@keyframes rise{from{opacity:0;transform:translateY(16px)}}' +
    '@media (prefers-color-scheme:dark){body{background:#121212}.card{background:#1D1C1B;border-color:#2E2B29}h1{color:#F7F7F7}p{color:#D6D2CE}a{background:#F7F7F7;color:#111011}}</style>' +
    '<div class="wrap"><div class="card"><div class="bar"></div><div class="in">' +
    '<h1>' + title + '</h1><p>' + message + '</p>' +
    '<a href="' + SITE_URL + (lang === 'es' ? '/es' : '/') + '" target="_top">' + back + ' &rarr;</a></div></div></div>'
  ).setTitle("Ale's Fun Lab");
}

// JSON API used by fun.alevasquez.dev/confirm and /unsubscribe:
//   GET ?action=confirm|unsubscribe&t=TOKEN -> { ok, status, lang, list }
// status: confirmed | already | unsubscribed. Errors: invalid.
function api_(action, token) {
  if (!token || (action !== 'confirm' && action !== 'unsubscribe')) return json_({ ok: false, error: 'invalid' });
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = sheet_();
    const rows = sh.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][7] !== token) continue;
      const lang = rows[i][3] === 'es' ? 'es' : 'en';
      const list = rows[i][2];
      if (action === 'confirm') {
        if (rows[i][5] === 'confirmado') return json_({ ok: true, status: 'already', lang: lang, list: list });
        sh.getRange(i + 1, 6, 1, 2).setValues([['confirmado', new Date()]]);
        return json_({ ok: true, status: 'confirmed', lang: lang, list: list });
      }
      if (rows[i][5] !== 'baja') sh.getRange(i + 1, 6, 1, 2).setValues([['baja', new Date()]]);
      return json_({ ok: true, status: 'unsubscribed', lang: lang, list: list });
    }
    return json_({ ok: false, error: 'invalid' });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.action) return api_(p.action, String(p.t || ''));
  // Older emails linked straight to the script; keep those links working.
  const token = p.confirm || p.unsubscribe;
  if (!token) return page_("Ale's Fun Lab", '\u2726', 'en');
  const sh = sheet_();
  const rows = sh.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][7] === token) {
      const lang = rows[i][3] === 'es' ? 'es' : 'en';
      const es = lang === 'es';
      if (p.confirm) {
        if (rows[i][5] !== 'confirmado') sh.getRange(i + 1, 6, 1, 2).setValues([['confirmado', new Date()]]);
        return page_(es ? '\u00A1Listo! \uD83C\uDF89' : 'You\u2019re in! \uD83C\uDF89', es ? 'Tu suscripci\u00F3n est\u00E1 confirmada. Gracias por sumarte.' : 'Your subscription is confirmed. Thanks for joining.', lang);
      }
      sh.getRange(i + 1, 6, 1, 2).setValues([['baja', new Date()]]);
      return page_(es ? 'Te diste de baja' : 'You\u2019re unsubscribed', es ? 'No recibir\u00E1s m\u00E1s correos.' : 'You won\u2019t receive any more emails.', lang);
    }
  }
  return page_('\uD83E\uDD14', 'This link is no longer valid. \u00B7 Este enlace ya no es v\u00E1lido.', 'en');
}

// Run once from the editor (Run > setup) to create the header row and grant
// the permissions (Sheets, email, external requests) before deploying.
function setup() {
  sheet_();
  domainAcceptsMail_('gmail.com');
  // Also grants Gmail permission and confirms the alias is usable.
  Logger.log(GmailApp.getAliases().indexOf(FROM) >= 0 ? 'Sending as ' + FROM : 'Alias ' + FROM + ' not found: sending from the Gmail address');
}
