import { Bomb, Hallway, Hole, Item } from "./Item";
import { GameState } from "./GameState";
import { AnimatedObject } from "./AnimatedObject";

enum Direction {
  NORTH = 0,
  SOUTH = 1,
  WEST = 2,
  EAST = 3
}

//Animation
let img: any = new Image();
img.src = "http://tsgk.captainn.net/sheets/nes/bomberman2_various_sheet.png";
img.onload = function() {
  init();
};

function init() {
  this.startAnimating(200);
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

  playerNr: number;

  constructor(context: any, playerNr: any) {
    this.xPos = 0;
    this.yPos = 0;
    this.playerNr = playerNr;

    this.field = null;
    this.onItem = null;
    this.running = false;
    this.animatedObject = new AnimatedObject(this);
    this.context = context;

    this.currentDirection = 3;
  }

  initField(field: GameState, item: Hallway) {
    this.field = field;
    this.target = item.x + item.y * 8; //
    this.onItem = item;
    this.onItem.playerOn.push(this);
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
        this.onItem.playerOn.push(this);
        var oldPos = tmpItem.x + tmpItem.y * 8;
        this.field.items[oldPos].playerOn.forEach(e => {console.log("hier" + e.playerNr);});


        // this.field.items[oldPos].playerOn = this.field.items[oldPos].playerOn.filter(function(e){
        //   return <number> e.playerNr !== <number> this.playerNr;
        // });

        var newArr = new Array();
        for (let i = 0; i < this.field.items[oldPos].playerOn.length; i++){
          console.log("" + this.field.items[oldPos].playerOn[(i)].playerNr);
          if(this.field.items[oldPos].playerOn[(i)].playerNr !== this.playerNr){
            newArr.push(this.field.items[oldPos].playerOn[(i)]);
          }
        }
        this.field.items[oldPos].playerOn = newArr;
       

        this.xPos = this.onItem.x * this.field.xSize;
        this.yPos = this.onItem.y * this.field.ySize;
      }
    }
  }

  drawPlayer() {
    if (!this.alive) {
      // GameOverAnimation

      if (this.loosingSequence < 0) {
        // Game over

        this.onItem.playerOn = this.onItem.playerOn.filter(e => {
          // console.log("drawPlayer: !this.alive");
          // console.log(e.playerNr + "");
          e.playerNr !== this.playerNr;
        });
        this.context.fillStyle = "red";
        this.context.fillRect(this.xPos - 10, this.yPos - 10, 20, 20);
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
      this.animatedObject.animate(this.currentDirection, this.xPos, this.yPos);
    }
  }
}

export class ActivePlayer extends Player {
  socket: any = null;
  constructor(context: any, socket: any, playerNr: number) {
    super(context, playerNr);
    this.socket = socket;

    document.addEventListener("keydown", e => {
      if (!this.running && this.alive) {
        switch (e.key) {
          case "ArrowUp":
            if (this.checkCollide(this.onItem.x, this.onItem.y - 1)) {
              socket.emit("event", "Test");
              this.direction = Direction.NORTH;
              this.running = true;
            }
            break;
          case "ArrowDown":
            if (this.checkCollide(this.onItem.x, this.onItem.y + 1)) {
              socket.emit("event", "Test");
              this.direction = Direction.SOUTH;
              this.running = true;
            }
            break;
          case "ArrowRight":
            if (this.checkCollide(this.onItem.x + 1, this.onItem.y)) {
              socket.emit("event", "Test");
              this.direction = Direction.EAST;
              this.running = true;
            }
            break;
          case "ArrowLeft":
            if (this.checkCollide(this.onItem.x - 1, this.onItem.y)) {
              socket.emit("event", "Test");
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

      socket.emit("event", "Test");
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

export class PassivePlayer extends Player {
  constructor(context: any, playerNr: number) {
    super(context, playerNr);
  }
}
