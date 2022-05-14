//--------------------------------------------------------------------------------------------------------------------------------|Weapon Class
class Weapon {
  constructor(textureLink, totalStates, rangeType, damage, pierceAmount) {
    this.texture = new Texture(textureLink);
    this.scaleFac = 12;
    this.totalStates = totalStates;
    this.state = 0;
    this.playingAnimation = false;
    this.rangeType = rangeType;
    this.damage = damage;
    this.pierceAmount = pierceAmount;

    this.x = center.x - (textureRez * 0.5) * this.scaleFac;
    this.y = screenH - textureRez * this.scaleFac;
  }


  init() {
    this.x = (center.x - (textureRez * 0.5) * this.scaleFac) - (this.texture.w * this.scaleFac * 0.5) / textureRez;
    this.y = screenH - textureRez * this.scaleFac;
  }


  use() {
    if (this.playingAnimation) { return; }
    this.useAnimation();
    if (enemiesInCrosshair.length <= 0) { return; }

    // Enemies get added to array from furthest to closest, so hit detection works through the array backwards.
    var pierceCount = -1;
    for (var i=enemiesInCrosshair.length-1; i>=0; i--) {
      if (!enemiesInCrosshair[i].dead) {
        enemiesInCrosshair[i].hit(this.damage);
        pierceCount++;
        if (pierceCount >= this.pierceAmount) { break; }
      }
    }
  }


  useAnimation() { // TODO: Find a way to do this without using set timeout - ?
    this.playingAnimation = true;
    this.state += 1;

    if (this.state == 2) {
      createOverlayParticles(center.x, this.y+(40*this.scaleFac), 12, 'smoke');
    } else if (this.state >= this.totalStates) {
      this.state = 0;
      this.playingAnimation = false;
      return;
    }

    setTimeout(this.useAnimation.bind(this), 85);
  }

  render(ctx) {
    var sx = textureRez * this.state;
    var sy = 0;

    ctx.drawImage(this.texture.img, sx,sy, textureRez,textureRez, this.x,this.y, textureRez*this.scaleFac,textureRez*this.scaleFac);
  }
}


const heldItemTypes = [
  new Weapon("weaponSprites/wolfensteinWeapon-Pistol.png", 5, 'hitscan', 7, 1),  // Now initiated by start button.
  new Weapon("weaponSprites/wolfensteinWeapon-Pistol.png", 5, 'hitscan', 2, 0),  // Now initiated by start button.
];




//--------------------------------------------------------------------------------------------------------------------------------|Player Section
class PlayerClass {
  constructor() {
    this.x = cellSize * 13;
    this.y = cellSize * 19.5;
    this.angle = toRadians(0);
    this.verticalAngle = toRadians(0);
    this.jumpHeight = 0;
    this.jumpStop = false;
    this.verticalVelocity = 0;
    this.g = -36 * cellSize;
    this.jumpVelocity = 250 * cellSize;

    this.speed = 0;
    this.strafeSpeed = 0;
    this.moveSpeed = 0.12 * cellSize;
    this.angleMoveSpeed = Math.round(Math.sqrt((this.moveSpeed * this.moveSpeed) / 2) * 1000) / 1000;
    this.sprintSpeed = this.moveSpeed * 1.65;
    this.angleSprintSpeed = Math.round(Math.sqrt((this.sprintSpeed * this.sprintSpeed) / 2) * 1000) / 1000;

    this.heldItem = heldItemTypes[1];
  }

  // TODO: Make movement velovity / acceleration based - ?
  movement(timeDelta) {
    this.angle = roundRadian(this.angle);

    var mul = timeDelta / logicTick;
    var moveStep = mul * this.speed;
    var strafeStep = mul * this.strafeSpeed;
    const strafeAngle = roundRadian(this.angle-halfPi);
    var newX = this.x;
    var newY = this.y;

    newX += Math.cos(this.angle) * moveStep;
    newY += Math.sin(this.angle) * moveStep;
    newX += Math.cos(strafeAngle) * strafeStep;
    newY += Math.sin(strafeAngle) * strafeStep;

    var pos = checkCollision(this.x,this.y, newX,newY, playerCollisionSize);
    this.x = pos.x;
    this.y = pos.y;


    if (keyMap.move_jump) { this.jump(); }

    this.verticalVelocityUpdate(mul);
  }

