class TankMath {
  static offScreen(x, y, canSizeX = 900.0, canSizeY = 720.0){
    return (x > canSizeX || x < 0.0 || y > canSizeY || y < 0.0);
  }
  static circleCollision(x1, y1, r1, x2, y2, r2) { // the game <3 this function
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < (r1 + r2);
  }
}