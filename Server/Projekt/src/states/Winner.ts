export class Winner {
  context: any;
  constructor(context: any) {
    this.context = context;
  }

  /**
   * @description
   * update this class
   */
  updateWinner() {}

  /**
   * @description
   * draw this class
   */
  drawWinner() {
    this.context.globalAlpha = 0.5;
    this.context.fillStyle = "#ffe1a5";
    this.context.fillRect(0, 0, 480, 480);
    this.context.globalAlpha = 1.0;
    this.context.fillStyle = "#e44b43";
    this.context.font = "50px Krungthep";
    this.context.fillText("You win", 130, 200);
  }
}
