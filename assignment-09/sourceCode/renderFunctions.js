//--------------------------------------------------------------------------------------------------------------------------------|Wall/Floor/Sky Rendering
function renderScene(rays) {
  renderFloor();
  renderSky();

  var heightOffset = player.verticalAngle * heightOffsetMult;

  for (var i=0; i<rays.length; i++) {
    var ray = rays[i];
    const dist = fixFishEye(ray.distance, ray.angle, player.angle);
    var jumpHeight = player.jumpHeight / dist;
    const wallHeight = Math.round( ((viewDist * cellSize) + jumpHeight) / dist );
    //const wallHeight = (fiveCellSize / dist) * 277; // I honestly have no idea what wall height equation to use.
    //const trueHeight = viewDist * cellSize * wallTypes[ray.wallType].heightMod;
    //const wallHeight = trueHeight / dist;

    var sx = 0;
    var sy = 0;
    var top = Math.round(center.y - ((wallHeight - heightOffset - jumpHeight) / 2));
    //var top = Math.round( ((screenH + heightOffset - wallHeight) / 2) + jumpHeight );
    //var top = Math.round( (screenH - wallHeight - wallTypes[ray.wallType].heightMod) / 2 );
    //var top = Math.round( (screenH - wallHeight * wallTypes[ray.wallType].heightMod) / 2 );

    // if (ray.wallType == 8 || ray.wallType == 7) {
    //   //var top = Math.round( (screenH - wallHeight) / 2 );
    //   var top = Math.round( (((screenH - wallHeight) - (trueHeight * 0.5)) / 2 ) );
    // } else {
    //   var top = Math.round( (screenH - wallHeight) / 2 );
    // }
    // TODO: Figure out variable wall heights.


    /*if (ray.vertical) {
      context.fillStyle = ray.right ? colors.wallDark : colors.wall;
    } else {
      context.fillStyle = ray.up ? colors.wallDark : colors.wall;
    }*/

    /* Walls:
    1 - blueBrick           - 000, 000
    1 - blueBrick_dark      - 064, 000
    2 - blueBrick_cell      - 000, 064
    2 - blueBrick_cell_dark - 064, 064
    3 - stone               - 000, 128
    3 - stone_dark          - 064, 128
    4 - wood                - 000, 192
    4 - wood_dark           - 064, 192
    */
    const textureX = Math.floor(ray.hit % 1 * textureRez);
    if (ray.vertical) {
      sx = ray.right ? textureRez + textureX : textureX;
    } else {
      sx = ray.up ? textureRez + textureX : textureX;
    }
    if (ray.wallType <= 4) {
      sy = textureRez * (ray.wallType - 1);
    } else {
      sy = wallTypes[ray.wallType].texture.offset.y;
    }

    context.drawImage(wallsCanvas, sx,sy, 1,textureRez, i*options.lineWidth,top, options.lineWidth,wallHeight);
    //context.drawImage(wallsImg, sx,sy, 1,textureRez, i*options.lineWidth,top, options.lineWidth,wallHeight);


    // I assume doing 2 gradients that cover half the screen each would be better for performance than drawing one for each ray?
    /*
    var floorGradient = context.createLinearGradient(0,center.y, 0,screenH);
    floorGradient.addColorStop(0, colors.floorTop);
    floorGradient.addColorStop(1, colors.floorBottom);
    context.fillStyle = floorGradient;
    context.fillRect(i*options.lineWidth, center.y + wallHeight/2, options.lineWidth, center.y - wallHeight/2);

    var ceilingGradient = context.createLinearGradient(0,0, 0,center.y);
    ceilingGradient.addColorStop(0, colors.ceilingTop);
    ceilingGradient.addColorStop(1, colors.ceilingBottom);
    context.fillStyle = ceilingGradient;
    context.fillRect(i*options.lineWidth,0, options.lineWidth,top);
    */
  }
}

