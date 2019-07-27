import { AnimatedObject } from "./AnimatedObject";
import { Player } from "./Player";
import { Explosion } from "./Explosion";
import { FieldObj, Hallway, Hole, Nuke_Bomb, Bomb } from "./FieldObj";
import { Fire } from "./Fire";
import { Enums } from "./Enums";
import { Consts } from "./Consts";
import { GameState } from "./GameState";
import { Game } from "./Game";



export class UseableItem {
  // state
  gameState: GameState;

  // Properties
  itemName: string = "Item";

  constructor(gameState: GameState) {
    this.gameState = gameState;
  }

  /**
   * @description
   * Function that returns the Enums string for the specific action
   */
  public getEventType(): number {
    return Enums.ActionBomb.DEFAULT_BOMB;
  }
}



export class Nuke extends UseableItem {
  // Properties
  itemName: string = "Mega NUKE";

  constructor(gameState: GameState) {
    super(gameState);
  }

  public getEventType(): number {
    return Enums.ActionBomb.NUKE;
  }
}