import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useSpring, useTransform } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { Reveal, Segmented } from '../components/ui';
import { EASE } from '../lib/motion';
import { audit, PASSED_ES, SAMPLE_HTML, score } from '../lib/a11y';
import { useLang } from '../i18n';
import { track } from '../lib/analytics';

const SEVERITY = {
  error: { label: 'Error', es: 'Error', cls: 'badge-fail' },
  warning: { label: 'Warning', es: 'Advertencia', cls: 'badge-neutral', style: { color: '#b7791f', background: 'rgba(255, 206, 31, 0.16)' } },
  notice: { label: 'Notice', es: 'Aviso', cls: 'badge-neutral' },
};

const HIGHLIGHT_CSS = `.__a11y-hl { outline: 3px solid #cd57ff !important; outline-offset: 3px !important; box-shadow: 0 0 0 9999px rgba(205,87,255,.12) !important; transition: outline-color .2s; }`;

function ScoreRing({ value }) {
  const { t } = useLang();
  const spring = useSpring(0, { stiffness: 90, damping: 20 });
  useEffect(() => { spring.set(value); }, [spring, value]);
  const text = useTransform(spring, v => Math.round(v));
  const R = 52, C = 2 * Math.PI * R;
  const offset = useTransform(spring, v => C * (1 - v / 100));
  const color = value >= 90 ? 'var(--pass)' : value >= 60 ? '#FFCE1F' : 'var(--fail)';
  return (
    <div style={{ position: 'relative', width: 132, height: 132, flex: 'none' }}>
      <svg viewBox="0 0 132 132" width="132" height="132" aria-hidden="true">
        <circle cx="66" cy="66" r={R} fill="none" stroke="var(--surface-3)" strokeWidth="12" />
        <motion.circle cx="66" cy="66" r={R} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={C} style={{ strokeDashoffset: offset, rotate: -90, transformOrigin: '50% 50%' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <motion.div className="display" style={{ fontSize: 40, lineHeight: 1 }}>{text}</motion.div>
          <div className="small muted">{t('score', 'puntaje')}</div>
        </div>
      </div>
    </div>
  );
}

export default function A11yAudit() {
  const { lang, t } = useLang();
  const [html, setHtml] = useState(SAMPLE_HTML);
  const [rendered, setRendered] = useState(SAMPLE_HTML);
  const [result, setResult] = useState(null);
  const [filter, setFilter] = useState('all');
  const [active, setActive] = useState(null);
  const frameRef = useRef(null);

  // Debounce typing → re-render the sandboxed preview.
  useEffect(() => {
    const id = setTimeout(() => setRendered(html), 500);
    return () => clearTimeout(id);
  }, [html]);

  function runAudit() {
    const doc = frameRef.current?.contentDocument;
    if (!doc) return;
    if (/<html[\s>]/i.test(rendered)) doc.documentElement.setAttribute('data-full-doc', '1');
    const style = doc.createElement('style');
    style.textContent = HIGHLIGHT_CSS;
    doc.head?.appendChild(style);
    const r = audit(doc, lang);
    doc.documentElement.removeAttribute('data-full-doc');
    setResult(r);
    setActive(null);
    track('A11y audit', { issues: String(r.issues.length) });
  }

  function focusIssue(issue) {
    const doc = frameRef.current?.contentDocument;
    doc?.querySelectorAll('.__a11y-hl').forEach(n => n.classList.remove('__a11y-hl'));
    setActive(issue.id);
    if (issue.el) {
      issue.el.classList.add('__a11y-hl');
      issue.el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }

  const issues = result?.issues || [];
  const shown = filter === 'all' ? issues : issues.filter(i => i.severity === filter);
  const count = sev => issues.filter(i => i.severity === sev).length;

  return (
    <ToolPage id="a11y-audit" intro="Paste a page or a snippet of HTML. It renders in a locked-down sandbox (scripts never run), then gets checked for missing alt text and labels, unnamed buttons and links, heading order, tap targets under 24×24px and low text contrast. Click any issue to find it in the preview.">
      <div className="grid-2">
        <div className="stack">
          <Reveal className="card">
            <h2 className="eyebrow">
              HTML
              <span className="chip-row">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setHtml(SAMPLE_HTML)}>{t('Sample', 'Ejemplo')}</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setHtml('')}>{t('Clear', 'Borrar')}</button>
              </span>
            </h2>
            <textarea className="textarea" data-lenis-prevent spellCheck={false} value={html} onChange={e => setHtml(e.target.value)} aria-label={t('HTML to audit', 'HTML a auditar')} placeholder="<button><svg …></svg></button>" style={{ minHeight: 320 }} />
          </Reveal>
          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">{t('Rendered preview', 'Vista previa renderizada')}</h2>
            <iframe
              ref={frameRef}
              title={t('Audited HTML preview', 'Vista previa del HTML auditado')}
              sandbox="allow-same-origin"
              srcDoc={rendered}
              onLoad={runAudit}
              style={{ width: '100%', height: 420, border: 'none', borderRadius: 16, background: '#fff', boxShadow: 'inset 0 0 0 1px var(--border)' }}
            />
          </Reveal>
        </div>

        <div className="stack">
          <Reveal className="card" delay={0.05}>
            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
              <ScoreRing value={result ? score(issues) : 0} />
              <div className="stack" style={{ gap: 8, flex: 1, minWidth: 180 }}>
                <h2 className="card-title" style={{ margin: 0 }}>
                  {!result ? t('Auditing…', 'Auditando…') : issues.length === 0 ? t('No issues found 🎉', 'No se encontraron problemas 🎉') : t(`${issues.length} thing${issues.length === 1 ? '' : 's'} to fix`, `${issues.length} cosa${issues.length === 1 ? '' : 's'} por corregir`)}
                </h2>
                <div className="chip-row">
                  <span className="badge badge-fail">{count('error')} {t('errors', 'errores')}</span>
                  <span className="badge badge-neutral" style={SEVERITY.warning.style}>{count('warning')} {t('warnings', 'advertencias')}</span>
                  <span className="badge badge-neutral">{count('notice')} {t('notices', 'avisos')}</span>
                </div>
                <p className="small muted" style={{ margin: 0 }}>{t('Automated checks catch roughly a third of real issues — still test with a keyboard and a screen reader.', 'Las verificaciones automáticas detectan cerca de un tercio de los problemas reales: prueba también con teclado y lector de pantalla.')}</p>
              </div>
            </div>
          </Reveal>

          <Reveal className="card" delay={0.1}>
            <h2 className="eyebrow">
              {t('Issues', 'Problemas')}
              <Segmented label={t('Filter issues', 'Filtrar problemas')} value={filter} onChange={setFilter} options={[{ value: 'all', label: t('All', 'Todos') }, { value: 'error', label: t('Errors', 'Errores') }, { value: 'warning', label: t('Warnings', 'Advertencias') }, { value: 'notice', label: t('Notices', 'Avisos') }]} />
            </h2>
            <div className="check-list" style={{ maxHeight: 640, overflow: 'auto' }} data-lenis-prevent>
              <AnimatePresence initial={false} mode="popLayout">
                {shown.map((issue, i) => {
                  const sev = SEVERITY[issue.severity];
                  return (
                    <motion.button
                      key={issue.rule + issue.id}
                      type="button"
                      layout
                      className="check-row"
                      onClick={() => focusIssue(issue)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.3, ease: EASE, delay: Math.min(i * 0.025, 0.4) }}
                      style={{ border: 'none', textAlign: 'left', color: 'var(--text)', gridTemplateColumns: '1fr', boxShadow: active === issue.id ? 'inset 0 0 0 1.5px var(--focus)' : undefined }}
                    >
                      <span style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={'badge ' + sev.cls} style={sev.style}>{t(sev.label, sev.es)}</span>
                        <span className="check-row-label">{issue.message}</span>
                      </span>
                      {issue.snippet && <code className="mono small muted" style={{ display: 'block', marginTop: 6, overflowWrap: 'anywhere' }}>{issue.snippet}</code>}
                      <AnimatePresence initial={false}>
                        {active === issue.id && (
                          <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ display: 'block', overflow: 'hidden' }}>
                            <span className="small" style={{ display: 'block', marginTop: 8 }}><b>{t('Fix:', 'Solución:')}</b> {issue.fix}</span>
                            <span className="small muted" style={{ display: 'block', marginTop: 4 }}>WCAG {issue.wcag}</span>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
              {result && shown.length === 0 && <p className="muted small" style={{ margin: 0 }}>{t('Nothing in this category.', 'Nada en esta categoría.')}</p>}
            </div>
          </Reveal>

          {result?.passed?.length > 0 && (
            <Reveal className="card" delay={0.1}>
              <h2 className="eyebrow">{t('Passed', 'Aprobado')}</h2>
              <div className="chip-row">
                {result.passed.map(p => <span key={p} className="badge badge-pass">✓ {t(p, PASSED_ES[p])}</span>)}
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </ToolPage>
  );
}
