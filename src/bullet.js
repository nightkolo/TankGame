class Bullet {
  constructor(px, py, dirX = 0, dirY = -1, spd = 10.0, size = 25.0){
    this.dirX = dirX;
    this.dirY = dirY;
    this.x = px;
    this.y = py;
    this.spd = spd;

   // Assets
    // this.img_p_up = loadImage("img/bullet-up-player.svg");
    // this.img_p_right = loadImage("img/bullet-right-player.svg");
    // this.img_p_left = loadImage("img/bullet-left-player.svg");
    // this.img_p_down = loadImage("img/bullet-down-player.svg");

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
    this.x += this.dirX * this.spd;
    this.y += this.dirY * this.spd;
  }
  show(){
    fill(255, 255, 255, 10);
    circle(this.x, this.y, this.size);

    // Images cause intense lag
  //   imageMode(CENTER);
  //    if (this.dirX > 0){
  //     image(this.img_p_right, this.x + 33.0, this.y);

  //   } else if (this.dirX < 0){
  //     image(this.img_p_left, this.x - 33.0, this.y);

  //   } else if (this.dirY > 0){
  //     image(this.img_p_down, this.x, this.y + 33.0);
      
  //   } else if (this.dirY < 0){
  //     image(this.img_p_up, this.x, this.y - 33.0); 
  //   }
  }

  // TODO remove when bullet is offscreen
  offScreen(){
    return (this.x > canSize.x || this.x < 0.0 || this.y > canSize.y || this.y < 0.0);
  }
}