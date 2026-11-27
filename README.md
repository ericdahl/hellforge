# Hellforge

A dark-fantasy action RPG in the classic isometric hack-and-slash mold. Pick a hero, clear demon-infested fields, caves and catacombs, and hunt ever better loot on the way down to the Hellforge, south across a desert melted to glass, and back north through the snow with the last ember of its fire. It runs in any modern browser, phones included, and needs no downloads: all the art and sound are generated in code.

## Play

```sh
npm install
npm run dev        # http://localhost:5173 (also exposed on your LAN so you can open it on a phone)
```

`npm run build` writes a static site to `dist/` that you can host anywhere (it is published to GitHub Pages from this repo, at <https://ericdahl.github.io/hellforge/>). On a phone, "Add to Home Screen" runs it fullscreen. Landscape is recommended, but portrait works too.

URL options: `?seed=123` fixes the world layout, `?autostart&class=hunter` skips the menu with a fresh hero, `?fps` shows frame rate, script time and pixel ratio, `?dpr=1` holds the pixel ratio (no stepping up or down), and `?off=floor,sprites,lighting,weather` leaves those layers out, to see what each costs on a device.

## Controls

| | Touch | Mouse / keyboard |
|---|---|---|
| Move | Joystick (touch the left side of the screen), or tap the ground | Left click / hold |
| Attack | Big ⚔ button (auto-targets the nearest enemy, hold to keep attacking), or tap a monster | Left click a monster (Shift: attack in place) |
| Skills | The three buttons around ⚔ | Right click (slot 2), or `Q` `W` `E` `R` for slots 1-4 |
| Dodge | ➠ button (rolls the way you are steering) | `Space` (rolls toward the cursor) |
| Pick up, talk, take stairs | Tap the label / NPC / stairs, or the context button that appears nearby | Click it, or `F` for the nearest thing |
| Potions | Tap a potion slot (long-press for details) | `1` health, `2` mana, `3` rejuvenation |
| Town Portal | ◎ button | `T` |
| Panels | Buttons on the bottom bar | `I` inventory, `C` character, `K` skills, `Tab`/`M` automap, `Esc` menu |
| Items | Tap an item, then a button | Hover an item and press `E` equip/unequip, `U` use, `S` sell, `B` buy, `D` drop, `X` stash/inventory, `G` socket; right-click for the main action |
| The Forge | Tap an item, then a job; tap **Strike!** in the timing game | Hover an item and press `H` heat, `J` strike by hand, `T` temper, `Q` quench, `L` ember-seal, `P` punch socket, `M` crucible, `S` salvage; digits pick from a list, `Space` strikes |

Panels pause the game

## The game

### Classes

| Class | Plays as | Skills |
|---|---|---|
| **Reaver** | Melee | Bash, Frenzy, Leap Attack, Whirlwind, War Cry |
| **Arcanist** | Caster | Fire Bolt, Ice Bolt, Charged Bolt, Frost Nova, Teleport, Fireball, Meteor |
| **Hunter** | Bows, arcane and poison | *Archery:* Power Shot, Critical Eye, Multishot, Quarry (marks the strongest enemy nearby), Strafe · *Arcane* (ignores resistances, warms the ember): Arcane Arrow, Phase Step, Drawn Shot, Arcane Ruin · *Venom* (poison that stacks): Toxin Coating, Venom Cloud, Corrode, Blight Bloom |
| **Necromancer** | Summons, curses, bone and poison | *Summons:* Raise Skeleton (from corpses), Grave Golem, Skeletal Mastery · *Curses and corpses:* Mark of Frailty, Corpse Burst · *Bone and poison:* Bone Shards, Bone Ward, Bone Lance, Bone Storm, Blight Nova |
| **Forgewright** | Two-handed hammers, constructs, Heat | *Hammers:* Sunder, Anvil Drop, Shockwave, Earthshaker · *Constructs:* Ballista and Bellows turrets, Brass Sentinel golem, Furnace (heals allies near it), Gearwork · *Heat:* Temper, Slag Burst, White Heat |
| **Hiveborn** | Four-armed insect | *Soldier:* Rend, Carapace, Many Hands, Hold the Line, Fourfold Strike · *Archer:* Loose, Sky Hunter, Volley, Skyfall · *Faith:* Prayer of Mending, Ward of Faith, Congregation, Hymn of the Hive, Sky Above |

- Each level gives 5 stat points and a skill point. Skills have level requirements, prerequisites and synergies, and the Skills panel draws them as a tree: three branches per class, a row per level, a line per prerequisite.
- Servants that can walk follow you between areas (turrets and furnaces stay where they are built and wind down), and monsters fight them as well as you.
- **Four arms (Hiveborn).** A one-handed weapon fits in either upper hand; the off-hand one adds 50% of its damage to each blow (more with Many Hands). A two-hander or a bow can be held with a shield or a second weapon beside it. The lower arms are claws, whose damage grows with level and Strength and is added to every melee blow. With a bow, a plain attack shoots at range and claws at close quarters, and an off-hand weapon adds to the claws instead of the arrows.
- **Heat (Forgewright).** Hammer blows build Heat, shown on a gauge above the experience bar. Temper turns it into fire damage and Slag Burst vents it all as a blast (it costs Heat, not mana). At 100 the smith overheats and burns until Heat falls below 60 or is vented. In Act 3 a Furnace counts as a fire, and a smith at 75 Heat or more is a little warm.

### Acts

| Act | Town | Areas | Bosses |
|---|---|---|---|
| **1** | Emberwatch Camp | Cinder Fields, Hollow Cave, Gloomwood, Sunken Chapel, Catacombs 1-2, the Hellforge | Gorvath the Glutton, the Drowned Bishop, Ossuary Warden Krell, Vhorza, Mother of Cinders |
| **2: The Glass Sea** | Tel Maresh | Ashfall Road, Cistern of Whispers, the Glass Sea, Carrion Mesa, Buried Imhara (the Bazaar, the Hall of Dials), the Noon Vault | Skarn, Karrik the Carrion King, Vizier Ohm-Tet, Old Corvin |
| **3: The Ember Road** | Emberwatch Ruins | Rimefall Pass, the Drowned Mines, the Bellfounders' Halls, the Cold Furnace, the Hellforge's Heart | The Frostwright, the Echo of Old Corvin, the Unlit |

Areas are randomly generated. Activate waypoints to fast-travel, and cast Town Portal to restock and come back. Every town has a healer, blacksmith and forge, sage, gambler and stash. Killing Vhorza opens the caravan south, killing Old Corvin opens the road back north, and finishing Act 3 unlocks the next difficulty.

- **Act 2.** Sandstorms and quicksand change how the desert plays, and the four bosses change phase as they are wounded.
- **Act 3: Warmth.** The ember Vhorza left is dying, and Emberwatch lies under snow. In the cold the ember burns down (faster in a whiteout) and its light shrinks; once it is out, frostbite builds, slowing and then wounding. Touch a brazier to light it and stand in its glow to refill the ember. Fire skills, burning weapons and burning monsters help too.

### Monsters

Act 1 has imps that flee when a packmate dies and Hexers that raise them again, plus ghouls, skeletons, archers, bats, hounds, brutes, wraiths and cultists. Champion packs are blue. Uniques are gold, with modifiers like Fire Enchanted, Stone Skin, Extra Fast, Lightning Enchanted, Teleporter and Bombardier. Later monsters each have a rule to learn:

| Monster | Act | Rule |
|---|---|---|
| Embalmed Dead | 2 | Rise again unless burned |
| Mirage Dancer | 2 | Split into copies that cast no shadow |
| Noon Acolyte | 2 | Ward their allies |
| Dune Burrower | 2 | Tunnel to you |
| Carrion Kite | 2 | Heal on corpses |
| Salt Colossus | 2 | Telegraph their ground slams |
| Rime-Thrall | 3 | Shatter into ember-sapping ice unless burned |
| Bellwarden | 3 | Ring a shockwave you dodge-roll through |
| Slag Golem | 3 | Molten in fire, brittle in cold |
| Hearth-Eater | 3 | Drink the ember from range unless you stand in firelight |
| The Frostwright | 3 (boss) | Shelter at a lit brazier from his cold snap |
| Echo of Old Corvin | 3 (boss) | Break his phylactery |
| The Unlit | 3 (boss) | Snuffs fires, and heals while your ember is out |

### Quests

| Act | Quest | Reward |
|---|---|---|
| 1 | The Hollow Cave | +1 skill point |
| 1 | The Drowned Bishop | +5 stat points |
| 1 | Mother of Cinders | The road south opens |
| 2 | The Black Water | +1 skill point |
| 2 | The Carrion King | +5 stat points |
| 2 | The Embalmer | +1 skill point |
| 2 | The Hollow Sun | The road north opens |
| 3 | The Ember Road (light the beacons of Rimefall Pass) | +1 skill point |
| 3 | The Frostwright | +5 stat points |
| 3 | The Last Phylactery | +1 skill point |
| 3 | Keep It Lit | Next difficulty unlocked |

### Difficulty

| | |
|---|---|
| **Normal → Nightmare → Hell** | Each is unlocked by finishing Act 3 on the one before, with tougher monsters, immunities and resistance penalties |
| **Hardcore** | Heroes die permanently. Softcore heroes respawn in town and lose some gold |

### Loot

| Rarity | Color |
|---|---|
| Normal | White |
| Socketed | Grey |
| Magic | Blue |
| Rare | Yellow |
| Set | Green |
| Unique | Gold |

Every weapon and armor base comes in three tiers. Normal bases drop through the Normal campaign. Emberforged (exceptional) bases, with twice the base damage or defense, drop from Nightmare on. Hellforged (elite) bases, with three times, drop late in Nightmare and through Hell. The finer tiers need more Strength, Dexterity and level, and have their own affixes and uniques: one weapon unique per class in each tier, and one for each kind of armor.

Magic and better items drop unidentified; the sage identifies them for free. Gems in seven types and five grades go into sockets, with different effects in weapons, armor and shields. Your inventory is a grid where items take up space by size. Magic find improves your odds.

### The Forge

A forge stands beside the blacksmith in every town.

| Job | What it does |
|---|---|
| **Salvage** | Turns loot into Cinders, and magic or better items into Essences of their element |
| **Heat** | Adds forge levels up to +10 (4% base damage or defense each, shown as "+7 War Axe"). From +6 a heat can fail and crack the item back a level; on Hardcore a failed heat to +8 or more can shatter it. An optional hammer-timing game adds up to 10% to the chance |
| **Temper** | Re-rolls one chosen affix |
| **Quench** | Adds or converts an elemental damage or resistance affix |
| **Ember-Seal** | Locks an affix against tempering |
| **Smelt** | Turns three items of one type and rarity into one of the next |
| **Reforge** | Rebuilds an item on its Emberforged base, then its Hellforged one, once the hero has reached Nightmare (or Hell) and has Master (or Grandmaster) mastery. A unique or set piece grows with it: plain amounts such as Strength or Life double at Emberforged and triple at Hellforged, and enhanced damage and defense rise by 50% and 40% a tier; resistances, speeds, skills and steal stay as they were. Magic and rare items keep their affixes |

Forge mastery grows with use, improves costs and odds, and teaches socket punching, sealing, smelting legends and reforging. Vhorza's ember, once you carry it, makes the forge burn hotter.

### Other features

| Feature | |
|---|---|
| **The Underforge** | Finishing Act 3 opens an endless dungeon at every waypoint (per difficulty). Floors are rolled from the run's seed with layouts and monsters from all three acts, one monster level deeper each. A warden seals the stairs on every floor, every fifth floor is a returning boss, and from the third floor down each floor carries one to three afflictions that every monster shares. Magic find, gold find and elite density rise with depth, wardens pay out Cinders, and clearing a boss floor lets the next descent start below it. The **Daily Descent** beside it is a run from the first floor through floors rolled from the date, the same for every player that day; it tracks the deepest floor, the time and the deaths, only the first run each day counts, and it ends with a result card to copy |
| **The Brass Wyrm** | An optional encounter in the High Roost, a cave off Gloomwood that no quest points to, with a dragon about sixteen levels above the area. Carry his letter to the captain in Tel Maresh for a reward, challenge him (telegraphed fire breath, a wing buffet that throws the hero, shadowless copies, a flight phase), or rob the hoard while he sleeps for an angrier fight. He yields at a quarter of his life and never dies, then offers one of three items. Once per difficulty. To talk he takes a man's shape, and the same man stands in Emberwatch Camp and Tel Maresh as a hint that the cave exists |
| **Hirelings** | A captain in every town hires out a Shieldbearer (melee, tough), a Bowman (ranged) or an Ember-Keeper (fire, and warm to stand beside in Act 3). They fight at the hero's level, follow between areas, mend out of combat, and are brought back at any captain for a fee if they fall |
| **Shared stash** | A second stash tab, with items and gold, that every hero in this browser shares. Hardcore heroes have a separate one |
| **Respec** | One per difficulty finished (three in all), from the Character or Skills panel: every skill and attribute point comes back to be placed again |
| **Dodge roll** | 1.5 second cooldown. Makes the hero untouchable for a moment and cancels a swing or cast |
| **Killing sprees** | Kills within four seconds of each other build a spree: Killing Spree at 5, then Rampage, Massacre, Slaughter, Annihilation, Hell Unleashed. Each rank adds run speed and experience per kill, and restores some life and mana |
| **Soul orbs** | Restore life or mana when walked over |
| **Tithe Imp** | May hide in any area but the Hollow Cave. It flees, drops gold when struck, and escapes through a portal unless killed |
| **Shrines** | Armor, Combat, Experience, Storm, Fortune or Fleet blessings, refill life and mana, or (Cursed) a three-wave ambush with a hoard at the end |
| **Chests and barrels** | Scattered around; some barrels explode |
| **Area purge** | Killing everything in an area purges it for experience and loot |

Music, ambient sound and weather are all generated in code too; the menu has switches for each.

### Saves

Progress saves automatically to the browser's local storage. To move heroes to another device, use **Export / Import** on the title screen: download a save file or copy a short save code, then load the file or paste the code on the other device. Importing replaces a hero with the same identity and keeps the rest. The shared stash is exported too, and replaces the one on the other device only if that one is empty or you agree.

## Versions

The version is shown at the bottom of the title screen; tap it for the player-facing changelog (`src/changelog.ts`, add an entry with each version bump).

| Version | Commit | Notes |
|---|---|---|
| 0.28.1 | | The Hunter drawn as a man (short hair, beard, standard build); Multishot damage −10% + 10% a rank (was −25% + 8%), Critical Eye `dim(16, 5, l, 75)` (was `dim(12, 5, l, 70)`), Hunter life 55 + 2.5 a level + 4 per Vitality (was 50 + 2 + 3) |
| 0.28.0 | | The Huntress is renamed the Hunter (class id `hunter`; old saves, items and `?class=huntress` links are converted) and gets a new skill tree: Archery, Arcane and Venom. Arcane damage ignores part of resistances; the Hunter's poison stacks (others' still replaces a weaker dose); venom clouds, a beam, a marked quarry; save version 5 refunds Hunter skill points |
| 0.27.0 | | Exceptional (Emberforged) and elite (Hellforged) tiers of every weapon and armor base for Nightmare and Hell, new affix tiers past level 36, 26 new uniques, and Reforge at the forge to move an item up a tier, growing a unique's properties with it |
| 0.26.3 | | Faster on phones: the floor is drawn once into a picture a little larger than the screen and stamped as one image, shifted as the camera moves and added to as ground is explored, instead of several hundred tiles a frame |
| 0.26.2 | | Smoother fights on phones: hit flashes, chill, poison and Heat glows are drawn in shifted colours in one pass instead of through a second canvas (about 5× cheaper each); the resolution steps down when frames arrive late, not only when the game's own script runs long |
| 0.26.1 | | Smoother crowds on phones: the world is drawn at a lower resolution while frames run slow and sharper again when they're quick; a long frame no longer makes the next one catch up more than three steps |
| 0.26.0 | | The Daily Descent: a daily seeded Underforge run, the same floors for everyone that day, with a result card to copy; save version 4 |
| 0.25.2 | | Town Portal opens a portal and leaves you to step through it, instead of taking you to town at once |
| 0.25.1 | | Bow icons drawn upright and inside their inventory slot; desktop interact button clears the Heat gauge |
| 0.25.0 | | A second set per class, each raising one branch of the skill tree by 3 (new `tree_<branch>` stat) |
| 0.24.0 | | Five Hiveborn uniques (armour, helm, gloves, belt, amulet) and two new stats: claw damage and off-hand weapon share |
| 0.23.2 | | Shieldbearer and Bowman hirelings were drawn as the Brass Wyrm; humanoid creatures now name their outfit in their definition |
| 0.23.1 | | Skills panel: one Hotbar row showing all four slots; placing a skill swaps it with the slot it moves to |
| 0.23.0 | | The Brass Wyrm's human form, a stranger in two towns, and a redrawn dragon |
| 0.22.0 | | The Brass Wyrm: an optional talk-first dragon boss above Gloomwood, with an errand, a fight he yields from, and a hoard to rob |
| 0.21.0 | | New Hero screen redrawn as an animated campfire scene; portraits for saved heroes |
| 0.20.0 | | The Hiveborn: a sixth, four-armed class with off-hand weapons, claws, and Soldier, Archer and Faith branches |
| 0.19.0 | | The Skills panel becomes a skill tree: branches, requirement lines, and a detail pane (no rule changes) |
| 0.18.0 | | Shared stash: a second stash tab shared by every hero on the device, carried in exports |
| 0.17.0 | | Hirelings: a captain in every town, three companions to hire, revive and dismiss |
| 0.16.0 | | Respec: one for each difficulty finished, giving back every skill and attribute point |
| 0.15.0 | | The Underforge: an endless, scaling dungeon after Act 3 (wardens, boss floors, afflictions, starting floors) |
| 0.14.0 | | The Forge: salvage, heat (+1 to +10), temper, quench, smelt, ember-seal, socket punching, forge mastery, a hammer-timing game; save version 3 adds forge materials |
| 0.13.0 | | The Forgewright: a fifth class with Hammer, Construct and Heat skill trees, two-handed hammers, four uniques and a class set |
| 0.12.0 | | Act 3: The Ember Road (warmth and braziers, five areas, a new town, three bosses, new gear); the next difficulty now unlocks at the end of Act 3 |
| 0.11.2 | | Holding a skill button no longer opens the skills panel |
| 0.11.1 | | Performance: settled corpses are drawn once and stamped, the automap redraws only on exploration, displays over 100 Hz draw every other frame |
| 0.11.0 | | Dodge roll, killing sprees, soul orbs, the Tithe Imp, four new shrines, three new elite modifiers, area purges |
| 0.10.0 | | Redrawn character art: hero gear shows on the model, new monster and NPC models, keyframed weapon swings |
| 0.9.1 | | Stash no longer overlaps the backpack |
| 0.9.0 | | Act 2: The Glass Sea |
| 0.8.2 | | Light beam and chime for rare drops |
| 0.8.1 | | Loot with no room hops back up with a thud |
| 0.8.0 | | Four class item sets; set pieces favour the hero's class |
| 0.7.3 | | New uniques: Ironwrath (Reaver) and Cryptkeeper's Shroud (Necromancer) |
| 0.7.2 | | Other classes' skill bonuses marked "(no effect)" on items |
| 0.7.1 | | Backpack and stash rearrange to fit items; Sort button |
| 0.7.0 | | Potion pools replace belt columns and backpack potions; first save migration (`migrateCharacter`, `SAVE_VERSION`) |
| 0.6.1 | | Hollow Cave stragglers on the HUD and automap; skeleton count on the Raise Skeleton button |
| 0.6.0 | | Hit feedback: freeze frames, crit pops, death effects by damage type, boss flashes |
| 0.5.0 | `50fa196` | Generated music, ambient sound, weather and status vignettes |
| 0.4.2 | `8f1d018` | Equipped/Backpack separation and side-by-side gear comparison |
| 0.4.1 | `3c1bf10` | Item keyboard shortcuts and right-click |
| 0.4.0 | `a5f1efd` | Necromancer class |
| 0.3.0 | `96d8f0e` | Changelog viewer on the title screen |
| 0.2.0 | `3c37bb6` | Save export/import (file or copy/paste code) |
| 0.1.0 | `a020f79` | Initial release. Roll back with `git checkout a020f79 -- .` |

