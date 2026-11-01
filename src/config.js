/**
 * Game configuration and global constants for Shadow Crawl.
 */
export const CONFIG = {
  // Grid dimensions (in tiles)
  MAP_WIDTH: 70,
  MAP_HEIGHT: 30,

  // Tile rendering dimensions (pixels per character)
  TILE_WIDTH: 14,
  TILE_HEIGHT: 22,
  FONT_FAMILY: '"JetBrains Mono", "Cascadia Code", "Fira Code", Consolas, monospace',
  FONT_SIZE: 18,

  // Dungeon Generation Settings
  MAX_ROOMS: 15,
  ROOM_MIN_SIZE: 6,
  ROOM_MAX_SIZE: 12,
  MAX_MONSTERS_PER_ROOM: 2,

  // Visual Palette
  COLORS: {
    BACKGROUND: '#0d1117',
    PANEL_BG: '#161b22',
    BORDER: '#30363d',
    WALL_DARK: '#21262d',
    WALL_LIT: '#8b949e',
    FLOOR_DARK: '#161b22',
    FLOOR_LIT: '#484f58',
    PLAYER: '#58a6ff',
    GOBLIN: '#3fb950',
    ORC: '#d29922',
    STAIRS: '#f0883e',
    POTION: '#ff7b72',
    TEXT_DEFAULT: '#c9d1d9',
    TEXT_MUTED: '#8b949e',
    TEXT_DANGER: '#f85149',
    TEXT_SUCCESS: '#3fb950',
    TEXT_GOLD: '#d29922'
  },

  // Glyphs
  GLYPHS: {
    WALL: '#',
    FLOOR: '.',
    PLAYER: '@',
    GOBLIN: 'g',
    ORC: 'o',
    STAIRS_DOWN: '>',
    POTION: '!'
  }
};
