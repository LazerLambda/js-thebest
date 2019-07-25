import * as fs from "fs";
import { Server } from "./Server";

enum SocketStateEnum {
  SELECTION = 0,
  GAME_WAIT = 1,
  DESIGN = 2,
  GAME = 3
}

export class GameBackend {
  // consts
  TIMEOUT_LENGTH: number = 20;

  // states
  sockets: any[] = [];
  server: Server = null;
  timeoutSet: boolean = false;

  // properties
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
  public emitServerReady(): void {
    for (let e of this.sockets) {
      var toSend: object = { playerId: e.playerNr };
      e.emit("S_ready", toSend);
      console.log("'S_ready' emitted to " + e.id + " Name " + e.name);
    }
  }

  /**
   * @description
   * Methode zur Überprüfung des vorgeschlagenen Spielfeldes
   * @param socket any Socket
   * @param field number[][] field
   * @return boolean
   */
  public checkProposedField(socket: any, field: number[][]): boolean {
    return false;
  }

  /**
   * @description
   *  Setzen des Timeouts für den Editor.
   */
  public handleEditorTimeOut(): void {
    var allStatesOnDesign: boolean = true;
    for (let e of this.sockets) {
      allStatesOnDesign =
        e.state === SocketStateEnum.DESIGN && allStatesOnDesign;
    }
    console.log("All Players ready? " + allStatesOnDesign);
    if (allStatesOnDesign) {
      setTimeout(
        function() {
          for (let e of this.sockets) {
            e.emit("timeout");
            console.log("'timeout' emitted to " + e.id + " Name " + e.name);
          }
        }.bind(this),
        1000 * this.TIMEOUT_LENGTH
      );
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
    var field: any = JSON.parse(file);

    // TODO Namen senden
    var allStatesOnGame: boolean = true;
    for (let e of this.sockets) {
      allStatesOnGame = e.state === SocketStateEnum.GAME && allStatesOnGame;
    }

    if (allStatesOnGame) {
      for (let i = 0; i < this.sockets.length; i++) {
        var index: number = i + 1;
        var playerObj: any = field["player_" + index];
        if (this.sockets[i].name !== "") {
          playerObj["name"] = this.sockets[i].name;
        }
      }
      for (let e of this.sockets) {
        console.log(field);
        e.emit("init_field", field);
        e.state = SocketStateEnum.GAME;
        console.log("'init_field' emitted to " + e.id + " Name " + e.name);
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
   * @param eventObjectToSend any Objekt, welches an die weiteren Spieler gesendet werden soll
   */
  public sendEventsToPeers(eventObjectToSend: any): void {
    var playerNrTMP: number = <number>eventObjectToSend["playerId"];
    console.log(playerNrTMP);
    for (let i = 0; i < this.sockets.length; i++) {
      if (playerNrTMP === this.sockets[i].playerNr) {
        continue;
      } else {
        console.log("Sent to " + this.sockets[i].id);
        this.sockets[i].emit("event", eventObjectToSend);
        console.log(
          "'event' emitted to " +
            this.sockets[i].id +
            " Name " +
            this.sockets[i].name
        );
      }
    }
  }

  /**
   * @description
   * Funktion um das Verlassen eines Spielers zu broadcasten
   * @param socket any Socket
   */
  public sendPlayerHasLeft(socket: any): void {
    for (let e of this.sockets) {
      if (e.id !== socket.id) {
        e.emit("user_left", socket.playerNr);
        console.log("'user_left' emitted to " + e.id + " Name " + e.name);
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
  public playerIsDead(socket: any): void {
    for (let e of this.sockets) {
      if (e.id !== socket.id) {
        e.emit("passivePlayerGameOver", socket.playerNr);
        console.log(
          "'passivePlayerGameOver' emitted to " + e.id + " Name " + e.name
        );
      }
    }
  }
}
