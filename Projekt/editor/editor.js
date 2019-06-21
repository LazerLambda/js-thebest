// Canvas and fieldsArray--------------------------------

const HALLWAY = 0;
const WALL = 1;
const HOLE = 2;
const BRICK = 3;
const tiles = [];
var item = WALL;

cvs = document.getElementById("cv");
ctx = cvs.getContext("2d");
const gameWidth = 8;
const gameHeight = 8;
const fieldWidth = cvs.height/gameWidth;
const fieldHeight = cvs.width/gameHeight;

for (let i = 1; i < gameWidth; i++) {
	drawLine(i*fieldWidth, 0, i*fieldWidth, cvs.height);
}
for (let i = 1; i < gameHeight; i++) {
	drawLine(0, i*fieldHeight, cvs.height, i*fieldHeight);
}

var fields = Array.from(Array(gameHeight), () => new Array(gameWidth));

for (let i = 0; i < gameWidth; i++) {
	for (let j = 0; j < gameHeight; j++) {
		fields[i][j] = WALL;
	}
}

// Functions -----------------------------------------

function drawLine(xStart, yStart, xEnd, yEnd) {
	ctx.beginPath();
	ctx.moveTo(xStart,yStart);
	ctx.lineTo(xEnd,yEnd);
	ctx.stroke();
}

function setItem (newItem) {
	item = newItem;
}

updateCvs = function() {
	for (let i = 0; i < gameWidth; i++) {
		for (let j = 0; j < gameWidth; j++) {
			ctx.drawImage(tiles[fields[i][j]], i*fieldWidth, j*fieldHeight ,fieldWidth, fieldHeight);
		}
	}
}



chgTs = function(path) {
	tiles[0] = new Image(fieldWidth,fieldHeight);
	tiles[0].src = path+"/hallway.jpg";
	tiles[1] = new Image(fieldWidth,fieldHeight);
	tiles[1].src = path+"/wall.jpg";
	tiles[2] = new Image(fieldWidth,fieldHeight);
	tiles[2].src = path+"/hole.jpg";
	tiles[3] = new Image(fieldWidth, fieldHeight);
	tiles[3].src = path+"/brick.jpg";
	updateCvs();
	var hallway = document.getElementById("btn-hallway");
	hallway.replaceChild(tiles[0],hallway.childNodes[0]);
	var wall = document.getElementById("btn-wall");
	wall.   replaceChild(tiles[1],wall.childNodes[0]);
	var hole = document.getElementById("btn-hole");
	hole.   replaceChild(tiles[2],hole.childNodes[0]);
	var brick = document.getElementById("btn-brick");
	brick.  replaceChild(tiles[3],brick.childNodes[0]);
}

cvs.onclick = function (evt) {
	var x = evt.layerX - cvs.offsetLeft;
	var y = evt.layerY - cvs.offsetTop;
	x = Math.floor(x/fieldWidth);
	y = Math.floor(y/fieldWidth);
	fields[x][y] = item;
	ctx.drawImage(tiles[item], x*fieldWidth, y*fieldHeight, fieldWidth, fieldHeight);
}

setItem(WALL);
chgTs("tileset1");

function saveMap(name) {
	var map = "[\n";
	for (let i = 0; i < gameHeight; i++) {
		map += "[";
		for (let j = 0; j < gameWidth; j++) {
			map += fields[i][j];
			if (j != fields.length-1) map += ',';
		}
		map += "]\n";
	}
	map += "]\n";
	var blob = new Blob([map],{type: "text/plain;charset=ascii"});
	saveAs(blob,name);
}

function readSingleFile(e) {
	var file = e.target.files[0];
	if (!file) {
		return;
	}
	var reader = new FileReader();
	reader.onload = function(e) {
	var contents = e.target.result;
	loadMap(contents);
	};
	reader.readAsText(file);
}

document.getElementById("map-input").addEventListener('change', readSingleFile, false);

function loadMap(mapStr) {
	var mapArr = [];
	var linePos = 0;
	var colPos = 0;
	for(let totalPos = 3; mapStr[totalPos] != undefined; totalPos++) {
		var line = [];
		while(mapStr[totalPos] != '\n') {
			const nxtChar = mapStr[totalPos];
			if (nxtChar != ',' && nxtChar != '[' && nxtChar != ']') {
				line.push(mapStr[totalPos]);
				linePos++;
			}
			totalPos++;
		}
		linePos = 0;
		mapArr[colPos] = line;
		colPos++;
	}
	for (let i = 0; i < gameWidth; i++) {
		for (let j = 0; j < gameHeight; j++) {
			fields[i][j] = mapArr[i][j];
		}
	}
	updateCvs();
}


