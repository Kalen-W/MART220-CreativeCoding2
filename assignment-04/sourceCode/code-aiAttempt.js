class enemyBase {
  constructor(x = cellSize * 12, y = cellSize * 14.5) {
    this.x = x;
    this.y = y;
    this.angle = toRadians(0);
    this.speed = 2;
    this.speedMod = 1.6;
  }

  loopAngle() {
    this.angle = roundRadian(this.angle);
  }

  movement() {
    if (collidesWithMap(this.x+Math.cos(this.angle)*this.speed, this.y+Math.sin(this.angle)*this.speed)) {
      this.speed *= -1;
      return;
    }

    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.loopAngle();
  }
}

class enemyType1 extends enemyBase {
  //
}


var enemyArray = [];
enemyArray.push(new enemyBase());

enemyArray.forEach((item, i) => {
  item.movement
});
