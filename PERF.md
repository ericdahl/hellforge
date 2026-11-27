# Performance

Written by `npm run perf` (`perf/perf.spec.ts`). Each scene is the Cinder Fields at phone portrait size (390×844) with imps
standing around the hero and the world held still, drawn at a fixed pixel ratio for 3 seconds.

CPU slowed 4× (Intel(R) Xeon(R) Processor @ 2.10GHz). Headless Chromium paints in software rather than on a GPU,
so frame rates are not what a phone gets; compare a run against this file to see what a change moved. Script time is
the game's own drawing code only; the rest of each frame is the browser painting it. Canvas calls are fills, strokes,
rectangles, images and gradients per frame, which do not depend on the machine.

| Pixel ratio | Scene | Frames/s | Slowest 5% (ms) | Script ms/frame | Canvas calls/frame |
|---|---|---|---|---|---|
| 2 | empty field | 12 | 133.3 | 8.8 | 369 |
| 2 | 3 monsters | 11 | 116.7 | 9.0 | 527 |
| 2 | 6 monsters | 11 | 100.1 | 9.3 | 706 |
| 2 | 12 monsters | 10 | 133.4 | 11.3 | 1071 |
| 2 | 6 monsters, hit flash | 11 | 133.3 | 11.8 | 703 |
| 2 | 6 monsters, chilled | 10 | 133.4 | 11.4 | 707 |
| 1 | empty field | 33 | 50.0 | 6.6 | 339 |
| 1 | 3 monsters | 30 | 50.0 | 8.3 | 520 |
| 1 | 6 monsters | 27 | 50.1 | 9.4 | 708 |
| 1 | 12 monsters | 24 | 50.1 | 10.9 | 1072 |
| 1 | 6 monsters, hit flash | 24 | 66.7 | 10.7 | 705 |
| 1 | 6 monsters, chilled | 24 | 66.7 | 11.4 | 706 |
