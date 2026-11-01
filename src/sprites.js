/**
 * 2D Sprite Generator & Cache for Shadow Crawl.
 * Pre-renders crisp 2D pixel-art style sprites on offscreen canvases for 60fps rendering.
 */

export class SpriteRenderer {
  constructor(tileSize = 20) {
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

  // --- Environment Sprites ---

  renderWall(isLit) {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Brick mortar base
    ctx.fillStyle = isLit ? '#1b222d' : '#0e1218';
    ctx.fillRect(0, 0, s, s);

    // Stone bricks (top row)
    ctx.fillStyle = isLit ? '#455060' : '#1c222c';
    ctx.fillRect(1, 1, Math.floor(s / 2) - 2, Math.floor(s / 2) - 2);
    ctx.fillRect(Math.floor(s / 2), 1, Math.floor(s / 2) - 1, Math.floor(s / 2) - 2);

    // Stone bricks (bottom row - offset)
    const midY = Math.floor(s / 2);
    const quarterX = Math.floor(s / 4);
    ctx.fillRect(1, midY, quarterX + 1, Math.floor(s / 2) - 2);
    ctx.fillRect(quarterX + 3, midY, Math.floor(s / 2) - 1, Math.floor(s / 2) - 2);
    ctx.fillRect(quarterX + Math.floor(s / 2) + 3, midY, quarterX - 1, Math.floor(s / 2) - 2);

    // Highlights & Shadows
    if (isLit) {
      ctx.fillStyle = '#6e7f96';
      ctx.fillRect(1, 1, s - 2, 1);
    }

    return c;
  }

  renderFloor(isLit) {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Stone tile base
    ctx.fillStyle = isLit ? '#28313e' : '#10141a';
    ctx.fillRect(0, 0, s, s);

    // Inner tile border / flagstone
    ctx.fillStyle = isLit ? '#323e4e' : '#151b22';
    ctx.fillRect(1, 1, s - 2, s - 2);

    // Subtle stone fleck
    if (isLit) {
      ctx.fillStyle = '#414f64';
      ctx.fillRect(3, 4, 2, 2);
      ctx.fillRect(s - 6, s - 6, 2, 2);
      ctx.fillStyle = '#1e252f';
      ctx.fillRect(s - 1, 0, 1, s);
      ctx.fillRect(0, s - 1, s, 1);
    }

    return c;
  }

  renderStairs() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Base background
    ctx.fillStyle = '#222b37';
    ctx.fillRect(0, 0, s, s);

    // 4 descending stone steps
    const stepCount = 4;
    const stepH = Math.floor(s / stepCount);

    for (let i = 0; i < stepCount; i++) {
      const y = i * stepH;
      // Step tread
      ctx.fillStyle = i % 2 === 0 ? '#8b949e' : '#6e7681';
      ctx.fillRect(2 + i, y, s - 4 - i * 2, stepH - 1);
      // Dark pit depth
      ctx.fillStyle = '#0d1117';
      ctx.fillRect(2 + i, y + stepH - 1, s - 4 - i * 2, 1);
    }

    // Downward arrow indicator
    ctx.fillStyle = '#f0883e';
    ctx.beginPath();
    ctx.moveTo(s / 2, s - 4);
    ctx.lineTo(s / 2 - 3, s - 8);
    ctx.lineTo(s / 2 + 3, s - 8);
    ctx.closePath();
    ctx.fill();

    return c;
  }

  // --- Character Sprites ---

  renderHero() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Knight Blue Cloak
    ctx.fillStyle = '#1f6feb';
    ctx.fillRect(3, 8, s - 6, 9);

    // Steel Armor / Breastplate
    ctx.fillStyle = '#c9d1d9';
    ctx.fillRect(5, 7, s - 10, 8);

    // Steel Helmet
    ctx.fillStyle = '#8b949e';
    ctx.fillRect(5, 2, s - 10, 6);

    // Glowing Azure Visor slit
    ctx.fillStyle = '#58a6ff';
    ctx.fillRect(7, 4, s - 14, 2);

    // Gold Trim / Belt
    ctx.fillStyle = '#d29922';
    ctx.fillRect(5, 12, s - 10, 2);

    // Sword (Right Hand)
    ctx.fillStyle = '#f0f6fc';
    ctx.fillRect(s - 4, 3, 2, 10);
    ctx.fillStyle = '#d29922'; // crossguard
    ctx.fillRect(s - 5, 11, 4, 2);

    // Shield (Left Hand)
    ctx.fillStyle = '#388bfd';
    ctx.fillRect(2, 6, 3, 8);
    ctx.fillStyle = '#f0f6fc';
    ctx.fillRect(3, 8, 1, 4);

