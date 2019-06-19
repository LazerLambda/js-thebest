//import * as Player from "./Player";

export class Game {
  player: Player[] = [];

  constructor(
    player0: Player,
    player1: Player,
    player2: Player,
    player3: Player
  ) {
    this.player.push(player0);
    this.player.push(player1);
    this.player.push(player2);
    this.player.push(player3);

    console.log("Game initialized"); //debug

    for (let x of this.player) {
      x.socket.emit("message", "S_ready");
    }
  }
}

export class Player {
  socket: any;
  name: string;
  constructor(name: string, socket: any) {
    this.socket = socket;
    this.name = name;

    socket.on("disconnect", function(socket: any) {
      console.log("user disconnected");
      // connList.filter(item => item !== socket);
    });
  }
}
