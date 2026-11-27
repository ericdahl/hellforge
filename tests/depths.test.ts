import { describe, expect, it } from 'vitest';
import { AREA_BY_ID, DIFFICULTY_LEVELS } from '../src/game/areas';
import {
  afflictionCount, AFFLICTIONS, dailyBetter, dailyDay, DEPTH_BASE_LEVEL, DEPTH_BOSSES, depthCinders, depthDef, depthFortune, depthId, depthOf,
  depthStarts, DEPTHS_TOWN, isBossDepth, isDepthId,
} from '../src/game/depths';
import { floodDistances, idx } from '../src/game/map';
import { MONSTERS } from '../src/game/monsters';
import { Rng } from '../src/game/rng';
import { elemDamage, type World } from '../src/game/world';
import { makeWorld, run } from './helpers';

/** A hero strong enough to stand in the Underforge, with it open. */
function deepWorld(seed = 1234) {
  const w = makeWorld('reaver', seed);
  w.char.level = 45;
  w.setQuest('rekindle', 'rewarded');
  w.refreshStats();
  w.player.life = w.stats.maxLife;
  w.events.length = 0;
  return w;
}

function slay(w: World, m = w.wardenAlive()!) {
  w.player.invuln = 999;
  m.shield = 0;
  w.damageMonster(m, elemDamage('phys', m.maxLife * 50));
  return m;
}

const downStairs = (w: World) => w.area.level.exits.findIndex((e) => e.kind === 'down');

describe('underforge floors', () => {
  it('ids round-trip and are told apart from the fixed areas', () => {
    expect(depthOf(depthId(17))).toBe(17);
    expect(isDepthId(depthId(1))).toBe(true);
    expect(isDepthId('hellforge_heart')).toBe(false);
    expect(depthOf('town')).toBe(0);
  });

  it('rolls the same floor from the same seed, and different floors from different ones', () => {
    const a = depthDef(7, new Rng(5));
    expect(depthDef(7, new Rng(5))).toEqual(a);
    const looks = new Set(Array.from({ length: 30 }, (_, i) => depthDef(7, new Rng(i + 1)).spec.theme));
    expect(looks.size).toBeGreaterThan(4);
  });

  it('gets one level harder a floor, thicker with packs, and richer', () => {
    for (let d = 1; d < 60; d++) {
      const def = depthDef(d, new Rng(d));
      expect(def.alvl).toBe(DEPTH_BASE_LEVEL + d);
      expect(def.depth).toBe(d);
      expect(def.act).toBe(3);
      for (const id of def.monsters) expect(MONSTERS[id], id).toBeTruthy();
      expect(def.spec.links[0].to).toBe(DEPTHS_TOWN);
      expect(def.spec.links[1].to).toBe(depthId(d + 1));
      expect(depthFortune(d + 1)).toBeGreaterThanOrEqual(depthFortune(d));
      expect(depthDef(d + 1, new Rng(d)).packs).toBeGreaterThanOrEqual(def.packs);
    }
    expect(depthDef(1, new Rng(1)).alvl).toBeGreaterThan(AREA_BY_ID.hellforge_heart.alvl);
    expect(depthFortune(1000)).toBe(300);
  });

  it('carries no afflictions at first, then up to three', () => {
    expect([1, 2, 3, 9, 10, 20, 500].map(afflictionCount)).toEqual([0, 0, 1, 1, 2, 3, 3]);
    for (const d of [3, 12, 40]) {
      const af = depthDef(d, new Rng(d)).afflictions!;
      expect(af.length).toBe(afflictionCount(d));
      expect(new Set(af).size).toBe(af.length);
      for (const m of af) expect(AFFLICTIONS).toContain(m);
    }
  });

  it('gives every fifth floor to a boss, in turn', () => {
    expect([4, 5, 6, 10].map(isBossDepth)).toEqual([false, true, false, true]);
    expect(depthDef(4, new Rng(1)).superUnique).toBeUndefined();
    const bosses = DEPTH_BOSSES.map((_, i) => depthDef((i + 1) * 5, new Rng(i)).superUnique);
    expect(bosses).toEqual(DEPTH_BOSSES);
    expect(depthDef((DEPTH_BOSSES.length + 1) * 5, new Rng(1)).superUnique).toBe(DEPTH_BOSSES[0]);
    for (const id of DEPTH_BOSSES) expect(MONSTERS[id].ai).toBe('boss');
    expect(depthCinders(5)).toBeGreaterThan(depthCinders(6));
  });

  it('opens a new starting floor below each boss floor cleared', () => {
    expect(depthStarts(0)).toEqual([1]);
    expect(depthStarts(4)).toEqual([1]);
    expect(depthStarts(5)).toEqual([1, 6]);
    expect(depthStarts(13)).toEqual([1, 6, 11]);
  });
});

