
let gl = null;
let glCanvas = null;

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
 attribute vec2 aVertexPosition;

 uniform vec2 uScalingFactor;
 uniform vec2 uRotationVector;

 void main() {
	 vec2 rotatedPosition = vec2(
		 aVertexPosition.x * uRotationVector.y +
					 aVertexPosition.y * uRotationVector.x,
		 aVertexPosition.y * uRotationVector.y -
					 aVertexPosition.x * uRotationVector.x
	 );

	 gl_Position = vec4(rotatedPosition * uScalingFactor, 0.0, 1.0);
 }
`;

const fsSource = `

	precision mediump float;

	uniform vec4 u_color;

	void main() {
	  gl_FragColor = u_color;
	}
`;


function main() {
	glCanvas = document.getElementById("canvas");
	canvas.width = canvas.clientWidth;
	canvas.height = canvas.clientHeight;
	gl = canvas.getContext("webgl");

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

  shaderProgram = buildShaderProgram(shaderSet);

  aspectRatio = gl.drawingBufferWidth/gl.drawingBufferHeight;
  currentRotation = [0, 1];
  currentScale = [1.0, aspectRatio];

  var positions = [
    0, 0
  ];
  let center = [0,0]; 
  let r = 0.5;
  for (let i = 0; i <= 200; i+=2){
      positions.push(r*Math.cos(i*2*Math.PI/200)); //x
      positions.push(r*Math.sin(i*2*Math.PI/200)); //y
  }
  vertexArray = new Float32Array(positions);

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

  vertexNumComponents = 2;
  vertexCount = 102;// vertexArray.length/vertexNumComponents;

  currentAngle = 0.0;
  rotationRate = 6;

  
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.8, 0.9, 0.7, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let radians = currentAngle * Math.PI / 180.0;
  currentRotation[0] = Math.sin(radians);
  currentRotation[1] = Math.cos(radians);

  gl.useProgram(shaderProgram);

  uScalingFactor = gl.getUniformLocation(shaderProgram, "uScalingFactor");
  u_color = gl.getUniformLocation(shaderProgram, "u_color");
  uRotationVector = gl.getUniformLocation(shaderProgram, "uRotationVector");

  gl.uniform2fv(uScalingFactor, currentScale);
  gl.uniform2fv(uRotationVector, currentRotation);
  gl.uniform4fv(u_color, [0.1, 0.7, 0.2, 1.0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");

  gl.enableVertexAttribArray(aVertexPosition);
  gl.vertexAttribPointer(aVertexPosition, vertexNumComponents,
        gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertexCount);

}

function buildShaderProgram(shaderInfo) {
  let program = gl.createProgram();

  shaderInfo.forEach(function(desc) {
    let shader = compileShader(desc.shader, desc.type);

    if (shader) {
      gl.attachShader(program, shader);
    }
  });

  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log("Error linking shader program:");
    console.log(gl.getProgramInfoLog(program));
  }

  return program;
}

function compileShader(s, type) {
  let shader = gl.createShader(type);

  gl.shaderSource(shader, s);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(`Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`);
    console.log(gl.getShaderInfoLog(shader));
  }
  return shader;
}
/*
function animateScene() {
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  gl.clearColor(0.8, 0.9, 0.7, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  let radians = currentAngle * Math.PI / 180.0;
  currentRotation[0] = Math.sin(radians);
  currentRotation[1] = Math.cos(radians);

  gl.useProgram(shaderProgram);

  uScalingFactor = gl.getUniformLocation(shaderProgram, "uScalingFactor");
  uGlobalColor = gl.getUniformLocation(shaderProgram, "uGlobalColor");
  uRotationVector = gl.getUniformLocation(shaderProgram, "uRotationVector");

  gl.uniform2fv(uScalingFactor, currentScale);
  gl.uniform2fv(uRotationVector, currentRotation);
  gl.uniform4fv(uGlobalColor, [0.1, 0.7, 0.2, 1.0]);

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

  aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");

  gl.enableVertexAttribArray(aVertexPosition);
  gl.vertexAttribPointer(aVertexPosition, vertexNumComponents,
        gl.FLOAT, false, 0, 0);

  gl.drawArrays(gl.TRIANGLES, 0, vertexCount);

  window.requestAnimationFrame(function(currentTime) {
    let deltaAngle = ((currentTime - previousTime) / 1000.0)
          * degreesPerSecond;

    currentAngle = (currentAngle + deltaAngle) % 360;

    previousTime = currentTime;
    animateScene();
  });
}
*/

let canvas, ctx,
up = {x:0, y: -1},
bottom = {x:0, y:50},
colors = [
	'#4e2cac',
	'#4186d3',
	'#4cf1cc',
	'#ff6c9a',
	'#e320a8',
	'#4df1cb'
],
bubbles = [];
function Bubble(x, y, size, color, speed) {
	this.x = x;
	this.y = y;
	this.size = size;
	this.color = color;
	this.speed = speed;
}
Bubble.prototype.move = function() {
	this.x += this.speed * up.x;
	this.y += this.speed * up.y; 
}
Bubble.add = () => {
	let size = Math.random() * 15 + 5,
	x = Math.random() * app.canvas.width,
	speed = (Math.random() + 0.5)/2,
	color = Math.floor(Math.random() * 5);
	bubbles.push(new Bubble(x, app.canvas.height + size, size, colors[color], speed));
	if(bubbles.length > 25) {
		bubbles.shift();
	}
};
Bubble.draw = () => {
	app.ctx.clearRect(0, 0, app.canvas.width, app.canvas.height);
	bubbles.forEach(bubble => {
		bubble.move();
		app.ctx.beginPath();
		app.ctx.arc(bubble.x, bubble.y, bubble.size, 0, 2* Math.PI);
		app.ctx.fillStyle = bubble.color;
		app.ctx.fill(); 
	});
	if(Math.random() < 0.03) {
		Bubble.add();
	}
	window.requestAnimationFrame(Bubble.draw);
}
