import { describe, expect, it } from 'vitest';
import { CLASSES, computeStats, createCharacter, learnSkill, skillLevel, slotsFor } from '../src/game/character';
import { baseOf, describeMods, isTreeStat, makeItem, SETS, treeOf, type ClassId, type Item } from '../src/game/items';
import { classSkills } from '../src/game/skills';
import { branchInfo, branchOfSkill, SKILL_TREES } from '../src/game/skilltree';
import { itemTooltip } from '../src/ui/tooltip';
import { makeWorld } from './helpers';

const IDS = Object.keys(CLASSES) as ClassId[];
const classSets = (c: ClassId) => SETS.filter((s) => s.classId === c);
/** The branch a set's full bonus raises, if it raises one. */
const branchOf = (s: (typeof SETS)[number]) => {
  const md = Object.values(s.bonuses).flat().find((m) => isTreeStat(m.stat));
  return md && isTreeStat(md.stat) ? treeOf(md.stat) : undefined;
};

/** A hero of this class with every skill learned and one set fully worn. */
function wearing(c: ClassId, setId: string) {
  const ch = createCharacter('T', c);
  ch.level = 40;
  ch.skillPoints = 60;
  for (let pass = 0; pass < 6; pass++) for (const s of classSkills(c)) learnSkill(ch, s.id);
  const set = SETS.find((s) => s.id === setId)!;
  for (const p of set.pieces) {
    const it: Item = { ...makeItem(p.base, 40, 'set'), setId: set.id, uniqueId: p.id, name: p.name, identified: true, mods: p.mods.map((m) => ({ stat: m.stat, value: m.max })) } as Item;
    const slot = slotsFor(it, ch).find((s) => !ch.equipment[s] || s === slotsFor(it, ch)[0])!;
    ch.equipment[slot] = it;
  }
  return ch;
}

describe('a second set for each class', () => {
  it('every class has two sets of its own, on different footings', () => {
    for (const c of IDS) {
      const sets = classSets(c);
      expect(sets.length, c).toBe(2);
      // The first raises every skill of the class; the second leans into one branch of its tree.
      expect(branchOf(sets[0]), c).toBeUndefined();
      const branch = branchOf(sets[1])!;
      expect(branchInfo(branch)?.classId, c).toBe(c);
      expect(SKILL_TREES[c].map((b) => b.id)).toContain(branch);
    }
    expect(new Set(SETS.map((s) => s.id)).size).toBe(SETS.length);
    expect(new Set(SETS.map((s) => s.name)).size).toBe(SETS.length);
    const pieces = SETS.flatMap((s) => s.pieces);
    expect(new Set(pieces.map((p) => p.id)).size).toBe(pieces.length);
    expect(new Set(pieces.map((p) => p.name)).size).toBe(pieces.length);
  });

  it('the new sets are four pieces in four different slots, on gear the class can wear from early on', () => {
    for (const c of IDS) {
      const set = classSets(c)[1];
      expect(set.pieces.length).toBe(4);
      const kinds = set.pieces.map((p) => baseOf(p.base).kind);
      expect(new Set(kinds).size, set.name).toBe(4);
      for (const p of set.pieces) {
        const b = baseOf(p.base);
        expect(b.qlvl, p.name).toBeLessThanOrEqual(13);
        // No piece asks for more Strength than the class starts with plus a few levels' worth.
        expect(b.reqStr ?? 0, p.name).toBeLessThanOrEqual(CLASSES[c].str + 12);
      }
      expect(Object.keys(set.bonuses).map(Number)).toEqual([2, 3, 4]);
    }
  });

  it('worn in full, a branch set raises the skills of its branch by three and no others', () => {
    for (const c of IDS) {
      const set = classSets(c)[1];
      const branch = branchOf(set)!;
      const ch = wearing(c, set.id);
      const bare = createCharacter('B', c);
      bare.level = 40;
      bare.skills = { ...ch.skills };
      for (const s of classSkills(c)) {
        const gain = skillLevel(ch, s.id) - skillLevel(bare, s.id);
        expect(gain, `${set.name}: ${s.id}`).toBe(branchOfSkill(s.id) === branch ? 3 : 0);
      }
      // The class-wide bonus on the character sheet is untouched: this is not +skills to everything.
      expect(computeStats(ch).skillBonus).toBe(0);
    }
  });

  it('three pieces are not enough, and an unlearned skill gains nothing', () => {
    const ch = wearing('hiveborn', 'painted');
    expect(skillLevel(ch, 'mending')).toBe(ch.skills.mending + 3);
    delete ch.equipment.belt;
    expect(skillLevel(ch, 'mending')).toBe(ch.skills.mending);
    const fresh = wearing('hiveborn', 'painted');
    delete fresh.skills.hymn;
    expect(skillLevel(fresh, 'hymn')).toBe(0);
  });

  it('a branch bonus reaches the numbers that depend on the skill', () => {
    // Carapace is a Soldier skill: Faith's set must not move it, and a Soldier bonus must.
    const ch = wearing('hiveborn', 'painted');
    const before = computeStats(ch).clawMax;
    ch.equipment.ring1 = { ...makeItem('ring', 40, 'rare'), identified: true, mods: [{ stat: 'tree_soldier', value: 3 }] } as Item;
    expect(computeStats(ch).clawMax).toBeGreaterThan(before);
    // And in the world: more Workers answer a Congregation three ranks higher.
    const w = makeWorld('hiveborn');
    Object.assign(w.char, { level: 40, skills: { ...ch.skills, congregation: 5 }, equipment: wearing('hiveborn', 'painted').equipment });
    expect(skillLevel(w.char, 'congregation')).toBe(8);
  });

  it('reads properly on the item, and says so when it is for another class', () => {
    expect(describeMods([{ stat: 'tree_faith', value: 3 }])).toEqual(['+3 to Faith Skills']);
    expect(describeMods([{ stat: 'tree_lightning', value: 2 }])).toEqual(['+2 to Storm Skills']);
    const ring = { ...makeItem('ring', 20, 'rare'), identified: true, mods: [{ stat: 'tree_cold', value: 2 }] } as Item;
    expect(itemTooltip(ring, createCharacter('r', 'reaver'))).toContain('+2 to Cold Skills (no effect)');
    expect(itemTooltip(ring, createCharacter('a', 'arcanist'))).not.toContain('(no effect)');
    for (const s of SETS) for (const mods of Object.values(s.bonuses)) expect(describeMods(mods).join(' ')).not.toMatch(/undefined|NaN/);
  });
});
