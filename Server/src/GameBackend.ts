import * as fs from "fs";
import { Server } from "./Server";
import { start } from "repl";

enum SocketStateEnum {
  SELECTION = 0,
  GAME_WAIT = 1,
  DESIGN = 2,
  GAME = 3
}

enum fieldType {
  HALLWAY = 0,
  WALL = 1,
  HOLE = 2,
  BRICK = 3,
  USABLEITEM = 4
}

export class GameBackend {
  sockets: any[] = [];
  server: Server = null;
  gameNumber: any = 0;
  levelCounter: number = 1;
  timeoutSet: boolean = false;

  constructor(sockets: any[], server: Server) {
    this.sockets = sockets;
    this.server = server;

    for (let e of sockets) {
      console.log(e.id);
    }

    for (let e of sockets) {
      e.room = this;
    }

    for (let e of this.server.queue) {
      if (e.room !== null) {
        this.server.removeFromQueue(e);
      }
    }

    console.log("Game created");
  }

  /**
   * @description
   * Methode, um die Antwort auf die Anfrage für den Editor oder das Spiel zu beantworten.
   * Es wird neben der Event-Id die cllientspezifische Nummer für einen Raum mitgesendet.
   */
  public emitServerReady() {
    for (let e of this.sockets) {
      var toSend: object = { playerId: e.playerNr, playerName: e.name };
      e.emit("S_ready", toSend);
      console.log("'S_ready' emitted to " + e.id + " Name " + e.name);
    }
  }

  /**
   * Methode zur Überprüfung des vorgeschlagenen Spielfeldes
   */
  public checkProposedField(socket: any, field: number[][]): boolean {
    var playerIdTmp: number = socket.playerNr;

    var door1: number = Math.floor(field.length / 2);
    var door2: number = Math.floor(field.length / 2);

    var startpos: object = { x: 0, y: 0 };

    function addToVisitedFields() {}

    function testWalls(
      objStrt: { xStart: number; yStart: number },
      objDoor1: { x: number; y: number },
      objDoor2: { x: number; y: number },
      xDir: number,
      yDir: number
    ) {
      var loopVar: boolean = true;
      var x = objStrt.xStart;
      var y = objStrt.yStart;

      if (field[x][y] !== fieldType.HALLWAY) {
        return false;
      }
      var visitedFields: object[] = [];

      while (loopVar) {
        if (
          visitedFields.includes(objDoor1) &&
          visitedFields.includes(objDoor2)
        ) {
          return true;
        }
        if (field[x + xDir][y] === fieldType.HALLWAY) {
          var objTmp: object = { x: x + xDir, y: y };
          if (visitedFields.includes(objTmp)) {
            visitedFields.push(objTmp);
          }
        } else if (field[x + xDir][y] === fieldType.HALLWAY) {
          var objTmp: object = { x: x, y: y + yDir };
          if (visitedFields.includes(objTmp)) {
            visitedFields.push(objTmp);
          }
        } else {
          return false;
        }
      }
    }

    switch (playerIdTmp) {
      case 1:
        startpos = { x: 0, y: 0 }; // top left
        break;
      case 2:
        startpos = { x: field.length, y: 0 }; // top right
        break;
      case 3:
        startpos = { x: 0, y: field.length }; // bottom left
        break;
      case 4:
        startpos = { x: field.length, y: field.length }; // bottom right
      default:
        throw "Error something went wrong with the playerId";
    }
    return false;
  }

  /**
   * @description
   *  Setzen des Timeouts für den Editor.
   */
  public handleEditorTimeOut(f : () => void) {
    var allStatesOnDesign : boolean = true;
    for(let e of this.sockets){
      allStatesOnDesign = (e.state === SocketStateEnum.DESIGN) && allStatesOnDesign;
    }
    console.log("All Players ready? " + allStatesOnDesign);
    if (allStatesOnDesign) {

      setTimeout(function(){
        for(let e of this.sockets){
          e.emit('timeout');
          console.log("timeout emitted");
        }
      }.bind(this), 1000 * 2);          // Konstante
      console.log("Timeout set");
    }
  }

  /**
   * @description
   * Methode für das versenden des Feldes. Der State der Sockets wird nach
   * Übersendung dem neuen Zustand angepasst, sodass keine Duplikate gesendet werden.
   */
  public initField(): void {

    var file: any = fs.readFileSync("./Fields/Field0.json");
    var field: Object = JSON.parse(file);
    for (let e of this.sockets) {
      if (e.state !== SocketStateEnum.GAME) {
        
        e.emit("init_field", field);
        e.state = SocketStateEnum.GAME;
        console.log("Field sent to " + e.id);
      }
    }
  }

  /**
   * @description
   * In dieser Funktion soll rekursiv überprüft werden, ob ein gesuchter Socket in
   * diesem Spiel vorhanden ist oder nicht.
   * @param: socket
   * @return: boolean
   */
  public socketInGame(socket: any): boolean {
    var listTmp = this.sockets.slice();

    function getSock(list: any[]): boolean {
      if (list.length === 0) {
        return false;
      } else {
        return list.pop().socket.id === socket.id || getSock(list);
      }
    }
    return getSock(listTmp);
  }

  /**
   * @description
   * Methode, um die Bewegungen der weiteren Spieler an die
   * @param eventObjectToSend Objekt, welches an die weiteren Spieler gesendet werden soll
   */
  sendEventsToPeers(eventObjectToSend: any) {
    var playerNrTMP: number = <number>eventObjectToSend["playerId"];
    console.log(playerNrTMP);
    for (let i = 0; i < this.sockets.length; i++) {
      if (playerNrTMP === this.sockets[i].playerNr) {
        continue;
      } else {
        console.log("Sent to " + this.sockets[i].id);
        this.sockets[i].emit("event", eventObjectToSend);
      }
    }
  }

  /**
   *
   * @param socket
   */
  sendPlayerHasLeft(socket: any) {
    for (let e of this.sockets) {
      if (e.id !== socket.id) {
        e.emit("user_left", socket.playerNr);
      }
    }
  }

  /**
   * @description
   * Methode, um den weiteren Spielern zu signalisieren, dass ein Spieler
   * in seiner eigenen Logik verloren hat. Dies ist auf Grund von höheren
   * Latenzen nötig, damit nur eine Logik für die Teilnahme verantwortlich ist.
   * @param socket
   */
  playerIsDead(socket: any) {
    for (let e of this.sockets) {
      if (e.id !== socket.id) {
        e.emit("passivePlayerGameOver", socket.playerNr);
        console.log(
          "'passivePlayerGameOver' emitted\nt'-> To player " + socket.playerNr
        );
      }
    }
  }
}
