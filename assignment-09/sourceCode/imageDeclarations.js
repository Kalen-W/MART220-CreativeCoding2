//--------------------------------------------------------------------------------------------------------------------------------|texture Class
class Texture {
  constructor(relLink, width, height) {
    if (typeof width == 'undefined') {
      this.img = new Image(textureRez, textureRez);
    } else {
      this.img = new Image(width, height);
    }

    this.img.src = "./assets/textures/" + relLink;
    this.w = this.img.width;
    this.h = this.img.height;
  }
}

class AnimatedTexture {
  constructor(textureArray, changeFreq) {
    this.img = new Image(textureRez, textureRez);

    this.frames = textureArray;
    this.totalFrames = textureArray.length - 1;
    this.currentFrame = 0;
    this.changeFreq = changeFreq;
    this.img.src = this.frames[0].img.src;

    this.w = this.frames[0].img.width;
    this.h = this.frames[0].img.height;

    if (changeFreq == 125) {
      globalAnimationArray_125.push(this);
    } else {
      globalAnimationArray.push(this);
    }
  }

  updateFrame(frame) {
    if (frame) {
      this.currentFrame = frame;
    } else {
      if (this.currentFrame < this.totalFrames) {
        this.currentFrame++;
      } else {
        this.currentFrame = 0;
      }
    }

    this.img.src = this.frames[this.currentFrame].img.src;
  }
}

var globalAnimationArray_125 = [];
var globalAnimationArray = [];

/*
function updateAnimations(now) {
  globalAnimationArray.forEach((item, i) => {
    item.updateFrame(Math.floor( (now % item.changeFreq) / (item.changeFreq / item.totalFrames) ));
  });
}
*/

var animations = {
  update: function(now) {
    // Failed attempt to allow unique update frequencies, results were erratic & unsmooth animation.
    //globalAnimationArray.forEach((item, i) => {item.updateFrame(Math.floor((now%item.changeFreq)/(item.changeFreq/item.totalFrames)));});

    // Update textures 8 times per second.
    if (now >= this.nextUpdate._125) {
      globalAnimationArray_125.forEach((item, i) => {
        item.updateFrame();
      });
      this.nextUpdate._125 = now + 125;
    }
    // Update textures 1 time per second.
    if (now >= this.nextUpdate._1000) {
      globalAnimationArray_125.forEach((item, i) => {
        item.updateFrame();
      });
      this.nextUpdate._1000 = now + 1000;
    }
  },

  nextUpdate: {_125: 125, _1000: 1000},
};




// https://stackoverflow.com/a/68319943
// /** @param {string} source */
async function imageDataFromSource(source) {
  const image = Object.assign(new Image(), { src: source });
  await new Promise(resolve => image.addEventListener('load', () => resolve()));
  const ctx = Object.assign(document.createElement('canvas'), {
    width: image.width,
    height: image.height
  }).getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0);
  return ctx.getImageData(0, 0, image.width, image.height);
}


async function initImgData() {
  // wallsImgData = await imageDataFromSource('./assets/textures/wallsTest.png');
  // spriteImgData_armor = await imageDataFromSource('./assets/textures/environmentSprites/armor.png');
  // console.log(wallsImgData);
}


// https://stackoverflow.com/a/28405765

// const screenImgData = offscreenContext.createImageData(canvas.width / options.lineWidth, canvas.height);
// const screenImgWidth = screenImgData.width;
// const screenImgLength = screenImgData.data.length;

