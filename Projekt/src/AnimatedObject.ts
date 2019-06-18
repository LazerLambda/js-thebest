import { Player } from "./Player";

let img : any = new Image();
img.src = 'http://tsgk.captainn.net/sheets/nes/bomberman2_various_sheet.png';
img.onload = function() {
  init();
}

function init() {
  this.startAnimating(200);
}

export class AnimatedObject {

  context: any;

  spriteWidth: number = 28;
  spriteHeight: number = 30;
  cycleLoopPlayer = [0, 1, 0, 2];
  currentLoopIndex: number = 0;
  frameCount: number = 0;
  player: Player;

  constructor(player: Player) {
    this.player = player;
  }

  animate(frameX: number, canvasX: number, canvasY: number) {
    if(this.player.running) {
      let time = 1; // Zeit für Bildwechsel in der Animation
      if (this.frameCount <= 4 * time) {
        if (this.frameCount % time === 0) {
          this.currentLoopIndex++;
          if (this.currentLoopIndex >= this.cycleLoopPlayer.length) {
            this.currentLoopIndex = 0;
          }
        }
      } else {
      this.frameCount = 0;
      }
      ++this.frameCount;
      
      this.player.context.drawImage(
        img,
        frameX * this.spriteWidth,
        this.cycleLoopPlayer[this.currentLoopIndex] * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        canvasX,
        canvasY,
        this.player.field.xSize,
        this.player.field.ySize
      );
    } else {
      this.player.context.drawImage(
        img,
        frameX * this.spriteWidth,
        0 * this.spriteHeight,
        this.spriteWidth,
        this.spriteHeight,
        canvasX,
        canvasY,
        this.player.field.xSize,
        this.player.field.ySize
      );
    }
    
  }
}
