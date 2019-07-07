import { ActivePlayer, Player, PassivePlayer } from "./Player";
import { Hallway, Hole, Item, Wall } from "./Item";
import { GameOver } from "./GameOver";
import { Brick } from "./Brick";
import { Explosion } from "./Explosion";
import { Startpage } from "./Startpage";
import { Editor } from "./Editor";
import { RoomWait } from "./RoomWait";
import { UserHasLeft } from "./UserHasLeft";
import * as io from "socket.io-client";

enum serverState {
  SELECTION = 0,
  ROOM_WAIT = 1,
  DESIGN = 2,
  FIELD_WAIT = 3,
  GAME = 4,
  GAMEOVER = 5,
  CONNECTION_LOST = 6
}

enum fieldType {
  HALLWAY = 0,
  WALL = 1,
  HOLE = 2,
  BRICK = 3
}

export class GameState {
  playerNr: number;
  startpage: Startpage;
  gameover: GameOver;
  roomwaitpage: RoomWait;
  editor: Editor;
  state: serverState;
  userhasleft : UserHasLeft = null;

  field: any[][];
  items: Item[];
  context: any;
  socket: any;

  xSize: number;
  ySize: number;

  canvasHeight: number;
  canvasWidth: number;

  MAX_PLAYERS: number = 4;
  activePlayer: ActivePlayer = null;
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
    this.socket = io("http://localhost:3000");
    const canvas = <HTMLCanvasElement>document.getElementById("background");
    this.context = canvas.getContext("2d");

    // dynamisch machen
    this.canvasHeight = canvas.height;
    this.canvasWidth = canvas.width;
    this.xSize = (canvas.width - 300) / 8;
    this.ySize = canvas.height / 8;

    this.initStartPage();
  }

  initWaitPageGame() {
    this.state = serverState.ROOM_WAIT;
    this.roomwaitpage = new RoomWait(this.context, this);
    this.socket.on(
      "S_ready",
      function(data: any) {
        this.playerNr = <number>data;
        this.socket.emit("G_ready", "Name");
        this.initGame();
      }.bind(this)
    );
  }

  initWaitPageEditor() {
    this.state = serverState.ROOM_WAIT;
    this.roomwaitpage = new RoomWait(this.context, this);
    this.socket.on(
      "S_ready",
      function(data: any) {
        this.playerNr = <number>data;
        this.socket.emit("G_ready", "Name");
        this.initEditor();
      }.bind(this)
    );
  }

  initStartPage() {
    this.state = serverState.SELECTION;
    this.startpage = new Startpage(this.context, this);
  }

  initEditor() {
    this.state = serverState.DESIGN;
    this.editor = new Editor(this.context);
  }

  initGame() {
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
          if (this.playerNr === i) {
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
        console.log("HIER");
        var playerNrTmp = <number>data;
        this.passivePlayers = this.passivePlayers.filter(function(e: Player) {
          return e.playerNr !== playerNrTmp;
        });
        this.userhasleft = new UserHasLeft(this.context, "" + playerNrTmp, this);
        this.updateGameInfos();
      }.bind(this)
    );
  }

  /**
   * Verarbeitung der Warteliste für eingehende events von anderen Clients über den Server
   */
  handleNetworkInput(): void {
    if (this.eventQueue.length > 0) {
      var evObject: any = this.eventQueue[0];
      var playerNrTmp = <number>evObject["playerId"];
      var event = <string>evObject["event"];
      var action = <number>evObject["action"];

      console.log(event);

      for (let e of this.passivePlayers) {
        if (e.playerNr === playerNrTmp) {
          if (e.transitionLock) {
            switch (event) {
              case "drop":
                console.log("Hier");
                e.placeBomb();

                this.eventQueue.pop();

                break;
              case "move":
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

  updateGame() {
    for (let i = 0; i < this.items.length; i++) {
      if (this.items[i] instanceof Hallway) {
        var tmpItem = <Hallway>this.items[i];
        if (tmpItem.bombOnItem !== null) {
          if (tmpItem.bombOnItem.explode) {
            this.explosions.push(new Explosion(tmpItem, this));
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

    for (let elem of this.passivePlayers) {
      this.handleNetworkInput();
      elem.renderPlayer();
    }
    if (this.activePlayer !== null) {
      this.activePlayer.renderPlayer();
      if (!this.activePlayer.alive) {
        this.gameover = new GameOver(this.context);
        this.state = serverState.GAMEOVER;
      }
    }
  }

  update() {
    switch (this.state) {
      case serverState.SELECTION:
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
        if(this.userhasleft !== null){
          this.userhasleft.updateUserHasLeft();
        }
        break;
      case serverState.GAMEOVER:
        this.updateGame();
        this.gameover.updateGameOver();
        this.updateGameInfos();
        break;
      case serverState.CONNECTION_LOST:
        break;
    }
  }

  showGame() {
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

  draw() {
    switch (this.state) {
      case serverState.SELECTION:
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
        this.showGame();
        if(this.userhasleft !== null){
          this.userhasleft.drawUserHasLeft();
        }
        break;
      }
      case serverState.GAMEOVER:
        this.showGame();
        this.gameover.drawGameOver();
        break;
      case serverState.CONNECTION_LOST:
        break;
    }
  }

  updateGameInfos() {
    if (this.state === serverState.GAME) {
      this.context.clearRect(480, 0, 300, 480);
      this.context.fillStyle = "yellow";
      this.context.fillRect(480, 0, 300, 480);

      let players: Player[] = <Player[]>this.passivePlayers.slice();
      players.concat(this.activePlayer).forEach(
        function(e: Player, i: number) {
          this.context.fillStyle = "blue";
          this.context.font = "25px Arial";
          this.context.fillText("Player: " + e.playerNr, 500, (i + 1) * 50); // Dynamisch machen
          this.context.font = "10px Arial";
          this.context.fillText("Punkte: " + "0", 520, (i + 1) * 50 + 25);
          if (!e.alive) {
            //this.context.fillStyle = "red";
            //this.context.fillRect(600, 60, 100, 20);
            this.context.fillStyle = "red";
            this.context.font = "10px Arial";
            this.context.fillText("You loooose xD", 600, (i + 1) * 50 + 25);
          }
        }.bind(this)
      );
    }
  }
}