// Z-Buffer version of renderScene
function renderScene_zBuffer(rays) {
  renderFloor();
  renderSky();

  var heightOffset = player.verticalAngle * heightOffsetMult;

  for (var i=0; i<rays.length; i++) {
    var ray = rays[i];
    const dist = fixFishEye(ray.distance, ray.angle, player.angle);
    var jumpHeight = player.jumpHeight / dist;
    const wallHeight = Math.round( ((viewDist * cellSize) + jumpHeight) / dist );
    var sx = 0;
    var sy = 0;
    var top = Math.round( center.y - ((wallHeight - heightOffset - jumpHeight) / 2) );


    /* Walls:
    1 - blueBrick           - 000, 000
    1 - blueBrick_dark      - 064, 000
    2 - blueBrick_cell      - 000, 064
    2 - blueBrick_cell_dark - 064, 064
    3 - stone               - 000, 128
    3 - stone_dark          - 064, 128
    4 - wood                - 000, 192
    4 - wood_dark           - 064, 192
    */
    const textureX = Math.floor(ray.hit % 1 * textureRez);
    if (ray.vertical) {
      sx = ray.right ? textureRez + textureX : textureX;
    } else {
      sx = ray.up ? textureRez + textureX : textureX;
    }
    if (ray.wallType <= 4) {
      sy = textureRez * (ray.wallType - 1);
    } else {
      sy = wallTypes[ray.wallType].texture.offset.y;
    }


    for (var row = top<0 ? 0 : top; row < top+wallHeight; row++) {
      if (row >= screenH) { break; }
      //var yPos = Math.floor( ((row - top) / wallHeight) * textureRez ) + (textureRez * (ray.wallType - 1));
      var yPos = Math.floor( ((row - top) / wallHeight) * textureRez ) + sy;
      var p = (wallsImgData.width * yPos * 4) + (sx * 4);

      /*zBuffer[row][i].distance = dist;
      zBuffer[row][i].r = wallsImgData.data[x];
      zBuffer[row][i].g = wallsImgData.data[x + 1];
      zBuffer[row][i].b = wallsImgData.data[x + 2];
      zBuffer[row][i].a = wallsImgData.data[x + 3];*/

      zBuffer[row][i] = {
        distance: dist,
        r: wallsImgData.data[p],
        g: wallsImgData.data[p + 1],
        b: wallsImgData.data[p + 2],
        a: wallsImgData.data[p + 3]
      };
      //if (row == 0) { console.log(row + " | " + i); }
    }
  }

  zBufferToImgData();
  //context.putImageData(screenImgData, 0,0);
  offscreenContext.putImageData(screenImgData, 0,0);
  context.drawImage(canvas.offscreenCanvas, 0,0, screenImgWidth,screenH, 0,0, screenW,screenH);
}


function renderFloor() {
  var halfHeightOffset = player.verticalAngle * halfHeightOffsetMult;

  var floorGradient = context.createLinearGradient(0,screenH, 0,-center.y + halfHeightOffset);
  floorGradient.addColorStop(0, colors.floorBottom);
  floorGradient.addColorStop(1, colors.floorTop);
  context.fillStyle = floorGradient;
  //context.fillRect(0,center.y + halfHeightOffset, screenW,center.y - halfHeightOffset);
  context.fillRect(0,screenH, screenW,-center.y + halfHeightOffset);
}


function renderSky() {
  var halfHeightOffset = player.verticalAngle * halfHeightOffsetMult;

  var ceilingGradient = context.createLinearGradient(0,0, 0,center.y + halfHeightOffset);
  ceilingGradient.addColorStop(0, colors.ceilingTop);
  ceilingGradient.addColorStop(1, colors.ceilingBottom);
  context.fillStyle = ceilingGradient;
  context.fillRect(0,0, screenW,center.y + halfHeightOffset);
}




