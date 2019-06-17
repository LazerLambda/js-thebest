import { Player } from "./Player";

export class useableItem {

playerOn: Player = null;
usingPlayer: Player = null;
static: boolean = false;  // der Spieler kann das Item aufnehmen | nicht aufnehmen
context: any;
SIZE_X: number;
SIZE_Y: number;

x: number;  //koordinaten
y: number;

inventorySpaceX:number = 0; //Koordinaten der inventaranzeige
inventorySpaceY:number = 0;

spriteWidth: number = 40;
spriteHeight: number = 30;

constructor(
    context: any,
    xPos: number,
    yPos: number,
    xSize: number,
    ySize: number
  ) {
    this.context = context;

    this.x = xPos;
    this.y = yPos;

    this.SIZE_X = xSize;
    this.SIZE_Y = ySize;
  }



  draw() {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillStyle = "blue";
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }



}


export class armor extends useableItem {

    use() {
        this.usingPlayer.hitPoints =+1;
    }
}
export class shoes extends useableItem {

    use() {
        this.usingPlayer.movementSpeed =+ 10;
    }
}
export class remoteBombKit extends useableItem {
    
    

    use() {
         this.usingPlayer.inventory = new remote("2d",this.inventorySpaceX,this.inventorySpaceY,40,30);
         new remoteBomb("2d",this.usingPlayer.xPos,this.usingPlayer.yPos,40,30);
         
        }
}
export class remote extends useableItem {
    connectedBomb: remoteBomb

    use() {

    }
}
export class remoteBomb  extends useableItem {
    trigger:remote;
}

}
export class magicHat extends useableItem {}
export class sensorBomb extends useableItem {}
export class springToGo extends useableItem {}
export class spring extends useableItem {}
export class nuke extends useableItem {}
export class laserGun extends useableItem {}
export class portableHole extends useableItem {}


