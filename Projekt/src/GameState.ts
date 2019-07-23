import { ActivePlayer, Player, PassivePlayer } from "./Player";
import { Hallway, Hole, Item, Wall } from "./Item";
import { GameOver } from "./GameOver";
import { Brick } from "./Brick";
import { Explosion } from "./Explosion";
import { Startpage } from "./Startpage";
import { Editor } from "./Editor";
import { RoomWait } from "./RoomWait";
import { UserHasLeft } from "./UserHasLeft";
import { Winner } from "./Winner";

import * as io from "socket.io-client";

enum serverState {
  SELECTION = 0,
  ROOM_WAIT = 1,
  DESIGN = 2,
  FIELD_WAIT = 3,
  GAME = 4,
  GAMEOVER = 5,
  WINNER = 6
}

enum fieldType {
  HALLWAY = 0,
  WALL = 1,
  HOLE = 2,
  BRICK = 3,
  USABLEITEM = 4
}

enum Event {
  MOVE = "move",
  DROP = "drop"
}

enum ActionBomb {
  DEFAULT_BOMB = 1
}

let URL: string = "http://localhost:3000";

export class GameState {
  clientrId: number;
  startpage: Startpage;
  gameover: GameOver;
  winner: Winner;
  roomwaitpage: RoomWait;
  editor: Editor;
  state: serverState;
  userhasleft: UserHasLeft = null;

  field: any[];
  items: Item[];
  context: any;
  socket: any;

  xSize: number;
  ySize: number;

  canvasHeight: number;
  canvasWidth: number;

  MAX_PLAYERS: number = 4;
  activePlayer: ActivePlayer = null;
  playerName: string = "";
  passivePlayers: PassivePlayer[] = [];

  explosions: Explosion[] = [];

  eventQueue: object[] = [];

  playerObj: Object = {
    1: null,
    2: null,
    3: null,
    4: null
  };

  constructor() {
    this.socket = io(URL);
    const canvas = <HTMLCanvasElement>document.getElementById("background");
    this.context = canvas.getContext("2d");

    // dynamisch machen
    this.canvasHeight = canvas.height;
    this.canvasWidth = canvas.width;
    this.xSize = (canvas.width - 300) / 8;
    this.ySize = canvas.height / 8;

    this.initStartPage();
  }

  /**
   * @description
   * Initialisierung des der WarteSeite mit EventListener für das Verhalten
   * bei positiver Rückmeldung vom Server. Ist vom Startseiten Objekt zu erreichen.
   */

  public initWaitPage(editorChoosen: boolean) {
    this.state = serverState.ROOM_WAIT;
    this.roomwaitpage = new RoomWait(this.context, this);
    this.socket.on(
      "S_ready",
      function(data: any) {
        this.clientId = <number>data["playerId"];
        this.playerName = <string>data["playerName"];
        this.socket.emit("G_ready", this.playerName);
        if (editorChoosen) {
          this.initEditor();
        } else {
          this.initGame();
        }
      }.bind(this)
    );
  }

  /**
   * @description
   * Initialisierung der Startseite
   */
  private initStartPage() {
    this.state = serverState.SELECTION;
    this.startpage = new Startpage(this.context, this);
  }

  /**
   * @description
   * Initialisierung des Editors
   */
  private initEditor(): void {
    this.state = serverState.DESIGN;
    this.editor = new Editor();
  }

  /**
   * @description
   * Eventhandler für das Game werden initialisiert
   */

