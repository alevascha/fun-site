import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { hexToRgb, hslToRgb, rgbToHex, rgbToHsl, AA_THRESHOLDS } from '../lib/color';
import { buildPaletteGroups, HARMONIES } from '../lib/palette';
import ColorWheel from '../components/ColorWheel';
import HarmonyPicker from '../components/HarmonyPicker';
import HarmonyPreview from '../components/HarmonyPreview';
import AnatomyBar from '../components/AnatomyBar';
import PaletteResults from '../components/PaletteResults';
import TextColorInputs, { DEFAULT_TEXT_COLORS } from '../components/TextColorInputs';
import ToolPage from '../components/ToolPage';
import { ColorField, CopyButton, RangeField, Reveal, Segmented } from '../components/ui';
import useCopy from '../hooks/useCopy';

const DEFAULT_HSL = { h: 217, s: 88, l: 55 };

function initialBase(params) {
  const rgb = hexToRgb(params.get('base') || '');
  return rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : DEFAULT_HSL;
}

function toCssVars(groups) {
  const lines = [];
  groups.forEach(g => g.swatches.forEach(sw => {
    const slug = sw.name.toLowerCase().replace(/\s+/g, '-');
    sw.tones.forEach(t => {
      const suffix = t.symbol === '•' ? '' : t.symbol.startsWith('+') ? `-light-${t.symbol.slice(1)}` : `-dark-${t.symbol.slice(1)}`;
      lines.push(`  --${slug}${suffix}: ${t.hex};`);
    });
  }));
  return `:root {\n${lines.join('\n')}\n}`;
}

export default function PaletteGenerator() {
  const [params] = useSearchParams();
  const [baseHsl, setBaseHsl] = useState(() => initialBase(params));
  const [harmony, setHarmony] = useState(() => (HARMONIES.some(h => h.id === params.get('harmony')) ? params.get('harmony') : 'complementary'));
  const [refs, setRefs] = useState(DEFAULT_TEXT_COLORS.map(d => ({ ...d })));
  const [level, setLevel] = useState('AAA');
  const [textSize, setTextSize] = useState('normal');
  const [groups, setGroups] = useState(() => buildPaletteGroups(baseHsl, harmony));
  const [copied, copy] = useCopy();

  const threshold = AA_THRESHOLDS[level][textSize];
  const baseHex = useMemo(() => {
    const rgb = hslToRgb(baseHsl.h, baseHsl.s, baseHsl.l);
    return rgbToHex(rgb.r, rgb.g, rgb.b);
  }, [baseHsl]);

  const centerHexes = groups.map(g => g.swatches[2].tones[3].hex);

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

  function handleHex(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return;
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    setBaseHsl(hsl);
    regenerate(hsl, harmony);
  }

  function handleLightness(l) {
    const next = { ...baseHsl, l };
    setBaseHsl(next);
    regenerate(next, harmony);
  }

  function randomize() {
    const next = { h: Math.round(Math.random() * 360), s: 55 + Math.round(Math.random() * 40), l: 40 + Math.round(Math.random() * 25) };
    const nextHarmony = HARMONIES[Math.floor(Math.random() * HARMONIES.length)].id;
    setBaseHsl(next);
    setHarmony(nextHarmony);
    regenerate(next, nextHarmony);
  }

  return (
    <ToolPage id="palette-generator" intro="Pick a hue on the wheel, choose a harmony, set your text colors — every tone updates live with WCAG checks. Dots show which text colors are safe on each tone; click a dashed dot to fix it.">
      <div className="stack">
        <div className="grid-sidebar">
          <Reveal className="card sticky-col">
            <h2 className="eyebrow">
              Base color
              <motion.button type="button" className="btn btn-ghost btn-sm" onClick={randomize} whileTap={{ scale: 0.9, rotate: -8 }}>
                🎲 Surprise me
              </motion.button>
            </h2>
            <div className="pg-wheel-wrap">
              <ColorWheel baseHsl={baseHsl} onChange={handleWheelChange} size={340} />
              <div className="pg-base-row">
                <motion.div className="pg-base-swatch" animate={{ backgroundColor: baseHex }} transition={{ duration: 0.3 }} />
                <ColorField label="Hex" value={baseHex} onChange={handleHex} />
              </div>
              <div style={{ width: '100%' }}>
                <RangeField label="Lightness" value={Math.round(baseHsl.l)} min={10} max={90} onChange={handleLightness} format={v => `${v}%`} />
              </div>
            </div>
          </Reveal>

          <div className="stack">
            <Reveal className="card" delay={0.05}>
              <h2 className="eyebrow">Color harmony</h2>
              <HarmonyPicker value={harmony} onChange={handleHarmonyChange} />
            </Reveal>

            <Reveal className="card" delay={0.1}>
              <h2 className="eyebrow">Live preview</h2>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <HarmonyPreview baseHsl={baseHsl} harmony={harmony} />
                <div style={{ flex: 1, minWidth: 220 }}>
                  <AnatomyBar groups={groups} />
                </div>
              </div>
            </Reveal>

            <div className="grid-2">
              <Reveal className="card" delay={0.15}>
                <TextColorInputs refs={refs} setRefs={setRefs} />
              </Reveal>
              <Reveal className="card" delay={0.2}>
                <h2 className="eyebrow">Compliance</h2>
                <div className="stack" style={{ gap: 14 }}>
                  <Segmented full label="WCAG level" value={level} onChange={setLevel} options={[{ value: 'AA', label: 'WCAG AA' }, { value: 'AAA', label: 'WCAG AAA' }]} />
                  <Segmented full label="Text size" value={textSize} onChange={setTextSize} options={[{ value: 'normal', label: 'Normal text' }, { value: 'large', label: 'Large / UI' }]} />
                  <p className="small muted" style={{ margin: 0 }}>
                    Target: <b style={{ color: 'var(--text)' }}>{threshold}:1</b>. Try it in the{' '}
                    <Link to={`/color-blindness?colors=${centerHexes.map(h => h.slice(1)).join(',')}`}>color blindness simulator</Link>.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        <PaletteResults groups={groups} setGroups={setGroups} refs={refs} threshold={threshold} level={level} />

        <Reveal className="card" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 className="card-title">Take it with you</h2>
            <p className="small muted" style={{ margin: 0 }}>Copy every tone as JSON or CSS custom properties.</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <CopyButton
              className="btn btn-ghost"
              copied={copied === 'json'}
              onClick={() => copy(JSON.stringify({ groups, textColors: refs }, null, 2), 'json', { name: 'Copy', props: { tool: 'palette-generator', format: 'json' } })}
            >
              Copy JSON
            </CopyButton>
            <CopyButton
              className="btn btn-primary"
              copied={copied === 'css'}
              onClick={() => copy(toCssVars(groups), 'css', { name: 'Copy', props: { tool: 'palette-generator', format: 'css' } })}
            >
              Copy CSS variables
            </CopyButton>
          </div>
        </Reveal>
      </div>
    </ToolPage>
  );
}
