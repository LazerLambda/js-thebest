import { GameState } from "./GameState";
import { timingSafeEqual } from "crypto";
import { ClientHttp2Session } from "http2";

export class Startpage {
  gameState: GameState;
  context: any;
  canvas: HTMLCanvasElement;

  name: string = "";

  button1_X_start: number = 50;
  button1_X_length: number = 100;
  button1_Y_start: number = 375;
  button1_Y_length: number = 40;

  button2_X_start: number = 300;
  button2_X_length: number = 100;
  button2_Y_start: number = 375;
  button2_Y_length: number = 40;

  mouseOverButton1: boolean = false;
  mouseOverButton2: boolean = false;

  constructor(context: any, gameState: GameState) {
    this.context = context;
    this.gameState = gameState;

    this.canvas = <HTMLCanvasElement>document.getElementById("background");
    //document.addEventListener("keyup", this.eventFunction.bind(this));
    document.addEventListener("mousemove", this.buttonEvents.bind(this));
    document.addEventListener("mousedown", this.buttonClick.bind(this));
    document.addEventListener("keyup", this.nameFunction.bind(this));
  }

  nameFunction(e: any) {
    
    if ("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".includes(e.key)) {
      this.name += e.key;
    }
    if(e.key === 'Backspace'){
      console.log(e.key);
      this.name = this.name.substring(0, this.name.length - 1);
    }
  }

  buttonClick(e: any) {
    var rect = this.canvas.getBoundingClientRect();

    // Game Start
    if (
      this.onButton1(e.clientX - rect.left, e.clientY - rect.top) &&
      this.gameState.state === 0
    ) {
      this.gameState.socket.emit("mode", "game");
      if (!this.gameState.socket.connected) {
        alert("Connection Error\n\t'->Maybe Server isn't running");
      }
      this.gameState.initWaitPageGame();
      document.removeEventListener("keyup", this.nameFunction);
      this.gameState.playerName = this.name;
      this.gameState.startpage = null;
    }

    // Editor Start
    if (
      this.onButton2(e.clientX - rect.left, e.clientY - rect.top) &&
      this.gameState.state === 0
    ) {
      this.gameState.socket.emit("mode", "editor");
      if (!this.gameState.socket.connected) {
        alert("Connection Error\n\t'->Maybe Server isn't running");
      }
      this.gameState.initEditor();
      document.removeEventListener("keyup", this.nameFunction);
      this.gameState.playerName = this.name;
      this.gameState.startpage = null;
    }
  }

  buttonEvents(e: any) {
    var rect = this.canvas.getBoundingClientRect();
    if (this.onButton1(e.clientX - rect.left, e.clientY - rect.top)) {
      console.log("sdf");
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

  onButton1(x: number, y: number): boolean {
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

  onButton2(x: number, y: number): boolean {
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

  eventFunction(e: any) {
    {
      if (e.key === "y" && this.gameState.state === 0) {
        this.gameState.socket.emit("mode", "game");
        if (!this.gameState.socket.connected) {
          alert("Connection Error\n\t'->Maybe Server isn't running");
        }
        this.gameState.initWaitPageGame();
        document.removeEventListener("keyup", this.eventFunction);
        this.gameState.startpage = null;
      }
      if (e.key === "x" && this.gameState.state === 0) {
        this.gameState.socket.emit("mode", "editor");
        if (!this.gameState.socket.connected) {
          alert("Connection Error\n\t'->Maybe Server isn't running");
        }
        this.gameState.initEditor();
        document.removeEventListener("keyup", this.eventFunction);
        this.gameState.startpage = null;
      }
    }
  }

  update() {}

  draw() {
    this.context.fillStyle = "yellow";
    this.context.fillRect(0, 0, 480, 480);
    this.context.fillStyle = "blue";
    this.context.font = "30px Mistral";
    this.context.fillText("Editor x Start y", 100, 50);

    if (this.mouseOverButton1) {
      this.context.fillStyle = "blue";
    } else {
      this.context.fillStyle = "red";
    }
    this.context.fillRect(
      this.button1_X_start,
      this.button1_Y_start,
      this.button1_X_length,
      this.button1_Y_length
    );
    this.context.fillStyle = "green";
    this.context.fillText(
      "Game",
      this.button1_X_start + 30,
      this.button1_Y_start + 35
    );

    if (this.mouseOverButton2) {
      this.context.fillStyle = "blue";
    } else {
      this.context.fillStyle = "red";
    }
    this.context.fillRect(
      this.button2_X_start,
      this.button2_Y_start,
      this.button2_X_length,
      this.button2_Y_length
    );
    this.context.fillStyle = "green";
    this.context.fillText(
      "Editor",
      this.button2_X_start + 30,
      this.button2_Y_start + 35
    );

    this.context.fillStyle = "red";
    this.context.font = "20px Mistral";
    this.context.fillText("Name: " + this.name, 100, 300);
  }
}
