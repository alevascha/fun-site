import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import Background from '../components/Background';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SplitText from '../components/motion/SplitText';
import ParticleField from '../components/motion/ParticleField';
import Magnetic from '../components/motion/Magnetic';
import Marquee from '../components/motion/Marquee';
import Newsletter from '../components/Newsletter';
import { Reveal } from '../components/ui';
import usePageMeta from '../hooks/usePageMeta';
import { useLang } from '../i18n';
import { EASE } from '../lib/motion';
import { experiments } from '../experiments';
import { FREE_USES, PRO_CONTACT, PRO_FAQ, PRO_NEXT, PRO_PLANS, PRO_PLUGINS, PRO_STEPS } from '../pro-content';
import { track } from '../lib/analytics';

const accentFor = path => experiments.find(e => e.path === path)?.accent || '#cd57ff';

export default function ProPage() {
  const { lang, t, to } = useLang();
  usePageMeta({
    title: t("Lab Pro: Figma plugins for designers - Ale's Fun Lab", "Lab Pro: plugins de Figma para diseñadores - Ale's Fun Lab"),
    description: t(`The lab’s tools as Figma plugins: palettes to Variables, contrast fixes, type scales and color blindness previews. ${FREE_USES} free uses each, then $9 per plugin, $29/year or $79 lifetime for all.`, `Las herramientas del lab como plugins de Figma: paletas a Variables, contraste, escalas tipográficas y simulación de daltonismo. ${FREE_USES} usos gratis cada uno; luego $9 por plugin, $29 al año o $79 de por vida.`),
    path: to('/pro'),
    image: '/og/home.png',
    alternates: { en: '/pro', es: '/es/pro' },
  });

  // Hero drifts and fades as the pricing scrolls in, like the home hero.
  const heroRef = useRef(null);
  const { scrollYProgress: heroP } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(heroP, [0, 1], [0, 80]);
  const orbScale = useTransform(heroP, [0, 1], [1, 1.35]);

  // The steps' connecting line fills as the section scrolls through.
  const stepsRef = useRef(null);
  const { scrollYProgress: stepsP } = useScroll({ target: stepsRef, offset: ['start 80%', 'end 60%'] });
  const lineFill = useSpring(stepsP, { stiffness: 120, damping: 30 });

  return (
    <div className="page">
      <Background />
      <div className="page-inner">
        <SiteNav />

        <header ref={heroRef} className="hub-hero pro-hero">
          <ParticleField className="hero-canvas" />
          <motion.div className="hub-hero-orb" aria-hidden="true" style={{ scale: orbScale }} />
          <motion.div style={{ y: heroY }}>
            <motion.div className="hub-kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
              <span className="gradient-dot" /> {t('Launching soon · Figma plugins', 'Muy pronto · Plugins de Figma')}
            </motion.div>
            <h1 className="hub-title" aria-label="Lab Pro">
              <SplitText key={lang} text="Lab" delay={0.1} stagger={0.05} reactive />{' '}
              <SplitText text="Pro" as="em" delay={0.25} stagger={0.06} reactive charClassName="grad-char" />
            </h1>
            <motion.p className="hub-sub" initial={{ y: 16 }} animate={{ y: 0 }} transition={{ duration: 0.7, ease: EASE }}>
              {t(`The lab’s tools, working directly inside your Figma files. Every plugin is free to try with ${FREE_USES} uses; one license unlocks them all.`, `Las herramientas del lab, trabajando directamente dentro de tus archivos de Figma. Cada plugin se prueba gratis con ${FREE_USES} usos; una licencia los desbloquea todos.`)}
            </motion.p>
            <motion.div className="hub-hero-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.4 }}>
              <Magnetic>
                <motion.a href="#pricing" className="btn btn-primary" onClick={() => track('Pro CTA', { cta: 'see-pricing' })} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  {t('See pricing', 'Ver precios')} <span className="arrow" aria-hidden="true">›</span>
                </motion.a>
              </Magnetic>
              <Magnetic>
                <motion.a href="#waitlist" className="btn btn-chip" onClick={() => track('Pro CTA', { cta: 'hero-waitlist' })} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
                  <span className="gradient-dot" /> {t('Join the waitlist', 'Únete a la lista de espera')}
                </motion.a>
              </Magnetic>
            </motion.div>
          </motion.div>
        </header>

        {/* ---------- Pricing ---------- */}
        <section id="pricing" className="pro-section" aria-labelledby="pricing-title">
          <Reveal className="pro-section-head">
            <SplitText key={lang + 'p'} as="h2" id="pricing-title" className="hub-section-title" text={t('Pick your plan', 'Elige tu plan')} inView stagger={0.03} />
            <p className="muted">{t(`Try every plugin free with ${FREE_USES} uses. Pay only when it earns its place in your workflow.`, `Prueba cada plugin gratis con ${FREE_USES} usos. Paga solo cuando se gane su lugar en tu flujo de trabajo.`)}</p>
          </Reveal>
          <div className="pro-plans">
            {PRO_PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                className={'pro-plan' + (plan.featured ? ' is-featured' : '')}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="pro-plan-inner">
                  {plan.featured && <span className="pro-plan-tag">{t('Best value', 'Más conveniente')}</span>}
                  <h3 className="pro-plan-name">{plan[lang].name}</h3>
                  <p className="pro-price">
                    {plan.launch && <s>{plan.price}</s>}
                    <strong className={plan.featured ? 'pro-price-grad' : undefined}>{plan.launch || plan.price}</strong>
                    <span className="muted small">{plan.note[lang]}{plan.launch ? t(' · launch price', ' · precio de lanzamiento') : ''}</span>
                  </p>
                  <ul className="pro-points">
                    {plan[lang].points.map(pt => <li key={pt}><span className="pro-check" aria-hidden="true">✓</span>{pt}</li>)}
                  </ul>
                  <a href="#waitlist" className={'btn ' + (plan.featured ? 'btn-primary' : 'btn-ghost') + ' pro-plan-cta'} onClick={() => track('Pro CTA', { cta: 'plan', plan: plan.id })}>
                    {t('Join the waitlist', 'Únete a la lista de espera')}
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
          <Reveal className="pro-trust">
            <span><b aria-hidden="true">↺</b> {t('14-day refund', 'Reembolso en 14 días')}</span>
            <span><b aria-hidden="true">%</b> {t('Taxes handled at checkout', 'Impuestos incluidos al pagar')}</span>
            <span><b aria-hidden="true">🔒</b> {t('Secure checkout by Lemon Squeezy', 'Pago seguro con Lemon Squeezy')}</span>
          </Reveal>
          <p className="small muted pro-legal">
            {t('Prices in USD. Payments are processed by Lemon Squeezy, our merchant of record. ', 'Precios en USD. Los pagos los procesa Lemon Squeezy, nuestro merchant of record. ')}
            <Link to={to('/terms')}>{t('Terms', 'Términos')}</Link>{' · '}
            <Link to={to('/refunds')}>{t('Refund Policy', 'Política de reembolso')}</Link>{' · '}
            <Link to={to('/privacy')}>{t('Privacy', 'Privacidad')}</Link>
          </p>
        </section>

        {/* ---------- What you get ---------- */}
        <section className="pro-section" aria-labelledby="get-title">
          <Reveal className="pro-section-head">
            <SplitText key={lang + 'g'} as="h2" id="get-title" className="hub-section-title" text={t('What you get', 'Lo que obtienes')} inView stagger={0.03} />
            <p className="muted">{t('Lab Pro unlocks every plugin below, plus each new one as it launches.', 'Lab Pro desbloquea todos estos plugins, y cada uno nuevo a medida que sale.')}</p>
          </Reveal>
          <ul className="pro-list">
            {PRO_PLUGINS.map((p, i) => (
              <motion.li
                key={p.en.name}
                style={{ '--item-accent': accentFor(p.tool) }}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.08 }}
              >
                <motion.div whileHover="hover" whileTap={{ scale: 0.98 }} style={{ height: '100%' }}>
                  <Link to={to(p.tool)} className="pro-item">
                    <motion.span className="pro-item-icon" aria-hidden="true" variants={{ hover: { rotate: [0, -12, 12, 0], scale: 1.1 } }}>{p.emoji}</motion.span>
                    <div className="pro-item-text">
                      <h3>{p[lang].name}</h3>
                      <p className="muted">{p[lang].pitch}</p>
                    </div>
                    <span className="pro-item-link">
                      {t('Free web version', 'Versión web gratis')} <motion.span aria-hidden="true" style={{ display: 'inline-block' }} variants={{ hover: { x: 4 } }}>→</motion.span>
                    </span>
                  </Link>
                </motion.div>
              </motion.li>
            ))}
          </ul>
          <p className="small muted pro-next-label">{t('Coming next to Lab Pro', 'Lo próximo en Lab Pro')}</p>
          <Marquee items={PRO_NEXT[lang]} baseVelocity={-0.6} />
        </section>

        {/* ---------- How the license works ---------- */}
        <section ref={stepsRef} className="pro-section" aria-labelledby="how-title">
          <Reveal className="pro-section-head">
            <SplitText key={lang + 'h'} as="h2" id="how-title" className="hub-section-title" text={t('How your license works', 'Cómo funciona tu licencia')} inView stagger={0.03} />
          </Reveal>
          <ol className="pro-steps">
            <motion.span className="pro-steps-line" aria-hidden="true" style={{ '--fill': lineFill }} />
            {PRO_STEPS.map((s, i) => (
              <motion.li
                key={s.en[0]}
                className="pro-step"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, ease: EASE, delay: i * 0.12 }}
              >
                <span className="pro-step-num" aria-hidden="true">{i + 1}</span>
                <h3>{s[lang][0]}</h3>
                <p className="muted">{s[lang][1]}</p>
              </motion.li>
            ))}
          </ol>
        </section>

        {/* ---------- FAQ ---------- */}
        <Reveal as="section" className="card pro-faq" aria-labelledby="faq-title">
          <h2 id="faq-title" className="card-title">{t('FAQ', 'Preguntas frecuentes')}</h2>
          <div className="stack" style={{ gap: 8 }}>
            {PRO_FAQ.map(f => (
              <details key={f.en[0]} className="faq" onToggle={e => { if (e.currentTarget.open) track('Pro FAQ', { q: f.en[0] }); }}>
                <summary>{f[lang][0]}</summary>
                <p className="muted" style={{ margin: '8px 0 0', lineHeight: 1.6 }}>{f[lang][1]}</p>
              </details>
            ))}
          </div>
          <p className="small muted" style={{ margin: '16px 0 0' }}>
            {t('Other questions? ', '¿Otras preguntas? ')}<a href={`mailto:${PRO_CONTACT}`}>{PRO_CONTACT}</a>
          </p>
        </Reveal>

        <div id="waitlist" style={{ scrollMarginTop: 96 }}>
          <Newsletter source="pro" waitlist />
        </div>
        <SiteFooter />
      </div>
    </div>
  );
}
