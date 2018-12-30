import {gl} from './graphics/';
export {gl};
export {vec2} from './vectors/vec2.js';
export {vec3} from './vectors/vec3.js';
export {GameElement, GameElement as ge} from './GameElement';
export {camera} from './graphics/camera.js';
export {position, rotation, scale} from './transform.js';

class QDEngine extends HTMLElement {
	constructor() {
	  super();
	}
	connectedCallback() {
		this.innerHTML += '<canvas id="qdengine-viewport"></canvas>';
		let canvas = document.getElementById('qdengine-viewport');
		gl.init(canvas);
	}
}
customElements.define('qd-engine', QDEngine);