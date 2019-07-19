import * as fs from "fs";
import { Server } from "./Server";

enum SocketStateEnum {
  SELECTION = 0,
  GAME_WAIT = 1,
  DESIGN = 2,
  GAME = 3
}

export class GameBackend {
  sockets: any[] = [];
  server: Server = null;
  gameNumber: any = 0;
  levelCounter: number = 1;

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
      console.log("Send to " + e.playerNr);
      var toSend: object = { playerId: e.playerNr, playerName: e.name };
      e.emit("S_ready", toSend);
    }
  }

  /**
   * @description
   * Methode für das versenden des Feldes. Der State der Sockets wird nach
   * Übersendung dem neuen Zustand angepasst, sodass keine Duplikate gesendet werden.
   */
  public initField(): void {
    // Hier optional noch levelcounter überprüfen.
    // für weitere Levels

    var file: any = fs.readFileSync("./Fields/Field0.json");
    var field: Object = JSON.parse(file);
    for (let e of this.sockets) {
      if (e.state !== SocketStateEnum.GAME) {
        e.emit("init_field", field);
        console.log(e.id + "" + e.state);
        e.state = SocketStateEnum.GAME;
        console.log(e.id + "" + e.state);
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
        e.emit('passivePlayerGameOver', socket.playerNr);
        console.log("'passivePlayerGameOver' emitted\nt'-> To player " + socket.playerNr)
      }
    }
  }
}
