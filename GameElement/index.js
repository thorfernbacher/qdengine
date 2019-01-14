import {vec2} from '../vectors';
import {gl} from '../graphics';
export function GameElement({shader, position = vec2(0,0), rotation = vec2(0,0), scale = vec2(1,1), velocity = vec2(0,0), color ={r:1, g:1, b:1, a:1}}) {
	if (!new.target) 
		return new GameElement();
	this.shader = shader;
	this.position = position;
	this.rotation = rotation;
	this.scale = scale;
	this.velocity = velocity;
	this.color = color;
	if(!color.a) {
		this.color.a = 1;
	}
	this.program = shader;

	if(this.program === undefined) {
		this.program = gl.default;
		this.colorPos = gl.getUniformLocation(this.program, "u_color");
	} 

	this._on = {
		update:null,
		awake:null,
		start:null,
	}
	
}
GameElement.prototype = {
	draw() {
		var positions = [
			this.position.x-0.5*this.scale.x, this.position.y+0.5*this.scale.y, //-0.5, 0.5
			this.position.x-0.5*this.scale.x, this.position.y-0.5*this.scale.y, //-0.5, -0.5
			this.position.x+0.5*this.scale.x, this.position.y-0.5*this.scale.y, //0.5, -0.5
			this.position.x-0.5*this.scale.x, this.position.y+0.5*this.scale.y, //-0.5, 0.5
			this.position.x+0.5*this.scale.x, this.position.y+0.5*this.scale.y, // 0.5, 0.5
			this.position.x+0.5*this.scale.x, this.position.y-0.5*this.scale.y // 0.5, -0.5
		];
		gl.uniform4f(this.colorPos, this.color.r, this.color.g, this.color.b, this.color.a);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);	
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	},
	on(t, f) {
		if(!f || !t) return;
		if(this._on[t] === undefined) {
			throw new Error("Invalid lister type");
		} else {
			this._on[t] = f;
		}
		return this;
	}
}
