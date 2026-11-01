import { CONFIG } from './config.js';
import { Entity } from './entity.js';

export const ITEM_TYPES = {
  POTION: 'potion',
  GREATER_POTION: 'greater_potion',
  SCROLL_LIGHTNING: 'scroll_lightning',
  SCROLL_TELEPORT: 'scroll_teleport',
  WEAPON: 'weapon',
  ARMOR: 'armor',
  GOLD: 'gold',
  AMULET: 'amulet'
};

export class Item extends Entity {
  constructor(x, y, type, options = {}) {
    let char = CONFIG.GLYPHS.POTION;
    let color = CONFIG.COLORS.POTION;
    let name = 'Item';

    switch (type) {
      case ITEM_TYPES.POTION:
        char = CONFIG.GLYPHS.POTION;
        color = CONFIG.COLORS.POTION;
        name = 'Health Potion';
        break;
      case ITEM_TYPES.GREATER_POTION:
        char = CONFIG.GLYPHS.POTION;
        color = '#ff4b4b';
        name = 'Greater Potion';
        break;
      case ITEM_TYPES.SCROLL_LIGHTNING:
        char = CONFIG.GLYPHS.SCROLL;
        color = CONFIG.COLORS.SCROLL;
        name = 'Scroll of Lightning';
        break;
      case ITEM_TYPES.SCROLL_TELEPORT:
        char = CONFIG.GLYPHS.SCROLL;
        color = '#38bdf8';
        name = 'Scroll of Teleport';
        break;
      case ITEM_TYPES.WEAPON:
        char = CONFIG.GLYPHS.WEAPON;
        color = CONFIG.COLORS.WEAPON;
        name = options.name || 'Iron Sword';
        break;
      case ITEM_TYPES.ARMOR:
        char = CONFIG.GLYPHS.ARMOR;
        color = CONFIG.COLORS.ARMOR;
        name = options.name || 'Leather Armor';
        break;
      case ITEM_TYPES.GOLD:
        char = CONFIG.GLYPHS.GOLD;
        color = CONFIG.COLORS.GOLD;
        name = `${options.value || 15} Gold`;
        break;
      case ITEM_TYPES.AMULET:
        char = CONFIG.GLYPHS.AMULET;
        color = CONFIG.COLORS.AMULET;
        name = 'Amulet of Yendor';
        break;
    }

    super(x, y, char, color, name, false);
    this.type = type;
    this.options = options;
  }

  /**
   * Factory function to create random ground loot suited for a given dungeon floor.
   * @param {number} x
   * @param {number} y
   * @param {number} floor
   */
  static createRandom(x, y, floor = 1) {
    const roll = Math.random();

    // 25% chance gold
    if (roll < 0.25) {
      const val = Math.floor(Math.random() * (15 + floor * 10)) + 10;
      return new Item(x, y, ITEM_TYPES.GOLD, { value: val });
    }

    // 25% chance healing potion
    if (roll < 0.50) {
      if (floor >= 3 && Math.random() < 0.4) {
        return new Item(x, y, ITEM_TYPES.GREATER_POTION, { healAmount: 30 });
      }
      return new Item(x, y, ITEM_TYPES.POTION, { healAmount: 15 });
    }

    // 20% chance scroll
    if (roll < 0.70) {
      if (Math.random() < 0.5) {
        return new Item(x, y, ITEM_TYPES.SCROLL_LIGHTNING, { damage: 25 });
      }
      return new Item(x, y, ITEM_TYPES.SCROLL_TELEPORT);
    }

    // 15% chance weapon
    if (roll < 0.85) {
      if (floor >= 4) {
        return new Item(x, y, ITEM_TYPES.WEAPON, { name: 'Sunblade', attackBonus: 9 });
      } else if (floor >= 2) {
        return new Item(x, y, ITEM_TYPES.WEAPON, { name: 'Iron Longsword', attackBonus: 5 });
      } else {
        return new Item(x, y, ITEM_TYPES.WEAPON, { name: 'Dagger', attackBonus: 2 });
      }
    }

    // 15% chance armor
    if (floor >= 4) {
      return new Item(x, y, ITEM_TYPES.ARMOR, { name: 'Dragon Scale', defenseBonus: 5 });
    } else if (floor >= 2) {
      return new Item(x, y, ITEM_TYPES.ARMOR, { name: 'Chainmail', defenseBonus: 3 });
    } else {
      return new Item(x, y, ITEM_TYPES.ARMOR, { name: 'Leather Tunic', defenseBonus: 1 });
    }
  }
}
