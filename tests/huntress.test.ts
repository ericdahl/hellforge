import { describe, expect, it } from 'vitest';
import { createCharacter, migrateCharacter, SAVE_VERSION, type Character } from '../src/game/character';
import { addPoison, arcaneResists, POISON_TIME } from '../src/game/combat';
import { SETS } from '../src/game/items';
import { classSkills, SKILL_BY_ID } from '../src/game/skills';
import { SKILL_TREES } from '../src/game/skilltree';
import { elemDamage, type Monster, type World } from '../src/game/world';
import { makeWorld, run } from './helpers';

/** A level-30 Huntress in open ground with one monster `dist` tiles east that cannot move or die. */
function arena(skills: Record<string, number> = {}, defId = 'ghoul', dist = 4) {
  const w = makeWorld('huntress');
  const c = w.char;
  c.level = 30;
  c.alloc.dex = 80;
  Object.assign(c.skills, skills);
  w.enterArea('cinder_fields', 'start');
  w.area.monsters.length = 0;
  w.area.purged = true;
  const l = w.area.level;
  const open = (x: number, y: number) => l.tiles[Math.floor(y) * l.w + Math.floor(x)] === 1;
  find: for (let y = 6; y < l.h - 6; y++) for (let x = 6; x < l.w - 16; x++) {
    let ok = true;
    for (let dx = -4; dx <= 13 && ok; dx++) for (let dy = -3; dy <= 3 && ok; dy++) ok = open(x + dx, y + dy);
    if (ok) {
      w.player.x = x + 0.5;
      w.player.y = y + 0.5;
      break find;
    }
  }
  w.refreshStats();
  w.player.life = w.stats.maxLife;
  w.player.invuln = 999;
  const m = spawn(w, defId, dist, 0);
  return { w, m };
}

function spawn(w: World, defId: string, dx: number, dy: number, rarity: 'normal' | 'champion' = 'normal'): Monster {
  const m = w.spawnMonster(w.area, defId, w.player.x + dx, w.player.y + dy, rarity, { level: 30 });
  m.speed = 0;
  m.life = m.maxLife = 1e7;
  m.alert = true;
  m.def_ = 0;
  return m;
}

/** Shoots `skill` at `m` for a while and returns the damage it took. */
function shoot(w: World, m: Monster, skill: string, seconds = 4) {
  const before = m.life;
  run(w, seconds, () => {
    if (!w.player.action && !w.player.intent) w.cmdSkill(skill, m.x, m.y, m.id);
    w.player.mana = 500;
  });
  return before - m.life;
}

