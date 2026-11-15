# Notes for agents

The README's **Development** section has the commands and a map of the code. This file covers what isn't obvious from either.

## Releasing

Every change a player can notice is a release. Docs, tests and refactors are not.

1. Bump `version` in `package.json` and in both places in `package-lock.json`.
2. Add an entry to the top of `src/changelog.ts` (`tests/changelog.test.ts` fails if it doesn't match `package.json`). Players read it in game: say what they will see, in plain sentences, not what changed in the code.
3. Add a row to the top of the README's **Versions** table, leaving **Commit** blank.
4. Commit subject: `Hellforge X.Y.Z: <what changed>`.
5. Once it's on `master`, which deploys to GitHub Pages, tag the release commit (not the merge commit) with an annotated `vX.Y.Z` tag. Then create a GitHub release titled `X.Y.Z: <What changed>`, with the changelog notes as bullets followed by `_Released YYYY-MM-DD._`.

## Rules the code relies on

- `src/game/` is the simulation and must not touch the DOM. Randomness goes through the world's seeded RNG (`src/game/rng.ts`), never `Math.random`, so `?seed=` and the tests stay reproducible.
- There are no image or audio files: all art and sound are drawn or synthesized in code. Run `npm run dev` and open `/gallery.html` to see every character and monster model.
- Saves are in localStorage under the keys in `src/ui/save.ts`. Renaming a key loses players' heroes, and keys must not depend on the URL path. If you change the shape of `Character`, bump `SAVE_VERSION` and extend `migrateCharacter`; `tests/fixtures/save-v1.json` is an old save that must still load.
- In `drawMonsterShape` (`src/render/creatures.ts`), don't add a case under empty grouped cases: the group falls through into it. Humanoid creatures use `shape: 'humanoid'` with a `look`. `tests/creatures.test.ts` fails if two shapes draw the same.

## Testing

- `npm test` takes about a minute. It includes a bot that plays every act with every class.
- e2e needs `npx playwright install chromium` once. Specs start with `/?autostart&class=<class>&seed=<n>` (a fresh hero, no menu) and drive the game through `window.game` (e.g. `game.open('skills')`, `game.world.char`).
- UI must work on phones: Playwright runs phone portrait (390×844), phone landscape (844×390) and desktop, and specs save screenshots to `test-results/`. Look at them after UI changes.
- After changing combat numbers, run `npm run balance` (about 5 minutes) and commit the `BALANCE.md` diff.
