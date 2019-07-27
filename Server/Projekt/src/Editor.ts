import { CustomArea, EnemyArea, MenuElement } from "./EditorUtil";
import {Enums } from './Enums'
import { GameState } from "./GameState";
import { Game } from "./Game";
import { Consts } from "./Consts";

enum fieldType {
  HALLWAY = 0,
  WALL = 1,
  HOLE = 2,
  BRICK = 3,
  STARTPOSITION = 4,
  CONNECTION = 5
}

enum serverState {
  SELECTION = 0,
  ROOM_WAIT = 1,
  DESIGN = 2,
  FIELD_WAIT = 3,
  GAME = 4,
  GAMEOVER = 5,
  WINNER = 6
}

export class Editor {
  gameState: GameState

  canvas: HTMLCanvasElement
  context: CanvasRenderingContext2D
  menuWidth: number = 300
  menuButtonWidth = this.menuWidth/4
  mapPixelWidth: number
  mapPixelHeight: number
  tileWidth: number
  tileHeight:number
  fields: number[][]
  boardHeight: number = 13
  boardWidth: number = 19
  tileset: HTMLImageElement[]
  value: string
  item: number

  mapCenter = {
    pixelX: 0,
    pixelY: 0,
    fieldY: 0,
    fieldX: 0
  };
  startPosition = { y: 0, x: 0 };

  enemyAreas: EnemyArea[];
  customArea: CustomArea;
  editMenu: MenuElement[];
  fieldMenu:MenuElement[];

  playerNr: number;
  alreadyVisited: { y: number; x: number }[];
  tileImagesLoaded:boolean = false
  mapInputTextfield:HTMLInputElement

