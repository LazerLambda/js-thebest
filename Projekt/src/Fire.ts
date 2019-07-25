import { FieldObj } from "./FieldObj";

let imgFire: any = new Image();
imgFire.src = "animations/fire.png";
imgFire.onload = function() {
  init();
};

function init() {
  this.startAnimating(200);
}

export class Fire {
  timeLeft = 20;
  context: any;
  xPos: number;
  yPos: number;
  xSize: number;
  ySize: number;
  placedOn: FieldObj;

  spriteWidthFire: number = 500;
  spriteHeightFire: number = 500;
  cycleLoopFire = [0, 1, 2, 3];
  currentLoopIndex: number = 0;
  frameCount: number = 0;

  constructor(
    context: any,
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number,
    placedOn: FieldObj
  ) {
    this.context = context;
    this.xPos = xPos;
    this.yPos = yPos;
    this.xSize = xSize;
    this.ySize = ySize;
    this.placedOn = placedOn;
  }

  drawFire() {
    const x = this.xPos * this.xSize;
    const y = this.yPos * this.ySize;

    let time = 4; // Zeit für Bildwechsel in der Animation
    if (this.frameCount <= 4 * time) {
      if (this.frameCount % time === 0) {
        this.currentLoopIndex++;
        if (this.currentLoopIndex >= this.cycleLoopFire.length) {
          this.currentLoopIndex = 0;
        }
      }
    } else {
      this.frameCount = 0;
    }
    ++this.frameCount;

    this.context.drawImage(
      imgFire,
      0,
      this.cycleLoopFire[this.currentLoopIndex] * this.spriteHeightFire,
      this.spriteWidthFire,
      this.spriteHeightFire,
      x,
      y,
      this.xSize,
      this.ySize
    );
  }

  update() {
    if (this.timeLeft < 1) {
      this.placedOn.onFire = null;
    }
    --this.timeLeft;
  }
}

