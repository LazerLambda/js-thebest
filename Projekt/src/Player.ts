import { Bomb, Hallway, Hole, FieldObj } from "./FieldObj";
import { Enums } from "./Enums";
import { GameState } from "./GameState";
import { useableItem, portableHole } from "./UsableItems";
import { AnimatedObject } from "./AnimatedObject";
import {Consts} from "./Consts";

enum Direction {
  NORTH = 2,
  SOUTH = 0,
  WEST = 1,
  EAST = 3
}

export class Player {
  // properties
  name: string = "";
  playerNr: number = 0;
  hitPoints: number = 1;

  // counter
  transitionCounter: number = 0;

  // consts
  TRANSITION_UPPER_BOUND: number = 5;

  // state variables
  xPos: number = 0;
  yPos: number = 0;
  transitionLock: boolean = true;
  target: number = 0;
  alive: boolean = true;
  running: boolean = false;
  movementSpeed: number = 10;
  inventory: useableItem = null;
  visible: boolean = true;
  direction: number = 0;
  context: any = null;
  onItem: FieldObj = null;
  field: GameState = null;

  //Animation
  loosingSequence: number = 0;
  animatedObject: AnimatedObject;

  constructor(context: any, playerNr: any, name: string) {
    this.xPos = 0;
    this.yPos = 0;
    this.playerNr = playerNr;
    this.name = name;

    this.field = null;
    this.onItem = null;
    this.running = false;
    this.animatedObject = new AnimatedObject(this);
    this.context = context;

    this.direction = Direction.EAST;
  }

  initField(field: GameState, item: Hallway) {
    this.field = field;
    this.target = item.x + item.y * Consts.ARRAY_CONST;
    this.onItem = item;
    this.onItem.playerOn.push(this);
    this.xPos = item.x * this.field.xSize;
    this.yPos = item.y * this.field.ySize;
  }

