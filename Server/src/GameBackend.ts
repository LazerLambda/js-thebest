import { Consts } from "../Projekt/src/Consts";
import { Enums } from "../Projekt/src/Enums";
import { Server } from "./Server";

import * as fs from "fs";

export class GameBackend {
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
    return true;
  }

  /**
   * @description
   *  Setzen des Timeouts für den Editor.
   */
  public handleEditorTimeOut(): void {
    var allStatesOnDesign: boolean = true;
    for (let e of this.sockets) {
      allStatesOnDesign =
        e.state === Enums.serverState.DESIGN && allStatesOnDesign;
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
        1000 * Consts.TIMEOUT_LENGTH
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
      allStatesOnGame = e.state === Enums.serverState.GAME && allStatesOnGame;
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
        e.state = Enums.serverState.GAME;
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
   * Method that takes 4 maps and merges them to one new map.
   * @param map0 number[][]
   * @param map1 number[][]
   * @param map2 number[][]
   * @param map3 number[][]
   * @return number[][] new map
   */
  public combineMaps(
    map0: number[][],
    map1: number[][],
    map2: number[][],
    map3: number[][]
  ): number[][] {
    const map0Height: number = map0.length;
    const map0Width: number = map0[1].length;
    const map1Height: number = map1.length;
    const map1Width: number = map1[1].length;
    const map2Height: number = map2.length;
    const map2Width: number = map2[1].length;
    const map3Height: number = map3.length;
    const map3Width: number = map3[1].length;

    const topLeftY0 = 0;
    const topLeftX0 = 0;
    const topLeftY1 = 0;
    const topLeftX1 = map0Width;
    const topLeftY2 = map0Height + 1;
    const topLeftX2 = map0Width - 1;
    const topLeftY3 = map0Height;
    const topLeftX3 = 0;

    const fullMapHeight = map0Height + map3Height;
    const fullMapWidth = map0Width + map1Width;
    const mapCenterY = Math.floor(fullMapHeight / 2);
    const mapCenterX = Math.floor(fullMapWidth / 2);

    let fullMap: number[][] = [[]];
    for (let y = 0; y < fullMapHeight; y++) {
      let row_y = new Array();
      for (let x = 0; x < fullMapWidth; x++) {
        row_y[x] = undefined;
      }
      fullMap[y] = row_y;
    }

    fullMap[mapCenterY][mapCenterX] = 5;

    for (let y = 0; y < map0Height; y++) {
      let row_y = map0[y];
      for (let x = 0; x < map0Width; x++) {
        fullMap[y + topLeftY0][x + topLeftX0] = row_y[x];
      }
    }

    for (let y = 0; y < map1Height; y++) {
      let row_y = map1[y];
      for (let x = 0; x < map1Width; x++) {
        fullMap[y + topLeftY1][x + topLeftX1] = row_y[x];
      }
    }

    for (let y = 0; y < +map2Height; y++) {
      let row_y = map2[y];
      for (let x = 0; x < map2Width; x++) {
        fullMap[y + topLeftY2][x + topLeftX2] = row_y[x];
      }
    }

    for (let y = 0; y < map3Height; y++) {
      let row_y = map3[y];
      for (let x = topLeftX3; x < map3Width; x++) {
        fullMap[y + topLeftY3][x + topLeftX3] = row_y[x];
      }
    }
    return fullMap;
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
