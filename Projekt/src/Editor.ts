import {cvsElem} from "./cvsElem"

enum fieldType {
  HALLWAY = 0,
  WALL = 1,
  HOLE = 2,
  BRICK = 3
}

export class Editor {

cvs:HTMLCanvasElement;
ctx:CanvasRenderingContext2D;
gameAreaWidth:number;
gameAreaHeight:number;
fieldSquareLen:number;
buttonHeight:number;

fields:number[][];
tmpFields:number[];
tileset:HTMLImageElement[];
value:string;
item:number;
boardWidth:number;
boardHeight:number;
startPosX:number;
startPosY:number;
entry:number[][];

cvsElems:cvsElem[];

timeoutIncoming : boolean = false;

constructor() {

	const cvs = <HTMLCanvasElement>document.getElementById("background");
	this.cvs = cvs;
	const ctx = cvs.getContext("2d");
	this.ctx = ctx;

	this.boardWidth = 10;
	this.boardHeight = 13;
	this.fieldSquareLen = 60;
	this.gameAreaWidth = this.boardWidth*this.fieldSquareLen;
	this.gameAreaHeight = this.boardHeight*this.fieldSquareLen;

	this.cvs.width = this.gameAreaWidth+300;
	this.cvs.height = this.gameAreaHeight;

	this.fields = new Array<Array<number>>();
	for (let i = 0; i < this.boardHeight; i++) {
		this.tmpFields = new Array<number>();
		for (let j = 0; j < this.boardWidth; j++) {
			this.tmpFields[j] = fieldType.WALL;
		}
		this.fields[i] = this.tmpFields;
	}

	this.tileset = new Array<HTMLImageElement>();
	this.chgTs("tileset1");
	this.item = fieldType.BRICK;

	for (let i = 1; i < this.boardHeight; i++) {
		this.drawLine(0, i*this.fieldSquareLen, this.gameAreaWidth, i*this.fieldSquareLen);
	}
	for (let i = 1; i < this.boardWidth; i++) {
		this.drawLine(i*this.fieldSquareLen, 0, i*this.fieldSquareLen, this.gameAreaHeight);
	}
	let inputMap = document.createElement("textarea");
	inputMap.setAttribute('id', 'inputMap');
	document.body.append(inputMap);
	const saveIcon = new Image(300,300);
	saveIcon.src = "icons/save.jpg";
	const loadIcon = new Image(300,300);
	loadIcon.src = "icons/load.jpg";
	this.cvsElems = [
		new cvsElem(this.gameAreaWidth    , 0  , 75, 75, () => {this.setItem(0)}, this.tileset[0]),
		new cvsElem(this.gameAreaWidth+75 , 0  , 150, 75, () => {this.setItem(1)}, this.tileset[1]),
		new cvsElem(this.gameAreaWidth+150, 0, 75, 75, () => {this.setItem(2)}, this.tileset[2]),
		new cvsElem(this.gameAreaWidth+225, 0, 75, 75, () => {this.setItem(3)}, this.tileset[3]),
		new cvsElem(this.gameAreaWidth    , 75, 150, 150, this.saveMap.bind(this), saveIcon),
		new cvsElem(this.gameAreaWidth+150, 75, 150, 150, () => {this.loadMap(inputMap.value)}, loadIcon)
	];

	this.drawCvs();

	//TODO eventListener for selecting fieldTypes
	//TODO eventListener for LoadMap
	this.cvs.addEventListener('click', this.cvsClick.bind(this));
	this.initTimeOut();
}

// Functions -----------------------------------------

setItem(item:number) {
	this.item = item;
}

drawLine(xStart:number, yStart:number, xEnd:number, yEnd:number) {
	this.ctx.beginPath();
	this.ctx.moveTo(xStart,yStart);
	this.ctx.lineTo(xEnd,yEnd);
	this.ctx.stroke();
}

drawBoardArea() {
	for (let i = 0; i < this.boardHeight; i++) {
		for (let j = 0; j < this.boardWidth; j++) {
			this.ctx.drawImage(this.tileset[this.fields[i][j]], j*this.fieldSquareLen, i*this.fieldSquareLen , this.fieldSquareLen, this.fieldSquareLen);
		}
	}
}

drawFieldSelectionArea() {
	let cvs = <HTMLCanvasElement>document.getElementById("background");
	let ctx = cvs.getContext("2d");
	for (let i = 0; i < this.cvsElems.length; i++) {
		ctx.drawImage(this.cvsElems[i].pic, this.cvsElems[i].x, this.cvsElems[i].y, this.cvsElems[i].width, this.cvsElems[i].height);
	}
}

drawCvs() {
	this.drawBoardArea();
	this.drawFieldSelectionArea();
}

chgTs(path:string) {
	this.tileset[0] = new Image(this.fieldSquareLen, this.fieldSquareLen);
	this.tileset[0].src = "tilesets/"+path+"/hallway.jpg";
	this.tileset[1] = new Image(this.fieldSquareLen, this.fieldSquareLen);
	this.tileset[1].src = "tilesets/"+path+"/wall.jpg";
	this.tileset[2] = new Image(this.fieldSquareLen, this.fieldSquareLen);
	this.tileset[2].src = "tilesets/"+path+"/hole.jpg";
	this.tileset[3] = new Image(this.fieldSquareLen, this.fieldSquareLen);
	this.tileset[3].src = "tilesets/"+path+"/brick.jpg";
}

cvsClick(evt:MouseEvent) {
	let xPix:number = evt.layerX - this.cvs.offsetLeft;
	let yPix:number = evt.layerY - this.cvs.offsetTop;
	if(xPix < this.gameAreaWidth) {
		let x:number = Math.floor(xPix/this.fieldSquareLen);
		let y:number = Math.floor(yPix/this.fieldSquareLen);
		this.fields[y][x] = this.item;
		this.ctx.drawImage(this.tileset[this.item], x*this.fieldSquareLen, y*this.fieldSquareLen, this.fieldSquareLen, this.fieldSquareLen);
	}
	else {
		const cvsElem = this.collides(this.cvsElems, xPix, yPix);
		cvsElem.f();
	}
}

collides(cvsElems:cvsElem[], x:number, y:number) {
    var isCollision;
    for (let i = 0, len = cvsElems.length; i < len; i++) {
        let left = cvsElems[i].x, right  = cvsElems[i].x+cvsElems[i].width;
        let top  = cvsElems[i].y, bottom = cvsElems[i].y+cvsElems[i].height;
        if (right >= x
            && left <= x
            && bottom >= y
            && top <= y) {
            isCollision = cvsElems[i];
        }
    }
    return isCollision;
}

saveMap() {
	var map = "[\n";
	for (let i = 0; i < this.boardHeight; i++) {
		map += "[";
		for (let j = 0; j < this.boardWidth; j++) {
			map += this.fields[i][j];
			if (j != this.boardWidth-1) map += ',';
		}
		map += "],\n";
	}
	map += "];\n";
	console.log(map);
}

loadMap(mapStr:string) {
	var mapArr = [];
	var linePos = 0;
	var colPos = 0;
	for(let totalPos = 3; mapStr[totalPos] != undefined; totalPos++) {
		var line = [];
		while(mapStr[totalPos] != '\n' && mapStr[totalPos] != undefined) {
			const nxtChar = mapStr[totalPos];
			if (nxtChar != ',' && nxtChar != '[' && nxtChar != ']' && nxtChar != ';') {
				line.push(mapStr[totalPos]);
				linePos++;
			}
			totalPos++;
			console.log(totalPos);
		}
		linePos = 0;
		mapArr[colPos] = line;
		colPos++;
	}
	for (let i = 0; i < this.boardHeight; i++) {
		for (let j = 0; j <this.boardWidth; j++) {
			this.fields[i][j] = Number(mapArr[i][j]);
		}
	}	console.log(mapArr);
	this.drawCvs();
}

public initTimeOut(){
	setTimeout(function(){this.timeoutIncoming = true; this.drawEditor()}.bind(this), 1000 * 1);  // Konstante abhängig vom Timeout am Server
}

public drawEditor(){
	if(this.timeoutIncoming){
		this.ctx.globalAlpha = 0.5;
		this.ctx.fillStyle = "grey";
		this.ctx.fillRect(0, 0, 480, 480);
		this.ctx.globalAlpha = 1.0;
		this.ctx.fillStyle = "red";
		this.ctx.font = "50px Arial";
		this.ctx.fillText("Timeout", 100, 200);
	}
}

public cleanUpPage(){
	this.ctx.clearRect(0,0,10000, 10000);
	var element = document.getElementById('inputMap');
    element.parentNode.removeChild(element);
}
}