function zBufferToImgData() {
  // for (var i=0; i<screenImgLength; i+=4 * options.lineWidth) {
  for (var i=0; i<screenImgLength; i+=4) {
    var row = Math.floor((i / 4) / screenImgWidth);
    // var col = ((i / 4) % screenImgWidth) / options.lineWidth;
    var col = ((i / 4) % screenImgWidth);
    var pixel = zBuffer[row][col];

    if (typeof pixel == 'undefined') {
      console.error("invalid zBuffer reference while converting to image");
      console.error("screenImgData index: " + i + " | zBuffer row: " + row + " - zBuffer column: " + col);
      continue;
    }
    if (pixel.a == 0) {
      screenImgData.data[i + 3] = 0;
      continue;
    }

    screenImgData.data[i] = pixel.r;
    screenImgData.data[i + 1] = pixel.g;
    screenImgData.data[i + 2] = pixel.b;
    screenImgData.data[i + 3] = pixel.a;

  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Walls
const wallsImg = new Image(128, 256);
wallsImg.src = './assets/textures/walls.png';
//wallsImg.crossOrigin = "Anonymous";

const wallsCanvas = new OffscreenCanvas(wallsImg.width, wallsImg.height);
const wallsContext = wallsCanvas.getContext('2d');

// TODO: Now that I'm preloading this image in the index, I could probably remove the texturesLoaded checks.
var texturesLoaded = false;
wallsImg.onload = function() {
  //console.log("wallsImg loaded");
  texturesLoaded = true;
  wallsCanvas.width = wallsImg.width;
  wallsCanvas.height = wallsImg.height;
  wallsContext.drawImage(wallsImg, 0, 0);
  //var pixelData = wallsContext.getImageData(0, 0, 1, 1).data;
};

// Texture Atlas Wall Types
const wallTypes = [
  { /*           Placeholder - 0 == no wall, so this should never get referenced.           */ }, // 0
  {texture: {atlas: wallsImg, offset: {x: 000, y: 000}}, block: true,  heightMod: 1, opacity: 1}, // 1

  // TODO: Figure out why this isn't getting aligned properly.
  {texture: {atlas: wallsImg, offset: {x: 000, y: 077}}, block: true,  heightMod: 1, opacity: 1}, // 2

  {texture: {atlas: wallsImg, offset: {x: 000, y: 128}}, block: true,  heightMod: 1, opacity: 1}, // 3
  {texture: {atlas: wallsImg, offset: {x: 000, y: 192}}, block: true,  heightMod: 1, opacity: 1}, // 4
  {texture: {atlas: wallsImg, offset: {x: 000, y: 000}}, block: true,  heightMod: 1, opacity: 1}, // 5
  {texture: {atlas: wallsImg, offset: {x: 000, y: 000}}, block: true,  heightMod: 1, opacity: 1}, // 6
  {texture: {atlas: wallsImg, offset: {x: 000, y: 000}}, block: false, heightMod: 2, opacity: 1}, // 7
  {texture: {atlas: wallsImg, offset: {x: 000, y: 000}}, block: true,  heightMod: 3, opacity: 1}, // 8
  {texture: {atlas: wallsImg, offset: {x: 000, y: 000}}, block: true,  heightMod: 1, opacity: 0}, // 9
];
// TODO: Fully implement wallType referencing in render and ray casting functions.


//--------------------------------------------------------------------------------------------------------------------------------|Mana Orb Frames
const manaOrbAni = [
  new Texture("manaOrb/ManaOrb-Frame1.png", 16,16),
  new Texture("manaOrb/ManaOrb-Frame2.png", 16,16),
  new Texture("manaOrb/ManaOrb-Frame3.png", 16,16),
  new Texture("manaOrb/ManaOrb-Frame4.png", 16,16),
  new Texture("manaOrb/ManaOrb-Frame5.png", 16,16),
  new Texture("manaOrb/ManaOrb-Frame6.png", 16,16),
  new Texture("manaOrb/ManaOrb-Frame7.png", 16,16),
  new Texture("manaOrb/ManaOrb-Frame8.png", 16,16)
];


//--------------------------------------------------------------------------------------------------------------------------------|Item Sprites
/*
const itemTypes = [
  {img: new Image(), src: "./assets/textures/environmentSprites/tablechairs.png", block: true,  loot: false},   // 0
  {img: new Image(), src: "./assets/textures/environmentSprites/armor.png",       block: true,  loot: false},   // 1
  {img: new Image(), src: "./assets/textures/environmentSprites/plantgreen.png",  block: true,  loot: false},   // 2
  {img: new Image(), src: "./assets/textures/environmentSprites/lamp.png",        block: false, loot: false},   // 3
];

itemTypes.forEach((item, i) => {
  item.img.src = item.src;
});
*/

const itemTypes = [
  {texture: new Texture("environmentSprites/tablechairs.png"),  block: true,  loot: false}, // 0
  {texture: new Texture("environmentSprites/armor.png"),        block: true,  loot: false}, // 1
  {texture: new Texture("environmentSprites/plantgreen.png"),   block: true,  loot: false}, // 2
  {texture: new Texture("environmentSprites/lamp.png"),         block: false, loot: false}, // 3
  {texture: new AnimatedTexture(manaOrbAni, 125),               block: false, loot: true},  // 4
];


//--------------------------------------------------------------------------------------------------------------------------------|Item Sprites
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

    // if (lmbIsDown) {
      setTimeout(this.useAnimation.bind(this), 85);
    // } else {
    //   setTimeout(this.useAnimation.bind(this), 55);
    // }
  }

  render(ctx) {
    // var heldItemX = center.x - (textureRez * 0.5) * this.scaleFac;
    // var heldItemY = screenH - textureRez * this.scaleFac;
    var sx = textureRez * this.state;
    var sy = 0;

    ctx.drawImage(this.texture.img, sx,sy, textureRez,textureRez, this.x,this.y, textureRez*this.scaleFac,textureRez*this.scaleFac);
  }
}
// TODO: Move weapon class code to different file.
const heldItemTypes = [
  new Weapon("weaponSprites/wolfensteinWeapon-Pistol.png", 5, 'hitscan', 7, 1),  // Now initiated by start button.
  new Weapon("weaponSprites/wolfensteinWeapon-Pistol.png", 5, 'hitscan', 2, 0),  // Now initiated by start button.
];
