// Under construction

class Player {
  constructor(){
    this.x = 0.0;
    this.y = 0.0;
    this.size = 50.0
    this.enemies = [];
    
    this.lives = 5;
    this.alive = true;
    this.invincinble = false;
    this.iframeTime = 1.0;
  }
  hit(){
    if (this.invincinble) return;

    print("Ouch!");
  
    this.lives--;
    
    if (this.lives < 1) {
      this.die();
    }
  
    this.invincinble = true;
    setTimeout(() => {
      this.invincinble = false;
    }, this.iframeTime * 1000.0)
  }
  die(){
    // TODO Player death incomplete
    this.alive = false;
    print("Game over!")
  }
  insideAnEnemy(checkForSpawn = true){
    if (this.enemies.length == 0) return false;

    if (!this.enemies[0].hasSpawned && checkForSpawn) return false;

    return this.enemies.some((e) => 
      TankMath.circleCollision(
        this.x,
        this.y,
        this.size / 2.0,
        e.x,
        e.y,
        e.getSize() / 2.0
      )
    );
  }
  update(){
    this.x = mouseX;
    this.y = mouseY;
  }
  show(){
    if (this.invincinble){
      fill(255/2, 255/2, 200/2);
    } else {
      fill(255, 255, 200);
    }

    // TODO make into square
    circle(this.x, this.y, this.size);

    fill(255);
    strokeWeight(3);
    stroke(0)
    textSize(25.0);
    textAlign(CENTER);

    text(`${this.lives}`, this.x, this.y + 8.0);
  }
}