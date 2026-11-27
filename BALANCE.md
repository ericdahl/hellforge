# Hellforge balance report

Made by `npm run balance` from version 0.27.0: the playthrough bot (`tests/bot.ts`) plays every class through all three acts on Normal, on seeds 99, 7, 77, and the numbers below are averages over those runs.

The bot does not kite, never goes to town, hires no one and drinks a potion whenever it is hurt, so its numbers are not a player's. What they are good for is comparing the classes with each other, and comparing a change with the report before it. A class is flagged when it is out of line with the median of the classes.

To see what a change did, run it again and read the diff of this file.

## What stands out

### Likely problems

- **Huntress, Hollow Cave**: boss survived 2 of 3 runs
- **Huntress, Catacombs Level 2**: boss survived 1 of 3 runs
- **Huntress, Carrion Mesa**: boss survived 1 of 3 runs
- **Arcanist, Buried Imhara: Hall of Dials**: boss survived 1 of 3 runs
- **Reaver, The Noon Vault**: boss survived 1 of 3 runs
- **Arcanist, The Bellfounders' Halls**: boss survived 3 of 3 runs
- **Huntress, The Bellfounders' Halls**: boss survived 1 of 3 runs
- **Arcanist, The Cold Furnace**: only 60% of the area cleared
- **Huntress, The Cold Furnace**: only 60% of the area cleared
- **Necromancer, The Cold Furnace**: only 60% of the area cleared
- **Huntress, Act 1**: 49 deaths a run, against a median of 15
- **Arcanist, Act 2**: 150 deaths a run, against a median of 21
- **Huntress, Act 2**: 95 deaths a run, against a median of 21
- **Arcanist, Act 3**: 195 deaths a run, against a median of 26
- **Huntress, Act 3**: 122 deaths a run, against a median of 26

### Worth a look

- Huntress, Hollow Cave: 644s, against a median of 132s
- Huntress, Sunken Chapel: 388s, against a median of 208s
- Huntress, Catacombs Level 2: 475s, against a median of 221s
- Huntress, The Glass Sea: 460s, against a median of 169s
- Huntress, Carrion Mesa: 535s, against a median of 180s
- Huntress, Rimefall Pass: 376s, against a median of 199s
- Arcanist, The Bellfounders' Halls: 900s, against a median of 421s
- Huntress, Act 1: 534 potions a run, against a median of 131
- Huntress, Act 2: 676 potions a run, against a median of 221
- Necromancer, Act 2: 4 deaths a run, against a median of 21: much safer than the rest
- Forgewright, Act 2: 4 deaths a run, against a median of 21: much safer than the rest
- Huntress, Act 3: 608 potions a run, against a median of 226
- Necromancer, Act 3: 3 deaths a run, against a median of 26: much safer than the rest

An area left mostly uncleared can mean the bot got stuck there rather than that the class is weak: check the time it spent.

## By act

Time, deaths and potions are totals for the act. Time to kill is seconds per monster killed.

### Act 1

| Class | Time | Deaths | Potions | Time to kill | Cleared | Bosses killed |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Reaver | 26:00 | 29 | 237 | 3.9s | 91% | 12/12 |
| Arcanist | 17:57 | 13 | 69 | 2.7s | 91% | 12/12 |
| Huntress | 37:31 | 49 | 534 | 5.9s | 85% | 9/12 |
| Necromancer | 17:39 | 6 | 87 | 2.7s | 90% | 12/12 |
| Forgewright | 20:29 | 14 | 141 | 3.0s | 92% | 12/12 |
| Hiveborn | 21:04 | 16 | 122 | 3.1s | 92% | 12/12 |

### Act 2

| Class | Time | Deaths | Potions | Time to kill | Cleared | Bosses killed |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Reaver | 37:52 | 27 | 384 | 5.7s | 92% | 11/12 |
| Arcanist | 29:50 | 150 | 233 | 4.5s | 92% | 11/12 |
| Huntress | 42:40 | 95 | 676 | 6.8s | 87% | 11/12 |
| Necromancer | 15:05 | 3.7 | 67 | 2.2s | 93% | 12/12 |
| Forgewright | 20:52 | 4 | 134 | 3.2s | 91% | 12/12 |
| Hiveborn | 22:01 | 16 | 209 | 3.2s | 94% | 12/12 |

### Act 3

| Class | Time | Deaths | Potions | Time to kill | Cleared | Bosses killed |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Reaver | 31:44 | 35 | 290 | 6.9s | 94% | 9/9 |
| Arcanist | 44:09 | 195 | 332 | 10.7s | 83% | 6/9 |
| Huntress | 45:47 | 122 | 608 | 10.6s | 88% | 8/9 |
| Necromancer | 17:09 | 3 | 46 | 4.0s | 88% | 9/9 |
| Forgewright | 22:16 | 9.3 | 138 | 4.9s | 93% | 9/9 |
| Hiveborn | 22:22 | 17 | 162 | 4.9s | 93% | 9/9 |

## By area

Each cell is time in the area / deaths / potions. A dagger marks a boss that survived at least one run.

