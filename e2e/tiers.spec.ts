import { expect, test, type Page } from '@playwright/test';

const world = (page: Page, fn: string) => page.evaluate(`(() => { const w = window.game.world; const c = w.char; return ${fn}; })()`);

test('reforging a unique at the forge moves it up a tier and grows it', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('/?autostart&seed=5&class=reaver');
  await page.waitForFunction(() => !!(window as any).game);
  // A hero who has reached Hell with Grandmaster mastery, carrying Cinderstep and one of each tier of sword.
  await world(page, `(c.gold = 1e7, c.maxDifficulty = 2, c.level = 60, c.forge.xp = 700, c.forge.cinders = 5000, c.forge.essences = { fire: 20, cold: 20, light: 20, poison: 20 },
    c.inventory.push({ item: { uid: 9300, base: 'boots', rarity: 'unique', uniqueId: 'cinderstep', name: 'Cinderstep', ilvl: 10, identified: true, def: 3, reqLvl: 4,
      mods: [{ stat: 'frw', value: 20 }, { stat: 'fireRes', value: 25 }, { stat: 'defPct', value: 50 }, { stat: 'dex', value: 5 }], sockets: 0, gems: [] }, x: 0, y: 0 }),
    ['long_sword', 'long_sword_x', 'long_sword_e'].forEach((b, i) => c.inventory.push({ item: { uid: 9310 + i, base: b, rarity: 'normal', ilvl: 70, identified: true, mods: [], sockets: 0, gems: [], reqLvl: 1 }, x: 2 + i, y: 0 })))`);
  await world(page, "w.cmdInteract({ kind: 'forge' })");
  await expect(page.locator('.panel.forge')).toBeVisible({ timeout: 15000 });
  await page.screenshot({ path: `test-results/${info.project.name}-tiers-forge.png` });

  await page.locator('.grid .itm').first().click();
  const reforge = page.getByRole('button', { name: /^Reforge/ });
  await expect(reforge).toContainText('Becomes Emberforged');
  await reforge.click();
  await page.getByRole('button', { name: /Reforge it\?/ }).click();
  await expect(page.locator('.forge-result')).toContainText('Reforged Cinderstep: now Emberforged Boots');
  expect(await world(page, 'c.inventory.find((e) => e.item.uid === 9300).item.base')).toBe('boots_x');
  expect(await world(page, "c.inventory.find((e) => e.item.uid === 9300).item.mods.find((m) => m.stat === 'dex').value")).toBe(10);
  await expect(page.locator('.panel.forge')).toContainText('Exceptional');
  await page.screenshot({ path: `test-results/${info.project.name}-tiers-reforged.png` });
  expect(errors).toEqual([]);
});
