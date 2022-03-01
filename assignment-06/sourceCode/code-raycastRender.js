//--------------------------------------------------------------------------------------------------------------------------------|Initialization Functions
function init() {
  initSprites();

  //setInterval(logicLoop, logicTick);
  //setInterval(renderLoop, renderTick);
  logicLoop();
  renderLoop();
}
setTimeout(init, 4);


//--------------------------------------------------------------------------------------------------------------------------------|Game Loop Section
function logicLoop() {
  if (!pause) {
    var now = new Date().getTime();
    var timeDelta = now - lastLogicLoopTime;

    player.movement(timeDelta);

    var cycleDelay = logicTick;
    if (timeDelta > cycleDelay) {
      cycleDelay = Math.max(1, cycleDelay - (timeDelta - cycleDelay));
    }

    //mapChangeTest.func();

    //console.log(cycleDelay);
    setTimeout(logicLoop, cycleDelay);
    totalTicks++;
    lastLogicLoopTime = now;
  }
}

function renderLoop() {
  if (!pause) {
    clearScreen();
    clearOverlayScreen();
    clearSprites();

    const rays = getRays();

    renderSprites();
    renderScene(rays);
    if (options.minimap) { renderMinimap(0, 0, 0.5, rays); }

    animatedWalls();
    if (options.crosshair) {
      renderCrosshair();
    }
  } else {
    //context.drawImage(canvas.offscreenCanvas, 0, 0);
    clearOverlayScreen();
    renderPauseMenu();
  }

  var now = new Date().getTime();
  var timeDelta = now - lastRenderLoopTime;
  var cycleDelay = renderTick;
  if (timeDelta > cycleDelay) {
    cycleDelay = Math.max(1, cycleDelay - (timeDelta - cycleDelay));
  }

  setTimeout(renderLoop, cycleDelay);
  lastRenderLoopTime = now;

  if (totalTicks%10 == 0) {
    fps = 1000 / timeDelta;
  }
  /*fpsArray.push(fps);
  if (fpsArray.length > 500) {
    const average = (array) => array.reduce((a, b) => a + b) / array.length;
    console.log(average(fpsArray));
  }*/

  if (options.overlayElements) {
    renderOverlayElements();
    overlayContext.drawImage(manaOrbAni[Math.floor((totalTicks%25)/4)].img, 4,screenH-68, 64,64);
  }
}


function clearScreen() {
  context.fillStyle = "#222";
  context.fillRect(0, 0, screenW, screenH);
}

function clearOverlayScreen() {
  overlayContext.clearRect(0, 0, screenW, screenH);
  //overlayContext.fillRect(0, 0, screenW, screenH);
}

function pauseUpdate() {
  pause = !pause;
  if (pause) {
    //canvas.offscreenCanvas.getContext("2d").drawImage(canvas,0,0);
    document.exitPointerLock();
  } else {
    lastLogicLoopTime = new Date().getTime();
    logicLoop();
  }
  console.log("pause = " + pause);
}


