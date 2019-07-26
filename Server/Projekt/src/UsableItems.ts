import { Player } from "./Player";
import { Explosion } from "./Explosion";
import { FieldObj, Bomb, Hallway, Hole } from "./FieldObj";
import {Consts} from "./Consts";

export class useableItem {
defaultName : string = "Item 0"
playerOn: Player = null;
usingPlayer: Player = null;
static: boolean = false;  // der Spieler kann das Item aufnehmen | nicht aufnehmen
context: CanvasRenderingContext2D;
SIZE_X: number;
SIZE_Y: number;

x: number;  //koordinaten
y: number;



spriteWidth: number = 40;
spriteHeight: number = 30;

constructor(
    context: CanvasRenderingContext2D,
    //xPos: number,
    //yPos: number,
    //xSize: number,
    //ySize: number
  ) {
    this.context = context;

    //this.x = xPos;
    //this.y = yPos;

    //this.SIZE_X = xSize;
    //this.SIZE_Y = ySize;
  }



  draw() {
    const x = this.x * this.SIZE_X;
    const y = this.y * this.SIZE_Y;
    this.context.fillStyle = "blue";
    this.context.fillRect(x, y, this.SIZE_X, this.SIZE_Y);
  }

  use() {} //wird in jeder Unterklasse überschrieben



}


export class armor extends useableItem {

    use() {
        this.usingPlayer.hitPoints =+1;
        this.usingPlayer.inventory = null;
    }
}
export class shoes extends useableItem {

    use() {
        this.usingPlayer.movementSpeed =+ 10;
        this.usingPlayer.inventory = null;
    }
}

//bombe mit Fernzünder
export class remoteBombKit extends useableItem {
    trigger: remote;
    
    use() {
         //this.trigger = new remote("2d",this.inventorySpaceX,this.inventorySpaceY,40,30);
         this.usingPlayer.inventory = this.trigger;
         new remoteBomb(this.context,this.usingPlayer.xPos,this.usingPlayer.yPos,40,30,this.trigger);
         
        }
}
//Fernzünder
export class remote extends useableItem {
    connectedBomb: remoteBomb

    use() {
      //  this.connectedBomb.explode();
        this.usingPlayer.inventory = null;
    }
}
//Bombe die auf das Fernzündersignal wartet
export class remoteBomb extends useableItem {
    trigger:remote;
    static = true;

    constructor(
        context: CanvasRenderingContext2D,
        xPos: number,
        yPos: number,
        xSize: number,
        ySize: number,
        RemoteControl:remote
        ) {
        super(context) //xPos, yPos, xSize, ySize);
        this.trigger = RemoteControl;

    }
}

//spieler wird für alle anderen Spiler unsichbar für 5 sec
export class magicHat extends useableItem { 

    use(){
          
        this.usingPlayer.visible = false ;
        this.usingPlayer.inventory = null;
    
    }
}
 // Bombe explodiert erst wenn sich ein Spieler in den Wirkungsbreeich bewegt
export class sensorBomb extends useableItem {

       
     use() {

     }
}
// plazierbare Sprungfederfalle die Spieler auf ein zufälliges Feld verschiebt
export class springToGo extends useableItem {

    use(){
        fields[this.playerOn.xPos][this.playerOn.yPos].itemOn =  new spring(
            this.context,
            this.playerOn.xPos,
            this.playerOn.yPos,
            40,
            40);
            this.usingPlayer.inventory = null;
    }
         
    
}
class possibleLandingSpot {
    x:Number;
    y:Number;

    constructor (x:Number,y:Number) {
        this.x = x;
        this.y = y;
    }
}
// Sprungfederfalle
export class spring extends FieldObj {
 PLS: possibleLandingSpot[] = [];
   
 getPossibleLandingSpots(){
        for (let i  = 0;i <= Consts.ARRAY_CONST;i++){ // höchste x Koordinate
            for (let j  = 0;i <= Consts.ARRAY_CONST;i++){ //höchste y Koordinate
                var pos = this.x + this.y * Consts.ARRAY_CONST;                          // dynamisch machen
                this.playerOn.forEach(e => {
                    if (e.field.field[pos] instanceof Hallway|| 
                        e.field.field[pos] instanceof Hole){
                        this.PLS.push(new possibleLandingSpot(i,j));
                    }
                })

        }

    }
}  
    update() {
        if (this.playerOn != null){
                 this.getPossibleLandingSpots();
                 var x = Math.floor(Math.random()*(this.PLS.length - 1));
                 var test : number = <number> this.PLS[x].x * <number> this.PLS[x].y * Consts.ARRAY_CONST; // dynamisch machen
                 this.playerOn.forEach(e => {
                    e.onItem = <FieldObj> e.field.field[test];
                 });
                 
            
        }

    }   
}   
    

// Bombe mit größerem Radius
export class nuke extends Bomb {

    use() {
         
    }
}
//Spieler fügt allen gegnern in einer geraden Linie Schaden zu
export class laserGun extends useableItem {
     

    use() {switch (this.playerOn.direction) {
        case this.playerOn.direction = 0: {
           
     
          break;
        }
        case this.playerOn.direction = 1: {
          
          break;
        }
        case this.playerOn.direction = 2: {

           break;
        }
        case this.playerOn.direction = 3: {
        
          break;
        }
      }
    this.usingPlayer.inventory = null;
    
}
         
    }

//plazierbares Hole-Feld
export class portableHole extends useableItem {

    use() {
        switch (this.playerOn.direction) {
            case this.playerOn.direction = 0: {
                if (this.usingPlayer.field.field[this.playerOn.xPos][this.playerOn.yPos-1].fieldtype = HALLWAY){ //check ob zielfeld frei ist
                    this.usingPlayer.field.field[this.playerOn.xPos][this.playerOn.yPos-1].fieldtype = HOLE;}    //typ von zielfeld wird in Hole geändert
              break;
            }
            case this.playerOn.direction = 1: {
                if (this.usingPlayer.field.field[this.playerOn.xPos+1][this.playerOn.yPos].fieldtype = HALLWAY){
                    this.usingPlayer.field.field[this.playerOn.xPos+1][this.playerOn.yPos].fieldtype = HOLE;}
              break;
            }
            case this.playerOn.direction = 2: {
                if (this.usingPlayer.field.field[this.playerOn.xPos][this.playerOn.yPos+1].fieldtype = HALLWAY){
                    this.usingPlayer.field.field[this.playerOn.xPos][this.playerOn.yPos+1].fieldtype = HOLE;}
              break;
            }
            case this.playerOn.direction = 3: {
                if (this.usingPlayer.field.field[this.playerOn.xPos-1][this.playerOn.yPos].fieldtype = HALLWAY){
                    this.usingPlayer.field.field[this.playerOn.xPos-1][this.playerOn.yPos].fieldtype = HOLE;}
              break;
            }
          }
        this.usingPlayer.inventory = null;
        
    }
}
//spieler plaziert zwei teilbomben -> alle felder auf dem kürzesten Weg explodieren
export class chainBomb extends useableItem {

    use() {
         
    }
}


