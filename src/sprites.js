/**
 * High-Fidelity 2D Pixel-Art Sprite Renderer for Shadow Crawl.
 * Procedurally generates 28x28 pixel-art sprites cached on offscreen canvases for silky 60fps rendering.
 */

export class SpriteRenderer {
  constructor(tileSize = 28) {
    this.size = tileSize;
    this.cache = new Map();
    this.initSprites();
  }

  createCanvas() {
    const c = document.createElement('canvas');
    c.width = this.size;
    c.height = this.size;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { c, ctx };
  }

  initSprites() {
    this.cache.set('wall_lit', this.renderWall(true));
    this.cache.set('wall_dark', this.renderWall(false));
    this.cache.set('floor_lit', this.renderFloor(true));
    this.cache.set('floor_dark', this.renderFloor(false));
    this.cache.set('stairs', this.renderStairs());

    this.cache.set('hero', this.renderHero());
    this.cache.set('goblin', this.renderGoblin());
    this.cache.set('orc', this.renderOrc());
    this.cache.set('skeleton', this.renderSkeleton());
    this.cache.set('drake', this.renderDrake());
    this.cache.set('boss', this.renderBoss());

    this.cache.set('potion', this.renderPotion());
    this.cache.set('scroll', this.renderScroll());
    this.cache.set('weapon', this.renderWeapon());
    this.cache.set('armor', this.renderArmor());
    this.cache.set('gold', this.renderGold());
    this.cache.set('amulet', this.renderAmulet());
  }

  get(name) {
    return this.cache.get(name) || null;
  }

  // --- Environment ---

  renderWall(isLit) {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Deep mortar background
    ctx.fillStyle = isLit ? '#121822' : '#070a0e';
    ctx.fillRect(0, 0, s, s);

    const brickColor = isLit ? '#3d4b5e' : '#141a24';
    const highlightColor = isLit ? '#66778f' : '#222b3b';
    const shadowColor = isLit ? '#273241' : '#0c1017';

    // 3 Rows of beveled bricks
    const rowH = 8;
    for (let row = 0; row < 3; row++) {
      const y = row * (rowH + 1);
      const isOffset = row % 2 === 1;
      const mid = Math.floor(s / 2);

      if (!isOffset) {
        // Two equal bricks
        this.drawBrick(ctx, 1, y + 1, mid - 2, rowH - 1, brickColor, highlightColor, shadowColor);
        this.drawBrick(ctx, mid, y + 1, s - mid - 1, rowH - 1, brickColor, highlightColor, shadowColor);
      } else {
        // Three staggered bricks
        const quarter = Math.floor(s / 4);
        this.drawBrick(ctx, 1, y + 1, quarter, rowH - 1, brickColor, highlightColor, shadowColor);
        this.drawBrick(ctx, quarter + 2, y + 1, mid - 1, rowH - 1, brickColor, highlightColor, shadowColor);
        this.drawBrick(ctx, quarter + mid + 2, y + 1, quarter - 2, rowH - 1, brickColor, highlightColor, shadowColor);
      }
    }

    return c;
  }

  drawBrick(ctx, x, y, w, h, base, hi, sh) {
    if (w <= 0 || h <= 0) return;
    ctx.fillStyle = base;
    ctx.fillRect(x, y, w, h);
    ctx.fillStyle = hi;
    ctx.fillRect(x, y, w, 1);
    ctx.fillRect(x, y, 1, h);
    ctx.fillStyle = sh;
    ctx.fillRect(x, y + h - 1, w, 1);
    ctx.fillRect(x + w - 1, y, 1, h);
  }

  renderFloor(isLit) {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Base flagstone
    ctx.fillStyle = isLit ? '#1c2430' : '#0a0d13';
    ctx.fillRect(0, 0, s, s);

    // Stone tile body
    ctx.fillStyle = isLit ? '#263140' : '#10151e';
    ctx.fillRect(1, 1, s - 2, s - 2);

    if (isLit) {
      // Subtle stone cross joint
      ctx.fillStyle = '#1e2733';
      ctx.fillRect(Math.floor(s / 2), 0, 1, s);
      ctx.fillRect(0, Math.floor(s / 2), s, 1);

      // Micro stone texture accents
      ctx.fillStyle = '#344357';
      ctx.fillRect(4, 5, 2, 2);
      ctx.fillRect(s - 7, 6, 2, 2);
      ctx.fillRect(6, s - 8, 2, 2);
      ctx.fillRect(s - 8, s - 7, 2, 2);

      // Edge shadow
      ctx.fillStyle = '#141b24';
      ctx.fillRect(s - 1, 0, 1, s);
      ctx.fillRect(0, s - 1, s, 1);
    }

    return c;
  }

