import { AnimatePresence, motion } from 'framer-motion';
import {
  hexToRgb, hslToRgb, rgbToHex, rgbToHsl, contrastRatio, bestTextColor, findAAFix, suggestClosestPassing,
} from '../lib/color';
import { buildToneColumn, localName } from '../lib/palette';
import { useLang } from '../i18n';
import { EASE, REVEAL_VIEWPORT } from '../lib/motion';

function ToneCell({ tone, refs, threshold, level, onToneChange }) {
  const { lang, t } = useLang();
  const bgRgb = hexToRgb(tone.hex);
  const ink = bestTextColor(bgRgb);

  function commitHex(value) {
    const rgb = hexToRgb(value);
    if (rgb) onToneChange(rgb);
  }

  return (
    <div className="tone" style={{ background: tone.hex, color: ink }}>
      <span className="tone-symbol">{tone.symbol}</span>
      <input
        key={tone.hex}
        className="tone-hex"
        defaultValue={tone.hex}
        aria-label={t(`Tone ${tone.symbol} hex`, `Hex del tono ${tone.symbol}`)}
        spellCheck={false}
        onBlur={e => commitHex(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
        style={{ color: ink }}
      />
      <div className="tone-dots">
        {refs.map(ref => {
          const fgRgb = hexToRgb(ref.hex);
          if (!fgRgb) return null;
          const ratio = contrastRatio(bgRgb, fgRgb);
          const pass = ratio >= threshold;
          const label = t(
            `${ref.name} text on ${tone.hex}: ${ratio.toFixed(2)}:1 — ${pass ? 'passes' : 'fails'} ${level} ${threshold}:1${pass ? '' : '. Click to fix.'}`,
            `Texto ${localName(ref.name, lang).toLowerCase()} sobre ${tone.hex}: ${ratio.toFixed(2)}:1 — ${pass ? 'pasa' : 'falla'} ${level} ${threshold}:1${pass ? '' : '. Haz clic para corregir.'}`,
          );
          return (
            <motion.button
              key={ref.name}
              type="button"
              title={label}
              aria-label={label}
              disabled={pass}
              className={'tone-dot' + (pass ? '' : ' fail')}
              whileTap={pass ? undefined : { scale: 0.7 }}
              onClick={() => {
                const fixedL = findAAFix(tone.hsl, fgRgb, threshold);
                if (fixedL === null) return;
                onToneChange(hslToRgb(tone.hsl.h, tone.hsl.s, fixedL));
              }}
              style={{
                background: ref.hex,
                boxShadow: pass ? '0 0 0 1.5px rgba(127,127,127,.45)' : 'none',
                cursor: pass ? 'default' : 'pointer',
                color: ink,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function SwatchCard({ sw, refs, threshold, level, onUpdateSwatch }) {
  const { lang, t } = useLang();
  const centerTone = sw.tones[3];

  const notes = refs.map(ref => {
    const fgRgb = hexToRgb(ref.hex);
    if (!fgRgb) return null;
    const anyPass = sw.tones.some(t => contrastRatio(hexToRgb(t.hex), fgRgb) >= threshold);
    if (anyPass) return null;
    const suggestion = suggestClosestPassing(centerTone.hsl, fgRgb, threshold);
    if (!suggestion) {
      return (
        <motion.div key={ref.name} layout initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="suggest-note">
          {t('No shade of this hue reaches', 'Ningún matiz de este tono alcanza')} {threshold}:1 {t('against', 'contra el texto')} <b>{localName(ref.name, lang)}</b>{t(' text.', '.')}
        </motion.div>
      );
    }
    const sRgb = hslToRgb(suggestion.h, suggestion.s, suggestion.l);
    const sHex = rgbToHex(sRgb.r, sRgb.g, sRgb.b);
    return (
      <motion.button
        key={ref.name}
        type="button"
        layout
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        className="suggest-note"
        onClick={() => onUpdateSwatch({ ...sw, tones: buildToneColumn(suggestion) })}
      >
        <span className="suggest-chip" style={{ background: sHex }} />
        <span>{t('None pass for', 'Ninguno pasa para')} <b>{localName(ref.name, lang)}</b>. {t('Use', 'Usa')} {sHex}</span>
      </motion.button>
    );
  });

  return (
    <motion.div className="swatch-col" layout>
      <div className="swatch-stack">
        {sw.tones.map((tone, i) => (
          <ToneCell
            key={tone.symbol}
            tone={tone} refs={refs} threshold={threshold} level={level}
            onToneChange={(rgb) => {
              const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
              const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
              const nextTones = sw.tones.slice();
              nextTones[i] = { ...tone, hex, hsl };
              onUpdateSwatch({ ...sw, tones: nextTones });
            }}
          />
        ))}
      </div>
      <div className="swatch-name">{localName(sw.name, lang)}</div>
      <AnimatePresence>{notes}</AnimatePresence>
    </motion.div>
  );
}

export default function PaletteResults({ groups, setGroups, refs, threshold, level }) {
  const { lang, t } = useLang();
  function updateSwatch(groupIndex, swatchIndex, nextSwatch) {
    setGroups(prev => {
      const next = prev.map(g => ({ ...g, swatches: g.swatches.slice() }));
      next[groupIndex].swatches[swatchIndex] = nextSwatch;
      return next;
    });
  }

  return (
    <div className="stack">
      {groups.map((group, gi) => (
        <motion.section
          key={group.name}
          className="card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REVEAL_VIEWPORT}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <div className="pg-group-head">
            <h3 className="card-title" style={{ margin: 0 }}>{localName(group.name, lang)}</h3>
            <span className="badge badge-neutral">{group.percentage} {t('of the UI', 'de la interfaz')}</span>
          </div>
          <div className="swatch-grid">
            {group.swatches.map((sw, si) => (
              <SwatchCard
                key={sw.name} sw={sw} refs={refs} threshold={threshold} level={level}
                onUpdateSwatch={(next) => updateSwatch(gi, si, next)}
              />
            ))}
          </div>
        </motion.section>
      ))}
    </div>
  );
}