describe('the huntress', () => {
  it('has thirteen skills in Archery, Arcane and Venom, and none of the old arrows', () => {
    expect(SKILL_TREES.huntress.map((b) => b.name)).toEqual(['Archery', 'Arcane', 'Venom']);
    const skills = classSkills('huntress');
    expect(skills.length).toBe(13);
    for (const gone of ['frost_arrow', 'exploding_arrow', 'storm_arrow', 'evade']) expect(SKILL_BY_ID[gone]).toBeUndefined();
    for (const s of skills) {
      for (const p of s.prereq ?? []) expect(SKILL_BY_ID[p].classId).toBe('huntress');
      for (const y of s.synergies ?? []) expect(SKILL_BY_ID[y.skill].classId).toBe('huntress');
      for (const l of [1, 10, 20, 30]) expect(s.lines(s.params(l)).join(' '), `${s.id} ${l}`).not.toMatch(/undefined|NaN/);
    }
    // Her second set raises a branch she still has.
    const grim = SETS.find((s) => s.id === 'grimhunter')!;
    expect(grim.bonuses[4]!.some((b) => b.stat === 'tree_venom')).toBe(true);
  });

  it('gives an old Huntress every skill point back, and leaves other classes alone', () => {
    const old = (classId: Character['classId'], skills: Record<string, number>) => {
      const c = createCharacter('Old', classId);
      c.version = 4;
      c.level = 20;
      c.skills = skills;
      c.skillPoints = 2;
      c.hotbar = ['attack', ...Object.keys(skills).slice(0, 3)];
      return c;
    };
    const h = old('huntress', { power_shot: 5, frost_arrow: 6, exploding_arrow: 4, evade: 3, multishot: 1 });
    expect(migrateCharacter(h)).toBe(true);
    expect(h.version).toBe(SAVE_VERSION);
    expect(h.skills).toEqual({ power_shot: 1 });
    expect(h.skillPoints).toBe(2 + 19 - 1);
    expect(h.hotbar).toEqual(['attack', 'power_shot', null, null]);
    const r = old('reaver', { bash: 5, frenzy: 3 });
    migrateCharacter(r);
    expect(r.skills).toEqual({ bash: 5, frenzy: 3 });
    expect(r.skillPoints).toBe(2);
  });

  it('arcane ignores a share of resistances, but never makes a weakness worse', () => {
    expect(arcaneResists({ phys: 50, fire: 100, cold: -20, light: 0, poison: 75 }, 50)).toEqual({ phys: 25, fire: 50, cold: -20, light: 0, poison: 37.5 });
    const { w, m } = arena();
    m.res = { phys: 80, fire: 0, cold: 0, light: 0, poison: 0 };
    const plain = m.life;
    w.damageMonster(m, elemDamage('phys', 100), {});
    const arcane = m.life;
    w.damageMonster(m, elemDamage('phys', 100), { arcane: 50 });
    expect(plain - arcane).toBeCloseTo(20);
    expect(arcane - m.life).toBeCloseTo(60);
  });

  it("Arcane Arrow gets through a monster's resistances where Power Shot does not", () => {
    const { w, m } = arena({ arcane_arrow: 10, power_shot: 10 });
    m.res = { phys: 75, fire: 0, cold: 0, light: 0, poison: 0 };
    const ps = shoot(w, m, 'power_shot');
    const aa = shoot(w, m, 'arcane_arrow');
    expect(aa).toBeGreaterThan(ps * 1.5);
  });

  it('Toxin Coating poisons every arrow, and her poison builds up to a limit', () => {
    const { w, m } = arena({ toxin_coating: 5 });
    const pr = SKILL_BY_ID.toxin_coating.params(5);
    const once = pr.max! / POISON_TIME;
    run(w, 0.6, () => !w.player.action && w.cmdSkill('attack', m.x, m.y, m.id));
    expect(m.poison.t).toBeGreaterThan(0);
    shoot(w, m, 'attack', 5);
    expect(m.poison.dps).toBeGreaterThan(once * 1.5);
    expect(m.poison.dps).toBeLessThanOrEqual(once * pr.count! + 1e-6);
  });

  it('poison from anyone else still only replaces a weaker dose', () => {
    const m = { poison: { dps: 0, t: 0 } };
    addPoison(m, 30);
    addPoison(m, 30);
    expect(m.poison.dps).toBeCloseTo(10);
    addPoison(m, 30, 3);
    expect(m.poison.dps).toBeCloseTo(20);
    for (let i = 0; i < 10; i++) addPoison(m, 30, 3);
    expect(m.poison.dps).toBeCloseTo(30);
  });

  it('Venom Cloud leaves a cloud that poisons a pack and gives no warmth', () => {
    const { w, m } = arena({ toxin_coating: 1, venom_cloud: 5 });
    const near = spawn(w, 'ghoul', 4, 1);
    const far = spawn(w, 'ghoul', 4, 6);
    run(w, 1, () => !w.player.action && w.cmdSkill('venom_cloud', m.x, m.y, m.id));
    const cloud = w.area.hazards.find((h) => h.poisonDps);
    expect(cloud).toBeDefined();
    expect(w.warmthAt(cloud!.x, cloud!.y)).toBe(0);
    run(w, 1);
    expect(near.poison.t).toBeGreaterThan(0);
    expect(far.poison.t).toBe(0);
    expect(m.poison.dps).toBeGreaterThan(0);
  });

  it('Drawn Shot turns an arrow into a piercing blast every few seconds', () => {
    const { w, m } = arena({ arcane_arrow: 1, drawn_shot: 1 });
    const behind = spawn(w, 'ghoul', 7, 0);
    run(w, 0.5, () => !w.player.action && w.cmdSkill('attack', m.x, m.y, m.id));
    const wait = SKILL_BY_ID.drawn_shot.params(1).duration!;
    expect(w.player.drawn).toBeGreaterThan(wait - 0.6);
    run(w, 0.5);
    expect(behind.life).toBeLessThan(behind.maxLife);
    // Ordinary arrows in between do not pierce.
    behind.life = behind.maxLife;
    run(w, 1.5, () => !w.player.action && w.cmdSkill('attack', m.x, m.y, m.id));
    run(w, 0.5);
    expect(behind.life).toBe(behind.maxLife);
  });

  it('Quarry marks the strongest champion nearby, ignores the rabble, and hits it harder', () => {
    const { w, m } = arena({ quarry: 5 });
    run(w, 0.3);
    expect(w.quarryId).toBe(-1);
    const champ = spawn(w, 'ghoul', -3, 0, 'champion');
    run(w, 0.3);
    expect(w.quarryId).toBe(champ.id);
    champ.res = m.res = { phys: 0, fire: 0, cold: 0, light: 0, poison: 0 };
    const a = m.life;
    w.damageMonster(m, elemDamage('phys', 100), {});
    const b = champ.life;
    w.damageMonster(champ, elemDamage('phys', 100), {});
    expect(b - champ.life).toBeCloseTo((a - m.life) * (1 + SKILL_BY_ID.quarry.params(5).pct! / 100));
    // The plain attack goes for the quarry first, even when something else is nearer.
    expect(w.autoTarget(11)?.id).toBe(champ.id);
  });

  it('Corrode: poisoned enemies take more from her', () => {
    const { w, m } = arena({ corrode: 5 });
    m.res = { phys: 0, fire: 0, cold: 0, light: 0, poison: 0 };
    const a = m.life;
    w.damageMonster(m, elemDamage('phys', 100), {});
    m.poison = { dps: 1, t: 2 };
    const b = m.life;
    w.damageMonster(m, elemDamage('phys', 100), {});
    expect(b - m.life - 2 / 30).toBeGreaterThan((a - b) * 1.2);
  });

  it('Blight Bloom spreads the poison in a dying monster to its neighbours', () => {
    const { w, m } = arena({ blight_bloom: 5, toxin_coating: 1 });
    const n = spawn(w, 'ghoul', 5, 1);
    n.res.poison = 0;
    m.poison = { dps: 100, t: 3 };
    m.life = 1;
    run(w, 0.1);
    expect(m.dead).toBe(true);
    expect(n.poison.t).toBeGreaterThan(0);
    expect(n.poison.dps).toBeGreaterThan(30);
  });

  it('Phase Step sends the dodge further and bursts where she stood', () => {
    const plain = arena({}, 'ghoul', -1);
    const x0 = plain.w.player.x;
    plain.w.cmdDodge({ x: 1, y: 0 });
    run(plain.w, 0.4);
    const rolled = plain.w.player.x - x0;
    const { w, m } = arena({ phase_step: 5 }, 'ghoul', -1);
    expect(w.stats.evade).toBe(SKILL_BY_ID.phase_step.params(5).pct);
    const x1 = w.player.x;
    w.cmdDodge({ x: 1, y: 0 });
    run(w, 0.4);
    expect(w.player.x - x1).toBeGreaterThan(rolled * 1.25);
    expect(m.life).toBeLessThan(m.maxLife);
  });

  it('Arcane Ruin strikes everything in a line and nothing beside it', () => {
    const { w, m } = arena({ arcane_arrow: 1, drawn_shot: 1, arcane_ruin: 1 }, 'ghoul', 3);
    const further = spawn(w, 'ghoul', 8, 0);
    const aside = spawn(w, 'ghoul', 3, 3);
    w.player.drawn = 99;
    w.player.mana = 500;
    w.cmdSkill('arcane_ruin', m.x, m.y, m.id);
    run(w, 1);
    expect(m.life).toBeLessThan(m.maxLife);
    expect(further.life).toBeLessThan(further.maxLife);
    expect(aside.life).toBe(aside.maxLife);
  });

  it('arcane arrows keep her ember alight in the cold', () => {
    const { w, m } = arena({ arcane_arrow: 5 });
    Object.defineProperty(w, 'cold', { get: () => true });
    w.ember = 0.5;
    shoot(w, m, 'arcane_arrow', 2);
    expect(w.ember).toBeGreaterThan(0.5);
  });
});
