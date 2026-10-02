import { ColorField } from './ui';

const DEFAULTS = [
  { name: 'Dark', hex: '#000000' },
  { name: 'Light', hex: '#FFFFFF' },
  { name: 'Accent', hex: '#FFF200' },
];

export { DEFAULTS as DEFAULT_TEXT_COLORS };

export default function TextColorInputs({ refs, setRefs }) {
  function updateHex(i, hex) {
    setRefs(prev => {
      const next = prev.slice();
      next[i] = { ...next[i], hex };
      return next;
    });
  }

  return (
    <div>
      <h2 className="eyebrow">
        Text / foreground colors
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRefs(DEFAULTS.map(d => ({ ...d })))}>Reset</button>
      </h2>
      {refs.map((ref, i) => (
        <div key={ref.name} className="text-ref-row">
          <span style={{ fontSize: 14, fontWeight: 500 }}>{ref.name} text</span>
          <ColorField value={ref.hex} onChange={hex => updateHex(i, hex)} label={`${ref.name} text color`} hideLabel id={`ref-${ref.name}`} />
        </div>
      ))}
    </div>
  );
}
