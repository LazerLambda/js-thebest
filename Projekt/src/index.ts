import {StaticGameElement} from './StaticGameElement';
import {Game} from './Game';
/*
class Game{
    frameTime : number;
    then : number;

    
    startAnimating(targetFPS : number) {
        this.frameTime = 1000 / 2;
        this.then = window.performance.now();
        this.animate(this.then);

        //var test = new StaticGameElement(1,1);
    }
    
    animate(currentTime: number) {
    window.requestAnimationFrame(this.animate.bind(this));

    const now = currentTime;
    const elapsed = now - this.then;

    if (elapsed > this.frameTime) {
        this.then = now;
      }
    }
 
}*/

new Game();
