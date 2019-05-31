import { Field } from "./Field";

export class Game {
  context: any;
  frameTime: number;
  then: number;

  constructor() {
    const canvas = <HTMLCanvasElement>document.getElementById("canvasId");
    this.context = canvas.getContext("2d");

    /**
     * Init field
     */
    const field = new Field();
    field.drawField();
  }

  startAnimating(targetFPS: number) {
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
