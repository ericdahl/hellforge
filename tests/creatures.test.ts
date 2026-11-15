import { expect, it } from 'vitest';
import { MONSTERS } from '../src/game/monsters';
import { drawMonsterShape } from '../src/render/creatures';
import type { Pose } from '../src/render/figures';

/**
 * A canvas context that draws nothing but writes down every call and property set, so two
 * drawings can be compared without pixels.
 */
function recorder() {
  const log: string[] = [];
  const state: Record<string | symbol, unknown> = {};
  const fmt = (a: unknown) => (typeof a === 'number' ? a.toFixed(2) : typeof a === 'object' ? '{}' : String(a));
  // What createLinearGradient and friends return: their calls are recorded too.
  const gradient = new Proxy({}, { get: (_, k) => (...args: unknown[]) => { log.push(`g.${String(k)}(${args.map(fmt).join(',')})`); } });
  const ctx = new Proxy({}, {
    get(_, k) {
      if (k in state) return state[k];
      return (...args: unknown[]) => {
        log.push(`${String(k)}(${args.map(fmt).join(',')})`);
        return gradient;
      };
    },
    set(_, k, v) {
      state[k] = v;
      log.push(`${String(k)}=${fmt(v)}`);
      return true;
    },
  });
  return { ctx: ctx as CanvasRenderingContext2D, log };
}

const POSE: Pose = { dir: 1, back: false, walk: 0.3, moving: true, attack: 0.3, cast: 0 };

/**
 * Every way a creature can look: each monster's shape (with its outfit, for humanoids), and the
 * shapes its boss phases change it into.
 */
function looks() {
  const out = new Map<string, { shape: string; id: string }>();
  for (const def of Object.values(MONSTERS)) {
    const own = def.look ? `${def.shape}:${def.look}` : def.shape;
    const phases = (def.phases ?? []).flatMap((p) => (p.shape ? [p.shape] : []));
    for (const [key, shape] of [[own, def.shape], ...phases.map((p) => [p, p])]) {
      if (!out.has(key)) out.set(key, { shape, id: def.id });
    }
  }
  return [...out.entries()];
}

function drawing(shape: string, id: string) {
  const { ctx, log } = recorder();
  drawMonsterShape(ctx, shape, '#808080', POSE, 1.5, { id });
  return log.join('\n');
}

// Creatures of different shapes are drawn differently. Two shapes that come out identical have
// fallen through to the same drawing by mistake (0.22.0 drew the Shieldbearer and Bowman as the Brass Wyrm).
it('no two creature shapes are drawn the same', () => {
  const seen = new Map<string, string>();
  const clashes: string[] = [];
  for (const [key, { shape, id }] of looks()) {
    const d = drawing(shape, id);
    expect(d.length, key).toBeGreaterThan(0);
    const other = seen.get(d);
    if (other) clashes.push(`${key} is drawn the same as ${other}`);
    else seen.set(d, key);
  }
  expect(clashes).toEqual([]);
});
