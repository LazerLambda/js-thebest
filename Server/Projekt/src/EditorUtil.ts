export class MenuElement {
	x:number
	y:number
	width:number
	height:number
	f:Function
	pic:HTMLImageElement
	constructor(x:number, y:number, width:number, height:number, f:Function, pic:HTMLImageElement) {
		this.x = x
		this.y = y
		this.width = width
		this.height = height
		this.f = f
		this.pic = pic
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
