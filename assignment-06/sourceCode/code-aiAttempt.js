// https://github.com/jakesgordon/javascript-state-machine

//--------------------------------------------------------------------------------------------------------------------------------|Classes
class enemyBase {
  constructor(type, x, y) {
    this.type = type;
    this.x = x * cellSize;
    this.y = y * cellSize;
    this.angle = toRadians(0);
    this.speed = 2;
    this.speedMod = 1.6;

    this.sprite = new Image(16, 16);
    this.sprite.src = "./assets/textures/directionalTestSprite/DirectionalTestSprite-F.png";
  }

  movement() {
    this.angle = roundRadian(this.angle);

    var newX = this.x;
    var newY = this.y;
    newX += Math.cos(this.angle) * this.speed;
    newY += Math.sin(this.angle) * this.speed;

    if (collidesWithMap(newX, newY)) {
      this.speed *= -1;
      return;
    }
    this.x = newX;
    this.y = newY;
  }
}

class enemyType1 extends enemyBase {
  //
}


//--------------------------------------------------------------------------------------------------------------------------------|Functions
function enemyUpdates() {
  enemyArray.forEach((item, i) => {
    item.movement;
  });
}


//--------------------------------------------------------------------------------------------------------------------------------|Variables
const enemyTypes = [
  {img: "./assets/textures/enemySprites/guard.png", moveSpeed: 2, rotSpeed: 3, totalStates: 13},
];

var enemyArray = [
  new enemyBase(0, 12, 14),
];
