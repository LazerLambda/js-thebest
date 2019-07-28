import { GameState } from "./GameState";
import { Hallway, Wall } from "./FieldObj";
import {Consts} from "./Consts";

export class Explosion {
  //bombFields: Item[] = [];
  explosionRad: number;
  counter: number = 1;
  gameState: GameState;
  startPosX: number;
  startPosY: number;

  north: boolean = true;
  south: boolean = true;
  west: boolean = true;
  east: boolean = true;

  constructor(item: Hallway, gameState: GameState, explosionRad:number) {
    this.explosionRad = explosionRad;

    this.gameState = gameState;

    this.startPosX = item.x;
    this.startPosY = item.y;
  }


  /**
   * @description
   * check wether position is inside bounds or not
   * @param x number  
   * @param y number
   * @return boolean
   */
  checkBounds(x : number, y : number): boolean{
    return x >= 0 && x < this.gameState.fieldObjs[0].length  && y >= 0 && y < this.gameState.fieldObjs.length
  }
  

  /**
   * @default
   * set field on fire
   * @param x number
   * @param y number 
   */
  performFire(x :number, y : number): void{
    if(this.gameState.fieldObjs[y][x] instanceof Hallway){
      this.gameState.fieldObjs[y][x].setOnFire();
    }
  }


  /**
   * @description
   * update class as long the explosion radius isn't reached
   */
    update() : void{
    if (this.counter < this.explosionRad) {

      if (this.south) {
        if (this.checkBounds(this.startPosX, (this.startPosY + this.counter))){
          this.performFire(this.startPosX, (this.startPosY + this.counter));
          if (this.gameState.fieldObjs[(this.startPosY + this.counter)][this.startPosX] instanceof Wall) {
            this.south = false;
          }
        }
      }
      if (this.north) {
        if (this.checkBounds(this.startPosX, (this.startPosY - this.counter))){
          this.performFire(this.startPosX, (this.startPosY - this.counter));
          if (this.gameState.fieldObjs[(this.startPosY - this.counter)][this.startPosX] instanceof Wall) {
            this.north = false;
          }
        }
      }
      if (this.west) {
        if (this.checkBounds((this.startPosX - this.counter), this.startPosY)){
          this.performFire((this.startPosX - this.counter), this.startPosY);
          if (this.gameState.fieldObjs[this.startPosY][(this.startPosX - this.counter)] instanceof Wall) {
            this.west = false;
          }
        }
      }
      if (this.east) {
        if (this.checkBounds((this.startPosX + this.counter), this.startPosY)){
          this.performFire((this.startPosX + this.counter), this.startPosY);
          if (this.gameState.fieldObjs[this.startPosY][(this.startPosX + this.counter)] instanceof Wall) {
            this.north = false;
          }
        }
      }

      ++this.counter;
    }
  }
}
