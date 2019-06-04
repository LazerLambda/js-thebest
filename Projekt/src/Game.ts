import { Field } from './Field';
import { Player } from './Player';

export class Game {
  context: any;
  frameTime: number;
  then: number;

  field : Field;
  player : Player;

  constructor() {
    const canvas = <HTMLCanvasElement>document.getElementById("background");
    this.context = canvas.getContext("2d");

    /**
     * Init field
     */
    
    

    this.player = new Player(this.context);
    this.field = new Field(this.player);
    this.field.drawField();
    
    this.startAnimating(200);
  }

  game(gameState : object){

  }

  startAnimating(targetFPS: number) {
    this.frameTime = 10 / 2;
    this.then = window.performance.now();
    this.animate(this.then);
  }

  animate(currentTime: number) {
    window.requestAnimationFrame(this.animate.bind(this));
    const now = currentTime;
    const elapsed = now - this.then;

    if (elapsed > this.frameTime) {
      this.then = now;

      this.field.drawField();
      this.player.drawPlayer();
    }
  }
}
