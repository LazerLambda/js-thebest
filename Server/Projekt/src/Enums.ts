

export module Enums{
    export enum serverState {
        SELECTION = 0,
        ROOM_WAIT = 1,
        DESIGN = 2,
        FIELD_WAIT = 3,
        GAME = 4,
        GAMEOVER = 5,
        WINNER = 6
      }
      
    export enum fieldType {
        HALLWAY = 0,
        WALL = 1,
        HOLE = 2,
        BRICK = 3,
        USABLEITEM = 4,
        STARTPOSITION = 5,
        CONNECTION = 6
      }
      
    export enum Event {
        MOVE = "move",
        DROP = "drop",
        PICKUP = "pickup"
      }
      
    export enum ActionBomb {
        DEFAULT_BOMB = 1
      }
}