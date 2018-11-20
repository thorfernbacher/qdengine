let vS = `
	uniform mat3 uTransformToClipSpace;
	uniform float uAnimationPosition;

	attribute vec2 aPosition;
	attribute float aFromRadius, aToRadius;
	attribute vec3 aFromColor, aToColor;

	varying vec3 vColor;

	void main(void) {
		vec2 p = aPosition;
		vec2 pos = (uTransformToClipSpace * vec3(aPosition, 1.0)).xy;

		float radius = mix(aFromRadius, aToRadius, uAnimationPosition);
		vColor = mix(aFromColor, aToColor, uAnimationPosition);

		gl_Position = vec4(pos, 0.0, 1.0);
		gl_PointSize = radius * 30.0;
	}
	
	`;

let fS = `
	varying mediump vec3 vColor;

	void main(void) {
		const lowp float ALPHA = 0.75;

		lowp vec2 pos = gl_PointCoord - vec2(0.5, 0.5);
		lowp float dist_squared = dot(pos, pos);
		lowp float alpha;

		if (dist_squared < 0.25) {
			alpha = ALPHA;
		} else {
			alpha = 0.0;
		}

		gl_FragColor = vec4(vColor, alpha);
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
		gl.program = program;
		if (success) {
		  return program;
		}
	   
		console.log(gl.getProgramInfoLog(program));
		gl.deleteProgram(program);
	}
};

function main() {
	gl.init('#canvas');
	// Load and compile the shaders
	var fragmentShader = gl.buildShader(gl.FRAGMENT_SHADER, fS);
	
	var vertexShader = gl.createShader(gl.VERTEX_SHADER, vS);

	gl.buildProgram(vertexShader, fragmentShader);

	// Create the WebGL program
	gl.createProgram();
	
}