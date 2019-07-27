const fieldType = {
  HALLWAY : 0,
  WALL : 1,
  HOLE : 2,
  BRICK : 3,
  STARTPOSITION : 4,
  CONNECTION : 5
}

function combineMaps(map0, map1, map2, map3) {

	const map0Height = map0.length
	const map0Width  = map0[1].length
	const map1Height = map1.length
	const map1Width  = map1[1].length
	const map2Height = map2.length
	const map2Width  = map2[1].length
	const map3Height = map3.length
	const map3Width  = map3[1].length

    const topLeftY0 = 0
    const topLeftX0 = 0
    const topLeftY1 = 0
    const topLeftX1 = map0Width
    const topLeftY2 = map0Height + 1
    const topLeftX2 = map0Width -1
    const topLeftY3 = map0Height
    const topLeftX3 = 0

    const fullMapHeight = map0Height + map3Height
    const fullMapWidth  = map0Width  + map1Width
	const mapCenterY = Math.floor(fullMapHeight/2)
	const mapCenterX = Math.floor(fullMapWidth/2)

    let fullMap = new Array(Array)
    for (let y = 0; y < fullMapHeight; y++) {
        let row_y = new Array
        for (let x = 0; x < fullMapWidth; x++) {
			row_y[x] = undefined
        }
        fullMap[y] = row_y
    }

	fullMap[mapCenterY][mapCenterX] = 5
/*
    for (let y = 0; y < 3; y++) {
        let row_y = new Array
        for (let x = 0; x < 2; x++) {
			row_y[x] = 1
		}
	}
*/
    for (let y = 0; y < map0Height; y++) {
        let row_y = map0[y]
		for (let x = 0; x < map0Width; x++) {
			fullMap[y+topLeftY0][x+topLeftX0] = row_y[x]
		}
	}

    for (let y = 0; y < map1Height; y++) {
        let row_y = map1[y]
		for (let x = 0; x < map1Width; x++) {
			fullMap[y+topLeftY1][x+topLeftX1] = row_y[x]
		}
	}

    for (let y = 0; y <  + map2Height; y++) {
        let row_y = map2[y]
		for (let x = 0; x < map2Width; x++) {
			fullMap[y+topLeftY2][x+topLeftX2] = row_y[x]
		}
	}

    for (let y = 0; y < map3Height; y++) {
        let row_y = map3[y]
		for (let x = topLeftX3; x < map3Width; x++) {
			fullMap[y+topLeftY3][x+topLeftX3] = row_y[x]
		}
	}
 	return fullMap
}

//Application example:

let map0 = new Array(Array)
let map1 = new Array(Array)
let map2 = new Array(Array)
let map3 = new Array(Array)

for (let i = 0; i < 2; i++){
	row_i = new Array
	for (let j = 0; j < 3; j++){
		row_i[j] = 0
	}
	map0[i] = row_i
}
for (let i = 0; i < 3; i++){
	row_i = new Array
	for (let j = 0; j < 2; j++){
		row_i[j] = 1
	}
	map1[i] = row_i
}
for (let i = 0; i < 2; i++){
	row_i = new Array
	for (let j = 0; j < 3; j++){
		row_i[j] = 2
	}
	map2[i] = row_i
}
for (let i = 0; i < 3; i++){
	row_i = new Array
	for (let j = 0; j < 2; j++){
		row_i[j] = 3
	}
	map3[i] = row_i
}

let combinedMaps = Array(Array)
combinedMaps = combineMaps(map0, map1, map2, map3)

	console.log("Map 0:")
	console.log(map0)
	console.log("Map 1:")
	console.log(map1)
	console.log("Map 2:")
	console.log(map2)
	console.log("Map 3:")
	console.log(map3)
	console.log("fullMap")
	console.log(combinedMaps)
