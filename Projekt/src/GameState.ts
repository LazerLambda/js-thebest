import { ActivePlayer, Player } from "./Player";
import { Brick, Hallway, Hole, Item, Wall } from "./Item";
import { Explosion } from "./Explosion";
import { Startpage } from "./Startpage";
import { Editor } from "./Editor";
import * as io from "socket.io-client";

enum fieldType {
  HALLWAY = 0,
  WALL = 1,
  HOLE = 2,
  BRICK = 3
}

enum serverState {
  SELECTION = 0,
  DESIGN = 1,
  FIELD_WAIT = 2,
  GAME = 3,
  GAMEOVER = 4,
  CONNECTION_LOST = 5
}

export class GameState {
  context: any;
  editor: Editor;
  explosions: Explosion[] = [];
  socket: any = null;

  player: Player[];
  playerPos: any = {
    player0: null,
    player1: null,
    player2: null,
    player3: null
  };
  field: any[];

  xSize: number;
  width: number;
  ySize: number;
  height: number;

  items: Item[];
  fieldSize: number;

  gameState: number;
  startPage: Startpage;

  /**
   *
   * @param player Liste an Spielern, die dem Spiel beigetreten sind
   * evtl. Spieler  zurückgeben nach erfolgreicher Initialisierung
   */

  constructor() {
    // Set gameState to Launchpage

    const canvas = <HTMLCanvasElement>document.getElementById("background");

    this.context = canvas.getContext("2d");

    this.xSize = (canvas.width - 300) / this.width;
    this.ySize = canvas.height / this.height;
  }

  initStartPage() {
    this.gameState = serverState.SELECTION;
    this.startPage = new Startpage(this.context, this);
  }

  initDesign() {
    this.gameState = serverState.DESIGN;
    this.editor = new Editor(this.context);
  }

  initConnection() {
    this.socket = io("http://localhost:3000");

    this.socket.on("S_ready", function(data: any) {
      //this.playerNr = data;
    });
  }

  initField() {
    this.gameState = serverState.FIELD_WAIT;

    if (this.socket === null) {
      throw "ERROR: Socket is not initialized\n\t'-> Something went wrong with the serverState Variable\n";
    }

    this.socket.emit("G_ready", "Player ready");
    this.socket.on("init_field", function(data: any) {
      this.player = [new ActivePlayer(this.context)];
      this.field = data;

      this.fieldSize = this.field.length;

      this.items = new Array();

      var item: Hallway; // Nur zum testen

      this.width = 8;
      this.height = 8;

      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          switch (this.field[i][j]) {
            case fieldType.HALLWAY:
              this.items.push(
                new Hallway(this.context, j, i, this.xSize, this.ySize)
              );
              item = <Hallway>this.items[j]; // Test
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
          }
        }
      }

      for (let elem of this.player) {
        elem.initField(this, item);
      }

      //this.playerPos["player0"] = item.x + item.y * 8;

      this.gameState = serverState.GAME;

      //TEST
      for (let elem of this.items) {
        if(elem.context === undefined){
        document.write("sdaf");
        } else {
          document.write("nicht");
        }
      }
      //this.updateGameInfos();
      // document.write("ADSF");

      //this.playerPos["player0"] = item.x + item.y * 8;
      //this.player.initField(this, item);
    });
  }

  updateIncommingPlayerMove(playerName: string, move: number) {}

  update() {
    if (this.gameState === serverState.SELECTION) {
      this.startPage.update();
    }
    if (this.gameState === serverState.DESIGN) {
      this.editor.update();
    }
    if (this.gameState === serverState.GAME) {
      document.write("ASsdfasd");
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
      for (let elem of this.player) {
        elem.renderPlayer();
      }
    }
  }

  sendMove() {}

  drawGame() {
    if (this.gameState === serverState.GAME) {
      for (let elem of this.items) {
        elem.draw();
      }
      for (let elem of this.player) {
        elem.drawPlayer();
      }
    }
  }

  updateGameInfos() {
    if (this.gameState === serverState.GAME) {
      this.context.clearRect(480, 0, 300, 480);
      this.context.fillStyle = "yellow";
      this.context.fillRect(480, 0, 300, 480);
      this.context.fillStyle = "blue";
      this.context.font = "30px Arial";
      this.context.fillText("Player: " + "TESTNAME", 500, 50);
      this.context.font = "10px Arial";
      this.context.fillText("Punkte: " + "0", 520, 75);

      if (!this.player[0].alive) {
        this.context.fillStyle = "red";
        this.context.fillRect(600, 60, 100, 20);
        this.context.fillStyle = "yellow";
        this.context.font = "10px Arial";
        this.context.fillText("You loooose xD", 600, 75);
      }
    }
  }

  returnPlayer(): Player[] {
    return this.player;
  }
}
