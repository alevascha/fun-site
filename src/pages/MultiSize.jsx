import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { zipSync } from 'fflate';
import ToolPage from '../components/ToolPage';
import { ColorField, Reveal, Segmented } from '../components/ui';
import { EASE } from '../lib/motion';
import { drawCreative, ensureFonts, SAFE_ES, sampleImage, SIZE_ES, SIZES } from '../lib/creative';
import { useLang } from '../i18n';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';

const toBlob = canvas => new Promise(res => canvas.toBlob(res, 'image/png'));

function save(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function SafeZones({ size }) {
  const { t } = useLang();
  return size.safe.map((z, i) => {
    const style = z.inset != null
      ? { inset: `${z.inset * 100}%`, border: '1.5px dashed rgba(255, 206, 31, 0.9)', borderRadius: 4 }
      : {
          left: `${(z.left ?? 0) * 100}%`, top: `${(z.top ?? 0) * 100}%`,
          width: `${(z.width ?? 1) * 100}%`, height: `${(z.height ?? 1) * 100}%`,
          background: 'repeating-linear-gradient(135deg, rgba(229,72,77,.35) 0 6px, rgba(229,72,77,.12) 6px 12px)',
        };
    return (
      <motion.span key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'absolute', pointerEvents: 'none', ...style }}>
        {z.label && <span style={{ position: 'absolute', left: 6, top: 4, fontSize: 10, fontWeight: 700, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,.6)' }}>{t(z.label, SAFE_ES[z.label])}</span>}
      </motion.span>
    );
  });
}

function Preview({ size, data, fontsReady, showSafe, index }) {
  const { t } = useLang();
  const sizeName = t(size.name, SIZE_ES[size.id]);
  const ref = useRef(null);
  useEffect(() => {
    if (!fontsReady || !ref.current) return;
    const scale = Math.min(1, 520 / Math.max(size.w, size.h)) * Math.min(2, window.devicePixelRatio || 1);
    drawCreative(ref.current, size, data, scale);
  }, [size, data, fontsReady]);

  async function download() {
    const c = document.createElement('canvas');
    drawCreative(c, size, data, 1);
    save(await toBlob(c), `${size.id}-${size.w}x${size.h}.png`);
    haptic(12);
    track('Download', { tool: 'multi-size', size: size.id });
  }

  return (
    <motion.figure
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: EASE, delay: Math.min(index * 0.04, 0.4) }}
      className="card card-tight"
      style={{ margin: 0, display: 'grid', gap: 10, alignContent: 'start' }}
    >
      <div style={{ display: 'grid', placeItems: 'center', minHeight: 120, padding: 8, borderRadius: 14, background: 'var(--surface-2)' }}>
        <motion.div whileHover={{ scale: 1.02 }} style={{ position: 'relative', width: '100%', maxWidth: size.w / size.h < 0.7 ? 220 : '100%', aspectRatio: `${size.w} / ${size.h}`, borderRadius: 6, overflow: 'hidden', boxShadow: '0 12px 30px -18px rgba(0,0,0,.6)' }}>
          <canvas ref={ref} role="img" aria-label={t(`${size.name} preview`, `Vista previa: ${sizeName}`)} style={{ width: '100%', height: '100%', display: 'block' }} />
          <AnimatePresence>{showSafe && <SafeZones size={size} />}</AnimatePresence>
        </motion.div>
      </div>
      <figcaption style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ minWidth: 0 }}>
          <strong style={{ display: 'block', fontSize: 14 }}>{sizeName}</strong>
          <span className="mono small muted">{size.w}×{size.h}</span>
        </span>
        <button type="button" className="btn btn-ghost btn-sm" onClick={download} aria-label={t(`Download ${size.name} PNG`, `Descargar PNG: ${sizeName}`)}>PNG ↓</button>
      </figcaption>
    </motion.figure>
  );
}

