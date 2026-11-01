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

    // Sprite Cache & Rendering Mode (Default: 2D Sprites)
    this.sprites = new SpriteRenderer(this.tileWidth);
    this.mode = localStorage.getItem('shadow_crawl_gfx') || 'sprites';

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

  triggerShake(intensity = 6) {
    this.shakeIntensity = intensity;
  }

  addFloatingText(x, y, text, color = '#f85149') {
    this.floatingTexts.push({
      x: x * this.tileWidth + this.tileWidth / 2,
      y: y * this.tileHeight + this.tileHeight / 2,
      text: text,
      color: color,
      life: 28,
      maxLife: 28
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

    // ASCII Mode
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

  drawMonsterHealthBar(x, y, hp, maxHp) {
    if (hp >= maxHp) return;
    const px = x * this.tileWidth + 3;
    const py = y * this.tileHeight - 3;
    const barW = this.tileWidth - 6;
    const barH = 3;

    // BG
    this.ctx.fillStyle = '#1f242c';
    this.ctx.fillRect(px, py, barW, barH);

    // Fill
    const fillW = Math.max(1, Math.floor((hp / maxHp) * barW));
    this.ctx.fillStyle = '#f85149';
    this.ctx.fillRect(px, py, fillW, barH);
  }

  renderFloatingTexts() {
    this.ctx.save();
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      const progress = ft.life / ft.maxLife;
      const alpha = Math.max(0, progress);

      this.ctx.globalAlpha = alpha;
      this.ctx.fillStyle = ft.color;
      this.ctx.font = `bold ${CONFIG.FONT_SIZE + 4}px ${CONFIG.FONT_FAMILY}`;
      this.ctx.fillText(ft.text, ft.x, ft.y);

      ft.y -= 0.9;
      ft.life--;

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
    this.ctx.restore();
  }
}
