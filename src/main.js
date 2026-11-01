import { CONFIG } from './config.js';
import { Display } from './display.js';
import { GameMap } from './map.js';
import { Player, Monster, Item } from './entity.js';
import { FOV } from './fov.js';
import { AI } from './ai.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.display = new Display(this.canvas);
    this.map = new GameMap();
    this.dungeonFloor = 1;
    this.turnCount = 0;
    this.isGameOver = false;

    // Entities
    this.player = null;
    this.monsters = [];
    this.items = [];

    // Message Log
    this.messages = [];

    this.initFloor();
    this.setupInput();
    this.render();
  }

  log(message, type = 'default') {
    const logBox = document.getElementById('log-box');
    this.messages.push({ message, type });
    if (this.messages.length > 50) this.messages.shift();

    if (logBox) {
      const msgElem = document.createElement('div');
      msgElem.className = `log-entry log-${type}`;
      msgElem.textContent = message;
      logBox.appendChild(msgElem);
      logBox.scrollTop = logBox.scrollHeight;
    }
  }

  initFloor() {
    const { playerStart, rooms } = this.map.generateDungeon();

    if (!this.player) {
      this.player = new Player(playerStart.x, playerStart.y);
    } else {
      this.player.moveTo(playerStart.x, playerStart.y);
    }

    this.monsters = [];
    this.items = [];

    // Spawn monsters and items in rooms (except player starting room)
    for (let i = 1; i < rooms.length; i++) {
      const room = rooms[i];

      // Spawn 1-2 monsters
      const numMonsters = Math.floor(Math.random() * (CONFIG.MAX_MONSTERS_PER_ROOM + 1));
      for (let m = 0; m < numMonsters; m++) {
        const mx = Math.floor(Math.random() * (room.x2 - room.x1 - 1)) + room.x1 + 1;
        const my = Math.floor(Math.random() * (room.y2 - room.y1 - 1)) + room.y1 + 1;

        if (!this.getBlockingEntityAt(mx, my)) {
          const type = Math.random() < 0.7 ? 'goblin' : 'orc';
          this.monsters.push(new Monster(mx, my, type));
        }
      }

      // 40% chance of a potion in a room
      if (Math.random() < 0.4) {
        const px = Math.floor(Math.random() * (room.x2 - room.x1 - 1)) + room.x1 + 1;
        const py = Math.floor(Math.random() * (room.y2 - room.y1 - 1)) + room.y1 + 1;
        this.items.push(new Item(px, py, 'potion'));
      }
    }

    FOV.compute(this.map, this.player.x, this.player.y);
    this.log(`Entered Dungeon Floor ${this.dungeonFloor}. Tread carefully!`, 'gold');
    this.updateUI();
  }

  getBlockingEntityAt(x, y) {
    if (this.player && this.player.x === x && this.player.y === y) {
      return this.player;
    }
    return this.monsters.find(m => m.isAlive && m.x === x && m.y === y) || null;
  }

  attack(attacker, defender) {
    const damage = defender.takeDamage(attacker.attackPower);
    const color = defender === this.player ? 'danger' : 'success';

    if (damage > 0) {
      this.log(`${attacker.name} strikes ${defender.name} for ${damage} damage!`, color);
    } else {
      this.log(`${attacker.name}'s attack glances off ${defender.name}'s armor.`, 'muted');
    }

    if (!defender.isAlive) {
      if (defender === this.player) {
        this.log(`You have been slain by ${attacker.name}! Press 'R' to restart.`, 'danger');
        this.isGameOver = true;
      } else {
        this.log(`${defender.name} dies!`, 'gold');
        this.player.xp += defender.name === 'Orc' ? 35 : 20;
        this.checkLevelUp();
      }
    }
  }

  checkLevelUp() {
    if (this.player.xp >= this.player.xpToNext) {
      this.player.level++;
      this.player.xp -= this.player.xpToNext;
      this.player.xpToNext = Math.floor(this.player.xpToNext * 1.5);
      this.player.maxHp += 8;
      this.player.hp = this.player.maxHp;
      this.player.attackPower += 2;
      this.log(`Level Up! You are now Level ${this.player.level}! (+8 Max HP, +2 ATK)`, 'gold');
    }
  }

  handlePlayerTurn(dx, dy) {
    if (this.isGameOver) return;

    const targetX = this.player.x + dx;
    const targetY = this.player.y + dy;

    // Check bounds & wall
    if (this.map.isBlocked(targetX, targetY)) {
      return; // Can't walk into walls
    }

    // Check if monster at target -> bump attack
    const targetMonster = this.monsters.find(m => m.isAlive && m.x === targetX && m.y === targetY);
    if (targetMonster) {
      this.attack(this.player, targetMonster);
      this.endTurn();
      return;
    }

    // Move player
    this.player.moveTo(targetX, targetY);

    // Check items pickup
    const itemIndex = this.items.findIndex(it => it.x === targetX && it.y === targetY);
    if (itemIndex !== -1) {
      const item = this.items[itemIndex];
      const healed = this.player.heal(item.healAmount);
      this.items.splice(itemIndex, 1);
      this.log(`You drank a ${item.name} and recovered ${healed} HP!`, 'success');
    }

    // Check stairs down
    if (this.map.stairsLocation && targetX === this.map.stairsLocation.x && targetY === this.map.stairsLocation.y) {
      this.dungeonFloor++;
      this.log(`You descend the dark stone stairs to floor ${this.dungeonFloor}...`, 'gold');
      this.initFloor();
      this.render();
      return;
    }

    this.endTurn();
  }

  endTurn() {
    this.turnCount++;

    // Enemy turns
    for (const monster of this.monsters) {
      if (monster.isAlive) {
        AI.takeTurn(monster, this);
      }
    }

    // Filter dead monsters
    this.monsters = this.monsters.filter(m => m.isAlive);

    // Update FOV & UI
    FOV.compute(this.map, this.player.x, this.player.y);
    this.updateUI();
    this.render();
  }

  restart() {
    this.dungeonFloor = 1;
    this.turnCount = 0;
    this.isGameOver = false;
    this.player = null;
    this.messages = [];
    const logBox = document.getElementById('log-box');
    if (logBox) logBox.innerHTML = '';
    this.initFloor();
    this.render();
    this.log('A new adventure begins in the shadows.', 'gold');
  }

  updateUI() {
    const hpBar = document.getElementById('hp-bar');
    const hpText = document.getElementById('hp-text');
    const floorText = document.getElementById('floor-text');
    const turnText = document.getElementById('turn-text');
    const levelText = document.getElementById('level-text');

    if (this.player) {
      const hpPercent = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
      if (hpBar) hpBar.style.width = `${hpPercent}%`;
      if (hpText) hpText.textContent = `${this.player.hp} / ${this.player.maxHp}`;
      if (floorText) floorText.textContent = `B${this.dungeonFloor}`;
      if (turnText) turnText.textContent = this.turnCount;
      if (levelText) levelText.textContent = `Lv ${this.player.level} (${this.player.xp}/${this.player.xpToNext} XP)`;
    }
  }

  render() {
    this.display.clear();

    // 1. Render Map Tiles
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        const tile = this.map.tiles[y][x];

        if (tile.visible) {
          const color = tile.type === CONFIG.GLYPHS.WALL ? CONFIG.COLORS.WALL_LIT : CONFIG.COLORS.FLOOR_LIT;
          this.display.draw(x, y, tile.type, color);
        } else if (tile.explored) {
          const color = tile.type === CONFIG.GLYPHS.WALL ? CONFIG.COLORS.WALL_DARK : CONFIG.COLORS.FLOOR_DARK;
          this.display.draw(x, y, tile.type, color);
        }
      }
    }

    // 2. Render Stairs (if explored or visible)
    if (this.map.stairsLocation) {
      const sx = this.map.stairsLocation.x;
      const sy = this.map.stairsLocation.y;
      if (this.map.tiles[sy][sx].visible || this.map.tiles[sy][sx].explored) {
        this.display.draw(sx, sy, CONFIG.GLYPHS.STAIRS_DOWN, CONFIG.COLORS.STAIRS);
      }
    }

    // 3. Render Items (if in visible tile)
    for (const item of this.items) {
      if (this.map.tiles[item.y][item.x].visible) {
        this.display.draw(item.x, item.y, item.char, item.color);
      }
    }

    // 4. Render Monsters (if in visible tile)
    for (const monster of this.monsters) {
      if (monster.isAlive && this.map.tiles[monster.y][monster.x].visible) {
        this.display.draw(monster.x, monster.y, monster.char, monster.color);
      }
    }

    // 5. Render Player
    if (this.player && this.player.isAlive) {
      this.display.draw(this.player.x, this.player.y, this.player.char, this.player.color);
    }

    // 6. Game Over Overlay
    if (this.isGameOver) {
      const ctx = this.display.ctx;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = CONFIG.COLORS.TEXT_DANGER;
      ctx.font = `bold 28px ${CONFIG.FONT_FAMILY}`;
      ctx.fillText('YOU HAVE DIED', this.canvas.width / 2, this.canvas.height / 2 - 20);

      ctx.fillStyle = CONFIG.COLORS.TEXT_DEFAULT;
      ctx.font = `18px ${CONFIG.FONT_FAMILY}`;
      ctx.fillText("Press 'R' or Space to Restart", this.canvas.width / 2, this.canvas.height / 2 + 25);
    }
  }

  setupInput() {
    window.addEventListener('keydown', (e) => {
      if (this.isGameOver) {
        if (e.key === 'r' || e.key === 'R' || e.key === ' ') {
          this.restart();
        }
        return;
      }

      let dx = 0;
      let dy = 0;

      switch (e.key) {
        // Arrow Keys & WASD
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'k':
          dy = -1;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
        case 'j':
          dy = 1;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'h':
          dx = -1;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
        case 'l':
          dx = 1;
          break;

        // Wait a turn
        case '.':
        case '5':
        case ' ':
          this.endTurn();
          return;

        default:
          return;
      }

      e.preventDefault();
      this.handlePlayerTurn(dx, dy);
    });
  }
}

// Bootstrap game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
