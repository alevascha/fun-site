/* Ale's motion layer for alevasquez.dev (Framer).
   Self-contained: `npm run framer-snippet` bundles this file with Lenis into
   framer/custom-code.html, which is pasted into Framer → Site Settings →
   Custom Code (end of <body>). Nothing is loaded from other domains.

   Same interaction language as fun.alevasquez.dev, as plain DOM so it can sit
   on top of Framer's React tree without touching it:
   - background: drifting orbs + a dot grid that lights up around the pointer
   - hero: particle constellation that dodges the cursor (bubbles on touch)
   - cursor: spring ring + dot that morphs over links ("View" on projects)
   - h1: letters rise in, react to the cursor, brand gradient on the last line;
     on touch they ride a wave while scrolling
   - h2: words rise in when they enter the viewport
   - cards: spotlight glow + 3D tilt; project images zoom on hover
   - buttons/icons: magnetic pull
   - images: scroll parallax; top scroll-progress bar; Lenis smooth scroll
   - touch: ripples where you tap, ambient wandering light
   - hero 3D: design tokens orbiting the gradient ball, unfolding on scroll
   - page transitions: a curtain slides over the page while Framer navigates
   - case studies: big images open up from a rounded window as they scroll in
   - intro loader (first visit per session): tokens assemble, unfold, warp
   - about: portrait tilts with a gradient rim; paragraphs and cards rise in
   - nav: no blue tap flash on phones; the current page's link takes the
     "Label Accent" color style (hover lives in Framer's Menu Item component)
   Uses the individual `translate` / `scale` / `rotate` CSS properties so it
   composes with Framer's own transform animations instead of fighting them.
   Everything is off for prefers-reduced-motion. */
