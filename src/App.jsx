import { lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, MotionConfig } from 'framer-motion';
import Cursor from './components/motion/Cursor';
import { EASE } from './lib/motion';
import Home from './pages/Home';

const PaletteGenerator = lazy(() => import('./pages/PaletteGenerator'));
const ContrastChecker = lazy(() => import('./pages/ContrastChecker'));
const ImagePalette = lazy(() => import('./pages/ImagePalette'));
const ColorBlindness = lazy(() => import('./pages/ColorBlindness'));
const TypeScale = lazy(() => import('./pages/TypeScale'));
const GradientGenerator = lazy(() => import('./pages/GradientGenerator'));
const ComponentStates = lazy(() => import('./pages/ComponentStates'));

export default function App() {
  const location = useLocation();
  // The initial history entry has key "default"; every navigation after it
  // gets a fresh key — that's when the curtain plays.
  const isFirst = location.key === 'default';

  return (
    <MotionConfig reducedMotion="user">
      <Cursor />
      {!isFirst && (
        // Gradient curtain that wipes away on every client-side navigation.
        <motion.div
          key={location.key}
          className="page-curtain"
          aria-hidden="true"
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.75, ease: EASE }}
          style={{ transformOrigin: 'top' }}
        />
      )}
      <Suspense fallback={<div className="page" />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/palette-generator" element={<PaletteGenerator />} />
          <Route path="/contrast-checker" element={<ContrastChecker />} />
          <Route path="/image-palette" element={<ImagePalette />} />
          <Route path="/color-blindness" element={<ColorBlindness />} />
          <Route path="/type-scale" element={<TypeScale />} />
          <Route path="/gradient-generator" element={<GradientGenerator />} />
          <Route path="/component-states" element={<ComponentStates />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </Suspense>
    </MotionConfig>
  );
}
