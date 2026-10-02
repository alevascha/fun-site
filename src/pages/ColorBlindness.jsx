import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { bestTextColor, deltaE, hexToRgb, normalizeHex } from '../lib/color';
import { simulateHex, VISION_TYPES } from '../lib/colorblind';
import { buildPaletteGroups, HARMONIES } from '../lib/palette';
import ToolPage from '../components/ToolPage';
import { ColorField, RangeField, Reveal, Segmented } from '../components/ui';
import { EASE, REVEAL_VIEWPORT } from '../lib/motion';
import { track } from '../lib/analytics';
import { useLang } from '../i18n';

const DEFAULT_COLORS = ['#D93025', '#1E8E3E', '#F9AB00', '#1A73E8', '#CD57FF', '#5F6368'];
// Below this perceptual distance (CIE76 ΔE) two colors are easy to confuse.
const CONFUSABLE = 12;

function parseColors(param) {
  if (!param) return null;
  const list = param.split(',').map(c => normalizeHex(c)).filter(Boolean);
  return list.length >= 2 ? list.slice(0, 10) : null;
}

function confusablePairs(hexes) {
  const pairs = [];
  for (let i = 0; i < hexes.length; i++) {
    for (let j = i + 1; j < hexes.length; j++) {
      if (deltaE(hexToRgb(hexes[i]), hexToRgb(hexes[j])) < CONFUSABLE) pairs.push([i, j]);
    }
  }
  return pairs;
}

const CHART = [62, 88, 45, 74, 56, 92, 38, 66, 80, 50];

