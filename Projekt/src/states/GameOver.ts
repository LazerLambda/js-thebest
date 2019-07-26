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
    this.context.fillStyle = "#ffe1a5";
    this.context.fillRect(0, 0, 480, 480);
    this.context.globalAlpha = 1.0;
    this.context.fillStyle = "#e44b43";
    this.context.font = "50px Krungthep";
    this.context.fillText("GameOver", 100, 200);
  }
}
