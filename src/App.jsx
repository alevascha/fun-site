import { lazy, Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import Cursor from './components/motion/Cursor';
import { EASE } from './lib/motion';
import { scrollToTop, startSmoothScroll } from './lib/smoothScroll';
import Home from './pages/Home';
import CommandPalette from './components/CommandPalette';
import { BootDone, RouteLoader } from './components/RouteLoader';
import { experiments } from './experiments';
import { ES, PAGE_PATHS } from './seo-es';
import LangProvider from './components/LangProvider';
import ErrorBoundary from './components/ErrorBoundary';

const PaletteGenerator = lazy(() => import('./pages/PaletteGenerator'));
const ContrastChecker = lazy(() => import('./pages/ContrastChecker'));
const ImagePalette = lazy(() => import('./pages/ImagePalette'));
const ColorBlindness = lazy(() => import('./pages/ColorBlindness'));
const TypeScale = lazy(() => import('./pages/TypeScale'));
const GradientGenerator = lazy(() => import('./pages/GradientGenerator'));
const ComponentStates = lazy(() => import('./pages/ComponentStates'));
const TokenConverter = lazy(() => import('./pages/TokenConverter'));
const MotionPlayground = lazy(() => import('./pages/MotionPlayground'));
const AutoTrim = lazy(() => import('./pages/AutoTrim'));
const TextExpansion = lazy(() => import('./pages/TextExpansion'));
const A11yAudit = lazy(() => import('./pages/A11yAudit'));
const MultiSize = lazy(() => import('./pages/MultiSize'));
const MobilePreview = lazy(() => import('./pages/MobilePreview'));
const HueHunt = lazy(() => import('./pages/HueHunt'));
const PassOrFail = lazy(() => import('./pages/PassOrFail'));
const NotFound = lazy(() => import('./pages/NotFound'));
const StaticPage = lazy(() => import('./pages/StaticPage'));
const ProPage = lazy(() => import('./pages/ProPage'));
const GuidesIndex = lazy(() => import('./pages/GuidesIndex'));
const GuidePage = lazy(() => import('./pages/GuidePage'));
const Changelog = lazy(() => import('./pages/Changelog'));
const Subscription = lazy(() => import('./pages/Subscription'));

const TOOLS = {
  'palette-generator': PaletteGenerator,
  'contrast-checker': ContrastChecker,
  'image-palette': ImagePalette,
  'color-blindness': ColorBlindness,
  'type-scale': TypeScale,
  'gradient-generator': GradientGenerator,
  'component-states': ComponentStates,
  'token-converter': TokenConverter,
  'motion-playground': MotionPlayground,
  'auto-trim': AutoTrim,
  'text-expansion': TextExpansion,
  'a11y-audit': A11yAudit,
  'multi-size': MultiSize,
  'mobile-preview': MobilePreview,
  'hue-hunt': HueHunt,
  'pass-or-fail': PassOrFail,
};

export default function App() {
  const location = useLocation();
  // Play the curtain only when the *page* changes. Query-string updates
  // (tools that sync their state to the URL) must not trigger it.
  useEffect(() => { startSmoothScroll(); }, []);
  useEffect(() => { scrollToTop(); }, [location.pathname]);

  const [prevPath, setPrevPath] = useState(location.pathname);
  const [navCount, setNavCount] = useState(0);
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname);
    setNavCount(n => n + 1);
  }

  const lang = location.pathname === '/es' || location.pathname.startsWith('/es/') ? 'es' : 'en';

  return (
    <LangProvider lang={lang}>
    <MotionConfig reducedMotion="user">
      <Cursor />
      <CommandPalette />
      {navCount > 0 && (
        // Gradient curtain that wipes away on every client-side navigation.
        <motion.div
          key={navCount}
          className="page-curtain"
          aria-hidden="true"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.75, ease: EASE }}
          style={{ transformOrigin: 'top' }}
        />
      )}
      <ErrorBoundary key={location.pathname} lang={lang}>
      <Suspense fallback={<RouteLoader />}>
        <BootDone />
        <Routes location={location} key={location.pathname}>
          {['en', 'es'].map(l => {
            const p = path => (l === 'es' ? PAGE_PATHS[path] : path);
            return [
              <Route key={`${l}-home`} path={p('/')} element={<Home />} />,
              ...experiments.filter(e => e.active).map(e => {
                const Tool = TOOLS[e.id];
                const path = l === 'es' ? `/es/${ES[e.id].slug}` : e.path;
                return <Route key={`${l}-${e.id}`} path={path} element={<Tool />} />;
              }),
              <Route key={`${l}-about`} path={p('/about')} element={<StaticPage id="about" />} />,
              <Route key={`${l}-privacy`} path={p('/privacy')} element={<StaticPage id="privacy" />} />,
              <Route key={`${l}-pro`} path={p('/pro')} element={<ProPage />} />,
              <Route key={`${l}-guides`} path={p('/guides')} element={<GuidesIndex />} />,
              <Route key={`${l}-guide`} path={`${p('/guides')}/:slug`} element={<GuidePage />} />,
              <Route key={`${l}-changelog`} path={p('/changelog')} element={<Changelog />} />,
              <Route key={`${l}-confirm`} path={p('/confirm')} element={<Subscription action="confirm" />} />,
              <Route key={`${l}-unsubscribe`} path={p('/unsubscribe')} element={<Subscription action="unsubscribe" />} />,
            ];
          })}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      </ErrorBoundary>
    </MotionConfig>
    </LangProvider>
  );
}
