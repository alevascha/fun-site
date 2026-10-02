import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import PaletteGenerator from './pages/PaletteGenerator';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/palette-generator" element={<PaletteGenerator />} />
    </Routes>
  );
}
