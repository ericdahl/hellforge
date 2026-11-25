import { FLOOR, type Level, type Prop } from '../game/map';
import { tileHash } from '../game/rng';
import type { AreaState } from '../game/world';
import { TILE_H, TILE_W, type Camera } from './camera';
import { floorTile } from './sprites';

/** Extra floor kept drawn around the screen, in CSS pixels, so the camera can move a while before more is needed. */
const PAD = 160;

/**
 * The floor, drawn once into a canvas a little larger than the screen and stamped each frame as one image.
 *
 * Drawing it tile by tile cost several hundred images a frame (about 540 in a town on a phone in landscape), and on a
 * phone that was most of each frame: far more than the game's own drawing. When the camera moves, the picture is
 * shifted and only the strip it uncovers is drawn; tiles explored since the last frame are added as they appear.
 */
export class Ground {
  private canvas = document.createElement('canvas');
  private ctx = this.canvas.getContext('2d')!;
  /** The canvas the picture is shifted through, swapped with `canvas` on each shift. */
  private spare = document.createElement('canvas');
  /** What the picture was drawn for; any change means drawing it again from scratch. */
  private key: { level: Level | null; theme: string; zoom: number; dpr: number; w: number; h: number } = { level: null, theme: '', zoom: 0, dpr: 0, w: 0, h: 0 };
  /** Where the world origin sits in the picture, in CSS pixels. */
  private ox = 0;
  private oy = 0;
  /** Tiles in the picture, by tile index. */
  private painted = new Uint8Array(0);
  private exploredRev = -1;

  /** Stamps the floor of `a` under the camera onto `ctx` (whose transform maps CSS pixels to the canvas). */
  draw(ctx: CanvasRenderingContext2D, cam: Camera, a: AreaState, props: Map<number, Prop>, outdoor: boolean, dpr: number) {
    // `outdoor`: every tile has floor under it (fields, forests, caves), not only floor tiles.
    const l = a.level;
    const z = cam.zoom;
    const W = cam.w + PAD * 2;
    const H = cam.h + PAD * 2;
    // Where the world origin is on screen now, rounded to a device pixel so the picture is stamped without resampling.
    const s0 = cam.toScreen(0, 0);
    const k = this.key;
    if (k.level !== l || k.theme !== l.theme || k.zoom !== z || k.dpr !== dpr || k.w !== W || k.h !== H) {
      this.key = { level: l, theme: l.theme, zoom: z, dpr, w: W, h: H };
      for (const c of [this.canvas, this.spare]) {
        c.width = Math.ceil(W * dpr);
        c.height = Math.ceil(H * dpr);
      }
      this.painted = new Uint8Array(l.w * l.h);
      this.exploredRev = a.exploredRev;
      this.center(s0, dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.ctx.clearRect(0, 0, W, H);
      this.paint(cam, a, props, outdoor, null);
    }
    // Newly explored tiles go in before any shift below, which counts on the picture holding every explored
    // tile it covers.
    if (a.exploredRev !== this.exploredRev) {
      this.exploredRev = a.exploredRev;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.paint(cam, a, props, outdoor, null, true);
    }
    let x = Math.round((s0.x - this.ox) * dpr) / dpr;
    let y = Math.round((s0.y - this.oy) * dpr) / dpr;
    if (x > 0 || y > 0 || x + W < cam.w || y + H < cam.h) {
      // The screen has reached an edge of the picture: re-centre it, keeping what's already drawn.
      const old = { x: this.ox, y: this.oy };
      this.center(s0, dpr);
      const dx = this.ox - old.x;
      const dy = this.oy - old.y;
      [this.canvas, this.spare] = [this.spare, this.canvas];
      this.ctx = this.canvas.getContext('2d')!;
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(this.spare, Math.round(dx * dpr), Math.round(dy * dpr));
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Only where nothing was copied: tiles cut off at the old edge are completed without being drawn twice.
      const kept = { x0: Math.max(0, dx), y0: Math.max(0, dy), x1: Math.min(W, dx + W), y1: Math.min(H, dy + H) };
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(0, 0, W, H);
      if (kept.x1 > kept.x0 && kept.y1 > kept.y0) this.ctx.rect(kept.x0, kept.y0, kept.x1 - kept.x0, kept.y1 - kept.y0);
      this.ctx.clip('evenodd');
      this.paint(cam, a, props, outdoor, kept);
      this.ctx.restore();
      x = Math.round((s0.x - this.ox) * dpr) / dpr;
      y = Math.round((s0.y - this.oy) * dpr) / dpr;
    }
    ctx.drawImage(this.canvas, x, y, W, H);
  }

  /** Puts the world origin where the screen is now, `PAD` in from the picture's top left. */
  private center(s0: { x: number; y: number }, dpr: number) {
    this.ox = Math.round((s0.x + PAD) * dpr) / dpr;
    this.oy = Math.round((s0.y + PAD) * dpr) / dpr;
  }

  /**
   * Draws the floor tiles that fall in the picture. With `kept`, it skips tiles wholly inside that rectangle (already
   * there); with `onlyNew`, it draws only tiles explored since they were last drawn.
   */
  private paint(cam: Camera, a: AreaState, props: Map<number, Prop>, outdoor: boolean, kept: { x0: number; y0: number; x1: number; y1: number } | null, onlyNew = false) {
    const l = a.level;
    const z = cam.zoom;
    const { w: W, h: H } = this.key;
    const hw = (TILE_W / 2) * z;
    const hh = (TILE_H / 2) * z;
    // The picture's corners in world tiles, to bound the loop.
    const corners = [
      [0, 0],
      [W, 0],
      [0, H],
      [W, H],
    ].map(([px, py]) => {
      const u = (px - this.ox) / hw;
      const v = (py - this.oy) / hh;
      return [(u + v) / 2, (v - u) / 2];
    });
    const x0 = Math.max(0, Math.floor(Math.min(...corners.map((c) => c[0]))) - 1);
    const x1 = Math.min(l.w - 1, Math.ceil(Math.max(...corners.map((c) => c[0]))) + 1);
    const y0 = Math.max(0, Math.floor(Math.min(...corners.map((c) => c[1]))) - 1);
    const y1 = Math.min(l.h - 1, Math.ceil(Math.max(...corners.map((c) => c[1]))) + 1);
    const town = !!a.def.town;
    const ctx = this.ctx;
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const i = y * l.w + x;
        if (onlyNew && this.painted[i]) continue;
        if (!a.explored[i] && !town) continue;
        const t = l.tiles[i];
        const pr = props.get(i);
        if (t !== FLOOR && !(pr && BLOCKING.has(pr.kind)) && !outdoor) continue;
        // The tile's box: TILE_W wide, TILE_H tall, hanging from its top corner.
        const sx = (x - y) * hw + this.ox;
        const sy = (x + y) * hh + this.oy;
        if (sx + hw < 0 || sx - hw > W || sy + 2 * hh < 0 || sy > H) continue;
        this.painted[i] = 1;
        if (kept && sx - hw >= kept.x0 && sx + hw <= kept.x1 && sy >= kept.y0 && sy + 2 * hh <= kept.y1) continue;
        ctx.drawImage(floorTile(l.theme, Math.floor(tileHash(x, y) * 4)), sx - hw, sy, hw * 2, hh * 2);
      }
  }
}

/** Props that stand on a wall tile and block it, with floor drawn under them. */
export const BLOCKING = new Set(['pillar', 'tent', 'campfire', 'well', 'hearth', 'ruin', 'forge']);
