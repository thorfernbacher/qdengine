window.onload = main;
let vertexShaderSource = `
  // an attribute will receive data from a buffer
  attribute vec4 a_position;
 
  // all shaders have a main function
  void main() {
 
    // gl_Position is a special variable a vertex shader
    // is responsible for setting
    gl_Position = a_position;
  }`;
let fragmentShaderSource = `
	// fragment shaders don't have a default precision so we need
	// to pick one. mediump is a good default
	precision mediump float;
	uniform vec4 u_color;
	void main() {
		// gl_FragColor is a special variable a fragment shader
		// is responsible for setting
		gl_FragColor = u_color; 
	}`;
var vertexShader,
fragmentShader,
program,
gl;
function main() {
	var glCanvas = document.getElementById("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gl = canvas.getContext("webgl");
	vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
	fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
	program = createProgram(gl, vertexShader, fragmentShader);
	
}

function createShader(gl, type, source) {
	var shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (success) {
	  return shader;
	}
   
	console.log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
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
