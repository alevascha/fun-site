import { ColorField } from './ui';
import { useLang } from '../i18n';
import { localName } from '../lib/palette';

const DEFAULTS = [
  { name: 'Dark', hex: '#000000' },
  { name: 'Light', hex: '#FFFFFF' },
  { name: 'Accent', hex: '#FFF200' },
];

export { DEFAULTS as DEFAULT_TEXT_COLORS };

export default function TextColorInputs({ refs, setRefs }) {
  const { t } = useLang();
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
        {t('Text / foreground colors', 'Colores de texto')}
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRefs(DEFAULTS.map(d => ({ ...d })))}>{t('Reset', 'Restablecer')}</button>
      </h2>
      {refs.map((ref, i) => (
        <div key={ref.name} className="text-ref-row">
          <span style={{ fontSize: 14, fontWeight: 500 }}>{t(`${ref.name} text`, `Texto ${localName(ref.name, 'es').toLowerCase()}`)}</span>
          <ColorField value={ref.hex} onChange={hex => updateHex(i, hex)} label={t(`${ref.name} text color`, `Color de texto ${localName(ref.name, 'es').toLowerCase()}`)} hideLabel id={`ref-${ref.name}`} />
        </div>
      ))}
    </div>
  );
}
