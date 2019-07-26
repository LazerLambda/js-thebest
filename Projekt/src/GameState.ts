import { ActivePlayer, Player, PassivePlayer } from "./Player";
import { Editor } from "./Editor";
import { Enums } from "./Enums";
import { Explosion } from "./Explosion";
import { Game } from "./states/Game";
import { GameOver } from "./states/GameOver";
import { RoomWait } from "./states/RoomWait";
import { Startpage } from "./states/Startpage";
import { UserHasLeft } from "./states/UserHasLeft";
import { Winner } from "./states/Winner";

import * as io from "socket.io-client";
import { FieldObj } from "./FieldObj";

export class GameState {
  // consts
  MAX_PLAYERS: number = 4;
  URL: string = "http://localhost:3000";

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
  eventQueue: object[] = [];

  constructor() {
    this.socket = io(this.URL);
    const canvas = <HTMLCanvasElement>document.getElementById("background");
    this.context = canvas.getContext("2d");

    // dynamisch machen
    this.canvasHeight = canvas.height;
    this.canvasWidth = canvas.width;
    this.xSize = (canvas.width - 300) / 8;
    this.ySize = canvas.height / 8;

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

  /**
   * @description
   * Verarbeitung der Warteliste für eingehende events von anderen Clients über den Server
   */
  public handleNetworkInput(): void {
    if (this.eventQueue.length > 0) {
      var evObject: any = this.eventQueue[0];
      var playerNrTmp = <number>evObject["playerId"];
      var event = <string>evObject["event"];
      var action = <number>evObject["action"];

      for (let e of this.passivePlayers) {
        if (e.playerNr === playerNrTmp) {
          if (e.transitionLock) {
            switch (event) {
              case Enums.Event.DROP:
                e.placeBomb();

                this.eventQueue.pop();

                break;
              case Enums.Event.MOVE:
                e.setTarget(action);

                this.eventQueue.pop();

                break;

              case Enums.Event.PICKUP:
                // Pickup Event
                break;
            }
          }
        }
      }
    } else {
      return;
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
    var oldPos = x + y * 8;
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
      players.concat(this.activePlayer).forEach(
        function(e: Player, i: number) {
          this.context.fillStyle = "#e44b43";
          this.context.font = "25px Krungthep";
          this.context.fillText("Player: " + e.name, 500, (i + 1) * 70); // Dynamisch machen
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
