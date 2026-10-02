import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl, AA_THRESHOLDS } from '../lib/color';
import { buildPaletteGroups } from '../lib/palette';
import ColorWheel from '../components/ColorWheel';
import HarmonyPicker from '../components/HarmonyPicker';
import HarmonyPreview from '../components/HarmonyPreview';
import AnatomyBar from '../components/AnatomyBar';
import PaletteResults from '../components/PaletteResults';
import TextColorInputs, { DEFAULT_TEXT_COLORS } from '../components/TextColorInputs';
import SiteNav from '../components/SiteNav';

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } } };

export default function PaletteGenerator() {
  const [baseHsl, setBaseHsl] = useState({ h: 217, s: 88, l: 55 });
  const [harmony, setHarmony] = useState('complementary');
  const [refs, setRefs] = useState(DEFAULT_TEXT_COLORS.map(d => ({ ...d })));
  const [level, setLevel] = useState('AAA');
  const [textSize, setTextSize] = useState('normal');
  const [groups, setGroups] = useState(() => buildPaletteGroups({ h: 217, s: 88, l: 55 }, 'complementary'));

  const threshold = AA_THRESHOLDS[level][textSize];
  const baseHex = useMemo(() => {
    const rgb = hslToRgb(baseHsl.h, baseHsl.s, baseHsl.l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }, [baseHsl]);

  function regenerate(nextBaseHsl, nextHarmony) {
    setGroups(buildPaletteGroups(nextBaseHsl, nextHarmony));
  }

  function handleWheelChange(updater) {
    setBaseHsl(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      regenerate(next, harmony);
      return next;
    });
  }

  function handleHarmonyChange(h) {
    setHarmony(h);
    regenerate(baseHsl, h);
  }

  function handleHexInput(value) {
    const rgb = hexToRgb(value);
    if (!rgb) return;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setBaseHsl(hsl);
    regenerate(hsl, harmony);
  }

  function handleLightnessSlider(l) {
    setBaseHsl(prev => {
      const next = { ...prev, l };
      regenerate(next, harmony);
      return next;
    });
  }

  function copyPaletteJson() {
    const text = JSON.stringify({ groups, textColors: refs }, null, 2);
    navigator.clipboard?.writeText(text).catch(() => {});
  }

  return (
    <motion.div
      style={{ maxWidth: 980, margin: '0 auto', padding: '28px 20px 80px', display: 'flex', flexDirection: 'column', gap: 20 }}
      variants={stagger} initial="hidden" animate="show"
    >
      <SiteNav />
      <motion.div variants={fadeUp}>
        <Link to="/" style={{ color: 'var(--muted)', fontSize: 12, textDecoration: 'none' }}>&larr; back to the lab</Link>
        <h1 style={{ fontSize: 22, margin: '8px 0 4px', fontWeight: 800 }}>🎨 Palette Generator</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5, maxWidth: 640, margin: 0 }}>
          Pick a hue on the wheel, choose a harmony, set your text colors — everything updates live.
        </p>
      </motion.div>

      <motion.div variants={fadeUp} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px', fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.5 }}>
        <b style={{ color: 'var(--text)' }}>Foreground vs. background:</b> Dark / Light / Accent are fixed <b style={{ color: 'var(--text)' }}>text colors</b>.
        Every generated tone is a <b style={{ color: 'var(--text)' }}>background</b> — the dots on each swatch show which text colors are safe on top of it.
      </motion.div>

      <motion.div variants={fadeUp} style={{ display: 'grid', gridTemplateColumns: '1.15fr .85fr', gap: 16, alignItems: 'start' }} className="grid2">
        <section className="pg-section">
          <h2 className="pg-h2">Base Color</h2>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <ColorWheel baseHsl={baseHsl} onChange={handleWheelChange} size={260} />
            <div style={{ display: 'flex', gap: 10, width: '100%', maxWidth: 260, alignItems: 'center' }}>
              <div className="pg-swatch-transition" style={{ width: 40, height: 40, borderRadius: 9, border: '1px solid var(--border)', background: baseHex, flex: 'none' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <label style={{ width: 50, color: 'var(--muted)', fontSize: 11 }}>Hex</label>
                  <input
                    value={baseHex}
                    onChange={e => handleHexInput(e.target.value)}
                    style={{ fontSize: 11, padding: '5px 7px', border: '1px solid var(--border)', borderRadius: 6, width: '100%', background: 'var(--panel2)', color: 'var(--text)' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <label style={{ width: 50, color: 'var(--muted)', fontSize: 11 }}>Fine L</label>
                  <input
                    type="range" min="10" max="90" value={Math.round(baseHsl.l)}
                    onChange={e => handleLightnessSlider(Number(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <section className="pg-section">
            <h2 className="pg-h2">Color Harmony</h2>
            <HarmonyPicker value={harmony} onChange={handleHarmonyChange} />
          </section>
          <section className="pg-section">
            <TextColorInputs refs={refs} setRefs={setRefs} />
          </section>
        </div>
      </motion.div>

      <motion.section variants={fadeUp} className="pg-section">
        <h2 className="pg-h2">Live Preview</h2>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <HarmonyPreview baseHsl={baseHsl} harmony={harmony} />
          <div style={{ flex: 1, minWidth: 220 }}>
            <AnatomyBar groups={groups} />
          </div>
        </div>
      </motion.section>

      <motion.section variants={fadeUp} className="pg-section" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 200 }}>
          <label style={{ color: 'var(--muted)', fontSize: 11 }}>Compliance</label>
          <select value={level} onChange={e => setLevel(e.target.value)} style={selectStyle}>
            <option value="AAA">WCAG AAA</option>
            <option value="AA">WCAG AA</option>
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1, minWidth: 200 }}>
          <label style={{ color: 'var(--muted)', fontSize: 11 }}>Text size</label>
          <select value={textSize} onChange={e => setTextSize(e.target.value)} style={selectStyle}>
            <option value="normal">Normal text</option>
            <option value="large">Large text / UI &amp; icons</option>
          </select>
        </div>
      </motion.section>

      <motion.div variants={fadeUp}>
        <PaletteResults groups={groups} setGroups={setGroups} refs={refs} threshold={threshold} level={level} />
      </motion.div>

      <motion.button
        variants={fadeUp}
        onClick={copyPaletteJson}
        className="pg-btn-secondary"
        whileHover={{ scale: 1.015 }}
        whileTap={{ scale: 0.97 }}
      >
        Copy palette as JSON
      </motion.button>
    </motion.div>
  );
}

const selectStyle = { fontSize: 11, padding: '6px 7px', border: '1px solid var(--border)', borderRadius: 6, width: '100%', background: 'var(--panel2)', color: 'var(--text)' };
