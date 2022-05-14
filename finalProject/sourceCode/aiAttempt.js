// https://github.com/jakesgordon/javascript-state-machine

//--------------------------------------------------------------------------------------------------------------------------------|Classes
class EnemyBase {
  constructor(type, x, y) {
    this.type = type;
    this.x = x * cellSize;
    this.y = y * cellSize;
    this.angle = toRadians(0);
    this.speed = 0;
    this.strafeSpeed = 0;
    this.moveSpeed = enemyTypes[type].moveSpeed;
    this.angleMoveSpeed = Math.round(Math.sqrt((this.moveSpeed * this.moveSpeed) / 2) * 1000) / 1000;

    this.health = enemyTypes[type].health;

    this.walkCycleTime = 900;
    this.numWalkSprites = 4;
    this.walkSpriteOffset = 1;

    this.dead = false;
    this.stallTime = 0;
    this.stallTimeThreshold = 1500 + Math.floor(Math.random() * 1000);
  }

  movement(timeDelta, now) {
    if (this.dead) { return; }

    this.angle = roundRadian(this.angle);
    var mul = timeDelta / logicTick;
    var moveStep = mul * this.speed;
    var strafeStep = mul * this.strafeSpeed;
    const strafeAngle = roundRadian(-this.angle-halfPi);
    var newX = this.x;
    var newY = this.y;

    newX += Math.cos(this.angle + Math.PI) * moveStep;
    newY += Math.sin(this.angle + Math.PI) * moveStep;
    newX += Math.cos(strafeAngle) * strafeStep;
    newY += Math.sin(strafeAngle) * strafeStep;

    var pos = checkCollision(this.x,this.y, newX,newY, playerCollisionSize);

    // This is an attempt to make the enemies move a different direction if hitting a wall. It doesn't really work.
    if ((Math.floor(this.x*1000) == Math.floor(pos.x*1000) && Math.floor(this.y*1000) == Math.floor(pos.y*1000)) || this.strafeSpeed != 0 && this.distance < 256) {
      this.stallTime += timeDelta;
      //console.log(this.stallTime);

      if (this.stallTime >= this.stallTimeThreshold && this.strafeSpeed == 0) {
        if (Math.floor(Math.random()*2) >= 1) { this.strafeSpeed = this.angleMoveSpeed;
        } else { this.strafeSpeed = -this.angleMoveSpeed; }
        this.speed = 0;

      } else if (this.stallTime >= this.stallTimeThreshold * 2) {
        this.stallTime = 0;
        this.strafeSpeed = 0;
      }
    } else {
      this.stallTime = 0;
      this.strafeSpeed = 0;
    }

    this.x = pos.x;
    this.y = pos.y;
  }


  ai(now) {
    if (this.dead || this.playingAnimation || this.strafeSpeed != 0) { return; }

    if (this.distance > 72 && this.distance < 256) {
      this.speed = this.moveSpeed;
      this.state = Math.floor((now % this.walkCycleTime) / (this.walkCycleTime / this.numWalkSprites)) + this.walkSpriteOffset;
    } else {
      this.state = 0;
      this.speed = 0;
    }
  }


  hit(damage) {
    if (this.dead) { return; }

    this.health -= damage;
    if (this.health <= 0) {
      this.dead = true;
      this.state = 4;
      this.deathAnimation();
    } else {
      this.playingAnimation = true;
      this.state = 9;
      setTimeout(this.hitAnimation.bind(this), 200);
    }
  }


  hitAnimation() {
    this.state = 0;
    this.playingAnimation = false;
  }


  deathAnimation() { // TODO: Find a way to do this without using set timeout - ?
    this.playingAnimation = true;
    this.state += 1;

    if (this.state >= 8) {
      createWorldParticles(this.x, this.y, 1, 4, 'gibs');
      this.state = 10;
      this.playingAnimation = false;
      return;
    }

    setTimeout(this.deathAnimation.bind(this), 100);
  }
}




//--------------------------------------------------------------------------------------------------------------------------------|Functions
function enemyUpdates(timeDelta, now) {
  for (var i=0; i<enemies.length; i++) {
    enemy = enemies[i];
    if (enemy.dead || enemy.distance>384) { continue; }
    enemy.ai(now);
    enemy.movement(timeDelta, now);
  }
}




//--------------------------------------------------------------------------------------------------------------------------------|Variables
const enemyTypes = [
  {texture: new Texture("enemySprites/guard.png"), moveSpeed: 0.05 * cellSize, rotSpeed: 3, totalStates: 13, health: 6}
];


var mapEnemies = [
  new EnemyBase(0,  12.5,   15.5),
  new EnemyBase(0,  2,      10),
  new EnemyBase(0,  1.5,    6),
  new EnemyBase(0,  4,      30),
  new EnemyBase(0,  11,     2),
  new EnemyBase(0,  35,     3),
  new EnemyBase(0,  49,     2),
  new EnemyBase(0,  21,     2),
  new EnemyBase(0,  37,     25),
  new EnemyBase(0,  38.5,   30.5),
  new EnemyBase(0,  46.5,   24.5),
  new EnemyBase(0,  43.5,   12.5),
];
