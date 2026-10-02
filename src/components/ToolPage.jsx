import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import SiteNav from './SiteNav';
import Background from './Background';
import { experiments, getExperiment, getPageMeta } from '../experiments';
import usePageMeta from '../hooks/usePageMeta';
import { markOpened } from '../lib/seen';
import { Reveal } from './ui';
import { EASE } from '../lib/motion';
import SplitText from './motion/SplitText';

export default function ToolPage({ id, intro, children }) {
  const exp = getExperiment(id);
  usePageMeta(getPageMeta(exp));
  useEffect(() => { markOpened(id); window.scrollTo(0, 0); }, [id]);

  const others = experiments.filter(e => e.active && e.id !== id);

  // The header drifts up and fades as the tool scrolls into focus.
  const headerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: headerRef, offset: ['start start', 'end start'] });
  const headerY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.9], [1, 0]);

  return (
    <div className="page" style={{ '--tool-accent': exp.accent }}>
      <Background />
      <div className="page-inner">
        <SiteNav />
        <motion.header
          ref={headerRef}
          style={{ y: headerY, opacity: headerOpacity }}
          className="tool-header"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
        >
          <motion.div variants={{ hidden: { opacity: 0, x: -12 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } } }}>
            <Link to="/" className="back-link"><span className="arrow" aria-hidden="true">←</span> Back to the lab</Link>
          </motion.div>
          <motion.div
            className="tool-title-row"
            variants={{ hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } }}
          >
            <motion.div
              className="tool-emoji"
              initial={{ rotate: -20, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.08 }}
              transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            >
              <span aria-hidden="true">{exp.emoji}</span>
            </motion.div>
            <SplitText as="h1" className="tool-title" text={exp.title} delay={0.15} stagger={0.025} reactive />
          </motion.div>
          <motion.p
            className="tool-desc"
            variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}
          >
            {intro || exp.description}
          </motion.p>
        </motion.header>

        <main>{children}</main>

        <Reveal as="section" style={{ marginTop: 'clamp(48px, 8vw, 96px)' }} aria-labelledby="more-title">
          <h2 id="more-title" style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: '0 0 20px' }}>More experiments</h2>
          <div className="more-grid">
            {others.map(o => (
              <motion.div key={o.id} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }}>
                <Link to={o.path} className="more-link" data-cursor="Go">
                  <span className="more-link-emoji" aria-hidden="true">{o.emoji}</span>
                  <span style={{ flex: 1 }}>{o.title}</span>
                  <span aria-hidden="true" className="muted">→</span>
                </Link>
              </motion.div>
            ))}
          </div>
        </Reveal>

        <footer className="site-footer">
          <span>Built for fun by Alejandro Vasquez</span>
          <a href="https://www.alevasquez.dev/" target="_blank" rel="noopener noreferrer" className="btn btn-chip btn-sm">
            Work with me <span className="arrow" aria-hidden="true">→</span>
          </a>
        </footer>
      </div>
    </div>
  );
}