  verticalVelocityUpdate(mul) {
    var newJumpHeight = this.jumpHeight + (this.verticalVelocity * mul);

    if (newJumpHeight > 0) {
      this.jumpHeight = newJumpHeight;
      this.verticalVelocity += this.g * mul;
    } else {
      this.jumpHeight = 0;
      this.verticalVelocity = 0;
    }

    if (this.jumpHeight <= 0) {
      this.jumpHeight = 0;
      this.verticalVelocity = 0;
    }
  }

  jump() {  // TODO: Jump height visual effect is effected by the screen/canvas size (as the change is pixel based).
    if (this.jumpHeight > 0) { return; }
    this.verticalVelocity += this.jumpVelocity;
  }

  useHeldItem() {
    this.heldItem.use();
  }
}
const player = new PlayerClass();


//--------------------------------------------------------------------------------------------------------------------------------|Collision Functions
function outOfMapBounds(x, y) {
  return x < 0 || x >= mapWidth || y < 0 || y >= mapHeight;
}

function collidesWithMap(x, y) {
  // x = Math.floor(x/cellSize);
  // y = Math.floor(y/cellSize);
  if (x < 0 || x >= mapWidth || y < 0 || y >= mapHeight) { return true; }
  x = Math.floor(x);
  y = Math.floor(y);
  if (currentMap[y][x] != 0) { return true; }
  if (spriteMap[y][x] && spriteMap[y][x].block) { return true; }
  return false;
  //return x < 0 || x >= mapWidth || y < 0 || y >= mapHeight || currentMap[y][x] != 0 || (spriteMap[y][x] && spriteMap[y][x].block);
}

