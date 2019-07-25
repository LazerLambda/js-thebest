import { Player } from "./Player";
import { Brick } from "./Brick";
import { Fire } from "./Fire";
import { AnimatedObject } from "./AnimatedObject";
import { ActivePlayer } from "./Player";

let imgBomb: any = new Image();
imgBomb.src = "animations/bomb.png";
imgBomb.onload = function() {
  init();
};

function init() {
  this.startAnimating(15);
}

export class FieldObj {
  onFire: Fire = null;
  playerOn: Player[] = [];
  context: any;
  SIZE_X: number;
  SIZE_Y: number;

  x: number;
  y: number;

  spriteWidthBomb: number = 500;
  spriteHeightBomb: number = 500;
  cycleLoopBomb = [0, 1, 0, 1];
  currentLoopIndex: number = 0;
  frameCount: number = 0;

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

  /**
   * @description
   * draw this class
   */
  draw() {}
  /**
   * @description
   * update this class
   */
  update() {}


  /**
   * @description
   * react to explosions and fire events 
   */
  setOnFire() {}


  /**
   * @description
   * draw the FieldObj
   * @param imageSource string Path to the image
   */
  drawField(imageSource: string) {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    var im = new Image(this.SIZE_X, this.SIZE_Y);
    im.src = imageSource;
    this.context.drawImage(im, x, y, this.SIZE_X, this.SIZE_Y);
  }
}








export class Wall extends FieldObj {
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
    this.drawField("tilesets/tileset1/wall.jpg");
  }
}







export class Hallway extends FieldObj {
  bombOnItem: Bomb = null;
  onFire: Fire = null;
  brickOnItem: Brick = null;

  overlayingItem: FieldObj[];

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
        if (e instanceof ActivePlayer) {
          e.setLose();
        }
      }
    }
  }

  draw() {
    this.drawField("tilesets/tileset1/hallway.jpg");

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
    this.drawField("tilesets/tileset1/hole.jpg");
    if (this.onFire !== null) {
      this.onFire.drawFire();
    }
  }

  update() {
    for (let e of this.playerOn) {
      if (e instanceof ActivePlayer) {
        console.log("Hier auf dem Feuer");
        e.setLose();
      }
    }
    if (this.onFire !== null) {
      this.onFire.update();
    }
  }
}










export class Bomb extends FieldObj {
  timeLeftToDrop: number;
  timeLeft: number;
  explode: boolean = false;
  placedOn: Hallway;
  animatedObject: AnimatedObject;

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

      let time = 2; // Zeit für Bildwechsel in der Animation
      if (this.frameCount <= 4 * time) {
        if (this.frameCount % time === 0) {
          this.currentLoopIndex++;
          if (this.currentLoopIndex >= this.cycleLoopBomb.length) {
            this.currentLoopIndex = 0;
          }
        }
      } else {
        this.frameCount = 0;
      }
      ++this.frameCount;

      this.context.drawImage(
        imgBomb,
        0,
        this.cycleLoopBomb[this.currentLoopIndex] * this.spriteHeightBomb,
        this.spriteWidthBomb,
        this.spriteHeightBomb,
        x - 10,
        y - 10,
        this.SIZE_X,
        this.SIZE_Y
      );
    } else {
      const x = this.x * this.SIZE_X;
      const y = this.y * this.SIZE_Y;

      let time = 2; // Zeit für Bildwechsel in der Animation
      if (this.frameCount <= 4 * time) {
        if (this.frameCount % time === 0) {
          this.currentLoopIndex++;
          if (this.currentLoopIndex >= this.cycleLoopBomb.length) {
            this.currentLoopIndex = 0;
          }
        }
      } else {
        this.frameCount = 0;
      }
      ++this.frameCount;

      this.context.drawImage(
        imgBomb,
        0,
        this.cycleLoopBomb[this.currentLoopIndex] * this.spriteHeightBomb,
        this.spriteWidthBomb,
        this.spriteHeightBomb,
        x,
        y,
        this.SIZE_X,
        this.SIZE_Y
      );
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
