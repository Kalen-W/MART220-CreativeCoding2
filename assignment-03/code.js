//Kalen Weinheimer
//01-31-2022

//All code here is based of the following tutorial: https://youtu.be/5nSFArCgCXA
//This tutorial's code can also be found on GitHub: https://github.com/satansdeer/raycaster

//--------------------------------------------------------------------------------------------------------------------------------|Variable Section
var screenW = window.innerWidth-1;
var screenH = window.innerHeight-4;

const tick = 30;
var totalTicks = 0;
var cellSize = 32;
var playerSize = 10;
const fov = toRadians(60);

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
document.body.appendChild(canvas)
const context = canvas.getContext("2d");

setInterval(gameLoop, tick);


//--------------------------------------------------------------------------------------------------------------------------------|Game Loop Section
function gameLoop() {
  clearScreen();
  movePlayer();
  const rays = getRays();
  renderScene(rays);
  renderMinimap(0, 0, 0.75, rays);
  totalTicks++;
  renderOverlayElements();
  mapChangeTest();
}


//--------------------------------------------------------------------------------------------------------------------------------|Clear Screen Function
function clearScreen() {
  context.fillStyle = "#982b2b";
  context.fillRect(0, 0, screenW, screenH);
}


//--------------------------------------------------------------------------------------------------------------------------------|Ray Function Section
function outOfMapBounds(x, y) {
  return x < 0 || x >= currentMap[0].length || y < 0 || y >= currentMap.length;
}

function getVCollision(angle) {
  const right = Math.abs(Math.floor((angle - Math.PI / 2) / Math.PI) % 2);

  const firstX = right
    ? Math.floor(player.x / cellSize) * cellSize + cellSize
    : Math.floor(player.x / cellSize) * cellSize;
  const firstY = player.y + (firstX - player.x) * Math.tan(angle);

  const xA = right ? cellSize : -cellSize;
  const yA = xA * Math.tan(angle);

  let wall;
  let nextX = firstX;
  let nextY = firstY;

  while (!wall) {
    const cellX = right
      ? Math.floor(nextX / cellSize)
      : Math.floor(nextX / cellSize) - 1;
    const cellY = Math.floor(nextY / cellSize);

    if (outOfMapBounds(cellX, cellY)) {
      break;
    }
    wall = currentMap[cellY][cellX];
    if (!wall) {
      nextX += xA;
      nextY += yA;
    } else {}
  }

  return {
    angle,
    distance: distance(player.x, player.y, nextX, nextY),
    vertical: true,
  };
}

function getHCollision(angle) {
  const up = Math.abs(Math.floor(angle / Math.PI) % 2);
  const firstY = up
    ? Math.floor(player.y / cellSize) * cellSize
    : Math.floor(player.y / cellSize) * cellSize + cellSize;
  const firstX = player.x + (firstY - player.y) / Math.tan(angle);

  const yA = up ? -cellSize : cellSize;
  const xA = yA / Math.tan(angle);

  let wall;
  let nextX = firstX;
  let nextY = firstY;

  while (!wall) {
    const cellX = Math.floor(nextX / cellSize);
    const cellY = up
      ? Math.floor(nextY / cellSize) - 1
      : Math.floor(nextY / cellSize);

    if (outOfMapBounds(cellX, cellY)) {
      break;
    }
    wall = currentMap[cellY][cellX];
    if (!wall) {
      nextX += xA;
      nextY += yA;
    }
  }

  return {
    angle,
    distance: distance(player.x, player.y, nextX, nextY),
    vertical: false,
  };
}

function castRay(angle) {
  const vCollision = getVCollision(angle);
  const hCollision = getHCollision(angle);

  return hCollision.distance >= vCollision.distance ? vCollision : hCollision;
}

function getRays() {
  const initialAngle = player.angle - fov / 2;
  const numOfRays = screenW;
  const angleStep = fov / numOfRays;
  return Array.from({ length: numOfRays }, (_, i) => {
    const angle = initialAngle + i * angleStep;
    const ray = castRay(angle);
    return ray;
  });
}


//--------------------------------------------------------------------------------------------------------------------------------|Render Functions
function renderScene(rays) {
  rays.forEach((ray, i) => {
    const distance = fixFishEye(ray.distance, ray.angle, player.angle);
    const wallHeight = ((cellSize * 5) / distance) * 277;

    context.fillStyle = ray.vertical ? colors.wallDark : colors.wall;
    context.fillRect(i, screenH / 2 - wallHeight / 2, 1, wallHeight);

    context.fillStyle = colors.floor;
    context.fillRect(i, screenH / 2 + wallHeight / 2, 1, screenH / 2 - wallHeight / 2);

    context.fillStyle = colors.ceiling;
    context.fillRect(i, 0, 1, screenH / 2 - wallHeight / 2);
  });
}