//--------------------------------------------------------------------------------------------------------------------------------|Ray Function Section
function getVCollision(angle) {
  //const right = Math.abs(Math.floor((angle - Math.PI / 2) / Math.PI) % 2);
  const right = (angle > 1.5 * Math.PI || angle < 0.5 * Math.PI);

  // x & y
  const firstX = right
    ? Math.floor(player.x / cellSize) * cellSize + cellSize
    : Math.floor(player.x / cellSize) * cellSize;
  const firstY = player.y + (firstX - player.x) * Math.tan(angle);
  const slope = Math.sin(angle) / Math.cos(angle);

  // dx & dy
  const xA = right ? cellSize : -cellSize;
  //const yA = xA * Math.tan(angle);
  const yA = xA * slope;

  let wall;
  let nextX = firstX;
  let nextY = firstY;

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

    // Sprite rendering section
    const spriteMapCell = spriteMap[cellY][cellX]
    if (spriteMapCell && !spriteMapCell.visible) {
      spriteMapCell.visible = true;
      visibleSprites.push(spriteMapCell);
    } else if (spriteMapCell && spriteMapCell.visible) {
      spriteMapCell.visible = false;
      spriteMapCell.img.style.display = "none";
      //spriteMapCell.style['visibility'] = false;
      //const spriteIndex = visibleSprites.indexOf(spriteMapCell);
      //visibleSprites.splice(spriteIndex, 1);
    }

    wall = currentMap[cellY][cellX];
    if (!wall) { // if this cell is a 0 (empty)
      nextX += xA;
      nextY += yA;
    } else {}
  }

  const dist = distance(player.x, player.y, nextX, nextY);

  return {
    angle,
    distance: dist,
    vertical: true,
    right: right,
    up: false,
    wallType: wall,
    //hit: firstY
    hit: nextY / cellSize
    //hit: player.y + Math.sin(angle) * dist
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

    // Sprite rendering section
    const spriteMapCell = spriteMap[cellY][cellX]
    if (spriteMapCell && !spriteMapCell.visible) {
      spriteMapCell.visible = true;
      visibleSprites.push(spriteMapCell);
    } else if (spriteMapCell && spriteMapCell.visible) {
      spriteMapCell.visible = false;
      spriteMapCell.img.style.display = "none";
      //spriteMapCell.style['visibility'] = false;
      //const spriteIndex = visibleSprites.indexOf(spriteMapCell);
      //visibleSprites.splice(spriteIndex, 1);
    }

    wall = currentMap[cellY][cellX];
    if (!wall) { // if this cell is a 0 (empty)
      nextX += xA;
      nextY += yA;
    }
  }

  const dist = distance(player.x, player.y, nextX, nextY);

  return {
    angle,
    distance: dist,
    vertical: false,
    right: false,
    up: up,
    wallType: wall,
    //hit: firstX
    hit: nextX / cellSize
    //hit: player.x + Math.cos(angle) * dist
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
  const numOfRays = Math.floor(screenW / options.lineWidth);
  const angleStep = fov / numOfRays;

  return Array.from({ length: numOfRays }, (_, i) => {
    //const rayScreenPos = initialAngle + i * angleStep;
    //const rayViewDist = Math.sqrt(rayScreenPos*rayScreenPos + viewDist*viewDist);

    const angle = initialAngle + (i * angleStep);
    //const angle = Math.asin(rayScreenPos / rayViewDist);
    const ray = castRay(angle, i);
    return ray;
  });
}


//--------------------------------------------------------------------------------------------------------------------------------|Render Functions
function renderScene(rays) {
  // I assume just doing two gradients that cover half the screen each would be better for performance that drawing one for each ray.
  // But, that's just an assumption, I have no idea if it actually makes any difference.
  var floorGradient = context.createLinearGradient(0,screenH / 2, 0,screenH);
  floorGradient.addColorStop(0, colors.floorTop);
  floorGradient.addColorStop(1, colors.floorBottom);
  context.fillStyle = floorGradient;
  context.fillRect(0,screenH/2, screenW,screenH/2);

  var ceilingGradient = context.createLinearGradient(0,0, 0,screenH / 2);
  ceilingGradient.addColorStop(0, colors.ceilingTop);
  ceilingGradient.addColorStop(1, colors.ceilingBottom);
  context.fillStyle = ceilingGradient;
  context.fillRect(0,0, screenW,screenH/2);

  rays.forEach((ray, i) => {
    const dist = fixFishEye(ray.distance, ray.angle, player.angle);
    const wallHeight = ((cellSize * 5) / dist) * 277; // TODO: This needs to be lower for smaller resolutions to prevent 'squished' look.
    //const wallHeight = ((cellSize * 8) / dist) * 180;
    var sx = 0;
    var sy = 0;
    //var top = screenH / 2 - wallHeight / 2;
    var top = Math.round(screenH - wallHeight) / 2;

    /*if (ray.vertical) {
      context.fillStyle = ray.right ? colors.wallDark : colors.wall;
    } else {
      context.fillStyle = ray.up ? colors.wallDark : colors.wall;
    }*/

    /* Walls:
    // 1 - blueBrick            - 000, 000
    // 1 - blueBrick_dark       - 064, 000
    // 2 - blueBrick_cell       - 000, 064
    // 2 - blueBrick_cell_dark  - 064, 064
    // 3 - stone                - 000, 128
    // 3 - stone_dark           - 064, 128
    // 4 - wood_cell            - 000, 192
    // 4 - wood_cell_dark       - 064, 192
    */
    const textureX = Math.floor(ray.hit%1*textureRez);
    if (ray.vertical) {
      sx = ray.right ? textureRez + textureX : textureX;
    } else {
      sx = ray.up ? textureRez + textureX : textureX;
    }
    sy = textureRez * (ray.wallType - 1);

    if (!texturesLoaded) {
      context.fillStyle = colors.wallDefault;
      context.fillRect(i*options.lineWidth, top, options.lineWidth, wallHeight);
    } else {
      context.drawImage(wallsCanvas, sx,sy, 1,textureRez, i*options.lineWidth,top, options.lineWidth,wallHeight);
    }

    /*var floorGradient = context.createLinearGradient(0,screenH / 2, 0,screenH);
    floorGradient.addColorStop(0, colors.floorTop);
    floorGradient.addColorStop(1, colors.floorBottom);
    context.fillStyle = floorGradient;
    context.fillRect(i*options.lineWidth, screenH/2 + wallHeight/2, options.lineWidth, screenH/2 - wallHeight/2);

    var ceilingGradient = context.createLinearGradient(0,0, 0,screenH / 2);
    ceilingGradient.addColorStop(0, colors.ceilingTop);
    ceilingGradient.addColorStop(1, colors.ceilingBottom);
    context.fillStyle = ceilingGradient;
    context.fillRect(i*options.lineWidth,0, options.lineWidth,top);*/
  });
}

