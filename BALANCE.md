# Hellforge balance report

Made by `npm run balance` from version 0.24.0: the playthrough bot (`tests/bot.ts`) plays every class through all three acts on Normal, on seeds 99, 7, 77, and the numbers below are averages over those runs.

The bot does not kite, never goes to town, hires no one and drinks a potion whenever it is hurt, so its numbers are not a player's. What they are good for is comparing the classes with each other, and comparing a change with the report before it. A class is flagged when it is out of line with the median of the classes.

To see what a change did, run it again and read the diff of this file.

## What stands out

### Likely problems

- **Huntress, Sunken Chapel**: boss survived 2 of 3 runs
- **Huntress, Sunken Chapel**: only 56% of the area cleared
- **Huntress, Catacombs Level 2**: boss survived 1 of 3 runs
- **Huntress, The Hellforge**: boss survived 1 of 3 runs
- **Reaver, The Noon Vault**: boss survived 1 of 3 runs
- **Huntress, The Noon Vault**: boss survived 2 of 3 runs
- **Arcanist, The Bellfounders' Halls**: boss survived 2 of 3 runs
- **Forgewright, The Bellfounders' Halls**: boss survived 1 of 3 runs
- **Arcanist, The Cold Furnace**: only 60% of the area cleared
- **Necromancer, The Cold Furnace**: only 60% of the area cleared
- **Huntress, Act 1**: 41 deaths a run, against a median of 16
- **Huntress, Act 2**: 107 deaths a run, against a median of 22
- **Arcanist, Act 3**: 229 deaths a run, against a median of 33

### Worth a look

- Huntress, Sunken Chapel: 703s, against a median of 213s
- Huntress, Catacombs Level 2: 472s, against a median of 210s
- Huntress, The Hellforge: 469s, against a median of 250s
- Huntress, The Glass Sea: 423s, against a median of 170s
- Forgewright, Carrion Mesa: 492s, against a median of 165s
- Huntress, The Noon Vault: 683s, against a median of 309s
- Arcanist, The Bellfounders' Halls: 847s, against a median of 426s
- Arcanist, The Hellforge's Heart: 614s, against a median of 349s
- Reaver, Act 1: 268 potions a run, against a median of 130
- Huntress, Act 1: 555 potions a run, against a median of 130
- Huntress, Act 2: 513 potions a run, against a median of 182
- Necromancer, Act 2: 3 deaths a run, against a median of 22: much safer than the rest
- Forgewright, Act 2: 3 deaths a run, against a median of 22: much safer than the rest
- Hiveborn, Act 2: 6 deaths a run, against a median of 22: much safer than the rest
- Forgewright, Act 3: 7 deaths a run, against a median of 33: much safer than the rest

An area left mostly uncleared can mean the bot got stuck there rather than that the class is weak: check the time it spent.

## By act

Time, deaths and potions are totals for the act. Time to kill is seconds per monster killed.

### Act 1

| Class | Time | Deaths | Potions | Time to kill | Cleared | Bosses killed |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Reaver | 26:04 | 28 | 268 | 3.9s | 90% | 12/12 |
| Arcanist | 18:02 | 13 | 76 | 2.7s | 91% | 12/12 |
| Huntress | 38:35 | 41 | 555 | 6.6s | 79% | 8/12 |
| Necromancer | 18:45 | 6 | 89 | 2.8s | 91% | 12/12 |
| Forgewright | 20:15 | 15 | 131 | 3.0s | 91% | 12/12 |
| Hiveborn | 19:59 | 18 | 130 | 2.9s | 92% | 12/12 |

### Act 2

| Class | Time | Deaths | Potions | Time to kill | Cleared | Bosses killed |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Reaver | 30:03 | 39 | 345 | 4.5s | 92% | 11/12 |
| Arcanist | 24:41 | 43 | 140 | 3.7s | 93% | 12/12 |
| Huntress | 33:42 | 107 | 513 | 5.2s | 90% | 10/12 |
| Necromancer | 14:24 | 3.3 | 53 | 2.1s | 93% | 12/12 |
| Forgewright | 25:14 | 3 | 179 | 3.9s | 89% | 12/12 |
| Hiveborn | 19:39 | 6 | 184 | 2.9s | 94% | 12/12 |

### Act 3

| Class | Time | Deaths | Potions | Time to kill | Cleared | Bosses killed |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Reaver | 29:05 | 47 | 304 | 6.3s | 93% | 9/9 |
| Arcanist | 44:56 | 229 | 363 | 10.9s | 83% | 7/9 |
| Huntress | 32:34 | 61 | 377 | 7.5s | 88% | 9/9 |
| Necromancer | 19:38 | 19 | 58 | 4.6s | 87% | 9/9 |
| Forgewright | 24:29 | 7 | 120 | 5.5s | 91% | 8/9 |
| Hiveborn | 21:11 | 20 | 165 | 4.6s | 94% | 9/9 |

## By area

Each cell is time in the area / deaths / potions. A dagger marks a boss that survived at least one run.

