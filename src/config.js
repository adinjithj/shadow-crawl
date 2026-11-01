/**
 * Game configuration and global constants for Shadow Crawl.
 */
export const CONFIG = {
  // Grid dimensions (compact & dense for high-visibility action)
  MAP_WIDTH: 36,
  MAP_HEIGHT: 20,

  // Tile rendering dimensions (28px crisp pixel art tiles)
  TILE_WIDTH: 28,
  TILE_HEIGHT: 28,
  FONT_FAMILY: '"JetBrains Mono", "Cascadia Code", "Fira Code", Consolas, monospace',
  FONT_SIZE: 18,

  // Dungeon Generation Settings (Dense rooms, no vast empty voids)
  MAX_ROOMS: 9,
  ROOM_MIN_SIZE: 6,
  ROOM_MAX_SIZE: 11,
  MAX_MONSTERS_PER_ROOM: 2,
  MAX_ITEMS_PER_ROOM: 2,
  MAX_DUNGEON_FLOORS: 5,

  // Visual Palette
  COLORS: {
    BACKGROUND: '#06090e',
    PANEL_BG: '#0d131d',
    BORDER: '#1f2b3e',
    WALL_DARK: '#121720',
    WALL_LIT: '#50617a',
    FLOOR_DARK: '#0a0e14',
    FLOOR_LIT: '#222d3d',
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

  // Glyphs for ASCII fallback
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
