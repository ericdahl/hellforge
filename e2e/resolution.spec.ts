import { expect, test, type Page } from '@playwright/test';

/** Makes every frame's drawing take at least `ms` (or skips drawing with -1), or restores it with null. */
async function drawCost(page: Page, ms: number | null) {
  await page.evaluate((ms) => {
    const r = (window as any).game.renderer;
    r._render ??= r.render;
    if (ms === null) r.render = r._render;
    else
      r.render = (w: unknown, dt: number) => {
        if (ms < 0) return;
        const t = performance.now();
        while (performance.now() - t < ms);
        r._render.call(r, w, dt);
      };
  }, ms);
}

/**
 * Makes every frame take at least `ms` longer outside the game's own work, as painting on a phone's GPU does, or
 * stops with null. The game's script time stays as it was, so only the time between frames shows it.
 */
async function elsewhereCost(page: Page, ms: number | null) {
  await page.evaluate((ms) => {
    const g = window as any;
    g._elsewhere = ms;
    if (ms === null || g._elsewhereLoop) return;
    g._elsewhereLoop = true;
    const tick = () => {
      if (g._elsewhere === null) {
        g._elsewhereLoop = false;
        return;
      }
      const t = performance.now();
      while (performance.now() - t < g._elsewhere);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, ms);
}

const ratio = (page: Page) => page.evaluate(() => (window as any).game.renderer.pixelRatio as number);

test('slow frames lower the canvas resolution, quick ones raise it again', async ({ page, isMobile }, info) => {
  test.skip(!isMobile, 'a desktop at pixel ratio 1 has nothing to step down to');
  test.setTimeout(120_000);
  await page.goto('/?autostart&class=reaver&seed=3');
  await page.waitForFunction(() => !!(window as any).game);
  const canvas = page.locator('canvas.view');
  const vp = page.viewportSize()!;
  const css = () => canvas.evaluate((c: HTMLCanvasElement) => [c.style.width, c.style.height, c.width, c.height]);

  // Start from full resolution, whatever the test machine's speed did before.
  await drawCost(page, -1);
  await expect.poll(() => ratio(page), { timeout: 40_000 }).toBe(2);
  await drawCost(page, null);
  expect(await css()).toEqual([`${vp.width}px`, `${vp.height}px`, vp.width * 2, vp.height * 2]);

  await drawCost(page, 25);
  await expect.poll(() => ratio(page), { timeout: 10_000 }).toBe(1.5);
  // Fewer pixels behind the same CSS size.
  expect(await css()).toEqual([`${vp.width}px`, `${vp.height}px`, Math.floor(vp.width * 1.5), Math.floor(vp.height * 1.5)]);
  await drawCost(page, null);
  await page.screenshot({ path: `test-results/${info.project.name}-resolution-low.png` });

  // Sharper again, though not as soon: it was sharper only a moment before it turned out too slow.
  await drawCost(page, -1);
  await expect.poll(() => ratio(page), { timeout: 25_000 }).toBe(2);
  await drawCost(page, null);
  expect(await css()).toEqual([`${vp.width}px`, `${vp.height}px`, vp.width * 2, vp.height * 2]);
});

test("frames that come late lower the resolution even when the game's own work is quick", async ({ page, isMobile }) => {
  test.skip(!isMobile, 'a desktop at pixel ratio 1 has nothing to step down to');
  test.setTimeout(120_000);
  await page.goto('/?autostart&class=reaver&seed=3');
  await page.waitForFunction(() => !!(window as any).game);

  await drawCost(page, -1);
  await expect.poll(() => ratio(page), { timeout: 40_000 }).toBe(2);
  await drawCost(page, null);

  // 30 ms a frame spent where the game's timer can't see it: about 30 frames a second.
  await elsewhereCost(page, 30);
  await expect.poll(() => ratio(page), { timeout: 10_000 }).toBeLessThan(2);
  expect(await page.evaluate(() => (window as any).game.workMs as number)).toBeLessThan(14);
  await elsewhereCost(page, null);
});

test('?dpr holds the resolution and ?fps shows frame timing', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'a desktop is at pixel ratio 1 already');
  test.setTimeout(60_000);
  await page.goto('/?autostart&class=reaver&seed=3&fps&dpr=1');
  await page.waitForFunction(() => !!(window as any).game);
  await expect(page.locator('.fps')).toContainText(/\d+ fps/);
  await expect(page.locator('.fps')).toContainText('dpr 1 ');

  // Quick frames would raise it after a few seconds if it weren't held.
  await drawCost(page, -1);
  await page.waitForTimeout(8_000);
  expect(await ratio(page)).toBe(1);
  await drawCost(page, null);
});
