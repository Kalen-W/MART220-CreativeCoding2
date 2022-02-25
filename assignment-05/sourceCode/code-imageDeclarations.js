//--------------------------------------------------------------------------------------------------------------------------------|texture Class
class texture {
  constructor(relLink, width, height) {
    this.img = new Image(width, height);
    this.img.src = "./assets/textures/" + relLink;
    this.w = this.img.width;
    this.h = this.img.height;
  }
}


//--------------------------------------------------------------------------------------------------------------------------------|Walls
const wallsImg = new Image(128, 256);
wallsImg.src = "./assets/textures/walls.png";
wallsImg.crossOrigin = "Anonymous";

const wallsCanvas = new OffscreenCanvas(wallsImg.width, wallsImg.height);
const wallsContext = wallsCanvas.getContext('2d');

var texturesLoaded = false;
wallsImg.onload = function() {
  console.log("wallsImg loaded");
  texturesLoaded = true;
  wallsCanvas.width = wallsImg.width;
  wallsCanvas.height = wallsImg.height;
  wallsContext.drawImage(wallsImg, 0, 0);
  //var pixelData = wallsContext.getImageData(0, 0, 1, 1).data;
};


//--------------------------------------------------------------------------------------------------------------------------------|Mana Orb Frames
const manaOrbAni = [
  new texture("manaOrb/ManaOrb-Frame1.png", 16,16),
  new texture("manaOrb/ManaOrb-Frame2.png", 16,16),
  new texture("manaOrb/ManaOrb-Frame3.png", 16,16),
  new texture("manaOrb/ManaOrb-Frame4.png", 16,16),
  new texture("manaOrb/ManaOrb-Frame5.png", 16,16),
  new texture("manaOrb/ManaOrb-Frame6.png", 16,16),
  new texture("manaOrb/ManaOrb-Frame7.png", 16,16),
  new texture("manaOrb/ManaOrb-Frame8.png", 16,16)
];
