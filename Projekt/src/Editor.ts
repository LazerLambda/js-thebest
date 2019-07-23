import {CustomArea, EnemyArea, MenuElement} from "./EditorUtil"
import {GameState} from "./GameState"

enum fieldType {
  HALLWAY = 0,
  WALL = 1,
  HOLE = 2,
  BRICK = 3,
  STARTPOSITION = 4,
  CONNECTION = 5
}

export class Editor {

canvas:HTMLCanvasElement
context:CanvasRenderingContext2D
menuWidth:number = 300
fields:number[][];
tileset:HTMLImageElement[]
value:string
item:number
boardHeight:number = 9
boardWidth:number = 9
tileSquareLen:number = 60
mapPixelHeight:number = this.boardHeight*this.tileSquareLen
mapPixelWidth:number  = this.boardWidth *this.tileSquareLen
customArea:CustomArea
mapCenter = {pixelY:Math.floor(this.boardHeight/2)*this.tileSquareLen,
			 pixelX:Math.floor(this.boardWidth/2)*this.tileSquareLen,
			 fieldY:0,
			 fieldX:0}
startPosition = {y:0, x:0}
enemyAreas:EnemyArea[]
playerNr:number
menuElements:MenuElement[];
alreadyVisited: {y:number, x:number}[]

constructor(gameState:GameState) {

	this.startPosition.y = undefined;
	this.startPosition.x = undefined;


	const canvas = <HTMLCanvasElement>document.getElementById("background");
	this.canvas = canvas;
	const context = canvas.getContext("2d");
	this.context = context;

	this.canvas.height = this.mapPixelHeight;
	this.canvas.width = this.mapPixelWidth+this.menuWidth;
	this.playerNr = gameState.clientId
	this.playerNr = 2
	const x:number = Math.ceil (this.boardWidth /2)*this.tileSquareLen
	const topLeftCorners:{x:number,y:number}[] = [
		{y:0,x:0},
		{y:0,x:Math.ceil (this.boardWidth /2)*this.tileSquareLen},
		{y:Math.ceil (this.boardHeight/2)*this.tileSquareLen,x:Math.floor(this.boardWidth /2)*this.tileSquareLen},
		{y:Math.floor(this.boardHeight/2)*this.tileSquareLen,x:0}
	]

	const dimensions:{y:number, x:number}[] = [
		{y:Math.floor(this.boardHeight/2)*this.tileSquareLen,x:Math.ceil (this.boardWidth /2)*this.tileSquareLen},
		{y:Math.ceil (this.boardHeight/2)*this.tileSquareLen,x:Math.floor(this.boardWidth /2)*this.tileSquareLen},
		{y:Math.floor(this.boardHeight/2)*this.tileSquareLen,x:Math.ceil (this.boardWidth /2)*this.tileSquareLen},
		{y:Math.ceil (this.boardHeight/2)*this.tileSquareLen,x:Math.floor(this.boardWidth /2)*this.tileSquareLen}
	]

	this.enemyAreas = new Array<EnemyArea>()

	for (let p = 0; p < 4; p++) {
		if (p == this.playerNr)
			this.customArea = new CustomArea(topLeftCorners[p].y, topLeftCorners[p].x, dimensions[p].y, dimensions[p].x)
		else
			this.enemyAreas.push(new EnemyArea(topLeftCorners[p].y, topLeftCorners[p].x, dimensions[p].y, dimensions[p].x))
	}
	this.mapCenter.fieldY = Math.floor(this.boardHeight/2)-this.customArea.topLeftFieldY
	this.mapCenter.fieldX = Math.floor(this.boardWidth /2)-this.customArea.topLeftFieldX

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

	for (let y = 1; y < this.boardHeight; y++) {
		this.drawLine(y*this.tileSquareLen, 0, y*this.tileSquareLen, this.mapPixelWidth);
	}
	for (let x = 1; x < this.boardWidth; x++) {
		this.drawLine(0, x*this.tileSquareLen, this.mapPixelHeight, x*this.tileSquareLen);
	}

	let inputMap = document.createElement("textarea");
	document.body.append(inputMap);
	const saveIcon = new Image(300,300);
	saveIcon.src = "images/savemapicon.jpg";
	const loadIcon = new Image(300,300);
	loadIcon.src = "images/loadmapicon.jpg";
	const checkPathIcon = new Image(300,150);
	checkPathIcon.src = "images/checkpathicon.jpg"
	this.menuElements = [
		new MenuElement(this.mapPixelWidth    ,   0 , 75,  75, () => {this.item = 0}, this.tileset[fieldType.HALLWAY]),
		new MenuElement(this.mapPixelWidth+ 75,   0,  75,  75, () => {this.item = 1}, this.tileset[fieldType.WALL]),
		new MenuElement(this.mapPixelWidth+150,   0,  75,  75, () => {this.item = 2}, this.tileset[fieldType.HOLE]),
		new MenuElement(this.mapPixelWidth+225,   0,  75,  75, () => {this.item = 3}, this.tileset[fieldType.BRICK]),
		new MenuElement(this.mapPixelWidth    ,  75,  75,  75, () => {this.item = 4}, this.tileset[fieldType.STARTPOSITION]),
		new MenuElement(this.mapPixelWidth    , 150, 150, 150, this.saveMap.bind(this), saveIcon),
		new MenuElement(this.mapPixelWidth+150, 150, 150, 150, () => {this.loadMap(inputMap.value)}, loadIcon),
		new MenuElement(this.mapPixelWidth    , 300, 150, 150,
			 () => {this.alreadyVisited = new Array()
					if(this.startCheckingPath()) console.log("Path ok");
					else console.log("Not ok");
				   }
			,checkPathIcon
		)
	];

	this.canvas.addEventListener('click', this.canvasClick.bind(this))

}

drawLine(yStart:number, xStart:number, yEnd:number, xEnd:number) {
	this.context.beginPath();
	this.context.moveTo(yStart,xStart);
	this.context.lineTo(yEnd,xEnd);
	this.context.stroke();
}

arrayContains(array:{y:number, x:number}[], element:{y:number, x:number})  {
	const len = array.length
	for (let i = 0; i < len; i++) {
		if (array[i].y == element.y && array[i].x == element.y)
			return true
	}
	return false
}

rectangleContains(y:number, x:number, topLeftY:number, topLeftX:number, height:number, width:number) {
	return(
			y > topLeftY &&
			x > topLeftX &&
			y < topLeftX+height &&
			x < topLeftY+width
		  )
}

drawFixedTiles() {
	this.context.drawImage( this.tileset[fieldType.CONNECTION],
							this.mapCenter.pixelX, this.mapCenter.pixelY,
							this.tileSquareLen,this.tileSquareLen);
}

drawEnemyAreas() {

	this.context.fillStyle = "blue";
	this.context.lineWidth = 1;
	this.context.strokeStyle = "black";
	for (let id = 0; id < this.enemyAreas.length; id++) {
		this.context.fillRect(this.enemyAreas[id].topLeftPixelX, this.enemyAreas[id].topLeftPixelY,
						  	  this.enemyAreas[id].pixelWidth, this.enemyAreas[id].pixelHeight);
		this.context.beginPath();
		this.context.rect(this.enemyAreas[id].topLeftPixelX, this.enemyAreas[id].topLeftPixelY,
						  this.enemyAreas[id].pixelWidth, this.enemyAreas[id].pixelHeight);
		this.context.stroke();
	}
}

drawEditableMap() {
	for (let y = 0; y < this.customArea.boardHeight; y++) {
		for (let x = 0; x < this.customArea.boardWidth; x++) {
			this.context.drawImage( this.tileset[this.fields[y][x]],
									this.customArea.topLeftPixelX + x*this.tileSquareLen,
									this.customArea.topLeftPixelY + y*this.tileSquareLen,
									this.tileSquareLen,
									this.tileSquareLen );
		}
	}
}

drawMenu() {
	let canvas = <HTMLCanvasElement>document.getElementById("background");
	let context = canvas.getContext("2d");
	for (let i = 0; i < this.menuElements.length; i++) {
		context.drawImage(this.menuElements[i].pic, this.menuElements[i].x, this.menuElements[i].y, this.menuElements[i].height, this.menuElements[i].width);
	}
}

drawCanvas() {
	this.drawEnemyAreas();
	this.drawEditableMap();
	this.drawMenu();
	this.drawFixedTiles();
}
/*
waitForImages(paths:string[]) {
	let count = 0
	for (let i = 0; i < paths.length; i++) {
		let img = new Image(this.tileSquareLen, this.tileSquareLen);
		img.onload = function() {
			++count;
			if (count >= paths.length) {
				this.drawCanvas();
			}
		}.bind(this);
		img.src = paths[i];
		this.tileset[i] = img;
	}
}
*/
changeTileset(path:string) {
	let count = 0
	const paths = [
		"tilesets/"+path+"/hallway.jpg",
		"tilesets/"+path+"/wall.jpg",
		"tilesets/"+path+"/hole.jpg",
		"tilesets/"+path+"/brick.jpg",
		"tilesets/"+path+"/startposition.jpg",
		"tilesets/"+path+"/connection.jpg"
	]

//	this.waitForImages(paths)
	for (let i = 0; i < paths.length; i++) {
		let img = new Image(this.tileSquareLen, this.tileSquareLen);
		img.onload = function() {
			++count;
			if (count >= paths.length) {
				this.drawCanvas();
			}
		}.bind(this);
		img.src = paths[i];
		this.tileset[i] = img;
	}

}

canvasClick(event:MouseEvent) {
	this.drawCanvas()
	let xPixel:number = event.layerX - this.canvas.offsetLeft
	let yPixel:number = event.layerY - this.canvas.offsetTop
	if (xPixel < this.mapPixelWidth) {
		//Make coordinates relative to top-left of customArea
		xPixel -= this.customArea.topLeftPixelX
		yPixel -= this.customArea.topLeftPixelY
	}

	if (xPixel > 0 && yPixel > 0 && xPixel < this.customArea.pixelWidth&&  yPixel < this.customArea.pixelHeight) {
		let row:number = Math.floor(yPixel/this.tileSquareLen);
		let col:number = Math.floor(xPixel/this.tileSquareLen);
		if(this.fields[row][col] == fieldType.STARTPOSITION) {
			this.startPosition.x = undefined
			this.startPosition.y = undefined
		}
		this.fields[row][col] = this.item;
		this.context.drawImage(	this.tileset[this.item],
								this.customArea.topLeftPixelX + col*this.tileSquareLen,
								this.customArea.topLeftPixelY + row*this.tileSquareLen,
								this.tileSquareLen,
								this.tileSquareLen);
		if (this.item == fieldType.STARTPOSITION) {
			if (this.startPosition.y != undefined)
				this.fields[this.startPosition.y][this.startPosition.x] = fieldType.HALLWAY;
			this.context.drawImage(	this.tileset[fieldType.HALLWAY],
									this.customArea.topLeftPixelX + this.startPosition.x*this.tileSquareLen,
									this.customArea.topLeftPixelY + this.startPosition.y*this.tileSquareLen,
									this.tileSquareLen,
									this.tileSquareLen);
			this.startPosition.y = row;
			this.startPosition.x = col;
		}
	}	if(xPixel > this.mapPixelWidth)
			this.getClickedMenuElement(this.menuElements, yPixel, xPixel).f()
}

getClickedMenuElement(menuElements:MenuElement[], yClick:number, xClick:number) {
    let clickedElement;

    for (let i = 0, len = menuElements.length; i < len; i++) {
        let top = menuElements[i].y, bottom = menuElements[i].y+menuElements[i].height;
        let left  = menuElements[i].x, right = menuElements[i].x+menuElements[i].width;
        if (   right  >= xClick
            && left   <= xClick
            && bottom >= yClick
            && top    <= yClick) {
			clickedElement = menuElements[i];
        }
    }
    return clickedElement;
}

checkPath(y:number, x:number) {
	if ((y-1 == this.mapCenter.fieldY && x   == this.mapCenter.fieldX) ||
		(y   == this.mapCenter.fieldY && x+1 == this.mapCenter.fieldX) ||
		(y+1 == this.mapCenter.fieldY && x   == this.mapCenter.fieldX) ||
		(y   == this.mapCenter.fieldY && x-1 == this.mapCenter.fieldX))
	{
		console.log("Basisfall erreicht")
		return true
	} else {
		console.log("y: "+y+" x: "+x);
		this.alreadyVisited.push({y:y, x:x})
		console.log("av"+this.alreadyVisited)
		if (y-1 > 0)
			if ((this.fields[y-1][x] === fieldType.HALLWAY)
				&& !this.arrayContains(this.alreadyVisited, {y:y-1, x:x})) {
				this.checkPath(y-1, x)
			}
		if (x+1 < this.customArea.boardWidth)
			if ((this.fields[y][x+1] === fieldType.HALLWAY)
				&& !this.arrayContains(this.alreadyVisited, {y:y, x:x+1})) {
				this.checkPath(y, x+1)
			}
		if (y+1 > this.customArea.boardHeight)
			if ((this.fields[y+1][x] === fieldType.HALLWAY)
				&& !this.arrayContains(this.alreadyVisited, {y:y, x:x+1})) {
				this.checkPath(y+1, x)
			}
		if (x-1 > 0)
			if ((this.fields[y][x-1] === fieldType.HALLWAY)
				&& !this.arrayContains(this.alreadyVisited, {y:y, x:x-1})) {
				this.checkPath(y, x-1)
			}
	}
}

startCheckingPath() {
	if (this.startPosition.y != undefined) {
		console.log("centerX: "+ this.mapCenter.fieldY+" centerY: "+this.mapCenter.fieldX);
		console.log("startX: "+this.startPosition.y+" startY: "+this.startPosition.x);
		return this.checkPath(this.startPosition.y, this.startPosition.x)
	}
	else (console.log("No startposition"))
	return false

}

saveMap() {
	var map = "[\n";
	for (let y = 0; y < this.customArea.boardHeight; y++) {
		map += "[";
		for (let x = 0; x < this.customArea.boardWidth; x++) {
			map += this.fields[y][x];
			if (x != this.boardWidth-1) map += ',';
		}
		map += "],\n";
	}
	map += "];\n";
	console.log(map);
}

loadMap(mapStr:string) {
	var mapArr = [];
	var rowPos = 0;
	var rowNr = 0;
	for(let totalPos = 3; mapStr[totalPos] != undefined; totalPos++) {
		var row = [];
		while(mapStr[totalPos] != '\n' && mapStr[totalPos] != undefined) {
			const nxtChar = mapStr[totalPos];
			if (nxtChar != ',' && nxtChar != '[' && nxtChar != ']' && nxtChar != ';') {
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
		for (let x = 0; x <this.customArea.boardWidth; x++) {
			this.fields[y][x] = Number(mapArr[y][x]);
		}
	}
	this.drawCanvas();
}

}