//--------------------------------------------------------------------------------------------------------------------------------|Sprite Rendering
// TODO: Sprites still get added to visibleSprites if viewed through a wall at an angle.
// They do not get drawn, but it may be better for performance if this is prevented.
function renderSprites(rays) {
  sortSprites(visibleSprites);

  var heightOffset = player.verticalAngle * heightOffsetMult;

  for (var i=0; i<visibleSprites.length; i++) {
    var sprite = visibleSprites[i];
    var img = itemTypes[sprite.type].texture.img;

    var dx = sprite.dx;
    var dy = sprite.dy;
    var dist = sprite.distance;
    var spriteAngle = Math.atan2(dy, dx) - player.angle;

    // I honestly have no idea which size equation to use.
    var size = (viewDist * cellSize) / (Math.cos(spriteAngle) * dist);
    //var size = (viewDist / (Math.cos(spriteAngle) * dist)) * cellSize;
    //var size = (fiveCellSize / (Math.cos(spriteAngle) * dist)) * 277;
    size = size - (size % options.lineWidth); // Aligns sprite with ray lines.

    if (size <= 0) { continue; } // if size <= 0: go to next loop iteration

    var jumpHeight = player.jumpHeight / dist;


    // TODO: Sprite location doesn't look quite right at a distance when viewed at an angle or when rotating.
    // My best guess is that, unlike the walls, the fish eye effect isn't being corrected?
    var x = Math.tan(spriteAngle) * viewDist;
    var screenXPos = Math.round( center.x + x - size / 2 );
    screenXPos = screenXPos - (screenXPos % options.lineWidth); // Aligns sprite with ray lines.
    var screenXPosEnd = screenXPos + size;

    var top = Math.round( center.y - ((size - heightOffset - jumpHeight) / 2) );
    //var top = Math.round((screenH - size) / 2);
    //var top = Math.round( ((screenH + heightOffset - size) / 2) + jumpHeight );


    // Iterates over sprite x position drawing the sprite one strip at a time.
    //for (var strip = screenXPos; strip < screenXPosEnd; strip += options.lineWidth) {
    for (var strip = screenXPos<0 ? 0 : screenXPos; strip < screenXPosEnd; strip += options.lineWidth) {
      // Insures a strip isn't drawn if its off screen.
      // if (strip < 0) { continue; }
      if (strip >= screenW) { break; }

      // Insures a strip isn't drawn if the (wall) ray it aligns with is closer to the player.
      var rayI = strip / options.lineWidth;
      if (rays[rayI] && rays[rayI].distance < dist) { continue; }

      // Determines which column of the texture to draw.
      //const textureX = (256 * (strip - (-size / 2 + screenXPos)) * textureRez / size) / 256;
      const textureX = Math.floor( ((strip - screenXPos) / size) * textureRez );

      // Draws the strip
      context.drawImage(img, textureX,0, 1,textureRez, strip,top, options.lineWidth,size);
    }
  }

  for (var i=0; i<oldVisibleSprites.length; i++) {
    var sprite = oldVisibleSprites[i];
    if (visibleSprites.indexOf(sprite) < 0) {
      sprite.visible = false;
    }
  }
}

// Z-Buffer version of renderSprites
function renderSprites_zBuffer(rays) {
  sortSprites(visibleSprites);

  var heightOffset = player.verticalAngle * heightOffsetMult;

  for (var i=0; i<visibleSprites.length; i++) {
    var sprite = visibleSprites[i];
    // var img = itemTypes[sprite.type].texture.img;

    var dx = sprite.dx;
    var dy = sprite.dy;
    var dist = sprite.distance;
    var spriteAngle = Math.atan2(dy, dx) - player.angle;
    var size = (viewDist * cellSize) / (Math.cos(spriteAngle) * dist);
    size = size - (size % options.lineWidth); // Aligns sprite with ray lines.

    if (size <= 0) { continue; } // if size <= 0: go to next loop iteration

    var jumpHeight = player.jumpHeight / dist;
    var x = Math.tan(spriteAngle) * viewDist;
    var screenXPos = Math.round(center.x + x - size / 2);
    screenXPos = screenXPos - (screenXPos % options.lineWidth); // Aligns sprite with ray lines.

    var screenXPosEnd = screenXPos + size;
    var top = Math.round( center.y - ((size - heightOffset - jumpHeight) / 2) );


    // Iterates over sprite x position drawing the sprite one strip at a time.
    for (var strip = screenXPos<0 ? 0 : screenXPos; strip < screenXPosEnd; strip++) {
      // Insures a strip isn't drawn if its off screen.
      if (strip >= screenW / options.lineWidth) { break; }
      // Insures a strip isn't drawn if the (wall) ray it aligns with is closer to the player.
      var rayI = strip / options.lineWidth;
      if (rays[rayI].distance < dist) { continue; }

      // Determines which column of the texture to draw.
      var textureX = Math.floor( ((strip - screenXPos) / size) * textureRez );
      // Draws the strip
      //context.drawImage(img, textureX,0, 1,textureRez, strip,top, options.lineWidth,size);


      for (var row = top<0 ? 0 : top; row < top+size; row++) {
        if (row >= screenH) { break; }
        var yPos = Math.floor( ((row - top) / size) * textureRez );
        var p = (spriteImgData_armor.width * yPos * 4) + (textureX * 4);

        zBuffer[row][strip/options.lineWidth] = {
          distance: dist,
          // r: wallsImgData.data[p],
          // g: wallsImgData.data[p + 1],
          // b: wallsImgData.data[p + 2],
          // a: wallsImgData.data[p + 3]
          r: wallsImgData.data[255],
          g: wallsImgData.data[88],
          b: wallsImgData.data[44],
          a: wallsImgData.data[255]
        };
        //if (row == 0) { console.log(row + " | " + strip/options.lineWidth); }
      }
    }
  }

  for (var i=0; i<oldVisibleSprites.length; i++) {
    var sprite = oldVisibleSprites[i];
    if (visibleSprites.indexOf(sprite) < 0) {
      sprite.visible = false;
    }
  }
}


