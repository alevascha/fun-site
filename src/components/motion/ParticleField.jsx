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
    // Touch devices: particles rise like bubbles and burst away from taps.
    const touch = window.matchMedia('(pointer: coarse)').matches;
    let w = 0, h = 0, dpr = 1, raf = 0, running = false, t = 0;
    let particles = [];
    const mouse = { x: -9999, y: -9999, active: false };

    function seed() {
      const n = Math.min(max, Math.round((w * h) / density));
      particles = Array.from({ length: n }, () => {
        const c = COLORS[Math.floor(Math.random() * COLORS.length)];
        return spawn({ r: 1 + Math.random() * 1.8, c, phase: Math.random() * Math.PI * 2 }, true);
      });
    }

    // The flow field slowly herds particles into a few streams, so after a while
    // they pile up in one spot. Each one lives 10-24 s, fades out and is reborn
    // somewhere random, which keeps the field evenly spread.
    function spawn(p, stagger) {
      p.x = Math.random() * w; p.y = Math.random() * h; p.vx = 0; p.vy = 0;
      p.life = 600 + Math.random() * 840; p.age = stagger ? Math.random() * p.life : 0;
      return p;
    }
    const alive = p => Math.min(1, p.age / 90, (p.life - p.age) / 90);

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(touch ? 1.5 : 2, window.devicePixelRatio || 1); // phones: 1.5x is sharp enough and far cheaper
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (!running) draw();
    }

    function step() {
      t += 0.004;
      for (const p of particles) {
        if (touch) {
          p.vy -= 0.012 + p.r * 0.006;
          p.vx += Math.sin(t * 3 + p.phase) * 0.012;
        }
        // flow field
        const angle = Math.sin(p.x * 0.004 + t) * Math.cos(p.y * 0.004 - t) * Math.PI * 2;
        p.vx += Math.cos(angle) * 0.02;
        p.vy += Math.sin(angle) * 0.02;
        // cursor repulsion
        if (mouse.active && !touch) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 150 * 150 && d2 > 0.01) {
            const d = Math.sqrt(d2), f = (1 - d / 150) * 1.4;
            p.vx += (dx / d) * f; p.vy += (dy / d) * f;
          }
        }
        p.vx *= 0.94; p.vy *= 0.94;
        p.x += p.vx; p.y += p.vy;
        if (++p.age >= p.life) spawn(p, false);
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const link = 110;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i], la = alive(a);
        if (la <= 0) continue;
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < link * link) {
            const alpha = (1 - Math.sqrt(d2) / link) * 0.35 * la * alive(b);
            ctx.strokeStyle = `rgba(${a.c[0]},${a.c[1]},${a.c[2]},${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        if (mouse.active && !touch) {
          const dx = a.x - mouse.x, dy = a.y - mouse.y, d = Math.hypot(dx, dy);
          if (d < 180) {
            ctx.strokeStyle = `rgba(${a.c[0]},${a.c[1]},${a.c[2]},${(1 - d / 180) * 0.6 * la})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }
      }
      for (const p of particles) {
        const pulse = 0.6 + Math.sin(t * 6 + p.phase) * 0.4;
        ctx.fillStyle = `rgba(${p.c[0]},${p.c[1]},${p.c[2]},${(0.55 + pulse * 0.4) * alive(p)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.8 + pulse * 0.4), 0, Math.PI * 2); ctx.fill();
      }
    }

    // 60 fps; if a phone can't keep up (frames > 22 ms on average), draw every
    // other frame and step twice so the motion keeps its speed.
    let odd = false, half = false, last = 0, slow = 0, seen = 0;
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (touch && !half && last) {
        const dt = now - last;
        if (dt < 100) { slow += dt; seen++; }
        if (seen === 60) { half = slow / seen > 22; slow = seen = 0; }
      }
      last = now;
      if (half && (odd = !odd)) return;
      step(); if (half) step(); draw();
    }
    function start() { if (!running && !reduce) { running = true; raf = requestAnimationFrame(loop); } }
    function stop() { running = false; last = 0; cancelAnimationFrame(raf); }

    const onMove = e => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      mouse.active = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= r.width && mouse.y <= r.height;
    };
    // Tap → radial burst (touch only).
    const onTouch = e => {
      const t = e.touches[0];
      if (!t) return;
      const r = canvas.getBoundingClientRect();
      const bx = t.clientX - r.left, by = t.clientY - r.top;
      if (bx < 0 || by < 0 || bx > r.width || by > r.height) return;
      for (const p of particles) {
        const dx = p.x - bx, dy = p.y - by, d = Math.hypot(dx, dy) || 1;
        if (d < 220) { const f = (1 - d / 220) * 14; p.vx += (dx / d) * f; p.vy += (dy / d) * f; }
      }
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
    if (touch) window.addEventListener('touchstart', onTouch, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    resize();
    start();
    return () => {
      stop(); ro.disconnect(); io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchstart', onTouch);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [density, max]);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
