import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ToolPage from '../components/ToolPage';
import { CopyButton, Reveal, Segmented } from '../components/ui';
import { EASE } from '../lib/motion';
import { colorRgba, FORMATS, formatColor, kebab, parseTokens, resolveTokens, SAMPLES } from '../lib/tokens';
import useCopy from '../hooks/useCopy';
import { track } from '../lib/analytics';
import { useLang } from '../i18n';

function download(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: filename });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function TokenPreview({ t }) {
  if (t.type === 'color') {
    const c = colorRgba(t.value);
    return <span className="checker" style={{ width: 36, height: 36, borderRadius: 10, display: 'block', overflow: 'hidden', flex: 'none' }}><span style={{ display: 'block', width: '100%', height: '100%', background: c ? `rgb(${c.r} ${c.g} ${c.b} / ${c.a})` : 'transparent', boxShadow: 'inset 0 0 0 1px rgba(127,127,127,.3)', borderRadius: 10 }} /></span>;
  }
  if (t.type === 'dimension') {
    const px = parseFloat(t.css) * (/rem|em/.test(t.css) ? 16 : 1);
    if (/radius|rounded/i.test(t.path.join('.'))) return <span style={{ width: 36, height: 36, flex: 'none', border: '2px solid var(--accent-c)', borderRadius: Math.min(px, 18), display: 'block' }} />;
    return <span style={{ width: 36, flex: 'none', display: 'flex', alignItems: 'center' }}><motion.span initial={{ width: 0 }} animate={{ width: Math.max(2, Math.min(36, px)) }} transition={{ duration: 0.6, ease: EASE }} style={{ height: 8, borderRadius: 4, background: 'var(--accent-grad-linear)', display: 'block' }} /></span>;
  }
  if (t.type === 'fontFamily') return <span style={{ width: 36, flex: 'none', fontFamily: t.css, fontSize: 24, lineHeight: 1, textAlign: 'center' }}>Aa</span>;
  if (t.type === 'cubicBezier' && Array.isArray(t.value)) {
    const [a, b, c, d] = t.value;
    return <svg width="36" height="36" viewBox="-0.1 -0.3 1.2 1.6" style={{ flex: 'none' }} aria-hidden="true"><path d={`M0 1 C ${a} ${1 - b} ${c} ${1 - d} 1 0`} fill="none" stroke="var(--accent-c)" strokeWidth="0.08" /></svg>;
  }
  if (t.type === 'shadow') return <span style={{ width: 30, height: 30, margin: 3, flex: 'none', borderRadius: 8, background: 'var(--surface)', boxShadow: t.css, display: 'block' }} />;
  return <span className="mono muted" style={{ width: 36, flex: 'none', fontSize: 11, textAlign: 'center' }}>{t.type?.slice(0, 4) || '—'}</span>;
}

