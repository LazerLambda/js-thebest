
export class StaticGameElement{

    context : any;
    x : number;
    y : number;

    SIZE_X : number;
    SIZE_Y : number;  


    constructor(x: number, y: number, context: any){

        this.context = context;

        this.SIZE_X = 25;
        this.SIZE_Y = 25;

        this.x = x * this.SIZE_X;
        this.y = y * this.SIZE_Y;

        console.log("Hello from StaticGameElement");
    }

    draw(){
        this.context.fillStyle = 'black';
        this.context.fillRect(this.x, this.y, this.SIZE_X, this.SIZE_Y);
        // this.context.onclick = function(){
        //     console.log("Test");
        // }
    }


}