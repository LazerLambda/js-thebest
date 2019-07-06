import * as express from "express";
import * as socketio from "socket.io";
import * as path from "path";
import { GameBackend } from "./GameBackend";
//import { SocketState } from "./SocketState";
import * as fs from "fs";
import { Game } from "./Game";

enum SocketStateEnum {
  SELECTION = 0,
  DESIGN = 1,
  GAME = 2
}

export class Server {
  server: any;

  connectionCounter: number = 1;
  queue: any[] = [];

  games: GameBackend[] = [];

  MAX_PLAYER = 2;

  /**
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

    io.on(
      "connection",
      function(socket: any) {
        this.queue.push(socket);

        // Init States on socket
        socket.state = SocketStateEnum.SELECTION;
        socket.waitingForEditor = false;
        socket.waitingForGame = false;
        socket.room =  null;

        socket.on(
          "mode",
          function(data: any) {
            console.log(socket.id + "has joined");
            console.log("Received 'mode': " + data);
            if (data === "editor") {
              socket.waitingForEditor = true;
              if (this.checkOtherPlayerPreferences(true)) {
                socket.emit("S_ready", this.connectionCounter);
                socket.state = SocketStateEnum.DESIGN;
              }
            }
            if (data === "game") {
              socket.waitingForGame = true;
              if (this.checkOtherPlayerPreferences(false)) {
                socket.emit("S_ready", 2);
                socket.state = SocketStateEnum.GAME;
              }
            }

            // Erst hier erhöhen, damit nur valide Verbindungen gezählt werden
            if (this.connectionCounter === this.MAX_PLAYER) {
                this.connectionCounter = 1;
              } else {
                ++this.connectionCounter;
              }
          }.bind(this)
        );

        socket.on(
          "G_ready",
          function(data: any) {
            console.log("G_ready received");
            console.log(data);
            var file: any = fs.readFileSync("./Fields/Field0.json");
            var field: Object = JSON.parse(file);
            socket.emit("init_field", field);
            console.log(field);
            console.log("Field sent");
          }.bind(this)
        );

        console.log(
          "Connection established\n\t'-> Conn Nr : " + this.connectionCounter
        );

        socket.on("event", function(data: any) {});

        socket.on("disconnecting", function(data: any) {
          console.log(socket.hallo);
          console.log("disconnecting");
        });

        socket.on("disconnect", function(data: any) {});
      }.bind(this)
    );

    this.server = http.listen(port, function() {
      console.log("listening on *:" + port);
    });
  }

  /**
   * Methode, um zu suchen, ob es weitere Spieler mit der selben Präferenz gibt, um
   * dann ein neues Spiel zu erzeugen, welches in diesem Server Objekt auf der games-
   * Liste gespeichert wird.
   * @param chooseEditor Wenn Editor gewählt wurde, muss diese Variable true sein
   * @return boolean
   */
  checkOtherPlayerPreferences(chooseEditor: boolean): boolean {
    var collector: any[] = new Array();
    if (chooseEditor) {
      for (let e of this.queue) {
        if (e.waitingForEditor !== undefined) {
          if (e.waitingForEditor) {
            collector.push(e);
          }
          if (collector.length === this.MAX_PLAYER) {
            this.games.push(new GameBackend(collector, this));

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
   * Methode, welche einen spezifischen Socket von der Queue entfernt.
   * @param socketS Socket, welcher von der Queue entfernt werden soll
   */

  removeFromQueue(socketS: any): void {
    this.queue = this.queue.filter(e => {
      e.id !== socketS.id;
    });
    console.log("removeFromQueue.length : " + this.queue.length);
  }
}
