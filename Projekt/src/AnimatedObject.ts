import { Player } from "./Player";
import { Bomb } from "./FieldObj";

let imgGopher: any = new Image();
imgGopher.src = "animations/gopher.png";
imgGopher.onload = function(){
  init();
}

let imgTux: any = new Image();
imgTux.src = "animations/tux.png";
imgTux.onload = function(){
  init();
}

let imgRust: any = new Image();
imgRust.src = "animations/rust.png";
imgRust.onload = function(){
  init();
}

let imgClippy: any = new Image();
imgClippy.src = "animations/clippy.png";
imgClippy.onload = function(){
  init();
}



let imgBomb: any = new Image();
imgBomb.src = "animations/bomb.png";
imgBomb.onload = function() {
  init();
};

function init() {
  this.startAnimating(200);
}

export class AnimatedObject {
  image: any;

  context: any;

  spriteWidthPlayer: number = 100;
  spriteHeightPlayer: number = 100;
  cycleLoopPlayer = [0, 1, 0, 2];


  spriteWidthBomb: number = 500;
  spriteHeightBomb: number = 500;
  cycleLoopBomb = [0, 1, 0, 1];

  currentLoopIndex: number = 0;
  frameCount: number = 0;
  player: Player;
  bomb: Bomb;

  playerSprite: any;


  constructor(player: Player) {
    this.player = player;
  }

  animatePlayer(spriteSheetNumber: number, canvasX: number, canvasY: number, playerNumber: number) {
    switch (playerNumber) {
      case 1:
        this.playerSprite = imgRust;
        break;
      case 2:
        this.playerSprite = imgTux;
        break;
      case 3:
        this.playerSprite = imgGopher;
        break;
      case 4:
        this.playerSprite = imgClippy;
        break;
    }

    if (this.player.running) {
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
        this.playerSprite,
        spriteSheetNumber * this.spriteWidthPlayer,
        this.cycleLoopPlayer[this.currentLoopIndex] * this.spriteHeightPlayer,
        this.spriteWidthPlayer,
        this.spriteHeightPlayer,
        canvasX,
        canvasY,
        this.player.field.xSize,
        this.player.field.ySize
      );
    } else {
      this.player.context.drawImage(
        this.playerSprite,
        spriteSheetNumber * this.spriteWidthPlayer,
        0 * this.spriteHeightPlayer,
        this.spriteWidthPlayer,
        this.spriteHeightPlayer,
        canvasX,
        canvasY,
        this.player.field.xSize,
        this.player.field.ySize
      );
    }
  };
}

/*
animateBomb() {
 if (this.bomb.explode) {
   const x = this.bomb.x * this.bomb.SIZE_X;
   const y = this.bomb.y * this.bomb.SIZE_Y;

   this.context.drawImage(
     imgBomb,
     0,
     this.cycleLoopBomb[this.currentLoopIndex] * this.spriteHeightBomb,
     this.spriteWidthBomb,
     this.spriteHeightBomb,
     x - 10,
     y - 10,
     this.bomb.SIZE_X,
     this.bomb.SIZE_Y
   );
   this.currentLoopIndex++;
   if (this.currentLoopIndex >= this.cycleLoopBomb.length) {
     this.currentLoopIndex = 0;
   }
 } else {
   const x = this.bomb.x * this.bomb.SIZE_X;
   const y = this.bomb.y * this.bomb.SIZE_Y;

   this.context.drawImage(
     imgBomb,
     0,
     this.cycleLoopBomb[this.currentLoopIndex] * this.spriteHeightBomb,
     this.spriteWidthBomb,
     this.spriteHeightBomb,
     x,
     y,
     this.bomb.SIZE_X,
     this.bomb.SIZE_Y
     );
   this.currentLoopIndex++;
   if (this.currentLoopIndex >= this.cycleLoopBomb.length) {
     this.currentLoopIndex = 0;
   }
 }
}
*/