  constructor(gameState: GameState) {

    let x = new Image(50,50)

    let y = new MenuElement(
      0,0,50,50,()=>{console.log("xxx")}, x 
    )
    

    console.log(y)
    this.gameState = gameState
    this.startPosition.y = undefined
    this.startPosition.x = undefined

    const canvas = <HTMLCanvasElement>document.getElementById("background")
    this.canvas = canvas
    const context = canvas.getContext("2d")
    this.context = context
    this.context.strokeRect(0, 0, this.canvas.width, this.canvas.height)

    this.mapPixelWidth  = this.canvas.width - this.menuWidth
    this.mapPixelHeight = this.canvas.height

    this.tileWidth  = this.mapPixelWidth / this.boardWidth
    this.tileHeight = this.canvas.height / this.boardHeight

    this.playerNr = gameState.clientId;
    this.playerNr = 0
    const topLeftCorners: { x: number; y: number }[] = [
      { x: 0,  y: 0},
      { x: Math.ceil(this.boardWidth / 2) * this.tileWidth, y: 0 },
      {
        x: Math.floor(this.boardWidth / 2) * this.tileWidth,
        y: Math.ceil(this.boardHeight / 2) * this.tileHeight
      },
      { x: 0, y: Math.floor(this.boardHeight / 2) * this.tileHeight }
    ];
    const dimensions: { x: number, y: number }[] = [
      {
        x: Math.ceil(this.boardWidth / 2) * this.tileWidth,
        y: Math.floor(this.boardHeight / 2) * this.tileHeight
      },
      {
        x: Math.floor(this.boardWidth / 2) * this.tileWidth,
        y: Math.ceil(this.boardHeight / 2) * this.tileHeight
      },
      {
        x: Math.ceil(this.boardWidth / 2) * this.tileWidth,
        y: Math.floor(this.boardHeight / 2) * this.tileHeight
      },
      {
        x: Math.floor(this.boardWidth / 2) * this.tileWidth,
        y: Math.ceil(this.boardHeight / 2) * this.tileHeight
      }
    ];

    this.enemyAreas = new Array<EnemyArea>();

    for (let p = 0; p < 4; p++) {
      if (p == this.playerNr)
        this.customArea = new CustomArea(
          topLeftCorners[p].x,
          topLeftCorners[p].y,
          dimensions[p].x,
          dimensions[p].y,
          this.tileWidth,
          this.tileHeight
        );
      else
        this.enemyAreas.push(
          new EnemyArea(
            topLeftCorners[p].x,
            topLeftCorners[p].y,
            dimensions[p].x,
            dimensions[p].y
          )
        );
    }
    this.mapCenter.pixelX = Math.floor(this.boardWidth  / 2) * this.tileWidth
    this.mapCenter.pixelY = Math.floor(this.boardHeight / 2) * this.tileHeight
    this.mapCenter.fieldY = Math.floor(this.boardHeight / 2) - this.customArea.topLeftFieldY;
    this.mapCenter.fieldX = Math.floor(this.boardWidth / 2)  - this.customArea.topLeftFieldX;

    this.fields = new Array<Array<number>>();
    for (let y = 0; y < this.customArea.boardHeight; y++) {
      let row_y = new Array<number>();
      for (let x = 0; x < this.customArea.boardWidth; x++) {
        row_y[x] = fieldType.WALL;
      }
      this.fields[y] = row_y;
    }

    this.tileset = new Array<HTMLImageElement>();
    this.changeTileset("tileset1");
    this.item = fieldType.BRICK;

    for (let x = 1; x < this.boardWidth; x++) {
      this.drawLine(
        x * this.tileWidth,
        0,
        x * this.tileWidth,
        this.mapPixelHeight
      );
    }
    for (let y = 1; y < this.boardHeight; y++) {
      this.drawLine(
        0,
        y * this.tileHeight,
        this.mapPixelWidth,
        y * this.tileHeight
      );
      }    

/*    this.menuElements = [
      new MenuElement(
        this.mapPixelWidth,
        0,
        75,
        75,
        () => {
          this.item = 0;
        },
        this.tileset[Enums.fieldType.HALLWAY]
      ),
      new MenuElement(
        this.mapPixelWidth + 75,
        0,
        75,
        75,
        () => {
          this.item = 1;
        },
        this.tileset[Enums.fieldType.WALL]
      ),
      new MenuElement(
        this.mapPixelWidth + 150,
        0,
        75,
        75,
        () => {
          this.item = 2;
        },
        this.tileset[Enums.fieldType.HOLE]
      ),
      new MenuElement(
        this.mapPixelWidth + 225,
        0,
        75,
        75,
        () => {
          this.item = 3;
        },
        this.tileset[Enums.fieldType.BRICK]
      ),
      new MenuElement(
        this.mapPixelWidth,
        75,
        75,
        75,
        () => {
          this.item = 4;
        },
        this.tileset[Enums.fieldType.STARTPOSITION]
      ),
      new MenuElement(
        this.mapPixelWidth,
        150,
        150,
        150,
        this.saveMap.bind(this),
        saveIcon
      ),
      new MenuElement(
        this.mapPixelWidth + 150,
        150,
        150,
        150,
        () => {
          this.loadMap(inputMap.value);
        },
        loadIcon
      ),
      new MenuElement(
        this.mapPixelWidth,
        300,
        150,
        150,
        () => {
          this.alreadyVisited = new Array();
          if (this.startCheckingPath()) console.log("Path ok");
          else console.log("Not ok");
        },
        checkPathIcon
      )
    ];
*/

    this.canvas.addEventListener("click", this.canvasClick.bind(this));
    this.drawCanvas()
  }

  drawLine(xStart: number, yStart: number, xEnd: number, yEnd: number) {
    this.context.beginPath();
    this.context.moveTo(xStart, yStart);
    this.context.lineTo(xEnd, yEnd);
    this.context.stroke();
  }

  arrayContains(
    array: { y: number; x: number }[],
    element: { y: number; x: number }
  ) {
    const len = array.length;
    for (let i = 0; i < len; i++) {
      if (array[i].y == element.y && array[i].x == element.y) return true;
    }
    return false;
  }

