export class Item {
  context: any;
  SIZE_X: number;
  SIZE_Y: number;

  x: number;
  y: number;

  constructor(context: any, xPos: number, yPos: number) {
    this.context = context;

    this.x = xPos;
    this.y = yPos;

    this.SIZE_X = 50;
    this.SIZE_Y = 50;
  }

  draw() {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillStyle = "yellow";
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }
}

export class Wall extends Item {
  constructor(context: any, xPos: number, yPos: number) {
    super(context, xPos, yPos);
  }

  draw() {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillStyle = "grey";
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }
}

export class Hole extends Item {
  constructor(context: any, xPos: number, yPos: number) {
    super(context, xPos, yPos);
  }

  draw() {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillStyle = "black";
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }
}

export class Hallway extends Item {
  constructor(context: any, xPos: number, yPos: number) {
    super(context, xPos, yPos);
  }

  draw() {
    this.context.fillStyle = "green";
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }
}
