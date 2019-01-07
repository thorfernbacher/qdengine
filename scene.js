export function Scene() {
	this.elements = [];
}
Scene.prototype = {
	add(e) {
		this.elements.push(e);
	},
	update() {
		for(let e of this.elements) {
			e.draw();
			e._update();
		}
	}
};