import { hexToRgb, rgbToHex } from '../lib/color';

const DEFAULTS = [
  { name: 'Dark', hex: '#000000' },
  { name: 'Light', hex: '#FFFFFF' },
  { name: 'Accent', hex: '#FFF200' },
];

export { DEFAULTS as DEFAULT_TEXT_COLORS };

export default function TextColorInputs({ refs, setRefs }) {
  function updateHex(i, value) {
    const rgb = hexToRgb(value);
    setRefs(prev => {
      const next = prev.slice();
      if (rgb) next[i] = { ...next[i], hex: rgbToHex(rgb.r, rgb.g, rgb.b) };
      return next;
    });
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--muted)', fontWeight: 700 }}>Text / Foreground Colors</span>
        <button
          onClick={() => setRefs(DEFAULTS.map(d => ({ ...d })))}
          style={{ background: 'none', border: 'none', color: 'var(--muted)', textDecoration: 'underline', cursor: 'pointer', fontSize: 10 }}
        >
          reset
        </button>
      </div>
      {refs.map((ref, i) => (
        <div key={ref.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid var(--border)', background: ref.hex, flex: 'none' }} />
          <div style={{ width: 78, color: 'var(--muted)', fontSize: 11, flex: 'none' }}>{ref.name} text</div>
          <input
            value={ref.hex}
            onChange={e => updateHex(i, e.target.value)}
            style={{ width: 85, fontSize: 11, padding: '5px 7px', border: '1px solid var(--border)', borderRadius: 6, background: 'var(--panel2)', color: 'var(--text)' }}
          />
        </div>
      ))}
    </div>
  );
}
