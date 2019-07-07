import { GameState } from "./GameState";

export class Startpage {
  gameState: GameState;
  context: any;
  constructor(context: any, gameState: GameState) {
    this.context = context;
    this.gameState = gameState;

    this.context.fillStyle = "yellow";
    this.context.fillRect(0, 0, 480, 480);
    this.context.fillStyle = "blue";
    this.context.font = "30px Arial";
    this.context.fillText("Player: " + "Editor x Start y", 100, 50);

    document.addEventListener("keyup", this.eventFunction.bind(this));
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
}
