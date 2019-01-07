//set default precision
precision mediump float;
uniform vec2 u_resolution;
varying vec4 v_color;
void main() {
	gl_FragColor = v_color;
}