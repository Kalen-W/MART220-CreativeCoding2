//--------------------------------------------------------------------------------------------------------------------------------|Initialization Functions
function init() {
  if (document.readyState !== 'complete') {
    setTimeout(init, 5);
    return;
  }
  initSprites();
  initEnemies();

  createLootArray();

  if (options.mapEditorEnabled) {
    localStorage.setItem('mapEditorReturn', JSON.stringify(
      { visible: false, mapData: currentMap }
    ));

    var mapEditorFrame = document.createElement('iframe');
    mapEditorFrame.src = './mapEditor/mapEditor.html';
    mapEditorFrame.id = 'mapEditor-frame';
    document.getElementById('mapEditor-container').appendChild(mapEditorFrame);
  }

  logicLoop();
  renderLoop(window.performance.now());
}
setTimeout(init, 5);


//--------------------------------------------------------------------------------------------------------------------------------|Game Loop Section
function logicLoop() {
  if (!pause) {
    var now = window.performance.now();
    var timeDelta = now - lastLogicLoopTime;

    player.movement(timeDelta);
    enemyUpdates(timeDelta, now);

    itemPickupCheck();
    if (lmbIsDown) { player.useHeldItem(); }

    var cycleDelay = logicTick;
    if (timeDelta > cycleDelay) {
      cycleDelay = Math.max(1, cycleDelay - (timeDelta - cycleDelay));
    }

    //mapChangeTest.func();

    //console.log(cycleDelay);
    setTimeout(logicLoop, cycleDelay);
    //totalLogicTicks++;
    lastLogicLoopTime = now;
  }
}

function renderLoop(timeStamp) {
  if (!pause) {
    clearScreen();
    clearOverlayScreen();
    clearSprites();

    const rays = getRays();

    renderScene(rays);
    renderSprites(rays);
    renderEnemies(rays);

    if (options.minimap) { renderMinimap(0, 0, 0.5, rays); }
    //console.log(visibleSprites);

    //animatedWalls();
    if (options.crosshair) { renderCrosshair(); }
  } else {
    //context.drawImage(canvas.offscreenCanvas, 0, 0);
    clearOverlayScreen();
    renderPauseMenu();
  }

  //var now = window.performance.now();
  var now = timeStamp;
  var timeDelta = now - lastRenderLoopTime;
  var cycleDelay = renderTick;
  if (timeDelta > cycleDelay) {
    cycleDelay = Math.max(1, cycleDelay - (timeDelta - cycleDelay));
  }


  if (!pause) {
    animatedWalls(now);
    animations.update(now);
  }


  //setTimeout(renderLoop, cycleDelay);
  window.requestAnimationFrame(renderLoop);
  //totalRenderTicks++;
  lastRenderLoopTime = now;


  if (totalLogicTicks%10 == 0) { fps = 1000 / timeDelta; }
  /*fpsArray.push(fps); // displays running average of fps
  if (fpsArray.length > 500) {
    const average = (array) => array.reduce((a, b) => a + b) / array.length;
    console.log(average(fpsArray));
  }*/

  if (options.overlayElements) {
    renderOverlayElements();
    //overlayContext.drawImage(manaOrbAni[Math.floor((totalLogicTicks%25)/4)].img, 4,screenH-68, 64,64);
    //overlayContext.drawImage(manaOrbAni[Math.floor((now % 1000) / 125)].img, -96,screenH-256, 256,256);
  }

  if (mapEditorVisible) { // detects if map editor should be closed
    if (!JSON.parse(localStorage.getItem('mapEditorReturn')).visible) {
      toggleMapEditor();
    }
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

function pauseUpdate(override) {
  if (typeof override == 'boolean') {
    pause = override;
  } else {
    pause = !pause;
  }

  if (pause) {
    //canvas.offscreenCanvas.getContext("2d").drawImage(canvas,0,0);
    document.exitPointerLock();
  } else {
    if (!options.mobileControls) {
      overlayCanvas.requestPointerLock();
    }
    lastLogicLoopTime = window.performance.now();
    logicLoop();
  }
  console.log("pause = " + pause);
}


//--------------------------------------------------------------------------------------------------------------------------------|Ray Casting Section
function getVCollision(angle) {
  //const right = Math.abs(Math.floor((angle - halfPi) / Math.PI) % 2);
  const right = (angle > 1.5 * Math.PI || angle < halfPi);

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

  while (!wall || wallTypes[wall].opacity < 1) {
    const cellX = right
     ? Math.floor(nextX / cellSize)
     : Math.floor(nextX / cellSize) - 1;
    const cellY = Math.floor(nextY / cellSize);
    // const cellX = right
    //   ? Math.ceil(player.x)
    //   : Math.floor(player.x);
    // const cellY = player.y + (cellX - player.x) * (Math.sin(angle) / Math.cos(angle));

    // if this point is outside of map bounds: do nothing
    if (outOfMapBounds(cellX, cellY)) { break; }
    // else: continue

    // Sprite rendering section
    const spriteMapCell = spriteMap[cellY][cellX];
    if (spriteMapCell && !spriteMapCell.visible) {
      spriteMapCell.visible = true;
      visibleSprites.push(spriteMapCell);
    }

    wall = currentMap[cellY][cellX];
    if (!wall || wall == 9) { // if this cell is a 0 (empty)
      nextX += xA;
      nextY += yA;
    } //else {}
  }

  const dist = distance(player.x, player.y, nextX, nextY);

  return {
    angle: angle,
    distance: dist,
    vertical: true,
    right: right,
    up: false,
    wallType: wall,
    hit: nextY / cellSize
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

  while (!wall || wallTypes[wall].opacity < 1) {
    const cellX = Math.floor(nextX / cellSize);
    const cellY = up
      ? Math.floor(nextY / cellSize) - 1
      : Math.floor(nextY / cellSize);

    // if this point is outside of map bounds: do nothing
    if (outOfMapBounds(cellX, cellY)) { break; }
    // else: continue

    // Sprite rendering section
    const spriteMapCell = spriteMap[cellY][cellX];
    if (spriteMapCell && !spriteMapCell.visible) {
      spriteMapCell.visible = true;
      visibleSprites.push(spriteMapCell);
    }

    wall = currentMap[cellY][cellX];
    if (!wall || wall == 9) { // if this cell is a 0 (empty)
      nextX += xA;
      nextY += yA;
    }
  }

  const dist = distance(player.x, player.y, nextX, nextY);

  return {
    angle: angle,
    distance: dist,
    vertical: false,
    right: false,
    up: up,
    wallType: wall,
    hit: nextX / cellSize
  };
}


function castRay(angle, rayId) {
  angle = roundRadian(angle);
  const vCollision = getVCollision(angle);
  const hCollision = getHCollision(angle);

  return hCollision.distance >= vCollision.distance ? vCollision : hCollision;
}

function getRays() {
  const initialAngle = player.angle - halfFov;

  //console.log(castRay(player.angle));

  // For now, since screen width and fov cannot be changed in-game, I moved these to be declared in 'code-basicVariablesAndFunctions.js'.
  // This is just to avoid recalculating it every frame.
  // const numOfRays = Math.floor(screenW / options.lineWidth);
  // const angleStep = fov / numOfRays;

  return Array.from({ length: numOfRays }, (_, i) => {
    const angle = initialAngle + (i * angleStep);
    const ray = castRay(angle, i);
    return ray;
  });
}
