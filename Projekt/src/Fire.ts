import { Item } from "./Item";

export class Fire {
  timeLeft = 20;
  context: any;
  xPos: number;
  yPos: number;
  xSize: number;
  ySize: number;
  placedOn: Item;
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
  }

  drawFire() {
    const x = this.xPos * this.xSize;
    const y = this.yPos * this.ySize;
    // var im = new Image(this.xSize, this.ySize);
    // im.src = "tilesets/tileset1/fire.jpg";
    // this.context.drawImage(im, x, y, this.xSize, this.ySize);
    this.context.fillStyle = "orange";
    this.context.fillRect(x, y, this.xSize, this.ySize);
  }

  update() {
    if (this.timeLeft < 1) {
      this.placedOn.onFire = null;
    }
    --this.timeLeft;
  }
}
