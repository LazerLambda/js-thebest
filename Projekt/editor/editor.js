// Canvas and fieldsArray--------------------------------

const WALL = 0;
const HALLWAY = 1;
const BRICK = 2;
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
	tiles[0].src = path+"/wall.jpg";
	tiles[1] = new Image(fieldWidth,fieldHeight);
	tiles[1].src = path+"/hallway.jpg";
	tiles[2] = new Image(fieldWidth,fieldHeight);
	tiles[2].src = path+"/brick.jpg";
	updateCvs();
	document.getElementById("WALL").src = path+"/wall.jpg";
	document.getElementById("HALLWAY").src = path+"/hallway.jpg";
	document.getElementById("BRICK").src = path+"/brick.jpg";
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
chgTs("t1");

function saveMap(name) {
	var map = "";
	for (let i = 0; i < fields.length; i++) {
		for (let j = 0; j < fields.length; j++) {
			map += fields[i][j];
			if (j != fields.length-1) map += ',';
		}
		map += '\n';
	}
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

function loadMap(csvStr) {
	var map2dim = [];
	var linePos = 0;
	var colPos = 0;
	for(let totalPos = 0; csvStr[totalPos] != undefined; totalPos++) {
		var line = [];
		while(csvStr[totalPos] != '\n') {
				if (csvStr[totalPos] != ',') {
					line.push(csvStr[totalPos]);
					linePos++;
				}
				totalPos++;
			}
		linePos = 0;
		map2dim[colPos] = line;
		colPos++;
	}
	for (let i = 0; i < map2dim.length; i++) {
		for (let j = 0; j < map2dim.length; j++) {
			fields[i][j] = map2dim[i][j];
		}
	}
	updateCvs();
}


