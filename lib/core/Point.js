export default class Point {
	x = 0;
	y = 0;
	z = 0;
	constructor({x=0, y=0, z=0} = {}) {
		this.x = x;
		this.y = y;
		this.z = z;
	}
	set({x=undefined, y=undefined, z=undefined}) {
		this.x = x === undefined ? this.x : x;
		this.y = y === undefined ? this.y : y;
		this.z = z === undefined ? this.z : z;
		return this;
	}
}