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

	topLeftPixelY:number
	topLeftPixelX:number
	pixelHeight:number
	pixelWidth:number

	constructor(topLeftPixelY:number, topLeftPixelX:number, pixelHeight:number, pixelWidth:number) {
		this.topLeftPixelY = topLeftPixelY
		this.topLeftPixelX = topLeftPixelX
		this.pixelHeight = pixelHeight
		this.pixelWidth = pixelWidth
	}
}

export class CustomArea extends EnemyArea {

	topLeftFieldY:number
	topLeftFieldX:number
	boardHeight:number
	boardWidth:number

	constructor(topLeftPixelY:number, topLeftPixelX:number, pixelHeight:number, pixelWidth:number) {
		super(topLeftPixelY, topLeftPixelX, pixelHeight, pixelWidth)
		this.topLeftFieldY = topLeftPixelY/60
		this.topLeftFieldX = topLeftPixelX/60
		this.boardHeight   = pixelHeight/60
		this.boardWidth    = pixelWidth/60
	}
}
