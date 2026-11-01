import { CONFIG } from './config.js';
import { SpriteRenderer } from './sprites.js';

/**
 * High-performance Dual-Mode Canvas Renderer (2D Sprites & Retro ASCII).
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

    // Sprite Cache & Rendering Mode
    this.sprites = new SpriteRenderer(this.tileWidth);
    this.mode = localStorage.getItem('shadow_crawl_gfx') || 'sprites'; // 'sprites' | 'ascii'

    // Configure text rendering
    this.ctx.font = `bold ${CONFIG.FONT_SIZE}px ${CONFIG.FONT_FAMILY}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.imageSmoothingEnabled = false;

    // Floating combat numbers / FX
    this.floatingTexts = [];
    this.shakeIntensity = 0;
  }

  toggleGraphicsMode() {
    this.mode = this.mode === 'sprites' ? 'ascii' : 'sprites';
    localStorage.setItem('shadow_crawl_gfx', this.mode);
    return this.mode;
  }

  triggerShake(intensity = 5) {
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
   * Draw a 2D Sprite if mode is 'sprites', or fall back to ASCII text glyph.
   * @param {number} x Grid X coordinate
   * @param {number} y Grid Y coordinate
   * @param {string} spriteName Key in sprite cache
   * @param {string} fallbackChar Character glyph if in ASCII mode
   * @param {string} fgColor Foreground color for ASCII
   * @param {string} [bgColor] Background color
   */
  drawTile(x, y, spriteName, fallbackChar, fgColor = CONFIG.COLORS.TEXT_DEFAULT, bgColor = null) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

    const px = x * this.tileWidth;
    const py = y * this.tileHeight;

    if (this.mode === 'sprites') {
      const sprite = this.sprites.get(spriteName);
      if (sprite) {
        this.ctx.drawImage(sprite, px, py);
        return;
      }
    }

    // ASCII fallback or selected mode
    if (bgColor) {
      this.ctx.fillStyle = bgColor;
      this.ctx.fillRect(px, py, this.tileWidth, this.tileHeight);
    }

    this.ctx.fillStyle = fgColor;
    this.ctx.font = `bold ${CONFIG.FONT_SIZE}px ${CONFIG.FONT_FAMILY}`;
    this.ctx.fillText(
      fallbackChar,
      px + this.tileWidth / 2,
      py + this.tileHeight / 2 + 1
    );
  }

  draw(x, y, char, fgColor = CONFIG.COLORS.TEXT_DEFAULT, bgColor = null) {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;

    const px = x * this.tileWidth;
    const py = y * this.tileHeight;

    if (bgColor) {
      this.ctx.fillStyle = bgColor;
      this.ctx.fillRect(px, py, this.tileWidth, this.tileHeight);
    }

    this.ctx.fillStyle = fgColor;
    this.ctx.font = `bold ${CONFIG.FONT_SIZE}px ${CONFIG.FONT_FAMILY}`;
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