export default function ColorBlindness() {
  const { lang, t } = useLang();
  const vt = v => (lang === 'es' ? { ...v, ...v.es } : v);
  const [params, setParams] = useSearchParams();
  const [colors, setColors] = useState(() => parseColors(params.get('colors')) || DEFAULT_COLORS);
  const [severity, setSeverity] = useState(100);
  const [view, setView] = useState('deuteranopia');

  function commit(next) {
    setColors(next);
    setParams({ colors: next.map(c => c.slice(1)).join(',') }, { replace: true });
  }

  function randomPalette() {
    const harmony = HARMONIES[Math.floor(Math.random() * 6)].id;
    const groups = buildPaletteGroups({ h: Math.random() * 360, s: 70, l: 50 }, harmony);
    const next = groups.flatMap(g => [g.swatches[1].tones[3].hex, g.swatches[3].tones[3].hex]).slice(0, 6);
    commit(next);
    track('Colorblind random palette');
  }

  const sev = severity / 100;
  const rows = useMemo(() => VISION_TYPES.map(v => {
    const sim = colors.map(c => simulateHex(c, v.id, sev));
    return { ...v, sim, pairs: v.id === 'normal' ? [] : confusablePairs(sim).filter(([i, j]) => deltaE(hexToRgb(colors[i]), hexToRgb(colors[j])) >= CONFUSABLE) };
  }), [colors, sev]);

  const viewRow = rows.find(r => r.id === view);
  const worst = rows.reduce((a, b) => (b.pairs.length > a.pairs.length ? b : a), rows[0]);

  return (
    <ToolPage id="color-blindness" intro="Paste a palette (or bring one from the other tools) and see it through the main types of color vision deficiency. Pairs that collapse into each other get flagged, so you know where to add a label, pattern or lightness contrast.">
      <div className="grid-sidebar">
        <div className="stack sticky-col">
          <Reveal className="card">
            <h2 className="eyebrow">
              {t('Palette', 'Paleta')}
              <motion.button type="button" className="btn btn-ghost btn-sm" onClick={randomPalette} whileTap={{ scale: 0.9, rotate: -8 }}>🎲 {t('Random', 'Aleatoria')}</motion.button>
            </h2>
            <div className="stack" style={{ gap: 10 }}>
              <AnimatePresence initial={false}>
                {colors.map((c, i) => (
                  <motion.div
                    key={i}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, alignItems: 'end' }}
                  >
                    <ColorField label={`Color ${i + 1}`} hideLabel value={c} onChange={hex => commit(colors.map((x, j) => (j === i ? hex : x)))} />
                    <button
                      type="button"
                      className="btn btn-ghost btn-icon"
                      aria-label={t(`Remove color ${i + 1}`, `Quitar color ${i + 1}`)}
                      disabled={colors.length <= 2}
                      onClick={() => commit(colors.filter((_, j) => j !== i))}
                      style={{ height: 44, width: 44 }}
                    >
                      ✕
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                disabled={colors.length >= 10}
                onClick={() => commit([...colors, '#8B6CF0'])}
              >
                + {t('Add color', 'Agregar color')}
              </button>
            </div>
          </Reveal>
          <Reveal className="card" delay={0.05}>
            <RangeField label={t('Severity', 'Severidad')} value={severity} min={10} max={100} step={10} onChange={setSeverity} format={v => (v === 100 ? t('Full (‑opia)', 'Total (‑opia)') : `${v}% (${t('‑anomaly', '‑anomalía')})`)} />
            <p className="small muted" style={{ margin: '10px 0 0' }}>{t('Lower values approximate the milder, more common anomalous trichromacy.', 'Los valores bajos se aproximan a la tricromacia anómala, más leve y más común.')}</p>
          </Reveal>
        </div>

        <div className="stack">
          <Reveal className="card">
            <h2 className="eyebrow">{t('Side by side', 'Lado a lado')}</h2>
            <div className="stack" style={{ gap: 18 }}>
              {rows.map((row, ri) => (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={REVEAL_VIEWPORT}
                  transition={{ duration: 0.5, ease: EASE, delay: ri * 0.05 }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div>
                      <strong style={{ fontSize: 15 }}>{vt(row).label}</strong>
                      <span className="small muted" style={{ marginLeft: 8 }}>{vt(row).note}</span>
                    </div>
                    {row.id !== 'normal' && (
                      <span className={'badge ' + (row.pairs.length ? 'badge-fail' : 'badge-pass')}>
                        {row.pairs.length
                          ? t(`${row.pairs.length} pair${row.pairs.length > 1 ? 's' : ''} collapse`, `${row.pairs.length} par${row.pairs.length > 1 ? 'es' : ''} se confunde${row.pairs.length > 1 ? 'n' : ''}`)
                          : t('All distinct', 'Todos distinguibles')}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colors.length}, minmax(0, 1fr))`, gap: 6 }}>
                    {row.sim.map((hex, i) => {
                      const flagged = row.pairs.some(p => p.includes(i));
                      return (
                        <motion.div
                          key={i}
                          initial={false}
                          animate={{ backgroundColor: hex }}
                          transition={{ duration: 0.4 }}
                          title={`${colors[i]} → ${hex}`}
                          style={{
                            height: 'clamp(44px, 6vw, 64px)',
                            borderRadius: 14,
                            boxShadow: flagged ? '0 0 0 2px var(--surface), 0 0 0 4px var(--fail)' : 'inset 0 0 0 1px rgba(127,127,127,.25)',
                            display: 'flex', alignItems: 'flex-end', padding: 6,
                            color: bestTextColor(hexToRgb(hex)),
                            fontFamily: 'var(--font-mono)', fontSize: 10,
                          }}
                        >
                          <span className="hide-sm">{hex}</span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>

          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">{t('In a real UI', 'En una interfaz real')}</h2>
            <Segmented label={t('Vision type', 'Tipo de visión')} value={view} onChange={setView} options={VISION_TYPES.map(v => ({ value: v.id, label: vt(v).short }))} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 16, marginTop: 18 }}>
              <div style={{ background: 'var(--surface-2)', borderRadius: 20, padding: 18, boxShadow: 'inset 0 0 0 1px var(--border)' }}>
                <div className="small muted" style={{ marginBottom: 12 }}>{t('Revenue by channel', 'Ingresos por canal')}</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 160 }}>
                  {viewRow.sim.map((hex, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${CHART[i % CHART.length]}%`, backgroundColor: hex }}
                      transition={{ duration: 0.6, ease: EASE, delay: i * 0.03 }}
                      style={{ flex: 1, borderRadius: '10px 10px 4px 4px' }}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 12 }}>
                  {viewRow.sim.map((hex, i) => (
                    <span key={i} className="small" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <motion.span animate={{ backgroundColor: hex }} style={{ width: 10, height: 10, borderRadius: 3 }} /> {t('Series', 'Serie')} {i + 1}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--surface-2)', borderRadius: 20, padding: 18, boxShadow: 'inset 0 0 0 1px var(--border)', display: 'grid', gap: 10, alignContent: 'start' }}>
                <div className="small muted">{t('Status pills', 'Etiquetas de estado')}</div>
                {viewRow.sim.slice(0, 4).map((hex, i) => (
                  <motion.div
                    key={i}
                    animate={{ backgroundColor: hex, color: bestTextColor(hexToRgb(hex)) }}
                    style={{ padding: '10px 14px', borderRadius: 999, fontWeight: 600, fontSize: 14, width: 'fit-content' }}
                  >
                    {(lang === 'es' ? ['Error', 'Éxito', 'Advertencia', 'Info'] : ['Error', 'Success', 'Warning', 'Info'])[i]}
                  </motion.div>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">{t('Takeaways', 'Conclusiones')}</h2>
            {worst.pairs.length === 0 ? (
              <p className="muted" style={{ margin: 0 }}>{t('Nice — every color stays distinguishable under every simulation. 🎉', '¡Bien! Todos los colores siguen distinguiéndose en cada simulación. 🎉')}</p>
            ) : (
              <ul className="muted" style={{ margin: 0, paddingLeft: 18, lineHeight: 1.7 }}>
                <li><b style={{ color: 'var(--text)' }}>{vt(worst).label}</b> {t('is the hardest case:', 'es el caso más difícil:')} {worst.pairs.map(([a, b]) => `${colors[a]} ↔ ${colors[b]}`).join(', ')}.</li>
                <li>{t('Don’t rely on color alone — add icons, labels or patterns to charts and status states (WCAG 1.4.1).', 'No dependas solo del color: añade iconos, etiquetas o patrones a gráficos y estados (WCAG 1.4.1).')}</li>
                <li>{t('Vary lightness, not just hue: colors that differ in lightness survive every type of color blindness.', 'Varía la luminosidad, no solo el tono: los colores con distinta luminosidad resisten cualquier tipo de daltonismo.')}</li>
              </ul>
            )}
          </Reveal>
        </div>
      </div>
    </ToolPage>
  );
}
