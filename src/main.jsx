import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { measureFps, watchOffscreen } from './lib/perf'

const mount = () => { renderApp(); watchOffscreen(); measureFps(); };
const renderApp = () => createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)

// Let the prerendered page paint its first frame before React takes over, so
// the first and largest contentful paints come from the HTML (under the boot
// loader) and never wait on the app's JavaScript. rAF runs just before that
// paint; the timeout then fires right after it. Costs one frame (~16ms).
if (document.querySelector('.ssr-shell')) requestAnimationFrame(() => setTimeout(mount, 0));
else mount();
