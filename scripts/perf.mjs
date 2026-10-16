// Mobile performance check for both sites, the way PageSpeed Insights runs it
// (Lighthouse 13, simulated slow 4G). Each page runs a few times and the
// median is shown, because single runs swing by several points.
//
//   npm run perf                          pages in scripts/perf-pages.json
//   npm run perf -- https://fun.alevasquez.dev/games   just these URLs
//   npm run perf -- --runs 5 --desktop    more runs / desktop instead of mobile
//
// With PSI_API_KEY set (free key: Google Cloud console → APIs → PageSpeed
// Insights API → Credentials), it uses Google's own PageSpeed servers, the
// same numbers as pagespeed.web.dev:
//   PSI_API_KEY=xxxx npm run perf
// Without it, it runs Lighthouse on this computer (needs Google Chrome). Local
// runs can be much lower than PageSpeed on some machines, so prefer the key.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const config = JSON.parse(fs.readFileSync(new URL('./perf-pages.json', import.meta.url), 'utf8'));
const args = process.argv.slice(2);
const flag = name => args.includes(name);
const value = (name, d) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : d; };
const runs = Number(value('--runs', config.runs || 3));
const desktop = flag('--desktop');
const urls = args.filter((a, i) => /^https?:/.test(a) && args[i - 1] !== '--runs');
const pages = urls.length ? urls : config.pages;
const target = config.target || 90;
const KEY = process.env.PSI_API_KEY;

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'perf-'));
const median = xs => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
const ms = v => (v >= 1000 ? (v / 1000).toFixed(1) + ' s' : Math.round(v) + ' ms');

console.log(`${desktop ? 'Desktop' : 'Mobile'} · ${runs} run(s) per page · median shown · target ${target} · ${KEY ? 'PageSpeed Insights API' : 'local Lighthouse (set PSI_API_KEY for PageSpeed numbers)'}\n`);
const rows = [];
for (const url of pages) {
  const results = [];
  for (let i = 0; i < runs; i++) {
    const out = path.join(tmp, `r${i}.json`);
    try {
      let r;
      if (KEY) {
        const api = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${desktop ? 'desktop' : 'mobile'}&category=performance&key=${KEY}`;
        const res = await fetch(api);
        const body = await res.json();
        if (!res.ok) throw new Error(body.error?.message || res.status);
        r = body.lighthouseResult;
      } else {
        execFileSync('npx', ['--yes', 'lighthouse@13', url, '--quiet', '--only-categories=performance',
          '--chrome-flags=--headless=new', '--output=json', `--output-path=${out}`, ...(desktop ? ['--preset=desktop'] : [])],
        { stdio: 'ignore', timeout: 180000 });
        r = JSON.parse(fs.readFileSync(out, 'utf8'));
      }
      const a = r.audits;
      results.push({
        score: Math.round(r.categories.performance.score * 100),
        fcp: a['first-contentful-paint'].numericValue,
        lcp: a['largest-contentful-paint'].numericValue,
        tbt: a['total-blocking-time'].numericValue,
        cls: a['cumulative-layout-shift'].numericValue,
      });
    } catch (e) { results.push(null); if (KEY) console.log(`     (${url}: ${e.message})`); }
  }
  const ok = results.filter(Boolean);
  if (!ok.length) { console.log(`  ✗  ${url}: Lighthouse failed`); continue; }
  const m = k => median(ok.map(r => r[k]));
  const row = { url, score: m('score'), all: ok.map(r => r.score).join('/'), fcp: m('fcp'), lcp: m('lcp'), tbt: m('tbt'), cls: m('cls') };
  rows.push(row);
  console.log(`  ${row.score >= target ? '✓' : '·'} ${String(row.score).padStart(3)}  (${row.all})  FCP ${ms(row.fcp)}  LCP ${ms(row.lcp)}  TBT ${ms(row.tbt)}  CLS ${row.cls.toFixed(3)}  ${url}`);
}
const below = rows.filter(r => r.score < target);
console.log(below.length ? `\n${below.length} page(s) below ${target}. PageSpeed varies a few points between runs; check again before changing anything.` : `\nAll pages at ${target} or more.`);