// Determines distance of each sprite, then orders them from furthest to closest.
function sortSprites(sprites) {
  for (var i=0; i<sprites.length; i++) {
    var sprite = sprites[i];
    //sprite.distance = distance((sprite.x+0.5)*cellSize, (sprite.y+0.5)*cellSize, player.x, player.y);
    var dx = (sprite.x + 0.5) * cellSize - player.x;
    var dy = (sprite.y + 0.5) * cellSize - player.y;
    //sprite.distance = Math.pow((sprite.x + 0.5) * cellSize - player.x, 2) + Math.pow((sprite.y + 0.5) * cellSize - player.y, 2);
    sprite.dx = dx;
    sprite.dy = dy;
    sprite.distance = Math.round(Math.sqrt(dx*dx + dy*dy));
  }
  sprites.sort((a, b) => { return b.distance - a.distance; });
  //sprites.forEach((e) => { console.log(e.x + " - " + e.y + " | " + e.distance); });
}


// Creates oldVisibleSprites then clears visibleSprites.
function clearSprites() {
  oldVisibleSprites = [];
  for (var i=0; i<visibleSprites.length; i++) {
    var sprite = visibleSprites[i];
    oldVisibleSprites[i] = sprite;
    sprite.visible = false;
  }
  visibleSprites = [];
}


// Creates spriteMap
function initSprites() {
  spriteMap = [];
  for (var y=0; y<mapHeight; y++) {
    spriteMap[y] = [];
  }

  for (var i=0; i<mapItems.length; i++) {
    var sprite = mapItems[i];
    var itemType = itemTypes[sprite.type];
    // var img = document.createElement('img');
    // img.src = itemType.img;
    // img.style.display = 'none';
    // img.style.position = 'absolute';

    sprite.visible = false;
    sprite.block = itemType.block;
    // sprite.img = img;

    spriteMap[sprite.y][sprite.x] = sprite;
    //document.body.appendChild(img);
  }
}




