import { Player } from "./Player";
import { Bomb } from "./FieldObj";
import { Fire } from "./Fire";

enum PlayerSprite {
  RUST = 1,
  TUX = 2,
  GOPHER = 3,
  CLIPPY = 4
}

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

let imgFire: any = new Image();
imgFire.src = "animations/fire.png";
imgFire.onload = function() {
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
  playerSprite: any;

  spriteWidthBomb: number = 500;
  spriteHeightBomb: number = 500;
  cycleLoopBomb = [0, 1, 0, 1];

  spriteWidthFire: number = 500;
  spriteHeightFire: number = 500;
  cycleLoopFire = [0, 1, 2, 3];

  currentLoopIndex: number = 0;
  frameCount: number = 0;

  player: Player;
  bomb: Bomb;
  fire: Fire;

  constructor(object: any) {
    if (object instanceof Player) {
      this.player = object;
    }
    if (object instanceof Fire) {
      this.fire = object;
    }
    if (object instanceof Bomb) {
      this.bomb = object;
    }
  }

  frameCounter(time: number) {
    if (this.frameCount <= 4 * time) {
      if (this.frameCount % time === 0) {
        this.currentLoopIndex++;
        if (this.currentLoopIndex >= this.cycleLoopFire.length) {
          this.currentLoopIndex = 0;
        }
      }
    } else {
      this.frameCount = 0;
    }
    ++this.frameCount;
  }

  animatePlayer(spriteSheetNumber: number, canvasX: number, canvasY: number, playerNumber: number) {
    switch (playerNumber) {
      case PlayerSprite.RUST:
        this.playerSprite = imgRust;
        break;
      case PlayerSprite.TUX:
        this.playerSprite = imgTux;
        break;
      case PlayerSprite.GOPHER:
        this.playerSprite = imgGopher;
        break;
      case PlayerSprite.CLIPPY:
        this.playerSprite = imgClippy;
        break;
    }

    if (this.player.running) {
      this.frameCounter(1);

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
  }

  animateBomb() {
    const x = this.bomb.x * this.bomb.SIZE_X;
    const y = this.bomb.y * this.bomb.SIZE_Y;

    if (this.bomb.explode) {
      this.frameCounter(2);
   
      this.bomb.context.drawImage(
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
    } else {
      this.frameCounter(2);
   
      this.bomb.context.drawImage(
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
      }
   }

   animateFire() {
    const x = this.fire.xPos * this.fire.xSize;
    const y = this.fire.yPos * this.fire.ySize;

    this.frameCounter(4);

    this.fire.context.drawImage(
      imgFire,
      0,
      this.cycleLoopFire[this.currentLoopIndex] * this.spriteHeightFire,
      this.spriteWidthFire,
      this.spriteHeightFire,
      x,
      y,
      this.fire.xSize,
      this.fire.ySize
    );
   }
}




