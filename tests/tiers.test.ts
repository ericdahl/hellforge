import { describe, expect, it } from 'vitest';
import { addToInventory, createCharacter, type Character } from '../src/game/character';
import { forgeApply, forgePreview, itemAffixes, MASTERY_RANKS, RECIPE_RANK } from '../src/game/forge';
import {
  AFFIXES, baseInTier, BASES, baseOf, displayName, generateItem, makeItem, rollDrops, rootBase, tierOf, UNIQUE_BY_ID, UNIQUES, type Item,
} from '../src/game/items';
import { Rng } from '../src/game/rng';

const TIERED = BASES.filter((b) => ['weapon', 'shield', 'armor', 'helm', 'gloves', 'boots', 'belt'].includes(b.kind) && !b.tier);

describe('exceptional and elite bases', () => {
  it('every weapon and armor base comes in all three tiers, stronger each time', () => {
    for (const b of TIERED) {
      const x = baseInTier(b, 1)!;
      const e = baseInTier(b, 2)!;
      expect(x.name).toBe(`Emberforged ${b.name}`);
      expect(e.name).toBe(`Hellforged ${b.name}`);
      expect(rootBase(e).id).toBe(b.id);
      if (b.maxDmg) {
        expect(x.maxDmg).toBe(Math.round(b.maxDmg * 2));
        expect(e.maxDmg).toBe(Math.round(b.maxDmg * 3));
      }
      if (b.defMax) expect(e.defMax).toBeGreaterThan(x.defMax!);
      expect(x.qlvl).toBeGreaterThan(35);
      expect(e.qlvl).toBeGreaterThan(x.qlvl);
      expect(e.qlvl).toBeLessThanOrEqual(76);
      expect(e.reqLvl).toBeLessThanOrEqual(60);
      expect(e.w).toBe(b.w);
      expect(e.h).toBe(b.h);
    }
  });

  it('rings, amulets and potions have no tiers', () => {
    expect(baseInTier('ring', 1)).toBeNull();
    expect(baseInTier('hp1', 2)).toBeNull();
  });

  it('the Normal campaign drops exactly what it did before: no tiered bases, affixes or uniques', () => {
    // Area levels in Normal stop at 32, and bosses are two above.
    expect(Math.min(...BASES.filter((b) => b.tier).map((b) => b.qlvl))).toBeGreaterThan(35);
    expect(Math.min(...AFFIXES.filter((a) => a.lvl > 24).map((a) => a.lvl))).toBeGreaterThan(35);
    const rng = new Rng(3);
    for (let i = 0; i < 400; i++) {
      for (const d of rollDrops(rng, 34, 'boss', { mf: 200 })) if (d.kind === 'item') expect(tierOf(d.item)).toBe(0);
    }
  });

  it('Nightmare drops exceptional bases, and Hell elite ones', () => {
    const rng = new Rng(9);
    const tiers = (ilvl: number) => {
      const seen = new Set<number>();
      for (let i = 0; i < 400; i++) seen.add(tierOf(generateItem(rng, ilvl, { kinds: ['weapon', 'armor'] })));
      return seen;
    };
    expect(tiers(48).has(1)).toBe(true);
    expect(tiers(48).has(2)).toBe(false);
    expect(tiers(72).has(2)).toBe(true);
  });

  it('a hero needs the level to wear one', () => {
    const it = generateItem(new Rng(2), 72, { base: 'plate_mail_e', rarity: 'normal' });
    expect(it.reqLvl).toBe(baseOf('plate_mail_e').reqLvl);
    const magic = generateItem(new Rng(2), 72, { base: 'plate_mail_e', rarity: 'magic' });
    expect(magic.reqLvl).toBeGreaterThanOrEqual(baseOf('plate_mail_e').reqLvl!);
  });
});

describe('exceptional and elite uniques', () => {
  const high = UNIQUES.filter((u) => tierOf(u.base) > 0);

  it('sit on tiered bases, with every class getting one of each tier', () => {
    for (const t of [1, 2]) {
      for (const cls of ['reaver', 'arcanist', 'hunter', 'necromancer', 'forgewright', 'hiveborn']) {
        expect(high.some((u) => tierOf(u.base) === t && u.mods.some((md) => md.stat === `skills_${cls}`))).toBe(true);
      }
    }
    for (const u of high) expect(u.qlvl).toBeGreaterThanOrEqual(baseOf(u.base).qlvl);
  });

  it('drop where their base drops, and need no more than the level cap', () => {
    const rng = new Rng(4);
    const found = new Set<string>();
    for (let i = 0; i < 600; i++) {
      const it = generateItem(rng, 74, { rarity: 'unique' });
      expect(it.reqLvl).toBeLessThanOrEqual(60);
      found.add(it.uniqueId!);
    }
    expect(high.filter((u) => tierOf(u.base) === 2).some((u) => found.has(u.id))).toBe(true);
    // Hell leaves the humblest uniques behind.
    expect(found.has('ember_fang')).toBe(false);
  });
});

