
import {gl} from './graphics/';
export {gl};
export {vec2} from './vectors/vec2.js';
export {vec3} from './vectors/vec3.js';
import {GameElement} from './GameElement';
export {GameElement, GameElement as ge};
export {camera} from './graphics/camera.js';
export {position, rotation, scale} from './transform.js';
export {Scene} from './scene.js';
export var Game = new GameElement({shader:null});
class QDEngine extends HTMLElement {
	constructor() {
	  super();
	}
	connectedCallback() {
		this.innerHTML += '<canvas id="qdengine-viewport"></canvas>';
		let canvas = document.getElementById('qdengine-viewport');
		gl.init(canvas);
		Game._on.awake();
	}
}
customElements.define('qd-engine', QDEngine);
