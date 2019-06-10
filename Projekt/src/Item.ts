import { Player } from "./Player";

export class Item {
  playerOn: Player = null;
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
  }

  draw() {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillStyle = "yellow";
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }

  update() {}
  setOnFire() {}
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
  bombOnItem: Bomb = null;
  onFire: Fire = null;
  brickOnItem : Bricks = null;

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

  update(){
    if(this.onFire !== null && this.playerOn !== null){
      this.playerOn.alive = false;
    }
  }

  draw() {
    if (this.playerOn === null) {
      this.context.fillStyle = "green";
    } else {
      this.context.fillStyle = "red";
    }

    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);

    if (this.bombOnItem !== null) {
      this.bombOnItem.update();
      this.bombOnItem.draw();
    }

    if (this.onFire !== null) {
      this.onFire.update();
      this.onFire.draw();
    }

    if (this.brickOnItem !== null){
      this.brickOnItem.draw();
    }
  }

  setOnFire() {
    if(this.playerOn !== null){
      this.playerOn.alive = false;
    }
    if(this.brickOnItem !== null){
      this.brickOnItem.setOnFire();
    } else {
      this.onFire = new Fire(
        this.context,
        this.x,
        this.y,
        this.SIZE_X,
        this.SIZE_Y,
        this
      );
    }
  }
}

export class Bomb extends Item {
  timeLeftToDrop: number;
  timeLeft: number;
  explode: boolean = false;
  placedOn: Hallway;

  constructor(
    context: any,
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number,
    placed: Hallway
  ) {
    super(context, xPos, yPos, xSize, ySize);
    this.timeLeft = 100;
    this.timeLeftToDrop = 10;
    this.placedOn = placed;
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
    if (this.timeLeft < 0) {
      this.explode = true;
      if (this.timeLeftToDrop < 0) {
        this.placedOn.bombOnItem = null;
        this.placedOn.onFire = new Fire(
          this.context,
          this.x,
          this.y,
          this.SIZE_X,
          this.SIZE_Y,
          this.placedOn
        );
      } else {
        --this.timeLeftToDrop;
      }
    } else {
      --this.timeLeft;
    }
  }
}

export class Bricks extends Item {
  breakBricks: boolean = false;
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
    this.placedOn = placed;
  }

  draw() {
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
      this.context.fillStyle = "pink";
      this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
    }
  }

  setOnFire() {this.breakBricks = true;}
}

export class Fire extends Item {
  timeLeft: number = 20;
  placedOn: Hallway = null;

  constructor(
    context: any,
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number,
    placed: Hallway
  ) {
    super(context, xPos, yPos, xSize, ySize);
    this.placedOn = placed;
  }

  draw() {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillStyle = "orange";
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }

  update() {
    if (this.timeLeft < 1) {
      this.placedOn.onFire = null;
    }
    --this.timeLeft;
  }
}
