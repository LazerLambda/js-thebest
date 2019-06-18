import { Player } from "./Player";
import { Explosion } from "./Explosion";

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

//bombe mit Fernzünder
export class remoteBombKit extends useableItem {
    trigger: remote;
    
    use() {
         this.trigger = new remote("2d",this.inventorySpaceX,this.inventorySpaceY,40,30);
         this.usingPlayer.inventory = this.trigger;
         new remoteBomb("2d",this.usingPlayer.xPos,this.usingPlayer.yPos,40,30,this.trigger);
         
        }
}
//Fernzünder
export class remote extends useableItem {
    connectedBomb: remoteBomb

    use() {
        this.connectedBomb.explode();
    }
}
//Bombe die auf das Fernzündersignal wartet
export class remoteBomb  extends useableItem {
    trigger:remote;
    static = true;

    constructor(
        context: any,
        xPos: number,
        yPos: number,
        xSize: number,
        ySize: number,
        RemoteControl:remote
        ) {
        super(context, xPos, yPos, xSize, ySize);
        this.trigger = RemoteControl;

    }
}

//spieler wird für alle anderen Spiler unsichbar für 5 sec
export class magicHat extends useableItem { 

    use(){
          
        this.usingPlayer.visible = false ;
    
    }
}
 // Bombe explodiert erst wenn sich ein Spieler in den Wirkungsbreeich bewegt
export class sensorBomb extends useableItem {

       
     use() {

     }
}
// plazierbare Sprungfederfalle die Spieler auf ein zufälliges Feld verschiebt
export class springToGo extends useableItem {

    use() {
         
    }
}
// Sprungfederfalle
export class spring extends useableItem {

    use() {
         
    }
}
// Bombe mit größerem Radius
export class nuke extends useableItem {

    use() {
         
    }
}
//Spieler fügt allen gegener in einer geraden Linie Schaden zu
export class laserGun extends useableItem {

    use() {
         
    }
}
//plazierbares Hole-Feld
export class portableHole extends useableItem {

    use() {
         
    }
}


