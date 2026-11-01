/**
 * Simple pursuit AI and enemy turn logic.
 */
export class AI {
  /**
   * Process a turn for an enemy monster.
   * @param {import('./entity.js').Monster} monster
   * @param {import('./main.js').Game} game
   */
  static takeTurn(monster, game) {
    if (!monster.isAlive) return;

    const player = game.player;
    const dx = player.x - monster.x;
    const dy = player.y - monster.y;
    const distance = Math.hypot(dx, dy);

    // Only react if within vision range (8 tiles) and tile is explored/visible
    if (distance <= 8 && game.map.tiles[monster.y][monster.x].visible) {
      if (distance < 1.5) {
        // Attack adjacent player
        game.attack(monster, player);
      } else {
        // Step closer
        const stepX = Math.sign(dx);
        const stepY = Math.sign(dy);

        // Try direct cardinal/diagonal step
        const targetX = monster.x + stepX;
        const targetY = monster.y + stepY;

        if (this.canMove(game, targetX, targetY)) {
          monster.moveTo(targetX, targetY);
        } else if (stepX !== 0 && this.canMove(game, monster.x + stepX, monster.y)) {
          monster.moveTo(monster.x + stepX, monster.y);
        } else if (stepY !== 0 && this.canMove(game, monster.x, monster.y + stepY)) {
          monster.moveTo(monster.x, monster.y + stepY);
        }
      }
    }
  }

  static canMove(game, x, y) {
    if (game.map.isBlocked(x, y)) return false;
    const blockingEntity = game.getBlockingEntityAt(x, y);
    return !blockingEntity;
  }
}
