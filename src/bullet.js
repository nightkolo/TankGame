class Bullet {
  constructor(px, py, dirX = 0, dirY = -1, spd = 10.0, size = 25.0, col = [255, 175, 175]){
    const mag = Math.sqrt((dirX * dirX) + (dirY * dirY)) || 0;
    this.dirX = dirX / mag;
    this.dirY = dirY / mag;
    this.x = px;
    this.y = py;
    this.spd = spd;
    this.col = col;

    this.size = size;
    this.lifetime = 4.0;
    this.alive = true;
    this.hasBeenReflected = false;

    this.spawned();
  }
  spawned(){
    setTimeout(() => {
      this.alive = false;
    }, this.lifetime * 1000.0);
  }
  reflect(){
    this.hasBeenReflected = true;

    this.dirX *= -1;
    this.dirY *= -1
  }
  update(){
    this.x += 0.05 * deltaTime * this.dirX * this.spd;
    this.y += 0.05 * deltaTime * this.dirY * this.spd;
  }
  show(){
    if (Game.Debug.showHitboxes){
      stroke(0);
      circle(this.x, this.y, this.size);
      
      stroke(255, 0, 0);
      fill(0, 0, 0, 0);
      circle(this.x, this.y, this.size / Game.ENEMY_BULLETS_HITBOX_SIZE_DIVISOR);
    } else {
      fill(...this.col);
      circle(this.x, this.y, this.size);
    }
  }
}