  renderStairs() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Pit base
    ctx.fillStyle = '#06090e';
    ctx.fillRect(0, 0, s, s);

    // 5 carved stone descending steps
    const steps = 5;
    const stepH = Math.floor(s / steps);

    for (let i = 0; i < steps; i++) {
      const y = i * stepH;
      const inset = i * 2;
      const w = s - inset * 2;

      ctx.fillStyle = i % 2 === 0 ? '#6e7f96' : '#50617a';
      ctx.fillRect(inset, y, w, stepH - 1);

      ctx.fillStyle = '#121822';
      ctx.fillRect(inset, y + stepH - 1, w, 1);
    }

    // Glowing downward amber chevron
    ctx.fillStyle = '#f0883e';
    ctx.beginPath();
    ctx.moveTo(s / 2, s - 4);
    ctx.lineTo(s / 2 - 5, s - 11);
    ctx.lineTo(s / 2 + 5, s - 11);
    ctx.closePath();
    ctx.fill();

    return c;
  }

  // --- Characters ---

  renderHero() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Crimson Cape
    ctx.fillStyle = '#da3633';
    ctx.fillRect(5, 11, s - 10, 13);
    ctx.fillStyle = '#b62324';
    ctx.fillRect(6, 13, s - 12, 10);

    // Steel Plate Body
    ctx.fillStyle = '#8b949e';
    ctx.fillRect(7, 9, s - 14, 11);
    ctx.fillStyle = '#c9d1d9';
    ctx.fillRect(9, 10, s - 18, 9);

    // Gold Belt & Buckle
    ctx.fillStyle = '#d29922';
    ctx.fillRect(8, 17, s - 16, 2);
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(s / 2 - 2, 16, 4, 4);

    // Helmet with Visor
    ctx.fillStyle = '#8b949e';
    ctx.fillRect(7, 2, s - 14, 8);
    ctx.fillStyle = '#c9d1d9';
    ctx.fillRect(9, 3, s - 18, 5);

    // Azure Glowing Visor
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(9, 5, s - 18, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(11, 5, 2, 2);

    // Steel Longsword (Right hand)
    ctx.fillStyle = '#f0f6fc';
    ctx.fillRect(s - 5, 3, 2, 17);
    ctx.fillStyle = '#d29922'; // crossguard
    ctx.fillRect(s - 7, 15, 6, 2);
    ctx.fillStyle = '#8b949e'; // hilt
    ctx.fillRect(s - 5, 17, 2, 4);

    // Knight Shield (Left hand)
    ctx.fillStyle = '#1f6feb';
    ctx.fillRect(3, 9, 4, 11);
    ctx.fillStyle = '#ffffff'; // Cross insignia
    ctx.fillRect(4, 11, 2, 7);
    ctx.fillRect(3, 13, 4, 2);

    return c;
  }

  renderGoblin() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Pointed Ears
    ctx.fillStyle = '#2ea043';
    ctx.beginPath();
    ctx.moveTo(3, 8);
    ctx.lineTo(8, 5);
    ctx.lineTo(8, 11);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s - 3, 8);
    ctx.lineTo(s - 8, 5);
    ctx.lineTo(s - 8, 11);
    ctx.fill();

    // Head
    ctx.fillStyle = '#3fb950';
    ctx.fillRect(7, 4, s - 14, 9);

    // Evil Glowing Eyes
    ctx.fillStyle = '#f85149';
    ctx.fillRect(9, 6, 3, 3);
    ctx.fillRect(s - 12, 6, 3, 3);
    ctx.fillStyle = '#fffa65';
    ctx.fillRect(10, 7, 1, 1);
    ctx.fillRect(s - 11, 7, 1, 1);

    // Ragged Leather Garb
    ctx.fillStyle = '#5c4033';
    ctx.fillRect(6, 12, s - 12, 11);

    // Pointed Dagger
    ctx.fillStyle = '#8b949e';
    ctx.fillRect(s - 4, 9, 2, 10);
    ctx.fillStyle = '#2ea043'; // Poison tip
    ctx.fillRect(s - 4, 9, 2, 2);

    return c;
  }

  renderOrc() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Bulky Shoulders
    ctx.fillStyle = '#196c2e';
    ctx.fillRect(4, 8, s - 8, 15);

    // Iron Brow Helm
    ctx.fillStyle = '#484f58';
    ctx.fillRect(6, 2, s - 12, 5);
    ctx.fillStyle = '#6e7681';
    ctx.fillRect(5, 5, 2, 3);
    ctx.fillRect(s - 7, 5, 2, 3);

    // Head
    ctx.fillStyle = '#238636';
    ctx.fillRect(7, 5, s - 14, 8);

    // Piercing Red Eyes
    ctx.fillStyle = '#f85149';
    ctx.fillRect(9, 7, 3, 2);
    ctx.fillRect(s - 12, 7, 3, 2);

    // White Tusks
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 11, 2, 3);
    ctx.fillRect(s - 11, 11, 2, 3);

    // Iron Cleaver
    ctx.fillStyle = '#8b949e';
    ctx.fillRect(s - 5, 4, 4, 15);
    ctx.fillStyle = '#f85149'; // Blood stain
    ctx.fillRect(s - 5, 4, 2, 2);

    return c;
  }

  renderSkeleton() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Ribcage
    ctx.fillStyle = '#c9d1d9';
    ctx.fillRect(7, 12, s - 14, 9);
    ctx.fillStyle = '#0a0d13';
    ctx.fillRect(9, 13, s - 18, 1);
    ctx.fillRect(9, 15, s - 18, 1);
    ctx.fillRect(9, 17, s - 18, 1);

    // Skull
    ctx.fillStyle = '#f0f6fc';
    ctx.fillRect(7, 3, s - 14, 9);
    ctx.fillStyle = '#c9d1d9';
    ctx.fillRect(9, 11, s - 18, 2);

    // Dark Hollow Eyes with Blue Soulfire
    ctx.fillStyle = '#06090e';
    ctx.fillRect(9, 6, 3, 3);
    ctx.fillRect(s - 12, 6, 3, 3);
    ctx.fillStyle = '#58a6ff';
    ctx.fillRect(10, 7, 1, 1);
    ctx.fillRect(s - 11, 7, 1, 1);

    // Bone Blade
    ctx.fillStyle = '#c9d1d9';
    ctx.fillRect(s - 4, 4, 2, 17);

    return c;
  }

  renderDrake() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Spread Dragon Wings
    ctx.fillStyle = '#3c1e70';
    ctx.beginPath();
    ctx.moveTo(2, 6);
    ctx.lineTo(8, 12);
    ctx.lineTo(2, 18);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s - 2, 6);
    ctx.lineTo(s - 8, 12);
    ctx.lineTo(s - 2, 18);
    ctx.fill();

    // Dragon Body
    ctx.fillStyle = '#5a2da8';
    ctx.fillRect(7, 6, s - 14, 15);

    // Horned Head
    ctx.fillStyle = '#7a3ee0';
    ctx.fillRect(7, 2, s - 14, 9);
    ctx.fillStyle = '#f78166'; // Horns
    ctx.fillRect(5, 0, 3, 4);
    ctx.fillRect(s - 8, 0, 3, 4);

    // Flaming Eyes
    ctx.fillStyle = '#ff7b72';
    ctx.fillRect(9, 5, 3, 2);
    ctx.fillRect(s - 12, 5, 3, 2);

    // Embers
    ctx.fillStyle = '#ffa657';
    ctx.fillRect(s / 2 - 1, 10, 2, 2);

    return c;
  }

  renderBoss() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Dark Crimson Aura
    ctx.fillStyle = 'rgba(255, 0, 85, 0.25)';
    ctx.fillRect(0, 0, s, s);

    // Shadow Cloak
    ctx.fillStyle = '#1a000c';
    ctx.fillRect(4, 6, s - 8, 19);

    // Colossal Horns
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.moveTo(3, 0);
    ctx.lineTo(8, 5);
    ctx.lineTo(4, 9);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(s - 3, 0);
    ctx.lineTo(s - 8, 5);
    ctx.lineTo(s - 4, 9);
    ctx.fill();

    // Crown of Skulls
    ctx.fillStyle = '#d29922';
    ctx.fillRect(6, 3, s - 12, 3);
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(s / 2 - 1, 1, 3, 3);

    // Demon Face
    ctx.fillStyle = '#380015';
    ctx.fillRect(6, 5, s - 12, 9);

    // Burning Red Eyes
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(8, 7, 3, 3);
    ctx.fillRect(s - 11, 7, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(9, 8, 1, 1);
    ctx.fillRect(s - 10, 8, 1, 1);

    // Soulfire Scythe
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(s - 4, 1, 2, 22);
    ctx.fillRect(s - 7, 1, 5, 3);

    return c;
  }

  // --- Items ---

  renderPotion() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Cork Stopper
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(s / 2 - 3, 3, 6, 3);

    // Glass Neck
    ctx.fillStyle = '#8b949e';
    ctx.fillRect(s / 2 - 2, 6, 4, 3);

    // Flask Body
    ctx.fillStyle = '#f85149';
    ctx.beginPath();
    ctx.arc(s / 2, s / 2 + 3, 8, 0, Math.PI * 2);
    ctx.fill();

    // Liquid Highlight
    ctx.fillStyle = '#ff7b72';
    ctx.fillRect(s / 2 - 4, s / 2 + 1, 3, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(s / 2 + 2, s / 2, 2, 4);

    return c;
  }

  renderScroll() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Parchment Body
    ctx.fillStyle = '#e3b341';
    ctx.fillRect(5, 5, s - 10, 18);

    // Spindle Roll Edges
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(3, 5, 2, 18);
    ctx.fillRect(s - 5, 5, 2, 18);

    // Violet Ribbon
    ctx.fillStyle = '#a371f7';
    ctx.fillRect(5, s / 2 - 2, s - 10, 4);
    ctx.fillStyle = '#7a3ee0';
    ctx.fillRect(s / 2 - 3, s / 2 - 3, 6, 6);

    return c;
  }

  renderWeapon() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Diagonal Blade
    ctx.strokeStyle = '#f0f6fc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(s - 5, 5);
    ctx.lineTo(8, s - 8);
    ctx.stroke();

    // Golden Crossguard
    ctx.fillStyle = '#d29922';
    ctx.fillRect(6, s - 12, 7, 3);
    ctx.fillRect(9, s - 10, 3, 6);

    // Sapphire Pommel
    ctx.fillStyle = '#58a6ff';
    ctx.fillRect(9, s - 4, 3, 3);

    return c;
  }

  renderArmor() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Steel Breastplate
    ctx.fillStyle = '#8b949e';
    ctx.fillRect(6, 6, s - 12, 16);

    // Shoulder Pauldrons
    ctx.fillStyle = '#c9d1d9';
    ctx.fillRect(3, 6, 5, 6);
    ctx.fillRect(s - 8, 6, 5, 6);

    // Center Ridge Highlight
    ctx.fillStyle = '#f0f6fc';
    ctx.fillRect(s / 2 - 1, 7, 2, 14);

    // Gold Buckles
    ctx.fillStyle = '#d29922';
    ctx.fillRect(6, 12, s - 12, 2);

    return c;
  }

  renderGold() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Coins Stack
    ctx.fillStyle = '#d29922';
    ctx.beginPath();
    ctx.arc(s / 2 - 4, s / 2 + 4, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#e3b341';
    ctx.beginPath();
    ctx.arc(s / 2 + 4, s / 2 + 4, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(s / 2, s / 2 - 2, 6, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(s / 2 - 2, s / 2 - 5, 3, 3);

    return c;
  }

  renderAmulet() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Golden Chain
    ctx.strokeStyle = '#d29922';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(s / 2, 7, 7, 0, Math.PI);
    ctx.stroke();

    // Golden Medallion
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(s / 2, s / 2 + 3, 8, 0, Math.PI * 2);
    ctx.fill();

    // Radiant Cyan Core
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(s / 2, s / 2 + 3, 4, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle Glint
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(s / 2 - 1, s / 2 + 2, 2, 2);

    return c;
  }
}
