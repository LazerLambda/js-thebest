import { Field } from './Field';
import { Player } from './Player';

export class Game {
  frameTime: number;
  then: number;

  field : Field;
  player : Player[];

  constructor() {

    this.field = new Field();
    this.player = this.field.returnPlayer();
    
    this.startAnimating(200);
  }

  game(gameState : object){

  }

  startAnimating(targetFPS: number) {
    this.frameTime = 1000 / 60;
    this.then = window.performance.now();
    this.animate(this.then);
  }

  animate(currentTime: number) {
    window.requestAnimationFrame(this.animate.bind(this));
    const now = currentTime;
    const elapsed = now - this.then;

    if (elapsed > this.frameTime) {
      this.then = now;

      for(let elem of this.field.items){
        elem.draw();
      }
      for(let elem of this.player){
        elem.renderPlayer()
        elem.drawPlayer();
      }
    }
  }
}
