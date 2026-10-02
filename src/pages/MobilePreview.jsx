import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { Reveal, Segmented } from '../components/ui';
import useUrlState from '../hooks/useUrlState';
import { EASE } from '../lib/motion';
import { useLang } from '../i18n';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';

/* Shows any page inside device frames at real CSS viewport sizes. The iframe
   is laid out at the device's width (so media queries fire as on the phone)
   and the whole frame is scaled down with a transform to fit the screen. */

const HOME = 'https://fun.alevasquez.dev';

// Viewport sizes in CSS px. `bar` is the status bar the OS draws over the top.
const DEVICES = [
  { id: 'iphone-16-pro', name: 'iPhone 16 Pro', w: 402, h: 874, radius: 56, bezel: 12, bar: 54, cutout: 'island' },
  { id: 'iphone-16-pro-max', name: 'iPhone 16 Pro Max', w: 440, h: 956, radius: 60, bezel: 12, bar: 54, cutout: 'island' },
  { id: 'iphone-se', name: 'iPhone SE', w: 375, h: 667, radius: 44, bezel: 12, bar: 20, cutout: 'classic' },
  { id: 'pixel-9', name: 'Pixel 9', w: 412, h: 923, radius: 46, bezel: 11, bar: 32, cutout: 'hole' },
  { id: 'galaxy-s24', name: 'Galaxy S24', w: 360, h: 780, radius: 40, bezel: 10, bar: 30, cutout: 'hole' },
  { id: 'ipad-mini', name: 'iPad mini', w: 744, h: 1133, radius: 36, bezel: 18, bar: 24, cutout: 'none', tablet: true },
  { id: 'ipad-air', name: 'iPad Air 11″', w: 820, h: 1180, radius: 36, bezel: 18, bar: 24, cutout: 'none', tablet: true },
];
const COMPARE = ['iphone-se', 'iphone-16-pro', 'galaxy-s24', 'ipad-mini'];

const PICKS = [
  { label: "Ale's Fun Lab", url: HOME },
  { label: 'alevasquez.dev', url: 'https://www.alevasquez.dev' },
  { label: 'Wikipedia', url: 'https://en.m.wikipedia.org/wiki/Responsive_web_design' },
  { label: 'Tailwind CSS', url: 'https://tailwindcss.com' },
];

// Sites known to refuse being shown inside another page (X-Frame-Options / CSP).
const BLOCKED = /(^|\.)(google\.[a-z.]+|youtube\.com|github\.com|apple\.com|facebook\.com|instagram\.com|x\.com|twitter\.com|linkedin\.com|amazon\.[a-z.]+|stripe\.com|framer\.com|figma\.com|netflix\.com|paypal\.com|microsoft\.com|tiktok\.com)$/i;

// Accepts "example.com", "http://…" or "https://…". Remote http is upgraded
// because an https page can't frame plain http (mixed content).
function normalize(raw) {
  let s = String(raw || '').trim();
  if (!s) return null;
  if (!/^[a-z]+:\/\//i.test(s)) s = 'https://' + s;
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    if (!u.hostname.includes('.') && u.hostname !== 'localhost') return null;
    const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(u.hostname);
    if (u.protocol === 'http:' && !local) u.protocol = 'https:';
    return u.href;
  } catch {
    return null;
  }
}

const hostOf = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; } };

// Text color for a status bar drawn over `bg` (any CSS color).
function inkFor(bg) {
  const m = String(bg).match(/\d+(\.\d+)?/g);
  if (!m || m.length < 3) return '#111';
  const [r, g, b] = m.map(Number);
  return 0.299 * r + 0.587 * g + 0.114 * b > 150 ? '#111' : '#fff';
}

/* The page's own top color, so the status bar blends in like Safari does.
   Only readable for same-origin pages (this site); others keep white. */
