import { Bomb, Hallway, Hole, Item } from "./Item";
import { GameState } from "./GameState";
import { useableItem, portableHole } from "./UsableItems";
import { AnimatedObject } from "./AnimatedObject";

enum Direction {
  NORTH = 0,
  SOUTH = 1,
  WEST = 2,
  EAST = 3
}

enum Event {
  MOVE = "move",
  DROP = "drop",
  PICKUP = 'pickup'
}

enum ActionBomb {
  DEFAULT_BOMB = 1
}

export class Player {
  transitionLock: boolean = true;
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
  hitPoints: number = 1;
  movementSpeed: number = 10;
  inventory: useableItem = null;
  visible: boolean = true;

  //Animation
  spriteWidth: number = 28;
  spriteHeight: number = 30;
  cycleLoopPlayer = [0, 1, 0, 2];
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

        this.field.setPlayerOnItem(this, this.target);
        this.field.rmPlayerFromItem(this, tmpItem.x, tmpItem.y);

        // Freigabe des transitionsLocks

        this.field.setPlayerOnItem(this, this.target);
        this.field.rmPlayerFromItem(this, tmpItem.x, tmpItem.y);
        this.transitionLock = true;

        this.xPos = this.onItem.x * this.field.xSize;
        this.yPos = this.onItem.y * this.field.ySize;
      }
    }
  }

  /**
   * @description
   * Methode zur Verwaltung der alive Variable
   */

  setLose() {}

  /**
   * @description
   * Methode für die Darstellungslogik des Spielers
   */

  drawPlayer() {
    if (!this.alive) {
      // GameOverAnimation

      if (this.loosingSequence < 0) {
        // Game over

        var pos = this.onItem.x + this.onItem.y * 8;
        var newArr = new Array();
        for (let i = 0; i < this.field.items[pos].playerOn.length; i++) {
          if (this.field.items[pos].playerOn[i].playerNr !== this.playerNr) {
            newArr.push(this.field.items[pos].playerOn[i]);
          }
        }
        this.field.items[pos].playerOn = newArr;
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
      this.animatedObject.animatePlayer(
        this.currentDirection,
        this.xPos,
        this.yPos,
        this.playerNr
      );
    }
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
        let tempField = <Hallway>this.field.items[pos];
        if (tempField.brickOnItem === null) {
          this.target = pos;
          return true;
        }
      }
    }
  }
}

/**
 * @description
 * Klasse für die Verwaltung des aktiven Spielers auf dem Client. Verwaltung der Nutzereingabe,
 * der Spielerlogik und des Versendens der Events
 */
export class ActivePlayer extends Player {
  socket: any = null;
  constructor(context: any, socket: any, playerNr: number) {
    super(context, playerNr);
    this.socket = socket;

    document.addEventListener("keydown", this.gameEventListener.bind(this));
  }

  /**
   * @description
   * Funktion für die Verrarbeitung der Spielereingaben.
   * @param e Event
   */
  gameEventListener(e: any) {
    if (!this.running && this.alive) {
      switch (e.key) {
        case "ArrowUp":
          if (this.checkCollide(this.onItem.x, this.onItem.y - 1)) {
            this.direction = Direction.NORTH;
            this.running = true;
            this.emitEvent(Event.MOVE, Direction.NORTH);
          }
          break;
        case "ArrowDown":
          if (this.checkCollide(this.onItem.x, this.onItem.y + 1)) {
            this.direction = Direction.SOUTH;
            this.running = true;
            this.emitEvent(Event.MOVE, Direction.SOUTH);
          }
          break;
        case "ArrowRight":
          if (this.checkCollide(this.onItem.x + 1, this.onItem.y)) {
            this.direction = Direction.EAST;
            this.running = true;
            this.emitEvent(Event.MOVE, Direction.EAST);
          }
          break;
        case "ArrowLeft":
          if (this.checkCollide(this.onItem.x - 1, this.onItem.y)) {
            this.direction = Direction.WEST;
            this.running = true;
            this.emitEvent(Event.MOVE, Direction.WEST);
          }
          break;
        case "y":
          if (e.key === "y") {
            var item = <Hallway>this.onItem;
            item.bombOnItem = new Bomb(
              this.onItem.context,
              this.onItem.x,
              this.onItem.y,
              this.onItem.SIZE_X,
              this.onItem.SIZE_Y,
              item
            );
            this.emitEvent(Event.DROP, ActionBomb.DEFAULT_BOMB);
          }
      }
    }
  }

  /**
   * @description
   * Entfernung des EventListeners.
   */
  removeEventLister() {
    document.removeEventListener("keydown", this.gameEventListener);
  }

  /**
   * @description
   * Methode zur Verwaltung der alive Variable. Hier wird weiterhin
   * ein 'isOver' Event an den Server gesendet, um die Spielerlogik nur
   * auf einem Client ablaufen zu lassen.
   */
  setLose() {
    this.socket.emit("isOver");
    this.alive = false;
  }

  emitEvent(event: string, action: number) {
    var evObject: object = {
      playerId: this.playerNr,
      event: event,
      action: action
    };
    this.socket.emit("event", evObject);
  }
}

/**
 * @description
 * Klasse zur Darstellung der Spieler im Netzwerk. Hier wird der Spieler dargestellt, indem die moves
 * äquivalent zum aktiven Spieler ausgeführt werden. Über ein transition lock und eine Warteschlange,
 * werden die Spielzüge in korrekter Reihenfolge durchgeführt.
 */

export class PassivePlayer extends Player {
  constructor(context: any, playerNr: number) {
    super(context, playerNr);
  }

  /**
   * @description
   * Festlegung der korrekten Laufrichtung des passsiven Spielers.
   * Belegung des transition locks für die korrekte Hintereinander-
   * ausführung
   * @param action Laufrichtung
   */
  setTarget(action: number) {
    switch (action) {
      case Direction.NORTH:
        if (this.checkCollide(this.onItem.x, this.onItem.y - 1)) {
          this.transitionLock = false;

          this.target = this.onItem.x + (this.onItem.y - 1) * 8;
          this.running = true;
          this.direction = Direction.NORTH;
        }
        break;

      case Direction.SOUTH:
        if (this.checkCollide(this.onItem.x, this.onItem.y + 1)) {
          this.transitionLock = false;

          this.target = this.onItem.x + (this.onItem.y + 1) * 8;
          this.running = true;
          this.direction = Direction.SOUTH;
        }
        break;

      case Direction.EAST:
        if (this.checkCollide(this.onItem.x + 1, this.onItem.y)) {
          this.transitionLock = false;

          this.target = this.onItem.x + 1 + this.onItem.y * 8;
          this.running = true;
          this.direction = Direction.EAST;
        }
        break;
      case Direction.WEST:
        if (this.checkCollide(this.onItem.x - 1, this.onItem.y)) {
          this.transitionLock = false;

          this.target = this.onItem.x - 1 + this.onItem.y * 8;
          this.running = true;
          this.direction = Direction.WEST;
          break;
        }
    }
  }

  /**
   * @description
   * Ablegen einer Bombe des passiven Spielers
   */

  placeBomb() {
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

  /**
   * @description
   * Methode zur Verwaltung der alive Variable.
   */
  setLose() {
    this.alive = false;
  }
}
