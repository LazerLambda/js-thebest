export class Item {
  context: any;
  SIZE_X: number;
  SIZE_Y: number;

  x: number;
  y: number;

  constructor(context: any, xPos: number, yPos: number, xSize : number, ySize : number) {
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

export class Wall extends Item {
  constructor(context: any, xPos: number, yPos: number, xSize : number, ySize : number) {
    super(context, xPos, yPos, xSize, ySize);
  }

  draw() {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillStyle = "grey";
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }
}

export class Hole extends Item {
  constructor(context: any, xPos: number, yPos: number, xSize : number, ySize : number) {
    super(context, xPos, yPos, xSize, ySize);
  }

  draw() {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillStyle = "black";
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }
}

export class Hallway extends Item {

  overlayingItem : Item;

  constructor(context: any, xPos: number, yPos: number, xSize : number, ySize : number) {
    super(context, xPos, yPos, xSize, ySize);
  }

  draw() {
    this.context.fillStyle = "green";
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }
}
