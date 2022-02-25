// https://github.com/jakesgordon/javascript-state-machine

class enemyBase {
  constructor(x = cellSize * 12, y = cellSize * 14.5) {
    this.x = x;
    this.y = y;
    this.angle = toRadians(0);
    this.speed = 2;
    this.speedMod = 1.6;

    this.sprite = new Image(16, 16);
    this.sprite.src = "./assets/textures/directionalTestSprite/DirectionalTestSprite-F.png";
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


function enemyUpdates() {
  enemyArray.forEach((item, i) => {
    item.movement
  });
}