describe('descending', () => {
  it('is closed until the ember is home on this difficulty', () => {
    const w = makeWorld();
    expect(w.depthsOpen).toBe(false);
    expect(w.depthStartList()).toEqual([]);
    expect(w.descend(1)).toBe(false);
    expect(w.area.def.id).toBe('town');
    w.setQuest('rekindle', 'done');
    expect(w.depthStartList()).toEqual([1]);
    // Nightmare has its own road to walk first.
    w.char.difficulty = 1;
    expect(w.depthsOpen).toBe(false);
  });

  it('puts the hero on a walkable floor with a warden by the stairs and a way down that can be reached', () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const w = deepWorld(seed);
      expect(w.descend(1)).toBe(true);
      expect(w.depth).toBe(1);
      expect(w.act).toBe(3);
      expect(w.homeTown).toBe(DEPTHS_TOWN);
      const l = w.area.level;
      const dist = floodDistances(l, Math.floor(w.player.x), Math.floor(w.player.y));
      const stairs = l.exits[downStairs(w)];
      expect(dist[idx(l, stairs.x, stairs.y)], `seed ${seed}`).toBeGreaterThan(0);
      const warden = w.wardenAlive()!;
      expect(warden.rarity).toBe('unique');
      expect(dist[idx(l, Math.floor(warden.x), Math.floor(warden.y))], `seed ${seed}`).toBeGreaterThan(0);
      expect(Math.hypot(warden.x - stairs.x, warden.y - stairs.y)).toBeLessThan(14);
      expect(w.area.monsters.length).toBeGreaterThan(20);
      expect(w.area.monsters.every((m) => m.level >= DEPTH_BASE_LEVEL + 1)).toBe(true);
    }
  });

  it('seals the stairs until the warden is dead', () => {
    const w = deepWorld();
    w.descend(1);
    const stairs = downStairs(w);
    const e = w.area.level.exits[stairs];
    w.player.x = e.x + 0.5;
    w.player.y = e.y + 0.5;
    w.player.invuln = 999;
    expect(w.interactLabel({ kind: 'exit', index: stairs })).toBe('Sealed Stairs');
    w.cmdInteract({ kind: 'exit', index: stairs });
    run(w, 0.5);
    expect(w.depth).toBe(1);
    expect(w.events.some((ev) => ev.type === 'msg' && ev.text.includes('sealed'))).toBe(true);

    const cinders = w.char.forge.cinders;
    slay(w);
    expect(w.char.forge.cinders).toBe(cinders + depthCinders(1));
    expect(w.char.deepest).toEqual([1]);
    expect(w.interactLabel({ kind: 'exit', index: stairs })).toBe('Descend to Depth 2');
    w.player.x = e.x + 0.5;
    w.player.y = e.y + 0.5;
    w.cmdInteract({ kind: 'exit', index: stairs });
    run(w, 0.5);
    expect(w.depth).toBe(2);
    expect(w.wardenAlive()).toBeTruthy();
    // The floor above is let go.
    expect(w.areas.has(depthId(1))).toBe(false);
  });

  it('keeps a record per difficulty and only moves it forward', () => {
    const w = deepWorld();
    w.descend(1);
    slay(w);
    w.enterArea(depthId(2), 'exit', depthId(1));
    slay(w);
    expect(w.deepest).toBe(2);
    w.descend(1);
    slay(w);
    expect(w.deepest).toBe(2);
    w.char.difficulty = 1;
    expect(w.deepest).toBe(0);
  });

  it('a new descent rolls new floors, and a fixed seed rolls the same ones', () => {
    const a = deepWorld(42);
    const b = deepWorld(42);
    a.descend(1);
    b.descend(1);
    expect(b.area.def).toEqual(a.area.def);
    expect(Array.from(b.area.level.tiles)).toEqual(Array.from(a.area.level.tiles));
    const first = a.area;
    a.descend(1);
    expect(a.area).not.toBe(first);
    const again = Array.from({ length: 6 }, () => (a.descend(1), a.area.def.spec.theme + a.area.level.w));
    expect(new Set([first.def.spec.theme + first.level.w, ...again]).size).toBeGreaterThan(1);
  });

  it('boss floors are held by a boss, and clearing one opens the floor below as a start', () => {
    const w = deepWorld();
    w.char.deepest = [4];
    w.descend(1);
    w.enterArea(depthId(5), 'exit', depthId(4));
    const boss = w.wardenAlive()!;
    expect(boss.rarity).toBe('boss');
    expect(boss.superId).toBe(DEPTH_BOSSES[0]);
    expect(boss.name).toContain('Risen');
    expect(boss.level).toBe(DEPTH_BASE_LEVEL + 5 + 2);
    slay(w, boss);
    expect(w.depthStartList()).toEqual([1, 6]);
    expect(w.descend(6)).toBe(true);
    expect(w.depth).toBe(6);
    expect(w.descend(11)).toBe(false);
  });

  it('puts the floor’s afflictions on everything that lives there', () => {
    const w = deepWorld();
    w.char.deepest = [10];
    w.descend(11);
    const af = w.area.def.afflictions!;
    expect(af.length).toBe(2);
    for (const m of w.area.monsters) if (!m.def.thief) for (const a of af) expect(m.mods, m.name).toContain(a);
    // Servants are not of the floor.
    const nec = makeWorld('necromancer');
    nec.setQuest('rekindle', 'done');
    nec.char.deepest = [10];
    nec.descend(11);
    const mi = (nec as unknown as { raiseMinion(k: string, x: number, y: number, pr: object): { mods: string[] } }).raiseMinion('skeleton', nec.player.x, nec.player.y, {});
    expect(mi.mods).toEqual([]);
  });

  it('scales with difficulty', () => {
    const w = deepWorld();
    w.char.difficulty = 2;
    w.setQuest('rekindle', 'done');
    w.descend(1);
    expect(w.wardenAlive()!.level).toBe(DEPTH_BASE_LEVEL + 1 + DIFFICULTY_LEVELS[2] + 1);
  });

  it('a town portal leads back to the floor, and climbing out ends in Emberwatch Ruins', () => {
    const w = deepWorld();
    w.descend(1);
    w.player.invuln = 999;
    expect(w.castTownPortal()).toBe(true);
    w.cmdInteract({ kind: 'portal' });
    run(w, 2);
    expect(w.area.def.id).toBe(DEPTHS_TOWN);
    expect(w.interactLabel({ kind: 'portal' })).toBe('Town Portal (The Underforge: Depth 1)');
    w.cmdInteract({ kind: 'portal' });
    run(w, 3);
    expect(w.depth).toBe(1);
    const up = w.area.level.exits.findIndex((e) => e.kind === 'up');
    const e = w.area.level.exits[up];
    w.player.x = e.x + 0.5;
    w.player.y = e.y + 0.5;
    w.cmdInteract({ kind: 'exit', index: up });
    run(w, 0.5);
    expect(w.area.def.id).toBe(DEPTHS_TOWN);
  });

  it('a softcore death wakes the hero in Emberwatch Ruins', () => {
    const w = deepWorld();
    w.descend(1);
    w.player.invuln = 0;
    w.damagePlayer(elemDamage('fire', 1e9), { level: 99 });
    expect(w.player.dead).toBe(true);
    w.respawn();
    expect(w.area.def.id).toBe(DEPTHS_TOWN);
  });

  it('every kind of floor can be stood on and fought in without the world tripping over it', () => {
    const seen = new Set<string>();
    for (let seed = 1; seed <= 24; seed++) {
      const w = deepWorld(seed);
      w.char.deepest = [10];
      w.descend(seed % 2 ? 6 : 11);
      seen.add(w.area.def.spec.theme);
      const m = w.area.monsters.find((x) => !x.dead && !x.warden)!;
      w.player.x = m.x;
      w.player.y = m.y;
      w.player.invuln = 999;
      run(w, 12, () => {
        const t = w.autoTarget(8);
        if (t && !w.player.action) w.cmdSkill('attack', t.x, t.y, t.id);
      });
      expect(w.area.monsters.some((x) => x.alert), `seed ${seed}`).toBe(true);
      expect(Number.isFinite(w.player.x + w.player.y + w.player.life)).toBe(true);
    }
    expect(seen.size).toBeGreaterThan(5);
  });
});

