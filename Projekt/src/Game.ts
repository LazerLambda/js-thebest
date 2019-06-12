import { Explosion } from './Explosion';
import { GameState } from './GameState';
import { Player } from './Player';
import { Hallway } from './Item';

export class Game {
  explosions : Explosion[] = [];
  frameTime: number;
  then: number;

  field : Field;
  player : Player[];

  constructor() {

    this.field = new GameState();
    this.player = this.field.returnPlayer();
    this.field.updateGameInfos();
    
    this.startAnimating(200);
  }

  update(){
    for(let i = 0; i < this.field.items.length; i++){
      if(this.field.items[i] instanceof Hallway){
        var tmpItem = <Hallway> this.field.items[i];
        if(tmpItem.bombOnItem !== null){
          if(tmpItem.bombOnItem.explode){
            this.explosions.push(new Explosion(tmpItem, this.field));
          }
        }
      }
    }
    for(let elem of this.explosions){
      elem.update();
    }
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

      this.update();
      for(let elem of this.field.items){
        elem.update();
        elem.draw();
      }
      for(let elem of this.player){
        elem.renderPlayer()
        elem.step();
      }
    }
  }

}
