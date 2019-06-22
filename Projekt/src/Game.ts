import { GameState } from './GameState';
import { Player } from './Player';
import { Hallway } from './Item';
import * as io from 'socket.io-client';

export class Game {
  frameTime: number;
  then: number;

  field : GameState;
  player : Player[];

  constructor() {
    const socket: any = io("http://localhost:3000");
    io.emit("S ready");

    this.field = new GameState();
    this.player = this.field.returnPlayer();
    this.field.updateGameInfos();
    
    this.startAnimating(200);
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

      this.field.update();
      this.field.drawGame();
    }
  }

}

