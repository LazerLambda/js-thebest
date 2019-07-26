import * as express from "express";
import * as socketio from "socket.io";
import * as path from "path";
import { GameBackend } from "./GameBackend";
import * as fs from "fs";
import { isRegExp } from "util";

enum SocketStateEnum {
  SELECTION = 0,
  GAME_WAIT = 1,
  DESIGN = 2,
  GAME = 3
}

export class Server {
  // consts
  MAX_PLAYER = 2;

  // state variables
  games: GameBackend[] = [];
  connectionCounter: number = 1;
  queue: any[] = [];
  server: any = null;

  /**
   * @description
   * Server Objekt für die Verwaltung der Spiele im Backend.
   * Spieler werden zunächst in einer Liste gesammelt und nach
   * Präferenz in entsprechende Kategorie (Editor, Game) eingeteilt.
   * Verantwortung hier für GameBackend Datenstruktur und eingehende
   * Clients.
   * @param port Portnummer
   */

  constructor(port: number) {
    const app = express();
    app.set("port", process.env.PORT || 3000);
    app.use(express.static("dist"));

    let http = require("http").Server(app);
    let io = require("socket.io")(http);

    app.get("/", (req: any, res: any) => {
      res.sendFile(path.resolve("./dist/index.html"));
    });

    app.get("/game", (req: any, res: any) => {
      res.sendFile(path.resolve("./dist/index.html"));
    });

    io.on(
      "connection",
      function(socket: any) {
        this.queue.push(socket);

        // Init States on socket
        socket.alive = true;
        socket.state = SocketStateEnum.SELECTION;
        socket.waitingForEditor = false;
        socket.waitingForGame = false;
        socket.room = null;
        socket.playerNr = 0;
        socket.name = "";

        socket.on(
          "mode",
          function(data: any) {
            console.log(socket.id + "has joined");
            console.log("Received 'mode': " + data);

            if (data === "editor") {
              socket.waitingForEditor = true;
              socket.playerNr = this.connectionCounter;
              socket.state = SocketStateEnum.DESIGN;
              if (this.checkOtherPlayerPreferences(true)) {
                var room: GameBackend = <GameBackend>socket.room;
                room.emitServerReady();
              }
            }
            if (data === "game") {
              socket.waitingForGame = true;
              socket.playerNr = this.connectionCounter;
              socket.state = SocketStateEnum.GAME_WAIT;
              if (this.checkOtherPlayerPreferences(false)) {
                var room: GameBackend = <GameBackend>socket.room;
                room.emitServerReady();
              }
            }
            if (this.connectionCounter === this.MAX_PLAYER) {
              this.connectionCounter = 1;
            } else {
              ++this.connectionCounter;
            }
          }.bind(this)
        );

        socket.on(
          "proposedField",
          function(data: any) {
            console.log("Received 'propsedField': " + data);
            var field: number[][] = <number[][]>data;
            var room = <GameBackend>socket.room;
            room.sendEventsToPeers(data);
            if (room.checkProposedField(socket, field)) {
              socket.emit("check", 1);
            } else {
              socket.emit("check", 0);
            }
          }.bind(this)
        );

        socket.on(
          "G_ready",
          function(data: any) {
            socket.name = <string>data;
            console.log("Received 'G_ready': " + data);
            console.log(data);
            if (socket.room !== null) {
              var room: GameBackend = <GameBackend>socket.room;
              socket.state = SocketStateEnum.GAME;
              room.initField();
            }
          }.bind(this)
        );

        socket.on("event", function(data: any) {
          console.log("Received 'event': " + data);
          var room = <GameBackend>socket.room;
          room.sendEventsToPeers(data);
        });

        console.log(
          "Connection established\n\t'-> Conn Nr : " + this.connectionCounter
        );

        socket.on("isOver", function(data: any) {
          console.log("Received 'isOver': " + data);
          var room = <GameBackend>socket.room;
          room.playerIsDead(socket);
        });

        socket.on("disconnecting", function(data: any) {
          console.log("Received 'disconnecting': " + data);
          var room = <GameBackend>socket.room;
          if (room !== null) {
            room.sendPlayerHasLeft(socket);
            console.log("disconnecting");
          }
        });

        socket.on("disconnect", function(data: any) {});
      }.bind(this)
    );

    this.server = http.listen(port, function() {
      console.log("listening on *:" + port);
    });
  }

  /**
   * @description
   * Methode, um zu suchen, ob es weitere Spieler mit der selben Präferenz gibt, um
   * dann ein neues Spiel zu erzeugen, welches in diesem Server Objekt auf der games-
   * Liste gespeichert wird.
   * @param chooseEditor Wenn Editor gewählt wurde, muss diese Variable true sein
   * @return boolean
   */
  private checkOtherPlayerPreferences(chooseEditor: boolean): boolean {
    var collector: any[] = new Array();
    if (chooseEditor) {
      for (let e of this.queue) {
        if (e.waitingForEditor !== undefined) {
          if (e.waitingForEditor) {
            collector.push(e);
          }
          if (collector.length === this.MAX_PLAYER) {
            var room: GameBackend = new GameBackend(collector, this);
            room.handleEditorTimeOut();
            this.games.push(room);

            return true;
          }
        }
      }
    } else {
      for (let e of this.queue) {
        if (e.waitingForGame !== undefined) {
          if (e.waitingForGame) {
            collector.push(e);
          }
          if (collector.length === this.MAX_PLAYER) {
            this.games.push(new GameBackend(collector, this));
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * @description
   * Methode, welche einen spezifischen Socket von der Queue entfernt.
   * @param socketS Socket, welcher von der Queue entfernt werden soll
   */
  public removeFromQueue(socketS: any): void {
    this.queue = this.queue.filter(e => {
      e.id !== socketS.id;
    });
  }
}
