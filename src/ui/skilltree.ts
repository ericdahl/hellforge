import { canLearn, learnSkill, placeOnHotbar, skillLevel } from '../game/character';
import { SKILL_BY_ID, type SkillDef } from '../game/skills';
import { feeds, skillTree, unlockedBy, type TreeNode } from '../game/skilltree';
import { skillIconUrl } from '../render/icons';
import { h } from './dom';
import { header, respecControl, type PanelHost } from './panels';

/** The skill whose details are showing. Kept while the panel is open, forgotten when it is opened afresh. */
let selected: string | null = null;
/** Whether tapping a hotbar slot places Basic Attack rather than the selected skill. */
let placeAttack = false;
export function resetSkillUi() {
  selected = null;
  placeAttack = false;
}

function select(id: string) {
  selected = id;
  placeAttack = false;
}

type NodeState = 'known' | 'open' | 'ready' | 'locked';

/**
 * Where a skill stands: learned, learnable right now, learnable but for want of a point, or locked.
 * `lock` says what a locked skill is waiting for: a level, or the skills it requires.
 */
function stateOf(host: PanelHost, s: SkillDef): { state: NodeState; lock?: string; missing: SkillDef[] } {
  const c = host.world.char;
  const missing = (s.prereq ?? []).filter((p) => !c.skills[p]).map((p) => SKILL_BY_ID[p]);
  if (c.skills[s.id]) return { state: 'known', missing };
  if (c.level < s.reqLevel) return { state: 'locked', lock: `Lv ${s.reqLevel}`, missing };
  if (missing.length) return { state: 'locked', lock: '🔒', missing };
  return { state: c.skillPoints > 0 ? 'open' : 'ready', missing };
}

/** Where a node's lines meet it, in cells: the middle of its icon, which sits above its name. */
const anchor = (n: TreeNode) => ({ x: n.col + 0.5, y: n.row + 0.36 });

