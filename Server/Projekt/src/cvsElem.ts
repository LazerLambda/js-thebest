export class cvsElem {
	x:number; y:number;
	width:number; height:number;
	f:Function;
	pic:HTMLImageElement;
	constructor(x:number, y:number, width:number, height:number, f:Function, pic:HTMLImageElement) {
		this.x = x; this.y = y;
		this.width = width; this.height = height;
		this.f = f;
		this.pic = pic
	}
}