describe('the Daily Descent', () => {
  const DAY = 20261118;

  /** What makes a floor that floor: its roll, its layout, and who stands where. */
  const floor = (w: World, d: number, withMods = true) => {
    const a = w.getArea(depthId(d));
    return {
      def: a.def,
      tiles: Array.from(a.level.tiles),
      objects: a.objects.map((o) => [o.kind, o.x, o.y, o.shrine]),
      monsters: a.monsters.map((m) => [m.def.id, m.rarity, m.x, m.y, m.name, m.warden ?? false, withMods ? m.mods : null]),
    };
  };

  it('is seeded by the local calendar date', () => {
    expect(dailyDay(new Date(2026, 10, 18, 23, 59))).toBe(DAY);
    expect(dailyDay(new Date(2027, 0, 2, 0, 1))).toBe(20270102);
  });

  it('gives two different heroes in two different worlds the same floors on the same day', () => {
    const a = deepWorld(1234);
    const b = makeWorld('hunter', 777);
    b.char.level = 60;
    b.setQuest('rekindle', 'rewarded');
    b.char.deepest = [25];
    // Whatever else the second hero has done today does not move the daily floors.
    b.descend(1);
    run(b, 3);
    for (let i = 0; i < 50; i++) b.rng.next();
    b.enterArea(DEPTHS_TOWN, 'start');
    expect(a.descendDaily(DAY)).toBe(true);
    expect(b.descendDaily(DAY)).toBe(true);
    expect(floor(b, 1)).toEqual(floor(a, 1));
    for (const d of [3, 5, 12]) expect(floor(b, d), `floor ${d}`).toEqual(floor(a, d));
  });

  it('gives a hero on another difficulty the same layouts, monsters, afflictions and bosses', () => {
    const a = deepWorld(1);
    const b = deepWorld(2);
    b.char.difficulty = 2;
    b.setQuest('rekindle', 'rewarded');
    a.descendDaily(DAY);
    b.descendDaily(DAY);
    for (const d of [1, 4, 10, 17]) expect(floor(b, d, false), `floor ${d}`).toEqual(floor(a, d, false));
  });

  it('rolls different floors on different days', () => {
    const a = deepWorld();
    const b = deepWorld();
    a.descendDaily(DAY);
    b.descendDaily(DAY + 1);
    const same = [1, 2, 3, 4, 5].filter((d) => JSON.stringify(floor(a, d)) === JSON.stringify(floor(b, d)));
    expect(same).toEqual([]);
  });

  it('starts at the first floor, leaves the hero\'s own descent alone, and keeps a record of how it went', () => {
    const w = deepWorld();
    w.char.deepest = [10];
    w.descendDaily(DAY);
    expect(w.depth).toBe(1);
    slay(w);
    expect(w.char.deepest).toEqual([10]);
    expect(w.descend(1)).toBe(false);
    w.enterArea(depthId(2), 'exit', depthId(1));
    run(w, 1);
    expect(w.depth).toBe(2);
    expect(w.char.daily.run!.floor).toBe(2);
    expect(w.char.daily.run!.time).toBeGreaterThan(0);
    w.player.invuln = 0;
    w.damagePlayer(elemDamage('fire', 1e9), { level: 99 });
    w.respawn();
    expect(w.char.daily.run!.deaths).toBe(1);
    // Back down at the deepest floor reached.
    w.descendDaily(DAY);
    expect(w.depth).toBe(2);
    const res = w.endDaily()!;
    expect(w.area.def.id).toBe(DEPTHS_TOWN);
    expect(res).toMatchObject({ day: DAY, official: true, floor: 2, deaths: 1, level: 45, difficulty: 0 });
    expect(w.char.daily.run).toBeUndefined();
    expect(w.char.daily.best).toEqual(res);
    expect(w.events).toContainEqual({ type: 'open', panel: 'daily' });
    expect(w.descend(1)).toBe(true);
    expect(w.char.deepest).toEqual([10]);
  });

  it('counts only the first run each day', () => {
    const w = deepWorld();
    w.descendDaily(DAY);
    w.endDaily();
    const best = w.char.daily.best!;
    w.descendDaily(DAY);
    expect(w.char.daily.run!.official).toBe(false);
    w.enterArea(depthId(2), 'exit', depthId(1));
    expect(w.endDaily()!.floor).toBe(2);
    expect(w.char.daily.best).toBe(best);
    w.descendDaily(DAY + 1);
    expect(w.char.daily.run!.official).toBe(true);
  });

  it('asks whether to end the run when the hero comes up to town', () => {
    const w = deepWorld();
    w.descendDaily(DAY);
    w.player.invuln = 999;
    w.castTownPortal();
    w.events.length = 0;
    w.cmdInteract({ kind: 'portal' });
    run(w, 2);
    expect(w.area.def.id).toBe(DEPTHS_TOWN);
    expect(w.events).toContainEqual({ type: 'open', panel: 'daily' });
    expect(w.char.daily.run).toBeTruthy();
    w.cmdInteract({ kind: 'portal' });
    run(w, 3);
    expect(w.depth).toBe(1);
  });

  it('ends with a Hardcore death', () => {
    const w = deepWorld();
    w.char.hardcore = true;
    w.descendDaily(DAY);
    w.player.invuln = 0;
    w.events.length = 0;
    w.damagePlayer(elemDamage('fire', 1e9), { level: 99 });
    const death = w.events.find((e) => e.type === 'death');
    expect(death).toMatchObject({ daily: { floor: 1, deaths: 1, official: true } });
    expect(w.char.daily.run).toBeUndefined();
    expect(w.char.daily.best?.floor).toBe(1);
  });

  it('ranks results deeper first, then faster, then with fewer deaths', () => {
    const r = { day: DAY, official: true, floor: 5, time: 100, deaths: 2, level: 50, difficulty: 2 };
    expect(dailyBetter(r)).toBe(true);
    expect(dailyBetter({ ...r, floor: 6, time: 900 }, r)).toBe(true);
    expect(dailyBetter({ ...r, time: 90 }, r)).toBe(true);
    expect(dailyBetter({ ...r, deaths: 1 }, r)).toBe(true);
    expect(dailyBetter(r, r)).toBe(false);
  });
});
