import { expect, test, type Page } from '@playwright/test';

// Budgets for how much drawing a frame asks of the canvas. Call counts don't depend on how fast the
// machine is, so these hold on CI and catch a change that makes monsters or tints much costlier to draw.
// Timings are in `npm run perf` (PERF.md), which is a report, not a test.

/** Canvas calls per frame for the scene the page is showing, counted over `frames` frames with the world held still. */
async function callsPerFrame(page: Page, frames = 20) {
  return page.evaluate(async (frames) => {
    const P = CanvasRenderingContext2D.prototype as any;
    const names = ['fill', 'stroke', 'fillRect', 'clearRect', 'drawImage', 'createRadialGradient', 'createLinearGradient'];
    const counts: Record<string, number> = {};
    const orig: Record<string, any> = {};
    for (const n of names) {
      orig[n] = P[n];
      counts[n] = 0;
      P[n] = function (this: unknown, ...a: unknown[]) {
        counts[n]++;
        return orig[n].apply(this, a);
      };
    }
    for (let i = 0; i < frames; i++) await new Promise(requestAnimationFrame);
    for (const n of names) P[n] = orig[n];
    let total = 0;
    for (const n of names) total += counts[n] /= frames;
    return { ...counts, total } as Record<string, number> & { total: number };
  }, frames);
}

/** Clears the hero's surroundings and stands `n` of one monster around him, held still and unkillable. */
async function crowd(page: Page, n: number, state: 'plain' | 'flash' | 'chill') {
  await page.evaluate(
    ([n, state]) => {
      const g = (window as any).game;
      const w = g.world;
      const p = w.player;
      w.step = () => {};
      g.renderer.hoverId = -1;
      w.area.monsters = w.area.monsters.filter((m: any) => Math.hypot(m.x - p.x, m.y - p.y) > 25);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const m = w.spawnMonster(w.area, 'imp', p.x + Math.cos(a) * 2.5, p.y + Math.sin(a) * 2.5, 'normal');
        if (state === 'flash') m.flash = 1e9;
        if (state === 'chill') m.chill = 1e9;
      }
    },
    [n, state] as const,
  );
  await page.waitForTimeout(100);
}

test('drawing a crowd stays within its canvas budget', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the budget is the same on every screen');
  await page.goto('/?autostart&class=reaver&seed=7');
  await page.waitForFunction(() => !!(window as any).game);
  await page.evaluate(() => (window as any).game.world.cmdInteract({ kind: 'exit', index: 0 }));
  await page.waitForFunction(() => (window as any).game.world.area.def.id === 'cinder_fields', null, { timeout: 20_000 });
  await page.waitForTimeout(500);

  await crowd(page, 0, 'plain');
  const empty = await callsPerFrame(page);
  await crowd(page, 6, 'plain');
  const plain = await callsPerFrame(page);
  await crowd(page, 6, 'flash');
  const flash = await callsPerFrame(page);
  await crowd(page, 6, 'chill');
  const chill = await callsPerFrame(page);
  const per = (s: { total: number }) => (s.total - empty.total) / 6;
  console.log(`canvas calls per frame: empty ${empty.total}, per monster ${per(plain)}, per flashing monster ${per(flash)}, per chilled monster ${per(chill)}`);

  // The fields, the hero and the HUD on the canvas, before any monster.
  expect(empty.total).toBeLessThan(900);
  // An imp is a few dozen paths.
  expect(per(plain)).toBeLessThan(80);
  // A tinted monster is drawn once in shifted colours: not a second time, and not through another canvas,
  // which makes a phone's GPU stop and catch up.
  for (const s of [flash, chill]) {
    expect(per(s)).toBeLessThan(per(plain) + 4);
    // A scratch buffer is cleared for each figure drawn through it.
    expect(s.clearRect).toBe(plain.clearRect);
  }
});
