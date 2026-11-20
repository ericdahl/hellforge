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

  await drawCost(page, -1);
  await expect.poll(() => ratio(page), { timeout: 15_000 }).toBe(2);
  await drawCost(page, null);
  expect(await css()).toEqual([`${vp.width}px`, `${vp.height}px`, vp.width * 2, vp.height * 2]);
});
