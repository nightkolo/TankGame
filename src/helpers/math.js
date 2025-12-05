class GameMath {
  static offScreen(x, y, canSizeX = 900.0, canSizeY = 720.0) {
    return x > canSizeX || x < 0.0 || y > canSizeY || y < 0.0;
  }
  static randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }
  static circleCollision(x1, y1, r1, x2, y2, r2) {
    return this.distance(x1, y1, x2, y2) < r1 + r2;
  }
  static circleRectCollision(cx, cy, r, rx, ry, rw, rh) {
    const dx = Math.abs(cx - rx);
    const dy = Math.abs(cy - ry);

    if (dx > rw / 2 + r) return false;
    if (dy > rh / 2 + r) return false;

    if (dx <= rw / 2) return true;
    if (dy <= rh / 2) return true;

    const cornerDistSq = (dx - rw / 2) ** 2 + (dy - rh / 2) ** 2;
    return cornerDistSq <= r * r;
  }
}