import { Field } from "./Field";
import { Bomb, Hallway, Hole, Item } from "./Item";

enum Direction {
  NORTH = 0,
  SOUTH = 1,
  WEST = 2,
  EAST = 3
}

//Animation
let img : any = new Image();
img.src = 'http://tsgk.captainn.net/sheets/nes/bomberman2_various_sheet.png';
img.onload = function() {
  init();
}

function init() {
  this.startAnimating(15);
}

export class Player {
  transitionCounter: number = 0;
  TRANSITION_UPPER_BOUND: number = 3;
  target: number = 0;

  loosingSequence: number = 10;
  alive: boolean = true;
  running: boolean;
  direction: number;
  context: any;
  canvas: any;
  onItem: Item;
  field: Field;

  //Animation
  spriteWidth: number = 28;
  spriteHeight: number = 30;
  cycleLoop = [0, 1, 0, 2];
  currentDirection: number;
  currentLoopIndex: number= 0;
  frameCount: number = 0;

  xPos: number;
  yPos: number;
  constructor(context: any) {
    this.xPos = 0;
    this.yPos = 0;

    this.field = null;
    this.onItem = null;
    this.running = false;

    this.canvas = <HTMLCanvasElement>document.getElementById("game-layer");
    this.context = this.canvas.getContext("2d");
  }

  initField(field: Field, item: Hallway) {
    this.field = field;

    item.playerOn = this;
    this.onItem = item;
    this.xPos = item.x * this.field.xSize;
    this.yPos = item.y * this.field.ySize;
  }

  renderPlayer() {
    if (this.running) {
      if (this.transitionCounter < this.TRANSITION_UPPER_BOUND) {
        switch (this.direction) {
          case Direction.NORTH: {
            this.yPos -= this.field.ySize / this.TRANSITION_UPPER_BOUND;
            this.currentDirection = 2;
            break;
          }
          case Direction.SOUTH: {
            this.yPos += this.field.ySize / this.TRANSITION_UPPER_BOUND;
            this.currentDirection = 0;
            break;
          }
          case Direction.WEST: {
            this.xPos -= this.field.xSize / this.TRANSITION_UPPER_BOUND;
            this.currentDirection = 1;
            break;
          }
          case Direction.EAST: {
            this.xPos += this.field.xSize / this.TRANSITION_UPPER_BOUND;
            this.currentDirection = 3;
            break;
          }
        }

        ++this.transitionCounter;
      } else {
        this.transitionCounter = 0;
        this.running = false;

        // Player auf neues Feld setzen
        var tmpItem = <Hallway> this.onItem;
        this.onItem = this.field.items[this.target];
        this.onItem.playerOn = this;
        tmpItem.playerOn = null;
        this.field.playerPos = this.target;

        this.xPos = this.onItem.x * this.field.xSize;
        this.yPos = this.onItem.y * this.field.ySize;
      }
    }
  }

  drawPlayer() {
    if (!this.alive) {
      /**
       * Zähler für Animation
       */
      if (this.loosingSequence < 0) {
        this.context.clearRect(0, 0, 480, 480);

        this.onItem.playerOn = null;
        this.field.updateGameInfos();
      }
      --this.loosingSequence;
    } else {
      // + 4 nur zur hervorhebung, roter Hintergrund ist der Spieler auf item
      if (this.running) {
          this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
          this.drawAnimation(this.currentDirection, this.cycleLoop[this.currentLoopIndex], this.xPos + 4, this.yPos);
          this.currentLoopIndex++;
          if (this.currentLoopIndex >= this.cycleLoop.length) {
              this.currentLoopIndex = 0;
          }
      } else {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        //falls Spieler dazwischen stehen soll, sieht vermutlich nur auf großem Spielfeld gut aus
        //this.drawAnimation(0, 0, this.onItem.x * this.field.xSize + 4, this.onItem.y * this.field.ySize + 4); 
        this.drawAnimation(this.currentDirection, this.cycleLoop[this.currentLoopIndex], this.onItem.x * this.field.xSize + 4, this.onItem.y * this.field.ySize + 4);
        this.currentLoopIndex++;
        if (this.currentLoopIndex >= this.cycleLoop.length) {
          this.currentLoopIndex = 0;
        }
      }
    }
  }

  //Animation
  drawAnimation(frameX: number, frameY: number, canvasX: number, canvasY:number) {
    this.context.drawImage(img,
      frameX * this.spriteWidth, frameY * this.spriteHeight,
      this.spriteWidth, this.spriteHeight, canvasX, canvasY,
      this.field.xSize, this.field.ySize);
  }

  //Animation Geschwindigkeit Player
  step() {
    this.frameCount++;
    if (this.frameCount < 8) {
      window.requestAnimationFrame(this.step);
      return;
    }
    this.frameCount = 0;
    this.drawPlayer();
    window.requestAnimationFrame(this.step);
  }

}

export class ActivePlayer extends Player {
  constructor(context: any) {
    super(context);

    document.addEventListener("keydown", e => {
      if (!this.running) {
        switch (e.key) {
          case "ArrowUp":
            if (this.checkCollide(this.onItem.x, this.onItem.y - 1)) {
              this.direction = Direction.NORTH;
              this.running = true;
            }
            break;
          case "ArrowDown":
            if (this.checkCollide(this.onItem.x, this.onItem.y + 1)) {
              this.direction = Direction.SOUTH;
              this.running = true;
            }
            break;
          case "ArrowRight":
            if (this.checkCollide(this.onItem.x + 1, this.onItem.y)) {
              this.direction = Direction.EAST;
              this.running = true;
            }
            break;
          case "ArrowLeft":
            if (this.checkCollide(this.onItem.x - 1, this.onItem.y)) {
              this.direction = Direction.WEST;
              this.running = true;
            }
            break;
          case "Enter":
            if (e.key === "Enter") {
              var item = <Hallway>this.onItem;
              item.bombOnItem = new Bomb(
                this.onItem.context,
                this.onItem.x,
                this.onItem.y,
                this.onItem.SIZE_X,
                this.onItem.SIZE_Y,
                item
              );
            }

            console.log("dasfasdf");
            this.context.clearRect(0, 0, 480, 480);
            this.context.fillStyle = "black";
            this.context.fillRect(0, 0, 480, 480);
        }
      }
    });
  }

  checkCollide(x: number, y: number): boolean {
    if (this.onItem === null) {
      throw new Error(
        'Field is not connected to Player:\n\t"this.onItem === null"'
      );
    } else {
      var pos = y * 8 + x;
      var inBounds: boolean = pos >= 0 && pos < this.field.items.length;
      var checkType =
        this.field.items[pos] instanceof Hallway ||
        this.field.items[pos] instanceof Hole;

      if (inBounds && checkType) {
        /**
         * GameState hier anpassen
         */
        this.target = pos;
        return true;
      } else {
        return false;
      }
    }
  }
}
