import {Field} from './Field';
import { Item } from './Item';

export class Player{
    running : boolean;
    direction : number;
    context : any;
    canvas : any;
    onItem : Item;
    field : Field;

    xPos : number;
    yPos : number;

    constructor(context :any){

        this.xPos = 0;
        this.yPos = 0;

        this.field = null;
        this.onItem = null;

        this.canvas = <HTMLCanvasElement>document.getElementById("game-layer");
        this.context = this.canvas.getContext("2d");
        document.addEventListener("keydown", e => {
        

            switch(e.key){
                case 'ArrowUp'      : --this.yPos; this.checkCollide(); this.drawPlayer; break;
                case 'ArrowDown'    : ++this.yPos; this.drawPlayer; break;
                case 'ArrowRight'   : ++this.xPos; this.drawPlayer; break;
                case 'ArrowLeft'    : --this.xPos; this.drawPlayer; break;
            }
            
        });
    }

    setPlayer(item: Item){
        item.playerOn = this;
        this.onItem = item;
        this.xPos = item.x;
        this.yPos = item.y;
    }

    setField(field : Field){
        this.field = field;
    }


    /*Test*/
    checkCollide(){
        // Auf null checken
        var height = this.field.height;
        var width = this.field.width;

        var x = this.onItem.x - 1;
        var y = this.onItem.y;

        var pos = (y * 8) + x;
        var tmpItem = this.onItem;
        this.onItem = this.field.items[pos];
        this.onItem.playerOn = this;
        tmpItem.playerOn = null;

    }

    drawPlayer(){
        this.context.clearRect(0,0 , 480,480);
        this.context.fillStyle = "red";
        this.context.fillRect(this.onItem.x * 8, this.onItem.y * 8, 50, 50);
    }
}