  drawFixedTiles() {
    this.context.drawImage(
      this.tileset[fieldType.CONNECTION],
      this.mapCenter.pixelX,
      this.mapCenter.pixelY,
      this.tileWidth,
      this.tileHeight
    );
  }

  drawEnemyAreas() {
    this.context.fillStyle = "blue";
    this.context.lineWidth = 1;
    this.context.strokeStyle = "black";
    for (let id = 0; id < this.enemyAreas.length; id++) {
      this.context.fillRect(
        this.enemyAreas[id].topLeftPixelX,
        this.enemyAreas[id].topLeftPixelY,
        this.enemyAreas[id].pixelWidth,
        this.enemyAreas[id].pixelHeight
      );
      this.context.beginPath();
      this.context.rect(
        this.enemyAreas[id].topLeftPixelX,
        this.enemyAreas[id].topLeftPixelY,
        this.enemyAreas[id].pixelWidth,
        this.enemyAreas[id].pixelHeight
      );
      this.context.stroke();
    }
  }

  drawEditableMap() {
    for (let y = 0; y < this.customArea.boardHeight; y++) {
      for (let x = 0; x < this.customArea.boardWidth; x++) {
        this.context.drawImage(
          this.tileset[this.fields[y][x]],
          this.customArea.topLeftPixelX + x * this.tileWidth,
          this.customArea.topLeftPixelY + y * this.tileHeight,
          this.tileWidth,
          this.tileHeight
          );
      }
    }
  }
/*
  createEditMenu(iconImages:HTMLImageElement[]) {
    function buttonCheckPath() {
      this.alreadyVisited = new Array()
      if (this.startCheckingPath())
        console.log("Path ok");
      else 
        console.log("Not ok");
    }

    function ready() {
      this.gameState.socket.emit("proposedField", this.fields)
    }

    let editMenuFunctions = [
      this.saveMap.bind(this),
      this.loadMap(this.mapInputTextfield.value),
      buttonCheckPath,
      ready
    ]
    
    {
      let col = 0
      let row = 0
      for (let i = 0; i < this.tileset.length; i++) {
        let itemNumber = i
        this.editMenu[i] = new MenuElement(
          row*this.menuButtonWidth + col *this.menuButtonWidth,
          i*this.menuButtonWidth,
          this.menuButtonWidth,
          this.menuButtonWidth,
          editMenuFunctions[i],
          iconImages[i]
        )
        col = col - 2 * col + 1 // Flip {0,1}
        row += col
      }
    }

  }*/
/*
  loadIcons() {
    const menuIconPaths = [
      "images/savemapicon.png",
      "images/loadmapicon.png",
      "images/checkpathicon.png",
    ]
    let iconImages:HTMLImageElement[]
    let count = 0
    for (let i = 0; i < menuIconPaths.length; i++) {
      let img = new Image(this.menuButtonWidth, this.menuButtonWidth);
      img.onload = function() {
        ++count;
        if (count >= menuIconPaths.length) {
          this.createEditMenuElements(iconImages);
          console.log("here")
        }
      }.bind(this);
      img.src = menuIconPaths[i];
      iconImages[i] = img;
    }
  }
*/
  drawCanvas() {
    this.drawEnemyAreas();
    this.drawEditableMap();
    this.drawFieldMenu();
    this.drawFixedTiles();
  }

waitForImages(paths:string[], destination:HTMLImageElement[]) {
	let count = 0
	for (let i = 0; i < paths.length; i++) {
		let img = new Image(this.tileWidth, this.tileHeight)
		img.onload = function() {
			++count;
			if (count >= paths.length) {
        this.drawEditableMap()
        this.drawFieldMenu()
			}
		}.bind(this);
		img.src = paths[i];
		destination[i] = img;
	}
}

