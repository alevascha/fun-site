import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { zipSync } from 'fflate';
import ToolPage from '../components/ToolPage';
import { RangeField, Reveal, Segmented } from '../components/ui';
import { EASE } from '../lib/motion';
import { makeSamples, trimImage } from '../lib/trim';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';

let uid = 0;

function saveBlob(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const trimmedName = name => name.replace(/\.[^.]+$/, '') + '-trimmed.png';

function ResultCard({ item, result, onRemove, index }) {
  const [compare, setCompare] = useState(false);
  const saved = result && !result.empty ? 1 - (result.width * result.height) / (result.origW * result.origH) : 0;
  return (
    <motion.article
      layout
      className="card card-tight"
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5, ease: EASE, delay: Math.min(index * 0.05, 0.4) }}
      style={{ display: 'grid', gap: 12 }}
    >
      <div className="checker" style={{ position: 'relative', aspectRatio: '4 / 3', borderRadius: 16, overflow: 'hidden', display: 'grid', placeItems: 'center' }}>
        <AnimatePresence mode="wait" initial={false}>
          {!result ? (
            <motion.span key="busy" className="small muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Trimming…</motion.span>
          ) : result.empty ? (
            <motion.span key="empty" className="small muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>Nothing left — the image is fully transparent.</motion.span>
          ) : compare ? (
            <motion.div key="before" style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', aspectRatio: `${result.origW} / ${result.origH}`, width: result.origW >= result.origH ? '92%' : 'auto', height: result.origW >= result.origH ? 'auto' : '92%' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <img src={item.url} alt={`${item.name}, original`} style={{ width: '100%', height: '100%', objectFit: 'contain', boxShadow: '0 0 0 1px rgba(127,127,127,.4)' }} />
              <motion.span
                initial={{ opacity: 0, scale: 1.15 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: EASE }}
                style={{
                  position: 'absolute',
                  left: `${(result.rect.left / result.origW) * 100}%`, top: `${(result.rect.top / result.origH) * 100}%`,
                  width: `${(result.rect.width / result.origW) * 100}%`, height: `${(result.rect.height / result.origH) * 100}%`,
                  border: '2px dashed #CD57FF', boxShadow: '0 0 0 9999px rgba(205, 87, 255, 0.18)', borderRadius: 2,
                }}
              />
            </motion.div>
          ) : (
            <motion.img key={result.url} src={result.url} alt={`${item.name}, trimmed`} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}
              style={{ maxWidth: '88%', maxHeight: '88%', objectFit: 'contain', boxShadow: '0 0 0 1px rgba(205,87,255,.45)' }} />
          )}
        </AnimatePresence>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline' }}>
        <strong style={{ fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>{item.name}</strong>
        {result && !result.empty && <span className="badge badge-pass">−{Math.round(saved * 100)}% area</span>}
      </div>
      {result && !result.empty && (
        <span className="mono small muted">{result.origW}×{result.origH} → {result.width}×{result.height}</span>
      )}
      <div className="chip-row">
        <button type="button" className="btn btn-ghost btn-sm" aria-pressed={compare} onClick={() => { setCompare(c => !c); haptic(); }} disabled={!result || result.empty}>
          {compare ? 'Show result' : 'Show crop'}
        </button>
        <button type="button" className="btn btn-primary btn-sm" disabled={!result || result.empty} onClick={() => { saveBlob(result.blob, trimmedName(item.name)); track('Download', { tool: 'auto-trim', count: '1' }); }}>Download</button>
        <button type="button" className="btn btn-ghost btn-sm" aria-label={`Remove ${item.name}`} onClick={onRemove} style={{ marginLeft: 'auto' }}>✕</button>
      </div>
    </motion.article>
  );
}