| Area | Level in | Reaver | Arcanist | Huntress | Necromancer | Forgewright | Hiveborn |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Cinder Fields | 1 | 2:57 / 0.3 / 30 | 2:13 / 0.7 / 11 | 2:38 / 0 / 17 | 2:20 / 0.3 / 16 | 2:43 / 0.3 / 19 | 2:12 / 0 / 13 |
| Hollow Cave | 3.1 | 2:30 / 1 / 22 | 1:28 / 0.3 / 3.3 | 10:44 / 1.3 / 138 † | 1:50 / 0.7 / 11 | 2:42 / 3.3 / 22 | 1:54 / 0 / 11 |
| Gloomwood | 5.3 | 2:56 / 0.7 / 8 | 2:29 / 0.3 / 4.7 | 2:27 / 0 / 14 | 2:18 / 0 / 9 | 2:52 / 0.3 / 10 | 2:26 / 0 / 4.3 |
| Sunken Chapel | 7.3 | 4:54 / 16 / 38 | 2:05 / 0 / 9 | 6:28 / 29 / 98 | 2:59 / 2.7 / 17 | 3:32 / 6.7 / 26 | 3:24 / 7.3 / 22 |
| Catacombs Level 1 | 10 | 3:54 / 2 / 36 | 1:48 / 0.3 / 6 | 3:18 / 6.7 / 48 | 2:47 / 1 / 16 | 2:44 / 2 / 19 | 2:56 / 0.7 / 20 |
| Catacombs Level 2 | 12 | 5:28 / 6.7 / 66 | 3:05 / 4.3 / 12 | 7:55 / 5.7 / 166 † | 3:11 / 1 / 14 | 3:03 / 0.7 / 28 | 4:11 / 5.3 / 28 |
| The Hellforge | 16 | 3:23 / 2.7 / 37 | 4:49 / 7 / 22 | 4:01 / 6 / 53 | 2:14 / 0.3 / 3 | 2:53 / 1 / 17 | 4:02 / 2.7 / 24 |
| The Ashfall Road | 20 | 1:53 / 0 / 7.3 | 2:02 / 0.3 / 2.3 | 2:11 / 0 / 26 | 1:53 / 0 / 6.3 | 1:36 / 0 / 3.7 | 1:29 / 0 / 4.3 |
| Cistern of Whispers | 21 | 2:54 / 0.7 / 25 | 2:42 / 3 / 10 | 3:17 / 5.3 / 46 | 1:32 / 0.3 / 5.7 | 2:03 / 0 / 13 | 1:45 / 0 / 13 |
| The Glass Sea | 23 | 3:50 / 0.3 / 35 | 2:52 / 2.7 / 13 | 7:40 / 5 / 167 | 2:09 / 0.7 / 13 | 2:45 / 1 / 15 | 2:33 / 0.7 / 21 |
| Carrion Mesa | 25 | 5:04 / 1.3 / 49 | 3:25 / 7 / 19 | 8:55 / 20 / 107 † | 1:45 / 0.3 / 8 | 2:34 / 0.3 / 20 | 2:27 / 1 / 23 |
| Buried Imhara: The Bazaar | 27 | 4:03 / 0 / 30 | 2:38 / 6 / 18 | 3:21 / 7.3 / 49 | 1:45 / 0 / 6.3 | 2:30 / 0.3 / 10 | 1:58 / 0 / 15 |
| Buried Imhara: Hall of Dials | 28 | 12:08 / 15 / 140 | 11:09 / 122 / 139 † | 9:33 / 41 / 149 | 2:55 / 0.3 / 12 | 5:01 / 1 / 37 | 5:26 / 4 / 53 |
| The Noon Vault | 31 | 8:00 / 9.3 / 98 † | 5:02 / 9.7 / 32 | 7:43 / 16 / 133 | 3:05 / 2 / 16 | 4:22 / 1.3 / 34 | 6:23 / 10 / 80 |
| Rimefall Pass | 33 | 5:36 / 4.7 / 41 | 3:30 / 5.3 / 13 | 6:16 / 12 / 85 | 2:32 / 0 / 9.3 | 3:08 / 1 / 14 | 2:48 / 1.3 / 18 |
| The Drowned Mines | 35 | 7:53 / 14 / 78 | 7:54 / 34 / 48 | 9:47 / 38 / 132 | 2:09 / 0 / 4 | 5:04 / 3.7 / 28 | 4:25 / 4.3 / 43 |
| The Bellfounders' Halls | 38 | 6:03 / 2.3 / 58 | 15:00 / 94 / 132 † | 11:44 / 25 / 158 † | 3:58 / 1.7 / 18 | 5:56 / 1.3 / 43 | 7:59 / 5 / 51 |
| The Cold Furnace | 40 | 4:51 / 3.3 / 40 | 8:10 / 14 / 83 | 8:56 / 12 / 107 | 6:18 / 0.3 / 8.3 | 3:27 / 1 / 14 | 2:51 / 0.7 / 18 |
| The Hellforge's Heart | 41 | 7:22 / 11 / 73 | 9:35 / 48 / 55 | 9:04 / 35 / 127 | 2:11 / 1 / 6.3 | 4:40 / 2.3 / 39 | 4:20 / 5.3 / 32 |
