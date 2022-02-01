//Kalen Weinheimer
//01-31-2022

//All code here is based of the following tutorial: https://youtu.be/5nSFArCgCXA
//This tutorial's code can also be found on GitHub: https://github.com/satansdeer/raycaster

//--------------------------------------------------------------------------------------------------------------------------------|Variable Section
var screenW = window.innerWidth-1;
var screenH = window.innerHeight-5;

const tick = 30;
var cellSize = 32;
var playerSize = 10;
const fov = toRadians(60);

var colors = {
  floor: "#825640",
  ceiling: "#dcdcdc",
  wall: "#309db4",
  wallDark: "#426068",
  rays: "#ffa600",
}

const canvas = document.createElement("canvas");
canvas.setAttribute("width", screenW);
canvas.setAttribute("height", screenH);
document.body.appendChild(canvas)
const context = canvas.getContext("2d");


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


//--------------------------------------------------------------------------------------------------------------------------------|Render Scene Function
function fixFishEye(distance, angle, playerAngle) {
  const diff = angle - playerAngle;
  return distance + Math.cos(diff);
}

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


//--------------------------------------------------------------------------------------------------------------------------------|Render Minimap Function
function renderMinimap(posX = 0, posY = 0, scale = 1, rays) {
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

  context.fillStyle = "#367aa1";
  context.fillRect(
    posX + player.x * scale - playerSize / 2,
    posY + player.y * scale - playerSize / 2,
    playerSize,
    playerSize
  );

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


//--------------------------------------------------------------------------------------------------------------------------------|Game Loop Section
function gameLoop() {
  clearScreen();
  movePlayer();
  const rays = getRays();
  renderScene(rays);
  renderMinimap(0, 0, 0.75, rays);
  renderText();
}


//--------------------------------------------------------------------------------------------------------------------------------|Math Functions
function toRadians(deg) {
  return (deg * Math.PI) / 180;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
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


//--------------------------------------------------------------------------------------------------------------------------------|Setup

setInterval(gameLoop, tick);


//--------------------------------------------------------------------------------------------------------------------------------|Render Text Function
function renderText() {
  context.font = "26px Monospace";
  context.fillStyle = "#222";
  context.fillText("Kalen Weinheimer", screenW-256, screenH-32)
  context.fillText("Raycasting Prototype", 224, 32)
}
