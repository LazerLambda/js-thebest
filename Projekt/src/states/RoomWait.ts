import { GameState } from "../GameState";

export class RoomWait {
  gameState: GameState;
  context: any;

  constructor(context: any, gameState: any) {
    this.context = context;
    this.gameState = gameState;
    this.context.fillStyle = "orange";
    this.context.fillRect(0, 0, 480, 480);
  }

  /**
   * @description
   * update this class
   */
  updateRoomWait() {}
  /**
   * @description
   * draw this class
   */
  drawRoomWait() {
    this.context.fillStyle = "orange";
    this.context.fillRect(0, 0, 480, 480);
  }
}
