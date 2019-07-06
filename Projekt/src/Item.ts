import { Player } from "./Player";
import { Brick } from "./Brick";
import { Fire } from "./Fire";

//Animation
let img: any = new Image();
img.src = "animations/bomb.png";
img.onload = function() {
  init();
};

function init() {
  this.startAnimating(15);
}

export class Item {
  onFire: Fire = null;
  playerOn: Player[] = [];
  context: any;
  SIZE_X: number;
  SIZE_Y: number;

  x: number;
  y: number;

  //Animation
  spriteWidth: number = 500;
  spriteHeight: number = 500;
  cycleLoopBomb = [0, 1, 0, 1];
  currentLoopIndex: number = 0;

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
    var im = new Image(this.SIZE_X, this.SIZE_Y);
    im.src = "tilesets/tileset1/wall.jpg";
    this.context.drawImage(im, x, y, this.SIZE_X, this.SIZE_Y);
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
    if (this.bombOnItem !== null) {
      this.bombOnItem.update();
    }

    if (this.onFire !== null) {
      this.onFire.update();
      for (let e of this.playerOn) {
        e.alive = false;
      }
    }
  }

  draw() {
    var im = new Image(this.SIZE_X, this.SIZE_Y);
    if (this.playerOn.length === 0) {
      im.src = "tilesets/tileset1/hallway.jpg";
    } else {
      im.src = "tilesets/tileset1/hallway.jpg";
    }

    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;

    this.context.drawImage(im, x, y, this.SIZE_X, this.SIZE_Y);

    if (this.bombOnItem !== null) {
      this.bombOnItem.draw();
    }

    if (this.onFire !== null) {
      this.onFire.drawFire();
    }

    if (this.brickOnItem !== null) {
      this.brickOnItem.drawBrick();
    }
  }

  setOnFire() {
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

export class Hole extends Hallway {
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
    var im = new Image(this.SIZE_X, this.SIZE_Y);
    im.src = "tilesets/tileset1/hole.jpg";
    this.context.drawImage(im, x, y, this.SIZE_X, this.SIZE_Y);

    // evtl. diese Methode in eine andere Methode schreiben mit der aus Hallway
    if (this.onFire !== null) {
      this.onFire.update();
      this.onFire.drawFire();
    }
  }

  update() {
    for (let e of this.playerOn) {
      e.alive = false;

    }
  }

  setOnFire() {
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

      this.drawAnimation(
        0,
        this.cycleLoopBomb[this.currentLoopIndex],
        x - 10,
        y - 10
      );
      this.currentLoopIndex++;
      if (this.currentLoopIndex >= this.cycleLoopBomb.length) {
        this.currentLoopIndex = 0;
      }
    } else {
      const x = this.x * this.SIZE_X;
      const y = this.y * this.SIZE_Y;

      this.drawAnimation(0, this.cycleLoopBomb[this.currentLoopIndex], x, y);
      this.currentLoopIndex++;
      if (this.currentLoopIndex >= this.cycleLoopBomb.length) {
        this.currentLoopIndex = 0;
      }
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