(() => {
  if (window.__avfx) return;
  window.__avfx = true;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(pointer: fine)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const EASE = 'cubic-bezier(.16,1,.3,1)';
  const COLORS = [[205, 87, 255], [139, 108, 240], [255, 206, 31], [255, 122, 182]];
  const ptr = { x: innerWidth / 2, y: innerHeight / 3, active: false, lastTouch: 0 };

  /* ---------------------------------------------------------------- CSS */
  const css = `
  :root{--avfx-dot:rgba(255,255,255,.07);--avfx-dot-lit:rgba(226,170,255,.75);--avfx-spot:rgba(205,87,255,.16);--avfx-orb1:rgba(205,87,255,.20);--avfx-orb2:rgba(255,206,31,.10);--avfx-orb3:rgba(139,108,240,.16);--avfx-glow:rgba(205,87,255,.16);--avfx-ink:#f7f7f7}
  html[data-avfx-theme=light]{--avfx-dot:rgba(17,16,17,.08);--avfx-dot-lit:rgba(150,40,210,.55);--avfx-spot:rgba(205,87,255,.10);--avfx-orb1:rgba(205,87,255,.16);--avfx-orb2:rgba(255,206,31,.16);--avfx-orb3:rgba(139,108,240,.12);--avfx-glow:rgba(205,87,255,.10);--avfx-ink:#111011}
  .avfx-bg{position:fixed;inset:0;z-index:0;pointer-events:none;overflow:hidden;--cx:50vw;--cy:30vh;--px:0;--py:0}
  .avfx-orbs{position:absolute;inset:-10%;transition:translate 1.2s ${EASE}}
  .avfx-orb{position:absolute;border-radius:50%;will-change:transform;transition:translate 1.4s ${EASE}}
  .avfx-orb:nth-child(1){width:44vw;height:44vw;left:-8vw;top:-6vw;background:radial-gradient(closest-side,var(--avfx-orb1),transparent);translate:calc(var(--px)*-70px) calc(var(--py)*-60px);animation:avfx-drift 22s ease-in-out infinite alternate}
  .avfx-orb:nth-child(2){width:34vw;height:34vw;right:-6vw;top:30vh;background:radial-gradient(closest-side,var(--avfx-orb2),transparent);translate:calc(var(--px)*80px) calc(var(--py)*50px);animation:avfx-drift 27s ease-in-out infinite alternate-reverse}
  .avfx-orb:nth-child(3){width:50vw;height:36vw;left:22vw;bottom:-14vw;background:radial-gradient(closest-side,var(--avfx-orb3),transparent);translate:calc(var(--px)*-40px) calc(var(--py)*70px);animation:avfx-drift 31s ease-in-out infinite alternate}
  @keyframes avfx-drift{0%{transform:translate3d(0,0,0) scale(1)}50%{transform:translate3d(-4%,5%,0) scale(1.08)}100%{transform:translate3d(5%,-3%,0) scale(1.02)}}
  .avfx-grid{position:absolute;inset:0;background-image:radial-gradient(circle at 1px 1px,var(--avfx-dot) 1px,transparent 0);background-size:28px 28px;-webkit-mask-image:radial-gradient(120% 90% at 50% 0%,#000 30%,transparent 85%);mask-image:radial-gradient(120% 90% at 50% 0%,#000 30%,transparent 85%)}
  .avfx-grid-lit{background-image:radial-gradient(circle at 1px 1px,var(--avfx-dot-lit) 1.4px,transparent 0);-webkit-mask-image:radial-gradient(230px circle at var(--cx) var(--cy),#000,transparent);mask-image:radial-gradient(230px circle at var(--cx) var(--cy),#000,transparent);opacity:0;transition:opacity .4s}
  .avfx-spot{position:fixed;inset:0;z-index:2147483000;pointer-events:none;background:radial-gradient(560px circle at var(--cx) var(--cy),var(--avfx-spot),transparent 70%);opacity:0;transition:opacity .5s;mix-blend-mode:screen}
  html[data-avfx-theme=light] .avfx-spot{mix-blend-mode:multiply;background:radial-gradient(560px circle at var(--cx) var(--cy),rgba(245,225,255,.9),transparent 70%)}
  .avfx-bg[data-active=true] .avfx-grid-lit,.avfx-spot[data-active=true]{opacity:1}
  .avfx-progress{position:fixed;top:0;left:0;right:0;height:3px;z-index:2147483001;pointer-events:none;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#CD57FF,#ff7ab6 50%,#FFCE1F)}
  .avfx-canvas{position:absolute;inset:0;width:100%;height:100%;z-index:-1;pointer-events:none;border-radius:inherit;-webkit-mask-image:radial-gradient(120% 90% at 50% 40%,#000 30%,transparent 85%);mask-image:radial-gradient(120% 90% at 50% 40%,#000 30%,transparent 85%)}
  .avfx-canvas.avfx-touch{height:min(100%,115svh);-webkit-mask-image:none;mask-image:none}
  .avfx-touchglow{position:fixed;left:0;top:0;width:560px;height:560px;margin:-280px 0 0 -280px;z-index:2147483000;pointer-events:none;border-radius:50%;background:radial-gradient(closest-side,var(--avfx-spot),transparent);will-change:transform;opacity:0;transition:opacity .8s}
  .avfx-touchglow[data-on=true]{opacity:1}
  .avfx-ring,.avfx-dot{position:fixed;top:0;left:0;z-index:2147483002;pointer-events:none;border-radius:999px;translate:-50% -50%;opacity:0;transition:opacity .25s}
  .avfx-ring{width:34px;height:34px;display:grid;place-items:center;border:1.5px solid rgba(205,87,255,.7);background:rgba(205,87,255,.06);font:600 13px/1 "Hanken Grotesk","Inter",system-ui,sans-serif;color:#111011;transition:width .35s ${EASE},height .35s ${EASE},background-color .25s,border-color .25s,border-radius .25s,opacity .25s}
  .avfx-ring span{opacity:0;scale:.6;transition:opacity .2s,scale .3s ${EASE}}
  .avfx-ring[data-mode=hover]{width:54px;height:54px;background:rgba(205,87,255,.14);border-color:rgba(205,87,255,.95)}
  .avfx-ring[data-mode=label]{width:86px;height:86px;border-color:transparent;background:linear-gradient(135deg,#CD57FF,#FFCE1F);box-shadow:0 10px 30px -8px rgba(205,87,255,.6)}
  .avfx-ring[data-mode=label] span{opacity:1;scale:1}
  .avfx-ring[data-mode=text]{width:4px;height:28px;border-radius:3px;background:#CD57FF;border-color:transparent}
  .avfx-dot{width:6px;height:6px;background:var(--avfx-ink)}
  .avfx-ring[data-mode=label]+.avfx-dot{opacity:0!important}
  .avfx-ch{display:inline-block;transition:transform .35s ${EASE};will-change:transform}
  .avfx-ch>i{display:inline-block;font-style:inherit;translate:0 110%;rotate:8deg;transition:translate .9s ${EASE},rotate .9s ${EASE};transition-delay:calc(var(--d,0)*1ms)}
  .avfx-mask{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.14em;margin-bottom:-.14em}
  .avfx-in .avfx-ch>i,.avfx-in .avfx-w>i{translate:0 0;rotate:0deg}
  .avfx-w{display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:.14em;margin-bottom:-.14em}
  .avfx-w>i{display:inline-block;font-style:inherit;translate:0 105%;rotate:4deg;transition:translate .8s ${EASE},rotate .8s ${EASE};transition-delay:calc(var(--d,0)*1ms)}
  .avfx-fill{background-size:calc(var(--n,1)*100%) 100%;background-position:calc(var(--i,0)/max(var(--n,1) - 1,1)*100%) 50%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent}
  .avfx-grad{background-image:linear-gradient(90deg,#CD57FF,#ff7ab6 55%,#FFCE1F);background-size:calc(var(--n,1)*100%) 100%;background-position:calc(var(--i,0)/max(var(--n,1) - 1,1)*100%) 50%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;padding-right:.04em}
  [data-avfx-card]{transition:rotate .5s ${EASE},scale .5s ${EASE},box-shadow .4s}
  [data-avfx-card]:hover{scale:1.012;box-shadow:0 30px 60px -30px rgba(205,87,255,.35),0 0 0 1px rgba(205,87,255,.25)}
  [data-avfx-card] img{transition:scale .9s ${EASE}}
  [data-avfx-card]:hover img{scale:1.05}
  [data-avfx-mag]{transition:translate .5s ${EASE},scale .3s ${EASE}}
  [data-avfx-mag]:active{scale:.96}
  [data-avfx-icon]:hover{scale:1.08}
  [data-avfx-banner]{isolation:isolate}
  [data-avfx-banner]::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;pointer-events:none;opacity:0;transition:opacity .6s ${EASE};background:linear-gradient(rgb(133,54,40),rgb(250,92,64))}
  [data-avfx-banner][data-framer-name$="Hover"]::before{opacity:1}
  [data-avfx-banner][data-framer-name$="Hover"]{background-image:linear-gradient(rgb(51,54,56),rgb(51,54,56))!important}
  :root[data-theme=light] [data-avfx-banner]::after{content:"";position:absolute;inset:0;z-index:3;border-radius:inherit;padding:2px;pointer-events:none;background:conic-gradient(from var(--avfx-a,0deg),#CD57FF,#ff7ab6,#FFCE1F,#8b6cf0,#CD57FF);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:avfx-spin 6s linear infinite}
  :root[data-theme=light] [data-avfx-banner]{box-shadow:0 30px 70px -34px rgba(205,87,255,.55)}
  @media (prefers-color-scheme: light){:root:not([data-theme]) [data-avfx-banner]::after{content:"";position:absolute;inset:0;z-index:3;border-radius:inherit;padding:2px;pointer-events:none;background:conic-gradient(from var(--avfx-a,0deg),#CD57FF,#ff7ab6,#FFCE1F,#8b6cf0,#CD57FF);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:avfx-spin 6s linear infinite}:root:not([data-theme]) [data-avfx-banner]{box-shadow:0 30px 70px -34px rgba(205,87,255,.55)}}
  .avfx-ripple{position:fixed;z-index:2147483002;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;pointer-events:none;border:2px solid rgba(205,87,255,.8);background:radial-gradient(circle,rgba(255,206,31,.35),transparent 70%);animation:avfx-ripple .7s ${EASE} forwards}
  @keyframes avfx-ripple{to{transform:scale(7);opacity:0}}
  .avfx-ld{position:fixed;inset:0;z-index:2147483647;background:#111011;color:#f7f7f7;overflow:hidden;cursor:pointer;transition:translate .85s cubic-bezier(.76,0,.24,1);font:500 12px/1.4 Inter,system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}
  .avfx-ld::after{content:"";position:absolute;left:0;right:0;bottom:0;height:4px;background:linear-gradient(90deg,#CD57FF,#ff7ab6 50%,#FFCE1F);box-shadow:0 0 30px 6px rgba(205,87,255,.5);opacity:0;transition:opacity .3s}
  .avfx-ld.out{translate:0 -100%}.avfx-ld.out::after{opacity:1}
  .avfx-ld canvas{position:absolute;inset:0;width:100%;height:100%}
  .avfx-ld-top,.avfx-ld-bottom{position:absolute;left:clamp(16px,4vw,48px);right:clamp(16px,4vw,48px);display:flex;justify-content:space-between;gap:16px;transition:opacity .4s,translate .6s cubic-bezier(.16,1,.3,1)}
  .avfx-ld-top{top:clamp(16px,4vw,40px);color:rgba(247,247,247,.6);animation:avfx-ld-in .9s cubic-bezier(.16,1,.3,1) both}
  .avfx-ld-top span:last-child{text-align:right;max-width:46%}
  .avfx-ld-bottom{bottom:clamp(20px,4vw,44px);align-items:flex-end}
  .avfx-ld-count{font:400 clamp(72px,16vw,220px)/.8 "Crimson Pro",Georgia,serif;letter-spacing:-.02em;font-variant-numeric:tabular-nums;background:linear-gradient(90deg,#CD57FF,#ff7ab6 55%,#FFCE1F);-webkit-background-clip:text;background-clip:text;color:transparent;animation:avfx-ld-in 1s .1s cubic-bezier(.16,1,.3,1) both}
  .avfx-ld-word{font:italic 400 clamp(28px,5vw,64px)/1 "Crimson Pro",Georgia,serif;letter-spacing:0;text-transform:none;overflow:hidden;padding-bottom:.12em}
  .avfx-ld-word i{display:inline-block;font-style:inherit;translate:0 110%;rotate:8deg;transition:translate .6s cubic-bezier(.16,1,.3,1),rotate .6s cubic-bezier(.16,1,.3,1)}
  .avfx-ld-word.in i{translate:0 0;rotate:0deg}
  .avfx-ld-bar{position:absolute;left:0;right:0;bottom:0;height:2px;transform-origin:0 50%;transform:scaleX(0);background:linear-gradient(90deg,#CD57FF,#ff7ab6 50%,#FFCE1F)}
  .avfx-ld-skip{position:absolute;left:50%;bottom:clamp(20px,4vw,44px);translate:-50% 0;color:rgba(247,247,247,.35);font-size:11px;animation:avfx-ld-in 1s 1.2s both}
  .avfx-ld.warp .avfx-ld-top{opacity:0;translate:0 -20px}.avfx-ld.warp .avfx-ld-bottom,.avfx-ld.warp .avfx-ld-skip{opacity:0;translate:0 20px}
  .avfx-ld.warp .avfx-ld-skip{translate:-50% 20px}
  @keyframes avfx-ld-in{from{opacity:0;translate:0 24px}}
  @media (max-width:600px){.avfx-ld-top{flex-direction:column}.avfx-ld-top span:last-child{text-align:left;max-width:none}.avfx-ld-bottom{flex-direction:column;align-items:flex-start}.avfx-ld-skip{display:none}}
  a,button,[role=button],label{-webkit-tap-highlight-color:transparent}
  [data-framer-page-link-current] .framer-text{color:var(--token-e8ac0a56-c502-4d9c-81c6-1cd7891a654f,#CD57FF)!important}
  .avfx-orbit{position:absolute;z-index:1;pointer-events:none}
  [data-avfx-rise]{opacity:0;translate:0 28px;filter:blur(6px);transition:opacity .9s ${EASE},translate .9s ${EASE},filter .9s ${EASE},rotate .5s ${EASE},scale .5s ${EASE},box-shadow .4s;transition-delay:calc(var(--d,0)*1ms)}
  [data-avfx-rise=in]{opacity:1;translate:0 0;filter:none}
  [data-avfx-rise][data-avfx-card]:hover{transition-delay:0ms}
  [data-avfx-eyebrow]{background:linear-gradient(90deg,#CD57FF,#ff7ab6 55%,#FFCE1F);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
  [data-avfx-eyebrow] *{-webkit-text-fill-color:transparent!important;color:transparent!important}
  [data-avfx-num]{position:relative}
  [data-avfx-num]::before{content:attr(data-avfx-num);display:block;margin-bottom:10px;font:600 12px/1 Inter,system-ui,sans-serif;letter-spacing:.16em;background:linear-gradient(90deg,#CD57FF,#ff7ab6 55%,#FFCE1F);-webkit-background-clip:text;background-clip:text;color:transparent}
  .avfx-gradw{background-image:linear-gradient(90deg,#CD57FF,#ff7ab6 55%,#FFCE1F);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;padding-right:.05em}
  [data-avfx-step]{position:relative;padding-left:30px!important}
  [data-avfx-step]::before{content:"";position:absolute;left:4px;top:.45em;width:11px;height:11px;border-radius:50%;background:linear-gradient(135deg,#CD57FF,#FFCE1F);box-shadow:0 0 0 4px rgba(205,87,255,.15),0 0 18px rgba(205,87,255,.6);scale:0;transition:scale .6s ${EASE} .25s}
  [data-avfx-step]::after{content:"";position:absolute;left:9px;top:calc(.45em + 14px);bottom:-22px;width:1.5px;background:linear-gradient(#CD57FF,rgba(255,122,182,.15));transform-origin:top;scale:1 0;transition:scale 1s ${EASE} .4s}
  [data-avfx-step]:last-child::after{display:none}
  [data-avfx-step]:has([data-avfx-rise=in])::before,[data-avfx-step][data-avfx-rise=in]::before{scale:1}
  [data-avfx-step]:has([data-avfx-rise=in])::after,[data-avfx-step][data-avfx-rise=in]::after{scale:1 1}
  [data-avfx-tint]{border-color:var(--tint-a)!important}
  [data-avfx-tint]::after{content:"";position:absolute;left:24px;right:24px;top:0;height:2px;border-radius:2px;background:linear-gradient(90deg,transparent,var(--tint),transparent);opacity:.8;pointer-events:none}
  [data-avfx-tint] svg{color:var(--tint)!important;filter:drop-shadow(0 0 10px var(--tint));transition:scale .5s ${EASE},rotate .5s ${EASE}}
  [data-avfx-tint] svg *{fill:var(--tint)!important}
  [data-avfx-tint]:hover svg{scale:1.18;rotate:-8deg}
  [data-avfx-tint] h3,[data-avfx-tint] h4{transition:color .3s}
  [data-avfx-tint]:hover h3,[data-avfx-tint]:hover h4{color:var(--tint)!important}
  .avfx-name{font-weight:600;background:linear-gradient(90deg,#CD57FF,#ff7ab6 55%,#FFCE1F);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
  [data-avfx-chips]{display:flex!important;flex-wrap:wrap;gap:8px}
  .avfx-chip{display:inline-block;padding:6px 12px;border-radius:999px;font-size:13px;line-height:1.3;color:var(--avfx-ink);background:color-mix(in srgb,var(--tint) 14%,transparent);border:1px solid color-mix(in srgb,var(--tint) 40%,transparent);opacity:0;translate:0 10px;scale:.9;transition:opacity .5s ${EASE},translate .5s ${EASE},scale .5s ${EASE},background-color .3s;transition-delay:calc(var(--d,0)*1ms + 200ms)}
  [data-avfx-chips][data-avfx-rise=in] .avfx-chip{opacity:1;translate:0 0;scale:1}
  .avfx-chip:hover{background:color-mix(in srgb,var(--tint) 30%,transparent);transition-delay:0ms}
  [data-avfx-ring]{position:relative;isolation:isolate;background-image:radial-gradient(120% 140% at 0% 0%,rgba(205,87,255,.16),transparent 55%),radial-gradient(120% 140% at 100% 100%,rgba(255,206,31,.10),transparent 55%)}
  [data-avfx-ring]::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;padding:1.5px;background:conic-gradient(from var(--avfx-a,0deg),#CD57FF,#ff7ab6,#FFCE1F,#8b6cf0,#CD57FF);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;animation:avfx-spin 6s linear infinite}
  [data-avfx-ring]::after{content:"";position:absolute;inset:0;z-index:-2;border-radius:inherit;box-shadow:0 30px 80px -30px rgba(205,87,255,.55);pointer-events:none}
  @property --avfx-a{syntax:"<angle>";inherits:false;initial-value:0deg}
  @keyframes avfx-spin{to{--avfx-a:360deg}}
  [data-avfx-photo]{transition:rotate .6s ${EASE};will-change:rotate}
  [data-avfx-photo]::after{content:"";position:absolute;inset:-2px;border-radius:inherit;pointer-events:none;padding:2px;background:radial-gradient(400px circle at var(--gx,50%) var(--gy,30%),#CD57FF,#ff7ab6 40%,#FFCE1F 70%,transparent 85%);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.85}
  @media (prefers-reduced-motion:reduce){[data-avfx-rise]{opacity:1;translate:0 0;filter:none}.avfx-chip{opacity:1;translate:0 0;scale:1}[data-avfx-ring]::before{animation:none}[data-avfx-step]::before,[data-avfx-step]::after{scale:1}}
  .avfx-curtain{position:fixed;inset:0;z-index:2147483003;pointer-events:none;translate:0 100%;visibility:hidden}
  .avfx-curtain::before,.avfx-curtain::after{content:"";position:absolute;left:0;right:0;height:4px;background:linear-gradient(90deg,#CD57FF,#ff7ab6 50%,#FFCE1F);box-shadow:0 0 24px 4px rgba(205,87,255,.45)}
  .avfx-curtain::before{top:0}.avfx-curtain::after{bottom:0}
  .avfx-curtain[data-state=cover]{visibility:visible;pointer-events:auto;translate:0 0;transition:translate .42s cubic-bezier(.7,0,.3,1)}
  .avfx-curtain[data-state=flash]{visibility:visible;pointer-events:auto;translate:0 0;animation:avfx-fade .2s ease both}
  @keyframes avfx-fade{from{opacity:0}}
  .avfx-curtain[data-state=reveal]{visibility:visible;translate:0 -100%;transition:translate .6s cubic-bezier(.7,0,.3,1)}
  @media (prefers-reduced-motion:reduce){.avfx-orb{animation:none}.avfx-ch>i,.avfx-w>i{translate:0 0;rotate:0deg;transition:none}}
  `;
  const style = document.createElement('style');
  style.id = 'avfx-style';
  style.textContent = css;
  document.head.appendChild(style);

  /* -------------------------------------------------------------- theme */
  // The site's own toggle swaps colors; follow it by reading the page background.
  let pageRoot = null; // Framer's full-page frame (it paints the page color)
  function syncTheme() {
    let color = getComputedStyle(pageRoot || document.body).backgroundColor;
    if (/rgba\(.*, 0\)$/.test(color)) color = getComputedStyle(document.body).backgroundColor;
    const m = color.match(/\d+(\.\d+)?/g);
    if (!m) return;
    const [r, g, b] = m.map(Number);
    const light = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255 > 0.55;
    document.documentElement.dataset.avfxTheme = light ? 'light' : 'dark';
  }
  syncTheme();
  addEventListener('click', () => { setTimeout(syncTheme, 50); setTimeout(syncTheme, 450); }, true);
  matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => setTimeout(syncTheme, 50));

  /* --------------------------------------------- background + spotlight */
  const bg = document.createElement('div');
  bg.className = 'avfx-bg';
  bg.setAttribute('aria-hidden', 'true');
  bg.innerHTML = '<div class="avfx-orbs"><span class="avfx-orb"></span><span class="avfx-orb"></span><span class="avfx-orb"></span></div><div class="avfx-grid"></div><div class="avfx-grid avfx-grid-lit"></div>';
  const spot = document.createElement('div');
  spot.className = 'avfx-spot';
  spot.setAttribute('aria-hidden', 'true');
  const progress = document.createElement('div');
  progress.className = 'avfx-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.prepend(bg);
  // The spotlight is a full-screen blend layer: lovely with a mouse, but on
  // phones it makes every scroll frame re-blend the whole page.
  if (coarse) document.body.append(progress);
  else document.body.append(spot, progress);

  let frame = 0, px = 0, py = 0;
  const paint = () => {
    frame = 0;
    for (const el of [bg, spot]) {
      el.style.setProperty('--cx', ptr.x + 'px');
      el.style.setProperty('--cy', ptr.y + 'px');
    }
    bg.style.setProperty('--px', px.toFixed(3));
    bg.style.setProperty('--py', py.toFixed(3));
  };
  const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* --------------------------------------------------------- pointer */
  let litCard = null;
  function lightCard(target) {
    const card = target?.closest?.('[data-avfx-card]');
    if (litCard && litCard !== card) {
      litCard.style.backgroundImage = litCard.dataset.avfxBg || '';
      if (!reduce) litCard.style.rotate = '';
    }
    litCard = card;
    if (!card) return;
    const r = card.getBoundingClientRect();
    const mx = ptr.x - r.left, my = ptr.y - r.top;
    card.style.backgroundImage = `radial-gradient(520px circle at ${mx}px ${my}px, var(--avfx-glow), transparent 60%)`;
    if (!reduce && fine) {
      const rx = (my / r.height - 0.5) * -4, ry = (mx / r.width - 0.5) * 5;
      const len = Math.hypot(rx, ry) || 1;
      card.style.rotate = `${(rx / len).toFixed(3)} ${(ry / len).toFixed(3)} 0 ${len.toFixed(2)}deg`;
    }
  }

  addEventListener('pointermove', e => {
    ptr.x = e.clientX; ptr.y = e.clientY;
    if (e.pointerType === 'touch') ptr.lastTouch = performance.now();
    else { px = ptr.x / innerWidth - 0.5; py = ptr.y / innerHeight - 0.5; }
    bg.dataset.active = spot.dataset.active = 'true';
    lightCard(e.target);
    schedule();
  }, { passive: true });
  document.addEventListener('pointerleave', () => { if (!coarse) bg.dataset.active = spot.dataset.active = 'false'; });
  let pressed = false;
  addEventListener('pointerdown', e => {
    if (e.pointerType === 'mouse' || e.pointerType === 'pen') pressed = true;
    if (e.pointerType !== 'touch' || reduce) return;
    const dot = document.createElement('span');
    dot.className = 'avfx-ripple';
    dot.style.left = e.clientX + 'px';
    dot.style.top = e.clientY + 'px';
    document.body.appendChild(dot);
    dot.addEventListener('animationend', () => dot.remove(), { once: true });
  }, { passive: true });
  // A long press can become a drag or a context menu with no pointerup, so
  // release on every way a press can end.
  for (const n of ['pointerup', 'pointercancel', 'dragstart', 'contextmenu', 'blur', 'resize']) addEventListener(n, () => { pressed = false; }, { passive: true });

  // Touch: a soft light wanders on its own and glides to your finger. It only
  // moves with `transform`, so the GPU slides it without repainting the page.
  // Tilting the phone nudges the orbs (only on real changes, not 60 times a second).
  if (coarse && !reduce) {
    const glow = document.createElement('div');
    glow.className = 'avfx-touchglow';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
    let gx = innerWidth / 2, gy = innerHeight / 2.5, graf = 0;
    const roam = t => {
      graf = requestAnimationFrame(roam);
      let tx = ptr.x, ty = ptr.y;
      if (performance.now() - ptr.lastTouch > 1800) {
        const s = t / 1000;
        tx = innerWidth * (0.5 + 0.38 * Math.sin(s * 0.45));
        ty = innerHeight * (0.45 + 0.3 * Math.sin(s * 0.31 + 1.3));
      }
      gx += (tx - gx) * 0.06; gy += (ty - gy) * 0.06;
      glow.style.transform = `translate3d(${gx.toFixed(1)}px,${gy.toFixed(1)}px,0)`;
    };
    const roamOn = () => { if (!graf && !document.hidden) graf = requestAnimationFrame(roam); };
    document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(graf); graf = 0; } else roamOn(); });
    roamOn();
    requestAnimationFrame(() => { glow.dataset.on = 'true'; });
    addEventListener('deviceorientation', e => {
      if (e.gamma == null) return;
      const nx = Math.max(-0.5, Math.min(0.5, e.gamma / 60));
      const ny = Math.max(-0.5, Math.min(0.5, (e.beta - 45) / 60));
      if (Math.abs(nx - px) < 0.04 && Math.abs(ny - py) < 0.04) return;
      px = nx; py = ny;
      schedule();
    }, { passive: true });
  }

  /* ---------------------------------------------------------- cursor */
  if (fine && !reduce) {
    const ring = document.createElement('div');
    ring.className = 'avfx-ring';
    ring.setAttribute('aria-hidden', 'true');
    ring.innerHTML = '<span></span>';
    const dot = document.createElement('div');
    dot.className = 'avfx-dot';
    dot.setAttribute('aria-hidden', 'true');
    document.body.append(ring, dot);
    let rx = ptr.x, ry = ptr.y, vx = 0, vy = 0, sc = 1, shown = false;
    const tick = () => {
      // critically-damped-ish spring toward the pointer
      vx = (vx + (ptr.x - rx) * 0.2) * 0.62;
      vy = (vy + (ptr.y - ry) * 0.2) * 0.62;
      rx += vx; ry += vy;
      // Press shrink lives in the same transform, after the translate. (A CSS
      // `scale` would also scale the offset and push the ring off the pointer.)
      sc += ((pressed ? 0.8 : 1) - sc) * 0.3;
      ring.style.transform = `translate3d(${rx}px,${ry}px,0) scale(${sc.toFixed(3)})`;
      dot.style.transform = `translate3d(${ptr.x}px,${ptr.y}px,0)`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      if (!shown) { shown = true; ring.style.opacity = dot.style.opacity = '1'; }
    }, { passive: true });
    document.addEventListener('pointerleave', () => { shown = false; ring.style.opacity = dot.style.opacity = '0'; });
    addEventListener('pointerover', e => {
      const t = e.target.closest?.('a, button, [role="button"], input, textarea, select, label, [data-highlight="true"], [data-avfx-label]');
      const label = t?.closest('[data-avfx-label]')?.dataset.avfxLabel;
      if (label) { ring.dataset.mode = 'label'; ring.firstChild.textContent = label; }
      else if (t?.matches('input:not([type=range]):not([type=checkbox]):not([type=radio]), textarea')) ring.dataset.mode = 'text';
      else ring.dataset.mode = t ? 'hover' : '';
    }, { passive: true });
  }

  /* ------------------------------------------------------ header hide */
  // Same as the Fun Lab nav: hides while scrolling down, slides back the
  // moment you scroll up. Stays put while it has focus or the pointer.
  let header = null, lastY = scrollY, navHidden = false;
  function findHeader() {
    const nav = document.querySelector('[data-framer-name="Nav"]');
    let el = nav;
    while (el && el !== document.body && getComputedStyle(el).position !== 'fixed') el = el.parentElement;
    if (!el || el === document.body || el === header) return;
    header = el;
    header.style.transition = `translate .45s ${EASE}, scale .45s ${EASE}, opacity .45s ${EASE}`;
    header.addEventListener('focusin', () => setNavHidden(false));
  }
  function setNavHidden(h) {
    if (!header || h === navHidden) return;
    navHidden = h;
    header.style.translate = h ? '0 -96px' : '';
    header.style.scale = h ? '.96' : '';
    header.style.opacity = h ? '0' : '';
    header.style.pointerEvents = h ? 'none' : '';
  }
  addEventListener('scroll', () => {
    const y = scrollY;
    const busy = header && (header.matches(':hover') || header.contains(document.activeElement));
    if (y !== lastY) setNavHidden(!busy && y > lastY && y > 240);
    lastY = y;
  }, { passive: true });

  /* -------------------------------------------------------- magnetic */
  function magnetic(el, strength) {
    if (el.dataset.avfxMag || reduce || !fine) return;
    el.dataset.avfxMag = '1';
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.translate = `${((e.clientX - r.left - r.width / 2) * strength).toFixed(1)}px ${((e.clientY - r.top - r.height / 2) * strength).toFixed(1)}px`;
    });
    el.addEventListener('pointerleave', () => { el.style.translate = ''; });
  }

  /* ------------------------------------------------------ split text */
  // Wrap every character of every text node (keeps Framer's inline spans,
  // links and line breaks). Screen readers get the original via aria-label.
  function splitChars(el, gradientFrom) {
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const nodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) nodes.push(walker.currentNode);
    const total = label.replace(/ /g, '').length;
    let idx = 0;
    const chars = [];
    // Framer paints gradient text with background-clip:text on a wrapper span.
    // Chrome can't clip that to letters that animate on their own (it smears
    // into a blob), so each letter gets its own slice of the gradient instead.
    const fills = new Map();
    for (const node of nodes) {
      const fill = node.parentElement.closest('[data-text-fill]');
      // Prefer Framer's own value: it uses theme tokens, so it follows light/dark.
      const bgImg = fill && el.contains(fill) ? (fill.style.backgroundImage || getComputedStyle(fill).backgroundImage) : 'none';
      const fillChars = bgImg !== 'none' ? (fills.get(fill)?.fillChars || []) : null;
      if (fillChars) fills.set(fill, { bgImg, fillChars });
      const frag = document.createDocumentFragment();
      for (const word of node.textContent.split(/(\s+)/)) {
        if (!word) continue;
        if (/^\s+$/.test(word)) { frag.append(' '); continue; }
        const w = document.createElement('span');
        w.style.cssText = 'display:inline-block;white-space:nowrap';
        for (const ch of word) {
          const mask = document.createElement('span');
          mask.className = 'avfx-mask';
          const c = document.createElement('span');
          c.className = 'avfx-ch';
          const i = document.createElement('i');
          i.textContent = ch;
          i.style.setProperty('--d', 120 + idx * 28);
          if (gradientFrom != null && idx >= gradientFrom) {
            i.classList.add('avfx-grad');
            i.style.setProperty('--i', idx - gradientFrom);
            i.style.setProperty('--n', total - gradientFrom);
          }
          else if (fillChars) fillChars.push(i);
          c.append(i); mask.append(c); w.append(mask);
          chars.push(c);
          idx++;
        }
        frag.append(w);
      }
      node.replaceWith(frag);
    }
    for (const [fill, { bgImg, fillChars }] of fills) {
      fillChars.forEach((i, k) => {
        i.classList.add('avfx-fill');
        i.style.backgroundImage = bgImg;
        i.style.setProperty('--i', k);
        i.style.setProperty('--n', fillChars.length);
      });
      fill.style.backgroundImage = 'none';
    }
    el.setAttribute('aria-label', label);
    for (const child of el.children) child.setAttribute('aria-hidden', 'true');
    return chars;
  }

  function splitWords(el) {
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const nodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let idx = 0;
    for (const node of nodes) {
      const frag = document.createDocumentFragment();
      for (const word of node.textContent.split(/(\s+)/)) {
        if (!word) continue;
        if (/^\s+$/.test(word)) { frag.append(' '); continue; }
        const w = document.createElement('span');
        w.className = 'avfx-w';
        const i = document.createElement('i');
        i.textContent = word;
        i.style.setProperty('--d', idx++ * 70);
        w.append(i);
        frag.append(w);
      }
      node.replaceWith(frag);
    }
    el.setAttribute('aria-label', label);
    for (const child of el.children) child.setAttribute('aria-hidden', 'true');
  }

  const revealIO = new IntersectionObserver(entries => {
    for (const e of entries) if (e.isIntersecting) {
      e.target.classList.add('avfx-in');
      // Framer rewrites className when a component re-renders (hover
      // variants), which would drop the class; the data attribute stays.
      if (e.target.dataset.avfxRise) e.target.dataset.avfxRise = 'in';
      revealIO.unobserve(e.target);
    }
  }, { rootMargin: '0px 0px -8% 0px' });

  // Letters near the cursor lift, grow and lean away from it (desktop);
  // on touch they ride a sine wave driven by scroll position.
  const reactive = new Set();
  if (!reduce && fine) {
    let f = 0;
    addEventListener('pointermove', () => {
      if (f) return;
      f = requestAnimationFrame(() => {
        f = 0;
        for (const chars of reactive) {
          const box = chars[0]?.parentElement?.parentElement?.parentElement?.getBoundingClientRect();
          if (!box || box.bottom < -200 || box.top > innerHeight + 200) continue;
          for (const el of chars) {
            const r = el.getBoundingClientRect();
            const dx = r.left + r.width / 2 - ptr.x, dy = r.top + r.height / 2 - ptr.y;
            const k = Math.max(0, 1 - Math.hypot(dx, dy) / 190);
            el.style.transform = k > 0 ? `translateY(${(-k * 0.2).toFixed(3)}em) scale(${(1 + k * 0.15).toFixed(3)}) rotate(${(Math.sign(dx) * k * 7).toFixed(2)}deg)` : '';
          }
        }
      });
    }, { passive: true });
  } else if (!reduce && coarse) {
    let f = 0;
    addEventListener('scroll', () => {
      if (f) return;
      f = requestAnimationFrame(() => {
        f = 0;
        const phase = scrollY * 0.018, amp = Math.min(1, scrollY / 120);
        for (const chars of reactive) chars.forEach((el, i) => {
          const w = Math.sin(phase + i * 0.55);
          el.style.transform = `translateY(${(w * 0.08 * amp).toFixed(3)}em) rotate(${(w * 4 * amp).toFixed(2)}deg)`;
        });
      });
    }, { passive: true });
  }

  /* ----------------------------------------------------- hero canvas */
  function particles(host) {
    if (host.querySelector(':scope > .avfx-canvas')) return;
    const canvas = document.createElement('canvas');
    canvas.className = coarse ? 'avfx-canvas avfx-touch' : 'avfx-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.style.isolation = 'isolate';
    host.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, list = [], raf = 0, running = false, t = 0, visible = true;
    const local = { x: -9999, y: -9999, on: false };
    const seed = () => {
      const n = coarse ? Math.min(70, Math.round((w * h) / 5000)) : Math.min(140, Math.round((w * h) / 9000));
      list = Array.from({ length: n }, () => spawn({ r: 1 + Math.random() * 1.8, c: COLORS[(Math.random() * COLORS.length) | 0], p: Math.random() * 6.28 }, true));
    };
    // The flow field slowly herds particles into a few streams, so after a while
    // they pile up in one corner. Each one lives 10-24 s, fades out and is reborn
    // somewhere random, which keeps the constellation evenly spread.
    function spawn(o, stagger) {
      o.x = Math.random() * w; o.y = Math.random() * h; o.vx = 0; o.vy = 0;
      o.life = 600 + Math.random() * 840; o.age = stagger ? Math.random() * o.life : 0;
      return o;
    }
    const alive = o => Math.min(1, o.age / 90, (o.life - o.age) / 90);
    const resize = () => {
      const r = canvas.getBoundingClientRect(), dpr = Math.min(coarse ? 1.5 : 2, devicePixelRatio || 1);
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed(); draw();
    };
    const step = () => {
      t += 0.004;
      for (const p of list) {
        if (coarse) { p.vy -= 0.012 + p.r * 0.006; p.vx += Math.sin(t * 3 + p.p) * 0.012; }
        const a = Math.sin(p.x * 0.004 + t) * Math.cos(p.y * 0.004 - t) * 6.283;
        p.vx += Math.cos(a) * 0.02; p.vy += Math.sin(a) * 0.02;
        if (local.on && !coarse) {
          const dx = p.x - local.x, dy = p.y - local.y, d2 = dx * dx + dy * dy;
          if (d2 < 22500 && d2 > 0.01) { const d = Math.sqrt(d2), k = (1 - d / 150) * 1.4; p.vx += dx / d * k; p.vy += dy / d * k; }
        }
        p.vx *= 0.94; p.vy *= 0.94; p.x += p.vx; p.y += p.vy;
        if (++p.age >= p.life) spawn(p, false);
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;
      }
    };
    // Phones fade the bottom out here instead of a CSS mask on a live canvas.
    const fade = y => (coarse ? Math.max(0, Math.min(1, (0.85 - y / h) / 0.4)) : 1);
    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < list.length; i++) {
        const a = list[i], fa = fade(a.y) * alive(a);
        if (!fa) continue;
        for (let j = i + 1; j < list.length; j++) {
          const b = list[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < 12100) {
            ctx.strokeStyle = `rgba(${a.c},${(1 - Math.sqrt(d2) / 110) * 0.35 * fa * alive(b)})`;
            ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        if (local.on && !coarse) {
          const d = Math.hypot(a.x - local.x, a.y - local.y);
          if (d < 180) { ctx.strokeStyle = `rgba(${a.c},${(1 - d / 180) * 0.6 * fa})`; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(local.x, local.y); ctx.stroke(); }
        }
      }
      for (const p of list) {
        const pulse = 0.6 + Math.sin(t * 6 + p.p) * 0.4;
        const fp = fade(p.y) * alive(p);
        if (!fp) continue;
        ctx.fillStyle = `rgba(${p.c},${(0.55 + pulse * 0.4) * fp})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (0.8 + pulse * 0.4), 0, 6.283); ctx.fill();
      }
    }
    // 60 fps; if a phone can't keep up (frames > 22 ms on average), draw every
    // other frame and step twice, so the motion keeps its speed.
    let odd = false, half = false, last = 0, slow = 0, seen = 0;
    const loop = now => {
      raf = requestAnimationFrame(loop);
      if (coarse && !half && last) {
        const dt = now - last;
        if (dt < 100) { slow += dt; seen++; }
        if (seen === 60) { half = slow / seen > 22; slow = seen = 0; }
      }
      last = now;
      if (half && (odd = !odd)) return;
      step(); if (half) step(); draw();
    };
    const start = () => { if (!running && !reduce && visible && !document.hidden) { running = true; raf = requestAnimationFrame(loop); } };
    const stop = () => { running = false; last = 0; cancelAnimationFrame(raf); };
    new ResizeObserver(resize).observe(canvas);
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(canvas);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      local.x = e.clientX - r.left; local.y = e.clientY - r.top;
      local.on = local.x >= 0 && local.y >= 0 && local.x <= r.width && local.y <= r.height;
    }, { passive: true });
    if (coarse) addEventListener('touchstart', e => {
      const tt = e.touches[0], r = canvas.getBoundingClientRect();
      if (!tt) return;
      const bx = tt.clientX - r.left, by = tt.clientY - r.top;
      for (const p of list) { const dx = p.x - bx, dy = p.y - by, d = Math.hypot(dx, dy) || 1; if (d < 220) { const k = (1 - d / 220) * 14; p.vx += dx / d * k; p.vy += dy / d * k; } }
    }, { passive: true });
    resize(); start();
  }

  /* ------------------------------------------------------ token orbit */
  // The hero's 3D piece: a shell of design tokens orbiting the gradient ball.
  // They fly in from a loose cloud and click into a sphere, lean toward the
  // pointer, bulge away from it, and unfold into a flat grid as you scroll
  // (tokens becoming a system). Plain canvas 2D with a perspective projection,
  // no WebGL library to download.
  function orbit(ball) {
    if (ball.querySelector(':scope > .avfx-orbit')) return;
    const canvas = document.createElement('canvas');
    canvas.className = 'avfx-orbit';
    canvas.setAttribute('aria-hidden', 'true');
    ball.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const N = coarse ? 190 : 340, FOCAL = 900;
    const pts = Array.from({ length: N }, (_, i) => {
      // Fibonacci sphere: evenly spread points on a unit sphere.
      const y = 1 - (i + 0.5) / N * 2, rr = Math.sqrt(1 - y * y), th = i * 2.39996;
      const s = Math.random() * 6.28, c = Math.acos(Math.random() * 2 - 1);
      return {
        sx: Math.cos(th) * rr, sy: y, sz: Math.sin(th) * rr,
        cx: Math.sin(c) * Math.cos(s) * 2.6, cy: Math.cos(c) * 2.6, cz: Math.sin(c) * Math.sin(s) * 2.6, // intro cloud
        gx: 0, gz: 0,
        col: COLORS[i % 7 === 0 ? 2 : i % 5 === 0 ? 3 : i % 3 === 0 ? 1 : 0],
        chip: i % 11 === 0, d: Math.random() * 500, bx: 0, by: 0,
      };
    });
    const cols = Math.ceil(Math.sqrt(N));
    pts.forEach((p, i) => { p.gx = ((i % cols) / (cols - 1) - 0.5) * 2.6; p.gz = (Math.floor(i / cols) / (cols - 1) - 0.5) * 2.6; });
    const NEAR = [8, 13, 21, 34], LINK = 1.7 * Math.sqrt(4 * Math.PI / N);
    let size = 0, R = 0, raf = 0, running = false, visible = true;
    let rotY = 0, tiltX = 0.25, tiltY = 0, morph = 0;
    let born = performance.now();
    // After the intro loader (or a page transition) the tokens assemble again.
    whenShown(() => { born = performance.now(); });
    const ease = x => 1 - Math.pow(1 - x, 3);

    const resize = () => {
      const r = ball.getBoundingClientRect(), mid = r.left + r.width / 2;
      size = Math.max(r.width, Math.min(r.width * 1.7, 2 * Math.min(mid, innerWidth - mid)));
      R = r.width * 0.6;
      const dpr = Math.min(coarse ? 1.5 : 2, devicePixelRatio || 1);
      Object.assign(canvas.style, { width: size + 'px', height: size + 'px', left: (r.width - size) / 2 + 'px', top: (r.height - size) / 2 + 'px' });
      canvas.width = Math.round(size * dpr); canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(performance.now());
    };

    const proj = [];
    function draw(now) {
      const h = size / 2;
      ctx.clearRect(0, 0, size, size);
      const r = canvas.getBoundingClientRect();
      // Lean toward the pointer, anywhere on the page.
      const nx = Math.max(-1, Math.min(1, (ptr.x - r.left - h) / innerWidth * 2));
      const ny = Math.max(-1, Math.min(1, (ptr.y - r.top - h) / innerHeight * 2));
      tiltY += (nx * 0.5 - tiltY) * 0.05;
      tiltX += (0.25 + ny * 0.35 - tiltX) * 0.05;
      // Unfold into a grid once the sphere's center scrolls past the middle of
      // the screen (on phones the hero ball sits below the fold).
      const want = Math.min(1, Math.max(0, (innerHeight / 2 - (r.top + h)) / (innerHeight * 0.6)));
      morph += (want - morph) * 0.08;
      const m = ease(morph);
      rotY += reduce ? 0 : 0.0028 * (1 - m * 0.7);
      const ay = rotY + tiltY, ax = tiltX + m * 0.55;
      const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
      const lx = ptr.x - r.left, ly = ptr.y - r.top, t = now - born;
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        const k = reduce ? 1 : ease(Math.min(1, Math.max(0, (t - p.d) / 1600)));
        // cloud → sphere → grid
        let x = p.cx + (p.sx - p.cx) * k, y = p.cy + (p.sy - p.cy) * k, z = p.cz + (p.sz - p.cz) * k;
        x += (p.gx - x) * m; y += (0 - y) * m; z += (p.gz - z) * m;
        x *= R; y *= R; z *= R;
        const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
        const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
        const s = FOCAL / (FOCAL + z2);
        let px = h + x1 * s, py = h + y2 * s;
        // Bulge away from the cursor (springy, in screen space).
        if (fine && !reduce) {
          const dx = px - lx, dy = py - ly, d = Math.hypot(dx, dy);
          const push = d < 110 && d > 0.1 ? (1 - d / 110) * 26 : 0;
          p.bx += ((push ? dx / d * push : 0) - p.bx) * 0.15;
          p.by += ((push ? dy / d * push : 0) - p.by) * 0.15;
          px += p.bx; py += p.by;
        }
        const depth = Math.max(0, Math.min(1, 0.5 - z2 / (2 * R))); // 1 front, 0 back
        proj[i] = { x: px, y: py, s, a: (0.18 + depth * 0.82) * Math.min(1, k * 1.5), x3: x, y3: y, z3: z };
      }
      // Lattice lines between near neighbours (Fibonacci offsets).
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
      // Tokens: dots, and every 11th one a small rounded "chip".
      for (let i = 0; i < N; i++) {
        const p = pts[i], q = proj[i], z = q.s;
        ctx.fillStyle = `rgba(${p.col},${q.a})`;
        if (p.chip) {
          const w = 9 * z, hh = 5.5 * z;
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(q.x - w / 2, q.y - hh / 2, w, hh, 2.5 * z) : ctx.rect(q.x - w / 2, q.y - hh / 2, w, hh); ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(q.x, q.y, 1.7 * z, 0, 6.283); ctx.fill();
        }
      }
    }
    const loop = now => { raf = requestAnimationFrame(loop); draw(now); };
    const start = () => { if (!running && !reduce && visible && !document.hidden) { running = true; raf = requestAnimationFrame(loop); } };
    const stop = () => { running = false; cancelAnimationFrame(raf); };
    new ResizeObserver(resize).observe(ball);
    addEventListener('resize', resize, { passive: true });
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); }).observe(canvas);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    if (reduce) addEventListener('scroll', () => requestAnimationFrame(draw), { passive: true });
    resize(); start();
  }

  /* --------------------------------------------- case-study scroll */
  // Big images on /projects/<slug> open up from a rounded window as they
  // scroll in (scrubbed, so they follow the scroll both ways). The cover,
  // already on screen at load, instead eases back and dims as you leave it.
  const scrubbed = new Set();
  let scrubRun = () => {};
  if (!reduce) {
    let f = 0;
    const run = () => {
      f = 0;
      for (const img of scrubbed) {
        if (!img.isConnected) { scrubbed.delete(img); continue; }
        const r = img.getBoundingClientRect();
        if (r.bottom < -100 || r.top > innerHeight + 100) continue;
        const rad = img.dataset.avfxRad;
        if (img.dataset.avfxScrub === 'cover') {
          const x = Math.min(1, Math.max(0, -r.top / r.height));
          img.style.scale = (1 - x * 0.08).toFixed(4);
          img.style.opacity = (1 - x * 0.5).toFixed(3);
        } else {
          const e = Math.min(1, Math.max(0, (innerHeight - r.top) / (innerHeight * 0.6)));
          const k = 1 - (1 - e) * (1 - e);
          img.style.clipPath = k >= 1 ? '' : `inset(${((1 - k) * 12).toFixed(2)}% ${((1 - k) * 9).toFixed(2)}% round ${rad})`;
          img.style.scale = (1.06 - k * 0.06).toFixed(4);
        }
      }
    };
    addEventListener('scroll', () => { if (!f) f = requestAnimationFrame(run); }, { passive: true });
    addEventListener('resize', () => { if (!f) f = requestAnimationFrame(run); }, { passive: true });
    scrubRun = run;
  }

  /* -------------------------------------------------- page transitions */
  // Framer swaps pages client-side. A curtain in the page color (with the
  // brand gradient on its edges) slides up over the old page, Framer
  // navigates underneath it, and it keeps sliding up to uncover the new one.
  const curtain = document.createElement('div');
  curtain.className = 'avfx-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  document.body.appendChild(curtain);
  let covering = false;
  const afterReveal = [];
  const whenShown = fn => (covering ? afterReveal.push(fn) : fn());
  function reveal() {
    if (!covering) return;
    curtain.dataset.state = 'reveal';
    // Start the entrance effects (hero letters etc.) just as the curtain lifts.
    setTimeout(() => { covering = false; afterReveal.splice(0).forEach(fn => fn()); }, 120);
    setTimeout(() => { if (!covering) curtain.dataset.state = ''; }, 700);
  }
  if (!reduce) addEventListener('click', e => {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || covering) return;
    const a = e.target.closest?.('a[href]');
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
    if (a.dataset.avfxGo) { delete a.dataset.avfxGo; return; }
    const url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname)) return;
    const from = location.pathname;
    // Uncover once the new page has rendered (or after 1.5 s no matter what).
    const uncover = () => {
      const t0 = performance.now();
      const wait = () => {
        if (location.pathname !== from) setTimeout(reveal, 180);
        else if (performance.now() - t0 > 1500) reveal();
        else requestAnimationFrame(wait);
      };
      requestAnimationFrame(wait);
    };
    covering = true;
    curtain.style.backgroundColor = getComputedStyle(pageRoot || document.body).backgroundColor;
    // Links in menus (the nav, the phone overlay) live in Framer's shared
    // template and close it on this very click, so the click must go through
    // untouched: the curtain just fades in over the old page and lifts once
    // the new one is there.
    let menu = a.parentElement;
    while (menu && menu !== document.body && getComputedStyle(menu).position !== 'fixed') menu = menu.parentElement;
    if (menu && menu !== document.body) {
      curtain.dataset.state = 'flash';
      uncover();
      return;
    }
    e.preventDefault(); e.stopPropagation();
    curtain.dataset.state = 'cover';
    setTimeout(() => {
      a.dataset.avfxGo = '1';
      a.click();
      uncover();
    }, 420);
  }, true);

  /* ------------------------------------------------------- intro loader */
  // First page view of a session only. The head snippet (framer/loader-head.html)
  // paints a dark cover before anything else and adds html.avfx-loading; this
  // builds the show on top: tokens fly in and form a sphere, unfold into a
  // grid (a system) and fold back while a counter runs to 100 and the words
  // cycle, then they warp past the camera and the panel slides up to the site,
  // where the hero orbit assembles again. Click or any key skips ahead.
  // It holds until the page has loaded and hydrated (capped at 9 s).
  const INTRO_MS = 4300;
  const WORDS = ['Tokens', 'Components', 'Patterns', 'Systems', 'Experiences'];
  if (document.documentElement.classList.contains('avfx-loading')) {
    try { sessionStorage.setItem('avfx-intro', '1'); } catch {}
    covering = true;
    const el = document.createElement('div');
    el.className = 'avfx-ld';
    el.setAttribute('role', 'status');
    el.setAttribute('aria-label', 'Loading');
    el.innerHTML = '<canvas aria-hidden="true"></canvas>'
      + '<div class="avfx-ld-top" aria-hidden="true"><span>Alejandro Vasquez</span><span>Design Systems Architect · UX &amp; AI Interface Engineer</span></div>'
      + '<div class="avfx-ld-bottom" aria-hidden="true"><div class="avfx-ld-count">000</div><div class="avfx-ld-word"></div></div>'
      + '<div class="avfx-ld-bar" aria-hidden="true"></div><div class="avfx-ld-skip" aria-hidden="true">Click to skip</div>';
    document.body.appendChild(el);
    const canvas = el.firstChild, ctx = canvas.getContext('2d');
    const count = el.querySelector('.avfx-ld-count'), word = el.querySelector('.avfx-ld-word'), bar = el.querySelector('.avfx-ld-bar');
    const N = coarse ? 170 : 280, FOCAL = 700, t0 = performance.now();
    const pts = Array.from({ length: N }, (_, i) => {
      const y = 1 - (i + 0.5) / N * 2, rr = Math.sqrt(1 - y * y), th = i * 2.39996;
      const s = Math.random() * 6.28, c = Math.acos(Math.random() * 2 - 1), far = 2.5 + Math.random() * 2;
      return {
        sx: Math.cos(th) * rr, sy: y, sz: Math.sin(th) * rr,
        cx: Math.sin(c) * Math.cos(s) * far, cy: Math.cos(c) * far, cz: Math.sin(c) * Math.sin(s) * far,
        col: COLORS[i % 7 === 0 ? 2 : i % 5 === 0 ? 3 : i % 3 === 0 ? 1 : 0],
        chip: i % 9 === 0, d: Math.random() * 600, px: null, py: null,
      };
    });
    const cols = Math.ceil(Math.sqrt(N));
    pts.forEach((p, i) => { p.gx = ((i % cols) / (cols - 1) - 0.5) * 3; p.gz = (Math.floor(i / cols) / (cols - 1) - 0.5) * 3; });
    const smooth = (a, b, x) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
    let w = 0, h = 0, rot = 0, spin = 0, ready = false, ending = 0, raf = 0, wi = -1;
    const size = () => {
      const dpr = Math.min(coarse ? 1.5 : 2, devicePixelRatio || 1);
      w = innerWidth; h = innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    size();
    addEventListener('resize', size, { passive: true });
    const showWord = i => {
      word.innerHTML = '';
      [...WORDS[i]].forEach((ch, j) => {
        const s = document.createElement('i');
        s.textContent = ch;
        s.style.transitionDelay = j * 28 + 'ms';
        word.appendChild(s);
      });
      requestAnimationFrame(() => requestAnimationFrame(() => word.classList.add('in')));
      word.classList.remove('in');
    };
    const frame = now => {
      raf = requestAnimationFrame(frame);
      const t = now - t0;
      // Progress follows time but waits at 90% until the page is ready.
      const p = Math.min(ready ? 1 : 0.9, t / INTRO_MS);
      count.textContent = String(Math.round(p * 100)).padStart(3, '0');
      bar.style.transform = `scaleX(${p.toFixed(3)})`;
      const nw = Math.min(WORDS.length - 1, Math.floor(p * WORDS.length));
      if (nw !== wi) { wi = nw; showWord(wi); }
      if (p >= 1 && !ending) finish();
      const e = ending ? Math.min(1, (now - ending) / 750) : 0; // warp
      const m = smooth(0.42, 0.6, p) * (1 - smooth(0.7, 0.86, p)); // sphere → grid → sphere
      spin += ((0.004 + p * 0.02 + e * 0.05) - spin) * 0.05;
      rot += spin;
      const R = Math.min(w, h) * (coarse ? 0.3 : 0.22);
      const tx = 0.35 + (ptr.y / h - 0.5) * 0.4 + m * 0.6, ty = rot + (ptr.x / w - 0.5) * 0.6;
      const cx = Math.cos(tx), sx = Math.sin(tx), cy = Math.cos(ty), sy = Math.sin(ty);
      ctx.fillStyle = 'rgba(17,16,17,.32)'; // trails
      ctx.fillRect(0, 0, w, h);
      const glow = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, R * 1.6);
      glow.addColorStop(0, `rgba(205,87,255,${0.16 * (1 - e)})`);
      glow.addColorStop(1, 'rgba(205,87,255,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (const q of pts) {
        const k = 1 - Math.pow(1 - Math.min(1, Math.max(0, (t - q.d) / 1500)), 3);
        let x = q.cx + (q.sx - q.cx) * k, y = q.cy + (q.sy - q.cy) * k, z = q.cz + (q.sz - q.cz) * k;
        x += (q.gx - x) * m; y -= y * m; z += (q.gz - z) * m;
        const grow = 1 + e * e * 7;
        x *= R * grow; y *= R * grow; z *= R * grow;
        const x1 = x * cy - z * sy, z1 = x * sy + z * cy;
        const y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx - e * e * 600;
        if (FOCAL + z2 < 40) { q.px = null; continue; }
        const s = FOCAL / (FOCAL + z2), X = w / 2 + x1 * s, Y = h / 2 + y2 * s;
        const depth = Math.max(0, Math.min(1, 0.5 - z2 / (2 * R * grow)));
        const a = (0.2 + depth * 0.8) * Math.min(1, k * 1.4) * (1 - e * 0.6);
        if (q.px !== null && (e > 0 || k < 1)) { // motion streaks while flying
          ctx.strokeStyle = `rgba(${q.col},${a * 0.6})`;
          ctx.beginPath(); ctx.moveTo(q.px, q.py); ctx.lineTo(X, Y); ctx.stroke();
        }
        q.px = X; q.py = Y;
        ctx.fillStyle = `rgba(${q.col},${a})`;
        ctx.beginPath();
        if (q.chip) { const cw = 10 * s, ch = 6 * s; if (ctx.roundRect) ctx.roundRect(X - cw / 2, Y - ch / 2, cw, ch, 3 * s); else ctx.rect(X - cw / 2, Y - ch / 2, cw, ch); }
        else ctx.arc(X, Y, 1.9 * s, 0, 6.283);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(frame);
    function finish() {
      if (ending) return;
      ending = performance.now();
      el.classList.add('warp');
      setTimeout(() => {
        scrollTo(0, 0);
        document.documentElement.classList.remove('avfx-loading');
        el.classList.add('out');
        window.__avfxLenis?.start();
        setTimeout(() => { covering = false; afterReveal.splice(0).forEach(fn => fn()); }, 150);
        setTimeout(() => { cancelAnimationFrame(raf); el.remove(); }, 900);
      }, 520);
    }
    // Ready = loaded + the 700 ms the motion layer waits for Framer's hydration.
    const onLoad = () => setTimeout(() => { ready = true; }, 800);
    if (document.readyState === 'complete') onLoad(); else addEventListener('load', onLoad, { once: true });
    setTimeout(() => { ready = true; }, 9000);
    const skip = () => { ready = true; finish(); };
    el.addEventListener('click', skip);
    addEventListener('keydown', function k() { if (!ending) skip(); removeEventListener('keydown', k); });
  }

  /* ------------------------------------------------- offscreen pause */
  // Framer's gradient ball redraws a canvas under a 40px blur every frame, even
  // below the fold. Hidden layers skip paint and compositing.
  const offIO = new IntersectionObserver(entries => {
    for (const e of entries) e.target.style.visibility = e.isIntersecting ? '' : 'hidden';
  }, { rootMargin: '200px 0px' });
  const offWatched = new WeakSet();
  function pauseOffscreen(el) {
    if (offWatched.has(el)) return;
    offWatched.add(el);
    offIO.observe(el);
  }

  /* ------------------------------------------------------ parallax */
  const parallax = new Set();
  if (!reduce) {
    let f = 0;
    const run = () => {
      f = 0;
      for (const img of parallax) {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -1 … 1
        img.style.translate = `0 ${(k * -6).toFixed(2)}%`;
      }
    };
    addEventListener('scroll', () => { if (!f) f = requestAnimationFrame(run); }, { passive: true });
  }

  /* ------------------------------------------------------ about color */
  // The About page is mostly copy, so it borrows colour from the brand:
  // constellation behind the hero, numbered gradient eyebrows on each
  // section, a timeline for the story, one brand tint per card (icon glow,
  // hairline, wash), gradient company names, skill chips, and a rotating
  // gradient border on the CV panel. Layer names come from the Framer page.
  const TINTS = ['205,87,255', '255,122,182', '255,206,31', '139,108,240'];
  function aboutColor(main) {
    const q = n => main.querySelector(`[data-framer-name="${n}"]`);
    const hero = q('About hero');
    if (hero) { if (getComputedStyle(hero).position === 'static') hero.style.position = 'relative'; particles(hero); }
    const eyebrow = q('About me');
    if (eyebrow) eyebrow.dataset.avfxEyebrow = '1';
    ['My story', 'How I work', 'Beyond the screen', 'Career snapshot'].forEach((name, n) => {
      const sec = q(name);
      if (!sec || sec.dataset.avfxSec) return;
      sec.dataset.avfxSec = '1';
      const h = sec.querySelector('h2');
      if (!h) return;
      h.parentElement.dataset.avfxNum = String(n + 1).padStart(2, '0');
      const words = h.querySelectorAll('.avfx-w > i');
      const last = words[words.length - 1];
      if (last) last.classList.add('avfx-gradw');
    });
    // story timeline
    const story = q('My story');
    if (story) [...story.children].slice(1).forEach((d, i) => { d.dataset.avfxStep = String(i); });
    // tinted cards
    ['How I work cards', 'Beyond the screen cards', 'Career snapshot cards'].forEach(g => {
      const grid = q(g);
      if (!grid) return;
      [...grid.children].forEach((card, i) => {
        if (card.dataset.avfxTint) return;
        const t = TINTS[i % TINTS.length];
        card.dataset.avfxTint = '1';
        card.style.setProperty('--tint', `rgb(${t})`);
        card.style.setProperty('--tint-a', `rgba(${t},.14)`);
        if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
        const wash = `linear-gradient(140deg, rgba(${t},.13), rgba(${t},0) 55%)`;
        card.style.backgroundImage = wash;
        card.dataset.avfxBg = wash;
      });
    });
    // company names in the career paragraph
    const career = q('Career snapshot');
    const para = career && [...career.querySelectorAll('p')].find(p => /Dollar General/.test(p.textContent));
    if (para && !para.dataset.avfxNames) {
      para.dataset.avfxNames = '1';
      const re = /(Dollar General \/ WBINNOVA|Continuum|Project Waste Not|MyStrengthBook)/g;
      const walker = document.createTreeWalker(para, NodeFilter.SHOW_TEXT);
      const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
      for (const node of nodes) {
        if (!re.test(node.textContent)) continue;
        re.lastIndex = 0;
        const frag = document.createDocumentFragment();
        node.textContent.split(re).forEach((part, i) => {
          if (!part) return;
          if (i % 2) { const b = document.createElement('b'); b.className = 'avfx-name'; b.textContent = part; frag.append(b); }
          else frag.append(part);
        });
        node.replaceWith(frag);
      }
    }
    // skill chips
    const skills = q('Systems & platforms');
    const testing = q('Testing & QA');
    [skills, testing].forEach(card => {
      const p = card && [...card.querySelectorAll('p')].pop();
      if (!p || p.dataset.avfxChips) return;
      p.dataset.avfxChips = '1';
      const items = p.textContent.replace(/\.$/, '').split(/,\s*(?![^()]*\))/);
      if (items.length < 3) return;
      p.setAttribute('aria-label', p.textContent);
      p.textContent = '';
      items.forEach((txt, i) => {
        const c = document.createElement('span');
        c.className = 'avfx-chip';
        c.setAttribute('aria-hidden', 'true');
        c.textContent = txt.trim();
        c.style.setProperty('--tint', `rgb(${TINTS[i % TINTS.length]})`);
        c.style.setProperty('--d', i * 60);
        p.append(c);
      });
      p.dataset.avfxRise = p.dataset.avfxRise || '1';
      revealIO.observe(p);
    });
    const cv = q('CV call to action');
    if (cv) cv.dataset.avfxRing = '1';
  }

  /* -------------------------------------------------------- enhance */  /* -------------------------------------------------------- enhance */
  // Runs after Framer hydrates and again whenever it swaps DOM (client-side
  // navigation, breakpoint changes). Every step is idempotent.
  function enhance() {
    document.querySelectorAll('[data-framer-name="Gradient Blur"]').forEach(pauseOffscreen);
    const main = document.getElementById('main') || document.body;

    // The page frame paints an opaque color over <body>, so the backdrop
    // lives inside it as the first child (above its color, below sections).
    const frameEl = document.elementsFromPoint(4, innerHeight / 2).find(el => main.contains(el) && el !== main
      && el.offsetWidth >= innerWidth * 0.9 && !/rgba\(.*, 0\)$|transparent/.test(getComputedStyle(el).backgroundColor));
    if (frameEl && frameEl !== pageRoot) {
      pageRoot = frameEl;
      pageRoot.prepend(bg);
    }
    syncTheme();
    findHeader();

    // Hero heading (an h1 on desktop, an h2 in Framer's phone layout): rise
    // in, react, gradient on "Design & Engineering".
    main.querySelectorAll('h1, [data-framer-name="Hero Section"] h2').forEach(h => {
      if (h.dataset.avfx || !h.offsetParent) return;
      h.dataset.avfx = '1';
      const text = h.textContent;
      const at = text.search(/Design\s*&|Diseño|design empathy/);
      const gradFrom = at > 0 ? text.slice(0, at).replace(/\s/g, '').length : null;
      const chars = splitChars(h, gradFrom);
      if (!reduce) reactive.add(chars);
      whenShown(() => requestAnimationFrame(() => requestAnimationFrame(() => h.classList.add('avfx-in'))));
    });

    // 404 page: the big number gets the brand gradient and reactive letters.
    main.querySelectorAll('h1, h2, p').forEach(el => {
      if (el.dataset.avfx || el.textContent.trim() !== '404' || !el.offsetParent) return;
      el.dataset.avfx = '1';
      const chars = splitChars(el, 0);
      if (!reduce) reactive.add(chars);
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('avfx-in')));
    });

    // Section headings: words rise in on scroll.
    main.querySelectorAll('h2').forEach(h => {
      if (h.dataset.avfx || !h.offsetParent || h.textContent.length > 120) return;
      h.dataset.avfx = '1';
      if (reduce) return;
      splitWords(h);
      revealIO.observe(h);
    });

    // Hero particles inside the rounded hero panel.
    const hero = main.querySelector('[data-framer-name="Hero Section"] > [data-framer-name="Wrapper"]');
    if (hero) particles(hero);
    // 3D token orbit around the hero's gradient ball.
    const ball = main.querySelector('[data-framer-name="Hero Section"] [data-framer-name="Ball"]');
    if (ball && ball.offsetWidth) orbit(ball);
    // Same constellation behind the contact panel.
    const contactPanel = main.querySelector('[data-framer-name="Contact panel"]');
    if (contactPanel) particles(contactPanel);

    // Cards: project cards, testimonials and any big rounded opaque panel.
    // The /projects page lists the same card component outside a "Project Cards"
    // frame, so a card is also the panel around any "View Project" link.
    const isPanel = el => {
      const cs = getComputedStyle(el);
      return parseFloat(cs.borderTopLeftRadius) >= 12 && cs.backgroundColor !== 'rgba(0, 0, 0, 0)' && el.offsetWidth >= 240;
    };
    const viewPanels = [...main.querySelectorAll('a[href*="projects/"], a[href*="project/"]')]
      .filter(a => /view project/i.test(a.textContent))
      .map(a => { let p = a.parentElement; while (p && p !== main && !isPanel(p)) p = p.parentElement; return p !== main && p; })
      .filter(Boolean);
    const projectCards = new Set(viewPanels);
    [...main.querySelectorAll('[data-framer-name="Project Cards"] [data-framer-name], [data-framer-name^="Testimonial-Card"]'), ...viewPanels].forEach(el => {
      if (el.dataset.avfxCard) return;
      if (!isPanel(el)) return;
      if (el.parentElement.closest('[data-avfx-card]')) return;
      el.dataset.avfxCard = '1';
      el.dataset.avfxBg = el.style.backgroundImage || '';
      if (projectCards.has(el) || el.closest('[data-framer-name="Project Cards"]')) {
        el.dataset.avfxLabel = 'View';
        el.parentElement.style.perspective = '1400px';
        // The whole card opens the project, not just its "View Project" link.
        // That link stays the one focusable target for keyboard and screen readers.
        el.style.cursor = 'pointer';
        el.addEventListener('click', e => {
          if (e.defaultPrevented || e.target.closest('a, button')) return;
          const link = el.querySelector('a[href]');
          if (!link) return;
          if (e.metaKey || e.ctrlKey || e.button === 1) window.open(link.href, '_blank', 'noopener');
          else link.click();
        });
      } else {
        el.parentElement.style.perspective = '1200px';
      }
    });

    // Closing "Ready to connect" banner: Framer swaps its gray fill for a red
    // gradient on hover, but can't animate one gradient into another, so it
    // jumps. Crossfade the same gradient on a layer behind the content instead.
    main.querySelectorAll('[data-framer-name="cta+links"] *').forEach(el => {
      if (el.dataset.avfxBanner || el.offsetWidth < 280 || parseFloat(getComputedStyle(el).borderTopLeftRadius) < 24) return;
      if (el.parentElement.closest('[data-avfx-banner]')) return;
      el.dataset.avfxBanner = '1';
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    });

    // Magnetic buttons, nav logo, social links; springy tool icons.
    main.querySelectorAll('a[data-framer-name^="Primary"], a[data-framer-name="Logo"], [data-framer-name="social-media"] a, [data-framer-name="category"]').forEach(el => magnetic(el, 0.3));
    main.querySelectorAll('[data-framer-name="tools"] a').forEach(el => { el.dataset.avfxIcon = '1'; magnetic(el, 0.25); });

    // Framer's Ticker clones its items with aria-hidden to make the loop
    // seamless; keep links inside those clones out of the tab order too.
    main.querySelectorAll('[aria-hidden="true"] :is(a[href], button, input, select, textarea, [tabindex])').forEach(el => {
      if (el.tabIndex >= 0) el.tabIndex = -1;
    });

    // Scroll parallax for large images in clipped frames.
    if (!reduce) main.querySelectorAll('img').forEach(img => {
      if (img.dataset.avfx || img.closest('[data-avfx-card]')) return;
      const box = img.parentElement;
      if (!box || img.offsetWidth < 300 || getComputedStyle(box).overflow !== 'hidden' && getComputedStyle(box.parentElement || box).overflow !== 'hidden') return;
      img.dataset.avfx = '1';
      img.style.scale = '1.12';
      parallax.add(img);
    });

    // Case studies: scroll-scrubbed reveals on the big rounded images.
    if (!reduce && /^\/projects\/[^/]+/.test(location.pathname)) {
      main.querySelectorAll('img').forEach(img => {
        if (img.dataset.avfxScrub || img.dataset.avfx || img.offsetWidth < 480 || img.closest('[aria-hidden="true"], [data-avfx-card]')) return;
        const rad = getComputedStyle(img).borderTopLeftRadius;
        if (parseFloat(rad) < 8) return;
        img.dataset.avfxRad = rad;
        img.dataset.avfxScrub = img.getBoundingClientRect().top < innerHeight * 0.75 ? 'cover' : 'reveal';
        img.style.willChange = 'clip-path, scale';
        scrubbed.add(img);
      });
      scrubRun();
    }

    // About page: the portrait tilts toward the cursor with a brand-gradient
    // glow; story paragraphs and cards rise in (staggered) as they scroll in,
    // and the cards get the same spotlight + tilt as the project cards.
    if (/^\/about\/?$/.test(location.pathname)) {
      const photo = main.querySelector('[data-framer-name="About Photo"]');
      if (photo && !photo.dataset.avfxPhoto) {
        photo.dataset.avfxPhoto = '1';
        if (getComputedStyle(photo).position === 'static') photo.style.position = 'relative';
        photo.parentElement.style.perspective = '1200px';
        if (!reduce && fine) {
          photo.addEventListener('pointermove', e => {
            const r = photo.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
            photo.style.rotate = `${(-y).toFixed(3)} ${x.toFixed(3)} 0 ${(Math.hypot(x, y) * 14).toFixed(2)}deg`;
            photo.style.setProperty('--gx', (x + 0.5) * 100 + '%');
            photo.style.setProperty('--gy', (y + 0.5) * 100 + '%');
          });
          photo.addEventListener('pointerleave', () => { photo.style.rotate = ''; });
        }
      }
      // Shared site chrome (nav, the closing "Ready to connect" banner and the
      // footer) keeps its own behaviour.
      const chrome = 'nav, footer, [data-framer-name="Nav"], [data-framer-name="cta+links"], [data-framer-name*="Footer"], [data-framer-name="Babarogic Animation"]';
      const blocks = [...main.querySelectorAll('p')].filter(el => !el.closest(`${chrome}, [data-framer-name="Hero"], [data-avfx-rise]`) && el.textContent.trim().length > 40);
      main.querySelectorAll('div').forEach(el => {
        if (el.dataset.avfxCard || el.closest(chrome) || el.parentElement.closest('[data-avfx-card]') || !isPanel(el) || el.offsetWidth > innerWidth * 0.8) return;
        if (!el.querySelector('h3, h4, h5, h6, p')) return;
        el.dataset.avfxCard = '1';
        el.dataset.avfxBg = el.style.backgroundImage || '';
        el.parentElement.style.perspective = '1200px';
        blocks.push(el);
      });
      if (!reduce) blocks.forEach(el => {
        if (el.dataset.avfxRise || el.closest('[data-avfx-rise]') && el.tagName === 'P') return;
        el.dataset.avfxRise = '1';
        const sibs = [...el.parentElement.children].filter(c => c.dataset.avfxRise);
        el.style.setProperty('--d', Math.min(sibs.indexOf(el), 4) * 90);
        revealIO.observe(el);
      });
      aboutColor(main);
    }
  }

  /* --------------------------------------------------- smooth scroll */
  function smoothScroll() {
    if (reduce || !fine || window.Lenis === undefined) return;
    const lenis = new window.Lenis({ lerp: 0.1, wheelMultiplier: 1, anchors: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    // Pause while Framer locks the page (menus, overlays).
    const locked = () => [document.documentElement, document.body].some(el => getComputedStyle(el).overflow === 'hidden');
    new MutationObserver(() => (locked() ? lenis.stop() : lenis.start()))
      .observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });
    window.__avfxLenis = lenis;
    if (document.documentElement.classList.contains('avfx-loading')) lenis.stop();
  }

  /* ------------------------------------------------------------ boot */
  function boot() {
    enhance();
    let pending = 0;
    new MutationObserver(() => {
      clearTimeout(pending);
      pending = setTimeout(enhance, 250);
    }).observe(document.getElementById('main') || document.body, { childList: true, subtree: true });
    smoothScroll();
  }
  // Wait for Framer's hydration so React never sees our changes as a mismatch.
  const later = () => setTimeout(boot, 700);
  if (document.readyState === 'complete') later();
  else addEventListener('load', later, { once: true });
})();
