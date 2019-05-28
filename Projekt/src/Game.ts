
import * as SGE from './StaticGameElement';


export class Game{

    context : any;
    frameTime : number;
    then : number;

    field : SGE.StaticGameElement[];


    constructor(){
        const canvas = <HTMLCanvasElement>document.getElementById('canvasId');
        this.context = canvas.getContext('2d');
        new SGE.StaticGameElement(1,1, this.context).draw();
        new SGE.StaticGameElement(1,2, this.context).draw();
        new SGE.StaticGameElement(2,1, this.context).draw();
        
        const fieldSize_X : number = 50;
        const fieldSize_Y : number = 25;

        for(let i = 0; i < fieldSize_X; i++){
            for(let j = 0; j < fieldSize_Y; j++){

            }
        }
    }

    
    startAnimating(targetFPS : number) {
        this.frameTime = 1000 / 2;
        this.then = window.performance.now();
        this.animate(this.then);
    }
    
    animate(currentTime: number) {
        window.requestAnimationFrame(this.animate.bind(this));
        const now = currentTime;
        const elapsed = now - this.then;

    if (elapsed > this.frameTime) {
        this.then = now;

      }
    }
 
}