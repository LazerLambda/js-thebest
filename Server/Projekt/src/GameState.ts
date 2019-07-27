import { ActivePlayer, Player, PassivePlayer } from "./Player";
import { Editor } from "./Editor";
import { Enums } from "./Enums";
import { Explosion } from "./Explosion";
import { Game } from "./states/Game";
import { GameOver } from "./states/GameOver";
import { Consts } from "./Consts";
import { RoomWait } from "./states/RoomWait";
import { Startpage } from "./states/Startpage";
import { UserHasLeft } from "./states/UserHasLeft";
import { Winner } from "./states/Winner";

import * as io from "socket.io-client";
import { FieldObj } from "./FieldObj";
import { UseableItem } from "./UseableItems";

export class GameState {
  // dynamic assigned variables
  xSize: number;
  ySize: number;
  canvasHeight: number;
  canvasWidth: number;
  field: any[];

  // State machine variables
  clientId: number;
  startpage: Startpage;
  game: Game;
  gameover: GameOver;
  winner: Winner;
  roomwaitpage: RoomWait;
  editor: Editor;
  state: Enums.serverState;
  userhasleft: UserHasLeft = null;

  // state ariables
  items: FieldObj[] = null;
  context: any = null;
  socket: any = null;
  activePlayer: ActivePlayer = null;
  playerName: string = "";
  passivePlayers: PassivePlayer[] = [];
  explosions: Explosion[] = [];

  constructor() {
    this.socket = io(Consts.URL);
    const canvas = <HTMLCanvasElement>document.getElementById("background");
    this.context = canvas.getContext("2d");

    // dynamisch machen
    this.canvasHeight = canvas.height;
    this.canvasWidth = canvas.width;
    this.xSize = (canvas.width - 300) / Consts.ARRAY_CONST;
    this.ySize = canvas.height / Consts.ARRAY_CONST;

    this.initStartPage();
  }

  ////////////////////////////
  /// State machine functions
  ////////////////////////////

  /**
   * @description
   * Initialisierung des der WarteSeite mit EventListener für das Verhalten
   * bei positiver Rückmeldung vom Server. Ist vom Startseiten Objekt zu erreichen.
   */
  public initWaitPage(editorChoosen: boolean): void {
    this.state = Enums.serverState.ROOM_WAIT;
    this.roomwaitpage = new RoomWait(this.context, this);
    this.socket.on(
      "S_ready",
      function(data: any) {
        this.clientId = <number>data["playerId"];

        if (editorChoosen) {
          this.initEditor();
        } else {
          this.socket.emit("G_ready", this.playerName);
          this.initGame();
        }
      }.bind(this)
    );
  }

  /**
   * @description
   * Initialisierung der Startseite
   */
  public initStartPage(): void {
    this.state = Enums.serverState.SELECTION;
    this.startpage = new Startpage(this.context, this);
  }

  /**
   * @description
   * Initialisierung des Editors und des timeouts
   */
  public initEditor(): void {
    this.state = Enums.serverState.DESIGN;
    this.editor = new Editor(this);
    this.socket.on(
      "timeout",
      function(data: any) {
        this.editor.cleanUpPage();
        this.editor = null;
        this.socket.emit("G_ready", this.playerName);
        this.initGame();
      }.bind(this)
    );
  }

  /**
   * @description
   * Eventhandler für das Game werden initialisiert
   */
  public initGame(): void {
    this.game = new Game(this);
  }

  /**
   * @description
   * Methode, um in den GameOver Zustand überzugehen
   */
  public initGameOver(): void {
    this.gameover = new GameOver(this.context);
    this.activePlayer.running = false;
    this.state = Enums.serverState.GAMEOVER;
  }

