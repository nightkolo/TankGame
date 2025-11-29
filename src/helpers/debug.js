// Debug
function spawnEnemy(type) {
  let healthMin = 3;
  let enemyHealthFactor = 20.0;

  let spawnX = GameMath.randomFloat(200.0, width - 200);
  let spawnY = GameMath.randomFloat(200.0, height - 200);
  let health = healthMin + floor(random() * enemyHealthFactor);

  let newEnemy = new Enemy({
    x: spawnX,
    y: spawnY,
    health: health,
    player: p,
    bulletDir: curBulletDir,
    type: type,
  });

  enemies.push(newEnemy);
}