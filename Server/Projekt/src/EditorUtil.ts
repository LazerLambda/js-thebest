export class MenuElement {
	x:number
	y:number
	width:number
	height:number
	f:Function
	pic:HTMLImageElement
	constructor(x:number, y:number, height:number, width:number, f:Function, pic:HTMLImageElement) {
		this.x = x
		this.y = y
		this.height = height
		this.width = width
		this.f = f
		pic.onload = function() {this.pic = pic}.bind(this)
	}
}

export class EnemyArea {

	topLeftPixelX:number
	topLeftPixelY:number
	pixelWidth:number
	pixelHeight:number

	constructor(topLeftPixelX:number, topLeftPixelY:number, pixelWidth:number, pixelHeight:number) {
		this.topLeftPixelX = topLeftPixelX
		this.topLeftPixelY = topLeftPixelY
		this.pixelWidth = pixelWidth
		this.pixelHeight = pixelHeight
	}
}

export class CustomArea extends EnemyArea {

	topLeftFieldY:number
	topLeftFieldX:number
	boardHeight:number
	boardWidth:number

	constructor(topLeftPixelX:number, topLeftPixelY:number, pixelWidth:number, pixelHeight:number, tileWidth:number, tileHeight:number) {
		super(topLeftPixelX, topLeftPixelY, pixelWidth, pixelHeight)
		this.topLeftFieldY = topLeftPixelY/tileHeight
		this.topLeftFieldX = topLeftPixelX/tileWidth
		this.boardHeight   = pixelHeight/tileHeight
		this.boardWidth    = pixelWidth/tileWidth
	}
}
