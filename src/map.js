import { CONFIG } from './config.js';

export class Rect {
  constructor(x, y, w, h) {
    this.x1 = x;
    this.y1 = y;
    this.x2 = x + w;
    this.y2 = y + h;
  }

  get center() {
    return {
      x: Math.floor((this.x1 + this.x2) / 2),
      y: Math.floor((this.y1 + this.y2) / 2)
    };
  }

  intersects(other) {
    return (
      this.x1 <= other.x2 &&
      this.x2 >= other.x1 &&
      this.y1 <= other.y2 &&
      this.y2 >= other.y1
    );
  }
}

export class Tile {
  constructor(type, blocksMovement = true, blocksSight = true) {
    this.type = type;
    this.blocksMovement = blocksMovement;
    this.blocksSight = blocksSight;
    this.explored = false; // Seen at least once
    this.visible = false;  // Currently in FOV
  }
}

export class GameMap {
  constructor(width = CONFIG.MAP_WIDTH, height = CONFIG.MAP_HEIGHT) {
    this.width = width;
    this.height = height;
    this.tiles = [];
    this.rooms = [];
    this.stairsLocation = null;
    this.initializeTiles();
  }

  initializeTiles() {
    this.tiles = [];
    for (let y = 0; y < this.height; y++) {
      const row = [];
      for (let x = 0; x < this.width; x++) {
        row.push(new Tile(CONFIG.GLYPHS.WALL, true, true));
      }
      this.tiles.push(row);
    }
  }

  inBounds(x, y) {
    return x >= 0 && x < this.width && y >= 0 && y < this.height;
  }

  isBlocked(x, y) {
    if (!this.inBounds(x, y)) return true;
    return this.tiles[y][x].blocksMovement;
  }

  createRoom(rect) {
    for (let y = rect.y1 + 1; y < rect.y2; y++) {
      for (let x = rect.x1 + 1; x < rect.x2; x++) {
        if (this.inBounds(x, y)) {
          this.tiles[y][x] = new Tile(CONFIG.GLYPHS.FLOOR, false, false);
        }
      }
    }
  }

  createTunnelH(x1, x2, y) {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    for (let x = minX; x <= maxX; x++) {
      if (this.inBounds(x, y)) {
        this.tiles[y][x] = new Tile(CONFIG.GLYPHS.FLOOR, false, false);
      }
    }
  }

  createTunnelV(y1, y2, x) {
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    for (let y = minY; y <= maxY; y++) {
      if (this.inBounds(x, y)) {
        this.tiles[y][x] = new Tile(CONFIG.GLYPHS.FLOOR, false, false);
      }
    }
  }

  /**
   * Procedurally generate a traditional dungeon floor using randomized rooms & corridors.
   * @returns {{ playerStart: {x: number, y: number}, rooms: Rect[] }}
   */
  generateDungeon() {
    this.initializeTiles();
    this.rooms = [];

    for (let r = 0; r < CONFIG.MAX_ROOMS; r++) {
      const w = Math.floor(Math.random() * (CONFIG.ROOM_MAX_SIZE - CONFIG.ROOM_MIN_SIZE + 1)) + CONFIG.ROOM_MIN_SIZE;
      const h = Math.floor(Math.random() * (CONFIG.ROOM_MAX_SIZE - CONFIG.ROOM_MIN_SIZE + 1)) + CONFIG.ROOM_MIN_SIZE;
      const x = Math.floor(Math.random() * (this.width - w - 2)) + 1;
      const y = Math.floor(Math.random() * (this.height - h - 2)) + 1;

      const newRoom = new Rect(x, y, w, h);
      const failed = this.rooms.some(existing => newRoom.intersects(existing));

      if (!failed) {
        this.createRoom(newRoom);

        if (this.rooms.length > 0) {
          const prevCenter = this.rooms[this.rooms.length - 1].center;
          const newCenter = newRoom.center;

          // 50% chance to carve H then V, or V then H
          if (Math.random() < 0.5) {
            this.createTunnelH(prevCenter.x, newCenter.x, prevCenter.y);
            this.createTunnelV(prevCenter.y, newCenter.y, newCenter.x);
          } else {
            this.createTunnelV(prevCenter.y, newCenter.y, prevCenter.x);
            this.createTunnelH(prevCenter.x, newCenter.x, newCenter.y);
          }
        }

        this.rooms.push(newRoom);
      }
    }

    const playerStart = this.rooms[0].center;
    const lastRoom = this.rooms[this.rooms.length - 1];
    this.stairsLocation = lastRoom.center;

    return { playerStart, rooms: this.rooms };
  }
}
