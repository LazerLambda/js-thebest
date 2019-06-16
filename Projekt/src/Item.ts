import { Player } from "./Player";

//Animation
let img: any = new Image();
img.src = "http://tsgk.captainn.net/sheets/nes/bomberman2_various_sheet.png";
img.onload = function() {
  init();
};

function init() {
  this.startAnimating(15);
}

export class Item {
  onFire : Fire = null
  playerOn: Player = null;
  context: any;
  SIZE_X: number;
  SIZE_Y: number;

  x: number;
  y: number;

  //Animation
  spriteWidth: number = 40;
  spriteHeight: number = 30;
  //cycleLoopBomb = [5, 6, 7, 6];
  //currentLoopIndex: number= 0;

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

  //Animation
  drawAnimation(
    frameX: number,
    frameY: number,
    canvasX: number,
    canvasY: number
  ) {
    this.context.drawImage(
      img,
      frameX * this.spriteWidth,
      frameY * this.spriteHeight,
      this.spriteWidth,
      this.spriteHeight,
      canvasX,
      canvasY,
      this.SIZE_X,
      this.SIZE_Y
    );
  }
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

export class Hallway extends Item {
  bombOnItem: Bomb = null;
  onFire: Fire = null;
  brickOnItem: Brick = null;

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

  update() {
    if (this.onFire !== null && this.playerOn !== null) {
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

    if (this.brickOnItem !== null) {
      this.brickOnItem.draw();
    }
  }

  setOnFire() {
    if (this.playerOn !== null) {
      this.playerOn.alive = false;
    }
    if (this.brickOnItem !== null) {
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

export class Hole extends Hallway{
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


    // evtl. diese Methode in eine andere Methode schreiben mit der aus Hallway
    if (this.onFire !== null) {
      this.onFire.update();
      this.onFire.draw();
    }
  }

  update(){
    if(this.playerOn !== null){
      this.playerOn.alive = false;
    }
  }

  setOnFire(){
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

      this.drawAnimation(5, 3, x - 10, y - 10);
      //this.drawAnimation(this.cycleLoopBomb[this.currentLoopIndex], 3, x - 10, y - 10);
      //this.currentLoopIndex++;
      //if (this.currentLoopIndex >= this.cycleLoopBomb.length) {
      //  this.currentLoopIndex = 0;
      //}
    } else {
      const x = this.x * this.SIZE_X;
      const y = this.y * this.SIZE_Y;

      this.drawAnimation(5, 3, x + 10, y + 10);
      //this.drawAnimation(this.cycleLoopBomb[this.currentLoopIndex], 3, x + 10, y + 10);
      //this.currentLoopIndex++;
      //if (this.currentLoopIndex >= this.cycleLoopBomb.length) {
      //  this.currentLoopIndex = 0;
      //}
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

export class Brick{
  breakBricks: boolean = false;
  placedOn: Hallway;

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

  setOnFire() {
    this.breakBricks = true;
  }
}


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

  draw() {
    const x = this.xPos * this.xSize;
    const y = this.yPos * this.ySize;
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
