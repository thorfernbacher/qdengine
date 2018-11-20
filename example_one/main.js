let vS = `
	//recives data from buffer
	attribute vec4 a_position;

	void main() {
		gl_Position = a_position;
	}`;

let fS = `
	//set default precision
	precision mediump float;
	
	void main() {
		gl_FragColor = vec4(1, 0, 0.5, 1);
	}
`;
let gl = {
	init: (s) => {
		let canvas = document.querySelector(s);
		gl = Object.assign(canvas.getContext("webgl"), gl);
		gl.resize();
	},
	resize: () => {
		var realToCSSPixels = window.devicePixelRatio;

		// Lookup the size the browser is displaying the canvas in CSS pixels
		// and compute a size needed to make our drawingbuffer match it in
		// device pixels.
		var displayWidth  = Math.floor(gl.canvas.clientWidth  * realToCSSPixels);
		var displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

		// Check if the canvas is not the same size.
		if (gl.canvas.width  !== displayWidth ||
			gl.canvas.height !== displayHeight) {

			// Make the canvas the same size
			gl.canvas.width  = displayWidth;
			gl.canvas.height = displayHeight;
		}
	},
	buildShader:function(type, source) {
		console.log(type);
		let shader = gl.createShader(type);
		
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (success) {
			return shader;
		}
	
		console.log(getShaderInfoLog(shader));
		gl.deleteShader(shader);
	},
	buildProgram: function(vertexShader, fragmentShader) {
		var program = gl.createProgram();
		gl.attachShader(program, vertexShader);
		gl.attachShader(program, fragmentShader);
		gl.linkProgram(program);
		var success = gl.getProgramParameter(program, gl.LINK_STATUS);
		if (success) {
		  return program;
		}
	   
		console.log(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
	}
};

var ctx;
function main() {
	gl.init('#canvas');


	var vertexShader = gl.buildShader(gl.VERTEX_SHADER, vS);
	var fragmentShader = gl.buildShader(gl.FRAGMENT_SHADER, fS);

	var program = gl.buildProgram(vertexShader, fragmentShader);

	//look up the position of the attribute
	var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

	var positionBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	

	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(1,1,1,1);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(program);

	gl.enableVertexAttribArray(positionAttributeLocation);

	// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
	var size = 2;          // 2 components per iteration
	var type = gl.FLOAT;   // the data is 32bit floats
	var normalize = false; // don't normalize the data
	var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
	var offset = 0;        // start at the beginning of the buffer
	gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

	var positions = [
		-0.5, 0.5,
		-0.5, -0.5,
		-0.5, 0.5,
	
		-0.5, 0.5,
		0.5, 0.5,
		-0.5, 0.5,
	
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	var primitiveType = gl.TRIANGLES;
	var offset = 0;
	var count = 6;
	gl.drawArrays(primitiveType, offset, count);
	
}
function range(n) {
	return n * Math.random();
}
function draw() {

	var positions = [];
	for(let i = 0; i <= 6; i++) {
		positions.push(2 * Math.random() - 1);
	}
	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	var primitiveType = gl.TRIANGLES;
	var offset = 0;
	var count = 3;
	gl.drawArrays(primitiveType, offset, count);
	requestAnimationFrame(draw);
}
window.onload = main;