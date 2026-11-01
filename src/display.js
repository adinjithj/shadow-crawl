import { CONFIG } from './config.js';

/**
 * Grid-based Monospace ASCII Canvas Renderer with visual FX & floating combat text.
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

    // Floating combat numbers / FX
    this.floatingTexts = [];
    this.shakeIntensity = 0;
  }

  triggerShake(intensity = 6) {
    this.shakeIntensity = intensity;
  }

  addFloatingText(x, y, text, color = '#f85149') {
    this.floatingTexts.push({
      x: x * this.tileWidth + this.tileWidth / 2,
      y: y * this.tileHeight + this.tileHeight / 2,
      text: text,
      color: color,
      life: 25,
      maxLife: 25
    });
  }

  /**
   * Clear the entire canvas with background color and apply screen shake if active.
   */
  clear() {
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.fillStyle = CONFIG.COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.shakeIntensity > 0) {
      const offsetX = (Math.random() - 0.5) * this.shakeIntensity;
      const offsetY = (Math.random() - 0.5) * this.shakeIntensity;
      this.ctx.translate(offsetX, offsetY);
      this.shakeIntensity = Math.max(0, this.shakeIntensity - 1);
    }
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

  renderFloatingTexts() {
    this.ctx.save();
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      const progress = ft.life / ft.maxLife;
      const alpha = Math.max(0, progress);

      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = ft.color;
      this.ctx.font = `bold ${CONFIG.FONT_SIZE + 2}px ${CONFIG.FONT_FAMILY}`;
      this.ctx.fillText(ft.text, ft.x, ft.y);

      ft.y -= 0.8;
      ft.life--;

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
    this.ctx.restore();
  }
}
