import { Bomb, Hallway, Hole, Item } from "./Item";
import { GameState } from "./GameState";
import { AnimatedObject } from "./AnimatedObject";

enum Direction {
  NORTH = 0,
  SOUTH = 1,
  WEST = 2,
  EAST = 3
}

export class Player {
  transitionCounter: number = 0;
  TRANSITION_UPPER_BOUND: number = 5;
  target: number = 0;

  loosingSequence: number = 0;
  alive: boolean = true;
  running: boolean;
  direction: number;
  context: any;
  canvas: any;
  onItem: Item;
  field: GameState;
  currentDirection: number;
  animatedObject: AnimatedObject;

  xPos: number;
  yPos: number;
  constructor(context: any) {
    this.xPos = 0;
    this.yPos = 0;

    this.field = null;
    this.onItem = null;
    this.running = false;
    this.animatedObject = new AnimatedObject(this);

    this.canvas = <HTMLCanvasElement>document.getElementById("game-layer");
    this.context = this.canvas.getContext("2d");
  }

  initField(field: GameState, item: Hallway) {
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
        var tmpItem = <Hallway>this.onItem;
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
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!this.alive) {
      // GameOverAnimation

      if (this.loosingSequence < 0) {
        // Game over

        this.onItem.playerOn = null;
        this.field.updateGameInfos();
      } else {
        /**
         * Hier Animation implementieren
         */

        this.context.fillStyle = "red";
        this.context.fillRect(this.xPos - 10, this.yPos - 10, 20, 20);
      }
      --this.loosingSequence;
    } else {
      this.animatedObject.animate(
        this.currentDirection,
        this.xPos,
        this.yPos
      );
    }
  }

}

export class ActivePlayer extends Player {
  constructor(context: any) {
    super(context);

    document.addEventListener("keydown", e => {
      if (!this.running && this.alive) {
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
        }
      }
    });
  }

  checkCollide(x: number, y: number): boolean {
    if (this.onItem === null) {
      throw new Error(
        'Field is not connected to Player:\n\t"this.onItem === null"'
      );
      return false;
    } else {
      var pos = y * 8 + x;
      var inBounds: boolean = pos >= 0 && pos < this.field.items.length;
      var checkType = this.field.items[pos] instanceof Hallway;

      if (inBounds && checkType) {
        /**
         * GameState hier anpassen
         */
        let tempField = <Hallway>this.field.items[pos];
        if (tempField.brickOnItem === null) {
          this.target = pos;
          return true;
        }
      }
    }
  }
}
