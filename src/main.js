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

    this.initHeaderControls();
    this.initGuideModal();
    this.initDpad();
    this.initCanvasTouch();
    this.initFloor();
    this.setupInput();
    this.startAnimationLoop();
  }

  initHeaderControls() {
    // Audio button
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.textContent = audio.muted ? '🔇 Sound: OFF' : '🔊 Sound: ON';
      audioBtn.addEventListener('click', () => {
        audio.init();
        const isMuted = audio.toggleMute();
        audioBtn.textContent = isMuted ? '🔇 Sound: OFF' : '🔊 Sound: ON';
      });
    }

    // Graphics mode toggle button
    const gfxBtn = document.getElementById('gfx-toggle-btn');
    if (gfxBtn) {
      gfxBtn.textContent = this.display.mode === 'sprites' ? '🎨 2D Sprites' : '🔤 Retro ASCII';
      gfxBtn.addEventListener('click', () => {
        audio.init();
        audio.playTone(500, 'triangle', 0.05, 0.1);
        const mode = this.display.toggleGraphicsMode();
        gfxBtn.textContent = mode === 'sprites' ? '🎨 2D Sprites' : '🔤 Retro ASCII';
      });
    }
  }

  initGuideModal() {
    const modal = document.getElementById('guide-modal');
    const guideBtn = document.getElementById('guide-btn');
    const closeBtn = document.getElementById('close-modal-btn');
    const startBtn = document.getElementById('start-game-btn');

    const openModal = () => {
      if (modal) modal.classList.remove('hidden');
    };

    const closeModal = () => {
      if (modal) modal.classList.add('hidden');
      audio.init();
      audio.playTone(520, 'sine', 0.1, 0.15);
    };

    if (guideBtn) guideBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (startBtn) startBtn.addEventListener('click', closeModal);

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }

  initDpad() {
    const dpadButtons = document.querySelectorAll('.dpad-btn');
    dpadButtons.forEach((btn) => {
      const handlePress = (e) => {
        e.preventDefault();
        audio.init();
        if (navigator.vibrate) {
          try { navigator.vibrate(12); } catch (_) {}
        }
        const dir = btn.dataset.dir;
        switch (dir) {
          case 'up':
            this.handlePlayerTurn(0, -1);
            break;
          case 'down':
            this.handlePlayerTurn(0, 1);
            break;
          case 'left':
            this.handlePlayerTurn(-1, 0);
            break;
          case 'right':
            this.handlePlayerTurn(1, 0);
            break;
          case 'wait':
            this.endTurn();
            break;
        }
      };

      btn.addEventListener('pointerdown', handlePress);
    });

    const actionButtons = document.querySelectorAll('.mob-act-btn');
    actionButtons.forEach((btn) => {
      const handleAction = (e) => {
        e.preventDefault();
        audio.init();
        if (navigator.vibrate) {
          try { navigator.vibrate(15); } catch (_) {}
        }
        const act = btn.dataset.action;
        if (act === 'wait') {
          this.endTurn();
        } else if (act === 'restart') {
          this.restart();
        }
      };

      btn.addEventListener('pointerdown', handleAction);
    });
  }

  initCanvasTouch() {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;

    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1) {
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const dx = touchEndX - touchStartX;
        const dy = touchEndY - touchStartY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const duration = Date.now() - touchStartTime;

        audio.init();

        // 1. Swipe gesture (> 25px in under 500ms)
        if (dist > 25 && duration < 500) {
          e.preventDefault();
          if (navigator.vibrate) {
            try { navigator.vibrate(12); } catch (_) {}
          }
          if (Math.abs(dx) > Math.abs(dy)) {
            this.handlePlayerTurn(dx > 0 ? 1 : -1, 0);
          } else {
            this.handlePlayerTurn(0, dy > 0 ? 1 : -1);
          }
          return;
        }

        // 2. Direct Tap gesture on canvas quadrant
        if (dist < 15 && duration < 400) {
          const rect = this.canvas.getBoundingClientRect();
          const normX = (touchEndX - rect.left) / rect.width;
          const normY = (touchEndY - rect.top) / rect.height;

          // Center tap = wait turn
          if (normX >= 0.35 && normX <= 0.65 && normY >= 0.35 && normY <= 0.65) {
            this.endTurn();
            return;
          }

          // Quadrant tap
          const relX = normX - 0.5;
          const relY = normY - 0.5;
          if (navigator.vibrate) {
            try { navigator.vibrate(12); } catch (_) {}
          }

          if (Math.abs(relX) > Math.abs(relY)) {
            this.handlePlayerTurn(relX > 0 ? 1 : -1, 0);
          } else {
            this.handlePlayerTurn(0, relY > 0 ? 1 : -1);
          }
        }
      }
    }, { passive: false });
  }

  log(message, type = 'default') {
    const logBox = document.getElementById('log-box');
    this.messages.push({ message, type });
    if (this.messages.length > 100) this.messages.shift();

    if (logBox) {
      const msgElem = document.createElement('div');
      msgElem.className = `log-entry log-${type}`;
      msgElem.textContent = message;
      logBox.appendChild(msgElem);

      while (logBox.children.length > 80) {
        logBox.removeChild(logBox.firstChild);
      }

      // Auto-scroll so newest message stays locked at bottom and older messages scroll up
      requestAnimationFrame(() => {
        logBox.scrollTop = logBox.scrollHeight;
      });
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
      this.display.addFloatingText(defender.x, defender.y, `-${damage}`, defender === this.player ? '#ef4444' : '#fbbf24');

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
        
        let xpReward = 20;
        if (defender.monsterType === 'orc') xpReward = 35;
        if (defender.monsterType === 'skeleton') xpReward = 50;
        if (defender.monsterType === 'drake') xpReward = 80;
        if (defender.monsterType === 'boss') {
          xpReward = 250;
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
      this.display.addFloatingText(this.player.x, this.player.y, 'LEVEL UP!', '#22c55e');
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
        this.display.addFloatingText(this.player.x, this.player.y, `+${healed} HP`, '#22c55e');
        this.log(`You drink ${item.name} (+${healed} HP).`, 'success');
        this.endTurn();
        break;
      }

      case ITEM_TYPES.SCROLL_LIGHTNING: {
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
        this.display.addFloatingText(target.x, target.y, `⚡ -${dmg}`, '#c084fc');
        this.log(`Lightning strikes ${target.name} for ${dmg} damage!`, 'purple');

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
        this.log('Reality bends... you reappear elsewhere!', 'cyan');
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
        this.log(`Equipped ${item.name} (+${item.options.attackBonus || 0} ATK).`, 'cyan');
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
        this.log(`Equipped ${item.name} (+${item.options.defenseBonus || 0} DEF).`, 'cyan');
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
        this.display.addFloatingText(this.player.x, this.player.y, `+${val}g`, '#fbbf24');
        this.log(`Found ${val} gold coins.`, 'gold');
      } else if (item.type === ITEM_TYPES.AMULET) {
        this.items.splice(itemIndex, 1);
        audio.victory();
        this.isVictory = true;
        this.log('You claim the Amulet of Yendor! You conquered Shadow Crawl!', 'gold');
        this.updateUI();
        return;
      } else {
        const added = this.player.addToInventory(item);
        if (added) {
          this.items.splice(itemIndex, 1);
          audio.equip();
          this.log(`Picked up ${item.name}. (Press 1-5 to use)`, 'success');
        } else {
          this.log(`Satchel full! Cannot carry ${item.name}.`, 'muted');
        }
      }
    }

    // Check stairs down
    if (this.map.stairsLocation && targetX === this.map.stairsLocation.x && targetY === this.map.stairsLocation.y) {
      this.dungeonFloor++;
      audio.stairs();
      this.log(`Descending to Floor B${this.dungeonFloor}...`, 'gold');
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
    const floorBadge = document.getElementById('floor-badge');
    const turnText = document.getElementById('turn-text');
    const levelText = document.getElementById('level-text');
    const goldText = document.getElementById('gold-text');
    const gearText = document.getElementById('gear-text');
    const hotbarElem = document.getElementById('inventory-hotbar');

    if (this.player) {
      const hpPercent = Math.max(0, (this.player.hp / this.player.maxHp) * 100);
      if (hpBar) hpBar.style.width = `${hpPercent}%`;
      if (hpText) hpText.textContent = `${this.player.hp} / ${this.player.maxHp}`;
      if (floorBadge) floorBadge.textContent = `FLOOR B${this.dungeonFloor}`;
      if (turnText) turnText.textContent = this.turnCount;
      if (levelText) levelText.textContent = `Lv ${this.player.level} (${this.player.xp}/${this.player.xpToNext} XP)`;
      if (goldText) goldText.textContent = `${this.player.gold}g`;

      const weaponName = this.player.equippedWeapon ? this.player.equippedWeapon.name : 'Fists (+0)';
      const armorName = this.player.equippedArmor ? this.player.equippedArmor.name : 'Clothes (+0)';
      if (gearText) gearText.textContent = `🗡️ ${weaponName} | 🛡️ ${armorName} | ATK: ${this.player.attackPower} | DEF: ${this.player.defense}`;

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
          const spriteKey = tile.type === CONFIG.GLYPHS.WALL ? 'wall_lit' : 'floor_lit';
          const asciiColor = tile.type === CONFIG.GLYPHS.WALL ? CONFIG.COLORS.WALL_LIT : CONFIG.COLORS.FLOOR_LIT;
          this.display.drawTile(x, y, spriteKey, tile.type, asciiColor);
        } else if (tile.explored) {
          const spriteKey = tile.type === CONFIG.GLYPHS.WALL ? 'wall_dark' : 'floor_dark';
          const asciiColor = tile.type === CONFIG.GLYPHS.WALL ? CONFIG.COLORS.WALL_DARK : CONFIG.COLORS.FLOOR_DARK;
          this.display.drawTile(x, y, spriteKey, tile.type, asciiColor);
        }
      }
    }

    // 2. Render Stairs
    if (this.map.stairsLocation) {
      const sx = this.map.stairsLocation.x;
      const sy = this.map.stairsLocation.y;
      if (this.map.tiles[sy][sx].visible || this.map.tiles[sy][sx].explored) {
        this.display.drawTile(sx, sy, 'stairs', CONFIG.GLYPHS.STAIRS_DOWN, CONFIG.COLORS.STAIRS);
      }
    }

    // 3. Render Items
    for (const item of this.items) {
      if (this.map.tiles[item.y][item.x].visible) {
        let spriteKey = 'potion';
        if (item.type === ITEM_TYPES.SCROLL_LIGHTNING || item.type === ITEM_TYPES.SCROLL_TELEPORT) spriteKey = 'scroll';
        if (item.type === ITEM_TYPES.WEAPON) spriteKey = 'weapon';
        if (item.type === ITEM_TYPES.ARMOR) spriteKey = 'armor';
        if (item.type === ITEM_TYPES.GOLD) spriteKey = 'gold';
        if (item.type === ITEM_TYPES.AMULET) spriteKey = 'amulet';

        this.display.drawTile(item.x, item.y, spriteKey, item.char, item.color);
      }
    }

    // 4. Render Monsters & Monster Health Bars
    for (const monster of this.monsters) {
      if (monster.isAlive && this.map.tiles[monster.y][monster.x].visible) {
        this.display.drawTile(monster.x, monster.y, monster.monsterType, monster.char, monster.color);
        this.display.drawMonsterHealthBar(monster.x, monster.y, monster.hp, monster.maxHp);
      }
    }

    // 5. Render Player
    if (this.player && this.player.isAlive) {
      this.display.drawTile(this.player.x, this.player.y, 'hero', this.player.char, this.player.color);
    }

    // 6. Floating Damage / FX Text
    this.display.renderFloatingTexts();

    // 7. Victory Screen
    if (this.isVictory) {
      const ctx = this.display.ctx;
      ctx.fillStyle = 'rgba(5, 12, 25, 0.90)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = CONFIG.COLORS.AMULET;
      ctx.font = `bold 32px ${CONFIG.FONT_FAMILY}`;
      ctx.fillText('★ VICTORY ACHIEVED ★', this.canvas.width / 2, this.canvas.height / 2 - 40);

      ctx.fillStyle = CONFIG.COLORS.TEXT_DEFAULT;
      ctx.font = `18px ${CONFIG.FONT_FAMILY}`;
      ctx.fillText(`Conquered the dungeon in ${this.turnCount} turns with ${this.player.gold} gold!`, this.canvas.width / 2, this.canvas.height / 2 + 10);

      ctx.fillStyle = CONFIG.COLORS.TEXT_SUCCESS;
      ctx.fillText("Press 'R' to begin a new delve", this.canvas.width / 2, this.canvas.height / 2 + 50);
      return;
    }

    // 8. Game Over Screen
    if (this.isGameOver) {
      const ctx = this.display.ctx;
      ctx.fillStyle = 'rgba(10, 0, 0, 0.88)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

      ctx.fillStyle = CONFIG.COLORS.TEXT_DANGER;
      ctx.font = `bold 32px ${CONFIG.FONT_FAMILY}`;
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
