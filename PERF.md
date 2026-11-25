# Performance

Written by `npm run perf` (`perf/perf.spec.ts`). Each scene is the Cinder Fields at phone portrait size (390×844) with imps
standing around the hero and the world held still, drawn at a fixed pixel ratio for 3 seconds.

CPU slowed 4× (11th Gen Intel(R) Core(TM) i5-1145G7 @ 2.60GHz). Headless Chromium paints in software rather than on a GPU,
so frame rates are not what a phone gets; compare a run against this file to see what a change moved. Script time is
the game's own drawing code only; the rest of each frame is the browser painting it. Canvas calls are fills, strokes,
rectangles, images and gradients per frame, which do not depend on the machine.

| Pixel ratio | Scene | Frames/s | Slowest 5% (ms) | Script ms/frame | Canvas calls/frame |
|---|---|---|---|---|---|
| 2 | empty field | 16 | 66.7 | 6.0 | 580 |
| 2 | 3 monsters | 13 | 83.4 | 8.1 | 628 |
| 2 | 6 monsters | 13 | 100.0 | 9.4 | 696 |
| 2 | 12 monsters | 13 | 100.0 | 11.6 | 808 |
| 2 | 6 monsters, hit flash | 13 | 83.4 | 10.0 | 688 |
| 2 | 6 monsters, chilled | 13 | 100.0 | 10.1 | 689 |
| 1 | empty field | 38 | 33.4 | 6.0 | 552 |
| 1 | 3 monsters | 36 | 33.4 | 7.1 | 616 |
| 1 | 6 monsters | 35 | 33.4 | 7.9 | 690 |
| 1 | 12 monsters | 34 | 49.9 | 9.2 | 812 |
| 1 | 6 monsters, hit flash | 35 | 33.4 | 8.2 | 681 |
| 1 | 6 monsters, chilled | 35 | 33.4 | 8.1 | 691 |
