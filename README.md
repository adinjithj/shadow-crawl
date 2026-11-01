# Shadow Crawl ⚔️

A traditional, grid-based, turn-based ASCII dungeon crawler built from scratch in vanilla modern JavaScript (ES6 Modules) and HTML5 Canvas.

Inspired by classic roguelike principles and Ido Yehieli's foundational architecture, **Shadow Crawl** demonstrates core game programming concepts—procedural level generation, field of view (FOV) raycasting, spatial hash lookup, bump-to-attack turn loops, and pursuit AI—with **zero external build tools or runtime dependencies**.

---

## ✨ Features

- **Procedural Dungeon Generation**: Randomized non-overlapping room carving connected via orthogonal L-shaped tunnels.
- **Dynamic Field of View (FOV)**: 360-degree raycasting with explored/unexplored fog-of-war states.
- **Classic Bump-to-Attack Combat**: Intuitive traditional roguelike controls—walk into monsters to melee strike.
- **Enemy AI & Turn System**: Coordinated turn loop where Goblins and Orcs track and pursue the hero once spotted.
- **Progression & Stats**: Player XP, level-ups (+HP & +Attack), health potions, and staircases descending into deeper dungeon depths.
- **Retro Monospace Aesthetic**: Pixel-crisp ASCII glyph rendering on high-DPI canvas with sleek terminal styling.
- **Zero Build Step**: Native browser ES modules—just open `index.html` or host with GitHub Pages.

---

## 🎮 Controls

| Key | Action |
| :--- | :--- |
| `W` `A` `S` `D` or `Arrow Keys` | Move / Bump Attack |
| `Space` or `.` | Wait / Skip Turn |
| `R` | Restart after Death |

### Glyph Legend
- `@` : Hero (Player)
- `g` : Goblin (Fast, light attack)
- `o` : Orc (Tougher brute)
- `!` : Health Potion (Restores 12 HP)
- `>` : Stone Stairs (Descend to next floor)
- `#` : Stone Wall
- `.` : Dungeon Floor

---

## 🏗️ Architecture & Codebase Structure

```
shadow-crawl/
├── index.html        # Main HTML layout, stats HUD, chronicle log & viewport
├── style.css         # Dark terminal CRT styling & responsive layout
├── src/
│   ├── config.js     # Global constants, glyphs, grid sizes, and color palettes
│   ├── display.js    # Canvas ASCII grid renderer with pixel alignment
│   ├── map.js        # 2D tile grid & procedural room-and-corridor generator
│   ├── entity.js     # Entity, Actor, Player, Monster, and Item class models
│   ├── fov.js        # Circular raycasting field-of-view algorithm
│   ├── ai.js         # Enemy behavior, sight checks, and pursuit pathing
│   └── main.js       # Game coordinator, turn cycle, combat calculations, and input
├── .env.example      # Graphify AI model configuration template
├── GEMINI.md         # Graphify knowledge graph instructions
└── README.md         # Documentation & portfolio showcase
```

---

## 🚀 Quick Start

### Option 1: Direct File (Recommended for Local Testing)
Because Shadow Crawl uses modern native ES Modules, run a lightweight static server from the project directory:

```bash
# Python 3
python -m http.server 8000

# Or with Node.js
npx serve .
```

Open your browser to `http://localhost:8000`.

### Option 2: GitHub Pages (Free Instant Web Deployment)
1. Push this repository to GitHub.
2. In your repo, go to **Settings** > **Pages**.
3. Under **Build and deployment** > **Source**, select `Deploy from a branch`.
4. Choose the `main` branch and `/ (root)` folder, then click **Save**.
5. Your game will be live on the web in seconds!

---

## 🧠 Knowledge Graph & Multi-Model AI with Graphify

This repository is integrated with [Graphify](https://github.com/safishamsi/graphify) to provide an automated AST knowledge graph and architecture map.

To build or update the graph:
```bash
graphify .
```

To switch models for semantic passes and reasoning, set the environment variables defined in `.env.example`:
```powershell
# Run 100% free locally with Ollama
$env:GRAPHIFY_BACKEND="ollama"
$env:OLLAMA_MODEL="qwen2.5-coder:7b"

# Or with cloud providers (Gemini, Claude, OpenAI, DeepSeek)
$env:GRAPHIFY_BACKEND="gemini"
$env:GEMINI_API_KEY="your-api-key"
```

---

## 📜 License

MIT License. Feel free to fork, expand, and use in your own portfolio projects!
