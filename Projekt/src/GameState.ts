import { ActivePlayer,Player } from './Player';
import { Brick, Hallway, Hole, Item, Wall } from "./Item";
import { Explosion } from './Explosion';
//import * as io from "socket.io-client";

enum fieldType {
  HALLWAY = 0,
  WALL = 1,
  HOLE = 2,
  BRICK = 3,
  USABLEITEM = 4
}

export class GameState {
  context: any;
  explosions : Explosion[] = [];
  socket : any;

  player : Player[];
  playerPos : any = {
    player0 : null,
    player1 : null,
    player2 : null,
    player3 : null
  };
  field: any[];

  xSize : number;
  width : number;
  ySize : number;
  height : number;

  items: Item[];
  fieldSize: number;


/**
 * 
 * @param player Liste an Spielern, die dem Spiel beigetreten sind
 * evtl. Spieler  zurückgeben nach erfolgreicher Initialisierung
 */

  constructor() {

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
      { y: 1, x: 1, state: fieldType.BRICK},
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
      { y: 5, x: 4, state: fieldType.USABLEITEM },
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

   // const socket = io("http://localhost:3000");
    
   //socket.on('S_ready',function(data : any) {
      
      this.playerNr = data;
      document.write(this.playerNr);
      
     socket.emit('G_ready', "");
    });
    this.field =
		[
			[fieldType.WALL,fieldType.WALL,fieldType.WALL,fieldType.WALL,fieldType.WALL,fieldType.WALL,fieldType.WALL,fieldType.WALL],
			[fieldType.WALL,fieldType.BRICK,fieldType.HALLWAY,fieldType.HALLWAY,fieldType.WALL,fieldType.HALLWAY,fieldType.HALLWAY,fieldType.WALL],
			[fieldType.WALL,fieldType.WALL,fieldType.WALL,fieldType.HALLWAY,fieldType.WALL,fieldType.HALLWAY,fieldType.WALL,fieldType.WALL],
			[fieldType.WALL,fieldType.HALLWAY,fieldType.HALLWAY,fieldType.HALLWAY,fieldType.WALL,fieldType.HALLWAY,fieldType.HALLWAY,fieldType.WALL],
			[fieldType.WALL,fieldType.WALL,fieldType.WALL,fieldType.HALLWAY,fieldType.WALL,fieldType.HALLWAY,fieldType.WALL,fieldType.WALL],
			[fieldType.WALL,fieldType.HALLWAY,fieldType.HALLWAY,fieldType.HALLWAY,fieldType.HALLWAY,fieldType.HALLWAY,fieldType.HALLWAY,fieldType.WALL],
			[fieldType.WALL,fieldType.HALLWAY,fieldType.WALL,fieldType.HALLWAY,fieldType.WALL,fieldType.HALLWAY,fieldType.HOLE,fieldType.WALL],
			[fieldType.WALL,fieldType.WALL,fieldType.WALL,fieldType.WALL,fieldType.WALL,fieldType.WALL,fieldType.WALL,fieldType.WALL]
		];
    this.player = [new ActivePlayer(this.context)];
    const canvas = <HTMLCanvasElement>document.getElementById("background");

    this.context = canvas.getContext("2d");

    this.width = 8;
    this.height = 8; 

    this.xSize = (canvas.width-300) / this.width;
    this.ySize = canvas.height / this.height;

    this.fieldSize = this.field.length;

    this.items = new Array();
    
    var item : Hallway;// Nur zum testen


    for (let i = 0; i < this.width; i++) {
    for (let j = 0; j < this.height; j++) {
      switch (this.field[i][j]) {
        case fieldType.HALLWAY:
          this.items.push(
            new Hallway(this.context, j, i, this.xSize, this.ySize)
          );
          item = <Hallway> this.items[j]; // Test
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
          var item : Hallway = new Hallway(this.context, j, i, this.xSize, this.ySize);
          item.brickOnItem = new Brick(this.context, j, i, this.xSize, this.ySize, item);
            this.items.push(item);
      }
    }
	} 
    for(let elem of this.player){
      elem.initField(this, item);
    }
    this.playerPos["player0"] = item.x + item.y * 8;
    //this.player.initField(this, item);
    
  }

  updateIncommingPlayerMove(playerName : string, move : number){
    
  }

  update(){
    for(let i = 0; i < this.items.length; i++){
      if(this.items[i] instanceof Hallway){
        var tmpItem = <Hallway> this.items[i];
        if(tmpItem.bombOnItem !== null){
          if(tmpItem.bombOnItem.explode){
            this.explosions.push(new Explosion(tmpItem, this,3));
          }
        }
      }
    }
    for(let elem of this.explosions){
      elem.update();
    }

    for(let elem of this.items){
      elem.update();
    }
    for(let elem of this.player){
      elem.renderPlayer()
    }
  }

  sendMove() {}

  drawGame(){
    for(let elem of this.items){
      elem.draw();
    }
    for(let elem of this.player){
      elem.drawPlayer();
    }

  }

  updateGameInfos(){
    this.context.clearRect(480, 0, 300, 480);
    this.context.fillStyle = "yellow";
    this.context.fillRect(480,0, 300, 480);
    this.context.fillStyle = "blue";
    this.context.font = "30px Arial";
    this.context.fillText("Player: " + "TESTNAME", 500, 50);
    this.context.font = "10px Arial";
    this.context.fillText("Punkte: " + "0", 520, 75);
    if(!this.player[0].alive){
      this.context.fillStyle = "red";
      this.context.fillRect(600,60, 100, 20);
      this.context.fillStyle = "yellow";
      this.context.font = "10px Arial";
      this.context.fillText("You loooose xD", 600, 75);
    }
    if(this.player[0].inventory != null){
      this.player[0].inventory.draw();
    }
  }

  returnPlayer() : Player[]{
    return this.player;
  }
}
