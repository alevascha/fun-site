import { Link, useParams } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import Background from '../components/Background';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SplitText from '../components/motion/SplitText';
import Newsletter from '../components/Newsletter';
import { Reveal } from '../components/ui';
import usePageMeta from '../hooks/usePageMeta';
import { GUIDES, getGuide, getGuideByEsSlug } from '../guides';
import { SECTIONS } from '../guide-sections';
import { useLang } from '../i18n';
import { getExperiment, withSite } from '../experiments';
import NotFound from './NotFound';

// `code` in prose → <code>
function Inline({ text }) {
  return text.split(/(`[^`]+`)/).map((part, i) => (part.startsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part));
}

export function GuideBlock({ block }) {
  if (block.h) return <h2>{block.h}</h2>;
  if (block.p) return <p><Inline text={block.p} /></p>;
  if (block.list) return <ul>{block.list.map(li => <li key={li.slice(0, 40)}><Inline text={li} /></li>)}</ul>;
  if (block.code) return <pre className="code-block" data-lenis-prevent>{block.code}</pre>;
  if (block.tip) return <aside className="guide-tip"><span aria-hidden="true">💡</span> <Inline text={block.tip} /></aside>;
  return null;
}

export default function GuidePage() {
  const { slug } = useParams();
  const { lang, t, to, name } = useLang();
  const guide = lang === 'es' ? getGuideByEsSlug(slug) : getGuide(slug);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  const content = guide?.[lang];
  usePageMeta({
    title: content ? withSite(content.title) : "Ale's Fun Lab",
    description: content?.description || '',
    path: guide ? to(`/guides/${guide.slug}`) : '/',
    image: guide ? `/og/${guide.tool}.png` : '/og/home.png',
    alternates: guide ? { en: `/guides/${guide.slug}`, es: `/es/guias/${guide.es.slug}` } : undefined,
  });

  if (!guide) return <NotFound />;
  const tool = getExperiment(guide.tool);
  const others = GUIDES.filter(g => g.slug !== guide.slug);
  const date = new Date(guide.date + 'T00:00:00').toLocaleDateString(lang === 'es' ? 'es' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page" style={{ '--tool-accent': tool.accent }}>
      <Background />
      <motion.div className="reading-progress" style={{ scaleX: progress }} aria-hidden="true" />
      <div className="page-inner">
        <SiteNav />
        <header className="tool-header guide-header">
          <Link to={to('/guides')} className="back-link"><span className="arrow" aria-hidden="true">←</span> {t('All guides', 'Todas las guías')}</Link>
          <SplitText key={lang + guide.slug} as="h1" className="tool-title guide-title" text={content.title} delay={0.1} stagger={0.012} />
          <p className="tool-desc">{content.description}</p>
          <p className="small muted" style={{ margin: 0 }}>{t('By', 'Por')} Alejandro Vasquez · {date} · {guide.minutes} min</p>
        </header>
        <article className="guide-body">
          {SECTIONS[guide.slug][lang].map((b, i) => <Reveal key={i}><GuideBlock block={b} /></Reveal>)}
          <Reveal className="guide-cta">
            <span className="tool-emoji" aria-hidden="true"><span>{tool.emoji}</span></span>
            <div style={{ flex: 1, minWidth: 200 }}>
              <strong style={{ display: 'block', fontSize: 18 }}>{name(tool)}</strong>
              <span className="small muted">{t('Free, runs in your browser.', 'Gratis, funciona en tu navegador.')}</span>
            </div>
            <Link to={to(tool.path)} className="btn btn-primary">{t('Open the tool', 'Abrir la herramienta')} <span className="arrow" aria-hidden="true">→</span></Link>
          </Reveal>
        </article>
        <Newsletter source={`guide-${guide.slug}`} />
        <Reveal as="section" style={{ marginTop: 'clamp(40px, 6vw, 72px)' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', margin: '0 0 20px' }}>{t('More guides', 'Más guías')}</h2>
          <div className="card-grid">
            {others.map(g => (
              <Link key={g.slug} to={to(`/guides/${g.slug}`)} className="guide-card">
                <span className="guide-card-meta">📖 {g.minutes} min</span>
                <h3 className="exp-card-title" style={{ fontSize: 22 }}>{g[lang].title}</h3>
              </Link>
            ))}
          </div>
        </Reveal>
        <SiteFooter />
      </div>
    </div>
  );
}
