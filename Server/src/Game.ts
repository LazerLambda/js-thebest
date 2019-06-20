import { stringify } from "querystring";
import { timingSafeEqual } from "crypto";

enum fieldType {
  HALLWAY = 0,
  WALL = 1,
  HOLE = 2,
  BRICK = 3
}

export class Game {
  GAMESIZE: number = 2;
  validGame: boolean = true;

  playerList: Player[] = [];

  io: any;
  roomName: string;
  constructor(io: any, roomName: string) {
    this.io = io;
    this.roomName = roomName;

    console.log("Game_initialized");
    io.of("/")
      .in(roomName)
      .clients((error: any, clients: any) => {
        if (error) throw error;

        // Returns an array of client IDs like ["Anw2LatarvGVVXEIAAAD"]
        // console.log(clients);
      });
  }

  addPlayer(socket: any, name: string): void {
    if (this.validGame) {
      var tmpPlayer = this.playerList.find(e => socket.id === e.socket.id);

      if (tmpPlayer !== undefined) {
        return;
      } else {
        this.playerList.push(new Player(name, socket));
      }
      console.log(this.playerList.length + " " + this.roomName);
    }
  }

  gameReady(): void {
    if (this.playerList.length === this.GAMESIZE) {
      var initialField: object = {
        field: [
          { y: 0, x: 0, state: fieldType.WALL },
          { y: 0, x: 1, state: fieldType.WALL },
          { y: 0, x: 2, state: fieldType.WALL },
          { y: 0, x: 3, state: fieldType.WALL },
          { y: 0, x: 4, state: fieldType.WALL },
          { y: 0, x: 5, state: fieldType.WALL },
          { y: 0, x: 6, state: fieldType.WALL },
          { y: 0, x: 7, state: fieldType.WALL },

          { y: 1, x: 0, state: fieldType.WALL },
          { y: 1, x: 1, state: fieldType.BRICK },
          { y: 1, x: 2, state: fieldType.HALLWAY },
          { y: 1, x: 3, state: fieldType.HALLWAY },
          { y: 1, x: 4, state: fieldType.WALL },
          { y: 1, x: 5, state: fieldType.HALLWAY },
          { y: 1, x: 6, state: fieldType.HALLWAY },
          { y: 1, x: 7, state: fieldType.WALL },

          { y: 2, x: 0, state: fieldType.WALL },
          { y: 2, x: 1, state: fieldType.WALL },
          { y: 2, x: 2, state: fieldType.WALL },
          { y: 2, x: 3, state: fieldType.HALLWAY },
          { y: 2, x: 4, state: fieldType.WALL },
          { y: 2, x: 5, state: fieldType.HALLWAY },
          { y: 2, x: 6, state: fieldType.WALL },
          { y: 2, x: 7, state: fieldType.WALL },

          { y: 3, x: 0, state: fieldType.WALL },
          { y: 3, x: 1, state: fieldType.HALLWAY },
          { y: 3, x: 2, state: fieldType.HALLWAY },
          { y: 3, x: 3, state: fieldType.HALLWAY },
          { y: 3, x: 4, state: fieldType.WALL },
          { y: 3, x: 5, state: fieldType.HALLWAY },
          { y: 3, x: 6, state: fieldType.HALLWAY },
          { y: 3, x: 7, state: fieldType.WALL },

          { y: 4, x: 0, state: fieldType.WALL },
          { y: 4, x: 1, state: fieldType.WALL },
          { y: 4, x: 2, state: fieldType.WALL },
          { y: 4, x: 3, state: fieldType.HALLWAY },
          { y: 4, x: 4, state: fieldType.WALL },
          { y: 4, x: 5, state: fieldType.HALLWAY },
          { y: 4, x: 6, state: fieldType.WALL },
          { y: 4, x: 7, state: fieldType.WALL },

          { y: 5, x: 0, state: fieldType.WALL },
          { y: 5, x: 1, state: fieldType.HALLWAY },
          { y: 5, x: 2, state: fieldType.HALLWAY },
          { y: 5, x: 3, state: fieldType.HALLWAY },
          { y: 5, x: 4, state: fieldType.HALLWAY },
          { y: 5, x: 5, state: fieldType.HALLWAY },
          { y: 5, x: 6, state: fieldType.HALLWAY },
          { y: 5, x: 7, state: fieldType.WALL },

          { y: 6, x: 0, state: fieldType.WALL },
          { y: 6, x: 1, state: fieldType.HALLWAY },
          { y: 6, x: 2, state: fieldType.WALL },
          { y: 6, x: 3, state: fieldType.HALLWAY },
          { y: 6, x: 4, state: fieldType.WALL },
          { y: 6, x: 5, state: fieldType.HALLWAY },
          { y: 6, x: 6, state: fieldType.HOLE },
          { y: 6, x: 7, state: fieldType.WALL },

          { y: 7, x: 0, state: fieldType.WALL },
          { y: 7, x: 1, state: fieldType.WALL },
          { y: 7, x: 2, state: fieldType.WALL },
          { y: 7, x: 3, state: fieldType.WALL },
          { y: 7, x: 4, state: fieldType.WALL },
          { y: 7, x: 5, state: fieldType.WALL },
          { y: 7, x: 6, state: fieldType.WALL },
          { y: 7, x: 7, state: fieldType.WALL }
        ]
      };

      this.io.to(this.roomName).emit("Initial_Field", initialField);
    }
  }

  sendMoveToPeers(socket: any, move: any) {
    if (this.validGame) {
      var playerNameTmp: Player = this.playerList.find(e => {
        return socket.id === e.socket.id;
      });
      if (playerNameTmp === undefined) {
        return;
      }
      var playerName = playerNameTmp.playerName;

      var moveObject: object = { playerId: playerName, move: move };
      socket.to(this.roomName).emit("move", moveObject);
    }
  }

  userLeft(socket: any): void {
    console.log("Hier");
    var playerName: Player = this.playerList.find(e => {
      return socket.id === e.socket.id;
    });
    if (playerName === undefined) {
      return;
    }
    this.io.to(this.roomName).emit("user_left", playerName.playerName);
    //this.playerList.filter(e => e.socket.id !== socket.id);
    // for(let x of this.playerList){
    //   x.socket.disconnect();
    // }
    this.validGame = false;
  }

  removeFromGame(socket: any) {
    // var leavingPlayer : Player = this.playerList.find(e => {
    //   return socket.id === e.socket.id;
    // });
    this.playerList.filter(e => e.socket.id !== socket.id);
  }
}

export class Player {
  playerName: string;
  socket: any;
  constructor(playerName: string, socketId: any) {
    this.socket = socketId;
    this.playerName = playerName;
  }
}
