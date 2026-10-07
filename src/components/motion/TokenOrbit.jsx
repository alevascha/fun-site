import { useEffect, useRef } from 'react';

const COLORS = [[205, 87, 255], [139, 108, 240], [255, 206, 31], [255, 122, 182]];

/* The portfolio hero's 3D piece (framer/framer-fx.js → orbit): a shell of
   design tokens that flies in from a loose cloud, clicks into a sphere, leans
   toward the pointer, bulges away from it and unfolds into a flat grid as it
   scrolls away. Canvas 2D with a perspective projection; a soft glow stands
   in for the portfolio's gradient ball.
   Paused off-screen, drawn once (static) for prefers-reduced-motion. */
export default function TokenOrbit({ className }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(pointer: fine)').matches;
    const N = fine ? 300 : 180, FOCAL = 900;
    const pts = Array.from({ length: N }, (_, i) => {
      const y = 1 - (i + 0.5) / N * 2, rr = Math.sqrt(1 - y * y), th = i * 2.39996;
      const s = Math.random() * 6.28, c = Math.acos(Math.random() * 2 - 1);
      return {
        sx: Math.cos(th) * rr, sy: y, sz: Math.sin(th) * rr,
        cx: Math.sin(c) * Math.cos(s) * 2.6, cy: Math.cos(c) * 2.6, cz: Math.sin(c) * Math.sin(s) * 2.6,
        col: COLORS[i % 7 === 0 ? 2 : i % 5 === 0 ? 3 : i % 3 === 0 ? 1 : 0],
        chip: i % 11 === 0, d: Math.random() * 500, bx: 0, by: 0,
      };
    });
    const cols = Math.ceil(Math.sqrt(N));
    pts.forEach((p, i) => { p.gx = ((i % cols) / (cols - 1) - 0.5) * 2.6; p.gz = (Math.floor(i / cols) / (cols - 1) - 0.5) * 2.6; });
    const NEAR = [8, 13, 21, 34], LINK = 1.7 * Math.sqrt(4 * Math.PI / N);
    const ptr = { x: innerWidth / 2, y: innerHeight / 2 };
    const proj = [];
    let size = 0, R = 0, raf = 0, running = false, visible = true;
    let rotY = 0, tiltX = 0.25, tiltY = 0, morph = 0;
    const born = performance.now();
    const ease = x => 1 - Math.pow(1 - x, 3);

    function resize() {
      const r = canvas.getBoundingClientRect(), dpr = Math.min(fine ? 2 : 1.5, devicePixelRatio || 1);
      size = r.width; R = size * 0.34;
      canvas.width = Math.round(size * dpr); canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    }

    function draw(now) {
      const h = size / 2, r = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, size, size);
      const glow = ctx.createRadialGradient(h, h, 0, h, h, R * 1.1);
      glow.addColorStop(0, 'rgba(205,87,255,.22)');
      glow.addColorStop(0.6, 'rgba(255,122,182,.08)');
      glow.addColorStop(1, 'rgba(205,87,255,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, size, size);

      const nx = Math.max(-1, Math.min(1, (ptr.x - r.left - h) / innerWidth * 2));
      const ny = Math.max(-1, Math.min(1, (ptr.y - r.top - h) / innerHeight * 2));
      tiltY += (nx * 0.5 - tiltY) * 0.05;
      tiltX += (0.25 + ny * 0.35 - tiltX) * 0.05;
      // Unfold over the first half screen of scrolling (it sits in the page header).
      const want = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.5)));
      morph += (want - morph) * 0.08;
      const m = ease(morph);
      rotY += reduce ? 0 : 0.0028 * (1 - m * 0.7);
      const ay = rotY + tiltY, ax = tiltX + m * 0.55;
      const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
      const lx = ptr.x - r.left, ly = ptr.y - r.top, t = now - born;
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        const k = reduce ? 1 : ease(Math.min(1, Math.max(0, (t - p.d) / 1600)));
        let x = p.cx + (p.sx - p.cx) * k, y = p.cy + (p.sy - p.cy) * k, z = p.cz + (p.sz - p.cz) * k;
        x += (p.gx - x) * m; y -= y * m; z += (p.gz - z) * m;
        x *= R; y *= R; z *= R;
        const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
        const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
        const s = FOCAL / (FOCAL + z2);
        let px = h + x1 * s, py = h + y2 * s;
        if (fine && !reduce) {
          const dx = px - lx, dy = py - ly, d = Math.hypot(dx, dy);
          const push = d < 90 && d > 0.1 ? (1 - d / 90) * 22 : 0;
          p.bx += ((push ? dx / d * push : 0) - p.bx) * 0.15;
          p.by += ((push ? dy / d * push : 0) - p.by) * 0.15;
          px += p.bx; py += p.by;
        }
        const depth = Math.max(0, Math.min(1, 0.5 - z2 / (2 * R)));
        proj[i] = { x: px, y: py, s, a: (0.18 + depth * 0.82) * Math.min(1, k * 1.5), x3: x, y3: y, z3: z };
      }
      ctx.lineWidth = 0.7;
      const lim = LINK * R * (1 + m * 0.4);
      for (let i = 0; i < N; i++) {
        const a = proj[i];
        for (const o of NEAR) {
          const b = proj[i + o];
          if (!b) continue;
          const d = Math.hypot(a.x3 - b.x3, a.y3 - b.y3, a.z3 - b.z3);
          if (d > lim) continue;
          ctx.strokeStyle = `rgba(${pts[i].col},${(1 - d / lim) * 0.28 * Math.min(a.a, b.a)})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      for (let i = 0; i < N; i++) {
        const p = pts[i], q = proj[i], z = q.s;
        ctx.fillStyle = `rgba(${p.col},${q.a})`;
        ctx.beginPath();
        if (p.chip) {
          const w = 9 * z, hh = 5.5 * z;
          if (ctx.roundRect) ctx.roundRect(q.x - w / 2, q.y - hh / 2, w, hh, 2.5 * z); else ctx.rect(q.x - w / 2, q.y - hh / 2, w, hh);
        } else ctx.arc(q.x, q.y, 1.6 * z, 0, 6.283);
        ctx.fill();
      }
    }

    const loop = now => { raf = requestAnimationFrame(loop); draw(now); };
    const start = () => { if (!running && !reduce && visible && !document.hidden) { running = true; raf = requestAnimationFrame(loop); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    const onMove = e => { ptr.x = e.clientX; ptr.y = e.clientY; };
    const onVis = () => (document.hidden ? stop() : start());
    const onScroll = () => requestAnimationFrame(draw);
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); });
    io.observe(canvas);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('visibilitychange', onVis);
    if (reduce) window.addEventListener('scroll', onScroll, { passive: true });
    resize(); start();
    return () => {
      stop(); ro.disconnect(); io.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
