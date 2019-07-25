export class GameOver {
  context: any;
  constructor(context: any) {
    this.context = context;
  }

  /**
   * @description
   * update this class
   */
  updateGameOver() {}

  /**
   * @description
   * draw this class
   */
  drawGameOver() {
    this.context.globalAlpha = 0.5;
    this.context.fillStyle = "grey";
    this.context.fillRect(0, 0, 480, 480);
    this.context.globalAlpha = 1.0;
    this.context.fillStyle = "red";
    this.context.font = "50px Arial";
    this.context.fillText("GameOver", 100, 200);
  }
}
