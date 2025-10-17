class Bullet {
  constructor(px, py, dirX = 0, dirY = -1, spd = 10.0, size = 25.0){
    this.dirX = dirX;
    this.dirY = dirY;
    this.x = px;
    this.y = py;
    this.spd = spd;
    this.health = 1;

    this.size = size;
    this.lifetime = 3.0;
    this.alive = true;

    this.spawned();
  }
  spawned(){
    // setTimeout(this.lifetimeEnded.bind(this), this.lifetime * 1000.0);
    setTimeout(() => {
      this.alive = false;
    }, this.lifetime * 1000.0);
  }
  changeDir(px = 0, py = 0){ // Experimental
    this.dir = {
      x: px,
      y: py
    }
  }

  update(){
    this.x += this.dirX * this.spd;
    this.y += this.dirY * this.spd;
  }
  show(){
    fill(255);
    circle(this.x, this.y, this.size);
  }

  offScreen(){
    return (this.x > canSize.x || this.x < 0.0 || this.y > canSize.y || this.y < 0.0);
  }
}