import {
  hexToRgb, hslToRgb, rgbToHex, rgbToHsl, contrastRatio, bestTextColor, findAAFix, suggestClosestPassing,
} from '../lib/color';
import { buildToneColumn } from '../lib/palette';

function ToneCell({ tone, refs, threshold, level, onToneChange }) {
  const bgRgb = hexToRgb(tone.hex);

  function commitHex(value) {
    const rgb = hexToRgb(value);
    if (rgb) onToneChange(rgb);
  }

  return (
    <div style={{ height: '14.2857%', position: 'relative', background: tone.hex, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
      <span style={{ position: 'absolute', top: 2, right: 5, fontSize: 7, fontWeight: 800, opacity: 0.65, color: bestTextColor(bgRgb) }}>{tone.symbol}</span>
      <div style={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
        {refs.map(ref => {
          const fgRgb = hexToRgb(ref.hex);
          if (!fgRgb) return null;
          const ratio = contrastRatio(bgRgb, fgRgb);
          const pass = ratio >= threshold;
          return (
            <div
              key={ref.name}
              title={`${ref.name} text (${ref.hex}) on ${tone.symbol} — ${ratio.toFixed(2)}:1 — ${pass ? 'Passes' : 'Fails'} ${level} ${threshold}:1`}
              onClick={(e) => {
                e.stopPropagation();
                if (pass) return;
                const fixedL = findAAFix(tone.hsl, fgRgb, threshold);
                if (fixedL === null) return;
                onToneChange(hslToRgb(tone.hsl.h, tone.hsl.s, fixedL));
              }}
              style={{
                width: 9, height: 9, borderRadius: '50%',
                background: pass ? ref.hex : 'transparent',
                border: pass ? 'none' : '2px dashed rgba(0,0,0,.35)',
                boxShadow: pass ? '0 0 0 1px rgba(0,0,0,.2)' : 'none',
                cursor: pass ? 'default' : 'pointer',
              }}
            />
          );
        })}
      </div>
      <input
        key={tone.hex}
        defaultValue={tone.hex}
        onBlur={e => commitHex(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') e.target.blur(); }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '88%', background: 'rgba(0,0,0,.12)', border: 'none', borderRadius: 4, textAlign: 'center',
          fontSize: 7, padding: '1px 0', fontFamily: 'inherit', color: bestTextColor(bgRgb),
        }}
      />
    </div>
  );
}

function SwatchCard({ sw, refs, threshold, level, onUpdateSwatch }) {
  const centerTone = sw.tones[3];

  return (
    <div style={{ width: 78, display: 'flex', flexDirection: 'column', gap: 5 }}>
      <div style={{ width: 78, height: 238, borderRadius: 16, border: '1px solid rgba(127,127,127,.25)', overflow: 'hidden' }}>
        {sw.tones.map((tone, i) => (
          <div key={tone.symbol} style={{ borderTop: i > 0 ? '1px solid rgba(0,0,0,.15)' : 'none' }}>
            <ToneCell
              tone={tone} refs={refs} threshold={threshold} level={level}
              onToneChange={(rgb) => {
                const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
                const hex = rgbToHex(rgb.r, rgb.g, rgb.b);
                const nextTones = sw.tones.slice();
                nextTones[i] = { ...tone, hex, hsl };
                onUpdateSwatch({ ...sw, tones: nextTones });
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ fontSize: 9, color: 'var(--muted)', textAlign: 'center', lineHeight: 1.3 }}>
        <b style={{ display: 'block', color: 'var(--text)', fontSize: 9.5 }}>{sw.name}</b>
        3 lighter · tone · 3 darker
      </div>
      {refs.map(ref => {
        const fgRgb = hexToRgb(ref.hex);
        if (!fgRgb) return null;
        const anyPass = sw.tones.some(t => contrastRatio(hexToRgb(t.hex), fgRgb) >= threshold);
        if (anyPass) return null;
        const suggestion = suggestClosestPassing(centerTone.hsl, fgRgb, threshold);
        if (!suggestion) {
          return (
            <div key={ref.name} style={{ fontSize: 8.5, color: 'var(--fail)', background: 'rgba(217,48,37,.08)', border: '1px solid rgba(217,48,37,.25)', borderRadius: 7, padding: '5px 7px', lineHeight: 1.3 }}>
              None of these pass for <b>{ref.name}</b> text, and no shade of this hue reaches {threshold}:1 against it.
            </div>
          );
        }
        const sRgb = hslToRgb(suggestion.h, suggestion.s, suggestion.l);
        const sHex = rgbToHex(sRgb.r, sRgb.g, sRgb.b);
        return (
          <div
            key={ref.name}
            onClick={() => onUpdateSwatch({ ...sw, tones: buildToneColumn(suggestion) })}
            style={{ fontSize: 8.5, color: 'var(--fail)', background: 'rgba(217,48,37,.08)', border: '1px solid rgba(217,48,37,.25)', borderRadius: 7, padding: '5px 7px', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', lineHeight: 1.3 }}
          >
            <span style={{ width: 14, height: 14, borderRadius: 4, flex: 'none', border: '1px solid rgba(0,0,0,.2)', background: sHex }} />
            <span>None pass for <b>{ref.name}</b>. Closest that works: {sHex} — click to use.</span>
          </div>
        );
      })}
    </div>
  );
}

export default function PaletteResults({ groups, setGroups, refs, threshold, level }) {
  function updateSwatch(groupIndex, swatchIndex, nextSwatch) {
    setGroups(prev => {
      const next = prev.map(g => ({ ...g, swatches: g.swatches.slice() }));
      next[groupIndex].swatches[swatchIndex] = nextSwatch;
      return next;
    });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {groups.map((group, gi) => (
        <div key={group.name} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px', background: 'var(--panel)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 9 }}>
            <span style={{ fontWeight: 700, fontSize: 12 }}>{group.name}</span>
            <span style={{ color: 'var(--muted)', fontSize: 10.5 }}>{group.percentage}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {group.swatches.map((sw, si) => (
              <SwatchCard
                key={sw.name} sw={sw} refs={refs} threshold={threshold} level={level}
                onUpdateSwatch={(next) => updateSwatch(gi, si, next)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
