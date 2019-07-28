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

  checkBounds(x : number, y : number){
    return x >= 0 && x < this.field.fieldObjs[0].length  && y >= 0 && this.field.fieldObjs.length
  }
  
  performFire(x :number, y : number){
    if(this.field.fieldObjs[y][x] instanceof Hallway){
      this.field.fieldObjs[y][x].setOnFire();
    }
  }

    update() {
    if (this.counter < this.explosionRad) {

      if (this.south) {
        if (this.checkBounds(this.startPosX, (this.startPosY + this.counter))){
          this.performFire(this.startPosX, (this.startPosY + this.counter));
          if (this.field.fieldObjs[(this.startPosY + this.counter)][this.startPosX] instanceof Wall) {
            this.south = false;
          }
        }
      }
      if (this.north) {
        if (this.checkBounds(this.startPosX, (this.startPosY - this.counter))){
          this.performFire(this.startPosX, (this.startPosY - this.counter));
          if (this.field.fieldObjs[(this.startPosY - this.counter)][this.startPosX] instanceof Wall) {
            this.north = false;
          }
        }
      }
      if (this.west) {
        if (this.checkBounds((this.startPosX - this.counter), this.startPosY)){
          this.performFire((this.startPosX - this.counter), this.startPosY);
          if (this.field.fieldObjs[this.startPosY][(this.startPosX - this.counter)] instanceof Wall) {
            this.west = false;
          }
        }
      }
      if (this.east) {
        if (this.checkBounds((this.startPosX + this.counter), this.startPosY)){
          this.performFire((this.startPosX + this.counter), this.startPosY);
          if (this.field.fieldObjs[this.startPosY][(this.startPosX + this.counter)] instanceof Wall) {
            this.north = false;
          }
        }
      }

      ++this.counter;
    }
  }
}
