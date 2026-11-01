/**
 * Field of View computation using circular raycasting.
 * Updates visible and explored flags on map tiles.
 */
export class FOV {
  /**
   * Compute FOV from a source position with a given radius.
   * @param {import('./map.js').GameMap} map
   * @param {number} startX
   * @param {number} startY
   * @param {number} radius
   */
  static compute(map, startX, startY, radius = 8) {
    // Reset currently visible status for all tiles
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        map.tiles[y][x].visible = false;
      }
    }

    // Origin is always visible and explored
    if (map.inBounds(startX, startY)) {
      map.tiles[startY][startX].visible = true;
      map.tiles[startY][startX].explored = true;
    }

    const steps = 360;
    for (let i = 0; i < steps; i++) {
      const angle = (i * Math.PI * 2) / steps;
      const dx = Math.cos(angle);
      const dy = Math.sin(angle);

      let curX = startX + 0.5;
      let curY = startY + 0.5;

      for (let dist = 0; dist < radius; dist++) {
        curX += dx;
        curY += dy;

        const tileX = Math.floor(curX);
        const tileY = Math.floor(curY);

        if (!map.inBounds(tileX, tileY)) break;

        const tile = map.tiles[tileY][tileX];
        tile.visible = true;
        tile.explored = true;

        if (tile.blocksSight) {
          break; // Stop ray on walls
        }
      }
    }
  }
}
