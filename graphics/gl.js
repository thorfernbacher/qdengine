import dF from './default.frag';
import dV from './default.vert';
export let gl = {
	init(s) {
		let canvas = s;
		gl = Object.assign(canvas.getContext("webgl"), gl);
		gl.resize();
		gl.clearColor(0,0,0,0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.buffers.positions = gl.createBuffer();
		gl.buffers.colors = gl.createBuffer();
		
		gl.default = gl.buildProgram(dV, dF);
	},
	resize() {
		//make the canvas size the same size it is in pixels
		gl.canvas.width = Math.floor(gl.canvas.clientWidth  * window.devicePixelRatio);
		gl.canvas.height = Math.floor(gl.canvas.clientHeight * window.devicePixelRatio);
		//gl.canvas.width -= gl.canvas.width % 2 == 0 ? 0 : 1;
		//gl.canvas.height -= gl.canvas.height % 2 == 0 ? 0 : 1;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	},
	buildShader(type, source) {
		let shader = gl.createShader(type);
		
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
		if (success) {
			return shader;
		}
	
		console.log(gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
	},
	buildProgram(vertexShader, fragmentShader) {

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
		
	},
	vertexBuffer:[],
	colorBuffer:[],
	buffers:{}
};