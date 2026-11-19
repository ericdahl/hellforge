import { CLASSES, DIFFICULTIES, type Character, type DailyResult } from '../game/character';
import { dailyDay, DEPTH_BASE_LEVEL } from '../game/depths';
import { DIFFICULTY_LEVELS } from '../game/areas';
import { h } from './dom';
import { header, type PanelHost } from './panels';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Today's Daily Descent, by the player's own calendar. */
export const today = () => dailyDay(new Date());

export function dayLabel(day: number): string {
  return `${MONTHS[Math.floor(day / 100) % 100 - 1] ?? '?'} ${day % 100}`;
}

export function clock(seconds: number): string {
  const s = Math.floor(seconds);
  const mm = String(Math.floor(s / 60) % 60);
  const ss = String(s % 60).padStart(2, '0');
  return s >= 3600 ? `${Math.floor(s / 3600)}:${mm.padStart(2, '0')}:${ss}` : `${mm}:${ss}`;
}

/** One line to paste anywhere: "Hellforge Daily · Nov 18 · Huntress lvl 52 · Hell · Floor 14 · 22:41 · 3 deaths". */
export function dailyText(c: Character, r: DailyResult): string {
  return [
    'Hellforge Daily',
    dayLabel(r.day),
    `${CLASSES[c.classId].name} lvl ${r.level}`,
    DIFFICULTIES[r.difficulty] + (c.hardcore ? ' Hardcore' : ''),
    `Floor ${r.floor}`,
    clock(r.time),
    `${r.deaths} death${r.deaths === 1 ? '' : 's'}`,
    r.official ? null : 'unofficial',
  ].filter(Boolean).join(' · ');
}

/** The result card, with a button that copies it (or selects it to copy by hand where the clipboard is out of reach). */
export function dailyCard(c: Character, r: DailyResult) {
  const text = dailyText(c, r);
  const box = h('textarea', { class: 'daily-text', readonly: true, rows: 2, 'aria-label': 'Daily Descent result' }, text) as HTMLTextAreaElement;
  const status = h('div', { class: 'daily-status' });
  const best = c.daily.best;
  const isBest = r.official && best && best.day === r.day && best.floor === r.floor && best.time === r.time;
  return h('div', { class: 'daily-card' },
    h('div', { class: 'daily-floor' }, `Floor ${r.floor}`),
    h('div', { class: 'daily-sub' }, `${dayLabel(r.day)} · ${clock(r.time)} · ${r.deaths} death${r.deaths === 1 ? '' : 's'}`),
    h('div', { class: 'dim small' }, r.official ? (isBest ? 'Your best Daily Descent yet.' : 'Today\'s run that counts.') : 'Unofficial: only the first run each day counts.'),
    box,
    h('button', {
      class: 'btn primary daily-copy', onclick: async () => {
        box.focus();
        box.select();
        try {
          await navigator.clipboard.writeText(text);
          status.textContent = 'Copied';
        } catch {
          status.textContent = 'Selected: copy it from the box';
        }
      },
    }, 'Copy'),
    status);
}

/** After the town portal: end the run here, or go back down. After the run: its card. */
export function dailyPanel(host: PanelHost) {
  const w = host.world;
  const c = w.char;
  const run = c.daily.run;
  if (run) {
    return h('div', { class: 'panel daily' },
      header(host, 'Daily Descent', dayLabel(run.day)),
      h('div', { class: 'p-body' },
        h('div', { class: 'npc-say' }, `Floor ${run.floor} · ${clock(run.time)} · ${run.deaths} death${run.deaths === 1 ? '' : 's'}. The clock keeps running in town.`),
        h('button', { class: 'btn primary', onclick: () => host.close() }, 'Keep going'),
        h('button', { class: 'btn danger daily-end', onclick: () => { w.endDaily(); host.refresh(); } }, 'End the run')));
  }
  const r = w.lastDaily;
  return h('div', { class: 'panel daily' },
    header(host, 'Daily Descent', r ? 'Run over' : ''),
    h('div', { class: 'p-body' }, r ? dailyCard(c, r) : h('div', { class: 'dim' }, 'No run yet today.')));
}

/** The Daily Descent's place at the waypoint, under the hero's own Underforge. */
export function dailyWaypoint(host: PanelHost): HTMLElement[] {
  const w = host.world;
  const c = w.char;
  const run = c.daily.run;
  const day = today();
  const best = c.daily.best;
  const lvl = (d: number) => h('span', { class: 'dim small' }, ` · lvl ${DEPTH_BASE_LEVEL + d + DIFFICULTY_LEVELS[c.difficulty]}`);
  const go = () => { host.close(); w.descendDaily(day); };
  return [
    h('div', { class: 'wp-act' }, 'Daily Descent'),
    h('div', { class: 'dim small daily-say' },
      'The same floors for everyone today, from the first floor down. The first run each day counts. ',
      best ? `Your best: Floor ${best.floor} in ${clock(best.time)} (${dayLabel(best.day)}).` : 'No best yet.'),
    run
      ? h('div', { class: 'daily-row' },
        h('button', { class: 'btn wp daily', onclick: go }, `Continue at Floor ${run.floor}`, h('span', { class: 'dim small' }, ` · ${clock(run.time)}`)),
        h('button', { class: 'btn danger daily-end', onclick: () => { w.endDaily(); host.open('daily'); } }, 'End'))
      : h('button', { class: 'btn wp daily', onclick: go },
        `Daily Descent · ${dayLabel(day)}`,
        c.daily.lastDay === day ? h('span', { class: 'dim small' }, ' · unofficial') : lvl(1)),
  ];
}