export default function MultiSize() {
  const { t } = useLang();
  const [headline, setHeadline] = useState(() => t('Design tools, built for fun', 'Herramientas de diseño, hechas por diversión'));
  const [sub, setSub] = useState(() => t('Free experiments for color, type and motion.', 'Experimentos gratis de color, tipografía y movimiento.'));
  const [cta, setCta] = useState(() => t('Try it free', 'Pruébalo gratis'));
  const [logo, setLogo] = useState("Ale's Fun Lab");
  const [brand, setBrand] = useState('#CD57FF');
  const [accent, setAccent] = useState('#FFCE1F');
  const [bg, setBg] = useState('#1D1C1B');
  const [image, setImage] = useState(() => sampleImage());
  const [focal, setFocal] = useState({ x: 0.6, y: 0.6 });
  const [group, setGroup] = useState('All');
  const [showSafe, setShowSafe] = useState(true);
  const [fontsReady, setFontsReady] = useState(false);
  const [zipping, setZipping] = useState(false);
  const fileRef = useRef(null);
  const focalRef = useRef(null);

  useEffect(() => { ensureFonts().then(() => setFontsReady(true)); }, []);

  const data = useMemo(() => ({ headline, sub, cta, logo, brand, accent, bg, image, focal }), [headline, sub, cta, logo, brand, accent, bg, image, focal]);
  const sizes = group === 'All' ? SIZES : SIZES.filter(s => s.group === group);

  function loadFile(file) {
    if (!file?.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { setImage(img); setFocal({ x: 0.5, y: 0.5 }); track('Multi-size image'); };
    img.src = url;
  }

  function moveFocal(e) {
    const r = focalRef.current.getBoundingClientRect();
    setFocal({ x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)), y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)) });
  }

  async function downloadAll() {
    setZipping(true);
    const files = {};
    for (const size of sizes) {
      const c = document.createElement('canvas');
      drawCreative(c, size, data, 1);
      files[`${size.id}-${size.w}x${size.h}.png`] = new Uint8Array(await (await toBlob(c)).arrayBuffer());
    }
    save(new Blob([zipSync(files, { level: 0 })], { type: 'application/zip' }), 'creatives.zip');
    setZipping(false);
    track('Download', { tool: 'multi-size', size: 'zip' });
  }

  const imageSrc = useMemo(() => (image instanceof HTMLCanvasElement ? image.toDataURL('image/jpeg', 0.7) : image?.src), [image]);

  return (
    <ToolPage id="multi-size" intro="Write one message, see it laid out across social posts, stories and display-ad sizes at once — with the zones that platform UI covers marked in red. Drag the focal point to keep the important part of your image in frame, then export every size as PNG.">
      <div className="grid-sidebar">
        <div className="stack sticky-col">
          <Reveal className="card">
            <h2 className="eyebrow">{t('Message', 'Mensaje')}</h2>
            <div className="stack" style={{ gap: 12 }}>
              <div className="field"><label className="field-label" htmlFor="ms-head">{t('Headline', 'Título')}</label><input id="ms-head" className="input" value={headline} onChange={e => setHeadline(e.target.value)} /></div>
              <div className="field"><label className="field-label" htmlFor="ms-sub">{t('Supporting line', 'Texto de apoyo')}</label><input id="ms-sub" className="input" value={sub} onChange={e => setSub(e.target.value)} /></div>
              <div className="grid-2" style={{ gap: 12 }}>
                <div className="field"><label className="field-label" htmlFor="ms-cta">{t('Button', 'Botón')}</label><input id="ms-cta" className="input" value={cta} onChange={e => setCta(e.target.value)} /></div>
                <div className="field"><label className="field-label" htmlFor="ms-logo">{t('Brand', 'Marca')}</label><input id="ms-logo" className="input" value={logo} onChange={e => setLogo(e.target.value)} /></div>
              </div>
            </div>
          </Reveal>
          <Reveal className="card" delay={0.05}>
            <h2 className="eyebrow">{t('Colors', 'Colores')}</h2>
            <div className="stack" style={{ gap: 12 }}>
              <ColorField label={t('Button', 'Botón')} value={brand} onChange={setBrand} />
              <ColorField label={t('Accent (brand name)', 'Acento (nombre de marca)')} value={accent} onChange={setAccent} />
              <ColorField label={t('Background', 'Fondo')} value={bg} onChange={setBg} />
            </div>
          </Reveal>
          <Reveal className="card" delay={0.1}>
            <h2 className="eyebrow">
              {t('Image & focal point', 'Imagen y punto focal')}
              <span className="chip-row">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()}>{t('Upload', 'Subir')}</button>
                {image && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setImage(null)}>{t('None', 'Ninguna')}</button>}
              </span>
            </h2>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={e => loadFile(e.target.files?.[0])} />
            {image ? (
              <div
                ref={focalRef}
                style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', cursor: 'crosshair', touchAction: 'none' }}
                onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); moveFocal(e); }}
                onPointerMove={e => { if (e.buttons) moveFocal(e); }}
                role="slider"
                tabIndex={0}
                aria-label={t(`Focal point at ${Math.round(focal.x * 100)}% across, ${Math.round(focal.y * 100)}% down. Use arrow keys to move.`, `Punto focal al ${Math.round(focal.x * 100)}% horizontal y ${Math.round(focal.y * 100)}% vertical. Usa las flechas para mover.`)}
                aria-valuenow={Math.round(focal.x * 100)}
                onKeyDown={e => {
                  const d = e.shiftKey ? 0.1 : 0.02;
                  const m = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key];
                  if (m) { e.preventDefault(); setFocal(f => ({ x: Math.min(1, Math.max(0, f.x + m[0])), y: Math.min(1, Math.max(0, f.y + m[1])) })); }
                }}
              >
                <img src={imageSrc} alt="" draggable={false} style={{ width: '100%', display: 'block', userSelect: 'none' }} />
                <motion.span
                  animate={{ left: `${focal.x * 100}%`, top: `${focal.y * 100}%` }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ position: 'absolute', width: 28, height: 28, margin: '-14px 0 0 -14px', borderRadius: '50%', border: '3px solid #fff', boxShadow: '0 0 0 2px rgba(0,0,0,.3), 0 0 0 9999px rgba(0,0,0,.15)' }}
                />
              </div>
            ) : (
              <p className="small muted" style={{ margin: 0 }}>{t('No image — layouts use the brand color as a glow instead.', 'Sin imagen: los diseños usan el color de marca como brillo.')}</p>
            )}
          </Reveal>
        </div>

        <div className="stack">
          <Reveal className="card" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between' }}>
            <Segmented label={t('Size group', 'Grupo de tamaños')} value={group} onChange={setGroup} options={['All', 'Social', 'Display ads'].map(g => ({ value: g, label: t(g, { All: 'Todos', Social: 'Redes', 'Display ads': 'Anuncios display' }[g]) }))} />
            <span className="chip-row">
              <Segmented label={t('Safe zones', 'Zonas seguras')} value={showSafe ? 'on' : 'off'} onChange={v => setShowSafe(v === 'on')} options={[{ value: 'on', label: t('Safe zones', 'Zonas seguras') }, { value: 'off', label: t('Clean', 'Limpio') }]} />
              <motion.button type="button" className="btn btn-primary btn-sm" whileTap={{ scale: 0.94 }} onClick={downloadAll} disabled={zipping}>
                {zipping ? t('Rendering…', 'Generando…') : t(`Download ${sizes.length} PNGs (ZIP)`, `Descargar ${sizes.length} PNG (ZIP)`)}
              </motion.button>
            </span>
          </Reveal>
          <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 250px), 1fr))', gap: 14, alignItems: 'start' }}>
            <AnimatePresence mode="popLayout">
              {sizes.map((s, i) => <Preview key={s.id} size={s} data={data} fontsReady={fontsReady} showSafe={showSafe} index={i} />)}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </ToolPage>
  );
}
