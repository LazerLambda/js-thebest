export class Field {
  x: number;
  y: number;

  SIZE_X: number;
  SIZE_Y: number;

  context: any;

  constructor(
    context: any,
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number
  ) {
    this.context = context;

    this.x = xPos;
    this.y = yPos;

    this.SIZE_X = xSize;
    this.SIZE_Y = ySize;
  }

  draw() {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillStyle = "yellow";
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }
}

export class Hallway extends Field {
  constructor(
    context: any,
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number
  ) {
    super(context, xPos, yPos, xSize, ySize);
  }
}