function renderMinimap(posX = 0, posY = 0, scale = 1, rays) {
  // Displays map cells
  const mmCellSize = scale * cellSize;
  currentMap.forEach((row, y) => {
    row.forEach((cell, x) => {
      if (cell) {
        context.fillStyle = "#999";
        context.fillRect(
          posX + x * mmCellSize,
          posY + y * mmCellSize,
          mmCellSize,
          mmCellSize
        );
      }
    })
  });

  // Displays ray casts
  context.strokeStyle = colors.rays;
  rays.forEach((ray) => {
    context.beginPath();
    context.moveTo(posX + player.x * scale, posY + player.y * scale);
    context.lineTo(
      (player.x + Math.cos(ray.angle) * ray.distance) * scale,
      (player.y + Math.sin(ray.angle) * ray.distance) * scale
    );
    context.closePath();
    context.stroke();
  });

  // Displays player location
  context.fillStyle = "#367aa1";
  context.fillRect(
    posX + player.x * scale - playerSize / 2,
    posY + player.y * scale - playerSize / 2,
    playerSize,
    playerSize
  );

  // Displays player direction with short line
  const rayLength = playerSize*2;
  context.strokeStyle = "#4380ac";
  context.beginPath();
  context.moveTo(posX + player.x * scale, posY + player.y * scale);
  context.lineTo(
    (player.x + Math.cos(player.angle) * rayLength) * scale,
    (player.y + Math.sin(player.angle) * rayLength) * scale
  );
  context.closePath();
  context.stroke();
}


//--------------------------------------------------------------------------------------------------------------------------------|Math Functions
function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function fixFishEye(distance, angle, playerAngle) {
  const diff = angle - playerAngle;
  return distance * Math.cos(diff);
}


//--------------------------------------------------------------------------------------------------------------------------------|Player Section
const player = {
  x: cellSize * 1.5,
  y: cellSize * 2,
  angle: toRadians(0),
  speed: 0
}

function movePlayer() {
  player.x += Math.cos(player.angle) * player.speed;
  player.y += Math.sin(player.angle) * player.speed;
}


//--------------------------------------------------------------------------------------------------------------------------------|Event Listeners
document.addEventListener("keydown", (e) => {
  if (e.key == "w") {
    player.speed = 2;
  }
  if (e.key == "s") {
    player.speed = -2;
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key == "w" || e.key == "s") {
    player.speed = 0;
  }
});

document.addEventListener("mousemove", function (event) {
  player.angle += toRadians(event.movementX);
});

canvas.addEventListener("click", () => {
  canvas.requestPointerLock();
});


//--------------------------------------------------------------------------------------------------------------------------------|Overlay Elements
function renderOverlayElements() {
  context.font = "36px VT323, Monospace";
  context.fillStyle = "#222";
  renderText();
  renderTimer();
}

function renderText() {
  context.fillText("Raycasting Prototype", 8, 28);
  context.fillText("Kalen Weinheimer", screenW-256, screenH-24);
}

function renderTimer() {
  var timerStart = 1000 * 32; // in milliseconds
  var timerCurrent = timerStart-(totalTicks*tick) > 0 ? timerStart-(totalTicks*tick) : 0;

  //var timerMinutes = Math.floor((timerCurrent - (timerHours * 3600000)) / 60000);
  //var timerSeconds = Math.floor((timerCurrent - (timerHours * 3600000) - (timerMinutes * 60000)) / 1000);
  var timerHours = Math.floor(timerCurrent / 3600000);
  var timerMinutes = Math.floor((timerCurrent % 3600000) / 60000);
  var timerSeconds = Math.floor(((timerCurrent % 3600000) % 60000) / 1000);

  //console.log("Hours: " + timerHours + " - Minutes: " + timerMinutes + " - Seconds: " + timerSeconds);

  var timerHoursDisplay = timerHours < 10 ? "0" + timerHours : timerHours;
  var timerMinutesDisplay = timerMinutes < 10 ? "0" + timerMinutes : timerMinutes;
  var timerSecondsDisplay = timerSeconds < 10 ? "0" + timerSeconds : timerSeconds;

  var timerDisplay = "Timer: " + timerHoursDisplay + ":" + timerMinutesDisplay + ":" + timerSecondsDisplay;
  context.fillText(timerDisplay, screenW-222, 42);

  if (timerStart-(totalTicks*tick) < 0) {
    mapChangeFreq = 0;
    currentMap = skullMap;
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Window Resize Adjust
var mapChangeFreq = 12; // in number of ticks
var mapChangeVal = 0;
function mapChangeTest() {
  if (totalTicks % mapChangeFreq == 0) {
    if (mapChangeVal < 7) {
      mapChangeVal++;
    } else {
      mapChangeVal = 0;
    }
    currentMap = testMapArray[mapChangeVal];
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Window Resize Adjust
window.addEventListener('resize', windowSizeChange);

function windowSizeChange() {
  screenW = window.innerWidth-1;
  screenH = window.innerHeight-4;
  canvas.setAttribute("width", screenW);
  canvas.setAttribute("height", screenH);
}
