import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { RangeField, Reveal, Segmented } from '../components/ui';
import { EASE } from '../lib/motion';
import { LANGS, STRINGS, translate } from '../lib/i18n-strings';
import './TextExpansion.css';

const FIXES = {
  nav: 'Let nav items size to their content and wrap (flex-wrap), or move overflow into a “More” menu.',
  tab: 'Drop fixed tab widths; make the tab bar horizontally scrollable instead of squeezing labels.',
  label: 'Don’t give labels a fixed width — stack the label above the field when space runs out.',
  button: 'Use min-width instead of width, and allow two-line labels (or shorter copy) on small screens.',
  badge: 'Pad badges instead of fixing their width.',
  heading: 'Let headings wrap; never put nowrap + overflow:hidden on content titles.',
  table: 'Let header cells wrap or use table-layout:auto; reserve truncation for user data with a tooltip.',
  toast: 'Allow the toast to wrap, and keep the action button from being squeezed.',
  frame: 'Something has a fixed width larger than the container — look for width/min-width in px.',
};

export default function TextExpansion() {
  const [lang, setLang] = useState('de');
  const [intensity, setIntensity] = useState(100);
  const [layout, setLayout] = useState('fragile');
  const [width, setWidth] = useState(440);
  const [issues, setIssues] = useState([]);
  const frameRef = useRef(null);

  const t = key => translate(key, lang, intensity / 100);
  const langMeta = LANGS.find(l => l.value === lang);

  const growth = useMemo(() => {
    const keys = Object.keys(STRINGS);
    const en = keys.reduce((n, k) => n + STRINGS[k].en.length, 0);
    const other = keys.reduce((n, k) => n + translate(k, lang, intensity / 100).length, 0);
    return other / en - 1;
  }, [lang, intensity]);

  // Measure after every render that can change text or space.
  useLayoutEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const measure = () => {
      const found = [];
      frame.querySelectorAll('[data-check]').forEach(el => {
        const cut = el.scrollWidth > el.clientWidth + 1;
        el.dataset.broken = String(cut);
        if (cut) found.push({ name: el.dataset.check, fix: el.dataset.fix, text: el.textContent });
      });
      const ui = frame.firstElementChild;
      if (ui && ui.scrollWidth > frame.clientWidth + 1) found.push({ name: 'Whole layout', fix: 'frame', text: 'Content is wider than the screen' });
      setIssues(found);
    };
    measure();
    document.fonts?.ready.then(measure);
  }, [lang, intensity, layout, width]);

  const C = (name, fix, children, as = 'span', extra = {}) => {
    const Tag = as;
    return <Tag data-check={name} data-fix={fix} {...extra}>{children}</Tag>;
  };

  return (
    <ToolPage id="text-expansion" intro="German is often 30% longer than English, and short labels can double. Switch languages, crank up pseudo-localization, and shrink the screen to see what breaks. Toggle the resilient layout to see the CSS fixes that make the same UI survive translation.">
      <div className="grid-sidebar">
        <div className="stack sticky-col">
          <Reveal className="card">
            <h2 className="eyebrow">Language</h2>
            <div className="stack" style={{ gap: 16 }}>
              <Segmented full label="Language" value={lang} onChange={setLang} options={LANGS.map(l => ({ value: l.value, label: l.label }))} />
              <AnimatePresence initial={false}>
                {lang === 'pseudo' && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                    <RangeField label="Expansion intensity" value={intensity} min={0} max={200} step={10} onChange={setIntensity} format={v => `${v}%`} />
                    <p className="small muted" style={{ margin: '8px 0 0' }}>Pseudo text adds accents, ⟦brackets⟧ (to spot concatenation and truncation) and padding based on IBM’s expansion guidelines.</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="field-label">Text length vs English</span>
                <motion.span key={Math.round(growth * 100)} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mono" style={{ fontSize: 22, color: growth > 0.25 ? 'var(--fail)' : 'var(--text)' }}>
                  {growth >= 0 ? '+' : ''}{Math.round(growth * 100)}%
                </motion.span>
              </div>
            </div>
          </Reveal>
          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">Layout</h2>
            <div className="stack" style={{ gap: 16 }}>
              <Segmented full label="CSS" value={layout} onChange={setLayout} options={[{ value: 'fragile', label: 'Fragile CSS' }, { value: 'resilient', label: 'Resilient CSS' }]} />
              <RangeField label="Screen width" value={width} min={300} max={900} step={10} onChange={setWidth} format={v => `${v}px`} />
            </div>
          </Reveal>
        </div>

        <div className="stack">
          <Reveal className="card" style={{ background: 'var(--surface-2)', overflow: 'hidden' }}>
            <h2 className="eyebrow">
              Sample UI · <span lang={langMeta.lang}>{langMeta.label}</span>
              <motion.span key={issues.length} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 18 }} className={'badge ' + (issues.length ? 'badge-fail' : 'badge-pass')}>
                {issues.length ? `${issues.length} broken` : '✓ Nothing breaks'}
              </motion.span>
            </h2>
            <div style={{ overflowX: 'auto' }} data-lenis-prevent>
              <div ref={frameRef} className="tx-frame" style={{ width }} lang={langMeta.lang}>
                <div className={`tx-ui tx-${layout}`}>
                  <nav className="tx-nav" aria-label="Sample navigation">
                    <span className="tx-brand">{t('brand')}</span>
                    {C('Nav: Home', 'nav', t('navHome'), 'a', { href: '#home', tabIndex: -1, onClick: e => e.preventDefault() })}
                    {C('Nav: Pricing', 'nav', t('navPricing'), 'a', { href: '#pricing', tabIndex: -1, onClick: e => e.preventDefault() })}
                    {C('Nav: Settings', 'nav', t('navSettings'), 'a', { href: '#settings', tabIndex: -1, onClick: e => e.preventDefault() })}
                  </nav>
                  <h3 className="tx-title">{t('title')}</h3>
                  <div className="tx-tabs" role="presentation">
                    {C('Tab: Overview', 'tab', t('tabOverview'))}
                    {C('Tab: Activity', 'tab', t('tabActivity'))}
                    {C('Tab: Billing', 'tab', t('tabBilling'))}
                  </div>
                  <div className="tx-field">
                    <div className="tx-field-row">
                      {C('Form label', 'label', t('label'), 'label', { className: 'tx-label', htmlFor: 'tx-email' })}
                      <input id="tx-email" className="tx-input" placeholder={t('placeholder')} readOnly tabIndex={-1} />
                    </div>
                    <span className="tx-help">{t('help')}</span>
                  </div>
                  <div className="tx-actions">
                    {C('Primary button', 'button', t('save'), 'button', { className: 'tx-btn', type: 'button', tabIndex: -1 })}
                    {C('Secondary button', 'button', t('cancel'), 'button', { className: 'tx-btn ghost', type: 'button', tabIndex: -1 })}
                  </div>
                  <div className="tx-card">
                    <span className="tx-card-icon" aria-hidden="true">✦</span>
                    <div style={{ minWidth: 0 }}>
                      <div className="tx-card-title">
                        {C('Card title', 'heading', t('cardTitle'))}
                        {C('Badge', 'badge', t('badge'), 'span', { className: 'tx-badge' })}
                      </div>
                      <div className="tx-card-body">{t('cardBody')}</div>
                    </div>
                    {C('Card button', 'button', t('addToCart'), 'button', { className: 'tx-btn', type: 'button', tabIndex: -1 })}
                  </div>
                  <table className="tx-table">
                    <thead>
                      <tr>
                        <th>{C('Table header: Status', 'table', t('colStatus'))}</th>
                        <th>{C('Table header: Last updated', 'table', t('colUpdated'))}</th>
                        <th>{C('Table header: Actions', 'table', t('colActions'))}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{C('Table cell: Status', 'table', t('rowStatus'))}</td>
                        <td>{C('Table cell: Updated', 'table', t('rowUpdated'))}</td>
                        <td>{C('Table cell: Action', 'table', t('rowAction'))}</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="tx-toast" role="presentation">
                    <span style={{ flex: 1, minWidth: 0 }}>{t('toast')}</span>
                    {C('Toast action', 'toast', t('toastAction'), 'span', { className: 'tx-toast-action' })}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">What broke & how to fix it</h2>
            {issues.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>
                {layout === 'resilient' ? 'The resilient layout absorbs the longer text. 🎉' : 'Nothing is cut off at this width — try German, pseudo text or a narrower screen.'}
              </p>
            ) : (
              <div className="check-list">
                <AnimatePresence initial={false}>
                  {issues.map(i => (
                    <motion.div key={i.name} layout className="check-row" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.3, ease: EASE }} style={{ gridTemplateColumns: '1fr' }}>
                      <div>
                        <div className="check-row-label">{i.name} <span className="badge badge-fail" style={{ marginLeft: 6 }}>cut off</span></div>
                        <div className="check-row-sub" lang={langMeta.lang}>“{i.text}”</div>
                        <div className="small" style={{ marginTop: 6 }}>{FIXES[i.fix]}</div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </ToolPage>
  );
}