    return c;
  }

  renderGoblin() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Green Goblin Body
    ctx.fillStyle = '#238636';
    ctx.fillRect(5, 6, s - 10, 9);

    // Pointy Ears
    ctx.fillStyle = '#2ea043';
    ctx.fillRect(2, 4, 3, 3);
    ctx.fillRect(s - 5, 4, 3, 3);

    // Goblin Head
    ctx.fillStyle = '#3fb950';
    ctx.fillRect(5, 3, s - 10, 6);

    // Evil Red Eyes
    ctx.fillStyle = '#f85149';
    ctx.fillRect(6, 5, 2, 2);
    ctx.fillRect(s - 8, 5, 2, 2);

    // Ragged Leather vest
    ctx.fillStyle = '#5a3d28';
    ctx.fillRect(5, 9, s - 10, 5);

    // Dagger
    ctx.fillStyle = '#8b949e';
    ctx.fillRect(s - 3, 7, 2, 6);

    return c;
  }

  renderOrc() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Dark Green Heavy Body
    ctx.fillStyle = '#196c2e';
    ctx.fillRect(3, 5, s - 6, 11);

    // Head
    ctx.fillStyle = '#238636';
    ctx.fillRect(4, 2, s - 8, 7);

    // Iron Brow / Helmet
    ctx.fillStyle = '#484f58';
    ctx.fillRect(4, 2, s - 8, 3);

    // Piercing Amber Eyes
    ctx.fillStyle = '#e3b341';
    ctx.fillRect(6, 5, 2, 2);
    ctx.fillRect(s - 8, 5, 2, 2);

    // White Tusks
    ctx.fillStyle = '#f0f6fc';
    ctx.fillRect(6, 8, 2, 2);
    ctx.fillRect(s - 8, 8, 2, 2);

    // Spiked Shoulder / Cleaver
    ctx.fillStyle = '#6e7681';
    ctx.fillRect(s - 4, 4, 3, 10);
    ctx.fillStyle = '#f85149';
    ctx.fillRect(s - 4, 4, 1, 1);

    return c;
  }

  renderSkeleton() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Ribcage
    ctx.fillStyle = '#c9d1d9';
    ctx.fillRect(5, 8, s - 10, 7);
    ctx.fillStyle = '#0d1117'; // Rib slits
    ctx.fillRect(6, 9, s - 12, 1);
    ctx.fillRect(6, 11, s - 12, 1);
    ctx.fillRect(6, 13, s - 12, 1);

    // Skull
    ctx.fillStyle = '#f0f6fc';
    ctx.fillRect(5, 2, s - 10, 6);

    // Hollow Dark Eyes
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(7, 4, 2, 2);
    ctx.fillRect(s - 9, 4, 2, 2);

    // Bone / Iron Blade
    ctx.fillStyle = '#8b949e';
    ctx.fillRect(s - 3, 2, 2, 12);

    return c;
  }

  renderDrake() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Dark Dragon Wings
    ctx.fillStyle = '#4c2889';
    ctx.fillRect(1, 4, 4, 8);
    ctx.fillRect(s - 5, 4, 4, 8);

    // Scaled Body
    ctx.fillStyle = '#6e40c9';
    ctx.fillRect(5, 5, s - 10, 10);

    // Horned Head
    ctx.fillStyle = '#8957e5';
    ctx.fillRect(5, 2, s - 10, 6);
    ctx.fillStyle = '#f78166'; // Horns
    ctx.fillRect(4, 1, 2, 3);
    ctx.fillRect(s - 6, 1, 2, 3);

    // Flaming Eyes
    ctx.fillStyle = '#ffa657';
    ctx.fillRect(7, 4, 2, 2);
    ctx.fillRect(s - 9, 4, 2, 2);

    // Fire breath ember
    ctx.fillStyle = '#ff7b72';
    ctx.fillRect(s / 2 - 1, 8, 2, 2);

    return c;
  }

  renderBoss() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Shadow Aura
    ctx.fillStyle = 'rgba(255, 0, 85, 0.25)';
    ctx.fillRect(1, 1, s - 2, s - 2);

    // Dark Demonic Cloak
    ctx.fillStyle = '#21000f';
    ctx.fillRect(3, 4, s - 6, 13);

    // Crimson Horns
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(2, 0, 3, 5);
    ctx.fillRect(s - 5, 0, 3, 5);

    // Demon Head & Crown
    ctx.fillStyle = '#49001b';
    ctx.fillRect(5, 3, s - 10, 7);
    ctx.fillStyle = '#d29922'; // Barbed Gold Crown
    ctx.fillRect(5, 2, s - 10, 2);
    ctx.fillRect(s / 2 - 1, 1, 2, 2);

    // Burning Malevolent Eyes
    ctx.fillStyle = '#ff2a70';
    ctx.fillRect(6, 5, 2, 2);
    ctx.fillRect(s - 8, 5, 2, 2);

    // Soul Scythe / Blade
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(s - 3, 1, 2, 14);

    return c;
  }

  // --- Item Sprites ---

  renderPotion() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Wooden Cork
    ctx.fillStyle = '#8b5a2b';
    ctx.fillRect(s / 2 - 2, 2, 4, 2);

    // Glass Neck
    ctx.fillStyle = '#c9d1d9';
    ctx.fillRect(s / 2 - 1, 4, 2, 2);

    // Flask Glass Body
    ctx.fillStyle = '#f85149';
    ctx.beginPath();
    ctx.arc(s / 2, s / 2 + 2, s / 3, 0, Math.PI * 2);
    ctx.fill();

    // Liquid Highlight / Bubble
    ctx.fillStyle = '#ffa198';
    ctx.fillRect(s / 2 - 2, s / 2, 2, 2);

    // Glass sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(s / 2 + 1, s / 2 - 1, 2, 4);

    return c;
  }

  renderScroll() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Rolled Parchment
    ctx.fillStyle = '#d8b67b';
    ctx.fillRect(3, 4, s - 6, 12);

    // Edges
    ctx.fillStyle = '#bfa065';
    ctx.fillRect(2, 4, 2, 12);
    ctx.fillRect(s - 4, 4, 2, 12);

    // Purple Ribbon Tie
    ctx.fillStyle = '#a371f7';
    ctx.fillRect(3, s / 2 - 1, s - 6, 3);
    ctx.fillStyle = '#8957e5';
    ctx.fillRect(s / 2 - 2, s / 2 - 2, 4, 5);

    return c;
  }

  renderWeapon() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Diagonal Blade
    ctx.strokeStyle = '#f0f6fc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s - 4, 4);
    ctx.lineTo(6, s - 6);
    ctx.stroke();

    // Crossguard
    ctx.fillStyle = '#d29922';
    ctx.fillRect(5, s - 9, 5, 2);
    ctx.fillRect(7, s - 7, 2, 5);

    // Pommel gem
    ctx.fillStyle = '#58a6ff';
    ctx.fillRect(8, s - 3, 2, 2);

    return c;
  }

  renderArmor() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Steel Cuirass Breastplate
    ctx.fillStyle = '#8b949e';
    ctx.fillRect(4, 4, s - 8, 12);

    // Shoulder Pauldrons
    ctx.fillStyle = '#c9d1d9';
    ctx.fillRect(2, 4, 4, 4);
    ctx.fillRect(s - 6, 4, 4, 4);

    // Chest Plating Center Highlight
    ctx.fillStyle = '#f0f6fc';
    ctx.fillRect(s / 2 - 1, 5, 2, 9);

    // Gold Buckles
    ctx.fillStyle = '#d29922';
    ctx.fillRect(4, 9, s - 8, 1);
    ctx.fillRect(4, 13, s - 8, 1);

    return c;
  }

  renderGold() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Coin 1 (Bottom Left)
    ctx.fillStyle = '#d29922';
    ctx.beginPath();
    ctx.arc(s / 2 - 3, s / 2 + 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Coin 2 (Bottom Right)
    ctx.fillStyle = '#e3b341';
    ctx.beginPath();
    ctx.arc(s / 2 + 3, s / 2 + 3, 4, 0, Math.PI * 2);
    ctx.fill();

    // Coin 3 (Top Front)
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(s / 2, s / 2 - 2, 4, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle Glint
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(s / 2 - 1, s / 2 - 4, 2, 2);

    return c;
  }

  renderAmulet() {
    const { c, ctx } = this.createCanvas();
    const s = this.size;

    // Gold Chain
    ctx.strokeStyle = '#d29922';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(s / 2, 5, 5, 0, Math.PI);
    ctx.stroke();

    // Gold Medallion Base
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(s / 2, s / 2 + 2, 6, 0, Math.PI * 2);
    ctx.fill();

    // Radiant Cyan Gem Center
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(s / 2, s / 2 + 2, 3, 0, Math.PI * 2);
    ctx.fill();

    // Magic Shimmer
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(s / 2 - 1, s / 2 + 1, 2, 2);

    return c;
  }
}