//--------------------------------------------------------------------------------------------------------------------------------|Enemy Rendering
function renderEnemies(rays) {
  sortEnemies(enemies);
  enemiesInCrosshair = [];

  var heightOffset = player.verticalAngle * heightOffsetMult;

  for (var i=0; i<enemies.length; i++) {
    var enemy = enemies[i];
    var img = enemyTypes[enemy.type].texture.img;
    // var dx = enemy.x * cellSize - player.x;
    // var dy = enemy.y * cellSize - player.y;
    var dx = enemy.dx;
    var dy = enemy.dy;

    enemy.angle = Math.atan2(dy, dx);
    //var angle = Math.atan2(dy, dx) - player.angle;
    var angle = enemy.angle - player.angle;
    if (angle < -Math.PI) { angle += twoPi }
    if (angle >= Math.PI) { angle -= twoPi }

    // if enemy is outside view range: continue to next enemy
    //if (angle > -halfPi && angle < halfPi) { continue; }
    if (angle < -fov*0.65 || angle > fov*0.65) { continue; }

    // var distSquared = dx*dx + dy*dy;
    // var dist = Math.sqrt(distSquared);
    // var distSquared = enemy.distanceSquared;
    var dist = enemy.distance;

    var size = (viewDist * cellSize) / (Math.cos(angle) * dist);
    //var size = (viewDist / (Math.cos(angle) * dist)) * cellSize;
    //var size = (fiveCellSize / (Math.cos(angle) * dist)) * 277;
    size = size - (size % options.lineWidth); // Aligns sprite with ray lines.

    if (size <= 0) { continue; }

    var jumpHeight = player.jumpHeight / dist;

    var x = Math.tan(angle) * viewDist;
    var screenXPos = Math.round( center.x + x - size / 2 );
    screenXPos = screenXPos - (screenXPos % options.lineWidth); // Aligns sprite with ray lines.
    var screenXPosEnd = screenXPos + size;

    var top = Math.round( center.y - ((size - heightOffset - jumpHeight) / 2) );
    //var top = Math.round((screenH - size) / 2);
    //var top = Math.round( (((screenH + heightOffset) - size) / 2) + jumpHeight );


    // Iterates over sprite x position drawing the sprite one strip at a time.
    for (var strip = screenXPos<0 ? 0 : screenXPos; strip < screenXPosEnd; strip += options.lineWidth) {
      // Insures a strip isn't drawn if its off screen.
      //if (strip < 0) { continue; }
      if (strip >= screenW) { break; }

      // Insures a strip isn't drawn if the (wall) ray it aligns with is closer to the player.
      var rayI = strip / options.lineWidth;
      if (rays[rayI] && rays[rayI].distance < dist) { continue; }

      // Determines which column of the texture to draw.
      const textureX = Math.floor( ((strip - screenXPos) / size) * textureRez ) + (enemy.state * textureRez);


      // Hitscan detection
      // It would probably be better to use cast a ray, rather than tie hit detection to the rendering,
      // but, this was all I could think of, and will need to do some research to figure out a better solution.
      //if (strip >= center.x-1 && strip <= center.x+1) {
      if (rayI >= middleRayL && rayI <= middleRayR) {
        //if ((enemy.state == 0 || enemy.state == 1) && textureX >= 21 && textureX <= 42) {
        if (textureX%textureRez >= 21 && textureX%textureRez <= 42) {
          if (!enemiesInCrosshair.includes(enemy)) { enemiesInCrosshair.push(enemy); }
          // It could be better to include a 'inCrosshair' property to the enemies instead?
          //console.log(enemy.distance);
        }
      }
      // TODO: Check different states for varying "hitbox" sizes.


      // Draws the strip
      context.drawImage(img, textureX,0, 1,textureRez, strip,top, options.lineWidth,size);
    }
  }
}


function sortEnemies(sprites) {
  for (var i=0; i<sprites.length; i++) {
    var sprite = sprites[i];
    var dx = sprite.x - player.x;
    var dy = sprite.y - player.y;
    sprite.dx = dx;
    sprite.dy = dy;
    //sprite.distanceSquared = dx*dx + dy*dy;
    sprite.distance = Math.round(Math.sqrt(dx*dx + dy*dy));
  }
  sprites.sort((a, b) => { return b.distance - a.distance; });
  //sprites.forEach((e) => { console.log(e.x + " - " + e.y + " | " + e.distance); });
}


var enemies = mapEnemies;
function initEnemies() {
  for (var i=0; i<mapEnemies.length; i++) {
    var enemy = mapEnemies[i];
    var type = enemyTypes[enemy.type];

    enemy.state = 0;
    enemy.rot = 0;
    enemy.dir = 0;
    //enemy.speed = 0;
    //enemy.moveSpeed = type.moveSpeed;
    enemy.rotSpeed = type.rotSpeed;
    enemy.totalStates = type.totalStates;

    //enemies.push(enemy);
  }
}




