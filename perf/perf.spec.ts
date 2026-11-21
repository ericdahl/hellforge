import { test } from '@playwright/test';

// The project has no Node type definitions (the game itself never touches Node), so what's needed is declared here.
declare const process: { env: Record<string, string | undefined> };
const nodeFs = 'node:fs';
const nodeOs = 'node:os';

// Rewrites PERF.md: frame rate, script time and canvas calls for a few set scenes on a phone-sized screen, with
// the CPU slowed down to be nearer a phone's. Headless Chromium paints in software, not on a GPU, so the frame
// rates are not a phone's; compare a run with the committed one to see what a change moved.
// PERF_THROTTLE=1 runs at full speed, PERF_OUT=path writes somewhere else.

const THROTTLE = Number(process.env.PERF_THROTTLE ?? 4);
const OUT = process.env.PERF_OUT ?? 'PERF.md';
const MEASURE_MS = 3000;

type Scene = { name: string; n: number; state: 'plain' | 'flash' | 'chill' };
const SCENES: Scene[] = [
  { name: 'empty field', n: 0, state: 'plain' },
  { name: '3 monsters', n: 3, state: 'plain' },
  { name: '6 monsters', n: 6, state: 'plain' },
  { name: '12 monsters', n: 12, state: 'plain' },
  { name: '6 monsters, hit flash', n: 6, state: 'flash' },
  { name: '6 monsters, chilled', n: 6, state: 'chill' },
];
const RATIOS = [2, 1];

test('performance report', async ({ page }) => {
  await page.goto('/?autostart&class=reaver&seed=7');
  await page.waitForFunction(() => !!(window as any).game);
  await page.evaluate(() => (window as any).game.world.cmdInteract({ kind: 'exit', index: 0 }));
  await page.waitForFunction(() => (window as any).game.world.area.def.id === 'cinder_fields', null, { timeout: 20_000 });
  await page.evaluate(() => {
    const g = (window as any).game;
    const r = g.renderer;
    const w = g.world;
    // Hold the resolution where the report puts it, and the world still.
    g.adaptResolution = () => {};
    w.step = () => {};
    const perf = ((window as any).perf = { script: 0, calls: 0 });
    const render = r.render;
    r.render = function (...a: unknown[]) {
      const t = performance.now();
      try {
        return render.apply(this, a);
      } finally {
        perf.script += performance.now() - t;
      }
    };
    const P = CanvasRenderingContext2D.prototype as any;
    for (const n of ['fill', 'stroke', 'fillRect', 'clearRect', 'drawImage', 'createRadialGradient', 'createLinearGradient']) {
      const f = P[n];
      P[n] = function (this: unknown, ...a: unknown[]) {
        perf.calls++;
        return f.apply(this, a);
      };
    }
  });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: THROTTLE });

  const rows: string[] = [];
  for (const ratio of RATIOS) {
    for (const s of SCENES) {
      await page.evaluate(
        ([ratio, n, state]) => {
          const g = (window as any).game;
          const w = g.world;
          const p = w.player;
          g.renderer.maxDpr = ratio;
          g.resize();
          g.renderer.hoverId = -1;
          w.area.monsters = w.area.monsters.filter((m: any) => Math.hypot(m.x - p.x, m.y - p.y) > 25);
          for (let i = 0; i < n; i++) {
            const a = (i / n) * Math.PI * 2;
            const m = w.spawnMonster(w.area, 'imp', p.x + Math.cos(a) * 2.5, p.y + Math.sin(a) * 2.5, 'normal');
            if (state === 'flash') m.flash = 1e9;
            if (state === 'chill') m.chill = 1e9;
          }
        },
        [ratio, s.n, s.state] as const,
      );
      await page.waitForTimeout(500);
      const r = await page.evaluate(async (ms) => {
        const perf = (window as any).perf;
        perf.script = perf.calls = 0;
        const times: number[] = [];
        let last = performance.now();
        const end = last + ms;
        while (performance.now() < end) {
          const now = await new Promise<number>(requestAnimationFrame);
          times.push(now - last);
          last = now;
        }
        times.sort((a, b) => a - b);
        const n = times.length;
        return { fps: (n * 1000) / ms, p95: times[Math.floor(n * 0.95)], script: perf.script / n, calls: perf.calls / n };
      }, MEASURE_MS);
      rows.push(`| ${ratio} | ${s.name} | ${r.fps.toFixed(0)} | ${r.p95.toFixed(1)} | ${r.script.toFixed(1)} | ${Math.round(r.calls)} |`);
      console.log(rows[rows.length - 1]);
    }
  }

  const { writeFileSync } = (await import(/* @vite-ignore */ nodeFs)) as { writeFileSync(path: string, text: string): void };
  const { cpus } = (await import(/* @vite-ignore */ nodeOs)) as { cpus(): { model: string }[] };
  const md = [
    '# Performance',
    '',
    'Written by `npm run perf` (`perf/perf.spec.ts`). Each scene is the Cinder Fields at phone portrait size (390×844) with imps',
    'standing around the hero and the world held still, drawn at a fixed pixel ratio for 3 seconds.',
    '',
    `CPU slowed ${THROTTLE}× (${cpus()[0]?.model ?? 'unknown CPU'}). Headless Chromium paints in software rather than on a GPU,`,
    'so frame rates are not what a phone gets; compare a run against this file to see what a change moved. Script time is',
    "the game's own drawing code only; the rest of each frame is the browser painting it. Canvas calls are fills, strokes,",
    'rectangles, images and gradients per frame, which do not depend on the machine.',
    '',
    '| Pixel ratio | Scene | Frames/s | Slowest 5% (ms) | Script ms/frame | Canvas calls/frame |',
    '|---|---|---|---|---|---|',
    ...rows,
    '',
  ].join('\n');
  writeFileSync(OUT, md);
});
