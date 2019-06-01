import { Item, Hallway, Wall, Hole } from "./Item";

enum fieldType {
  HALLWAY = 0,
  WALL = 1,
  HOLE = 2
}

export class Field {
  context: any;

  field: any[];

  xSize : number;
  ySize : number;

  items: Item[];
  fieldSize: number;

  constructor() {
    const canvas = <HTMLCanvasElement>document.getElementById("background");

    this.context = canvas.getContext("2d");

    this.field = [
      { y: 0, x: 0, state: fieldType.WALL },
      { y: 0, x: 1, state: fieldType.WALL },
      { y: 0, x: 2, state: fieldType.WALL },
      { y: 0, x: 3, state: fieldType.WALL },
      { y: 0, x: 4, state: fieldType.WALL },
      { y: 0, x: 5, state: fieldType.WALL },
      { y: 0, x: 6, state: fieldType.WALL },
      { y: 0, x: 7, state: fieldType.WALL },

      { y: 1, x: 0, state: fieldType.WALL },
      { y: 1, x: 1, state: fieldType.HALLWAY },
      { y: 1, x: 2, state: fieldType.HALLWAY },
      { y: 1, x: 3, state: fieldType.HALLWAY },
      { y: 1, x: 4, state: fieldType.WALL },
      { y: 1, x: 5, state: fieldType.HALLWAY },
      { y: 1, x: 6, state: fieldType.HALLWAY },
      { y: 1, x: 7, state: fieldType.WALL },

      { y: 2, x: 0, state: fieldType.WALL },
      { y: 2, x: 1, state: fieldType.WALL },
      { y: 2, x: 2, state: fieldType.WALL },
      { y: 2, x: 3, state: fieldType.HALLWAY },
      { y: 2, x: 4, state: fieldType.WALL },
      { y: 2, x: 5, state: fieldType.HALLWAY },
      { y: 2, x: 6, state: fieldType.WALL },
      { y: 2, x: 7, state: fieldType.WALL },

      { y: 3, x: 0, state: fieldType.WALL },
      { y: 3, x: 1, state: fieldType.HALLWAY },
      { y: 3, x: 2, state: fieldType.HALLWAY },
      { y: 3, x: 3, state: fieldType.HALLWAY },
      { y: 3, x: 4, state: fieldType.WALL },
      { y: 3, x: 5, state: fieldType.HALLWAY },
      { y: 3, x: 6, state: fieldType.HALLWAY },
      { y: 3, x: 7, state: fieldType.WALL },

      { y: 4, x: 0, state: fieldType.WALL },
      { y: 4, x: 1, state: fieldType.WALL },
      { y: 4, x: 2, state: fieldType.WALL },
      { y: 4, x: 3, state: fieldType.HALLWAY },
      { y: 4, x: 4, state: fieldType.WALL },
      { y: 4, x: 5, state: fieldType.HALLWAY },
      { y: 4, x: 6, state: fieldType.WALL },
      { y: 4, x: 7, state: fieldType.WALL },

      { y: 5, x: 0, state: fieldType.WALL },
      { y: 5, x: 1, state: fieldType.HALLWAY },
      { y: 5, x: 2, state: fieldType.HALLWAY },
      { y: 5, x: 3, state: fieldType.HALLWAY },
      { y: 5, x: 4, state: fieldType.HALLWAY },
      { y: 5, x: 5, state: fieldType.HALLWAY },
      { y: 5, x: 6, state: fieldType.HALLWAY },
      { y: 5, x: 7, state: fieldType.WALL },

      { y: 6, x: 0, state: fieldType.WALL },
      { y: 6, x: 1, state: fieldType.HALLWAY },
      { y: 6, x: 2, state: fieldType.WALL },
      { y: 6, x: 3, state: fieldType.HALLWAY },
      { y: 6, x: 4, state: fieldType.WALL },
      { y: 6, x: 5, state: fieldType.HALLWAY },
      { y: 6, x: 6, state: fieldType.HOLE },
      { y: 6, x: 7, state: fieldType.WALL },

      { y: 7, x: 0, state: fieldType.WALL },
      { y: 7, x: 1, state: fieldType.WALL },
      { y: 7, x: 2, state: fieldType.WALL },
      { y: 7, x: 3, state: fieldType.WALL },
      { y: 7, x: 4, state: fieldType.WALL },
      { y: 7, x: 5, state: fieldType.WALL },
      { y: 7, x: 6, state: fieldType.WALL },
      { y: 7, x: 7, state: fieldType.WALL }
    ];

    this.fieldSize = this.field.length;

    this.xSize = canvas.width / 8;
    this.ySize = canvas.height / 8;

    this.items = new Array();

    for (let i = 0; i < this.fieldSize; i++) {
      switch (this.field[i].state) {
        case fieldType.HALLWAY:
          this.items.push(
            new Hallway(this.context, this.field[i].x, this.field[i].y, this.xSize, this.ySize)
          );
          break;
        case fieldType.HOLE:
          this.items.push(
            new Hole(this.context, this.field[i].x, this.field[i].y, this.xSize, this.ySize)
          );
          break;
        case fieldType.WALL:
          this.items.push(
            new Wall(this.context, this.field[i].x, this.field[i].y, this.xSize, this.ySize)
          );
          break;
      }
    }
  }

  drawField() {
    for (let i = 0; i < this.items.length; i++) {
      this.items[i].draw();
    }
  }
}
