import { Field } from "./Field";
import { Hallway, Item, Fire } from "./Item";

export class Explosion {
  //bombFields: Item[] = [];
  explosionRad: number;
  counter: number = 1;
  field: Field;
  startPosX: number;
  startPosY: number;

  constructor(item: Hallway, field: Field) {
    this.explosionRad = 3;

    this.field = field;

    this.startPosX = item.x;
    this.startPosY = item.y;
  }

  pushTobombFieldsArray(pos: number) {
    var inBounds: boolean = pos >= 0 && pos < this.field.items.length;
    if (inBounds) {
      if (this.field.items[pos] instanceof Hallway) {
        this.field.items[pos].setOnFire();
        //   var tmpItem = <Hallway> this.field.items[pos];
        //   tmpItem.onFire = new Fire(tmpItem.context,tmpItem.x, tmpItem.y, tmpItem.SIZE_X, tmpItem.SIZE_Y, tmpItem);
      }
    }
  }

  update() {
    if (this.counter < this.explosionRad) {
      var posNorth = (this.startPosY - this.counter) * 8 + this.startPosX;
      var posSouth = (this.startPosY + this.counter) * 8 + this.startPosX;
      var posWest = this.startPosY * 8 + (this.startPosX - this.counter);
      var posEast = this.startPosY * 8 + (this.startPosX + this.counter);

      this.pushTobombFieldsArray(posSouth);
      this.pushTobombFieldsArray(posNorth);
      this.pushTobombFieldsArray(posWest);
      this.pushTobombFieldsArray(posEast);

      ++this.counter;
    }
  }
}