function readTint(frame) {
  try {
    const doc = frame.contentDocument;
    const meta = doc.querySelector('meta[name="theme-color"]:not([media])')?.content;
    const bg = getComputedStyle(doc.body).backgroundColor;
    const solid = bg && !/rgba\(.*,\s*0\)$|transparent/.test(bg) ? bg : getComputedStyle(doc.documentElement).backgroundColor;
    return solid && !/rgba\(.*,\s*0\)$|transparent/.test(solid) ? solid : meta || null;
  } catch {
    return null;
  }
}

function StatusBar({ device, tint }) {
  const bg = tint || '#fff';
  return (
    <div className="mp-bar" style={{ height: device.bar, background: bg, color: inkFor(bg) }} aria-hidden="true">
      <span className="mp-bar-time" style={{ fontSize: device.bar > 40 ? 16 : 12 }}>9:41</span>
      <span className="mp-bar-icons">
        <svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></svg>
        <svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 2.2c2.2 0 4.2.8 5.7 2.2l1.2-1.2A9.8 9.8 0 0 0 7.5.5 9.8 9.8 0 0 0 .6 3.2l1.2 1.2a8.2 8.2 0 0 1 5.7-2.2Zm0 3.4c1.3 0 2.5.5 3.3 1.3l1.2-1.2a6.4 6.4 0 0 0-9 0l1.2 1.2c.8-.8 2-1.3 3.3-1.3Zm0 3.4c.5 0 .9.2 1.1.5L7.5 10.6 6.4 9.5c.2-.3.6-.5 1.1-.5Z" /></svg>
        <svg width="25" height="12" viewBox="0 0 25 12"><rect x=".5" y=".5" width="21" height="11" rx="3" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="16" height="8" rx="1.6" /><rect x="22.6" y="4" width="1.6" height="4" rx=".8" opacity=".5" /></svg>
      </span>
    </div>
  );
}

function Device({ device, landscape, url, scale, reload, index }) {
  const { t } = useLang();
  const [loaded, setLoaded] = useState(false);
  const [tint, setTint] = useState(null);
  const w = landscape ? device.h : device.w;
  const h = landscape ? device.w : device.h;
  // Phones hide the status bar in landscape; tablets keep it.
  const bar = landscape && !device.tablet ? 0 : device.bar;
  const classic = device.cutout === 'classic';
  const chin = classic ? (landscape ? 0 : 64) : 0;
  const side = classic && landscape ? 64 : 0;
  const fw = w + device.bezel * 2 + side * 2;
  const fh = h + device.bezel * 2 + chin * 2;
  const blocked = BLOCKED.test(hostOf(url));

  return (
    <motion.figure
      className="mp-device"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0, width: fw * scale, height: fh * scale + 44 }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.06 }}
    >
      <motion.div
        className={'mp-frame' + (device.tablet ? ' mp-tablet' : '')}
        animate={{ width: fw, height: fh, scale, borderRadius: device.radius + (classic ? 8 : 0) }}
        transition={{ duration: 0.6, ease: EASE }}
        style={{ padding: `${device.bezel + chin}px ${device.bezel + side}px` }}
      >
        {classic && !landscape && <><span className="mp-speaker" /><span className="mp-home" /></>}
        {classic && landscape && <span className="mp-home mp-home-side" />}
        <div className="mp-screen" style={{ borderRadius: classic ? 4 : device.radius - device.bezel }}>
          {bar > 0 && <StatusBar device={device} tint={tint} />}
          {!landscape && device.cutout === 'island' && <span className="mp-island" />}
          {!landscape && device.cutout === 'hole' && <span className="mp-hole" style={{ top: bar / 2 - 6 }} />}
          <div className="mp-view" style={{ top: bar }}>
            {!blocked && (
              <iframe
                key={url + reload}
                src={url}
                title={t(`${url} on ${device.name}`, `${url} en ${device.name}`)}
                width={w}
                height={h - bar}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
                onLoad={e => { setLoaded(true); setTint(readTint(e.currentTarget)); }}
              />
            )}
            <AnimatePresence>
              {(blocked || !loaded) && (
                <motion.div className="mp-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {blocked ? (
                    <>
                      <span style={{ fontSize: 40 }} aria-hidden="true">🙈</span>
                      <strong>{t(`${hostOf(url)} doesn’t allow previews`, `${hostOf(url)} no permite vistas previas`)}</strong>
                      <span className="small muted">{t('Big sites often block being shown inside other pages. Your own sites and most small ones work fine.', 'Los sitios grandes suelen bloquear que se muestren dentro de otras páginas. Tus propios sitios y la mayoría de los pequeños funcionan bien.')}</span>
                      <a className="btn btn-ghost btn-sm" href={url} target="_blank" rel="noreferrer">{t('Open in a new tab ↗', 'Abrir en otra pestaña ↗')}</a>
                    </>
                  ) : (
                    <span className="mp-spinner" aria-label={t('Loading', 'Cargando')} />
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {!classic && <span className="mp-indicator" />}
        </div>
      </motion.div>
      <figcaption className="mp-caption">
        <strong>{device.name}</strong>
        <span className="mono small muted">{w}×{h}</span>
      </figcaption>
    </motion.figure>
  );
}