/*function renderSprites() {
  spriteArray.forEach((item, i) => {
    const dist = distance(player.x,player.y, item.x,item.y);
    const angle = getAngle(player.x,player.y, item.x,item.y);
  });

  enemyArray.forEach((item, i) => {
    const dist = distance(player.x,player.y, item.x,item.y);
    const angle = getAngle(player.x,player.y, item.x,item.y);
  });
}*/

function renderSprites() {
  for (var i=0; i<visibleSprites.length; i++) {
    var sprite = visibleSprites[i];
    var img = sprite.img;
    img.style.display = "block";
    img.style['image-rendering'] = 'pixelated';

    var dx = (sprite.x + 0.5) * cellSize - player.x;
    var dy = (sprite.y + 0.5) * cellSize - player.y;
    //var dist = Math.sqrt(dx*dx + dy*dy);
    var dist = distance((sprite.x+0.5)*cellSize, (sprite.y+0.5)*cellSize, player.x, player.y);

    var spriteAngle = Math.atan2(dy, dx) - player.angle;
    var size = (viewDist * cellSize) / (Math.cos(spriteAngle) * dist);
    //var size = ((cellSize * 5) / (Math.cos(spriteAngle) * dist)) * 277;
    //console.log(viewDist / (Math.cos(spriteAngle) * dist) + " | " + ((cellSize * 5) / (Math.cos(spriteAngle) * dist)) * 277);
    //console.log( (((cellSize * 5) / (Math.cos(spriteAngle) * dist)) * 277) / ((viewDist * cellSize) / (Math.cos(spriteAngle) * dist)) );

    if (size <= 0) continue;

    var x = Math.tan(spriteAngle) * viewDist;

    img.style.left = (center.x + x - size/2) + "px";
    img.style.top = ((screenH - size)/2) + "px";

    var dbx = sprite.x - player.x;
    var dby = sprite.y - player.y;

    img.style.width = size + "px";
    img.style.height = size + "px";

    var blockDist = dbx*dbx + dby*dby;
    //img.style.zIndex = -Math.floor(blockDist*1000);
    img.style.zIndex = Math.floor(blockDist);
  }

  for (var i=0; i<oldVisibleSprites; i++) {
    var sprite = oldVisibleSprites[i];
    console.log(visibleSprites.indexOf(sprite));
    if (visibleSprites.indexOf(sprite) < 0) {
      console.log("sprite test");
      sprite.visible = false;
      //sprite.style['visibility'] = false;
      sprite.img.style.display = "none";
    }
  }
}

function clearSprites() {
  //console.log(visibleSprites);
  oldVisibleSprites = [];
  for (var i=0; i<visibleSprites.length; i++) {
    var sprite = visibleSprites[i];
    oldVisibleSprites[i] = sprite;
    sprite.visible = false;
  }
  visibleSprites = [];
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

  // Displays enemy locations
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
  center = {x: screenW*.5, y: screenH*.5}
  screenW = Math.floor(screenW / options.lineWidth) * options.lineWidth;

  canvas.setAttribute("width", screenW);
  canvas.setAttribute("height", screenH);

  overlayCanvas.setAttribute("width", screenW);
  overlayCanvas.setAttribute("height", screenH);

  //canvas.offscreenCanvas.width = canvas.width;
  //canvas.offscreenCanvas.height = canvas.height;

  options.mobileControls = mobileAndTabletCheck();
}
