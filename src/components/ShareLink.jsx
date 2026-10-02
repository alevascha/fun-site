import useCopy from '../hooks/useCopy';
import { useLang } from '../i18n';
import { CopyButton } from './ui';

/* "Copy link" — the URL already encodes the tool's current settings. */
export default function ShareLink({ tool, className = 'btn btn-ghost btn-sm' }) {
  const [copied, copy] = useCopy();
  const { t } = useLang();
  return (
    <CopyButton className={className} copied={copied === 'link'} onClick={() => copy(window.location.href, 'link', { name: 'Copy', props: { tool, format: 'link' } })}>
      🔗 {t('Copy link', 'Copiar enlace')}
    </CopyButton>
  );
}
