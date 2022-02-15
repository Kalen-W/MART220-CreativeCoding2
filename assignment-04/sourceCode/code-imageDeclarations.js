class texture {
  constructor(relLink, width, height) {
    this.img = new Image(width, height);
    this.img.src = "./assets/textures/" + relLink;
  }
}

//--------------------------------------------------------------------------------------------------------------------------------|Mana Orb Frames
/*
const manaOrb1 = new Image(16, 16);
manaOrb1.src = "./assets/textures/manaOrb/ManaOrb-Frame1.png";
const manaOrb1 = new texture("./assets/textures/manaOrb/ManaOrb-Frame1.png", 16,16);
const manaOrb2 = new texture("./assets/textures/manaOrb/ManaOrb-Frame2.png", 16,16);
const manaOrb3 = new texture("./assets/textures/manaOrb/ManaOrb-Frame3.png", 16,16);
const manaOrb4 = new texture("./assets/textures/manaOrb/ManaOrb-Frame4.png", 16,16);
const manaOrb5 = new texture("./assets/textures/manaOrb/ManaOrb-Frame5.png", 16,16);
const manaOrb6 = new texture("./assets/textures/manaOrb/ManaOrb-Frame6.png", 16,16);
const manaOrb7 = new texture("./assets/textures/manaOrb/ManaOrb-Frame7.png", 16,16);
const manaOrb8 = new texture("./assets/textures/manaOrb/ManaOrb-Frame8.png", 16,16);
const manaOrbAni = [manaOrb1, manaOrb2, manaOrb3, manaOrb4, manaOrb5, manaOrb6, manaOrb7, manaOrb8];
*/

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



const wallsImg = new Image(128, 256);
wallsImg.src = "./assets/textures/walls.png";

//var canvas2 = document.createElement('canvas');
var canvas2 = new OffscreenCanvas(wallsImg.width, wallsImg.height);
var context2 = canvas2.getContext('2d');

wallsImg.onload = function() {

  canvas2.width = wallsImg.width;
  canvas2.height = wallsImg.height;
  context2.drawImage(wallsImg, 0, 0);
  var wall1 = context2.getImageData(0, 0, wallsImg.width, wallsImg.height);

};


//var pixelData = wallsContext.getImageData(0, 0, 1, 1).data;
