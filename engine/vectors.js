function vec3(x, y, z) {
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

function vec2(x, y) {
	if (!new.target) 
		return new vec2(x,y);

	this.x = x;
	this.y = y;

}
vec2.prototype = {
	mag() {
		return Math.sqrt(this.x*this.x + this.y*this.y);
	},
	norm() {
		let m = this.mag();
		if(m > 0) {
			return this.div(m);
		} else {
			return new vec2(0, 0);
		}
	},
	div(n) {
		if (n instanceof vec2) {
			return new vec2(
				this.x/n.x,
				this.y/n.y
			);
		} else {
			return new vec2(this.x/n, this.y/n);
		}
	},
	mul(n) {
		if (n instanceof vec2) {
			return new vec2(
				this.x*n.x,
				this.y*n.y
			);
		} else {
			return new vec2(this.x*n, this.y*n);
		}
	},
	add(n) {
		if (n instanceof vec2) {
			return new vec2(
				this.x+n.x,
				this.y+n.y
			);
		} else {
			return new vec2(this.x+n, this.y+n);
		}
	}
}
vec2.lerp = function(v0, v1, t) {
	return v0.mul(1 - t).add(v1.mul(t));
}
vec2.toBuffer = function(a) {
	let b = [];
	for(c of a) {
		b.push(c.x);
		b.push(c.y);
	}
}