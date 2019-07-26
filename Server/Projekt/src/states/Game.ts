import { Brick } from "../Brick";
import {Consts } from "../Consts";
import { Player, ActivePlayer, PassivePlayer } from "../Player";
import { Enums } from "../Enums";
import { Explosion } from "../Explosion";
import { GameState } from "../GameState";
import { Hallway, Hole, Wall } from "../FieldObj";
import { UserHasLeft } from "./UserHasLeft";
import { Winner } from "./Winner";

export class Game {
  //consts
  ARRAY_CONST: number = 8;
  // states
  gameState: GameState = null;

  constructor(gameState: GameState) {
    this.gameState = gameState;


    // initialize protocol events

    this.gameState.socket.on(
      "init_field",
      function(data: any) {
        this.gameState.field = data["game_field"];
        this.gameState.items = new Array();

        for (let i = 0; i < this.gameState.field.length; i++) {
          for (let j = 0; j < this.gameState.field[0].length; j++) {
            switch (this.gameState.field[i][j]) {
              case Enums.fieldType.HALLWAY:
                this.gameState.items.push(
                  new Hallway(
                    this.gameState.context,
                    j,
                    i,
                    this.gameState.xSize,
                    this.gameState.ySize
                  )
                );
                break;
              case Enums.fieldType.HOLE:
                this.gameState.items.push(
                  new Hole(
                    this.gameState.context,
                    j,
                    i,
                    this.gameState.xSize,
                    this.gameState.ySize
                  )
                );
                break;
              case Enums.fieldType.WALL:
                this.gameState.items.push(
                  new Wall(
                    this.gameState.context,
                    j,
                    i,
                    this.gameState.xSize,
                    this.gameState.ySize
                  )
                );
                break;
              case Enums.fieldType.BRICK:
                var item: Hallway = new Hallway(
                  this.gameState.context,
                  j,
                  i,
                  this.gameState.xSize,
                  this.gameState.ySize
                );
                item.brickOnItem = new Brick(
                  this.gameState.context,
                  j,
                  i,
                  this.gameState.xSize,
                  this.gameState.ySize,
                  item
                );
                this.gameState.items.push(item);
                break;
            }
          }
        }
        
        for (let i = 1; i <= Consts.MAX_PLAYERS; i++) {
          var player = data["player_" + i];
          var x: number = <number>player["startpos"]["x"];
          var y: number = <number>player["startpos"]["y"];
          var playerName: string = <string>player["name"];

          var pos: number = x + y * this.ARRAY_CONST;
          var field = this.gameState.items[pos];
          if (this.gameState.clientId === i) {
            this.gameState.activePlayer = new ActivePlayer(
              this.gameState.context,
              this.gameState.socket,
              i,
              playerName
            );
            this.gameState.activePlayer.initField(this.gameState, field);
            this.gameState.update();
            this.gameState.draw();
          } else {
            var passivePlayer = new PassivePlayer(
              this.gameState.context,
              i,
              playerName
            );
            passivePlayer.initField(this.gameState, field);
            this.gameState.passivePlayers.push(passivePlayer);

            if (this.gameState.passivePlayers.length > 3) {
              throw "Too many passive Players in list";
            }

            this.gameState.update();
            this.gameState.draw();
          }
          
          this.gameState.state = Enums.serverState.GAME;
        }
        this.gameState.updateGameInfos();
      }.bind(this)
    );

    this.gameState.socket.on(
      "event",
      function(data: any) {
        this.gameState.eventQueue.push(data);
      }.bind(this)
    );

    this.gameState.socket.on(
      "user_left",
      function(data: any) {
        var playerNrTmp = <number>data;
        this.gameState.passivePlayers = this.gameState.passivePlayers.filter(
          function(e: Player) {
            return e.playerNr !== playerNrTmp;
          }
        );
        this.gameState.userhasleft = new UserHasLeft(
          this.gameState.context,
          "" + playerNrTmp,
          this.gameState
        );
        this.gameState.updateGameInfos();
      }.bind(this)
    );

    this.gameState.socket.on(
      "passivePlayerGameOver",
      function(data: any) {
        var playerNrTmp = <number>data;
        this.gameState.passivePlayers.forEach((element: any) => {
          if (element.playerNr === playerNrTmp) {
            element.setLose();
          }
        });
      }.bind(this)
    );
  }

  /**
   * @description
   * Procedure for updating the game Not only significant during the game, 
   * but also during the gameover or winning sequence.
   */
  public updateGame(): void {
    for (let i = 0; i < this.gameState.items.length; i++) {
      if (this.gameState.items[i] instanceof Hallway) {
        var tmpItem = <Hallway>this.gameState.items[i];
        if (tmpItem.bombOnItem !== null) {
          if (tmpItem.bombOnItem.explode) {
            this.gameState.explosions.push(
              new Explosion(tmpItem, this.gameState, 3)
            );
          }
        }
      }
    }

    for (let elem of this.gameState.explosions) {
      elem.update();
    }

    for (let elem of this.gameState.items) {
      elem.update();
    }

    // check if  still players alive
    var winner = true;
    for (let elem of this.gameState.passivePlayers) {
      this.gameState.handleNetworkInput();
      winner = !elem.alive && winner;
      elem.updatePlayer();
    }

    if (winner || this.gameState.passivePlayers.length === 0) {
      this.gameState.winner = new Winner(this.gameState.context);
      this.gameState.state = Enums.serverState.WINNER;
    }

    // check if active Player is alive
    if (this.gameState.activePlayer !== null) {
      this.gameState.activePlayer.updatePlayer();
      if (!this.gameState.activePlayer.alive) {
        this.gameState.initGameOver();
      }
    }
  }

  /**
   * @description
   * drawing the game
   */
  public drawGame(): void {
    this.gameState.context.clearRect(
      0,
      0,
      this.gameState.canvasWidth - 300,
      this.gameState.canvasHeight
    );
    for (let elem of this.gameState.items) {
      elem.draw();
    }
    for (let elem of this.gameState.passivePlayers) {
      elem.drawPlayer();
    }

    if (this.gameState.activePlayer !== null) {
      this.gameState.activePlayer.drawPlayer();
    }
  }
}