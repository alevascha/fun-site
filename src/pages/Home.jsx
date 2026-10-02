import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useRef } from 'react';
import { experiments } from '../experiments';
import SiteNav from '../components/SiteNav';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

const MotionLink = motion.create(Link);

function ExpCard({ exp }) {
  const ref = useRef(null);

  function handleMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  }

  const content = (
    <>
      <div className="exp-card-glow" />
      <div className="exp-card-sheen" />
      {exp.tag && <span className="exp-card-tag">{exp.tag}</span>}
      <motion.div className="exp-card-emoji" whileHover={exp.active ? { rotate: [0, -8, 8, -4, 0], scale: 1.15 } : {}} transition={{ duration: 0.5 }}>
        {exp.emoji}
      </motion.div>
      <div>
        <div className="exp-card-title">{exp.title}</div>
        <p className="exp-card-desc">{exp.description}</p>
      </div>
    </>
  );
  const style = { '--card-accent': exp.accent };

  const motionProps = exp.active
    ? {
        whileHover: { y: -8, rotate: -1, transition: { type: 'spring', stiffness: 300, damping: 18 } },
        whileTap: { scale: 0.97, rotate: 0 },
      }
    : {};

  return exp.active ? (
    <motion.div variants={item}>
      <MotionLink
        ref={ref}
        to={exp.path}
        className="exp-card active"
        style={style}
        onMouseMove={handleMouseMove}
        {...motionProps}
      >
        {content}
      </MotionLink>
    </motion.div>
  ) : (
    <motion.div variants={item} className="exp-card placeholder" style={style}>
      {content}
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="hub">
      <div className="hub-glow-orb" />
      <div className="hub-inner">
        <SiteNav />
        <motion.header
          className="hub-header"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="hub-kicker">fun.alevasquez.dev</span>
          <h1 className="hub-title">The Fun Lab</h1>
          <p className="hub-sub">
            A small playground of side experiments — things built for fun, to learn something,
            or just because. Pick a card to try one.
          </p>
        </motion.header>

        <motion.div className="card-grid" variants={container} initial="hidden" animate="show">
          {experiments.map(exp => <ExpCard key={exp.id} exp={exp} />)}
        </motion.div>

        <motion.div
          className="hub-cta"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.a
            href="https://www.alevasquez.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="hub-cta-pill"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Do you want to work with me? <span aria-hidden="true">→</span>
          </motion.a>
        </motion.div>

        <footer className="hub-footer">
          Built by Alejandro Vasquez · more experiments added over time
        </footer>
      </div>
    </div>
  );
}
