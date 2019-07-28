import { Bomb, Hallway, Nuke_Bomb, FieldObj } from "./FieldObj";
import { Enums } from "./Enums";
import { GameState } from "./GameState";
import { UseableItem, Nuke } from "./UseableItems";
import { AnimatedObject } from "./AnimatedObject";
import { Consts } from "./Consts";

export class Player {
  // properties
  name: string = "";
  playerNr: number = 0;
  hitPoints: number = 1;

  // counter
  transitionCounter: number = 0;


  // state variables
  xPos: number = 0;
  yPos: number = 0;
  xTar: number = 0;
  yTar: number = 0;
  transitionLock: boolean = true;
  target: number = 0;
  alive: boolean = true;
  running: boolean = false;
  movementSpeed: number = 10;
  inventory: UseableItem = null;
  visible: boolean = true;
  direction: number = 0;
  context: CanvasRenderingContext2D = null;
  onItem: FieldObj = null;
  field: GameState = null;

  currentDirection: number;
  //Animation
  loosingSequence: number = 0;
  animatedObject: AnimatedObject;

  constructor(context: CanvasRenderingContext2D, playerNr: any, name: string) {
    this.xPos = 0;
    this.yPos = 0;
    this.playerNr = playerNr;
    this.name = name;

    this.field = null;
    this.onItem = null;
    this.running = false;
    this.animatedObject = new AnimatedObject(this);
    this.context = context;

    this.direction = Enums.Direction.EAST;
  }

  initField(field: GameState, item: Hallway) {
    this.field = field;
    this.xTar = item.x;
    this.yTar = item.y;
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
      if (this.transitionCounter < Consts.TRANSITION_UPPER_BOUND) {
        switch (this.direction) {
          case Enums.Direction.NORTH: {
            this.yPos -= this.field.ySize / Consts.TRANSITION_UPPER_BOUND;
            break;
          }
          case Enums.Direction.SOUTH: {
            this.yPos += this.field.ySize / Consts.TRANSITION_UPPER_BOUND;
            break;
          }
          case Enums.Direction.WEST: {
            this.xPos -= this.field.xSize / Consts.TRANSITION_UPPER_BOUND;
            break;
          }
          case Enums.Direction.EAST: {
            this.xPos += this.field.xSize / Consts.TRANSITION_UPPER_BOUND;
            break;
          }
        }

        ++this.transitionCounter;
      } else {
        this.transitionCounter = 0;
        this.running = false;

        // Player auf neues Feld setzen
        var tmpItem = <Hallway>this.onItem;
        this.onItem = this.field.fieldObjs[this.yTar][this.xTar];

        this.field.setPlayerOnFieldObjs(this, this.xTar, this.yTar);
        this.field.setPlayerOnFieldObjs(this, tmpItem.x, tmpItem.y);

        // Freigabe des transitionsLocks

        this.field.setPlayerOnFieldObjs(this, this.xTar, this.yTar);
        this.field.rmPlayerFromFieldObjs(this, tmpItem.x, tmpItem.y);
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
          this.field.rmPlayerFromFieldObjs(this, this.onItem.x, this.onItem.y);
      } else {
        ////
        const x = this.xPos * this.field.xSize;
        const y = this.yPos * this.field.ySize;
        var im = new Image(this.field.xSize, this.field.ySize);
        im.src = "images/disappear.png";
        this.context.drawImage(im, x, y, this.field.xSize, this.field.ySize);
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

  protected checkPathAndSet(x: number, y: number): boolean {
    if (this.onItem === null) {
      throw new Error(
        'Field is not connected to Player:\n\t"this.onItem === null"'
      );
      return false;
    } else {
      console.log(x + " " + y);
      var checkType = this.field.fieldObjs[y][x] instanceof Hallway;

      if (checkType) {
        let tempField = <Hallway>this.field.fieldObjs[y][x];
        if (tempField.brickOnItem === null) {
          this.xTar = x;
          this.yTar = y;
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
  constructor(
    context: CanvasRenderingContext2D,
    socket: any,
    playerNr: number,
    name: string
  ) {
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
    console.log("hier");
    if (this.field.state === Enums.serverState.GAME) {
      if (!this.running && this.alive) {
        switch (e.key) {
          case "ArrowUp":
            if (this.checkPathAndSet(this.onItem.x, this.onItem.y - 1)) {
              this.direction = Enums.Direction.NORTH;
              this.running = true;
              this.emitEvent(Enums.Event.MOVE, Enums.Direction.NORTH);
            }
            break;
          case "ArrowDown":
            if (this.checkPathAndSet(this.onItem.x, this.onItem.y + 1)) {
              this.direction = Enums.Direction.SOUTH;
              this.running = true;
              this.emitEvent(Enums.Event.MOVE, Enums.Direction.SOUTH);
            }
            break;
          case "ArrowRight":
            if (this.checkPathAndSet(this.onItem.x + 1, this.onItem.y)) {
              this.direction = Enums.Direction.EAST;
              this.running = true;
              this.emitEvent(Enums.Event.MOVE, Enums.Direction.EAST);
            }
            break;
          case "ArrowLeft":
            if (this.checkPathAndSet(this.onItem.x - 1, this.onItem.y)) {
              this.direction = Enums.Direction.WEST;
              this.running = true;
              this.emitEvent(Enums.Event.MOVE, Enums.Direction.WEST);
            }
            break;
          case "y":
            var item = <Hallway>this.onItem;
            if (this.inventory !== null) {
              if (this.inventory.getEventType() === Enums.ActionBomb.NUKE) {
                item.bombOnItem = new Nuke_Bomb(
                  this.onItem.context,
                  this.onItem.x,
                  this.onItem.y,
                  this.onItem.SIZE_X,
                  this.onItem.SIZE_Y,
                  item
                );
              }
              this.emitEvent(Enums.Event.DROP, this.inventory.getEventType());
              this.inventory = null;
            } else {
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
            break;
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
    var evObject: { playerId: number; event: string; action: number } = {
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
  constructor(
    context: CanvasRenderingContext2D,
    playerNr: number,
    name: string
  ) {
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
      case Enums.Direction.NORTH:
        if (this.checkPathAndSet(this.onItem.x, this.onItem.y - 1)) {
          this.transitionLock = false;
          this.running = true;
          this.direction = Enums.Direction.NORTH;
        }
        break;

      case Enums.Direction.SOUTH:
        if (this.checkPathAndSet(this.onItem.x, this.onItem.y + 1)) {
          this.transitionLock = false;
          this.running = true;
          this.direction = Enums.Direction.SOUTH;
        }
        break;

      case Enums.Direction.EAST:
        if (this.checkPathAndSet(this.onItem.x + 1, this.onItem.y)) {
          this.transitionLock = false;
          this.running = true;
          this.direction = Enums.Direction.EAST;
        }
        break;
      case Enums.Direction.WEST:
        if (this.checkPathAndSet(this.onItem.x - 1, this.onItem.y)) {
          this.transitionLock = false;
          this.running = true;
          this.direction = Enums.Direction.WEST;
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

  /**
   * @description
   * Ablegen einer größeren Bombe des passiven Spielers
   */
  public placeNuke_Bomb(): void {
    var item = <Hallway>this.onItem;
    item.bombOnItem = new Nuke_Bomb(
      this.onItem.context,
      this.onItem.x,
      this.onItem.y,
      this.onItem.SIZE_X,
      this.onItem.SIZE_Y,
      item
    );
  }
}