function checkCollision(fromX,fromY, toX,toY, radius) {
  var pos = { x: fromX/cellSize, y: fromY/cellSize };
  var toX = toX / cellSize;
  var toY = toY / cellSize;

  if (toY<0 || toY>=mapHeight || toX<0 || toX>=mapWidth) { return pos; }

  var blockX = Math.floor(toX);
  var blockY = Math.floor(toY);

  if (collidesWithMap(blockX,blockY)) {
    /*
    if (!collidesWithMap(blockX-1,blockY)) { // if cell to left == 0
      return {x: (blockX-radius)*cellSize, y: pos.y*cellSize};
    }
    if (!collidesWithMap(blockX-1,blockY-1)) { // if cell to top-left == 0
      return {x: (blockX-radius)*cellSize, y: (blockY-radius)*cellSize};
    }
    if (!collidesWithMap(blockX,blockY-1)) { // if cell to top == 0
      return {x: pos.x*cellSize, y: (blockY-radius)*cellSize};
    }
    if (!collidesWithMap(blockX+1,blockY-1)) { // if cell to top-right == 0
      return {x: (blockX+1+radius)*cellSize, y: (blockY-radius)*cellSize};
    }
    if (!collidesWithMap(blockX+1,blockY)) { // if cell to right == 0
      return {x: (blockX+1+radius)*cellSize, y: pos.y*cellSize};
    }
    if (!collidesWithMap(blockX+1,blockY+1)) { // if cell to bottom-right == 0
      return {x: (blockX+1+radius)*cellSize, y: (blockY+1+radius)*cellSize};
    }
    if (!collidesWithMap(blockX,blockY+1)) { // if cell to bottom == 0
      return {x: pos.x*cellSize, y: (blockY+1+radius)*cellSize};
    }
    if (!collidesWithMap(blockX-1,blockY+1)) { // if cell to bottom-left == 0
      return {x: (blockX-radius)*cellSize, y: (blockY+1+radius)*cellSize};
    }
    */
    return {x: pos.x*cellSize, y: pos.y*cellSize};
  }

  pos.x = toX;
  pos.y = toY;
  var blockTop = collidesWithMap(blockX,blockY-1);
  var blockBottom = collidesWithMap(blockX,blockY+1);
  var blockLeft = collidesWithMap(blockX-1,blockY);
  var blockRight = collidesWithMap(blockX+1,blockY);

  if (blockTop != 0 && toY-blockY < radius) { toY = pos.y = blockY + radius; }
  if (blockBottom != 0 && blockY+1-toY < radius) { toY = pos.y = blockY + 1 - radius; }
  if (blockLeft != 0 && toX-blockX < radius) { toX = pos.x = blockX + radius; }
  if (blockRight != 0 && blockX+1-toX < radius) { toX = pos.x = blockX + 1 - radius; }

  // is tile to the top-left a wall
  if (collidesWithMap(blockX-1,blockY-1) != 0 && !(blockTop != 0 && blockLeft != 0)) {
    var dx = toX - blockX;
    var dy = toY - blockY;
    if (dx*dx+dy*dy < radius*radius) {
      if (dx*dx > dy*dy) {
        toX = pos.x = blockX + radius;
      } else {
        toY = pos.y = blockY + radius;
      }
    }
  }
  // is tile to the top-right a wall
  if (collidesWithMap(blockX+1,blockY-1) != 0 && !(blockTop != 0 && blockRight != 0)) {
		var dx = toX - (blockX+1);
		var dy = toY - blockY;
		if (dx*dx+dy*dy < radius*radius) {
			if (dx*dx > dy*dy) {
				toX = pos.x = blockX + 1 - radius;
			} else {
				toY = pos.y = blockY + radius;
      }
		}
	}
	// is tile to the bottom-left a wall
	if (collidesWithMap(blockX-1,blockY+1) != 0 && !(blockBottom != 0 && blockLeft != 0)) {
		var dx = toX - blockX;
		var dy = toY - (blockY+1);
		if (dx*dx+dy*dy < radius*radius) {
			if (dx*dx > dy*dy) {
				toX = pos.x = blockX + radius;
			} else {
				toY = pos.y = blockY + 1 - radius;
      }
		}
	}
	// is tile to the bottom-right a wall
	if (collidesWithMap(blockX+1,blockY+1) != 0 && !(blockBottom != 0 && blockRight != 0)) {
		var dx = toX - (blockX+1);
		var dy = toY - (blockY+1);
		if (dx*dx+dy*dy < radius*radius) {
			if (dx*dx > dy*dy) {
				toX = pos.x = blockX + 1 - radius;
			} else {
				toY = pos.y = blockY + 1 - radius;
      }
		}
	}

  pos.x *= cellSize;
  pos.y *= cellSize;
  return pos;
}




//--------------------------------------------------------------------------------------------------------------------------------|Event Listeners
document.addEventListener('keydown', (e) => {
  if (e.key == 'Tab') {
    e.preventDefault();
  }
});


document.addEventListener('keyup', (e) => {
  if ((e.key == "Tab" || e.key == "Escape") && gameInitiated) {
    pauseUpdate();
  } else if (e.key == "`" && options.mapEditorEnabled) {
    toggleMapEditor();
  }
});


// keyMap based off code from: https://stackoverflow.com/a/12444641
var keyMap = {};
onkeydown = onkeyup = function(e) {
  var eKey = e.key.toLowerCase();
  if (Object.values(controlKeys).includes(eKey)) {
    keyMap[Object.keys(controlKeys).find(key => controlKeys[key] === eKey)] = e.type == 'keydown';
  }

  if (!pause) {
    playerMoveCheck();
    if (keyMap.look_recenter) { player.verticalAngle = 0; }
  }
}


