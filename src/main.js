import { CONFIG } from './config.js';
import { Display } from './display.js';
import { GameMap } from './map.js';
import { Player, Monster } from './entity.js';
import { Item, ITEM_TYPES } from './items.js';
import { FOV } from './fov.js';
import { AI } from './ai.js';
import { audio } from './audio.js';

export class Game {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.display = new Display(this.canvas);
    this.map = new GameMap();
    this.dungeonFloor = 1;
    this.turnCount = 0;
    this.isGameOver = false;
    this.isVictory = false;

    // Entities
    this.player = null;
    this.monsters = [];
    this.items = [];

    // Message Log
    this.messages = [];

    this.initAudioButton();
    this.initFloor();
    this.setupInput();
    this.startAnimationLoop();
  }

  initAudioButton() {
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.textContent = audio.muted ? '🔇 Sound: OFF' : '🔊 Sound: ON';
      audioBtn.addEventListener('click', () => {
        audio.init();
        const isMuted = audio.toggleMute();
        audioBtn.textContent = isMuted ? '🔇 Sound: OFF' : '🔊 Sound: ON';
      });
    }
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
    const { playerStart, rooms, bossRoom } = this.map.generateDungeon(this.dungeonFloor);

    if (!this.player) {
      this.player = new Player(playerStart.x, playerStart.y);
    } else {
      this.player.moveTo(playerStart.x, playerStart.y);
    }

    this.monsters = [];
    this.items = [];

    // Special Boss Floor (Floor 5)
    if (this.dungeonFloor === CONFIG.MAX_DUNGEON_FLOORS && bossRoom) {
      const boss = new Monster(bossRoom.center.x, bossRoom.center.y, 'boss');
      this.monsters.push(boss);
      this.log('A terrifying chill grips your soul... The Shadow Lord awaits!', 'danger');
    }

    // Spawn monsters & items in normal rooms
    for (let i = 1; i < rooms.length; i++) {
      const room = rooms[i];
      if (room === bossRoom) continue;

      // Spawn 1-2 Monsters
      const numMonsters = Math.floor(Math.random() * (CONFIG.MAX_MONSTERS_PER_ROOM + 1));
      for (let m = 0; m < numMonsters; m++) {
        const mx = Math.floor(Math.random() * (room.x2 - room.x1 - 1)) + room.x1 + 1;
        const my = Math.floor(Math.random() * (room.y2 - room.y1 - 1)) + room.y1 + 1;

        if (!this.getBlockingEntityAt(mx, my)) {
          this.monsters.push(Monster.createForFloor(mx, my, this.dungeonFloor));
        }
      }

      // 45% chance for ground loot in room
      if (Math.random() < 0.45) {
        const px = Math.floor(Math.random() * (room.x2 - room.x1 - 1)) + room.x1 + 1;
        const py = Math.floor(Math.random() * (room.y2 - room.y1 - 1)) + room.y1 + 1;
        this.items.push(Item.createRandom(px, py, this.dungeonFloor));
      }
    }

    FOV.compute(this.map, this.player.x, this.player.y);
    this.log(`Entered Dungeon Floor B${this.dungeonFloor}.`, 'gold');
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
      this.display.addFloatingText(defender.x, defender.y, `-${damage}`, defender === this.player ? '#f85149' : '#e3b341');

      if (defender === this.player) {
        audio.playerHurt();
        this.display.triggerShake(5);
      } else {
        audio.hit();
      }
    } else {
      this.log(`${attacker.name}'s strike glances off ${defender.name}'s defense.`, 'muted');
    }

    if (!defender.isAlive) {
      if (defender === this.player) {
        audio.gameOver();
        this.log(`You have been slain by ${attacker.name}! Press 'R' to restart.`, 'danger');
        this.isGameOver = true;
      } else {
        audio.monsterDeath();
        this.log(`${defender.name} is vanquished!`, 'gold');
        
        // XP Reward
        let xpReward = 20;
        if (defender.monsterType === 'orc') xpReward = 35;
        if (defender.monsterType === 'skeleton') xpReward = 50;
        if (defender.monsterType === 'drake') xpReward = 80;
        if (defender.monsterType === 'boss') {
          xpReward = 250;
          // Boss drops Amulet of Yendor
          this.items.push(new Item(defender.x, defender.y, ITEM_TYPES.AMULET));
          this.log('The Shadow Lord drops the radiant Amulet of Yendor!', 'gold');
        }

        this.player.xp += xpReward;
        this.checkLevelUp();
      }
    }
  }

  checkLevelUp() {
    if (this.player.xp >= this.player.xpToNext) {
      this.player.level++;
      this.player.xp -= this.player.xpToNext;
      this.player.xpToNext = Math.floor(this.player.xpToNext * 1.5);
      this.player.maxHp += 10;
      this.player.hp = this.player.maxHp;
      this.player.baseAttack += 2;
      this.player.baseDefense += 1;
      
      audio.levelUp();
      this.display.addFloatingText(this.player.x, this.player.y, 'LEVEL UP!', '#3fb950');
      this.log(`Level Up! You are now Level ${this.player.level}! (+10 Max HP, +2 ATK, +1 DEF)`, 'gold');
    }
  }

  useItemFromSlot(slotIndex) {
    if (this.isGameOver || this.isVictory) return;
    const item = this.player.inventory[slotIndex];
    if (!item) {
      this.log(`Slot [${slotIndex + 1}] is empty.`, 'muted');
      return;
    }

    audio.init();

    switch (item.type) {
      case ITEM_TYPES.POTION:
      case ITEM_TYPES.GREATER_POTION: {
        const healAmt = item.options.healAmount || 15;
        const healed = this.player.heal(healAmt);
        this.player.removeFromInventory(slotIndex);
        audio.potion();
        this.display.addFloatingText(this.player.x, this.player.y, `+${healed} HP`, '#3fb950');
        this.log(`You quaff the ${item.name} and restore ${healed} HP.`, 'success');
        this.endTurn();
        break;
      }

      case ITEM_TYPES.SCROLL_LIGHTNING: {
        // Find closest visible monster
        const visibleMonsters = this.monsters.filter(m => m.isAlive && this.map.tiles[m.y][m.x].visible);
        if (visibleMonsters.length === 0) {
          this.log('No visible enemies to strike with lightning!', 'muted');
          return;
        }

        visibleMonsters.sort((a, b) => {
          const distA = Math.hypot(a.x - this.player.x, a.y - this.player.y);
          const distB = Math.hypot(b.x - this.player.x, b.y - this.player.y);
          return distA - distB;
        });

        const target = visibleMonsters[0];
        this.player.removeFromInventory(slotIndex);
        audio.lightning();
        this.display.triggerShake(7);

        const dmg = item.options.damage || 25;
        target.takeDamage(dmg);
        this.display.addFloatingText(target.x, target.y, `⚡ -${dmg}`, '#a371f7');
        this.log(`Crackling lightning strikes ${target.name} for ${dmg} damage!`, 'purple');

        if (!target.isAlive) {
          audio.monsterDeath();
          this.log(`${target.name} turns to ash!`, 'gold');
          this.player.xp += 30;
          this.checkLevelUp();
        }

        this.endTurn();
        break;
      }

      case ITEM_TYPES.SCROLL_TELEPORT: {
        const safeTile = this.map.getRandomFloorTile();
        this.player.moveTo(safeTile.x, safeTile.y);
        this.player.removeFromInventory(slotIndex);
        audio.teleport();
        this.display.addFloatingText(this.player.x, this.player.y, 'TELEPORT!', '#38bdf8');
        this.log('Reality bends... you reappear elsewhere in the dungeon!', 'cyan');
        this.endTurn();
        break;
      }

      case ITEM_TYPES.WEAPON: {
        const oldWeapon = this.player.equipWeapon(item);
        this.player.removeFromInventory(slotIndex);
        if (oldWeapon) {
          this.player.addToInventory(oldWeapon);
        }
        audio.equip();
        this.log(`Equipped weapon: ${item.name} (+${item.options.attackBonus || 0} ATK).`, 'cyan');
        this.updateUI();
        break;
      }

      case ITEM_TYPES.ARMOR: {
        const oldArmor = this.player.equipArmor(item);
        this.player.removeFromInventory(slotIndex);
        if (oldArmor) {
          this.player.addToInventory(oldArmor);
        }
        audio.equip();
        this.log(`Equipped armor: ${item.name} (+${item.options.defenseBonus || 0} DEF).`, 'cyan');
        this.updateUI();
        break;
      }
    }
  }

  handlePlayerTurn(dx, dy) {
    if (this.isGameOver || this.isVictory) return;

    audio.init();

    const targetX = this.player.x + dx;
    const targetY = this.player.y + dy;

    if (this.map.isBlocked(targetX, targetY)) {
      return;
    }

    const targetMonster = this.monsters.find(m => m.isAlive && m.x === targetX && m.y === targetY);
    if (targetMonster) {
      this.attack(this.player, targetMonster);
      this.endTurn();
      return;
    }

    // Move player
    this.player.moveTo(targetX, targetY);
    audio.footstep();

    // Check ground items
    const itemIndex = this.items.findIndex(it => it.x === targetX && it.y === targetY);
    if (itemIndex !== -1) {
      const item = this.items[itemIndex];

      if (item.type === ITEM_TYPES.GOLD) {
        const val = item.options.value || 15;
        this.player.gold += val;
        this.items.splice(itemIndex, 1);
        audio.gold();
        this.display.addFloatingText(this.player.x, this.player.y, `+${val}g`, '#e3b341');
        this.log(`You gathered ${val} gold coins.`, 'gold');
      } else if (item.type === ITEM_TYPES.AMULET) {
        this.items.splice(itemIndex, 1);
        audio.victory();
        this.isVictory = true;
        this.log('You claim the Amulet of Yendor! You have conquered Shadow Crawl!', 'gold');
        this.updateUI();
        return;
      } else {
        const added = this.player.addToInventory(item);
        if (added) {
          this.items.splice(itemIndex, 1);
          audio.equip();
          this.log(`Picked up ${item.name}. (Press 1-5 to use/equip)`, 'success');
        } else {
          this.log(`Inventory full! Cannot carry ${item.name}.`, 'muted');
        }
      }
    }

    // Check stairs down
    if (this.map.stairsLocation && targetX === this.map.stairsLocation.x && targetY === this.map.stairsLocation.y) {
      this.dungeonFloor++;
      audio.stairs();
      this.log(`You descend deeper into the darkness (Floor B${this.dungeonFloor})...`, 'gold');
      this.initFloor();
      return;
    }

    this.endTurn();
  }

  endTurn() {
    this.turnCount++;

    for (const monster of this.monsters) {
      if (monster.isAlive) {
        AI.takeTurn(monster, this);
      }
    }

    this.monsters = this.monsters.filter(m => m.isAlive);
    FOV.compute(this.map, this.player.x, this.player.y);
    this.updateUI();
  }

  restart() {
    this.dungeonFloor = 1;
    this.turnCount = 0;
    this.isGameOver = false;
    this.isVictory = false;
    this.player = null;
    this.messages = [];
    const logBox = document.getElementById('log-box');
    if (logBox) logBox.innerHTML = '';
    this.initFloor();
    this.log('A new hero steps into the shadows...', 'gold');
  }

  updateUI() {
    const hpBar = document.getElementById('hp-bar');
    const hpText = document.getElementById('hp-text');
    const floorText = document.getElementById('floor-text');
    const turnText = document.getElementById('turn-text');
    const levelText = document.getElementById('level-text');
    const goldText = document.getElementById('gold-text');
    const gearText = document.getElementById('gear-text');
    const hotbarElem = document.getElementById('inventory-hotbar');

    if (this.player) {
      const hpPercent = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
      if (hpBar) hpBar.style.width = `${hpPercent}%`;
      if (hpText) hpText.textContent = `${this.player.hp} / ${this.player.maxHp}`;
      if (floorText) floorText.textContent = `B${this.dungeonFloor}`;
      if (turnText) turnText.textContent = this.turnCount;
      if (levelText) levelText.textContent = `Lv ${this.player.level} (${this.player.xp}/${this.player.xpToNext} XP)`;
      if (goldText) goldText.textContent = `${this.player.gold}g`;

      const weaponName = this.player.equippedWeapon ? this.player.equippedWeapon.name : 'Fists (+0)';
      const armorName = this.player.equippedArmor ? this.player.equippedArmor.name : 'Clothes (+0)';
      if (gearText) gearText.textContent = `🗡️ ${weaponName} | 🛡️ ${armorName} | ATK: ${this.player.attackPower} | DEF: ${this.player.defense}`;

      // Render 5 inventory slots
      if (hotbarElem) {
        hotbarElem.innerHTML = '';
        for (let i = 0; i < 5; i++) {
          const item = this.player.inventory[i];
          const slot = document.createElement('div');
          slot.className = `hotbar-slot ${item ? 'filled' : 'empty'}`;
          slot.innerHTML = `
            <span class="slot-num">[${i + 1}]</span>
            <span class="slot-name">${item ? item.name : 'Empty'}</span>
          `;
          slot.addEventListener('click', () => this.useItemFromSlot(i));
          hotbarElem.appendChild(slot);
        }
      }
    }
  }

  startAnimationLoop() {
    const renderFrame = () => {
      this.render();
      requestAnimationFrame(renderFrame);
    };
    requestAnimationFrame(renderFrame);
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

    // 2. Render Stairs
    if (this.map.stairsLocation) {
      const sx = this.map.stairsLocation.x;
      const sy = this.map.stairsLocation.y;
      if (this.map.tiles[sy][sx].visible || this.map.tiles[sy][sx].explored) {
        this.display.draw(sx, sy, CONFIG.GLYPHS.STAIRS_DOWN, CONFIG.COLORS.STAIRS);
      }
    }

    // 3. Render Items
    for (const item of this.items) {
      if (this.map.tiles[item.y][item.x].visible) {
        this.display.draw(item.x, item.y, item.char, item.color);
      }
    }

    // 4. Render Monsters
    for (const monster of this.monsters) {
      if (monster.isAlive && this.map.tiles[monster.y][monster.x].visible) {
        this.display.draw(monster.x, monster.y, monster.char, monster.color);
      }
    }

    // 5. Render Player
    if (this.player && this.player.isAlive) {
      this.display.draw(this.player.x, this.player.y, this.player.char, this.player.color);
    }

    // 6. Floating Damage / FX Text
    this.display.renderFloatingTexts();

    // 7. Victory Screen
    if (this.isVictory) {
      const ctx = this.display.ctx;
      ctx.fillStyle = 'rgba(5, 12, 25, 0.88)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = CONFIG.COLORS.AMULET;
      ctx.font = `bold 32px ${CONFIG.FONT_FAMILY}`;
      ctx.fillText('★ VICTORY ACHIEVED ★', this.canvas.width / 2, this.canvas.height / 2 - 40);

      ctx.fillStyle = CONFIG.COLORS.TEXT_DEFAULT;
      ctx.font = `18px ${CONFIG.FONT_FAMILY}`;
      ctx.fillText(`You conquered the dungeon in ${this.turnCount} turns with ${this.player.gold} gold!`, this.canvas.width / 2, this.canvas.height / 2 + 10);

      ctx.fillStyle = CONFIG.COLORS.TEXT_SUCCESS;
      ctx.fillText("Press 'R' to begin a new delve", this.canvas.width / 2, this.canvas.height / 2 + 50);
      return;
    }

    // 8. Game Over Screen
    if (this.isGameOver) {
      const ctx = this.display.ctx;
      ctx.fillStyle = 'rgba(10, 0, 0, 0.85)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = CONFIG.COLORS.TEXT_DANGER;
      ctx.font = `bold 30px ${CONFIG.FONT_FAMILY}`;
      ctx.fillText('YOU HAVE DIED', this.canvas.width / 2, this.canvas.height / 2 - 25);

      ctx.fillStyle = CONFIG.COLORS.TEXT_DEFAULT;
      ctx.font = `18px ${CONFIG.FONT_FAMILY}`;
      ctx.fillText("Press 'R' or Space to Restart", this.canvas.width / 2, this.canvas.height / 2 + 25);
    }
  }

  setupInput() {
    window.addEventListener('keydown', (e) => {
      audio.init();

      if (this.isGameOver || this.isVictory) {
        if (e.key === 'r' || e.key === 'R' || e.key === ' ') {
          this.restart();
        }
        return;
      }

      // Hotbar Number Keys: 1, 2, 3, 4, 5
      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const slot = parseInt(e.key, 10) - 1;
        this.useItemFromSlot(slot);
        return;
      }

      let dx = 0;
      let dy = 0;

      switch (e.key) {
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