export function skillsPanel(host: PanelHost): HTMLElement {
  const w = host.world;
  const c = w.char;
  const tree = skillTree(c.classId);
  const states = new Map(tree.nodes.map((n) => [n.skill.id, stateOf(host, n.skill)]));
  // Open on something worth looking at: a skill that can take a point now, or else the first one known.
  if (!selected || SKILL_BY_ID[selected]?.classId !== c.classId) {
    selected = (tree.nodes.find((n) => states.get(n.skill.id)!.state === 'open') ?? tree.nodes.find((n) => c.skills[n.skill.id]) ?? tree.nodes[0]).skill.id;
  }
  const sel = SKILL_BY_ID[selected];
  const related = new Set([...(sel.prereq ?? []), ...unlockedBy(c.classId, sel.id).map((s) => s.id)]);
  const synergy = new Set([...(sel.synergies ?? []).map((x) => x.skill), ...feeds(c.classId, sel.id).map((f) => f.skill.id)]);

  // Requirement lines, drawn under the nodes. A line is lit once the skill it comes from is learned.
  const lines = tree.links.map((l) => {
    const a = anchor(l.from);
    const b = anchor(l.to);
    const cls = `${c.skills[l.from.skill.id] ? 'met' : ''} ${l.from.skill.id === sel.id || l.to.skill.id === sel.id ? 'hot' : ''}`;
    return `<line class="${cls}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" vector-effect="non-scaling-stroke"/>`;
  }).join('');
  const grid = h('div', { class: 'tree-grid' },
    h('div', { class: 'tree-lines', html: `<svg viewBox="0 0 ${tree.cols} ${tree.levels.length}" preserveAspectRatio="none" aria-hidden="true">${lines}</svg>` }));
  for (const n of tree.nodes) {
    const s = n.skill;
    const st = states.get(s.id)!;
    const hard = c.skills[s.id] ?? 0;
    const eff = skillLevel(c, s.id);
    const why = st.state === 'known' ? `rank ${hard}` : st.state === 'locked' ? (c.level < s.reqLevel ? `opens at level ${s.reqLevel}` : `requires ${st.missing.map((m) => m.name).join(' and ')}`) : 'can be learned';
    grid.append(h('button', {
      class: `tnode ${st.state}${s.id === sel.id ? ' sel' : ''}${related.has(s.id) ? ' rel' : ''}${synergy.has(s.id) ? ' syn' : ''}`,
      'data-skill': s.id, 'data-state': st.state, 'aria-label': `${s.name}, ${why}`, 'aria-pressed': String(s.id === sel.id), title: `${s.name}: ${why}`,
      style: { gridColumn: String(n.col + 1), gridRow: String(n.row + 1) },
      onclick: () => { select(s.id); host.refresh(); focusDetail(); },
    },
      h('span', { class: 'tn-icon' },
        h('img', { src: skillIconUrl(s.id), alt: '' }),
        hard ? h('span', { class: 'tn-rank' }, `${hard}${eff > hard ? `+${eff - hard}` : ''}`) : null,
        st.lock ? h('span', { class: 'tn-lock' }, st.lock) : null,
        st.state === 'open' ? h('span', { class: 'tn-plus' }, '+') : null),
      h('span', { class: 'tn-name' }, s.name)));
  }
  const treeEl = h('div', { class: 'tree', style: { '--tcols': String(tree.cols), '--trows': String(tree.levels.length) } as unknown as Partial<CSSStyleDeclaration> },
    h('div', { class: 'tree-corner' }),
    h('div', { class: 'tree-head' }, ...tree.branches.map((b) => h('div', { class: 'tree-branch', style: { gridColumn: `span ${b.span}` } }, b.name))),
    h('div', { class: 'tree-levels' }, ...tree.levels.map((l) => h('div', { class: `tree-lv ${c.level >= l ? 'reached' : ''}` }, `Lv ${l}`))),
    grid);
  // Custom properties are not style fields, so they are set by name.
  treeEl.style.setProperty('--tcols', String(tree.cols));
  treeEl.style.setProperty('--trows', String(tree.levels.length));

  return h('div', { class: 'panel skl' },
    header(host, 'Skills', c.skillPoints ? `${c.skillPoints} point${c.skillPoints > 1 ? 's' : ''} to spend` : undefined),
    h('div', { class: 'p-body skl-body' },
      treeEl,
      h('div', { class: 'skl-side' }, skillDetail(host, sel), hotbarControl(host, sel), respecControl(host))));
}

/** On a narrow screen the details sit under the tree: bring them into view when a skill is picked. */
function focusDetail() {
  document.querySelector('.skl-detail')?.scrollIntoView({ block: 'nearest' });
}

