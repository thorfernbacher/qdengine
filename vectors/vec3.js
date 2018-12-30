export function vec3(x, y, z) {
	if (!new.target) 
		return new vec3(x,y,z);

	this.x = x;
	this.y = y;
	this.z = z;

}
vec3.prototype = {
	mag() {
		let w = Math.sqrt(this.x*this.x + this.y*this.y);
		return Math.sqrt(w*w + this.z*this.z);
	},
	norm() {
		let m = this.mag();
		if(m > 0) {
			return this.div(m);
		} else {
			return new vec3(0, 0, 0);
		}
	},
	div(n) {
		if (n instanceof vec3) {
			return new vec3(
				this.x/n.x,
				this.y/n.y,
				this.z/n.z
			);
		} else {
			return new vec3(this.x/n, this.y/n, this.z/n);
		}
	},
	mul(n) {
		if (n instanceof vec3) {
			return new vec3(
				this.x*n.x,
				this.y*n.y,
				this.z*n.z
			);
		} else {
			return new vec3(this.x*n, this.y*n, this.z*n);
		}
	}
}