export default function MobilePreview() {
  const { t } = useLang();
  const [params] = useSearchParams();
  const [url, setUrl] = useState(() => normalize(params.get('url')) || HOME);
  const [draft, setDraft] = useState(url);
  const [deviceId, setDeviceId] = useState(() => (DEVICES.some(d => d.id === params.get('d')) ? params.get('d') : 'iphone-16-pro'));
  const [landscape, setLandscape] = useState(() => params.get('o') === 'landscape');
  const [mode, setMode] = useState(() => (params.get('m') === 'compare' ? 'compare' : 'single'));
  const [reload, setReload] = useState(0);
  const [invalid, setInvalid] = useState(false);
  const [box, setBox] = useState({ w: 900, h: 760 });
  const stageRef = useRef(null);

  useUrlState(() => ({ url: url === HOME ? '' : url, d: deviceId === 'iphone-16-pro' ? '' : deviceId, o: landscape ? 'landscape' : '', m: mode === 'compare' ? 'compare' : '' }), [url, deviceId, landscape, mode]);

  // Room available for the frames: stage width, and most of the window height.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.clientWidth, h: Math.max(420, window.innerHeight * 0.8) });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); window.removeEventListener('resize', measure); };
  }, []);

  const shown = useMemo(() => (mode === 'compare' ? COMPARE : [deviceId]).map(id => DEVICES.find(d => d.id === id)), [mode, deviceId]);

  // One shared scale so devices keep their real relative sizes.
  const scale = useMemo(() => {
    const dims = shown.map(d => {
      const classic = d.cutout === 'classic';
      const w = (landscape ? d.h : d.w) + d.bezel * 2 + (classic && landscape ? 128 : 0);
      const h = (landscape ? d.w : d.h) + d.bezel * 2 + (classic && !landscape ? 128 : 0);
      return { w, h };
    });
    const gap = 28;
    const avail = box.w - 24; // padding + room for subpixel rounding
    const maxH = Math.max(...dims.map(d => d.h));
    // Gaps don't scale. On narrow screens compare mode wraps, so fit the widest frame.
    const fit = box.w < 900 && dims.length > 1
      ? avail / Math.max(...dims.map(d => d.w))
      : (avail - gap * (dims.length - 1)) / dims.reduce((s, d) => s + d.w, 0);
    return Math.min(1, fit, box.h / maxH);
  }, [shown, landscape, box]);

  function go(next) {
    const u = normalize(next ?? draft);
    if (!u) { setInvalid(true); return; }
    setInvalid(false);
    setDraft(u);
    if (u === url) setReload(r => r + 1);
    setUrl(u);
    haptic(8);
    track('Mobile preview', { host: hostOf(u) });
  }

  return (
    <ToolPage id="mobile-preview" intro="Type any address and see it inside real phone and tablet frames, at the exact viewport sizes those devices use. Rotate to landscape, or compare four devices side by side.">
      <div className="stack">
        <Reveal className="card mp-toolbar">
          <form className="mp-url" onSubmit={e => { e.preventDefault(); go(); }}>
            <label className="sr-only" htmlFor="mp-url">{t('Page address', 'Dirección de la página')}</label>
            <span className="mp-url-lock" aria-hidden="true">🔒</span>
            <input
              id="mp-url"
              className="input"
              type="url"
              inputMode="url"
              autoComplete="url"
              spellCheck={false}
              value={draft}
              onChange={e => { setDraft(e.target.value); setInvalid(false); }}
              onFocus={e => e.target.select()}
              aria-invalid={invalid || undefined}
              aria-describedby={invalid ? 'mp-url-err' : undefined}
              placeholder="https://example.com"
            />
            <motion.button type="submit" className="btn btn-primary btn-sm" whileTap={{ scale: 0.94 }}>{t('Load', 'Cargar')}</motion.button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setReload(r => r + 1)} aria-label={t('Reload', 'Recargar')} title={t('Reload', 'Recargar')}>↻</button>
            <a className="btn btn-ghost btn-sm" href={url} target="_blank" rel="noreferrer" aria-label={t('Open in a new tab', 'Abrir en otra pestaña')} title={t('Open in a new tab', 'Abrir en otra pestaña')}>↗</a>
          </form>
          {invalid && <p id="mp-url-err" className="small" style={{ margin: 0, color: 'var(--fail)' }}>{t('That doesn’t look like a web address. Try something like example.com.', 'Eso no parece una dirección web. Prueba algo como ejemplo.com.')}</p>}
          <div className="chip-row">
            {PICKS.map(p => (
              <button key={p.url} type="button" className={'mp-chip' + (url === p.url ? ' is-active' : '')} onClick={() => go(p.url)}>{p.label}</button>
            ))}
          </div>
          <div className="mp-controls">
            <Segmented label={t('Layout', 'Diseño')} value={mode} onChange={v => { setMode(v); track('Mobile preview mode', { mode: v }); }} options={[{ value: 'single', label: t('One device', 'Un dispositivo') }, { value: 'compare', label: t('Compare 4', 'Comparar 4') }]} />
            <motion.button type="button" className="btn btn-ghost btn-sm" whileTap={{ rotate: 90, scale: 0.94 }} onClick={() => setLandscape(l => !l)} aria-pressed={landscape}>
              <span aria-hidden="true">⟳</span> {landscape ? t('Landscape', 'Horizontal') : t('Portrait', 'Vertical')}
            </motion.button>
          </div>
          <AnimatePresence initial={false}>
            {mode === 'single' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                <Segmented scroll label={t('Device', 'Dispositivo')} value={deviceId} onChange={setDeviceId} options={DEVICES.map(d => ({ value: d.id, label: d.name }))} />
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>

        <div ref={stageRef} className="mp-stage" style={{ '--gap': '28px' }}>
          {shown.map((d, i) => <Device key={d.id} device={d} landscape={landscape} url={url} scale={scale} reload={reload} index={i} />)}
        </div>

        <p className="small muted" style={{ textAlign: 'center', margin: 0 }}>
          {t('Layouts respond to the real device width. Sites that detect phones by browser name may still show their desktop version. Blank screen? That site blocks previews: use ↗ to open it.', 'Los diseños responden al ancho real del dispositivo. Los sitios que detectan teléfonos por el nombre del navegador pueden seguir mostrando su versión de escritorio. ¿Pantalla en blanco? Ese sitio bloquea las vistas previas: usa ↗ para abrirlo.')}
        </p>
      </div>
    </ToolPage>
  );
}
