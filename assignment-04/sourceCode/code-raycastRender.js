setInterval(gameLoop, tick);


//--------------------------------------------------------------------------------------------------------------------------------|Game Loop Section
function gameLoop() {
  if (!pause) {
    player.movement();
    const rays = getRays();

    clearScreen();
    clearOverlayScreen();
    renderScene(rays);
    renderMinimap(0, 0, 0.5, rays);

    //mapChangeTest();
    totalTicks++;
  } else {
    //context.drawImage(canvas.offscreenCanvas, 0, 0);
    clearOverlayScreen();
    renderPauseMenu();
  }

  renderOverlayElements();
  overlayContext.drawImage(manaOrbAni[Math.floor((totalTicks%28)/4)].img, 2,192, 32,32);


  //overlayContext.drawImage(wallsImg, 512,512, 1128, 1256);
  //overlayContext.drawImage(canvas2, 512,512, 128, 256);
}


function clearScreen() {
  context.fillStyle = "#982b2b";
  context.fillRect(0, 0, screenW, screenH);
}

function clearOverlayScreen() {
  overlayContext.clearRect(0, 0, screenW, screenH);
  //overlayContext.fillRect(0, 0, screenW, screenH);
}

function pauseUpdate() {
  pause = !pause;
  //if (pause) {canvas.offscreenCanvas.getContext("2d").drawImage(canvas, 0, 0);}
  console.log("pause = " + pause);
}


//--------------------------------------------------------------------------------------------------------------------------------|Ray Function Section
function getVCollision(angle) {
  //const right = Math.abs(Math.floor((angle - Math.PI / 2) / Math.PI) % 2);
  const right = (angle > 1.5 * Math.PI || angle < 0.5 * Math.PI);

  const firstX = right
    ? Math.floor(player.x / cellSize) * cellSize + cellSize
    : Math.floor(player.x / cellSize) * cellSize;
  const firstY = player.y + (firstX - player.x) * Math.tan(angle);

  const xA = right ? cellSize : -cellSize;
  //const yA = xA * Math.tan(angle);
  const yA = xA * (Math.sin(angle) / Math.cos(angle));

  let wall;
  let nextX = firstX;
  let nextY = firstY;
  let dist = 0;

  while (!wall) {
    const cellX = right
     ? Math.floor(nextX / cellSize)
     : Math.floor(nextX / cellSize) - 1;
    const cellY = Math.floor(nextY / cellSize);
    // const cellX = right
    //   ? Math.ceil(player.x)
    //   : Math.floor(player.x);
    // const cellY = player.y + (cellX - player.x) * (Math.sin(angle) / Math.cos(angle));

    // if this point is outside of map bounds: do nothing
    if (outOfMapBounds(cellX, cellY)) {
      break;
    } // else: continue

    wall = currentMap[cellY][cellX];
    if (!wall) { // if this cell is a 0 (empty)
      nextX += xA;
      nextY += yA;
    } else {}
  }

  return {
    angle,
    distance: distance(player.x, player.y, nextX, nextY),
    vertical: true,
    right: right,
    up: false,
    type: wall
  };
}


function getHCollision(angle) {
  //const up = Math.abs(Math.floor(angle / Math.PI) % 2);
  const up = (angle < 0 || angle > Math.PI);

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

    // if this point is outside of map bounds: do nothing
    if (outOfMapBounds(cellX, cellY)) {
      break;
    } // else: continue

    wall = currentMap[cellY][cellX];
    if (!wall) { // if this cell is a 0 (empty)
      nextX += xA;
      nextY += yA;
    }
  }

  return {
    angle,
    distance: distance(player.x, player.y, nextX, nextY),
    vertical: false,
    right: false,
    up: up,
    type: wall
  };
}

function castRay(angle, rayId) {
  angle = roundRadian(angle);
  const vCollision = getVCollision(angle);
  const hCollision = getHCollision(angle);

  return hCollision.distance >= vCollision.distance ? vCollision : hCollision;
}

function getRays() {
  const initialAngle = player.angle - fov / 2;
  const numOfRays = screenW;
  const angleStep = fov / numOfRays;

  return Array.from({ length: numOfRays }, (_, i) => {
    //const rayScreenPos = initialAngle + i * angleStep;
    //const rayViewDist = Math.sqrt(rayScreenPos*rayScreenPos + viewDist*viewDist);

    const angle = initialAngle + i * angleStep;
    //const angle = Math.asin(rayScreenPos / rayViewDist);
    const ray = castRay(angle, i);
    return ray;
  });
}


//--------------------------------------------------------------------------------------------------------------------------------|Render Functions
function renderScene(rays) {
  rays.forEach((ray, i) => {
    const distance = fixFishEye(ray.distance, ray.angle, player.angle);
    const wallHeight = ((cellSize * 5) / distance) * 277;

    var top = screenH / 2 - wallHeight / 2;
    //var top = Math.round(screenH - wallHeight) / 2;

    //context.fillStyle = ray.vertical ? colors.wallDark : colors.wall;
    if (ray.vertical) {
      context.fillStyle = ray.right ? colors.wallDark : colors.wall;
    } else {
      context.fillStyle = ray.up ? colors.wallDark : colors.wall;
    }
    context.fillRect(i, top, 1, wallHeight);

    context.fillStyle = colors.floor;
    context.fillRect(i, screenH / 2 + wallHeight / 2, 1, screenH / 2 - wallHeight / 2);

    context.fillStyle = colors.ceiling;
    context.fillRect(i, 0, 1, top);
  });
}

function renderMinimap(posX = 0, posY = 0, scale = .5, rays) {
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
    });
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

  context.fillStyle = "#ab3e2a";
  enemyArray.forEach((enemy) => {
    context.fillRect(
      posX + enemy.x * scale - playerSize / 2,
      posY + enemy.y * scale - playerSize / 2,
      playerSize,
      playerSize
    );
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


//--------------------------------------------------------------------------------------------------------------------------------|Window Resize Adjust
window.addEventListener('resize', windowSizeChange);

function windowSizeChange() {
  screenW = window.innerWidth-1;
  screenH = window.innerHeight-4;

  canvas.setAttribute("width", screenW);
  canvas.setAttribute("height", screenH);

  overlayCanvas.setAttribute("width", screenW);
  overlayCanvas.setAttribute("height", screenH);

  canvas.offscreenCanvas.width = canvas.width;
  canvas.offscreenCanvas.height = canvas.height;
}