  private initGame(): void {
    this.socket.on(
      "init_field",
      function(data: any) {
        this.field = data["game_field"];
        this.items = new Array();

        for (let i = 0; i < this.field.length; i++) {
          for (let j = 0; j < this.field[0].length; j++) {
            switch (this.field[i][j]) {
              case fieldType.HALLWAY:
                this.items.push(
                  new Hallway(this.context, j, i, this.xSize, this.ySize)
                );
                break;
              case fieldType.HOLE:
                this.items.push(
                  new Hole(this.context, j, i, this.xSize, this.ySize)
                );
                break;
              case fieldType.WALL:
                this.items.push(
                  new Wall(this.context, j, i, this.xSize, this.ySize)
                );
                break;
              case fieldType.BRICK:
                var item: Hallway = new Hallway(
                  this.context,
                  j,
                  i,
                  this.xSize,
                  this.ySize
                );
                item.brickOnItem = new Brick(
                  this.context,
                  j,
                  i,
                  this.xSize,
                  this.ySize,
                  item
                );
                this.items.push(item);
                break;
            }
          }
        }

        for (let i = 1; i <= this.MAX_PLAYERS; i++) {
          var player = data["player_" + i];
          var x: number = <number>player["startpos"]["x"];
          var y: number = <number>player["startpos"]["y"];

          // this.state = serverState.GAME;
          // 8 dynamisch

          var pos: number = x + y * 8;
          var field = this.items[pos];
          if (this.clientId === i) {
            this.activePlayer = new ActivePlayer(this.context, this.socket, i);
            this.activePlayer.initField(this, field);
            this.update();
            this.draw();
          } else {
            var passivePlayer = new PassivePlayer(this.context, i);
            passivePlayer.initField(this, field);
            this.passivePlayers.push(passivePlayer);

            if (this.passivePlayers.length > 3) {
              throw "Too many passive Players in list";
            }

            this.update();
            this.draw();
          }
          this.state = serverState.GAME;
        }
        this.updateGameInfos();
      }.bind(this)
    );

    // Verarbeitung von eingehenden Events

    this.socket.on(
      "event",
      function(data: any) {
        this.eventQueue.push(data);
      }.bind(this)
    );

    this.socket.on(
      "user_left",
      function(data: any) {
        var playerNrTmp = <number>data;
        this.passivePlayers = this.passivePlayers.filter(function(e: Player) {
          return e.playerNr !== playerNrTmp;
        });
        this.userhasleft = new UserHasLeft(
          this.context,
          "" + playerNrTmp,
          this
        );
        this.updateGameInfos();
      }.bind(this)
    );

    this.socket.on(
      "passivePlayerGameOver",
      function(data: any) {
        var playerNrTmp = <number>data;
        this.passivePlayers.forEach((element: any) => {
          if (element.playerNr === playerNrTmp) {
            element.setLose();
          }
        });
      }.bind(this)
    );
  }

  /**
   * @desctiption
   * Verarbeitung der Warteliste für eingehende events von anderen Clients über den Server
   */
  handleNetworkInput(): void {
    if (this.eventQueue.length > 0) {
      var evObject: any = this.eventQueue[0];
      var playerNrTmp = <number>evObject["playerId"];
      var event = <string>evObject["event"];
      var action = <number>evObject["action"];

      for (let e of this.passivePlayers) {
        if (e.playerNr === playerNrTmp) {
          if (e.transitionLock) {
            switch (event) {
              case Event.DROP:
                e.placeBomb();

                this.eventQueue.pop();

                break;
              case Event.MOVE:
                e.setTarget(action);

                this.eventQueue.pop();

                break;
            }
          }
        }
      }
    } else {
      return;
    }
  }

  /**
   * Prozedur für die Aktualisierung des Spiels
   * Nicht nur während des Spiels bedeuetsam, sondern auch während der Gameover oder Winning- Sequenz.
   */

