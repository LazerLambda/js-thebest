export class Player{
    context : any;
    canvas : any;

    xPos : number;
    yPos : number;

    constructor(context :any){

        this.xPos = 0;
        this.yPos = 0;

        this.xOld = this.xPos;
        this.yOld = this.yOld;

        this.canvas = <HTMLCanvasElement>document.getElementById("game-layer");
        this.context = this.canvas.getContext("2d");
        document.addEventListener("keydown", e => {
        

            switch(e.key){
                case 'ArrowUp'      : --this.yPos; this.drawPlayer; break;
                case 'ArrowDown'    : ++this.yPos; this.drawPlayer; break;
                case 'ArrowRight'   : ++this.xPos; this.drawPlayer; break;
                case 'ArrowLeft'    : --this.xPos; this.drawPlayer; break;
            }
            
        });
    }

    drawPlayer(){
        this.context.clearRect(0,0 , 480,480);
        this.context.fillStyle = "red";
        this.context.fillRect(this.xPos, this.yPos, 50, 50);
    }
}