  /**
   * @description
   * Standard update Methode für alle Zustände
   */
  public update() {
    switch (this.state) {
      case Enums.serverState.SELECTION:
        this.startpage.update();
        break;
      case Enums.serverState.ROOM_WAIT:
        this.roomwaitpage.updateRoomWait();
        break;
      case Enums.serverState.DESIGN:
        break;
      case Enums.serverState.FIELD_WAIT:
        break;
      case Enums.serverState.GAME:
        this.game.updateGame();
        // this.updateGame();
        if (this.userhasleft !== null) {
          this.userhasleft.updateUserHasLeft();
        }
        this.updateGameInfos();
        break;
      case Enums.serverState.GAMEOVER:
        this.game.updateGame();
        // this.updateGame();
        this.gameover.updateGameOver();
        this.updateGameInfos();
        break;
      case Enums.serverState.WINNER:
        this.game.updateGame();
        // this.updateGame();
        this.winner.drawWinner();
        break;
    }
  }

  /**
   * @description
   * Standard draw Methode für alle Zustände
   */

  public draw() {
    switch (this.state) {
      case Enums.serverState.SELECTION:
        this.startpage.draw();
        break;
      case Enums.serverState.ROOM_WAIT:
        this.context.clearRect(0, 0, this.canvasWidth - 300, this.canvasHeight);
        this.roomwaitpage.drawRoomWait();
        break;
      case Enums.serverState.DESIGN:
        break;
      case Enums.serverState.FIELD_WAIT:
        break;
      case Enums.serverState.GAME: {
        this.game.drawGame();
        //this.drawGame();
        if (this.userhasleft !== null) {
          this.userhasleft.drawUserHasLeft();
        }
        break;
      }
      case Enums.serverState.GAMEOVER:
        this.game.drawGame();
        // this.drawGame();
        this.gameover.drawGameOver();
        break;
      case Enums.serverState.WINNER:
        this.game.drawGame();
        // this.drawGame();
        this.winner.drawWinner();
        break;
    }
  }

  ////////////////////////////
  /// Public functions
  ////////////////////////////

  /**
   * @description
   * Setze Spieler zu neuer Position
   * @param player Player für das neue Ziel
   */
  public setPlayerOnItem(player: Player, target: number): void {
    this.items[target].playerOn.push(player);
  }

  /**
   * @description
   * Entferne den Spieler von der alten Position
   * @param player
   */
  public rmPlayerFromItem(player: Player, x: number, y: number): void {
    var newArr = new Array();
    var oldPos = x + y * Consts.ARRAY_CONST;
    for (let i = 0; i < this.items[oldPos].playerOn.length; i++) {
      if (this.items[oldPos].playerOn[i].playerNr !== this.clientId) {
        newArr.push(this.items[oldPos].playerOn[i]);
      }
    }
    this.items[oldPos].playerOn = newArr;
  }

  /**
   * @private
   *  Methode zur Anzeige der Informationen auf der rechten Seite
   */
  private updateGameInfos(): void {
    if (this.state === Enums.serverState.GAME) {
      this.context.clearRect(480, 0, 300, 480);
      this.context.fillStyle = "#fff2c6";
      this.context.fillRect(480, 0, 300, 480);

      let players: Player[] = <Player[]>this.passivePlayers.slice();
      players = players.concat(this.activePlayer);
      console.log(players);
      for (let i = 0; i < players.length; i++) {
        if (players[i] !== null) {
          this.context.fillStyle = "#e44b43";
          this.context.font = "25px Krungthep";
          this.context.fillText(
            "Player: " + players[i].name,
            500,
            (i + 1) * 70
          );
          this.context.fillStyle = "#ff9944";
          this.context.font = "13px Krungthep";
          this.context.fillText("Punkte: " + "0", 520, (i + 1) * 70 + 25);
          if (players[i] instanceof ActivePlayer) {
            if (this.activePlayer.inventory !== null) {
              var item: UseableItem = this.activePlayer.inventory;
              this.context.fillText(
                "Item: " + item.itemName,
                520,
                (i + 1) * 70 + 39
              );
            }
          }
          if (!players[i].alive) {
            this.context.fillStyle = "#f1651c";
            this.context.font = "10px Krungthep";
            this.context.fillText("So sad...", 600, (i + 1) * 70 + 25);
          }
        } else {
          continue;
        }
      }
    }
  }
}
