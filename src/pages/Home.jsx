import { Link } from 'react-router-dom';
import { experiments } from '../experiments';

export default function Home() {
  return (
    <div className="hub">
      <div className="hub-inner">
        <header className="hub-header">
          <span className="hub-kicker">fun.alevasquez.dev</span>
          <h1 className="hub-title">The Fun Lab</h1>
          <p className="hub-sub">
            A small playground of side experiments — things built for fun, to learn something,
            or just because. Pick a card to try one.
          </p>
        </header>

        <div className="card-grid">
          {experiments.map(exp => {
            const content = (
              <>
                <div className="exp-card-glow" />
                {exp.tag && <span className="exp-card-tag">{exp.tag}</span>}
                <div className="exp-card-emoji">{exp.emoji}</div>
                <div>
                  <div className="exp-card-title">{exp.title}</div>
                  <p className="exp-card-desc">{exp.description}</p>
                </div>
              </>
            );
            const style = { '--card-accent': exp.accent };

            return exp.active ? (
              <Link key={exp.id} to={exp.path} className="exp-card active" style={style}>
                {content}
              </Link>
            ) : (
              <div key={exp.id} className="exp-card placeholder" style={style}>
                {content}
              </div>
            );
          })}
        </div>

        <footer className="hub-footer">
          Built by Alejandro Vasquez · more experiments added over time
        </footer>
      </div>
    </div>
  );
}
