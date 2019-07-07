import {cvsElem} from "./cvsElem"

enum fieldType {
  HALLWAY = 0,
  WALL = 1,
  HOLE = 2,
  BRICK = 3
}

class Editor {

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

cvsElems:cvsElem[];

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

	const icon = new Image(300,300);
	icon.src = "icons/save.png";
	this.cvsElems = [
		new cvsElem(this.gameAreaWidth    , 0  , 150, 150, () => {this.setItem(0)}, this.tileset[0]),
		new cvsElem(this.gameAreaWidth+150, 0  , 150, 150, () => {this.setItem(1)}, this.tileset[1]),
		new cvsElem(this.gameAreaWidth    , 150, 150, 150, () => {this.setItem(2)}, this.tileset[2]),
		new cvsElem(this.gameAreaWidth+150, 150, 150, 150, () => {this.setItem(3)}, this.tileset[3]),
		new cvsElem(this.gameAreaWidth    , 300, 300, 150, this.saveMap.bind(this), icon)
	];

	this.drawCvs();

	//TODO eventListener for selecting fieldTypes
	//TODO eventListener for LoadMap
	this.cvs.addEventListener('click', this.cvsClick.bind(this));
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
		this.fields[x][y] = this.item;
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


/*saveMap2(map:string) {
	var textFileAsBlob = new Blob([map], {type:'text/plain'});
	let fileName : string = "neue Karte"; 
	var downloadLink = document.createElement("a");
	downloadLink.download = fileName;
	downloadLink.innerHTML = "Download File";

	if ((window as any).webkitURL != null)
	{
		// Chrome allows the link to be clicked
		// without actually adding it to the DOM.
		downloadLink.href = (window as any).webkitURL.createObjectURL(textFileAsBlob);
	}
	else
	{
		// Firefox requires the link to be added to the DOM
		// before it can be clicked.
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		downloadLink.onclick = document.body.removeChild(event.target);
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
	}
	downloadLink.click();
}*/

saveMap(name:string) {
	var map = "[\n";
	for (let i = 0; i < this.boardHeight; i++) {
		map += "[";
		for (let j = 0; j < this.boardWidth; j++) {
			map += this.fields[i][j];
			if (j != this.boardWidth-1) map += ',';
		}
		map += "]\n";
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
		while(mapStr[totalPos] != '\n') {
			const nxtChar = mapStr[totalPos];
			if (nxtChar != ',' && nxtChar != '[' && nxtChar != ']' && nxtChar != ';') {
				line.push(mapStr[totalPos]);
				linePos++;
			}
			totalPos++;
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

/*readSingleFile(e:MouseEvent) {
	var file = e.target.files[0];
	if (!file) {
		return;
	}
	var reader = new FileReader();
	reader.onload = (e) => {
	var contents = e.target.result;
	this.loadMap(contents);
	};
	reader.readAsText(file);
}*/

}

new Editor();