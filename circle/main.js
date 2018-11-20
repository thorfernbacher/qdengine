let vS = `
	//recives data from buffer
	attribute vec4 a_position;

	void main() {
		gl_Position = a_position;
		gl_PointSize = 500.;
	}`;

let fS = `
	//set default precision
	precision mediump float;
	uniform vec2 u_resolution;
	#ifdef GL_OES_standard_derivatives
	#extension GL_OES_standard_derivatives : enable
	#endif
	
	void main() {
		float r = 0.0, delta = 0.0, alpha = 1.0;
		vec2 cxy = 2.0 * gl_PointCoord - 1.0;
		r = dot(cxy, cxy);
		delta = 0.01;
		alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
	
	gl_FragColor = vec4(0, 0, 0, alpha);
	}
`;


var ctx;
function main() {
	gl.init('#canvas');


	var program = gl.buildProgram(vS, fS);

	//look up the position of the attribute
	
	var positionBuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");


	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	gl.clearColor(0,0,0,0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	gl.useProgram(program);

	gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
	
	var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

	gl.enableVertexAttribArray(positionAttributeLocation);

	// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
	var size = 2;          // 2 components per iteration
	var type = gl.FLOAT;   // the data is 32bit floats
	var normalize = false; // don't normalize the data
	var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
	var offset = 0;        // start at the beginning of the buffer
	gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

	document.addEventListener('keydown', function(event) {
		if(event.keyCode == 87) {
			y++;
		}
		else if(event.keyCode == 83) {
			y--;
		}
	});

	requestAnimationFrame(draw);
}
let x = 0, y = 0;

function draw() {
	var positions = [
		x/10, y/10
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
	var primitiveType = gl.POINT;
	var offset = 0;
	var count = 1;
	gl.drawArrays(primitiveType, offset, count);
	requestAnimationFrame(draw);
}
window.onload = main;