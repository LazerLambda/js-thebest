import { GameState } from "./GameState";

export class UserHasLeft {
  context: any;
  userName: string;
  gameState: GameState;

  fadingBound: number = 100;
  divider: number = 2;
  fadingCounter: number = 1;
  constructor(context: any, userName: string, gameState: GameState) {
    this.context = context;
    this.userName = userName;
    this.gameState = gameState;
  }

  updateUserHasLeft() {
    if (this.fadingCounter < this.fadingBound) {
      this.fadingCounter++;
      if (this.fadingCounter % 20 === 0) {
        this.divider++
      }
    } else {
      this.gameState.userhasleft = null;
    }
  }

  drawUserHasLeft() {
    this.context.globalAlpha = 1.0 / this.divider;
    this.context.fillStyle = "grey";
    this.context.fillRect(0, 0, 480, 480);
    this.context.globalAlpha = 1.0;         // evtl. alpha dynamisch anpassen
    this.context.fillStyle = "blue";
    this.context.font = "50px Arial";
    this.context.fillText(this.userName + "\n has left the Game", 25, 200);
    this.context.globalAlpha = 1.0;
  }
}
