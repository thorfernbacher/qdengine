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
		vertexShader = gl.buildShader(gl.VERTEX_SHADER, vertexShader);
		fragmentShader = gl.buildShader(gl.FRAGMENT_SHADER, fragmentShader);
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