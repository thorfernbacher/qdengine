import {vec2} from '../vectors';
import {gl} from '../graphics';
export function GameElement({shader, position = vec2(0,0), rotation = vec2(0,0), scale = vec2(1,1), velocity = vec2}) {
	if (!new.target) 
		return new GameElement();
	this.shader = shader;
	this.position = position;
	this.rotation = rotation;
	this.scale = scale;
	this.velocity = velocity;
	let program = shader;
	var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");
	gl.useProgram(program);
	gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
	gl.bindBuffer(gl.ARRAY_BUFFER, gl.positionBuffer);
	var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
	gl.enableVertexAttribArray(positionAttributeLocation);
	
	// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
	var size = 2;          // 2 components per iteration
	var type = gl.FLOAT;   // the data is 32bit floats
	var normalize = false; // don't normalize the data
	var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
	var offset = 0;        // start at the beginning of the buffer
	gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

}
GameElement.prototype = {
	draw() {
		gl.resize();
		var positions = [
			this.position.x-0.5*this.scale.x, this.position.y+0.5*this.scale.y, //-0.5, 0.5
			this.position.x-0.5*this.scale.x, this.position.y-0.5*this.scale.y, //-0.5, -0.5
			this.position.x+0.5*this.scale.x, this.position.y-0.5*this.scale.y, //0.5, -0.5
			this.position.x-0.5*this.scale.x, this.position.y+0.5*this.scale.y, //-0.5, 0.5
			this.position.x+0.5*this.scale.x, this.position.y+0.5*this.scale.y, // 0.5, 0.5
			this.position.x+0.5*this.scale.x, this.position.y-0.5*this.scale.y // 0.5, -0.5
		];
		gl.vertexBuffer = gl.vertexBuffer.concat(positions);
		
	}
}
