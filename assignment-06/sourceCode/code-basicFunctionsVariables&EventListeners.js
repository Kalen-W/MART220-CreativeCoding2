//--------------------------------------------------------------------------------------------------------------------------------|Variable Section
var screenW = window.innerWidth-1;
var screenH = window.innerHeight-4;
var center = {x: screenW*.5, y: screenH*.5}

var options = {
  minimap: true,
  overlayElements: true,
  crosshair: true,
  crosshairR: 2,
  crosshairD: 0,
  fullscreen: false,
  fov: screenW > 1440 ? 70 : 60,        // player fov
  fontSize: Math.floor(screenW * .022),
  lineWidth: screenW > 960 ? 2 : 1,     // changes width/number of "strips" drawn
  mobileControls: false,
  touchSensitivity: .2,
};
//Object.entries(options).forEach((item, i) => { console.log(item); });

options.crosshairD = options.crosshairR*2;
screenW = Math.floor(screenW / options.lineWidth) * options.lineWidth;

//var fpsArray = [0, 0];
var fps = 0;
const logicTick = 40;       // ~25 fps
var lastLogicLoopTime = 0;
var totalTicks = 0;
const renderTick = 40;
var lastRenderLoopTime = 0;

var pause = false;
var mousePos = {x: 0, y: 0};
var spriteMap;
var visibleSprites = [];
var oldVisibleSprites = [];

const cellSize = 18;
const playerSize = 8;
const playerCollisionSize = 0.25;
var fov = toRadians(options.fov);   // player fov
const viewDist = center.x/Math.tan(fov/2);
const textureRez = 64;              // standard texture pixel resolution (assumes square textures)

var colors = {
  wallDefault: "#282828",
  floorTop: "#323d3a",
  floorBottom: "#4b544d",
  ceilingTop: "#a5cbe3",
  ceilingBottom: "#829ec1",
  wall: "#309db4",
  wallDark: "#406068",
  rays: "#ffa600",
  pauseMenuBg: "#20232592",
  overlayTextFill: "#1a1a1a",
  overlayTextStroke: "#b8b8b8",
  crosshair: "#f0f0f0e0",
}

const canvas = document.createElement("canvas");
canvas.setAttribute("width", screenW);
canvas.setAttribute("height", screenH);
canvas.setAttribute("z-index", "-2");
canvas.style.position = "absolute";
canvas.style.top = 0;
canvas.style.left = 0;
document.body.appendChild(canvas);
const context = canvas.getContext("2d",  { alpha: false });

const overlayCanvas = document.createElement("canvas");
overlayCanvas.setAttribute("width", screenW);
overlayCanvas.setAttribute("height", screenH);
overlayCanvas.setAttribute("z-index", "-1");
overlayCanvas.style.position = "absolute";
overlayCanvas.style.top = 0;
overlayCanvas.style.left = 0;
document.body.appendChild(overlayCanvas);
const overlayContext = overlayCanvas.getContext("2d");

// canvas.offscreenCanvas = document.createElement("canvas");
// canvas.offscreenCanvas.width = canvas.width;
// canvas.offscreenCanvas.height = canvas.height;