//--------------------------------------------------------------------------------------------------------------------------------|Combined Sprite Rendering
/*
function renderSpritesAndEnemies(rays) {
  sortSprites(visibleSprites);
  sortEnemies(enemies);
  var sprites = combineAndSortArrays(visibleSprites, enemies);

  for (var i=0; i<sprites.length; i++) {
    var sprite = sprites[i];
    //var img = sprite.img;
    //var img = itemTypes[sprite.type].texture.img;

    if (sprite instanceof EnemyBase) {
      var img = enemyTypes[sprite.type].texture.img;
    } else {
      var img = itemTypes[sprite.type].texture.img;
    }

    var dx = sprite.dx;
    var dy = sprite.dy;
    var dist = sprite.distance;

    var spriteAngle = Math.atan2(dy, dx) - player.angle;

    var size = (viewDist * cellSize) / (Math.cos(angle) * dist);
    //var size = Math.round((viewDist * cellSize) / (Math.cos(spriteAngle) * dist));
    //var size = (fiveCellSize / (Math.cos(spriteAngle) * dist)) * 277;
    size = size - (size % options.lineWidth); // Aligns sprite with ray lines.
    // Both size expressions here give very similar results at 1920 x 1080, but the first one seems to make sprites "float" at lower resolutions.

    if (size <= 0) { continue; } // if size <= 0: go to next loop iteration


    // TODO: Sprite location doesn't look quite right at a distance when viewed at an angle or when rotating.
    // My best guess is that, unlike the walls, the fish eye effect isn't being corrected.
    var x = Math.tan(spriteAngle) * viewDist;
    var screenXPos = Math.round(center.x + x - size / 2);
    screenXPos = screenXPos - (screenXPos % options.lineWidth); // Aligns sprite with ray lines.
    var screenXPosEnd = screenXPos + size;

    var top = Math.round((screenH - size) / 2);

    // Iterates over sprite x position drawing the sprite one strip at a time.
    for (var strip=screenXPos; strip < screenXPosEnd; strip += options.lineWidth) {
      // Insures a strip isn't drawn if its off screen.
      if (strip < 0) { continue; }
      if (strip >= screenW) { break; }

      // Insures a strip isn't drawn if the ray it aligns with is closer to the player.
      var rayI = strip / options.lineWidth;
      if (rays[rayI] && rays[rayI].distance < dist) { continue; }

      // Determines which column of the texture to draw.
      //const textureX = (256 * (strip - (-size / 2 + screenXPos)) * textureRez / size) / 256;
      //const textureX = Math.floor(((strip - screenXPos) / size) * textureRez);

      if (sprite instanceof EnemyBase) {
        var textureX = (Math.floor(((strip - screenXPos) / size) * textureRez) + (sprite.state * textureRez));
      } else {
        var textureX = Math.floor(((strip - screenXPos) / size) * textureRez);
      }

      // Draws the strip
      context.drawImage(img, textureX,0, 1,textureRez, strip,top, options.lineWidth,size);
    }
  }

  for (var i=0; i<oldVisibleSprites.length; i++) {
    var sprite = oldVisibleSprites[i];
    if (visibleSprites.indexOf(sprite) < 0) {
      sprite.visible = false;
    }
  }
}

function combineAndSortArrays(array1, array2) {
  newArray = array1.concat(array2);
  newArray.sort((a, b) => { return b.distance - a.distance; });
  return newArray;
}
*/




//--------------------------------------------------------------------------------------------------------------------------------|Minimap Rendering
function renderMinimap(posX=0, posY=0, scale=.5, rays) {
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
  mapEnemies.forEach((enemy) => {
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
// Despite the canvas being able to resize, it is not recommended.
// It creates visual artifacts in the form of vertical stripes,
// presumably due to the referenced image being upscaled and blurred.
// Seems to have a heavy negative impact on performance.
// TODO: fix this
// Update: decided to just disable this for now.
// window.addEventListener('resize', windowSizeChange);

function windowSizeChange() {
  screenW = window.innerWidth-1;
  screenH = window.innerHeight-4;
  screenW = Math.floor(screenW / options.lineWidth) * options.lineWidth;
  center = {x: screenW*.5, y: screenH*.5}

  canvas.setAttribute("width", screenW);
  canvas.setAttribute("height", screenH);

  overlayCanvas.setAttribute("width", screenW);
  overlayCanvas.setAttribute("height", screenH);

  canvas.offscreenCanvas.width = canvas.width / options.lineWidth;
  canvas.offscreenCanvas.height = canvas.height;

  rect = canvas.getBoundingClientRect();
  options.mobileControls = mobileAndTabletCheck();
}
