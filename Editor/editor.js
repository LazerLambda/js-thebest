// Canvas an fieldsArray--------------------------------

		let selection = 0;
		function setSelection (newSelection) {
			selection = newSelection;
		}
		const WALL = 0;
		const HALLWAY = 1;
		const BRICKS = 2;
		const colors = ['brown', 'green', 'red'];

		const gameWidth = 8;
		const gameHeight = 8;
		cvs = document.getElementById("cv");
		ctx = cvs.getContext("2d");
		const fieldWidth = cvs.height/gameWidth;
		const fieldHeight = cvs.width/gameHeight;

		for (let i = 1; i < gameWidth; i++) {
			drawLine(i*fieldWidth, 0, i*fieldWidth, cvs.height);
		}
		for (let i = 1; i < gameHeight; i++) {
			drawLine(0, i*fieldHeight, cvs.height, i*fieldHeight);
		}

		var fields = Array.from(Array(gameHeight), () => new Array(gameWidth))

		for (let i = 0; i < 8; i++) {
			for (let j = 0; j < 8; j++) {
				fields[i][j] = 0;
			}
		}

// Functions -----------------------------------------

		function drawLine(xStart, yStart, xEnd, yEnd) {
			ctx.beginPath();
			ctx.moveTo(xStart,yStart);
			ctx.lineTo(xEnd,yEnd);
			ctx.stroke();
		}

		cvs.onclick = function (evt) {
    		var x = evt.layerX - cvs.offsetLeft;
    		var y = evt.layerY - cvs.offsetTop;
			x = Math.floor(x/fieldWidth);
			y = Math.floor(y/fieldWidth);
			fields[x][y] = selection;
			ctx.fillStyle = colors[selection];
			ctx.fillRect(x*fieldWidth, y*fieldHeight, fieldWidth, fieldHeight);
		}

		function saveMap() {
			var map = "";
			for (let i = 0; i < fields.length; i++) {
				for (let j = 0; j < fields.length; j++) {
					map += fields[i][j];
					if (j != fields.length-1) map += ',';
				}
				map += '\n';
			}

			var blob = new Blob([map],{type: "text/plain;charset=ascii"});
			saveAs(blob,"newMap2.txt");
		}
			
		function loadMap(fileName) {
			var csvStr = "";
			var xhr = new XMLHttpRequest();
			xhr.open("GET", fileName, false);
			xhr.send(null);
			csvStr += xhr.responseText;
			var map2dim = [];
			var totalPos = 0;
			var linePos = 0;
			var colPos = 0;
			while((csvStr[totalPos] != undefined)) {
				var line = [];
				while(/*(csvStr[totalPos] != '\n') &&*/ (totalPos < 10)) {
//					line[linePos] = csvStr[totalPos];
					linePos++;
					totalPos++;
					console.log(csvStr[totalPos]);
				}
				linePos = 0;
				map2dim[colPos] = line;
				colPos++;
			}
/*			var pos = 0;
			var line = [];
			while(map[pos] != undefined) {
				while(map[pos]!='\n') {
					var line
				var m = /(\d+)(\d+)(\d+)/.exec(map[line]);
				fields[line] = m;
				line++;
				pos++;
			}
			console.log(map);*/
		}

