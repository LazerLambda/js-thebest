import { Player } from "./Player";

export class Item {
  playerOn: Player;
  context: any;
  SIZE_X: number;
  SIZE_Y: number;

  x: number;
  y: number;

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
    this.playerOn = null;
  }

  draw() {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillStyle = "yellow";
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }

  update() {}
}

export class Wall extends Item {
  constructor(
    context: any,
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number
  ) {
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
  constructor(
    context: any,
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number
  ) {
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
  playerOnItem: Player;
  bombOnItem: Bomb = null;

  overlayingItem: Item[];

  constructor(
    context: any,
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number
  ) {
    super(context, xPos, yPos, xSize, ySize);
    this.overlayingItem = [];
  }

  draw() {
    if (this.playerOn === null) {
      this.context.fillStyle = "green";
    } else {
      this.context.fillStyle = "red";
      //this.context.fillStyle = "green";
    }

    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);

    if (this.bombOnItem !== null) {
      this.bombOnItem.update();
      this.bombOnItem.draw();
    }
  }
}

export class Bomb extends Item {
  timeLeftToDrop : number;
  timeLeft: number;
  explode: boolean = false;
  placedOn : Hallway;

  constructor(
    context: any,
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number,
    placed : Hallway
  ) {
    super(context, xPos, yPos, xSize, ySize);
    this.timeLeft = 100;
    this.timeLeftToDrop = 10;
    this.placedOn = placed
  }

  draw() {
    if (this.explode) {
      const x = this.x * this.SIZE_X;
      const y = this.y * this.SIZE_Y;
      this.context.fillStyle = "yellow";
      this.context.fillRect(x - 10, y - 10, this.SIZE_X + 10, this.SIZE_Y + 10);
    } else {
      const x = this.x * this.SIZE_X;
      const y = this.y * this.SIZE_Y;
      this.context.fillStyle = "black";
      this.context.fillRect(x + 10, y + 10, this.SIZE_X - 10, this.SIZE_Y - 10);
    }
  }

  update() {
    
    if(this.timeLeft < 0){
      this.explode = true;
      if(this.timeLeftToDrop < 0){
        this.placedOn.bombOnItem = null;
      } else {
        --this.timeLeftToDrop;
      }
    } else {
      --this.timeLeft;
    }
  }
}

export class Bricks extends Item {
  constructor(
    context: any,
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number
  ) {
    super(context, xPos, yPos, xSize, ySize);
  }

  draw() {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillStyle = "pink";
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }
}
