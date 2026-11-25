# Performance

Written by `npm run perf` (`perf/perf.spec.ts`). Each scene is the Cinder Fields at phone portrait size (390×844) with imps
standing around the hero and the world held still, drawn at a fixed pixel ratio for 3 seconds.

CPU slowed 4× (Intel(R) Xeon(R) Processor @ 2.10GHz). Headless Chromium paints in software rather than on a GPU,
so frame rates are not what a phone gets; compare a run against this file to see what a change moved. Script time is
the game's own drawing code only; the rest of each frame is the browser painting it. Canvas calls are fills, strokes,
rectangles, images and gradients per frame, which do not depend on the machine.

| Pixel ratio | Scene | Frames/s | Slowest 5% (ms) | Script ms/frame | Canvas calls/frame |
|---|---|---|---|---|---|
| 2 | empty field | 14 | 99.9 | 7.4 | 368 |
| 2 | 3 monsters | 14 | 83.4 | 8.5 | 540 |
| 2 | 6 monsters | 11 | 116.7 | 9.9 | 710 |
| 2 | 12 monsters | 11 | 116.7 | 10.3 | 1076 |
| 2 | 6 monsters, hit flash | 11 | 116.8 | 12.0 | 714 |
| 2 | 6 monsters, chilled | 10 | 133.4 | 13.4 | 713 |
| 1 | empty field | 37 | 33.4 | 6.4 | 346 |
| 1 | 3 monsters | 30 | 50.0 | 8.8 | 528 |
| 1 | 6 monsters | 25 | 66.6 | 10.9 | 714 |
| 1 | 12 monsters | 24 | 66.7 | 11.3 | 1072 |
| 1 | 6 monsters, hit flash | 27 | 66.6 | 10.7 | 709 |
| 1 | 6 monsters, chilled | 25 | 66.7 | 12.1 | 718 |
