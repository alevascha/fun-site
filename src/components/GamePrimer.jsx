import { motion } from 'framer-motion';
import { useLang } from '../i18n';

/* Beginner layer shared by the games: one plain-language sentence for people
   who aren't designers, a short glossary of the jargon the game uses, and a
   practice button (no timer, no score, every answer explained). */

export function GamePrimer({ plain, terms = [] }) {
  const { t } = useLang();
  return (
    <div className="gp">
      <p className="gp-plain"><span className="gp-tag">{t('In plain words', 'En palabras simples')}</span>{plain}</p>
      {terms.length > 0 && (
        <details className="gp-terms">
          <summary>{t('New to these words?', '¿Palabras nuevas?')}</summary>
          <dl>{terms.map(([term, def]) => <div key={term}><dt>{term}</dt><dd>{def}</dd></div>)}</dl>
        </details>
      )}
    </div>
  );
}

export function PracticeButton({ onClick }) {
  const { t } = useLang();
  return (
    <motion.button type="button" className="btn btn-ghost gp-practice" whileTap={{ scale: 0.96 }} onClick={onClick}>
      {t('Practice first (no timer, no score)', 'Practicar primero (sin tiempo ni puntaje)')}
    </motion.button>
  );
}

export function PracticeBadge({ onExit }) {
  const { t } = useLang();
  return (
    <div className="gp-badge" role="note">
      <span>🧪 {t('Practice round: take your time, nothing is scored.', 'Ronda de práctica: tómate tu tiempo, no cuenta puntaje.')}</span>
      {onExit && <button type="button" className="gp-exit" onClick={onExit}>{t('Skip to the game', 'Ir al juego')}</button>}
    </div>
  );
}

// Teaching note shown under an answer.
export function Lesson({ children, tone = 'info' }) {
  return (
    <motion.p className={'gp-lesson is-' + tone} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role="status">{children}</motion.p>
  );
}
