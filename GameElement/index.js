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
	let program = shader;
	if(program === undefined) {
		program = gl.default;
	}
	if(program) {
		
		gl.useProgram(program);
		var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
		gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffers.positions);
		
		var colorAttributeLocation = gl.getAttribLocation(program, "a_color");
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffers.colors);
		// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
		var size = 4;          // 2 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
	
		gl.vertexAttribPointer(colorAttributeLocation, size, type, normalize, stride, offset);
		gl.enableVertexAttribArray(colorAttributeLocation);

		var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
		gl.bindBuffer(gl.ARRAY_BUFFER, gl.buffers.positions);
		gl.enableVertexAttribArray(positionAttributeLocation);
		
		// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
		var size = 2;          // 2 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
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
		
		gl.vertexBuffer = gl.vertexBuffer.concat(positions);
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
