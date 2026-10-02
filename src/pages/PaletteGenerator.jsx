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
import { useLang } from '../i18n';
import useUrlState from '../hooks/useUrlState';
import ShareLink from '../components/ShareLink';

const DEFAULT_HSL = { h: 217, s: 88, l: 55 };

const hslToHexStr = hsl => { const rgb = hslToRgb(hsl.h, hsl.s, hsl.l); return rgbToHex(rgb.r, rgb.g, rgb.b).slice(1); };

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
  const { t, to } = useLang();
  const [params] = useSearchParams();
  const [baseHsl, setBaseHsl] = useState(() => initialBase(params));
  const [harmony, setHarmony] = useState(() => (HARMONIES.some(h => h.id === params.get('harmony')) ? params.get('harmony') : 'complementary'));
  const [refs, setRefs] = useState(() => {
    const tc = (params.get('tc') || '').split(',').map(h => hexToRgb(h)).filter(Boolean);
    return DEFAULT_TEXT_COLORS.map((d, i) => (tc[i] ? { ...d, hex: rgbToHex(tc[i].r, tc[i].g, tc[i].b) } : { ...d }));
  });
  const [level, setLevel] = useState(() => (params.get('level') === 'AA' ? 'AA' : 'AAA'));
  const [textSize, setTextSize] = useState(() => (params.get('size') === 'large' ? 'large' : 'normal'));
  const [groups, setGroups] = useState(() => buildPaletteGroups(baseHsl, harmony));
  const [copied, copy] = useCopy();

  const threshold = AA_THRESHOLDS[level][textSize];

  useUrlState(() => ({
    base: hslToHexStr(baseHsl), harmony, level, size: textSize === 'large' ? 'large' : '',
    tc: refs.map(r => r.hex.slice(1)).join(','),
  }), [baseHsl, harmony, level, textSize, refs]);
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
              {t('Base color', 'Color base')}
              <motion.button type="button" className="btn btn-ghost btn-sm" onClick={randomize} whileTap={{ scale: 0.9, rotate: -8 }}>
                🎲 {t('Surprise me', 'Sorpréndeme')}
              </motion.button>
            </h2>
            <div className="pg-wheel-wrap">
              <ColorWheel baseHsl={baseHsl} onChange={handleWheelChange} size={340} />
              <div className="pg-base-row">
                <motion.div className="pg-base-swatch" animate={{ backgroundColor: baseHex }} transition={{ duration: 0.3 }} />
                <ColorField label="Hex" value={baseHex} onChange={handleHex} />
              </div>
              <div style={{ width: '100%' }}>
                <RangeField label={t('Lightness', 'Luminosidad')} value={Math.round(baseHsl.l)} min={10} max={90} onChange={handleLightness} format={v => `${v}%`} />
              </div>
            </div>
          </Reveal>

          <div className="stack">
            <Reveal className="card" delay={0.05}>
              <h2 className="eyebrow">{t('Color harmony', 'Armonía de color')}</h2>
              <HarmonyPicker value={harmony} onChange={handleHarmonyChange} />
            </Reveal>

            <Reveal className="card" delay={0.1}>
              <h2 className="eyebrow">{t('Live preview', 'Vista previa')}</h2>
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
                <h2 className="eyebrow">{t('Compliance', 'Cumplimiento')}</h2>
                <div className="stack" style={{ gap: 14 }}>
                  <Segmented full label={t('WCAG level', 'Nivel WCAG')} value={level} onChange={setLevel} options={[{ value: 'AA', label: 'WCAG AA' }, { value: 'AAA', label: 'WCAG AAA' }]} />
                  <Segmented full label={t('Text size', 'Tamaño de texto')} value={textSize} onChange={setTextSize} options={[{ value: 'normal', label: t('Normal text', 'Texto normal') }, { value: 'large', label: t('Large / UI', 'Grande / UI') }]} />
                  <p className="small muted" style={{ margin: 0 }}>
                    {t('Target:', 'Objetivo:')} <b style={{ color: 'var(--text)' }}>{threshold}:1</b>. {t('Try it in the', 'Pruébala en el')}{' '}
                    <Link to={`${to('/color-blindness')}?colors=${centerHexes.map(h => h.slice(1)).join(',')}`}>{t('color blindness simulator', 'simulador de daltonismo')}</Link>.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        <PaletteResults groups={groups} setGroups={setGroups} refs={refs} threshold={threshold} level={level} />

        <Reveal className="card" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 className="card-title">{t('Take it with you', 'Llévatela')}</h2>
            <p className="small muted" style={{ margin: 0 }}>{t('Copy every tone as JSON or CSS custom properties.', 'Copia todos los tonos como JSON o variables CSS.')}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <ShareLink tool="palette-generator" className="btn btn-ghost" />
            <CopyButton
              className="btn btn-ghost"
              copied={copied === 'json'}
              onClick={() => copy(JSON.stringify({ groups, textColors: refs }, null, 2), 'json', { name: 'Copy', props: { tool: 'palette-generator', format: 'json' } })}
            >
              {t('Copy JSON', 'Copiar JSON')}
            </CopyButton>
            <CopyButton
              className="btn btn-primary"
              copied={copied === 'css'}
              onClick={() => copy(toCssVars(groups), 'css', { name: 'Copy', props: { tool: 'palette-generator', format: 'css' } })}
            >
              {t('Copy CSS variables', 'Copiar variables CSS')}
            </CopyButton>
          </div>
        </Reveal>
      </div>
    </ToolPage>
  );
}