## Development

```sh
npm test           # Vitest: engine unit tests, world simulation, and a bot that plays all three acts with every class
npm run e2e        # Playwright on phone-landscape, phone-portrait and desktop (screenshots land in test-results/)
npm run typecheck
npm run balance    # the bot plays every class through all three acts on three seeds and rewrites BALANCE.md (about 5 minutes)
npm run perf       # times set scenes on a phone-sized screen with the CPU slowed 4x and rewrites PERF.md (about a minute)
```

`BALANCE.md` is the bot's balance report: time, deaths, potions and time to kill for each class in each act and area, with the classes that are out of line with the others listed at the top. It is committed so that running `npm run balance` after a change shows what moved as a diff. `BALANCE_SEEDS=99` or `BALANCE_CLASSES=reaver,arcanist` narrows a run, and `BALANCE_OUT=path` writes somewhere else.

| Path | What |
|---|---|
| `src/game/` | Pure simulation with no DOM: map generation, pathfinding, items, skills, monsters, combat, `World` |
| `src/game/forge.ts` | The Forge: costs, odds and every job as pure functions (`forgePreview`, `forgeApply`). `addForgeModifier(source)` lets a class, set or event change costs, heat odds, salvage yield and mastery gain; the Forgewright's bonus is registered that way |
| `src/game/depths.ts` | The Underforge: how a floor is rolled (`depthDef`), afflictions, boss rotation and rewards. Floors have ids like `depth:7` and are not in `AREAS`; use `world.defOf(id)`. A Daily Descent floor is rolled from `dailyFloorSeed(day, depth)` alone; the run is `World.descendDaily`/`endDaily` and `char.daily`, and its waypoint entry and result card are in `src/ui/daily.ts` |
| `src/game/wyrm.ts` | The Brass Wyrm: his lines, constants and states. The encounter itself is the `wyrm*` methods on `World`; what he remembers is in the quest log (`wyrm_errand`, `wyrm_fight`, `wyrm_theft`). The cave's entrance is added to the finished Gloomwood map without rolling dice, so the wood is unchanged |
| `src/game/hireling.ts` | Hirelings: the three kinds, their names and what they cost. They live in `world.minions` with `ally: 'hireling'` and are kept on the hero as `char.hireling` |
| `src/game/skilltree.ts` | Where each class's skills sit in the tree (`SKILL_TREES`: three branches, optional second column). Rows come from `reqLevel` and lines from `prereq`, so a new skill only needs adding to its branch. `tests/skilltree.test.ts` fails if a line would cross another skill |
| `src/render/` | Canvas renderer: isometric camera, procedural sprites, lighting, automap, item/skill icons |
| `src/render/ground.ts` | The floor as one picture: drawn once around the screen, shifted when the camera nears its edge (only the uncovered strip is drawn) and added to as tiles are explored. Lava and quicksand are drawn over it each frame |
| `src/render/figures.ts`, `creatures.ts`, `looks.ts` | Character art: the shading kit and humanoids, monster bodies, and what the hero and townsfolk wear |
| `gallery.html` | Dev-only page (`npm run dev`, then `/gallery.html`) showing every character model in several poses; `?zoom=4&m=imp,bat` narrows it |
| `src/ui/heroselect.ts` | The New Hero campfire scene and saved-hero portraits, drawn with the game's own figure code (`drawHumanoid`), so a new class or a change to a look shows up there with no extra art |
| `src/ui/` | DOM HUD, panels, title screen, input, audio, saves |
| `tests/` | Vitest suites (`bot.ts` is the playthrough bot used by `act.test.ts`; `balance.ts` turns its runs into `BALANCE.md`, and `balance.report.ts` is the runner behind `npm run balance`) |
| `e2e/` | Playwright specs. `perf.spec.ts` holds the canvas-call budgets for the world and for each monster, plain and tinted |
| `perf/`, `playwright.perf.config.ts`, `PERF.md` | `npm run perf`: frame rate, slowest frames, script time and canvas calls for an empty field and crowds of 3, 6 and 12 imps (plain, flashing, chilled) at pixel ratios 2 and 1. Headless Chromium paints in software, so compare runs rather than reading the frame rates as a phone's. `PERF_THROTTLE=1` runs at full speed, `PERF_OUT=path` writes somewhere else |
