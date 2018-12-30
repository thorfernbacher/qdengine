
let gl = {
  buildBuffer: function(v) {
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  },
  set4fv: function(n, v) {
    let l = this.getUniformLocation(this.program, n);
    this.uniform4fv(l, v);
  },
  set4f: function(n, v0, v1, v2, v3) {
    let l = this.getUniformLocation(this.program, n);
    this.uniform4f(l, v0, v1, v2, v3);
  },
  buildProgram: function(shaderInfo) {
    let program = gl.createProgram();
  
    shaderInfo.forEach(function(desc) {
      let shader = gl.buildShader(desc.shader, desc.type);
    
      if (shader) {
        gl.attachShader(program, shader);
      }
    });
    
    gl.linkProgram(program)
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log(`Error linking shader program: ${gl.getProgramInfoLog(program)}`);
    }
    
    this.useProgram(program);
    this.program = program;
  },
  settupVertexAttr: function(n) {
    vertexNumComponents = 2;
    vertexCount = 102;  // vertexArray.length/vertexNumComponents;
    aVertexPosition = gl.getAttribLocation(gl.program, n);
    gl.enableVertexAttribArray(aVertexPosition);
    gl.vertexAttribPointer(aVertexPosition, vertexNumComponents,
          gl.FLOAT, false, 0, 0);
  },
  buildShader: function(s, type) {
    console.log(type);
    let shader = gl.createShader(type);
  
    gl.shaderSource(shader, s);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(`Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`);
      console.log(gl.getShaderInfoLog(shader));
    }
    return shader;
  }
},
canvas = null;

// Aspect ratio and coordinate system
// details
let aspectRatio;
let currentRotation = [0, 1];
let currentScale = [1.0, 1.0];

// Vertex information

let vertexArray;
let vertexBuffer;
let vertexNumComponents;
let vertexCount;

// Rendering data shared with the
// scalers.

let uScalingFactor;
let uGlobalColor;
let uRotationVector;
let aVertexPosition;

// Animation timing

let previousTime = 0.0;
let degreesPerSecond = 90.0;

window.onload = main;


 // Vertex shader program

 const vsSource = `
 attribute vec2 a_position;

 uniform vec2 u_resolution;

 
 void main() {
  // convert the rectangle from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(a_position, 0, 1);
 }
 

`;

const fsSource = `

	precision mediump float;

  uniform vec3 u_color;

	void main() {
    float r = 0.0, delta = 0.0, alpha = 1.0;
		vec2 cxy = 2.0 * gl_PointCoord - 1.0;
		r = dot(cxy, cxy);
		delta = 0.10;
		alpha = 1.0 - smoothstep(1.0 - delta, 1.0 + delta, r);
	
		gl_FragColor = vec4(0, 0, 0, alpha);
		

		gl_FragColor = vec4(u_color, alpha);
	}
`;


function main() {
	canvas = document.getElementById("canvas");
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	gl = Object.assign(gl, WebGLDebugUtils.makeDebugContext(canvas.getContext("webgl")));
  console.log(gl);
	// Only continue if WebGL is available and working
  if (gl === null) {
    alert("Unable to initialize WebGL. Your browser or machine may not support it.");
    return;
	}

  const shaderSet = [
    {
      type: gl.VERTEX_SHADER,
      shader: vsSource
    },
    {
      type: gl.FRAGMENT_SHADER,
      shader: fsSource
    }
  ];

  aspectRatio = gl.drawingBufferWidth/gl.drawingBufferHeight;
  currentRotation = [0, 1];
  currentScale = [1.0, aspectRatio];

  gl.buildBuffer();
  gl.buildProgram(shaderSet);

  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  // Clear the canvas
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

 
  gl.uniform3fv( gl.getUniformLocation(gl.program, 'u_color'), [0.1, 0.7, 0.7]);
  gl.settupVertexAttr("a_position");

  var resolutionUniformLocation = gl.getUniformLocation(gl.program, "u_resolution");
  var positionAttributeLocation = gl.getAttribLocation(gl.program, "a_position");
  var colorUniformLocation = gl.getUniformLocation(gl.program, "u_color");

  gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
  var points = [
    -0.5, 0.5,
    -0.5, -0.5,
    0.5, -0.5,
    0.5, -0.5,
    0.5, 0.5,
    -0.5, 0.5

  ];
 
  console.log(points);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  gl.uniform3f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1);
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 6;
  gl.drawArrays(primitiveType, offset, count);
  /*
  var primitiveType = gl.TRIANGLES;
  var offset = 0;
  var count = 3;
  gl.drawArrays(primitiveType, offset, count);
  */
  //requestAnimationFrame(animate);
}

// Returns a random integer from 0 to range - 1.
function randomInt(range) {
  return Math.floor(Math.random() * range);
}

// Fill the buffer with the values that define a rectangle.
function setRectangle(gl, x, y, width, height) {
  var x1 = x;
  var x2 = x + width;
  var y1 = y;
  var y2 = y + height;
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
     x1, y1,
     x2, y1,
     x1, y2,
     x1, y2,
     x2, y1,
     x2, y2,
  ]), gl.STATIC_DRAW);
}