export default function AutoTrim() {
  const [items, setItems] = useState([]);
  const [results, setResults] = useState({});
  const [opts, setOpts] = useState({ alphaThreshold: 8, padding: 0, trimSolid: false, tolerance: 12 });
  const [over, setOver] = useState(false);
  const [zipping, setZipping] = useState(false);
  const fileRef = useRef(null);
  const resultsRef = useRef({});

  // Re-trim everything when files or options change (debounced for sliders).
  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(async () => {
      const next = {};
      for (const item of items) {
        if (cancelled) return;
        try { next[item.id] = await trimImage(item.file, opts); } catch { next[item.id] = { empty: true, origW: 0, origH: 0 }; }
        next[item.id].url = next[item.id].blob ? URL.createObjectURL(next[item.id].blob) : null;
      }
      if (cancelled) { Object.values(next).forEach(r => r.url && URL.revokeObjectURL(r.url)); return; }
      Object.values(resultsRef.current).forEach(r => r.url && URL.revokeObjectURL(r.url));
      resultsRef.current = next;
      setResults(next);
    }, 180);
    return () => { cancelled = true; clearTimeout(id); };
  }, [items, opts]);

  useEffect(() => () => {
    Object.values(resultsRef.current).forEach(r => r.url && URL.revokeObjectURL(r.url));
  }, []);

  function addFiles(list) {
    const files = [...(list || [])].filter(f => f.type.startsWith('image/'));
    if (!files.length) return;
    setItems(prev => [...prev, ...files.map(file => ({ id: ++uid, file, name: file.name, url: URL.createObjectURL(file) }))]);
    track('Images trimmed', { count: String(files.length) });
  }

  function remove(id) {
    setItems(prev => {
      const it = prev.find(i => i.id === id);
      if (it) URL.revokeObjectURL(it.url);
      return prev.filter(i => i.id !== id);
    });
  }

  async function downloadAll() {
    setZipping(true);
    const entries = {};
    for (const item of items) {
      const r = results[item.id];
      if (r?.blob) entries[trimmedName(item.name)] = new Uint8Array(await r.blob.arrayBuffer());
    }
    saveBlob(new Blob([zipSync(entries, { level: 0 })], { type: 'application/zip' }), 'trimmed-images.zip');
    setZipping(false);
    track('Download', { tool: 'auto-trim', count: String(Object.keys(entries).length) });
  }

  const ready = items.filter(i => results[i.id]?.blob).length;

  return (
    <ToolPage id="auto-trim" intro="Drop in PNGs, WebPs or screenshots and get them back without the empty edges — transparent padding, or a solid background if you want. Works in bulk, everything stays in your browser, and you can download a single ZIP.">
      <div className="grid-sidebar">
        <div className="stack sticky-col">
          <Reveal className="card">
            <motion.div
              className={'dropzone' + (over ? ' is-over' : '')}
              role="button"
              tabIndex={0}
              aria-label="Choose images, or drop them here"
              style={{ minHeight: 220 }}
              onClick={() => fileRef.current?.click()}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); } }}
              onDragOver={e => { e.preventDefault(); setOver(true); }}
              onDragLeave={() => setOver(false)}
              onDrop={e => { e.preventDefault(); setOver(false); addFiles(e.dataTransfer.files); }}
            >
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={e => { addFiles(e.target.files); e.target.value = ''; }} />
              <div style={{ display: 'grid', gap: 8, justifyItems: 'center' }}>
                <motion.span aria-hidden="true" style={{ fontSize: 40 }} animate={{ rotate: [0, -12, 12, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>✂️</motion.span>
                <strong>Drop images here</strong>
                <span className="small muted">PNG, WebP, GIF, JPG — as many as you like</span>
              </div>
            </motion.div>
            <div className="chip-row" style={{ marginTop: 12 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={async () => addFiles(await makeSamples())}>Try samples</button>
              {items.length > 0 && <button type="button" className="btn btn-ghost btn-sm" onClick={() => { items.forEach(i => URL.revokeObjectURL(i.url)); setItems([]); }}>Clear all</button>}
            </div>
          </Reveal>

          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">Trim settings</h2>
            <div className="stack" style={{ gap: 14 }}>
              <Segmented full label="What counts as empty" value={opts.trimSolid ? 'solid' : 'alpha'} onChange={v => setOpts(o => ({ ...o, trimSolid: v === 'solid' }))} options={[{ value: 'alpha', label: 'Transparent' }, { value: 'solid', label: '+ Solid background' }]} />
              <RangeField label="Alpha threshold" value={opts.alphaThreshold} min={0} max={128} onChange={v => setOpts(o => ({ ...o, alphaThreshold: v }))} />
              <AnimatePresence initial={false}>
                {opts.trimSolid && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                    <RangeField label="Background tolerance" value={opts.tolerance} min={0} max={80} onChange={v => setOpts(o => ({ ...o, tolerance: v }))} />
                  </motion.div>
                )}
              </AnimatePresence>
              <RangeField label="Padding" value={opts.padding} min={0} max={64} onChange={v => setOpts(o => ({ ...o, padding: v }))} format={v => `${v}px`} />
            </div>
          </Reveal>

          <AnimatePresence>
            {ready > 0 && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <motion.button type="button" className="btn btn-primary" style={{ width: '100%' }} whileTap={{ scale: 0.96 }} onClick={downloadAll} disabled={zipping}>
                  {zipping ? 'Zipping…' : `Download all (${ready}) as ZIP`}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          {items.length === 0 ? (
            <Reveal className="card" style={{ minHeight: 360, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
              <div>
                <h2 className="card-title">Your trimmed images appear here</h2>
                <p className="small muted" style={{ maxWidth: 380, margin: '0 auto' }}>Add a few images or try the samples. Use “Show crop” to see exactly what was removed.</p>
              </div>
            </Reveal>
          ) : (
            <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 240px), 1fr))', gap: 14 }}>
              <AnimatePresence mode="popLayout">
                {items.map((item, i) => <ResultCard key={item.id} item={item} index={i} result={results[item.id]} onRemove={() => remove(item.id)} />)}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
    </ToolPage>
  );
}
