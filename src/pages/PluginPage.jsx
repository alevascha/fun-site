import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Background from '../components/Background';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SplitText from '../components/motion/SplitText';
import Magnetic from '../components/motion/Magnetic';
import Newsletter from '../components/Newsletter';
import Steps from '../components/Steps';
import { Reveal } from '../components/ui';
import NotFound from './NotFound';
import usePageMeta from '../hooks/usePageMeta';
import { useLang } from '../i18n';
import { EASE } from '../lib/motion';
import { experiments } from '../experiments';
import { FREE_USES, PRO_PLUGINS } from '../pro-content';
import { PLUGIN_PAGES, pluginBySlug, pluginPath } from '../plugin-pages';
import { track } from '../lib/analytics';

const accentFor = p => p.accent || experiments.find(e => e.path === p.tool)?.accent || '#cd57ff';

export default function PluginPage() {
  const { slug } = useParams();
  const { lang, t, to } = useLang();
  const id = pluginBySlug(slug, lang);
  const plugin = PRO_PLUGINS.find(p => p.id === id);
  const page = PLUGIN_PAGES[id];
  usePageMeta(plugin ? {
    title: t(`${plugin.en.name}: Figma plugin - Ale's Fun Lab`, `${plugin.es.name}: plugin de Figma - Ale's Fun Lab`),
    description: plugin[lang].pitch,
    path: pluginPath(id, lang),
    image: `/plugin-assets/${id}/og.png`,
    alternates: { en: pluginPath(id, 'en'), es: pluginPath(id, 'es') },
  } : { title: "Not found - Ale's Fun Lab", description: '', path: '/404', image: '/og/home.png' });
  if (!plugin) return <NotFound />;

  const c = plugin[lang], copy = page[lang], accent = accentFor(plugin);
  const tool = plugin.tool && experiments.find(e => e.path === plugin.tool);
  const others = PRO_PLUGINS.filter(p => p.id !== id);
  const related = [...others.slice(PRO_PLUGINS.indexOf(plugin)), ...others].slice(0, 3);
  const steps = [
    { title: t('Install it in Figma', 'Instálalo en Figma'), text: t('From Figma Community (launching soon). It runs in Design Mode on every plan.', 'Desde Figma Community (muy pronto). Funciona en Design Mode en cualquier plan.') },
    { title: t('Run it on your file', 'Úsalo en tu archivo'), text: t('Select a frame or a page and run it from the Plugins menu. Previewing never counts as a use.', 'Selecciona un frame o una página y ábrelo desde el menú Plugins. Previsualizar nunca cuenta como uso.') },
    { title: t(`${FREE_USES} free uses`, `${FREE_USES} usos gratis`), text: t('A use is when it writes to your file. After that, one license unlocks it, or Lab Pro unlocks every plugin.', 'Un uso es cuando escribe en tu archivo. Después, una licencia lo desbloquea, o Lab Pro desbloquea todos los plugins.') },
  ];

  return (
    <div className="page" style={{ '--item-accent': accent }}>
      <Background />
      <div className="page-inner">
        <SiteNav />
        <main>
          <header className="plugin-hero">
            <div className="plugin-hero-text">
              <Link to={to('/plugins')} className="back-link"><span className="arrow" aria-hidden="true">←</span> {t('All plugins', 'Todos los plugins')}</Link>
              <motion.div className="hub-kicker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
                <img src={`/plugin-assets/${id}/icon.png`} alt="" width="28" height="28" className="plugin-kicker-icon" /> {t('Figma plugin · launching soon', 'Plugin de Figma · muy pronto')}
              </motion.div>
              <SplitText key={lang + id} as="h1" className="tool-title" text={c.name} delay={0.1} stagger={0.04} reactive />
              <motion.p className="tool-desc" initial={{ opacity: 0.01, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>{c.pitch}</motion.p>
              <motion.div className="hub-hero-actions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}>
                <Magnetic>
                  <a href="#waitlist" className="btn btn-primary" onClick={() => track('Plugin CTA', { plugin: id, cta: 'waitlist' })}>
                    <span className="gradient-dot" /> {t('Join the waitlist', 'Únete a la lista de espera')}
                  </a>
                </Magnetic>
                <Magnetic>
                  <Link to={to('/pro') + '#pricing'} className="btn btn-ghost" onClick={() => track('Plugin CTA', { plugin: id, cta: 'pricing' })}>
                    {t('See pricing', 'Ver precios')} <span className="arrow" aria-hidden="true">›</span>
                  </Link>
                </Magnetic>
              </motion.div>
              {tool && (
                <p className="small muted plugin-hero-tool">
                  {t('Prefer the browser? ', '¿Prefieres el navegador? ')}<Link to={to(tool.path)}>{t('Try the free web version', 'Prueba la versión web gratis')} →</Link>
                </p>
              )}
            </div>
            <motion.figure className="plugin-window" initial={{ opacity: 0, y: 40, rotate: 2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}>
              <img src={`/plugin-assets/${id}/ui-1.webp`} alt={t(`${c.name} running in Figma`, `${c.name} funcionando en Figma`)} width="440" height="860" fetchPriority="high" />
            </motion.figure>
          </header>

          <section className="pro-section plugin-about" aria-labelledby="about-title">
            <Reveal className="pro-section-head">
              <SplitText key={lang + 'a'} as="h2" id="about-title" className="hub-section-title" text={t('What it does', 'Qué hace')} inView stagger={0.03} />
            </Reveal>
            <Reveal className="plugin-prose">
              {copy.description.map(p => <p key={p.slice(0, 24)}>{p}</p>)}
            </Reveal>
          </section>

          <section className="pro-section" aria-label={t('Screens', 'Pantallas')}>
            <ol className="plugin-shots">
              {copy.shots.map(([headline, caption], i) => (
                <motion.li
                  key={headline}
                  className={'plugin-shot' + (i % 2 ? ' is-flipped' : '')}
                  initial={{ opacity: 0, y: 48 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  <figure className="plugin-window is-small">
                    <img src={`/plugin-assets/${id}/ui-${i + 1}.webp`} alt={headline} width="440" height="860" loading="lazy" decoding="async" />
                  </figure>
                  <div className="plugin-shot-text">
                    <span className="plugin-shot-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <h3>{headline}</h3>
                    <p className="muted">{caption}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
          </section>

          <section className="pro-section" aria-labelledby="features-title">
            <Reveal className="pro-section-head">
              <SplitText key={lang + 'f'} as="h2" id="features-title" className="hub-section-title" text={t('Everything it does', 'Todo lo que hace')} inView stagger={0.03} />
            </Reveal>
            <div className="plugin-features">
              {c.features.map(([group, list], i) => (
                <Reveal key={group} delay={i * 0.08} className="card plugin-feature">
                  <p className="eyebrow">{group}</p>
                  <ul>{list.map(x => <li key={x}>{x}</li>)}</ul>
                </Reveal>
              ))}
            </div>
          </section>

          <section className="pro-section" aria-labelledby="how-title">
            <Reveal className="pro-section-head">
              <SplitText key={lang + 'h'} as="h2" id="how-title" className="hub-section-title" text={t('How it works', 'Cómo funciona')} inView stagger={0.03} />
            </Reveal>
            <Steps items={steps} />
          </section>

          <section className="pro-section" aria-labelledby="more-title">
            <Reveal className="pro-section-head">
              <SplitText key={lang + 'm'} as="h2" id="more-title" className="hub-section-title" text={t('More plugins', 'Más plugins')} inView stagger={0.03} />
              <p className="muted">{t('Lab Pro unlocks all of them with one key.', 'Lab Pro los desbloquea todos con una sola clave.')} <Link to={to('/plugins')}>{t('See all plugins', 'Ver todos los plugins')} →</Link></p>
            </Reveal>
            <div className="card-grid plugin-grid">
              {related.map((p, i) => (
                <Reveal key={p.id} delay={i * 0.05}>
                  <Link to={to(`/plugins/${PLUGIN_PAGES[p.id].slug}`)} className="guide-card plugin-card" style={{ '--item-accent': accentFor(p) }}>
                    <span className="plugin-card-top">
                      <img src={`/plugin-assets/${p.id}/icon.png`} alt="" width="48" height="48" className="plugin-card-icon" loading="lazy" />
                    </span>
                    <h3 className="exp-card-title" style={{ fontSize: 26 }}>{p[lang].name}</h3>
                    <p className="exp-card-desc">{p[lang].pitch}</p>
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>

          <div id="waitlist" style={{ scrollMarginTop: 96 }}>
            <Newsletter source={`plugin-${id}`} waitlist />
          </div>
        </main>
        <SiteFooter />
      </div>
    </div>
  );
}
