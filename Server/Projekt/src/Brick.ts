import { Hallway, FieldObj } from "./FieldObj";

export class Brick {
  breakBricks: boolean = false;
  placedOn: Hallway;

  context: CanvasRenderingContext2D;
  SIZE_X: number;
  SIZE_Y: number;

  x: number;
  y: number;

  constructor(
    context: CanvasRenderingContext2D,
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number,
    placed: Hallway
  ) {
    this.context = context;

    this.x = xPos;
    this.y = yPos;

    this.SIZE_X = xSize;
    this.SIZE_Y = ySize;
    this.placedOn = placed;
  }

  drawBrick() {
    if (this.breakBricks) {
      const x = this.x * this.SIZE_X;
      const y = this.y * this.SIZE_Y;
      this.context.fillStyle = "yellow";
      this.context.fillRect(x - 10, y - 10, this.SIZE_X + 10, this.SIZE_Y + 10);
      this.placedOn.setOnFire();
      this.placedOn.brickOnItem = null;
    } else {
      const x = this.x * this.SIZE_X;
      const y = this.y * this.SIZE_Y;
      var im = new Image(this.SIZE_X, this.SIZE_Y);
      im.src = "tilesets/tileset1/brick.jpg";
      this.context.drawImage(im, x, y, this.SIZE_X, this.SIZE_Y);
    }
  }

  setOnFire() {
    this.breakBricks = true;
  }
}
