export class Editor {
  context: any;
  constructor(context: any) {
    this.context = context;
    this.context.clearRect(0, 0, 480, 480);
    this.context.fillStyle = "red";
    this.context.fillRect(0, 0, 480, 480);
  }

  update() {}
}
