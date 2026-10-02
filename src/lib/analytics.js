// Umami (privacy-friendly, cookieless). The script tag is injected at build
// time when SITE.umamiWebsiteId is set, and auto-tracks SPA pageviews; this
// adds custom events. A no-op when analytics isn't configured.
export function track(event, props) {
  try {
    window.umami?.track(event, props);
  } catch { /* analytics must never break the UI */ }
}
