import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { bestTextColor, contrastRatio, formatRatio } from '../lib/color';
import { extractPalette } from '../lib/extract';
import ToolPage from '../components/ToolPage';
import { CopyButton, Reveal, Segmented } from '../components/ui';
import { EASE } from '../lib/motion';
import useCopy from '../hooks/useCopy';
import { track } from '../lib/analytics';

const MAX_SAMPLE = 120;

/* A procedural "photo" so the tool can be tried without uploading anything. */
function drawSample(canvas, variant) {
  const w = 800, h = 520;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (variant === 0) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#2b1a4f'); sky.addColorStop(0.45, '#cd57ff'); sky.addColorStop(0.75, '#ffb36b'); sky.addColorStop(1, '#ffce1f');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(w * 0.62, h * 0.62, 70, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3b2366'; ctx.beginPath(); ctx.moveTo(0, h * 0.72);
    for (let x = 0; x <= w; x += 40) ctx.lineTo(x, h * 0.7 + Math.sin(x / 70) * 30);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
    ctx.fillStyle = '#1b1230'; ctx.beginPath(); ctx.moveTo(0, h * 0.85);
    for (let x = 0; x <= w; x += 40) ctx.lineTo(x, h * 0.84 + Math.cos(x / 50) * 22);
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.fill();
  } else {
    ctx.fillStyle = '#e9f1e4'; ctx.fillRect(0, 0, w, h);
    const blobs = [['#2f7d5b', 180, 160, 190], ['#9fd3a8', 560, 140, 170], ['#f2a65a', 420, 380, 150], ['#1d3b2f', 120, 430, 130], ['#f7d488', 700, 420, 110]];
    blobs.forEach(([c, x, y, r]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); });
  }
  return canvas.toDataURL('image/png');
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function sample(img, k) {
  const scale = Math.min(1, MAX_SAMPLE / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(img.naturalWidth * scale));
  c.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return extractPalette(ctx.getImageData(0, 0, c.width, c.height), k);
}

function ratioColor(r) {
  if (r >= 7) return 'var(--pass)';
  if (r >= 4.5) return 'color-mix(in srgb, var(--pass) 70%, var(--muted))';
  if (r >= 3) return 'var(--muted)';
  return 'var(--faint)';
}

