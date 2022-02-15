//--------------------------------------------------------------------------------------------------------------------------------|Variable Section
var screenW = window.innerWidth-1;
var screenH = window.innerHeight-4;

const tick = 30;
var totalTicks = 0;
var cellSize = 16;
var playerSize = 8;
const fov = toRadians(70);
var pause = false;

var mousePos = {
  x: 0,
  y: 0
};

var colors = {
  floor: "#4e584f",
  ceiling: "#dcdcdc",
  wall: "#309db4",
  wallDark: "#406068",
  rays: "#ffa600",
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


//--------------------------------------------------------------------------------------------------------------------------------|Misc Functions
function outOfMapBounds(x, y) {
  return x < 0 || x >= currentMap[0].length || y < 0 || y >= currentMap.length;
}

function collidesWithMap(x, y) {
  x = Math.floor(x/cellSize);
  y = Math.floor(y/cellSize);
  if (x < 0 || x >= currentMap[0].length || y < 0 || y >= currentMap.length) {
    return true;
  }

  return (currentMap[Math.floor(y)][Math.floor(x)] != 0);
}

function fixFishEye(distance, angle, playerAngle) {
  //const diff = angle - playerAngle;
  const diff = playerAngle - angle;
  return distance * Math.cos(diff);
}


//--------------------------------------------------------------------------------------------------------------------------------|Math Functions
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
    this.x = cellSize * 1.5;
    this.y = cellSize * 2;
    this.angle = toRadians(0);
    this.speed = 0;
    this.speedMod = 3;
  }

  loopAngle() {
    this.angle = roundRadian(this.angle);
  }

  movement() {
    if (collidesWithMap(this.x+Math.cos(this.angle)*this.speed, this.y+Math.sin(this.angle)*this.speed)) {
      return;
    }

    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;
    this.loopAngle();
  }
}
const player = new playerClass();


//--------------------------------------------------------------------------------------------------------------------------------|Event Listeners
document.addEventListener("keydown", (e) => {
  if (!pause && e.key == "w") {
    player.speed = player.speedMod;
  }
  if (!pause && e.key == "s") {
    player.speed = -player.speedMod;
  }
  if (e.key == "Tab") {
    e.preventDefault();
  }
});

document.addEventListener("keyup", (e) => {
  if (!pause && (e.key == "w" || e.key == "s")) {
    player.speed = 0;
  }
  if (e.key == "Tab") {
    pauseUpdate();
  }
});

document.addEventListener("mousemove", function (event) {
  if (!pause) {
    player.angle += toRadians(event.movementX);
  }
});

overlayCanvas.addEventListener("click", () => {
  overlayCanvas.requestPointerLock();
});

overlayCanvas.addEventListener("mousemove", function(evt) {
  mousePos = getMousePos(overlayCanvas, evt);
});

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  return {x: evt.clientX-rect.left, y: evt.clientY-rect.top};
}
