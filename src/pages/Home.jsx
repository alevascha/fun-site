import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import { useMemo, useRef, useState } from 'react';
import { experiments, HOME_META, HOME_META_ES } from '../experiments';
import { useLang } from '../i18n';
import { GUIDES } from '../guides';
import Newsletter from '../components/Newsletter';
import Background from '../components/Background';
import SiteNav from '../components/SiteNav';
import usePageMeta from '../hooks/usePageMeta';
import useIsTouch from '../hooks/useIsTouch';
import { isNew } from '../lib/seen';
import { Reveal, Segmented } from '../components/ui';
import { EASE } from '../lib/motion';
import ParticleField from '../components/motion/ParticleField';
import Magnetic from '../components/motion/Magnetic';
import SplitText from '../components/motion/SplitText';
import Marquee from '../components/motion/Marquee';
import SiteFooter from '../components/SiteFooter';
import AdSlot from '../components/AdSlot';

const MotionLink = motion.create(Link);

const CATEGORY_ES = { All: 'Todos', Color: 'Color', Accessibility: 'Accesibilidad', Typography: 'Tipografía', UI: 'UI', 'Design systems': 'Design systems', Motion: 'Movimiento', Assets: 'Recursos', Games: 'Juegos' };

function ExpCard({ exp, fresh, index }) {
  const ref = useRef(null);
  const { lang, t, to, name, blurb } = useLang();
  // 3D tilt: pointer position → spring-smoothed rotateX/rotateY.
  const px = useMotionValue(0.5), py = useMotionValue(0.5);
  const spring = { stiffness: 200, damping: 18, mass: 0.5 };
  const rotateX = useSpring(useTransform(py, [0, 1], [9, -9]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-11, 11]), spring);
  const emojiX = useSpring(useTransform(px, [0, 1], [-10, 10]), spring);
  const emojiY = useSpring(useTransform(py, [0, 1], [-10, 10]), spring);

  function handleMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }
  function handleMouseLeave() { px.set(0.5); py.set(0.5); }

  const isTouch = useIsTouch();
  const wrapRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start end', 'end start'] });

  // Desktop: columns travel at different speeds (parallax).
  const depth = isTouch ? 0 : [40, -10, 70][index % 3];
  const parallaxY = useSpring(useTransform(scrollYProgress, [0, 1], [depth, -depth]), { stiffness: 120, damping: 24 });

  // Touch: each card tips up into focus as it reaches the middle of the
  // screen, glows brightest there, and its emoji spins with the scroll.
  const focus = { stiffness: 160, damping: 26 };
  const focusScale = useSpring(useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.86, 1, 1, 0.92]), focus);
  const focusRotateX = useSpring(useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [24, 0, 0, -14]), focus);
  const focusGlow = useTransform(scrollYProgress, [0.15, 0.5, 0.85], [0.1, 0.65, 0.1]);
  const emojiSpin = useTransform(scrollYProgress, [0, 1], [-50, 50]);

  return (
    <motion.div
      ref={wrapRef}
      layout
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.2 } }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.05 * index }}
    >
      <motion.div style={{ y: parallaxY, height: '100%' }}>
      <MotionLink
        ref={ref}
        to={to(exp.path)}
        className="exp-card"
        style={isTouch
          ? { '--card-accent': exp.accent, rotateX: focusRotateX, scale: focusScale, transformPerspective: 900 }
          : { '--card-accent': exp.accent, rotateX, rotateY, transformPerspective: 900 }}
        onMouseMove={isTouch ? undefined : handleMouseMove}
        onMouseLeave={isTouch ? undefined : handleMouseLeave}
        data-cursor={t('Open', 'Abrir')}
        whileHover={isTouch ? undefined : { y: -8, transition: { type: 'spring', stiffness: 300, damping: 20 } }}
        whileTap={{ scale: isTouch ? 0.95 : 0.98 }}
      >
        <motion.div className="exp-card-glow" style={isTouch ? { opacity: focusGlow } : undefined} />
        <div className="exp-card-sheen" />
        <div className="exp-card-top">
          <motion.div
            className="exp-card-emoji"
            style={isTouch ? { rotate: emojiSpin } : { x: emojiX, y: emojiY, translateZ: 40 }}
            whileHover={isTouch ? undefined : { rotate: [0, -10, 10, -5, 0], scale: 1.12 }}
            transition={{ duration: 0.5 }}
            aria-hidden="true"
          >
            {exp.emoji}
          </motion.div>
          {fresh && <span className="new-badge">{t('New', 'Nuevo')}</span>}
        </div>
        <div>
          <h3 className="exp-card-title">{name(exp)}</h3>
          <p className="exp-card-desc">{blurb(exp)}</p>
        </div>
        <div className="exp-card-foot">
          <span>{lang === 'es' ? CATEGORY_ES[exp.category] || exp.category : exp.category}</span>
          <span className="exp-card-go" aria-hidden="true">→</span>
        </div>
      </MotionLink>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const { lang, t, to } = useLang();
  usePageMeta(lang === 'es' ? HOME_META_ES : HOME_META);
  const [filter, setFilter] = useState('All');
  // Computed once per visit, so badges don't vanish mid-session.
  const [freshIds] = useState(() => new Set(experiments.filter(e => isNew(e)).map(e => e.id)));

  const active = experiments.filter(e => e.active);
  const categories = useMemo(() => ['All', ...new Set(active.map(e => e.category))], [active]);
  const shown = filter === 'All' ? active : active.filter(e => e.category === filter);

  // Framer-style scroll choreography: the hero card shrinks and fades as it
  // leaves, while its orb rises; the section title drifts in from the side.
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroScale = useTransform(heroProgress, [0, 1], [1, 0.9]);
  const heroOpacity = useTransform(heroProgress, [0, 0.8], [1, 0.2]);
  const heroContentY = useTransform(heroProgress, [0, 1], [0, 120]);
  const orbY = useTransform(heroProgress, [0, 1], ['0%', '-60%']);
  const orbScale = useTransform(heroProgress, [0, 1], [1, 1.5]);

  const sectionRef = useRef(null);
  const { scrollYProgress: sectionProgress } = useScroll({ target: sectionRef, offset: ['start end', 'start center'] });
  const titleX = useTransform(sectionProgress, [0, 1], [80, 0]);

  // The grid leans with scroll velocity, then settles.
  const { scrollY } = useScroll();
  const gridSkew = useSpring(useTransform(useVelocity(scrollY), [-2500, 0, 2500], [2.5, 0, -2.5]), { stiffness: 300, damping: 40 });

  return (
    <div className="page">
      <Background />
      <div className="page-inner">
        <SiteNav />

        <motion.header ref={heroRef} className="hub-hero" style={{ scale: heroScale, opacity: heroOpacity }}>
          <ParticleField className="hero-canvas" />
          <motion.div className="hub-hero-orb" aria-hidden="true" style={{ y: orbY, scale: orbScale }} />
          <motion.div style={{ y: heroContentY }}>
          <motion.div
            className="hub-kicker"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="gradient-dot" /> Alejandro Vasquez · {t('code playground', 'laboratorio de código')}
          </motion.div>
          <h1 className="hub-title" aria-label="Ale's Fun Lab">
            <SplitText text="Ale's Fun" delay={0.15} stagger={0.04} reactive />{' '}
            <SplitText text="Lab" as="em" delay={0.45} stagger={0.06} reactive charClassName="grad-char" />
          </h1>
          <motion.p
            className="hub-sub"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
          >
            {t(
              'Small, fun tools I build on the side — color, type and design-system experiments with accessibility baked in. Pick one and play.',
              'Herramientas pequeñas y divertidas que construyo por mi cuenta: experimentos de color, tipografía y design systems con la accesibilidad incluida. Elige una y juega.',
            )}
          </motion.p>
          <motion.div
            className="hub-hero-actions"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.45 }}
          >
            <Magnetic>
            <motion.a href="#experiments" className="btn btn-chip" whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <span className="gradient-dot" /> {t(`Explore ${active.length} experiments`, `Explora ${active.length} experimentos`)}
              {freshIds.size > 0 && <span className="muted" style={{ color: 'inherit', opacity: 0.6 }}>· {freshIds.size} {t('new', freshIds.size === 1 ? 'nuevo' : 'nuevos')}</span>}
            </motion.a>
            </Magnetic>
            <Magnetic>
            <motion.a
              href="https://www.alevasquez.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {t('See my work', 'Ver mi trabajo')} <span className="arrow" aria-hidden="true">›</span>
            </motion.a>
            </Magnetic>
          </motion.div>
          </motion.div>
        </motion.header>

        <Marquee items={lang === 'es'
          ? ['Color', 'Accesibilidad', 'Tipografía', 'Design tokens', 'WCAG 2.2', 'React', 'Canvas', 'Movimiento']
          : ['Color', 'Accessibility', 'Typography', 'Design tokens', 'WCAG 2.2', 'React', 'Canvas', 'Motion']} />

        <section id="experiments" ref={sectionRef} style={{ scrollMarginTop: 96 }}>
          <Reveal className="hub-section-head">
            <motion.div style={{ x: titleX }}>
              <SplitText key={lang} as="h2" className="hub-section-title" text={t('Experiments', 'Experimentos')} inView stagger={0.03} />
            </motion.div>
            <Segmented
              label={t('Filter experiments', 'Filtrar experimentos')}
              options={categories.map(c => ({ value: c, label: lang === 'es' ? CATEGORY_ES[c] || c : c }))}
              value={filter}
              onChange={setFilter}
              scroll
            />
          </Reveal>

          <motion.div layout className="card-grid" style={{ skewY: gridSkew }}>
            <AnimatePresence mode="popLayout">
              {shown.map((exp, i) => <ExpCard key={exp.id} exp={exp} index={i} fresh={freshIds.has(exp.id)} />)}
            </AnimatePresence>
          </motion.div>
        </section>

        <section aria-label={t('Guides', 'Guías')} style={{ marginTop: 'clamp(48px, 8vw, 96px)' }}>
          <Reveal className="hub-section-head">
            <SplitText key={lang} as="h2" className="hub-section-title" text={t('Guides', 'Guías')} inView stagger={0.03} />
            <Link to={to('/guides')} className="btn btn-ghost btn-sm">{t('All guides', 'Todas las guías')} <span className="arrow" aria-hidden="true">→</span></Link>
          </Reveal>
          <div className="card-grid">
            {GUIDES.map((g, i) => (
              <Reveal key={g.slug} delay={i * 0.05}>
                <Link to={to(`/guides/${g.slug}`)} className="guide-card">
                  <span className="guide-card-meta">📖 {g.minutes} min</span>
                  <h3 className="exp-card-title" style={{ fontSize: 24 }}>{g[lang].title}</h3>
                  <p className="exp-card-desc">{g[lang].description}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </section>

        <Newsletter source="home" />

        <AdSlot slot="hub" />

        <Reveal as="section" className="hub-cta">
          <div className="hub-hero-orb" aria-hidden="true" style={{ opacity: 0.3 }} />
          <SplitText key={lang} as="h2" text={t('Do you want to work with me?', '¿Quieres trabajar conmigo?')} inView stagger={0.018} />
          <p className="hub-sub" style={{ marginBottom: 28 }}>
            {t('I build design systems and the tools around them. These experiments are the fun side of that.', 'Construyo design systems y las herramientas que los rodean. Estos experimentos son el lado divertido de eso.')}
          </p>
          <Magnetic strength={0.5}>
            <motion.a
              href="https://www.alevasquez.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-chip"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              data-cursor={t('Hi! 👋', '¡Hola! 👋')}
            >
              <span className="gradient-dot" /> {t('Connect with me', 'Conectemos')} <span className="arrow" aria-hidden="true">→</span>
            </motion.a>
          </Magnetic>
        </Reveal>

        <SiteFooter />
      </div>
    </div>
  );
}
