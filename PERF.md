# Performance

Written by `npm run perf` (`perf/perf.spec.ts`). Each scene is the Cinder Fields at phone portrait size (390×844) with imps
standing around the hero and the world held still, drawn at a fixed pixel ratio for 3 seconds.

CPU slowed 4× (Intel(R) Xeon(R) Processor @ 2.10GHz). Headless Chromium paints in software rather than on a GPU,
so frame rates are not what a phone gets; compare a run against this file to see what a change moved. Script time is
the game's own drawing code only; the rest of each frame is the browser painting it. Canvas calls are fills, strokes,
rectangles, images and gradients per frame, which do not depend on the machine.

| Pixel ratio | Scene | Frames/s | Slowest 5% (ms) | Script ms/frame | Canvas calls/frame |
|---|---|---|---|---|---|
| 2 | empty field | 12 | 133.3 | 8.5 | 365 |
| 2 | 3 monsters | 10 | 133.4 | 11.8 | 530 |
| 2 | 6 monsters | 10 | 133.4 | 10.9 | 707 |
| 2 | 12 monsters | 9 | 150.0 | 11.6 | 1076 |
| 2 | 6 monsters, hit flash | 11 | 116.6 | 11.4 | 705 |
| 2 | 6 monsters, chilled | 11 | 116.6 | 11.3 | 705 |
| 1 | empty field | 36 | 33.4 | 6.2 | 344 |
| 1 | 3 monsters | 29 | 50.0 | 8.4 | 530 |
| 1 | 6 monsters | 27 | 50.0 | 9.6 | 711 |
| 1 | 12 monsters | 23 | 66.6 | 11.6 | 1075 |
| 1 | 6 monsters, hit flash | 27 | 50.1 | 10.1 | 711 |
| 1 | 6 monsters, chilled | 23 | 66.7 | 11.5 | 705 |
