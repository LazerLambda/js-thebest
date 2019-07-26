import { AnimatedObject } from "./AnimatedObject";
import { FieldObj } from "./FieldObj";

export class Fire {
  timeLeft = 20;
  context: CanvasRenderingContext2D;
  xPos: number;
  yPos: number;
  xSize: number;
  ySize: number;
  placedOn: FieldObj;
  animatedObject: AnimatedObject;

  constructor(
    context: CanvasRenderingContext2D,
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
    this.animatedObject = new AnimatedObject(this);
  }

  drawFire() {
    this.animatedObject.animateFire();
  }

  update() {
    if (this.timeLeft < 1) {
      this.placedOn.onFire = null;
    }
    --this.timeLeft;
  }
}

