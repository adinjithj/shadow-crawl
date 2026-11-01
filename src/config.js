/**
 * Game configuration and global constants for Shadow Crawl.
 */
export const CONFIG = {
  // Grid dimensions (in tiles)
  MAP_WIDTH: 48,
  MAP_HEIGHT: 24,

  // Tile rendering dimensions (pixels per character/sprite)
  TILE_WIDTH: 20,
  TILE_HEIGHT: 20,
  FONT_FAMILY: '"JetBrains Mono", "Cascadia Code", "Fira Code", Consolas, monospace',
  FONT_SIZE: 15,

  // Dungeon Generation Settings
  MAX_ROOMS: 12,
  ROOM_MIN_SIZE: 5,
  ROOM_MAX_SIZE: 10,
  MAX_MONSTERS_PER_ROOM: 2,
  MAX_ITEMS_PER_ROOM: 2,
  MAX_DUNGEON_FLOORS: 5,

  // Visual Palette
  COLORS: {
    BACKGROUND: '#090d13',
    PANEL_BG: '#121722',
    BORDER: '#262e3d',
    WALL_DARK: '#1c222c',
    WALL_LIT: '#6e7f96',
    FLOOR_DARK: '#10141a',
    FLOOR_LIT: '#323e4e',
    PLAYER: '#58a6ff',
    GOBLIN: '#3fb950',
    ORC: '#d29922',
    SKELETON: '#e6edf3',
    DRAKE: '#f78166',
    BOSS: '#ff0055',
    STAIRS: '#f0883e',
    POTION: '#ff7b72',
    SCROLL: '#a371f7',
    WEAPON: '#79c0ff',
    ARMOR: '#56d364',
    GOLD: '#e3b341',
    AMULET: '#ffd700',
    TEXT_DEFAULT: '#c9d1d9',
    TEXT_MUTED: '#7d8590',
    TEXT_DANGER: '#f85149',
    TEXT_SUCCESS: '#3fb950',
    TEXT_GOLD: '#d29922',
    TEXT_CYAN: '#58a6ff',
    TEXT_PURPLE: '#bc8cff'
  },

  // Glyphs
  GLYPHS: {
    WALL: '#',
    FLOOR: '.',
    PLAYER: '@',
    GOBLIN: 'g',
    ORC: 'o',
    SKELETON: 's',
    DRAKE: 'D',
    BOSS: 'Ω',
    STAIRS_DOWN: '>',
    POTION: '!',
    SCROLL: '?',
    WEAPON: '/',
    ARMOR: ']',
    GOLD: '$',
    AMULET: '*'
  }
};
