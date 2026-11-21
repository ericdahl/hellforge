# Performance

Written by `npm run perf` (`perf/perf.spec.ts`). Each scene is the Cinder Fields at phone portrait size (390×844) with imps
standing around the hero and the world held still, drawn at a fixed pixel ratio for 3 seconds.

CPU slowed 4× (Intel(R) Xeon(R) Processor @ 2.10GHz). Headless Chromium paints in software rather than on a GPU,
so frame rates are not what a phone gets; compare a run against this file to see what a change moved. Script time is
the game's own drawing code only; the rest of each frame is the browser painting it. Canvas calls are fills, strokes,
rectangles, images and gradients per frame, which do not depend on the machine.

| Pixel ratio | Scene | Frames/s | Slowest 5% (ms) | Script ms/frame | Canvas calls/frame |
|---|---|---|---|---|---|
| 2 | empty field | 10 | 133.4 | 10.1 | 578 |
| 2 | 3 monsters | 8 | 166.7 | 13.7 | 749 |
| 2 | 6 monsters | 8 | 166.7 | 14.4 | 922 |
| 2 | 12 monsters | 8 | 150.0 | 13.7 | 1284 |
| 2 | 6 monsters, hit flash | 9 | 133.3 | 14.5 | 915 |
| 2 | 6 monsters, chilled | 8 | 166.6 | 15.3 | 909 |
| 1 | empty field | 23 | 66.7 | 10.6 | 556 |
| 1 | 3 monsters | 23 | 50.1 | 10.0 | 735 |
| 1 | 6 monsters | 22 | 66.7 | 11.6 | 922 |
| 1 | 12 monsters | 18 | 83.4 | 14.8 | 1285 |
| 1 | 6 monsters, hit flash | 16 | 83.4 | 17.0 | 919 |
| 1 | 6 monsters, chilled | 19 | 83.3 | 14.6 | 918 |