  /**
   * @description
   *
   */
  public updatePlayer(): void {
    if (this.running) {
      if (this.transitionCounter < this.TRANSITION_UPPER_BOUND) {
        switch (this.direction) {
          case Direction.NORTH: {
            this.yPos -= this.field.ySize / this.TRANSITION_UPPER_BOUND;
            break;
          }
          case Direction.SOUTH: {
            this.yPos += this.field.ySize / this.TRANSITION_UPPER_BOUND;
            break;
          }
          case Direction.WEST: {
            this.xPos -= this.field.xSize / this.TRANSITION_UPPER_BOUND;
            break;
          }
          case Direction.EAST: {
            this.xPos += this.field.xSize / this.TRANSITION_UPPER_BOUND;
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

  public setLose(): void {
    this.alive = false;
  }

  /**
   * @description
   * Methode für die Darstellungslogik des Spielers
   */
  public drawPlayer(): void {
    if (!this.alive) {
      // GameOverAnimation

      if (this.loosingSequence < 0) {
        var pos = this.onItem.x + this.onItem.y * Consts.ARRAY_CONST;
        var newArr = new Array();
        for (let i = 0; i < this.field.items[pos].playerOn.length; i++) {
          if (this.field.items[pos].playerOn[i].playerNr !== this.playerNr) {
            newArr.push(this.field.items[pos].playerOn[i]);
          }
        }
        this.field.items[pos].playerOn = newArr;
      } else {
        ////
        this.context.fillStyle = "red";
        this.context.fillRect(this.xPos - 10, this.yPos - 10, 20, 20);
      }
      --this.loosingSequence;
    } else {
      this.animatedObject.animatePlayer(
        this.direction,
        this.xPos,
        this.yPos,
        this.playerNr
      );
    }
  }

  /**
   * @description
   * Implementierung der  Spielzugüberprüfung
   * @param x x Target
   * @param y y Target
   */

  protected checkCollide(x: number, y: number): boolean {
    if (this.onItem === null) {
      throw new Error(
        'Field is not connected to Player:\n\t"this.onItem === null"'
      );
      return false;
    } else {
      var pos = y * Consts.ARRAY_CONST + x;
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
 * der Spielerlogik und des Versendens der Enums.Event.
 */
export class ActivePlayer extends Player {
  socket: any = null;
  constructor(context: any, socket: any, playerNr: number, name: string) {
    super(context, playerNr, name);
    this.socket = socket;

    document.addEventListener("keydown", this.gameEventListener.bind(this));
  }

  /**
   * @description
   * Funktion für die Verrarbeitung der Spielereingaben.
   * @param e Event
   */
  private gameEventListener(e: any) {
    if (this.field.state === Enums.serverState.GAME) {
      if (!this.running && this.alive) {
        switch (e.key) {
          case "ArrowUp":
            if (this.checkCollide(this.onItem.x, this.onItem.y - 1)) {
              this.direction = Direction.NORTH;
              this.running = true;
              this.emitEvent(Enums.Event.MOVE, Direction.NORTH);
            }
            break;
          case "ArrowDown":
            if (this.checkCollide(this.onItem.x, this.onItem.y + 1)) {
              this.direction = Direction.SOUTH;
              this.running = true;
              this.emitEvent(Enums.Event.MOVE, Direction.SOUTH);
            }
            break;
          case "ArrowRight":
            if (this.checkCollide(this.onItem.x + 1, this.onItem.y)) {
              this.direction = Direction.EAST;
              this.running = true;
              this.emitEvent(Enums.Event.MOVE, Direction.EAST);
            }
            break;
          case "ArrowLeft":
            if (this.checkCollide(this.onItem.x - 1, this.onItem.y)) {
              this.direction = Direction.WEST;
              this.running = true;
              this.emitEvent(Enums.Event.MOVE, Direction.WEST);
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
              this.emitEvent(Enums.Event.DROP, Enums.ActionBomb.DEFAULT_BOMB);
            }
        }
      }
    }
  }

  /**
   * @description
   * Methode zur Verwaltung der alive Variable. Hier wird weiterhin
   * ein 'isOver' Event.an den Server gesendet, um die Spielerlogik nur
   * auf einem Client ablaufen zu lassen.
   */
  public setLose() {
    this.socket.emit("isOver");
    this.alive = false;
  }

  private emitEvent(event: string, action: number) {
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
  constructor(context: any, playerNr: number, name: string) {
    super(context, playerNr, name);
  }

  /**
   * @description
   * Festlegung der korrekten Laufrichtung des passsiven Spielers.
   * Belegung des transition locks für die korrekte Hintereinander-
   * ausführung
   * @param action number Laufrichtung
   */
  public setTarget(action: number): void {
    switch (action) {
      case Direction.NORTH:
        if (this.checkCollide(this.onItem.x, this.onItem.y - 1)) {
          this.transitionLock = false;

          this.target = this.onItem.x + (this.onItem.y - 1) * Consts.ARRAY_CONST;
          this.running = true;
          this.direction = Direction.NORTH;
        }
        break;

      case Direction.SOUTH:
        if (this.checkCollide(this.onItem.x, this.onItem.y + 1)) {
          this.transitionLock = false;

          this.target = this.onItem.x + (this.onItem.y + 1) * Consts.ARRAY_CONST;
          this.running = true;
          this.direction = Direction.SOUTH;
        }
        break;

      case Direction.EAST:
        if (this.checkCollide(this.onItem.x + 1, this.onItem.y)) {
          this.transitionLock = false;

          this.target = this.onItem.x + 1 + this.onItem.y * Consts.ARRAY_CONST;
          this.running = true;
          this.direction = Direction.EAST;
        }
        break;
      case Direction.WEST:
        if (this.checkCollide(this.onItem.x - 1, this.onItem.y)) {
          this.transitionLock = false;

          this.target = this.onItem.x - 1 + this.onItem.y * Consts.ARRAY_CONST;
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

  public placeBomb(): void {
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
