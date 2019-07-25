import { GameState } from "./GameState";
import { Hallway, Wall } from "./FieldObj";
import {Consts} from "./Consts";

export class Explosion {
  //bombFields: Item[] = [];
  explosionRad: number;
  counter: number = 1;
  field: GameState;
  startPosX: number;
  startPosY: number;

  north: boolean = true;
  south: boolean = true;
  west: boolean = true;
  east: boolean = true;

  constructor(item: Hallway, field: GameState, explosionRad:number) {
    this.explosionRad = explosionRad;

    this.field = field;

    this.startPosX = item.x;
    this.startPosY = item.y;
  }

  checkBounds(pos: number) {
    return pos >= 0 && pos < this.field.items.length;
  }

  performFire(pos: number) {
    if (this.field.items[pos] instanceof Hallway) {
      this.field.items[pos].setOnFire();
    }
  }

    update() {
    if (this.counter < this.explosionRad) {
      var posNorth = (this.startPosY - this.counter) * Consts.ARRAY_CONST + this.startPosX;
      var posSouth = (this.startPosY + this.counter) * Consts.ARRAY_CONST + this.startPosX;
      var posWest = this.startPosY * Consts.ARRAY_CONST + (this.startPosX - this.counter);
      var posEast = this.startPosY * Consts.ARRAY_CONST + (this.startPosX + this.counter);

      if (this.south) {
        if (this.checkBounds(posSouth)) {
          this.performFire(posSouth);
          if (this.field.items[posSouth] instanceof Wall) {
            this.south = false;
          }
        }
      }
      if (this.north) {
        if (this.checkBounds(posNorth)) {
          this.performFire(posNorth);
          if (this.field.items[posNorth] instanceof Wall) {
            this.north = false;
          }
        }
      }
      if (this.west) {
        if (this.checkBounds(posWest)) {
          this.performFire(posWest);
          if (this.field.items[posWest] instanceof Wall) {
            this.west = false;
          }
        }
      }
      if (this.east) {
        if (this.checkBounds(posEast)) {
          this.performFire(posEast);
          if (this.field.items[posEast] instanceof Wall) {
            this.east = false;
          }
        }
      }

      ++this.counter;
    }
  }
}
