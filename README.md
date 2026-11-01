# Shadow Crawl ⚔️

A traditional, grid-based, turn-based ASCII dungeon crawler built from scratch in vanilla modern JavaScript (ES6 Modules) and HTML5 Canvas.

Inspired by classic roguelike principles and Ido Yehieli's foundational architecture, **Shadow Crawl** demonstrates core game programming concepts—procedural level generation, field of view (FOV) raycasting, spatial hash lookup, bump-to-attack combat, pursuit AI, 8-bit procedural sound synthesis, and inventory/equipment systems—with **zero external build tools or runtime dependencies**.

---

## ✨ Features

- **Procedural Dungeon Generation**: Randomized non-overlapping room carving connected via orthogonal L-shaped tunnels across 5 escalating dungeon depths.
- **Dynamic Field of View (FOV)**: 360-degree circular raycasting with explored/unexplored fog-of-war states.
- **Classic Bump-to-Attack Combat**: Intuitive traditional roguelike controls—walk into monsters to melee strike with equipment-scaled damage.
- **Bestiary & Floor Biomes**:
  - `g` **Goblin Scout**: Quick dungeon pests (Floors 1-2).
  - `o` **Orc Warrior**: Sturdy brutes with shields (Floors 2-3).
  - `s` **Skeleton Knight**: Armored undead warriors (Floors 3-4).
  - `D` **Shadow Drake**: High HP cavern dragons with devastating attack power (Floors 4-5).
  - `Ω` **Shadow Lord Malakor**: Final boss lurking on Floor B5. Defeating him yields the **Amulet of Yendor** (`*`)!
- **Inventory & Satchel System (Slots 1-5)**:
  - **Weapons** (`/`): Dagger (+2 ATK), Iron Longsword (+5 ATK), Sunblade (+9 ATK).
  - **Armors** (`]`): Leather Tunic (+1 DEF), Chainmail (+3 DEF), Dragon Scale (+5 DEF).
  - **Scroll of Lightning** (`?`): Unleashes a crackling electrical bolt striking the nearest visible foe for 25 damage.
  - **Scroll of Teleport** (`?`): Warps reality to instantly relocate the hero to a safe room.
  - **Health Potions** (`!`): Regular (+15 HP) and Greater (+30 HP).
  - **Gold Coins** (`$`): Collectible currency tracked throughout your run.
- **8-Bit Procedural Web Audio Engine**: Dynamic real-time sound synthesis using the browser's Web Audio API (slashes, damage crunches, potion chimes, level-up fanfares, and boss defeats). Toggleable via the `🔊 Sound` button.
- **Visual Juice**: Floating damage numbers (`-12`, `+15 HP`, `LEVEL UP!`), screen-shake on heavy impacts, and Victory/Defeat game state overlays.
- **Zero Build Step**: Native browser ES modules—just open `index.html` or host with GitHub Pages.

---

## 🎮 Controls

| Key | Action |
| :--- | :--- |
| `W` `A` `S` `D` or `Arrow Keys` | Move / Bump Attack |
| `1` - `5` or `Click Slot` | Use Consumable / Equip Weapon or Armor |
| `Space` or `.` | Wait / Skip 1 Turn |
| `R` | Restart after Death or Victory |

### Glyph Legend
- `@` : Hero (Player)
- `g` : Goblin Scout
- `o` : Orc Warrior
- `s` : Skeleton Knight
- `D` : Shadow Drake
- `Ω` : Shadow Lord Malakor (Boss)
- `!` : Health Potion
- `?` : Mystic Scroll (Lightning / Teleport)
- `/` : Weapon
- `]` : Armor
- `$` : Gold Coins
- `*` : Amulet of Yendor (Victory Objective)
- `>` : Stone Stairs (Descend to next floor)
- `#` : Stone Wall
- `.` : Dungeon Floor

---

## 🏗️ Architecture & Codebase Structure

```
shadow-crawl/
├── index.html        # Main layout, HUD ribbon, inventory hotbar & canvas viewport
├── style.css         # Dark terminal CRT styling & responsive hotbar/log layout
├── src/
│   ├── config.js     # Global constants, glyphs, grid sizes, and color palettes
│   ├── display.js    # Canvas ASCII grid renderer, screen-shake & floating text FX
│   ├── map.js        # 2D tile grid & procedural room-and-corridor generator
│   ├── entity.js     # Entity, Actor, Player (with gear/satchel), and Monster classes
│   ├── items.js      # Item definitions, types, random floor loot generators
│   ├── audio.js      # 8-bit procedural sound synthesizer (Web Audio API)
│   ├── fov.js        # Circular raycasting field-of-view algorithm
│   ├── ai.js         # Enemy behavior, sight checks, and pursuit pathing
│   └── main.js       # Turn coordinator, input dispatcher, and animation loop
├── .env.example      # Graphify AI model configuration template
├── GEMINI.md         # Graphify knowledge graph instructions
└── README.md         # Documentation & portfolio showcase
```

---

## 🚀 Quick Start

### Run Locally (Recommended)
Because Shadow Crawl uses modern native ES Modules, serve it with any lightweight static server:

```bash
# Python 3
python -m http.server 8000

# Or with Node.js
npx serve .
```

Open your browser to `http://localhost:8000`.

### Play Online on GitHub Pages
Shadow Crawl is deployed live at:
👉 **[https://adinjithj.github.io/shadow-crawl/](https://adinjithj.github.io/shadow-crawl/)**

---

## 🧠 Knowledge Graph & Multi-Model AI with Graphify

This repository is integrated with [Graphify](https://github.com/safishamsi/graphify) to provide an automated AST knowledge graph and architecture map.

To update the knowledge graph on code modifications:
```bash
python -m graphify update .
```

To switch backends for semantic passes, configure environment variables as described in `.env.example`:
```powershell
# Free local inference with Ollama
$env:GRAPHIFY_BACKEND="ollama"
$env:OLLAMA_MODEL="qwen2.5-coder:7b"

# Or with cloud providers (Gemini, Claude, OpenAI, DeepSeek)
$env:GRAPHIFY_BACKEND="gemini"
$env:GEMINI_API_KEY="your-api-key"
```

---

## 📜 License

MIT License. Free to use, adapt, and expand for your own games and portfolio projects!
