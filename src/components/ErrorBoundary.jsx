import { Component } from 'react';
import { track } from '../lib/analytics';

const STALE = /dynamically imported module|Importing a module script failed|Failed to fetch|ChunkLoadError/i;

/* Catches render errors anywhere in the app and shows a friendly page
   instead of a blank screen. After a deploy, an old tab can ask for code
   files that no longer exist; that case reloads once, automatically. */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    try {
      if (STALE.test(String(error?.message)) && !sessionStorage.getItem('flab-reloaded')) {
        sessionStorage.setItem('flab-reloaded', '1');
        window.location.reload();
        return;
      }
    } catch { /* storage blocked */ }
    track('Error page', { message: String(error?.message || error).slice(0, 120) });
  }

  render() {
    if (!this.state.error) return this.props.children;
    const es = this.props.lang === 'es';
    return (
      <div className="page">
        <div className="page-inner">
          <main className="nf-stage" role="alert">
            <div className="nf-code" aria-hidden="true"><span className="grad-char" style={{ '--i': 0, '--n': 1 }}>⚡</span></div>
            <h1 className="nf-title">{es ? 'Algo se rompió' : 'Something broke'}</h1>
            <p className="nf-text">
              {es
                ? 'Un experimento falló en tu navegador. Recargar suele arreglarlo; si no, vuelve al inicio.'
                : 'An experiment failed in your browser. Reloading usually fixes it; if not, head back home.'}
            </p>
            <div className="sub-actions">
              <button type="button" className="btn btn-primary" onClick={() => window.location.reload()}>{es ? 'Recargar' : 'Reload'}</button>
              <a className="btn btn-ghost" href={es ? '/es' : '/'}>{es ? 'Ir al inicio' : 'Go home'}</a>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
