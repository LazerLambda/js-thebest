import { GameState } from "../GameState";

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

  /**
   * @description
   * update this class
   */
  public updateUserHasLeft(): void {
    if (this.fadingCounter < this.fadingBound) {
      this.fadingCounter++;
      if (this.fadingCounter % 20 === 0) {
        this.divider++;
      }
    } else {
      this.gameState.userhasleft = null;
    }
  }

  /**
   * @description
   * draw this class
   */
  public drawUserHasLeft() {
    this.context.globalAlpha = 1.0 / this.divider;
    this.context.fillStyle = "#ffe1a5";
    this.context.fillRect(0, 0, 480, 480);
    this.context.globalAlpha = 1.0;         // evtl. alpha dynamisch anpassen
    this.context.fillStyle = "#e44b43";
    this.context.font = "50px Krungthep";
    this.context.fillText(this.userName + "\n has left the Game", 25, 200);
    this.context.globalAlpha = 1.0;
  }
}