context.webkitImageSmoothingEnabled = false;
context.mozImageSmoothingEnabled = false;
context.imageSmoothingEnabled = false;
overlayContext.webkitImageSmoothingEnabled = false;
overlayContext.mozImageSmoothingEnabled = false;
overlayContext.imageSmoothingEnabled = false;

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

  if (collidesWithMap(blockX,blockY)) { return pos; }

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
	if (collidesWithMap(blockX-1,blockY+1) != 0 && !(blockBottom != 0 && blockBottom != 0)) {
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


//--------------------------------------------------------------------------------------------------------------------------------|Math Functions
function fixFishEye(distance, angle, playerAngle) {
  //const diff = angle - playerAngle;
  const diff = playerAngle - angle;
  return distance * Math.cos(diff);
}

function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function roundRadian(num) {
  return ((num % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI);
}

function getAngle(x1,y1, x2,y2) {
  const adj = x2 - x1;
  const opp = y2 - y1;
  return adj >= 0
  ? ((Math.atan(opp/adj) % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI)
  : (((Math.atan(opp/adj) % (2*Math.PI)) + 2*Math.PI) % (2*Math.PI)) - Math.PI;
}


//--------------------------------------------------------------------------------------------------------------------------------|Player Section
class playerClass {
  constructor() {
    this.x = cellSize * 13;
    this.y = cellSize * 19.5;
    this.angle = toRadians(0);
    this.speed = 0;
    this.strafeSpeed = 0;
    this.moveSpeed = 2.5;
    this.angleMoveSpeed = this.moveSpeed * .5;
    this.inventory = [];
    this.heldItem;
  }

  /*adjustSpeed() {
    if (this.speed != 0 && this.strafeSpeed != 0) {
      if (this.speed > 0) {
        this.speed = this.moveSpeed * .5;
      } else {
        this.speed = -this.moveSpeed * .5;
      }
      if (this.strafeSpeed > 0) {
        this.strafeSpeed = this.moveSpeed * .5;
      } else {
        this.strafeSpeed = -this.moveSpeed * .5;
      }
    } else if (this.speed != 0) {
      if (this.speed > 0) {
        this.speed = this.moveSpeed;
      } else {
        this.speed = -this.moveSpeed;
      }
    } else if (this.strafeSpeed != 0) {
      if (this.strafeSpeed > 0) {
        this.strafeSpeed = this.moveSpeed;
      } else {
        this.strafeSpeed = -this.moveSpeed;
      }
    }
  }*/

  movement(timeDelta) {
    //if (collidesWithMap(this.x+Math.cos(this.angle)*this.speed, this.y+Math.sin(this.angle)*this.speed)) { return; }
    this.angle = roundRadian(this.angle);

    //this.adjustSpeed();

    var mul = timeDelta / logicTick;
    var moveStep = mul * this.speed;
    var strafeStep = mul * this.strafeSpeed;
    const strafeAngle = roundRadian(this.angle-.5*Math.PI);
    var newX = this.x;
    var newY = this.y;

    newX += Math.cos(this.angle) * moveStep;
    newY += Math.sin(this.angle) * moveStep;
    newX += Math.cos(strafeAngle) * strafeStep;
    newY += Math.sin(strafeAngle) * strafeStep;

    // if (collidesWithMap(newX, newY)) { return; }
    // this.x = newX;
    // this.y = newY;
    var pos = checkCollision(this.x,this.y, newX,newY, playerCollisionSize);
    this.x = pos.x;
    this.y = pos.y;
  }
}
const player = new playerClass();


//--------------------------------------------------------------------------------------------------------------------------------|Event Listeners
document.addEventListener("keydown", (e) => {
  /*if (!pause) {
    if (e.key == "w") {
      player.speed = player.moveSpeed;
    } else if (e.key == "s") {
      player.speed = -player.moveSpeed;
    }
    if (e.key == "a") {
      player.strafeSpeed = player.moveSpeed;
    } else if (e.key == "d") {
      player.strafeSpeed = -player.moveSpeed;
    }
  }*/

  if (e.key == "Tab" || e.key == "F11") {
    e.preventDefault();
  }
});

document.addEventListener("keyup", (e) => {
  /*if (!pause) {
    if (e.key == "w" || e.key == "s") {
      player.speed = 0;
    }
    if (e.key == "a" || e.key == "d") {
      player.strafeSpeed = 0;
    }
  }*/

  if (e.key == "Tab") {
    pauseUpdate();
  } else if (e.key == "F11") {
    toggleFullscreen();
  } else if (e.key == "`") {
    //toggleMapEditor();
  }
});

// keyMap code from: https://stackoverflow.com/a/12444641
var keyMap = {};
onkeydown = onkeyup = function(e){
  keyMap[e.key.toLowerCase()] = e.type == 'keydown';
  //console.log(keyMap);

  if (!pause) {
    playerMoveCheck();
  }
}

function playerMoveCheck() {
  if (keyMap.w && keyMap.s) {
    player.speed = 0;
    if (keyMap.a && !keyMap.d) {
      player.strafeSpeed = player.moveSpeed;
    } else if (keyMap.d && !keyMap.a) {
      player.strafeSpeed = -player.moveSpeed;
    } else {
      player.strafeSpeed = 0;
    }
  } else if (keyMap.a && keyMap.d) {
    player.strafeSpeed = 0;
    if (keyMap.w && !keyMap.s) {
      player.speed = player.moveSpeed;
    } else if (keyMap.s && !keyMap.w) {
      player.speed = -player.moveSpeed;
    } else {
      player.speed = 0;
    }
  } else if (keyMap.w && keyMap.a) {
    player.speed = player.angleMoveSpeed;
    player.strafeSpeed = player.angleMoveSpeed;
  } else if (keyMap.w && keyMap.d) {
    player.speed = player.angleMoveSpeed;
    player.strafeSpeed = -player.angleMoveSpeed;
  } else if (keyMap.s && keyMap.a) {
    player.speed = -player.angleMoveSpeed;
    player.strafeSpeed = player.angleMoveSpeed;
  } else if (keyMap.s && keyMap.d) {
    player.speed = -player.angleMoveSpeed;
    player.strafeSpeed = -player.angleMoveSpeed;
  } else if (keyMap.w) {
    player.speed = player.moveSpeed;
    player.strafeSpeed = 0;
  } else if (keyMap.s) {
    player.speed = -player.moveSpeed;
    player.strafeSpeed = 0;
  } else if (keyMap.a) {
    player.strafeSpeed = player.moveSpeed;
    player.speed = 0;
  } else if (keyMap.d) {
    player.strafeSpeed = -player.moveSpeed;
    player.speed = 0;
  } else {
    player.speed = 0;
    player.strafeSpeed = 0;
  }
}


document.addEventListener("mousemove", function (e) {
  if (!pause) {
    player.angle += toRadians(e.movementX);
  }
});

overlayCanvas.addEventListener("click", () => {
  if (!options.mobileControls) {
    overlayCanvas.requestPointerLock();
  }
});

overlayCanvas.addEventListener("mousemove", function(e) {
  mousePos = getMousePos(overlayCanvas, e);
});

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {x: evt.clientX-rect.left, y: evt.clientY-rect.top};
}


//--------------------------------------------------------------------------------------------------------------------------------|Mobile Controls Section
// mobileAndTabletCheck code is from: detectmobilebrowsers.com
// Which I found about here: stackoverflow.com/a/11381730
window.mobileAndTabletCheck = function() {
  let check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  console.log("Mobile = " + check);
  return check;
};
options.mobileControls = mobileAndTabletCheck();


var lastTouch;
var touchStart;
document.addEventListener("touchmove", function (e) {
  //e.preventDefault();
  if (options.mobileControls && !pause) {
    //console.log(e.changedTouches[0].identifier);
    //console.log(e.touches[0].pageX + " | " + touches[0].pageX);

    if (touchStart.pageX >= screenW*.5) {
      const diff = lastTouch.pageX - e.touches[0].pageX;
      player.angle += toRadians(diff*options.touchSensitivity);
      lastTouch = e.touches[0];
    }
  }
});

document.addEventListener("touchstart", function (e) {
  //e.preventDefault();
  if (options.mobileControls && !pause) {
    lastTouch = e.touches[0];
    touchStart = e.touches[0];
  }
});
//  developer.mozilla.org/en-US/docs/Web/API/Touch_events/Using_Touch_Events
//  developer.mozilla.org/en-US/docs/Web/API/TouchEvent/changedTouches
//  stackoverflow.com/questions/13863974/rotate-element-based-on-touch-event
//* developer.mozilla.org/en-US/docs/Web/API/Touch_events
//  developer.mozilla.org/en-US/docs/Games/Techniques/Control_mechanisms/Mobile_touch


// Add joystick? (jsfiddle.net/aa0et7tr/5/)
