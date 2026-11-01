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
    this.attackPower = attackPower;
    this.defense = defense;
  }

  get isAlive() {
    return this.hp > 0;
  }

  takeDamage(amount) {
    const damage = Math.max(0, amount - this.defense);
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
    super(x, y, CONFIG.GLYPHS.PLAYER, CONFIG.COLORS.PLAYER, 'Hero', 30, 6, 2);
    this.level = 1;
    this.xp = 0;
    this.xpToNext = 100;
  }
}

export class Monster extends Actor {
  constructor(x, y, type) {
    if (type === 'goblin') {
      super(x, y, CONFIG.GLYPHS.GOBLIN, CONFIG.COLORS.GOBLIN, 'Goblin', 10, 3, 0);
    } else if (type === 'orc') {
      super(x, y, CONFIG.GLYPHS.ORC, CONFIG.COLORS.ORC, 'Orc', 16, 5, 1);
    } else {
      super(x, y, 'm', '#aaa', 'Monster', 8, 2, 0);
    }
    this.aiType = type;
  }
}

export class Item extends Entity {
  constructor(x, y, itemType) {
    super(x, y, CONFIG.GLYPHS.POTION, CONFIG.COLORS.POTION, 'Health Potion', false);
    this.itemType = itemType;
    this.healAmount = 12;
  }
}
