class Sprinker{
  constructor(x, y, shootSpd /*, shootingDir*/){
    this.x = x;
    this.y = y;
    this.size = 50.0;

    this.shootingSpdFactor = shootSpd;
    this.lastShotTime = 0.0;
    this.lifetime = 5.0;
    this.alive = true;
    // this.shootingDir = shootingDir; // it 

    this.spawned(); 
  }
  spawned(){
    setTimeout(() => {
      print("peace out")
      this.alive = false;
    }, this.lifetime * 1000.0)
  }
  spawnBullets() {
    if (millis() - this.lastShotTime > this.shootingSpdFactor * 1000) {
      this.lastShotTime = millis();
      return true; // ready to fire
    }
    return false;
  }
  update(){
    // square()
  }
  show(){
    square(this.x, this.y, this.size);
  }
}
