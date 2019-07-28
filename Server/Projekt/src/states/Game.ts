import { Brick } from "../Brick";
import { Consts } from "../Consts";
import { Player, ActivePlayer, PassivePlayer } from "../Player";
//import { Nuke} from "../UsableItems";
import { Enums } from "../Enums";
import { Explosion } from "../Explosion";
import { GameState } from "../GameState";
import { Hallway, Hole, Wall, Bomb, Nuke_Bomb, FieldObj } from "../FieldObj";
import { UserHasLeft } from "./UserHasLeft";
import { Winner } from "./Winner";
import { UseableItem, Nuke } from "../UseableItems";

export class Game {
  //consts
  ARRAY_CONST: number = 8;
  // states
  gameState: GameState = null;
  eventQueue: object[] = [];

  constructor(gameState: GameState) {
    this.gameState = gameState;

    // initialize protocol events

    this.gameState.socket.on(
      "init_field",
      function(data: any) {
        this.gameState.field = data["game_field"];
        this.gameState.items = new Array();
        this.gameState.fieldObjs = [];

        for (let i = 0; i < this.gameState.field.length; i++) {
          let tmpArr: FieldObj[] = [];
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
                tmpArr.push(
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
                tmpArr.push(
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
                tmpArr.push(
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
                tmpArr.push(item);
                break;
            }
          }
          this.gameState.fieldObjs.push(tmpArr);
        }

        console.log(this.gameState.fieldObjs);

        for (let i = 1; i <= Consts.MAX_PLAYERS; i++) {
          var player = data["player_" + i];
          var x: number = <number>player["startpos"]["x"];
          var y: number = <number>player["startpos"]["y"];
          var playerName: string = <string>player["name"];

          var pos: number = x + y * this.ARRAY_CONST;
          var field = this.gameState.fieldObjs[y][x];
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
        this.eventQueue.push(data);
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
    if (this.gameState.activePlayer !== null) {
      var random: number = Math.floor(
        Math.random() * 100 * Consts.RANDOM_FACTOR
      );

      // new Items for the Player's Inventory, invisible for other Players
      var inv = this.gameState.activePlayer.inventory;

      if (random % Consts.RANDOM_MODULO === 0) {
        this.gameState.activePlayer.inventory = new Nuke(this.gameState);
      }
    }

    // Handle Objects on this specific Item
    for (let y = 0; y < this.gameState.fieldObjs.length; y++) {
      for (let x = 0; x < this.gameState.fieldObjs[y].length; x++) {
        if (this.gameState.fieldObjs[y][x] instanceof Hallway) {
          var tmpItem = <Hallway>this.gameState.fieldObjs[y][x];
          if (tmpItem.bombOnItem !== null) {
            // this has to be checked before Bomb
            if (tmpItem.bombOnItem instanceof Nuke_Bomb) {
              if (tmpItem.bombOnItem.explode) {
                this.gameState.explosions.push(
                  new Explosion(tmpItem, this.gameState, Consts.NUKE_RAD)
                );
              }
            }

            if (tmpItem.bombOnItem instanceof Bomb) {
              if (tmpItem.bombOnItem.explode) {
                this.gameState.explosions.push(
                  new Explosion(tmpItem, this.gameState, Consts.BOMB_RAD)
                );
              }
            }
          }
        }
      }
    }

    for (let elem of this.gameState.explosions) {
      elem.update();
    }

    for (let elem of this.gameState.fieldObjs) {
      for (let i = 0; i < elem.length; i++) {
        elem[i].update();
      }
    }

    // check if  still players alive
    var winner = true;
    for (let elem of this.gameState.passivePlayers) {
      this.handleNetworkInput();
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

    for (let elem of this.gameState.fieldObjs) {
      for (let i = 0; i < elem.length; i++) {
        elem[i].draw();
      }
    }

    for (let elem of this.gameState.passivePlayers) {
      elem.drawPlayer();
    }

    if (this.gameState.activePlayer !== null) {
      this.gameState.activePlayer.drawPlayer();
    }
  }

  /**
   * @description
   * Verarbeitung der Warteliste für eingehende events von anderen Clients über den Server
   */
  public handleNetworkInput(): void {
    if (
      this.eventQueue.length > 0 &&
      this.gameState.state === Enums.serverState.GAME
    ) {
      var evObject: any = this.eventQueue[0];
      var playerNrTmp = <number>evObject["playerId"];
      var event = <string>evObject["event"];
      var action = <number>evObject["action"];

      for (let e of this.gameState.passivePlayers) {
        if (e.playerNr === playerNrTmp) {
          if (e.transitionLock) {
            switch (event) {
              case Enums.Event.DROP:
                if (action === Enums.ActionBomb.DEFAULT_BOMB) {
                  e.placeBomb();
                }
                if (action === Enums.ActionBomb.NUKE) {
                  e.placeNuke_Bomb();
                }
                this.eventQueue.pop();
                break;
              case Enums.Event.MOVE:
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
}