  updateGame() {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i] instanceof Hallway) {
        var tmpItem = <Hallway>this.items[i];
        if (tmpItem.bombOnItem !== null) {
          if (tmpItem.bombOnItem.explode) {
            this.explosions.push(new Explosion(tmpItem, this, 3));
          }
        }
      }
    }

    for (let elem of this.explosions) {
      elem.update();
    }

    for (let elem of this.items) {
      elem.update();
    }

    var winner = true;
    for (let elem of this.passivePlayers) {
      this.handleNetworkInput();
      winner = !elem.alive && winner; // überprüfe, ob die anderen Spieler noch teilnehmen
      elem.renderPlayer();
    }

    if (winner || this.passivePlayers.length === 0) {
      this.winner = new Winner(this.context);
      this.state = serverState.WINNER;
    }

    if (this.activePlayer !== null) {
      this.activePlayer.renderPlayer();
      if (!this.activePlayer.alive) {
        this.gameover = new GameOver(this.context);
        this.activePlayer.removeEventLister();
        this.activePlayer.running = false;
        this.state = serverState.GAMEOVER;
      }
    }
  }

  /**
   * Standard update Methode für alle Zustände
   */
  update() {
    switch (this.state) {
      case serverState.SELECTION:
        this.startpage.update();
        break;
      case serverState.ROOM_WAIT:
        this.roomwaitpage.updateRoomWait();
        break;
      case serverState.DESIGN:
        break;
      case serverState.FIELD_WAIT:
        break;
      case serverState.GAME:
        this.updateGame();
        if (this.userhasleft !== null) {
          this.userhasleft.updateUserHasLeft();
        }
        break;
      case serverState.GAMEOVER:
        this.updateGame();
        this.gameover.updateGameOver();
        this.updateGameInfos();
        break;
      case serverState.WINNER:
        this.updateGame();
        this.winner.drawWinner();
        break;
    }
  }

  /**
   * Prozedur für die Aktualisierung des Spiels
   * Nicht nur während des Spiels bedeuetsam, sondern auch während der Gameover oder Winning- Sequenz.
   */

  drawGame() {
    this.context.clearRect(0, 0, this.canvasWidth - 300, this.canvasHeight);
    for (let elem of this.items) {
      elem.draw();
    }
    for (let elem of this.passivePlayers) {
      elem.drawPlayer();
    }

    if (this.activePlayer !== null) {
      this.activePlayer.drawPlayer();
    }
  }

  /**
   * Standard draw Methode für alle Zustände
   */

  draw() {
    switch (this.state) {
      case serverState.SELECTION:
        this.startpage.draw();
        break;
      case serverState.ROOM_WAIT:
        this.context.clearRect(0, 0, this.canvasWidth - 300, this.canvasHeight);
        this.roomwaitpage.drawRoomWait();
        break;
      case serverState.DESIGN:
        break;
      case serverState.FIELD_WAIT:
        break;
      case serverState.GAME: {
        this.drawGame();
        if (this.userhasleft !== null) {
          this.userhasleft.drawUserHasLeft();
        }
        break;
      }
      case serverState.GAMEOVER:
        this.drawGame();
        this.gameover.drawGameOver();
        break;
      case serverState.WINNER:
        this.drawGame();
        this.winner.drawWinner();
        break;
    }
  }

  /**
   *  Methode zur Anzeige der Informationen auf der rechten Seite
   */
  updateGameInfos() {
    if (this.state === serverState.GAME) {{
      this.context.clearRect(480, 0, 300, 480);
      this.context.fillStyle = "#fff2c6";
      this.context.fillRect(480, 0, 300, 480);

      let players: Player[] = <Player[]>this.passivePlayers.slice();
      players.concat(this.activePlayer).forEach(
        function(e: Player, i: number) {
          this.context.fillStyle = "#e44b43";
          this.context.font = "25px Krungthep";
          this.context.fillText("Player: " + e.playerNr, 500, (i + 1) * 70); // Dynamisch machen
          this.context.fillStyle = "#ff9944";
          this.context.font = "13px Krungthep";
          this.context.fillText("Punkte: " + "0", 520, (i + 1) * 70 + 25);
          if (!e.alive) {
            this.context.fillStyle = "#f1651c";
            this.context.font = "10px Krungthep";
            this.context.fillText("You loooose xD", 600, (i + 1) * 70 + 25);
          }
        }.bind(this)
      );
    }
  }
}
