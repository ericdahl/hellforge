import { expect, test } from '@playwright/test';

// The floor is drawn once into a picture and stamped each frame (src/render/ground.ts). These check that it costs
// one image a frame, and that after a long walk, with the picture shifted and new ground explored many times over,
// it looks the same as a floor drawn from scratch.

test('the floor is one image a frame, and matches one drawn from scratch after a long walk', async ({ page, isMobile }) => {
  test.skip(isMobile, 'the same on every screen');
  test.setTimeout(120_000);
  await page.goto('/?autostart&class=arcanist&seed=7');
  await page.waitForFunction(() => !!(window as any).game);
  for (const area of ['tel_maresh', 'cinder_fields', 'gloomwood', 'sunken_chapel']) {
    const r = await page.evaluate(async (area) => {
      const g = (window as any).game;
      const w = g.world;
      const rd = g.renderer;
      w.enterArea(area, 'start');
      for (const b of document.querySelectorAll<HTMLElement>('.overlay .btn.primary')) b.click();
      await new Promise(requestAnimationFrame);
      // Hold everything still but the camera, which this drives by hand.
      w.step = () => {};
      rd.showWeather = false;
      const p = w.player;
      const l = w.area.level;

      // Images drawn onto the screen in one frame.
      const P = CanvasRenderingContext2D.prototype as any;
      const draw = P.drawImage;
      let images = 0;
      P.drawImage = function (this: unknown, ...a: unknown[]) {
        if (this === rd.ctx) images++;
        return draw.apply(this, a);
      };
      rd.render(w, 0);
      P.drawImage = draw;

      const floors: [number, number][] = [];
      for (let y = 0; y < l.h; y++) for (let x = 0; x < l.w; x++) if (l.tiles[y * l.w + x] === 1) floors.push([x, y]);
      const grab = () => {
        rd.cam.shake = 0;
        rd.render(w, 0);
        return rd.ctx.getImageData(0, 0, rd.canvas.width, rd.canvas.height).data as Uint8ClampedArray;
      };
      let worst = 0;
      for (let i = 0; i < 10; i++) {
        // Glide to a floor tile across the map, exploring on the way, as walking does.
        const [tx, ty] = floors[(i * 7919) % floors.length];
        const sx = p.x;
        const sy = p.y;
        for (let k = 1; k <= 30; k++) {
          p.x = sx + ((tx - sx) * k) / 30;
          p.y = sy + ((ty - sy) * k) / 30;
          if (k % 6 === 0) w.markExplored(false);
          rd.cam.shake = 0;
          rd.render(w, 1 / 60);
        }
        rd.cam.snap(p.x, p.y);
        const kept = grab();
        rd.ground = new rd.ground.constructor();
        const fresh = grab();
        let n = 0;
        for (let j = 0; j < kept.length; j++) if (Math.abs(kept[j] - fresh[j]) > 24) n++;
        worst = Math.max(worst, n);
      }
      return { area, images, worst };
    }, area);
    console.log(r);
    // The floor, the darkness, the automap, and trees or walls; not a tile at a time.
    expect(r.images, r.area).toBeLessThan(100);
    // Tile edges may differ by a shade where tiles were drawn in a different order; nothing more.
    expect(r.worst, r.area).toBe(0);
  }
});
