/* Sends an email address to the newsletter provider configured in
   SITE.newsletter. Each provider is a plain cross-origin form POST, so no
   API keys ever ship to the browser.

   provider   what to paste as `newsletter` / `waitlist`
   ---------  ------------------------------------------------------------
   kit        form id from Kit → Grow → Landing pages & forms → your form
              → Publish → HTML (the number in /forms/1234567/subscriptions)
   buttondown your Buttondown username (waitlist signups get the tag "waitlist")
   formspree  form id from formspree.io/f/<id>
   sheets     Google Apps Script web-app URL (scripts/apps-script/Code.gs) that
              writes to a Sheet, checks for spam and sends a confirmation email
   brevo      Brevo form action URL (https://….sibforms.com/serve/…) */

export async function subscribe({ provider, target, email, lang, list, source, key, honeypot = '', elapsed = 0 }) {
  const body = new FormData();
  switch (provider) {
    case 'kit':
      body.append('email_address', email);
      body.append('fields[language]', lang);
      return fetch(`https://app.kit.com/forms/${encodeURIComponent(target)}/subscriptions`, { method: 'POST', body, mode: 'no-cors' });
    case 'buttondown':
      body.append('email', email);
      if (list === 'waitlist') body.append('tag', 'waitlist');
      body.append('tag', `lang-${lang}`);
      return fetch(`https://buttondown.com/api/emails/embed-subscribe/${encodeURIComponent(target)}`, { method: 'POST', body, mode: 'no-cors' });
    case 'formspree': {
      body.append('email', email);
      body.append('list', list);
      body.append('language', lang);
      const res = await fetch(`https://formspree.io/f/${encodeURIComponent(target)}`, { method: 'POST', body, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error('Formspree rejected the submission');
      return res;
    }
    case 'sheets': {
      // URL-encoded (not multipart) so Apps Script exposes it as e.parameter.
      const form = new URLSearchParams({ email, list, language: lang, source: source || '', key: key || '', website: honeypot, elapsed: String(Math.round(elapsed)) });
      return fetch(target, { method: 'POST', body: form, mode: 'no-cors' });
    }
    case 'brevo':
      body.append('EMAIL', email);
      body.append('email_address_check', ''); // Brevo honeypot — must stay empty
      body.append('locale', lang);
      return fetch(target, { method: 'POST', body, mode: 'no-cors' });
    default:
      throw new Error(`Unknown newsletter provider: ${provider}`);
  }
}
