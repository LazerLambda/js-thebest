import { Player } from "./Player";

export class Item {
  playerOn : Player;
  context: any;
  SIZE_X: number;
  SIZE_Y: number;

  x: number;
  y: number;

  constructor(context: any, xPos: number, yPos: number, xSize : number, ySize : number) {
    this.context = context;

    this.x = xPos;
    this.y = yPos;

    this.SIZE_X = xSize;
    this.SIZE_Y = ySize;
    this.playerOn = null;
  }

  draw() {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillStyle = "yellow";
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }
}

export class Wall extends Item {
  constructor(context: any, xPos: number, yPos: number, xSize : number, ySize : number) {
    super(context, xPos, yPos, xSize, ySize);
  }

  draw() {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillStyle = "grey";
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }
}

export class Hole extends Item {

  constructor(context: any, xPos: number, yPos: number, xSize : number, ySize : number) {
    super(context, xPos, yPos, xSize, ySize);
  }

  draw() {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillStyle = "black";
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }
}

export class Hallway extends Item {

  playerOnItem : Player;

  overlayingItem : Item;

  constructor(context: any, xPos: number, yPos: number, xSize : number, ySize : number) {
    super(context, xPos, yPos, xSize, ySize);
  }

  draw() {
    if(this.playerOn === null){
      this.context.fillStyle = "green";
    }
    else{
      this.context.fillStyle = "red";
    }
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }
}

export class Bomb extends Item{

  timeLeft : number;

  constructor(context: any, xPos: number, yPos: number, xSize : number, ySize : number) {
    super(context, xPos, yPos, xSize, ySize);
    this.timeLeft = 100;
  }



} 
