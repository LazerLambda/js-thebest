import { ActivePlayer, Player, PassivePlayer } from "./Player";
import { Hallway, Hole, Item, Wall } from "./Item";
import { Brick } from './Brick';
import { Explosion } from "./Explosion";
import { Startpage } from "./Startpage";
import { Editor } from "./Editor";
import * as io from "socket.io-client";

enum serverState {
  SELECTION = 0,
  DESIGN = 1,
  FIELD_WAIT = 2,
  GAME = 3,
  GAMEOVER = 4,
  CONNECTION_LOST = 5
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
  editor: Editor;
  state: serverState;

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

    // this.socket.emit("mode", "game");
    // this.initGame();
  }

  initStartPage() {
    this.state = serverState.SELECTION;
    this.startpage = new Startpage(this.context, this);
  }

  initDesign() {
    this.state = serverState.DESIGN;
    this.editor = new Editor(this.context);
  }

  initGame() {
    this.socket.on(
      "S_ready",
      function(data: any) {
        this.playerNr = <number>data;
        this.socket.emit("G_ready", "Name");
      }.bind(this)
    );
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

          this.state = serverState.GAME;
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
            this.update();
            this.draw();
          }
        }
        this.updateGameInfos();
      }.bind(this)
    );
  }

  update() {
    switch (this.state) {
      case serverState.SELECTION:
        break;
      case serverState.DESIGN:
        break;
      case serverState.FIELD_WAIT:
        break;
      case serverState.GAME: {
        for (let i = 0; i < this.items.length; i++) {
          if (this.items[i] instanceof Hallway) {
            var tmpItem = <Hallway>this.items[i];

            // if(tmpItem.x)
            // for(let e of tmpItem.playerOn){
            //   // console.log("x :" + tmpItem.y + ", y:" + tmpItem.y);
            //   // console.log("Nr: " + e.playerNr);
            // }
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
          elem.renderPlayer();
        }
        if (this.activePlayer !== null) {
          this.activePlayer.renderPlayer();
        }

        break;
      }
      case serverState.GAMEOVER:
        break;
      case serverState.CONNECTION_LOST:
        break;
    }
  }

  draw() {
    switch (this.state) {
      case serverState.SELECTION:
        break;
      case serverState.DESIGN:
        break;
      case serverState.FIELD_WAIT:
        break;
      case serverState.GAME: {
        this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        for (let elem of this.items) {
          elem.draw();
        }

        for (let elem of this.passivePlayers) {
          elem.drawPlayer();
        }

        if (this.activePlayer !== null) {
          this.activePlayer.drawPlayer();
        }
        break;
      }
      case serverState.GAMEOVER:
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
      this.context.fillStyle = "blue";
      this.context.font = "30px Arial";
      this.context.fillText("Player: " + "TESTNAME", 500, 50);
      this.context.font = "10px Arial";
      this.context.fillText("Punkte: " + "0", 520, 75);

      // if (!this.player[0].alive) {
      //   this.context.fillStyle = "red";
      //   this.context.fillRect(600, 60, 100, 20);
      //   this.context.fillStyle = "yellow";
      //   this.context.font = "10px Arial";
      //   this.context.fillText("You loooose xD", 600, 75);
      // }
    }
  }
  updateIncommingPlayerMove(playerName: string, move: number) {}
}
