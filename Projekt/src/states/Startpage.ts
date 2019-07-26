import { GameState } from "../GameState";

enum serverState {
  SELECTION = 0,
  ROOM_WAIT = 1,
  DESIGN = 2,
  FIELD_WAIT = 3,
  GAME = 4,
  GAMEOVER = 5,
  WINNER = 6
}

export class Startpage {
  // states
  gameState: GameState;
  context: any;
  canvas: HTMLCanvasElement;

  name: string = "";

  mouseOverButton1: boolean = false;
  mouseOverButton2: boolean = false;

  // consts

  button1_X_start: number = 50;
  button1_X_length: number = 150;
  button1_Y_start: number = 375;
  button1_Y_length: number = 50;

  button2_X_start: number = 300;
  button2_X_length: number = 150;
  button2_Y_start: number = 375;
  button2_Y_length: number = 50;

  constructor(context: any, gameState: GameState) {
    this.context = context;
    this.gameState = gameState;

    this.canvas = <HTMLCanvasElement>document.getElementById("background");
    document.addEventListener("mousemove", this.buttonEvents.bind(this));
    document.addEventListener("mousedown", this.buttonClick.bind(this));
    document.addEventListener("keyup", this.nameFunction.bind(this));
  }

  /**
   * Methode um die Tastatureingabe aufzunehmen
   * @param e any Event
   */
  private nameFunction(e: any): void {
    if (
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".includes(
        e.key
      )
    ) {
      this.name += e.key;
    }
    if (e.key === "Backspace") {
      this.name = this.name.substring(0, this.name.length - 1);
    }
  }

  /**
   * @description
   * Methode, um clicks auf den Buttons zu verarbeiten
   * @param e any Event
   */
  private buttonClick(e: any): void {
    var rect = this.canvas.getBoundingClientRect();

    // Game Start
    if (
      this.onButton1(e.clientX - rect.left, e.clientY - rect.top) &&
      this.gameState.state === serverState.SELECTION
    ) {
      this.gameState.socket.emit("mode", "game");
      if (!this.gameState.socket.connected) {
        alert("Connection Error\n\t'->Maybe Server isn't running");
      }
      this.gameState.initWaitPage(false);
      document.removeEventListener("keyup", this.nameFunction);
      this.gameState.playerName = this.name;
      this.gameState.startpage = null;
    }

    // Editor Start
    if (
      this.onButton2(e.clientX - rect.left, e.clientY - rect.top) &&
      this.gameState.state === serverState.SELECTION
    ) {
      this.gameState.socket.emit("mode", "editor");
      if (!this.gameState.socket.connected) {
        alert("Connection Error\n\t'->Maybe Server isn't running");
      }
      this.gameState.initWaitPage(true);
      document.removeEventListener("keyup", this.nameFunction);
      this.gameState.playerName = this.name;
      this.gameState.startpage = null;
    }
  }

  /**
   * @description
   * Methode um die Zustände der Buttons zu verändern, wenn die Maus darübergeht.
   * @param e any Event
   */
  private buttonEvents(e: any): void {
    var rect = this.canvas.getBoundingClientRect();
    if (this.onButton1(e.clientX - rect.left, e.clientY - rect.top)) {
      this.mouseOverButton1 = true;
    } else {
      this.mouseOverButton1 = false;
    }
    if (this.onButton2(e.clientX - rect.left, e.clientY - rect.top)) {
      this.mouseOverButton2 = true;
    } else {
      this.mouseOverButton2 = false;
    }
  }

  /**
   * @description
   * Überprüfung, ob Maus über Button1 ist
   * @param x number x Koordinate
   * @param y number y Koordinate
   * @return boolean
   */
  private onButton1(x: number, y: number): boolean {
    if (
      x >= this.button1_X_start &&
      this.button1_X_start + this.button1_X_length >= x &&
      y >= this.button1_Y_start &&
      this.button1_Y_start + this.button1_Y_length >= y
    ) {
      return true;
    }
    return false;
  }

  /**
   * @description
   * Überprüfung, ob Maus über Button2 ist
   * @param x number x Koordinate
   * @param y number y Koordinate
   * @return boolean
   */
  private onButton2(x: number, y: number): boolean {
    if (
      x >= this.button2_X_start &&
      this.button2_X_start + this.button2_X_length >= x &&
      y >= this.button1_Y_start &&
      this.button2_Y_start + this.button2_Y_length >= y
    ) {
      return true;
    }
    return false;
  }

  private eventFunction(e: any): void {
    {
      if (e.key === "y" && this.gameState.state === serverState.SELECTION) {
        this.gameState.socket.emit("mode", "game");
        if (!this.gameState.socket.connected) {
          alert("Connection Error\n\t'->Maybe Server isn't running");
        }
        this.gameState.initWaitPage(false);
        document.removeEventListener("keyup", this.eventFunction);
        this.gameState.startpage = null;
      }
      if (e.key === "x" && this.gameState.state === serverState.SELECTION) {
        this.gameState.socket.emit("mode", "editor");
        if (!this.gameState.socket.connected) {
          alert("Connection Error\n\t'->Maybe Server isn't running");
        }
        this.gameState.initWaitPage(true);
        document.removeEventListener("keyup", this.eventFunction);
        this.gameState.startpage = null;
      }
    }
  }

  /**
   * @description
   * updates for this class
   */
  public update(): void {}

  /**
   * @description
   * draw this class
   */
  public draw(): void {
    this.context.fillStyle = "#fff2c6";
    this.context.fillRect(0, 0, 480, 480);
    this.context.fillStyle = "#e44b43";
    this.context.font = "30px Krungthep";
    this.context.fillText("Editor x Start y", 100, 50);

    if (this.mouseOverButton1) {
      this.context.fillStyle = "#ffe1a5";
    } else {
      this.context.fillStyle = "#ff9944";
    }
    this.context.fillRect(
      this.button1_X_start,
      this.button1_Y_start,
      this.button1_X_length,
      this.button1_Y_length
    );
    this.context.fillStyle = "#e44b43";
    this.context.fillText(
      "Game",
      this.button1_X_start + 30,
      this.button1_Y_start + 35
    );

    if (this.mouseOverButton2) {
      this.context.fillStyle = "#ffe1a5";
    } else {
      this.context.fillStyle = "#ff9944";
    }
    this.context.fillRect(
      this.button2_X_start,
      this.button2_Y_start,
      this.button2_X_length,
      this.button2_Y_length
    );
    this.context.fillStyle = "#e44b43";
    this.context.fillText(
      "Editor",
      this.button2_X_start + 30,
      this.button2_Y_start + 35
    );

    this.context.fillStyle = "#e44b43";
    this.context.font = "20px Krungthep";
    this.context.fillText("Name: " + this.name, 100, 300);
  }
}