  drawFieldMenu() {

      let col = 0
      let row = 0
      for (let i = 0; i < this.tileset.length; i++) {
        let itemNumber = i
        let fM = new MenuElement(
          this.mapPixelWidth + col *this.menuButtonWidth,
          row*this.menuButtonWidth,
          this.menuButtonWidth,
          this.menuButtonWidth,
          () => { this.item = itemNumber },
          this.tileset[i]
        )
        this.context.drawImage(
          fM.pic,
          fM.x,
          fM.y,
          fM.width,
          fM.height
        );
        if (col == 4) {
          col = 0
          row++
        }

        }
    
  }
//this.gameState.socket.emit("proposedField", field)
  changeTileset(path: string) {
    let count = 0;
    const paths = [
      "tilesets/" + path + "/hallway.jpg",
      "tilesets/" + path + "/wall.jpg",
      "tilesets/" + path + "/hole.jpg",
      "tilesets/" + path + "/brick.jpg",
      "tilesets/" + path + "/startposition.jpg",
      "tilesets/" + path + "/connection.jpg"
    ];
    this.waitForImages(paths, this.tileset)
  }

  canvasClick(event: MouseEvent) {
    if (this.gameState.state === serverState.DESIGN) {
      let xPixel: number = event.layerX - this.canvas.offsetLeft;
      let yPixel: number = event.layerY - this.canvas.offsetTop;
      if (xPixel < this.mapPixelWidth) {
        //Make coordinates relative to top-left of customArea
        xPixel -= this.customArea.topLeftPixelX;
        yPixel -= this.customArea.topLeftPixelY;
      }
      if (
        xPixel > 0 &&
        yPixel > 0 &&
        xPixel < this.customArea.pixelWidth &&
        yPixel < this.customArea.pixelHeight
      ) {
        let row: number = Math.floor(yPixel / this.tileHeight);
        let col: number = Math.floor(xPixel / this.tileWidth);
        if (this.fields[row][col] == fieldType.STARTPOSITION) {
          this.startPosition.x = undefined;
          this.startPosition.y = undefined;
        }
        this.fields[row][col] = this.item;
        this.context.drawImage(
          this.tileset[this.item],
          this.customArea.topLeftPixelX + col * this.tileWidth,
          this.customArea.topLeftPixelY + row * this.tileHeight,
          this.tileWidth,
          this.tileHeight
        );
        if (this.item == fieldType.STARTPOSITION) {
          if (this.startPosition.y != undefined)
            this.fields[this.startPosition.y][this.startPosition.x] = fieldType.HALLWAY;
          this.context.drawImage(
            this.tileset[fieldType.HALLWAY],
            this.customArea.topLeftPixelX + this.startPosition.x * this.tileWidth,
            this.customArea.topLeftPixelY + this.startPosition.y * this.tileHeight,
            this.tileWidth,
            this.tileHeight
          );
          this.startPosition.y = row;
          this.startPosition.x = col;
        }
      }
      if (xPixel > this.mapPixelWidth)
        this.getClickedMenuElement(this.fieldMenu, yPixel, xPixel).f();
    }
  }

  getClickedMenuElement(
    menuElements: MenuElement[],
    yClick: number,
    xClick: number
  ) {
    let clickedElement;

    for (let i = 0, len = menuElements.length; i < len; i++) {
      let top = menuElements[i].y,
        bottom = menuElements[i].y + menuElements[i].height;
      let left = menuElements[i].x,
        right = menuElements[i].x + menuElements[i].width;
      if (
        right >= xClick &&
        left <= xClick &&
        bottom >= yClick &&
        top <= yClick
      ) {
        clickedElement = menuElements[i];
      }
    }
    return clickedElement;
  }

