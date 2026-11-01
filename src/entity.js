import { CONFIG } from './config.js';

export class Entity {
  constructor(x, y, char, color, name, blocksMovement = true) {
    this.x = x;
    this.y = y;
    this.char = char;
    this.color = color;
    this.name = name;
    this.blocksMovement = blocksMovement;
  }

  moveTo(x, y) {
    this.x = x;
    this.y = y;
  }
}

export class Actor extends Entity {
  constructor(x, y, char, color, name, hp, attackPower, defense = 0) {
    super(x, y, char, color, name, true);
    this.maxHp = hp;
    this.hp = hp;
    this.baseAttack = attackPower;
    this.baseDefense = defense;
  }

  get attackPower() {
    return this.baseAttack;
  }

  get defense() {
    return this.baseDefense;
  }

  get isAlive() {
    return this.hp > 0;
  }

  takeDamage(amount) {
    const damage = Math.max(1, amount - this.defense);
    this.hp = Math.max(0, this.hp - damage);
    return damage;
  }

  heal(amount) {
    const oldHp = this.hp;
    this.hp = Math.min(this.maxHp, this.hp + amount);
    return this.hp - oldHp;
  }
}

export class Player extends Actor {
  constructor(x, y) {
    super(x, y, CONFIG.GLYPHS.PLAYER, CONFIG.COLORS.PLAYER, 'Hero', 30, 6, 1);
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 60;
    this.gold = 0;

    // Equipment
    this.equippedWeapon = null;
    this.equippedArmor = null;

    // Inventory (max 5 items)
    this.inventory = [];
    this.maxInventory = 5;
  }

  get attackPower() {
    const weaponBonus = this.equippedWeapon ? (this.equippedWeapon.options.attackBonus || 0) : 0;
    return this.baseAttack + weaponBonus;
  }

  get defense() {
    const armorBonus = this.equippedArmor ? (this.equippedArmor.options.defenseBonus || 0) : 0;
    return this.baseDefense + armorBonus;
  }

  equipWeapon(item) {
    const old = this.equippedWeapon;
    this.equippedWeapon = item;
    return old;
  }

  equipArmor(item) {
    const old = this.equippedArmor;
    this.equippedArmor = item;
    return old;
  }

  addToInventory(item) {
    if (this.inventory.length >= this.maxInventory) {
      return false;
    }
    this.inventory.push(item);
    return true;
  }

  removeFromInventory(index) {
    if (index >= 0 && index < this.inventory.length) {
      return this.inventory.splice(index, 1)[0];
    }
    return null;
  }
}

export class Monster extends Actor {
  constructor(x, y, type) {
    let char = 'm';
    let color = '#aaa';
    let name = 'Monster';
    let hp = 10;
    let attack = 3;
    let def = 0;

    switch (type) {
      case 'goblin':
        char = CONFIG.GLYPHS.GOBLIN;
        color = CONFIG.COLORS.GOBLIN;
        name = 'Goblin Scout';
        hp = 12;
        attack = 4;
        def = 0;
        break;
      case 'orc':
        char = CONFIG.GLYPHS.ORC;
        color = CONFIG.COLORS.ORC;
        name = 'Orc Warrior';
        hp = 20;
        attack = 6;
        def = 1;
        break;
      case 'skeleton':
        char = CONFIG.GLYPHS.SKELETON;
        color = CONFIG.COLORS.SKELETON;
        name = 'Skeleton Knight';
        hp = 26;
        attack = 8;
        def = 2;
        break;
      case 'drake':
        char = CONFIG.GLYPHS.DRAKE;
        color = CONFIG.COLORS.DRAKE;
        name = 'Shadow Drake';
        hp = 42;
        attack = 11;
        def = 3;
        break;
      case 'boss':
        char = CONFIG.GLYPHS.BOSS;
        color = CONFIG.COLORS.BOSS;
        name = 'Shadow Lord Malakor';
        hp = 85;
        attack = 14;
        def = 4;
        break;
    }

    super(x, y, char, color, name, hp, attack, def);
    this.monsterType = type;
  }

  /**
   * Factory to spawn monster appropriate for dungeon floor.
   * @param {number} x
   * @param {number} y
   * @param {number} floor
   */
  static createForFloor(x, y, floor) {
    if (floor === 5) {
      // Minions on boss floor
      return Math.random() < 0.6 ? new Monster(x, y, 'skeleton') : new Monster(x, y, 'drake');
    }

    if (floor >= 4) {
      const roll = Math.random();
      if (roll < 0.4) return new Monster(x, y, 'drake');
      if (roll < 0.8) return new Monster(x, y, 'skeleton');
      return new Monster(x, y, 'orc');
    }

    if (floor >= 3) {
      const roll = Math.random();
      if (roll < 0.45) return new Monster(x, y, 'skeleton');
      if (roll < 0.85) return new Monster(x, y, 'orc');
      return new Monster(x, y, 'goblin');
    }

    if (floor >= 2) {
      return Math.random() < 0.6 ? new Monster(x, y, 'orc') : new Monster(x, y, 'goblin');
    }

    // Floor 1
    return Math.random() < 0.75 ? new Monster(x, y, 'goblin') : new Monster(x, y, 'orc');
  }
}