| Area | Level in | Reaver | Arcanist | Huntress | Necromancer | Forgewright | Hiveborn |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Cinder Fields | 1 | 2:57 / 0.3 / 30 | 2:13 / 0.7 / 11 | 2:38 / 0 / 17 | 2:20 / 0.3 / 16 | 2:43 / 0.3 / 19 | 2:12 / 0 / 13 |
| Hollow Cave | 3.1 | 2:30 / 1 / 25 | 1:28 / 0.3 / 3.7 | 2:19 / 1.3 / 17 | 1:52 / 0.7 / 11 | 2:42 / 3.3 / 22 | 1:53 / 0 / 12 |
| Gloomwood | 5.3 | 2:43 / 0.3 / 15 | 2:30 / 0.3 / 6 | 2:35 / 0.3 / 20 | 2:22 / 0 / 8.3 | 2:35 / 0 / 8.3 | 2:26 / 0 / 8 |
| Sunken Chapel | 7.3 | 4:32 / 12 / 41 | 2:37 / 3.3 / 13 | 11:43 / 11 / 224 † | 3:06 / 2.7 / 20 | 3:45 / 6.3 / 26 | 3:21 / 10 / 25 |
| Catacombs Level 1 | 9.9 | 3:38 / 3 / 35 | 1:49 / 0.3 / 6 | 3:40 / 9 / 42 | 2:53 / 1 / 16 | 2:34 / 2 / 14 | 2:55 / 2.7 / 21 |
| Catacombs Level 2 | 13 | 5:04 / 3.7 / 66 | 2:47 / 2.7 / 13 | 7:52 / 12 / 143 † | 3:29 / 1 / 12 | 3:00 / 2 / 24 | 3:30 / 2.3 / 25 |
| The Hellforge | 16 | 4:39 / 7.3 / 56 | 4:37 / 5.7 / 23 | 7:49 / 6.3 / 93 † | 2:44 / 0.3 / 7 | 2:56 / 0.7 / 19 | 3:43 / 2.7 / 26 |
| The Ashfall Road | 19 | 1:52 / 0 / 13 | 1:53 / 0.3 / 3.7 | 1:52 / 0.3 / 18 | 1:45 / 0 / 5.7 | 1:35 / 0 / 4 | 1:29 / 0 / 6.3 |
| Cistern of Whispers | 21 | 2:34 / 0.3 / 33 | 2:23 / 2.7 / 12 | 2:03 / 1 / 20 | 1:33 / 0.3 / 5.7 | 2:03 / 0.3 / 17 | 1:45 / 0 / 17 |
| The Glass Sea | 23 | 3:15 / 0.3 / 37 | 2:53 / 3.3 / 10 | 7:03 / 6.7 / 141 | 2:11 / 0.7 / 11 | 2:47 / 0.3 / 21 | 2:31 / 0.7 / 23 |
| Carrion Mesa | 25 | 3:34 / 1.3 / 37 | 2:36 / 2 / 12 | 2:53 / 2.3 / 32 | 1:53 / 0.7 / 6.7 | 8:12 / 1 / 65 | 2:34 / 0.7 / 24 |
| Buried Imhara: The Bazaar | 27 | 3:01 / 2.3 / 34 | 2:52 / 5.3 / 18 | 2:14 / 1.7 / 22 | 1:41 / 0 / 4.3 | 1:59 / 0 / 9.3 | 2:17 / 0.3 / 15 |
| Buried Imhara: Hall of Dials | 28 | 7:39 / 12 / 82 | 6:46 / 19 / 47 | 6:15 / 13 / 85 | 2:59 / 1 / 12 | 3:48 / 0 / 29 | 4:04 / 2 / 37 |
| The Noon Vault | 31 | 8:08 / 23 / 109 † | 5:18 / 9.7 / 36 | 11:23 / 81 / 195 † | 2:23 / 0.7 / 8.7 | 4:50 / 1.3 / 35 | 4:59 / 2.3 / 62 |
| Rimefall Pass | 33 | 4:12 / 3 / 39 | 3:39 / 5.3 / 15 | 4:01 / 7 / 46 | 2:34 / 1.7 / 7.3 | 2:40 / 0.3 / 12 | 2:59 / 1 / 21 |
| The Drowned Mines | 35 | 7:21 / 20 / 82 | 8:30 / 45 / 60 | 6:09 / 19 / 71 | 2:42 / 2.3 / 10 | 4:59 / 2.3 / 25 | 4:34 / 4.7 / 38 |
| The Bellfounders' Halls | 37 | 6:19 / 11 / 63 | 14:07 / 121 / 145 † | 7:52 / 12 / 94 | 4:05 / 3 / 16 | 9:35 / 2.7 / 46 † | 5:57 / 5 / 50 |
| The Cold Furnace | 40 | 4:31 / 4.7 / 42 | 8:26 / 13 / 86 | 7:32 / 4 / 85 | 6:40 / 1.7 / 6 | 3:15 / 1 / 13 | 2:44 / 1.7 / 15 |
| The Hellforge's Heart | 41 | 6:41 / 7.7 / 78 | 10:14 / 45 / 58 | 6:59 / 18 / 81 | 3:37 / 10 / 19 | 4:00 / 0.7 / 25 | 4:57 / 7.7 / 42 |
