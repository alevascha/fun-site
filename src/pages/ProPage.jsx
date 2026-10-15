import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Background from '../components/Background';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SplitText from '../components/motion/SplitText';
import Newsletter from '../components/Newsletter';
import { Reveal } from '../components/ui';
import usePageMeta from '../hooks/usePageMeta';
import { useLang } from '../i18n';
import { EASE } from '../lib/motion';
import { FREE_USES, PRO_CONTACT, PRO_FAQ, PRO_NEXT, PRO_PLANS, PRO_PLUGINS } from '../pro-content';

export default function ProPage() {
  const { lang, t, to } = useLang();
  usePageMeta({
    title: t("Lab Pro: Figma plugins for designers — Ale's Fun Lab", "Lab Pro: plugins de Figma para diseñadores — Ale's Fun Lab"),
    description: t(`The lab’s tools as Figma plugins: palettes to Variables, contrast fixes, type scales and color blindness previews. ${FREE_USES} free uses each, then $9 per plugin, $29/year or $79 lifetime for all.`, `Las herramientas del lab como plugins de Figma: paletas a Variables, contraste, escalas tipográficas y simulación de daltonismo. ${FREE_USES} usos gratis cada uno; luego $9 por plugin, $29 al año o $79 de por vida.`),
    path: to('/pro'),
    image: '/og/home.png',
    alternates: { en: '/pro', es: '/es/pro' },
  });

  return (
    <div className="page">
      <Background />
      <div className="page-inner">
        <SiteNav />
        <header className="tool-header pro-hero">
          <motion.span className="badge badge-neutral" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <span className="gradient-dot" style={{ width: 10, height: 10 }} /> {t('Launching soon · Figma plugins', 'Muy pronto · Plugins de Figma')}
          </motion.span>
          <h1 className="hub-title" style={{ maxWidth: '12ch', margin: 0 }}>
            <SplitText key={lang} text="Lab" delay={0.1} stagger={0.05} reactive />{' '}
            <SplitText text="Pro" as="em" delay={0.25} stagger={0.06} reactive charClassName="grad-char" />
          </h1>
          <p className="tool-desc">
            {t(`The lab’s tools, working directly inside your Figma files. Free to try with ${FREE_USES} uses per plugin, then one license unlocks them.`, `Las herramientas del lab, trabajando directamente dentro de tus archivos de Figma. Pruébalas gratis con ${FREE_USES} usos por plugin; luego una licencia las desbloquea.`)}
          </p>
        </header>

        <Newsletter source="pro" waitlist />

        <section className="card-grid" style={{ marginTop: 'clamp(48px, 8vw, 96px)' }} aria-label={t('Launch plugins', 'Plugins de lanzamiento')}>
          {PRO_PLUGINS.map((p, i) => (
            <Reveal key={p.en.name} delay={i * 0.06}>
              <motion.div className="guide-card" whileHover={{ y: -6, rotate: -0.5 }}>
                <span className="exp-card-emoji" aria-hidden="true" style={{ fontSize: 28 }}>{p.emoji}</span>
                <h2 className="exp-card-title">{p[lang].name}</h2>
                <p className="exp-card-desc">{p[lang].pitch}</p>
                <Link to={to(p.tool)} className="small" style={{ color: 'var(--muted)' }}>{t('Try the free web version', 'Prueba la versión web gratuita')} →</Link>
              </motion.div>
            </Reveal>
          ))}
        </section>
        <Reveal as="p" className="small muted pro-next">
          {t('Coming next: ', 'Después vienen: ')}{PRO_NEXT[lang].join(' · ')}
        </Reveal>

        <section className="pro-pricing" aria-labelledby="pricing-title" style={{ marginTop: 'clamp(48px, 8vw, 96px)' }}>
          <h2 id="pricing-title" className="hub-section-title" style={{ marginBottom: 8 }}>{t('Pricing', 'Precios')}</h2>
          <p className="muted" style={{ margin: '0 0 24px', maxWidth: '60ch' }}>
            {t(`Every plugin is free to install and includes ${FREE_USES} free uses. When you need more, pick a plan.`, `Cada plugin se instala gratis e incluye ${FREE_USES} usos gratis. Cuando necesites más, elige un plan.`)}
          </p>
          <div className="pro-plans">
            {PRO_PLANS.map((plan, i) => (
              <Reveal key={plan.id} delay={i * 0.06} className={'card pro-plan' + (plan.featured ? ' is-featured' : '')}>
                {plan.featured && <span className="badge badge-neutral pro-plan-tag">{t('Best value', 'Más conveniente')}</span>}
                <h3 className="card-title" style={{ margin: 0 }}>{plan[lang].name}</h3>
                <p className="pro-price">
                  {plan.launch ? <><s className="muted">{plan.price}</s> <strong>{plan.launch}</strong></> : <strong>{plan.price}</strong>}
                  <span className="muted small"> {plan.note[lang]}{plan.launch ? t(' · launch price', ' · precio de lanzamiento') : ''}</span>
                </p>
                <ul className="pro-points">{plan[lang].points.map(pt => <li key={pt}>{pt}</li>)}</ul>
                <span className="btn btn-ghost pro-soon" aria-disabled="true">{t('Available at launch', 'Disponible en el lanzamiento')}</span>
              </Reveal>
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 16 }}>
            {t('Prices in USD. Taxes are calculated at checkout. Payments are processed by Lemon Squeezy, our merchant of record. ', 'Precios en USD. Los impuestos se calculan al pagar. Los pagos los procesa Lemon Squeezy, nuestro merchant of record. ')}
            <Link to={to('/terms')}>{t('Terms', 'Términos')}</Link>{' · '}
            <Link to={to('/refunds')}>{t('Refund Policy', 'Política de reembolso')}</Link>{' · '}
            <Link to={to('/privacy')}>{t('Privacy', 'Privacidad')}</Link>
          </p>
        </section>

        <Reveal className="card" style={{ marginTop: 'clamp(48px, 8vw, 96px)', maxWidth: 820 }}>
          <h2 className="card-title">{t('FAQ', 'Preguntas frecuentes')}</h2>
          <div className="stack" style={{ gap: 8 }}>
            {PRO_FAQ.map(f => (
              <details key={f.en[0]} className="faq">
                <summary>{f[lang][0]}</summary>
                <p className="muted" style={{ margin: '8px 0 0', lineHeight: 1.6 }}>{f[lang][1]}</p>
              </details>
            ))}
          </div>
          <p className="small muted" style={{ margin: '16px 0 0' }}>
            {t('Questions about Lab Pro or your license? ', '¿Preguntas sobre Lab Pro o tu licencia? ')}<a href={`mailto:${PRO_CONTACT}`}>{PRO_CONTACT}</a>
          </p>
        </Reveal>
        <SiteFooter />
      </div>
    </div>
  );
}
