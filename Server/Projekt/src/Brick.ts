import { Hallway, FieldObj } from "./FieldObj";

export class Brick {
  //state
  breakBricks: boolean = false;
  SIZE_X: number;
  SIZE_Y: number;
  context: CanvasRenderingContext2D;
  breakAnimiation: number = 10;

  // properties
  placedOn: Hallway;

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
      if (this.breakAnimiation > 0) {
        const x = this.x * this.SIZE_X;
        const y = this.y * this.SIZE_Y;
        var im = new Image(this.SIZE_X, this.SIZE_Y);
        im.src = "images/breakBrick.jpg";
        this.context.drawImage(im, x, y, this.SIZE_X, this.SIZE_Y);
        this.placedOn.setOnFire();
        --this.breakAnimiation;
      } else {
        this.placedOn.brickOnItem = null;
      }
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
