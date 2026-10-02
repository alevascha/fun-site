import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLang } from '../i18n';
import { track } from '../lib/analytics';
import { haptic } from '../lib/haptics';

/* "Was this useful?" + an optional suggestion, sent as anonymous Umami
   events (no personal data). */
export default function Feedback({ tool }) {
  const { t } = useLang();
  const [vote, setVote] = useState(null);
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  function castVote(v) {
    setVote(v);
    haptic(10);
    track('Feedback', { tool, vote: v });
  }

  function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    track('Suggestion', { tool, vote: vote || 'none', text: text.trim().slice(0, 300) });
    setSent(true);
  }

  return (
    <section className="feedback" aria-label={t('Feedback', 'Comentarios')}>
      <AnimatePresence mode="wait" initial={false}>
        {!vote ? (
          <motion.div key="ask" className="feedback-row" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -6 }}>
            <span>{t('Was this tool useful?', '¿Te sirvió esta herramienta?')}</span>
            <motion.button type="button" className="feedback-vote" whileHover={{ y: -3, rotate: -8 }} whileTap={{ scale: 0.8 }} onClick={() => castVote('up')} aria-label={t('Yes, useful', 'Sí, me sirvió')}>👍</motion.button>
            <motion.button type="button" className="feedback-vote" whileHover={{ y: -3, rotate: 8 }} whileTap={{ scale: 0.8 }} onClick={() => castVote('down')} aria-label={t('Not really', 'No mucho')}>👎</motion.button>
          </motion.div>
        ) : sent ? (
          <motion.p key="thanks" role="status" className="feedback-row" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            {t('Thank you — I read every suggestion. 💜', 'Gracias, leo cada sugerencia. 💜')}
          </motion.p>
        ) : (
          <motion.form key="more" className="feedback-form" onSubmit={send} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <label htmlFor={`fb-${tool}`} className="feedback-row" style={{ display: 'block' }}>
              {vote === 'up'
                ? t('Thanks! Anything you’d add — or a tool you wish existed?', '¡Gracias! ¿Algo que agregarías, o una herramienta que te gustaría que existiera?')
                : t('Sorry about that. What was missing?', 'Lo siento. ¿Qué faltó?')}
            </label>
            <div className="feedback-input-row">
              <input id={`fb-${tool}`} className="input" value={text} maxLength={300} onChange={e => setText(e.target.value)} placeholder={t('Optional — no personal info, please', 'Opcional, sin datos personales')} />
              <button type="submit" className="btn btn-ghost" disabled={!text.trim()}>{t('Send', 'Enviar')}</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}
