import { CONFIG } from './config.js';

/**
 * Grid-based Monospace ASCII Canvas Renderer.
 */
export class Display {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    this.width = CONFIG.MAP_WIDTH;
    this.height = CONFIG.MAP_HEIGHT;
    this.tileWidth = CONFIG.TILE_WIDTH;
    this.tileHeight = CONFIG.TILE_HEIGHT;

    // Set canvas dimensions
    this.canvas.width = this.width * this.tileWidth;
    this.canvas.height = this.height * this.tileHeight;

    // Configure text rendering
    this.ctx.font = `${CONFIG.FONT_SIZE}px ${CONFIG.FONT_FAMILY}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.imageSmoothingEnabled = false;
  }

  /**
   * Clear the entire canvas with background color.
   */
  clear() {
    this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw a character glyph at grid coordinates (x, y).
   * @param {number} x Grid X coordinate
   * @param {number} y Grid Y coordinate
   * @param {string} char Character glyph to draw
   * @param {string} fgColor Foreground text color
   * @param {string} [bgColor] Optional background tile color
   */
  draw(x, y, char, fgColor = CONFIG.COLORS.TEXT_DEFAULT, bgColor = null) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

    const px = x * this.tileWidth;
    const py = y * this.tileHeight;

    if (bgColor) {
      this.ctx.fillStyle = bgColor;
      this.ctx.fillRect(px, py, this.tileWidth, this.tileHeight);
    }

    this.ctx.fillStyle = fgColor;
    this.ctx.fillText(
      char,
      px + this.tileWidth / 2,
      py + this.tileHeight / 2 + 1
    );
  }
}
