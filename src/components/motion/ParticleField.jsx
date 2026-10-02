import { useEffect, useRef } from 'react';

const COLORS = [[205, 87, 255], [139, 108, 240], [255, 206, 31], [255, 122, 182]];

/* Canvas constellation: particles drift on a slow sine flow field, get pushed
   away by the cursor, and link up with nearby neighbours. DPR-aware, sized by
   ResizeObserver, paused when off-screen or the tab is hidden, and drawn once
   (static) for prefers-reduced-motion. */
export default function ParticleField({ className, density = 9000, max = 150 }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0, h = 0, dpr = 1, raf = 0, running = false, t = 0;
    let particles = [];
    const mouse = { x: -9999, y: -9999, active: false };

    function seed() {
      const n = Math.min(max, Math.round((w * h) / density));
      particles = Array.from({ length: n }, () => {
        const c = COLORS[Math.floor(Math.random() * COLORS.length)];
        return { x: Math.random() * w, y: Math.random() * h, vx: 0, vy: 0, r: 1 + Math.random() * 1.8, c, phase: Math.random() * Math.PI * 2 };
      });
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (!running) draw();
    }

    function step() {
      t += 0.004;
      for (const p of particles) {
        // flow field
        const angle = Math.sin(p.x * 0.004 + t) * Math.cos(p.y * 0.004 - t) * Math.PI * 2;
        p.vx += Math.cos(angle) * 0.02;
        p.vy += Math.sin(angle) * 0.02;
        // cursor repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 150 * 150 && d2 > 0.01) {
            const d = Math.sqrt(d2), f = (1 - d / 150) * 1.4;
            p.vx += (dx / d) * f; p.vy += (dy / d) * f;
          }
        }
        p.vx *= 0.94; p.vy *= 0.94;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const link = 110;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < link * link) {
            const alpha = (1 - Math.sqrt(d2) / link) * 0.35;
            ctx.strokeStyle = `rgba(${a.c[0]},${a.c[1]},${a.c[2]},${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        if (mouse.active) {
          const dx = a.x - mouse.x, dy = a.y - mouse.y, d = Math.hypot(dx, dy);
          if (d < 180) {
            ctx.strokeStyle = `rgba(${a.c[0]},${a.c[1]},${a.c[2]},${(1 - d / 180) * 0.6})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }
      }
      for (const p of particles) {
        const pulse = 0.6 + Math.sin(t * 6 + p.phase) * 0.4;
        ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${0.55 + pulse * 0.4})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.8 + pulse * 0.4), 0, Math.PI * 2); ctx.fill();
      }
    }

    function loop() {
      step(); draw();
      raf = requestAnimationFrame(loop);
    }
    function start() { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } }
    function stop() { running = false; cancelAnimationFrame(raf); }

    const onMove = e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      mouse.active = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= r.width && mouse.y <= r.height;
    };
    const onVis = () => (document.hidden ? stop() : visible && start());
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start(); else stop();
    });
    const ro = new ResizeObserver(resize);

    ro.observe(canvas);
    io.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    resize();
    start();
    return () => {
      stop(); ro.disconnect(); io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [density, max]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
