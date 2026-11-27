import { expect, test } from '@playwright/test';

// The Huntress's Archery, Arcane and Venom trees, and what her new skills look like in a fight.
test('a Huntress shows her three branches and fights with venom, arcane and a marked quarry', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/?autostart&seed=7&class=huntress');
  await page.waitForFunction(() => !!(window as any).game);
  await page.evaluate(() => {
    const g = (window as any).game;
    const c = g.world.char;
    c.level = 30;
    c.skills = { power_shot: 1, critical_eye: 3, quarry: 4, toxin_coating: 6, venom_cloud: 5, corrode: 2, arcane_arrow: 3, phase_step: 2, drawn_shot: 2, arcane_ruin: 1 };
    c.skillPoints = 2;
    c.hotbar = ['attack', 'venom_cloud', 'arcane_arrow', 'arcane_ruin'];
    g.world.refreshStats();
    g.open('skills');
  });
  await expect(page.locator('.tree-branch')).toHaveText(['Archery', 'Arcane', 'Venom']);
  await expect(page.locator('.tnode')).toHaveCount(13);
  await page.screenshot({ path: `test-results/${info.project.name}-huntress-tree.png` });

  // Into the fields, with a champion pack to shoot at.
  await page.evaluate(() => {
    const g = (window as any).game;
    g.close();
    const w = g.world;
    w.enterArea('cinder_fields', 'start');
    w.player.invuln = 999;
    const p = w.player;
    const m = w.spawnMonster(w.area, 'ghoul', p.x + 3, p.y + 0.5, 'champion', { level: 20 });
    m.alert = true;
    for (let i = 0; i < 4; i++) w.spawnMonster(w.area, 'ghoul', p.x + 4 + (i % 2), p.y - 1 + i * 0.7, 'normal', { level: 20 }).alert = true;
    w.player.mana = 999;
  });
  await page.waitForTimeout(400);
  const fight = async (skill: string) => page.evaluate((s) => {
    const w = (window as any).game.world;
    const p = w.player;
    const m = w.area.monsters.filter((x: any) => !x.dead).sort((a: any, b: any) => Math.hypot(a.x - p.x, a.y - p.y) - Math.hypot(b.x - p.x, b.y - p.y))[0];
    w.player.mana = 999;
    if (m) w.cmdSkill(s, m.x, m.y, m.id);
  }, skill);
  await fight('venom_cloud');
  await page.waitForTimeout(700);
  await fight('arcane_arrow');
  await page.waitForTimeout(500);
  const state = await page.evaluate(() => {
    const w = (window as any).game.world;
    return { quarry: w.quarryId, clouds: w.area.hazards.filter((h: any) => h.poisonDps).length, poisoned: w.area.monsters.filter((m: any) => m.poison.t > 0).length };
  });
  expect(state.quarry).toBeGreaterThan(-1);
  expect(state.clouds).toBe(1);
  expect(state.poisoned).toBeGreaterThan(0);
  await page.screenshot({ path: `test-results/${info.project.name}-huntress-venom.png` });
  await fight('arcane_ruin');
  await page.waitForTimeout(250);
  await page.screenshot({ path: `test-results/${info.project.name}-huntress-ruin.png` });
  expect(errors).toEqual([]);
});