function playerMoveCheck() {
  if (keyMap.move_sprint) {
    var moveSpeed = player.sprintSpeed;
    var angleMoveSpeed = player.angleSprintSpeed;
  } else {
    var moveSpeed = player.moveSpeed;
    var angleMoveSpeed = player.angleMoveSpeed;
  }

  if (keyMap.move_yNeg && keyMap.move_yPos) {
    player.speed = 0;
    if (keyMap.move_xNeg && !keyMap.move_xPos) {
      player.strafeSpeed = moveSpeed;
    } else if (keyMap.move_xPos && !keyMap.move_xNeg) {
      player.strafeSpeed = -moveSpeed;
    } else {
      player.strafeSpeed = 0;
    }
  } else if (keyMap.move_xNeg && keyMap.move_xPos) {
    player.strafeSpeed = 0;
    if (keyMap.move_yNeg && !keyMap.move_yPos) {
      player.speed = moveSpeed;
    } else if (keyMap.move_yPos && !keyMap.move_yNeg) {
      player.speed = -moveSpeed;
    } else {
      player.speed = 0;
    }
  } else if (keyMap.move_yNeg && keyMap.move_xNeg) {
    player.speed = angleMoveSpeed;
    player.strafeSpeed = angleMoveSpeed;
  } else if (keyMap.move_yNeg && keyMap.move_xPos) {
    player.speed = angleMoveSpeed;
    player.strafeSpeed = -angleMoveSpeed;
  } else if (keyMap.move_yPos && keyMap.move_xNeg) {
    player.speed = -angleMoveSpeed;
    player.strafeSpeed = angleMoveSpeed;
  } else if (keyMap.move_yPos && keyMap.move_xPos) {
    player.speed = -angleMoveSpeed;
    player.strafeSpeed = -angleMoveSpeed;
  } else if (keyMap.move_yNeg) {
    player.speed = moveSpeed;
    player.strafeSpeed = 0;
  } else if (keyMap.move_yPos) {
    player.speed = -moveSpeed;
    player.strafeSpeed = 0;
  } else if (keyMap.move_xNeg) {
    player.strafeSpeed = moveSpeed;
    player.speed = 0;
  } else if (keyMap.move_xPos) {
    player.strafeSpeed = -moveSpeed;
    player.speed = 0;
  } else {
    player.speed = 0;
    player.strafeSpeed = 0;
  }
}


document.addEventListener('mousemove', (e) => {
  if (!pause) {
    player.angle += toRadians(e.movementX * 0.4 * options.horizontalMouseSensitivity);
    //player.verticalAngle -= e.movementY * 20 * options.mouseSensitivity;
    player.verticalAngle -= toRadians(e.movementY * 0.65 * options.verticalMouseSensitivity);

    if (player.verticalAngle > halfPi) {
      player.verticalAngle = halfPi;
    } else if (player.verticalAngle < -halfPi) {
      player.verticalAngle = -halfPi;
    }
  }
});


document.addEventListener('click', (e) => {
  if (!pause) {
    overlayCanvas.requestPointerLock();
    if (e.button == lmbNum) { player.useHeldItem(); }
  }
});


document.addEventListener("mousedown", (e) => {
  if (e.button == lmbNum) { lmbIsDown = true; }
  if (e.button == rmbNum) { rmbIsDown = true; }
});


document.addEventListener("mouseup", (e) => {
  if (e.button == lmbNum) { lmbIsDown = false; }
  if (e.button == rmbNum) { rmbIsDown = false; }
});


document.addEventListener('contextmenu', (e) => {
  // Prevents right mouse click context menu.
  e.preventDefault();
});


window.addEventListener('blur', (e) => {
  // console.log("window blur event");
  // Insures player won't continue moving if a key is held when window losses focus.
  // Also pauses game if it isn't already.
  keyMap = {};
  playerMoveCheck();
  if (!pause) { pauseUpdate(); }
});
