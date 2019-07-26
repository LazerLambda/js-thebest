import { Item } from "./Item";
import { AnimatedObject } from "./AnimatedObject";

export class Fire {
  timeLeft = 20;
  context: any;
  xPos: number;
  yPos: number;
  xSize: number;
  ySize: number;
  placedOn: Item;
  animatedObject: AnimatedObject;

  constructor(
    context: any,
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number,
    placedOn: Item
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

