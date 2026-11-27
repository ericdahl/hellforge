import type { Resists } from './monsters';
import type { Rng } from './rng';

export interface Damage {
  phys: number;
  fire: number;
  cold: number;
  light: number;
  poison: number;
}

export const ZERO_DAMAGE: Damage = { phys: 0, fire: 0, cold: 0, light: 0, poison: 0 };

/** Classic ARPG to-hit: AR vs defense, scaled by the level ratio, clamped to 5..95%. */
export function hitChance(ar: number, def: number, attackerLvl: number, defenderLvl: number): number {
  const c = 2 * (ar / Math.max(1, ar + def)) * (attackerLvl / Math.max(1, attackerLvl + defenderLvl));
  return Math.min(0.95, Math.max(0.05, c));
}

export function resisted(amount: number, res: number): number {
  return amount * (1 - Math.min(res, 100) / 100);
}

/** Total damage after resistances. Poison is dealt separately over time. */
export function applyResists(d: Damage, res: Resists): { total: number; poison: number } {
  const total = resisted(d.phys, res.phys) + resisted(d.fire, res.fire) + resisted(d.cold, res.cold) + resisted(d.light, res.light);
  return { total: Math.max(0, total), poison: Math.max(0, resisted(d.poison, res.poison)) };
}

export function roll(rng: Rng, min: number, max: number): number {
  if (max <= min) return min;
  return rng.range(min, max);
}

export function scaleDamage(d: Damage, k: number): Damage {
  return { phys: d.phys * k, fire: d.fire * k, cold: d.cold * k, light: d.light * k, poison: d.poison * k };
}

/** Physical damage reduction against the player from flat "damage reduced by". */
export function reducePhysical(phys: number, flat: number): number {
  return Math.max(phys > 0 ? 1 : 0, phys - flat);
}

/** Resistances with a share of each ignored, as an arcane arrow sees them. Weaknesses (below zero) are left as they are. */
export function arcaneResists(res: Resists, pct: number): Resists {
  const k = 1 - Math.min(100, pct) / 100;
  const r = (v: number) => (v > 0 ? v * k : v);
  return { phys: r(res.phys), fire: r(res.fire), cold: r(res.cold), light: r(res.light), poison: r(res.poison) };
}

/** Seconds a dose of poison lasts on a monster. */
export const POISON_TIME = 3;

/**
 * Poisons a monster with `amount` damage over POISON_TIME seconds. With `stacks` of 1, the dose replaces a weaker one
 * (the poison that was there is not added to). With more, it adds to what is left of the poison already in it,
 * up to `stacks` times this dose's strength, and the clock starts again.
 */
export function addPoison(m: { poison: { dps: number; t: number } }, amount: number, stacks = 1) {
  if (amount <= 0) return;
  const dps = amount / POISON_TIME;
  if (stacks <= 1) {
    if (dps >= m.poison.dps * 0.9) m.poison = { dps, t: POISON_TIME };
    return;
  }
  const left = m.poison.t > 0 ? m.poison.dps * m.poison.t : 0;
  const total = Math.min((left + amount) / POISON_TIME, dps * stacks);
  if (total >= m.poison.dps * 0.9 || m.poison.t <= 0) m.poison = { dps: Math.max(total, m.poison.t > 0 ? m.poison.dps : 0), t: POISON_TIME };
}