  checkPath(y: number, x: number) {
    if (
      (y - 1 == this.mapCenter.fieldY && x == this.mapCenter.fieldX) ||
      (y == this.mapCenter.fieldY && x + 1 == this.mapCenter.fieldX) ||
      (y + 1 == this.mapCenter.fieldY && x == this.mapCenter.fieldX) ||
      (y == this.mapCenter.fieldY && x - 1 == this.mapCenter.fieldX)
    ) {
      console.log("Basisfall erreicht");
      return true;
    } else {
      console.log("y: " + y + " x: " + x);
      this.alreadyVisited.push({ y: y, x: x });
      console.log("av" + this.alreadyVisited);
      if (y - 1 > 0)
        if (
          this.fields[y - 1][x] === fieldType.HALLWAY &&
          !this.arrayContains(this.alreadyVisited, { y: y - 1, x: x })
        ) {
          this.checkPath(y - 1, x);
        }
      if (x + 1 < this.customArea.boardWidth)
        if (
          this.fields[y][x + 1] === fieldType.HALLWAY &&
          !this.arrayContains(this.alreadyVisited, { y: y, x: x + 1 })
        ) {
          this.checkPath(y, x + 1);
        }
      if (y + 1 > this.customArea.boardHeight)
        if (
          this.fields[y + 1][x] === fieldType.HALLWAY &&
          !this.arrayContains(this.alreadyVisited, { y: y, x: x + 1 })
        ) {
          this.checkPath(y + 1, x);
        }
      if (x - 1 > 0)
        if (
          this.fields[y][x - 1] === fieldType.HALLWAY &&
          !this.arrayContains(this.alreadyVisited, { y: y, x: x - 1 })
        ) {
          this.checkPath(y, x - 1);
        }
    }
  }

  startCheckingPath() {
    if (this.startPosition.y != undefined) {
      console.log(
        "centerX: " +
          this.mapCenter.fieldY +
          " centerY: " +
          this.mapCenter.fieldX
      );
      console.log(
        "startX: " + this.startPosition.y + " startY: " + this.startPosition.x
      );
      return this.checkPath(this.startPosition.y, this.startPosition.x);
    } else console.log("No startposition");
    return false;
  }

  saveMap() {
    var map = "[\n";
    for (let y = 0; y < this.customArea.boardHeight; y++) {
      map += "[";
      for (let x = 0; x < this.customArea.boardWidth; x++) {
        map += this.fields[y][x];
        if (x != this.boardWidth - 1) map += ",";
      }
      map += "],\n";
    }
    map += "];\n";
    console.log(map);
  }

  loadMap(mapStr: string) {
    var mapArr = [];
    var rowPos = 0;
    var rowNr = 0;
    for (let totalPos = 3; mapStr[totalPos] != undefined; totalPos++) {
      var row = [];
      while (mapStr[totalPos] != "\n" && mapStr[totalPos] != undefined) {
        const nxtChar = mapStr[totalPos];
        if (
          nxtChar != "," &&
          nxtChar != "[" &&
          nxtChar != "]" &&
          nxtChar != ";"
        ) {
          row.push(mapStr[totalPos]);
          rowPos++;
        }
        totalPos++;
      }
      rowPos = 0;
      mapArr[rowNr] = row;
      rowNr++;
    }
    for (let y = 0; y < this.customArea.boardHeight; y++) {
      for (let x = 0; x < this.customArea.boardWidth; x++) {
        this.fields[y][x] = Number(mapArr[y][x]);
      }
    }
    this.drawCanvas();
  }

  public initTimeOut() {
    setTimeout(
      function() {
        this.drawEditor();
      }.bind(this),
      100000 * 1
    ); // Konstante abhängig vom Timeout am Server
  }

  public drawEditor() {
    this.context.globalAlpha = 0.5;
    this.context.fillStyle = "grey";
    this.context.fillRect(0, 0, 480, 480);
    this.context.globalAlpha = 1.0;
    this.context.fillStyle = "red";
    this.context.font = "50px Arial";
    this.context.fillText("Timeout", 100, 200);
  }

  public cleanUpPage() {
    this.context.clearRect(0, 0, 10000, 10000);
    var element = document.getElementById("inputMap");
    element.parentNode.removeChild(element);
    this.canvas.removeEventListener("click", this.canvasClick.bind(this));
  }
}