export default function ImagePalette() {
  const [src, setSrc] = useState(null);
  const [k, setK] = useState(6);
  const [colors, setColors] = useState([]);
  const [over, setOver] = useState(false);
  const [error, setError] = useState('');
  const [hovered, setHovered] = useState(null);
  const fileRef = useRef(null);
  const [copied, copy] = useCopy();

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    loadImage(src).then(img => { if (!cancelled) setColors(sample(img, k)); }).catch(() => setError('That file could not be read as an image.'));
    return () => { cancelled = true; };
  }, [src, k]);

  const handleFile = useCallback(file => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('That doesn’t look like an image — try a PNG, JPG, WebP or GIF.'); return; }
    setError('');
    const reader = new FileReader();
    reader.onload = () => { setSrc(reader.result); track('Image extracted', { source: 'upload' }); };
    reader.readAsDataURL(file);
  }, []);

  useEffect(() => {
    function onPaste(e) {
      const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'));
      if (item) handleFile(item.getAsFile());
    }
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [handleFile]);

  function trySample(variant) {
    setError('');
    setSrc(drawSample(document.createElement('canvas'), variant));
    track('Image extracted', { source: 'sample' });
  }

  const white = { r: 255, g: 255, b: 255 }, black = { r: 0, g: 0, b: 0 };
  const cssVars = `:root {\n${colors.map((c, i) => `  --image-${i + 1}: ${c.hex};`).join('\n')}\n}`;
  const passingPairs = [];
  colors.forEach((a, i) => colors.forEach((b, j) => {
    if (j <= i) return;
    const r = contrastRatio(a.rgb, b.rgb);
    if (r >= 4.5) passingPairs.push({ a, b, r });
  }));
  passingPairs.sort((x, y) => y.r - x.r);

  return (
    <ToolPage id="image-palette" intro="Drop, paste or pick an image. The dominant colors are pulled out with k-means clustering, then every pair is run through the same WCAG checks as the palette generator. Your image never leaves your browser.">
      <div className="grid-sidebar">
        <div className="stack sticky-col">
          <Reveal className="card">
            <h2 className="eyebrow">Image</h2>
            <motion.div
              className={'dropzone' + (over ? ' is-over' : '')}
              role="button"
              tabIndex={0}
              aria-label="Choose an image, or drop one here"
              onClick={() => fileRef.current?.click()}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); } }}
              onDragOver={e => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={e => { e.preventDefault(); setOver(false); handleFile(e.dataTransfer.files?.[0]); }}
              style={src ? { minHeight: 0, padding: 10 } : undefined}
              layout
            >
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => handleFile(e.target.files?.[0])} />
              <AnimatePresence mode="wait">
                {src ? (
                  <motion.img
                    key={src.slice(-40)}
                    src={src}
                    alt="Uploaded image"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ borderRadius: 18, width: '100%', maxHeight: 360, objectFit: 'contain' }}
                  />
                ) : (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'grid', gap: 10, justifyItems: 'center' }}>
                    <motion.span style={{ fontSize: 44 }} animate={{ y: [0, -8, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} aria-hidden="true">🖼️</motion.span>
                    <strong style={{ fontSize: 16 }}>Drop an image here</strong>
                    <span className="small muted">or click to browse · or paste with ⌘V / Ctrl+V</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            {error && <p role="alert" className="small" style={{ color: 'var(--fail)', margin: '12px 0 0' }}>{error}</p>}
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => trySample(0)}>Try a sunset</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => trySample(1)}>Try a garden</button>
              {src && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setSrc(null); setColors([]); }}>Clear</button>}
            </div>
          </Reveal>
          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">How many colors</h2>
            <Segmented full label="Number of colors" value={k} onChange={setK} options={[4, 5, 6, 8, 10].map(n => ({ value: n, label: String(n) }))} />
          </Reveal>
        </div>

        <div className="stack">
          {!colors.length ? (
            <Reveal className="card" style={{ display: 'grid', placeItems: 'center', minHeight: 320, textAlign: 'center' }}>
              <div>
                <h2 className="card-title">Your palette shows up here</h2>
                <p className="muted small" style={{ maxWidth: 360, margin: '0 auto' }}>Add an image or try one of the samples to extract its colors.</p>
              </div>
            </Reveal>
          ) : (
            <>
              <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <h2 className="eyebrow">
                  Dominant colors
                  <CopyButton copied={copied === 'css'} onClick={() => copy(cssVars, 'css', { name: 'Copy', props: { tool: 'image-palette', format: 'css' } })}>Copy CSS</CopyButton>
                </h2>
                <div style={{ display: 'flex', height: 120, borderRadius: 22, overflow: 'hidden', boxShadow: 'inset 0 0 0 1px var(--border)' }}>
                  {colors.map((c, i) => (
                    <motion.button
                      key={c.hex + i}
                      type="button"
                      title={`Copy ${c.hex}`}
                      aria-label={`Copy ${c.hex}, ${Math.round(c.share * 100)}% of the image`}
                      onClick={() => copy(c.hex, c.hex)}
                      initial={{ flexGrow: 0 }}
                      animate={{ flexGrow: Math.max(c.share, 0.04) * (hovered === i ? 1.6 : 1) }}
                      transition={{ duration: 0.6, ease: EASE, delay: i * 0.04 }}
                      onHoverStart={() => setHovered(i)}
                      onHoverEnd={() => setHovered(null)}
                      style={{ flexBasis: 0, border: 'none', background: c.hex, color: bestTextColor(c.rgb), display: 'flex', alignItems: 'flex-end', padding: 10, fontFamily: 'var(--font-mono)', fontSize: 11, minWidth: 0, overflow: 'hidden' }}
                    >
                      {copied === c.hex ? 'Copied!' : c.share > 0.07 ? `${Math.round(c.share * 100)}%` : ''}
                    </motion.button>
                  ))}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 190px), 1fr))', gap: 10, marginTop: 16 }}>
                  {colors.map((c, i) => {
                    const onWhite = contrastRatio(c.rgb, white), onBlack = contrastRatio(c.rgb, black);
                    return (
                      <motion.div
                        key={c.hex + i}
                        className="check-row"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.04, ease: EASE, duration: 0.45 }}
                        style={{ gridTemplateColumns: 'auto 1fr' }}
                      >
                        <span style={{ width: 44, height: 44, borderRadius: 12, background: c.hex, boxShadow: 'inset 0 0 0 1px rgba(127,127,127,.3)' }} />
                        <span style={{ minWidth: 0 }}>
                          <span className="mono" style={{ fontSize: 14, fontWeight: 500 }}>{c.hex}</span>
                          <span className="check-row-sub" style={{ display: 'flex', gap: 10 }}>
                            <span title="Contrast with white text">◻ {formatRatio(onWhite)}</span>
                            <span title="Contrast with black text">◼ {formatRatio(onBlack)}</span>
                          </span>
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
                  <Link className="btn btn-primary btn-sm" to={`/palette-generator?base=${colors[0].hex.slice(1)}`}>Build a full palette from {colors[0].hex} <span className="arrow">→</span></Link>
                  <Link className="btn btn-ghost btn-sm" to={`/color-blindness?colors=${colors.map(c => c.hex.slice(1)).join(',')}`}>Check for color blindness</Link>
                </div>
              </motion.div>

              <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}>
                <h2 className="eyebrow">Contrast matrix</h2>
                <p className="small muted" style={{ marginTop: -6 }}>Every color against every other. Green ≥ 4.5:1 is safe for normal text; grey ≥ 3:1 works for large text and UI.</p>
                <div className="table-scroll">
                  <div className="matrix" style={{ gridTemplateColumns: `44px repeat(${colors.length}, minmax(44px, 1fr))`, minWidth: 44 * (colors.length + 1) + 4 * colors.length }}>
                    <span />
                    {colors.map((c, i) => <span key={i} className="matrix-cell" style={{ background: c.hex }} aria-hidden="true" />)}
                    {colors.map((row, i) => (
                      <FragmentRow key={i} row={row} colors={colors} />
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.2 }}>
                <h2 className="eyebrow">Pairs that pass AA ({passingPairs.length})</h2>
                {passingPairs.length === 0 ? (
                  <p className="small muted">No pair in this image reaches 4.5:1. Pair these colors with black or white text instead — see the ◻/◼ ratios above.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 200px), 1fr))', gap: 10 }}>
                    {passingPairs.slice(0, 12).map(({ a, b, r }) => (
                      <motion.div key={a.hex + b.hex} whileHover={{ y: -4, rotate: -1 }} style={{ background: a.hex, color: b.hex, borderRadius: 18, padding: '18px 16px', boxShadow: 'inset 0 0 0 1px rgba(127,127,127,.25)' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1 }}>Aa</div>
                        <div className="mono" style={{ fontSize: 11, marginTop: 8 }}>{b.hex} on {a.hex}</div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{formatRatio(r)}:1 {r >= 7 ? '· AAA' : '· AA'}</div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </>
          )}
        </div>
      </div>
    </ToolPage>
  );
}

function FragmentRow({ row, colors }) {
  return (
    <>
      <span className="matrix-cell" style={{ background: row.hex }} aria-hidden="true" />
      {colors.map((col, j) => {
        const r = contrastRatio(row.rgb, col.rgb);
        const same = row === col;
        return (
          <span
            key={j}
            className="matrix-cell"
            title={`${col.hex} on ${row.hex}: ${formatRatio(r)}:1`}
            style={{
              background: same ? 'transparent' : 'var(--surface-2)',
              color: same ? 'var(--faint)' : ratioColor(r),
              boxShadow: r >= 4.5 && !same ? 'inset 0 0 0 1.5px var(--pass)' : 'inset 0 0 0 1px var(--border)',
            }}
          >
            {same ? '—' : formatRatio(r)}
          </span>
        );
      })}
    </>
  );
}

