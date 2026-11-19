import { expect, test } from '@playwright/test';

// The Daily Descent: today's floors from the waypoint, ended through a town portal, with a card to copy.
test('the Daily Descent runs from the waypoint and ends with a result card', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.clock.setFixedTime(new Date(2026, 10, 18, 20, 0));
  await page.goto('/?autostart&seed=21&class=huntress');
  await page.waitForFunction(() => !!(window as any).game);
  const openWaypoint = () => page.evaluate(() => {
    const g = (window as any).game;
    g.world.enterArea('emberwatch_ruins', 'start');
    g.world.cmdInteract({ kind: 'waypoint' });
  });

  await page.evaluate(() => {
    const w = (window as any).game.world;
    w.char.level = 45;
    w.setQuest('forge', 'rewarded');
    w.setQuest('hollow_sun', 'rewarded');
    w.setQuest('rekindle', 'rewarded');
    w.char.deepest = [7];
    w.refreshStats();
  });
  await openWaypoint();
  const daily = page.locator('.btn.wp.daily');
  await expect(daily).toContainText('Daily Descent · Nov 18', { timeout: 15000 });
  await expect(page.locator('.daily-say')).toContainText('No best yet');
  await daily.scrollIntoViewIfNeeded();
  await page.screenshot({ path: `test-results/${info.project.name}-daily-waypoint.png` });
  await daily.click();

  // Always from the top, whatever the hero's own record.
  await expect.poll(() => page.evaluate(() => (window as any).game.world.depth)).toBe(1);
  await expect(page.locator('.hud .area-name')).toHaveText('The Underforge: Depth 1 · stairs sealed');
  await page.evaluate(() => {
    const w = (window as any).game.world;
    w.player.invuln = 999;
    const m = w.wardenAlive();
    w.damageMonster(m, { phys: m.maxLife * 50, fire: 0, cold: 0, light: 0, poison: 0 });
    w.enterArea('depth:2', 'exit', 'depth:1');
    w.player.invuln = 999;
    w.castTownPortal();
    w.cmdInteract({ kind: 'portal' });
  });

  // Through the portal: end it, or keep going.
  await expect(page.locator('.panel.daily')).toContainText('Floor 2', { timeout: 15000 });
  await page.screenshot({ path: `test-results/${info.project.name}-daily-ask.png` });
  await page.locator('.panel.daily .daily-end').click();

  const card = page.locator('.daily-card');
  await expect(card).toBeVisible();
  await expect(page.locator('.daily-text')).toHaveValue(/^Hellforge Daily · Nov 18 · Huntress lvl 45 · Normal · Floor 2 · \d+:\d\d · 0 deaths$/);
  await page.locator('.daily-copy').click();
  await expect(page.locator('.daily-status')).toHaveText(/Copied|Selected/);
  await page.screenshot({ path: `test-results/${info.project.name}-daily-card.png` });
  expect(await page.evaluate(() => (window as any).game.world.char.deepest)).toEqual([7]);

  // The best is kept on the hero and shown at the waypoint; another run today does not count.
  await page.evaluate(() => (window as any).game.close());
  await openWaypoint();
  await expect(page.locator('.daily-say')).toContainText('Your best: Floor 2');
  await expect(daily).toContainText('unofficial');
  await page.screenshot({ path: `test-results/${info.project.name}-daily-best.png` });
  expect(errors).toEqual([]);
});