/** Everything about one skill: what it does now and next, what it needs, what it leads to, and the button to learn it. */
function skillDetail(host: PanelHost, s: SkillDef): HTMLElement {
  const w = host.world;
  const c = w.char;
  const hard = c.skills[s.id] ?? 0;
  const eff = skillLevel(c, s.id);
  const why = canLearn(c, s);
  const cur = eff > 0 ? s.lines(s.params(eff)) : [];
  const next = s.lines(s.params(Math.max(1, eff + 1)));
  const mana = s.mana(Math.max(1, eff));
  const branch = skillTree(c.classId).branches.find((b) => b.id === skillTree(c.classId).nodes.find((n) => n.skill.id === s.id)!.branch)!;
  const leads = unlockedBy(c.classId, s.id);
  const fed = feeds(c.classId, s.id);
  const pick = (id: string) => h('button', { class: 'skl-link', onclick: () => { select(id); host.refresh(); } }, SKILL_BY_ID[id].name);
  const list = (items: (Node | string)[]) => items.flatMap((x, i) => (i ? [', ', x] : [x]));
  const row = (label: string, ...body: (Node | string)[]) => h('div', { class: 'skl-row small' }, h('span', { class: 'dim' }, `${label} `), ...body);
  return h('div', { class: 'skl-detail', 'data-skill': s.id },
    h('div', { class: 'skl-top' },
      h('img', { src: skillIconUrl(s.id), alt: '' }),
      h('div', {},
        h('div', { class: 'sk-name' }, s.name, h('span', { class: 'sk-lvl' }, hard ? ` ${hard}${eff > hard ? ` (+${eff - hard})` : ''}` : '')),
        h('div', { class: 'dim small' }, `${branch.name} · ${hard ? `rank ${hard} of 20` : `opens at level ${s.reqLevel}`}`))),
    h('div', { class: 'small' }, s.desc),
    cur.length ? row('Now:', cur.join(' · ')) : null,
    hard >= 20 ? null : h('div', { class: 'skl-row small blue' }, h('span', { class: 'dim' }, eff ? 'Next: ' : 'Rank 1: '), next.join(' · ')),
    row(s.kind === 'passive' ? 'Passive' : 'Mana:', s.kind === 'passive' ? '' : String(Number(mana.toFixed(1)))),
    s.prereq?.length ? row('Requires:', ...list(s.prereq.map((p) => h('span', { class: c.skills[p] ? 'green' : 'red' }, c.skills[p] ? '✓ ' : '✗ ', pick(p))))) : null,
    leads.length ? row('Leads to:', ...list(leads.map((x) => pick(x.id)))) : null,
    s.synergies ? h('div', { class: 'skl-row small green' }, h('span', { class: 'dim' }, 'Grows with: '), ...list(s.synergies.map((x) => h('span', {}, pick(x.skill), ` (+${x.pct}% a rank)`)))) : null,
    fed.length ? h('div', { class: 'skl-row small green' }, h('span', { class: 'dim' }, 'Adds to: '), ...list(fed.map((f) => h('span', {}, pick(f.skill.id), ` (+${f.pct}% a rank)`)))) : null,
    h('div', { class: 'skl-learn' },
      h('button', {
        class: 'btn primary skl-learn-btn', disabled: !!why, 'aria-label': `Learn ${s.name}`,
        onclick: () => { learnSkill(c, s.id); w.refreshStats(); host.refresh(); },
      }, hard ? 'Add a point' : 'Learn'),
      why ? h('span', { class: 'dim small skl-why' }, why) : null));
}

/** The four hotbar slots and what is in each. Tapping a slot puts the selected skill, or Basic Attack, there. */
function hotbarControl(host: PanelHost, sel: SkillDef): HTMLElement {
  const c = host.world.char;
  const canPlace = !!c.skills[sel.id] && sel.kind !== 'passive';
  const attack = placeAttack || !canPlace;
  const placing = attack ? 'attack' : sel.id;
  const name = (id: string) => (id === 'attack' ? 'Basic Attack' : SKILL_BY_ID[id].name);
  const choice = (on: boolean, label: string, onclick: () => void) =>
    h('button', { class: `btn tiny hb-choice ${on ? 'on' : ''}`, 'aria-pressed': String(on), onclick }, label);
  return h('div', { class: 'skl-hotbar' },
    h('div', { class: 'hb-head' },
      h('span', { class: 'dim small' }, 'Put'),
      canPlace ? choice(!attack, sel.name, () => { placeAttack = false; host.refresh(); }) : null,
      choice(attack, 'Basic Attack', () => { placeAttack = true; host.refresh(); }),
      h('span', { class: 'dim small' }, 'in a slot:')),
    h('div', { class: 'hb-slots' }, ...c.hotbar.map((id, i) =>
      h('button', {
        class: `btn hb-slot ${id === placing ? 'on' : ''}`, 'data-slot': String(i + 1),
        'aria-label': `Slot ${i + 1}: ${id ? name(id) : 'empty'}`,
        onclick: () => { placeOnHotbar(c.hotbar, i, placing); host.refresh(); },
      },
        h('span', { class: 'hb-num' }, String(i + 1)),
        id ? h('img', { src: skillIconUrl(id), alt: '' }) : h('span', { class: 'hb-empty' }),
        h('span', { class: 'hb-name' }, id ? name(id) : 'Empty')))),
    canPlace || sel.kind === 'passive' ? null : h('div', { class: 'dim small' }, `Learn ${sel.name} to put it on the hotbar.`));
}