describe('reforging', () => {
  function hero(maxDifficulty = 2, xp = MASTERY_RANKS[RECIPE_RANK.reforgeElite].xp): Character {
    const c = createCharacter('Smith', 'reaver', false);
    c.gold = 10_000_000;
    c.forge.cinders = 100_000;
    c.forge.essences = { fire: 50, cold: 50, light: 50, poison: 50 };
    c.forge.xp = xp;
    c.maxDifficulty = maxDifficulty;
    return c;
  }
  const give = (c: Character, item: Item) => {
    item.identified = true;
    expect(addToInventory(c, item)).toBe(true);
    return item;
  };
  const cinderstep = () => {
    const it = generateItem(new Rng(1), 10, { rarity: 'unique', base: 'boots' });
    expect(it.uniqueId).toBe('cinderstep');
    return it;
  };

  it('needs Master mastery for Emberforged, Grandmaster for Hellforged', () => {
    const c = hero(2, MASTERY_RANKS[RECIPE_RANK.reforge].xp);
    const it = give(c, makeItem('long_sword'));
    expect(forgePreview(c, { type: 'reforge', uid: it.uid }).error).toBeNull();
    expect(forgeApply(c, new Rng(1), { type: 'reforge', uid: it.uid }).ok).toBe(true);
    expect(it.base).toBe('long_sword_x');
    expect(forgePreview(c, { type: 'reforge', uid: it.uid }).error).toMatch(/Grandmaster/);
  });

  it('needs the difficulty reached, and the item off', () => {
    const c = hero(0);
    const it = give(c, makeItem('long_sword'));
    expect(forgePreview(c, { type: 'reforge', uid: it.uid }).error).toMatch(/Nightmare/);
    c.maxDifficulty = 1;
    const x = give(c, makeItem('long_sword_x'));
    expect(forgePreview(c, { type: 'reforge', uid: x.uid }).error).toMatch(/Hell/);
    const worn = makeItem('cap');
    c.equipment.head = worn;
    worn.identified = true;
    expect(forgePreview(c, { type: 'reforge', uid: worn.uid }).error).toBe('Take it off first');
  });

  it('stops at elite and refuses jewelry', () => {
    const c = hero();
    expect(forgePreview(c, { type: 'reforge', uid: give(c, makeItem('long_sword_e')).uid }).error).toMatch(/Hellforged/);
    expect(forgePreview(c, { type: 'reforge', uid: give(c, makeItem('ring', 10, 'magic')).uid }).error).toMatch(/weapons and armor/);
  });

  it('grows a unique: plain amounts by the tier, percentages by a step, the rest as it was', () => {
    const c = hero();
    const it = give(c, cinderstep());
    const before = Object.fromEntries(it.mods.map((md) => [md.stat, md.value]));
    const def = it.def!;
    forgeApply(c, new Rng(1), { type: 'reforge', uid: it.uid });
    forgeApply(c, new Rng(1), { type: 'reforge', uid: it.uid });
    expect(it.base).toBe('boots_e');
    expect(displayName(it)).toBe('Cinderstep');
    const after = Object.fromEntries(it.mods.map((md) => [md.stat, md.value]));
    expect(after.dex).toBe(before.dex * 3);
    expect(after.defPct).toBe(before.defPct + 80);
    expect(after.frw).toBe(before.frw);
    expect(after.fireRes).toBe(before.fireRes);
    expect(it.def).toBe(def * 3);
    expect(it.reqLvl).toBe(baseOf('boots_e').reqLvl);
  });

  it('tempers a reforged unique within its grown range', () => {
    const c = hero();
    const it = give(c, cinderstep());
    forgeApply(c, new Rng(1), { type: 'reforge', uid: it.uid });
    const dex = itemAffixes(it).findIndex((g) => g.mods[0].stat === 'dex');
    expect(forgePreview(c, { type: 'temper', uid: it.uid, affix: dex }).error).toMatch(/never varies/);
    const ed = itemAffixes(it).findIndex((g) => g.mods[0].stat === 'defPct');
    const r = UNIQUE_BY_ID.cinderstep.mods.find((md) => md.stat === 'defPct')!;
    for (let s = 0; s < 20; s++) {
      forgeApply(c, new Rng(s), { type: 'temper', uid: it.uid, affix: ed });
      const v = it.mods.find((md) => md.stat === 'defPct')!.value;
      expect(v).toBeGreaterThanOrEqual(r.min + 40);
      expect(v).toBeLessThanOrEqual(r.max + 40);
    }
  });

  it('keeps a magic item\'s affixes and renames it after its new base', () => {
    const c = hero();
    const it = give(c, generateItem(new Rng(3), 20, { rarity: 'magic', base: 'long_sword' }));
    const mods = JSON.stringify(it.mods);
    forgeApply(c, new Rng(1), { type: 'reforge', uid: it.uid });
    expect(JSON.stringify(it.mods)).toBe(mods);
    expect(displayName(it)).toContain('Emberforged Long Sword');
    expect(it.ilvl).toBe(baseOf('long_sword_x').qlvl);
  });

  it('costs gold, Cinders and every Essence', () => {
    const c = hero();
    const it = give(c, makeItem('long_sword'));
    const p = forgePreview(c, { type: 'reforge', uid: it.uid });
    expect(p.cost.gold).toBeGreaterThan(0);
    expect(p.cost.cinders).toBeGreaterThan(0);
    expect(Object.keys(p.cost.essences)).toHaveLength(4);
    c.forge.cinders = 0;
    expect(forgePreview(c, { type: 'reforge', uid: it.uid }).error).toBe('Not enough Cinders');
  });
});
