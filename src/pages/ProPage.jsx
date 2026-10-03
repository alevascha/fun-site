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

const PLUGINS = [
  {
    emoji: '🧬', tool: '/token-converter',
    en: { name: 'Token Sync', pitch: 'Import design tokens into Figma Variables — with Light/Dark modes and aliases — and export Variables back to CSS, Tailwind or SwiftUI.' },
    es: { name: 'Token Sync', pitch: 'Importa design tokens a Variables de Figma, con modos Claro/Oscuro y alias, y exporta las Variables de vuelta a CSS, Tailwind o SwiftUI.' },
  },
  {
    emoji: '🌗', tool: '/contrast-checker',
    en: { name: 'Contrast Fixer', pitch: 'Scan a page for failing text and UI contrast and fix every issue in place with the smallest color change — in one click, in bulk.' },
    es: { name: 'Contrast Fixer', pitch: 'Revisa una página en busca de texto e interfaz con bajo contraste y corrige cada problema en el lugar con el menor cambio de color, en un clic y en lote.' },
  },
  {
    emoji: '🎨', tool: '/palette-generator',
    en: { name: 'Palette → Variables', pitch: 'Generate accessible tone scales and write them straight into Figma Variables and color styles, with contrast labels on every swatch.' },
    es: { name: 'Palette → Variables', pitch: 'Genera escalas de tonos accesibles y escríbelas directo en Variables y estilos de color de Figma, con etiquetas de contraste en cada muestra.' },
  },
  {
    emoji: '🎢', tool: '/motion-playground',
    en: { name: 'Motion Tokens', pitch: 'Save easing curves and springs as tokens and apply them to every prototype transition in a flow at once.' },
    es: { name: 'Motion Tokens', pitch: 'Guarda curvas y resortes como tokens y aplícalos a todas las transiciones de un prototipo a la vez.' },
  },
];

const FAQ = [
  { en: ['How will it work?', 'Each plugin is free to install from Figma Community with its basic features. A single Lab Pro license unlocks the Pro features in all of them.'], es: ['¿Cómo va a funcionar?', 'Cada plugin se instala gratis desde Figma Community con sus funciones básicas. Una sola licencia Lab Pro desbloquea las funciones Pro en todos.'] },
  { en: ['When does it launch?', 'Token Sync comes first. People on the waitlist get early access and a launch discount.'], es: ['¿Cuándo sale?', 'Token Sync llega primero. Quienes estén en la lista de espera tendrán acceso anticipado y un descuento de lanzamiento.'] },
  { en: ['Will the web tools stay free?', 'Yes. Everything on this site stays free. Pro is for what only a plugin can do inside your Figma file.'], es: ['¿Las herramientas web seguirán siendo gratis?', 'Sí. Todo lo que hay en este sitio sigue siendo gratis. Pro es para lo que solo un plugin puede hacer dentro de tu archivo de Figma.'] },
];

export default function ProPage() {
  const { lang, t, to } = useLang();
  usePageMeta({
    title: t("Lab Pro for Figma — waitlist — Ale's Fun Lab", "Lab Pro para Figma — lista de espera — Ale's Fun Lab"),
    description: t('Figma plugins built on the lab’s tools: token sync with Variables, a one-click contrast fixer, palettes to Variables and motion tokens. Join the waitlist.', 'Plugins de Figma con las herramientas del lab: tokens sincronizados con Variables, contraste corregido en un clic y paletas a Variables. Únete a la lista.'),
    path: to('/pro'),
    image: '/og/home.png',
    alternates: { en: '/pro', es: '/es/pro' },
  });

  return (
    <div className="page">
      <Background />
      <div className="page-inner">
        <SiteNav />
        <header className="tool-header" style={{ textAlign: 'center', justifyItems: 'center' }}>
          <motion.span className="badge badge-neutral" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
            <span className="gradient-dot" style={{ width: 10, height: 10 }} /> {t('Coming soon · Figma plugins', 'Próximamente · Plugins de Figma')}
          </motion.span>
          <h1 className="hub-title" style={{ maxWidth: '12ch', margin: 0 }}>
            <SplitText key={lang} text="Lab" delay={0.1} stagger={0.05} reactive />{' '}
            <SplitText text="Pro" as="em" delay={0.25} stagger={0.06} reactive charClassName="grad-char" />
          </h1>
          <p className="tool-desc" style={{ textAlign: 'center' }}>
            {t('The lab’s tools, working directly inside your Figma files. One license, every plugin.', 'Las herramientas del lab, trabajando directamente dentro de tus archivos de Figma. Una licencia, todos los plugins.')}
          </p>
        </header>

        <Newsletter source="pro" waitlist />

        <section className="card-grid" style={{ marginTop: 'clamp(32px, 5vw, 56px)' }} aria-label={t('Planned plugins', 'Plugins planeados')}>
          {PLUGINS.map((p, i) => (
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

        <Reveal className="card" style={{ marginTop: 'clamp(32px, 5vw, 56px)', maxWidth: 820 }}>
          <h2 className="card-title">{t('FAQ', 'Preguntas frecuentes')}</h2>
          <div className="stack" style={{ gap: 8 }}>
            {FAQ.map(f => (
              <details key={f.en[0]} className="faq">
                <summary>{f[lang][0]}</summary>
                <p className="muted" style={{ margin: '8px 0 0', lineHeight: 1.6 }}>{f[lang][1]}</p>
              </details>
            ))}
          </div>
        </Reveal>
        <SiteFooter />
      </div>
    </div>
  );
}
