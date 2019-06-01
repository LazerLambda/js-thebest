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
    const field = new Field();
    field.drawField();

    this.player = new Player(this.context);
    
    this.startAnimating(200);
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

      this.player.drawPlayer();
    }
  }
}
