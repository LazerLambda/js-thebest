import { GameState } from "./GameState";
import { Player } from "./Player";
import {Consts} from "./Consts";

export class Game {
  frameTime: number;
  then: number;

  field: GameState;
  player: Player[];
  playerNr: any;

  game: any;

  constructor() {
    this.game = new GameState();
    this.startAnimating(Consts.ANIMATION);
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

      this.game.update();
      this.game.draw();
    }
  }
}