export default function TokenConverter() {
  const { t: tr } = useLang();
  const [text, setText] = useState(SAMPLES.dtcg.text);
  const [format, setFormat] = useState('css');
  const [mode, setMode] = useState(null);
  const [prefix, setPrefix] = useState('');
  const [colorFormat, setColorFormat] = useState('hex');
  const [keepAliases, setKeepAliases] = useState(true);
  const [copied, copy] = useCopy();
  const fileRef = useRef(null);

  const result = useMemo(() => {
    try {
      const parsed = parseTokens(text, mode);
      const { tokens, issues } = resolveTokens(parsed.tokens);
      return { ok: true, ...parsed, tokens, issues };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }, [text, mode]);

  const fmt = FORMATS.find(f => f.value === format);
  const output = result.ok ? fmt.fn(result.tokens, { prefix: kebab(prefix), colorFormat, keepAliases }) : '';
  const aliasCount = result.ok ? result.tokens.filter(t => t.ref).length : 0;

  function openFile(file) {
    if (!file) return;
    file.text().then(t => { setText(t); setMode(null); track('Tokens file opened'); });
  }

  return (
    <ToolPage id="token-converter" intro="Paste W3C design tokens, a Tokens Studio file or a Figma Variables export. Aliases are resolved (and kept as references where the format allows), composites like typography are expanded, and you get CSS, SCSS, Tailwind v4, SwiftUI or flat JSON — all in your browser.">
      <div className="grid-2">
        <Reveal className="card">
          <h2 className="eyebrow">
            {tr('Tokens in', 'Tokens de entrada')}
            <span className="chip-row">
              {Object.entries(SAMPLES).map(([key, s]) => (
                <motion.button key={key} type="button" className="btn btn-ghost btn-sm" whileTap={{ scale: 0.94 }} onClick={() => { setText(s.text); setMode(null); }}>
                  {s.label === 'Figma Variables' ? tr('Figma Variables', 'Variables de Figma') : s.label}
                </motion.button>
              ))}
            </span>
          </h2>
          <textarea
            className="textarea"
            data-lenis-prevent
            spellCheck={false}
            value={text}
            aria-label={tr('Token JSON', 'JSON de tokens')}
            aria-invalid={!result.ok}
            onChange={e => setText(e.target.value)}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); openFile(e.dataTransfer.files?.[0]); }}
            style={{ minHeight: 460 }}
          />
          <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={e => openFile(e.target.files?.[0])} />
          <div className="status-line">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={result.ok ? 'ok' : 'err'} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={'badge ' + (result.ok ? 'badge-pass' : 'badge-fail')} role="status">
                {result.ok ? `✓ ${result.format}` : `✕ ${result.error}`}
              </motion.span>
            </AnimatePresence>
            {result.ok && <span className="badge badge-neutral">{result.tokens.length} tokens · {aliasCount} {tr('aliases', 'alias')}</span>}
            {result.ok && result.issues.map(i => <span key={i} className="badge badge-fail">{i}</span>)}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} style={{ marginLeft: 'auto' }}>{tr('Open .json', 'Abrir .json')}</button>
          </div>
          {result.ok && result.modes.length > 1 && (
            <div className="field" style={{ marginTop: 14 }}>
              <span className="field-label">{tr('Mode', 'Modo')}</span>
              <Segmented label={tr('Variable mode', 'Modo de variables')} value={result.mode} onChange={setMode} options={result.modes.map(m => ({ value: m, label: m }))} />
            </div>
          )}
        </Reveal>

        <div className="stack">
          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">{tr('Options', 'Opciones')}</h2>
            <div className="grid-2" style={{ gap: 14 }}>
              <div className="field">
                <label className="field-label" htmlFor="tok-prefix">{tr('Prefix', 'Prefijo')}</label>
                <input id="tok-prefix" className="input" placeholder={tr('e.g. ds', 'p. ej. ds')} value={prefix} onChange={e => setPrefix(e.target.value)} />
              </div>
              <div className="field">
                <span className="field-label">{tr('Colors as', 'Colores en')}</span>
                <Segmented full label={tr('Color format', 'Formato de color')} value={colorFormat} onChange={setColorFormat} options={[{ value: 'hex', label: 'HEX' }, { value: 'rgb', label: 'RGB' }, { value: 'hsl', label: 'HSL' }]} />
              </div>
            </div>
            <div className="field" style={{ marginTop: 14 }}>
              <span className="field-label">{tr('Aliases', 'Alias')}</span>
              <Segmented full label={tr('Aliases', 'Alias')} value={keepAliases ? 'keep' : 'resolve'} onChange={v => setKeepAliases(v === 'keep')} options={[{ value: 'keep', label: tr('Keep as references', 'Mantener como referencias') }, { value: 'resolve', label: tr('Resolve to values', 'Resolver a valores') }]} />
            </div>
          </Reveal>

          <Reveal className="card" delay={0.1}>
            <h2 className="eyebrow">
              {tr('Output', 'Salida')}
              <span className="chip-row">
                <CopyButton copied={copied === 'out'} onClick={() => copy(output, 'out', { name: 'Copy', props: { tool: 'token-converter', format } })}>{tr('Copy', 'Copiar')}</CopyButton>
                <button type="button" className="btn btn-primary btn-sm" disabled={!result.ok} onClick={() => { download(output, `tokens.${fmt.ext}`); track('Download', { tool: 'token-converter', format }); }}>{tr('Download', 'Descargar')}</button>
              </span>
            </h2>
            <Segmented label={tr('Output format', 'Formato de salida')} value={format} onChange={setFormat} options={FORMATS.map(f => ({ value: f.value, label: f.value === 'json' ? tr('Flat JSON', 'JSON plano') : f.label }))} />
            <AnimatePresence mode="wait">
              <motion.pre
                key={format}
                className="code-block"
                data-lenis-prevent
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                style={{ marginTop: 14, maxHeight: 420 }}
              >
                {result.ok ? output : tr('// Fix the JSON on the left to see output', '// Corrige el JSON de la izquierda para ver la salida')}
              </motion.pre>
            </AnimatePresence>
          </Reveal>
        </div>
      </div>

      {result.ok && (
        <Reveal className="card" style={{ marginTop: 'clamp(14px, 1.6vw, 20px)' }}>
          <h2 className="eyebrow">{tr('Preview · click to copy a variable', 'Vista previa · haz clic para copiar una variable')}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: 8 }}>
            {result.tokens.slice(0, 120).map((t, i) => {
              const name = `--${kebab([prefix, ...t.path].filter(Boolean).join('-'))}`;
              return (
                <motion.button
                  key={t.path.join('.')}
                  type="button"
                  className="check-row"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.015, 0.5), duration: 0.35 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => copy(`var(${name})`, name)}
                  style={{ border: 'none', gridTemplateColumns: 'auto minmax(0,1fr)', textAlign: 'left', color: 'var(--text)' }}
                  title={t.description || undefined}
                >
                  <TokenPreview t={t} />
                  <span style={{ minWidth: 0 }}>
                    <span className="mono" style={{ display: 'block', fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{copied === name ? tr('Copied ✓', 'Copiado ✓') : name}</span>
                    <span className="check-row-sub mono" style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.ref ? `→ ${t.ref.join('.')} · ` : ''}{t.type === 'color' ? formatColor(t.value, colorFormat) : t.css}
                    </span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </Reveal>
      )}
    </ToolPage>
  );
}
