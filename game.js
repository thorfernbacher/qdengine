import {Scene} from './scene.js';
export var Game = {
	on(t, f) {
		if(!f || !t) return;
		if(_on[t]) {
			_on[t] = f;
		} else {
			throw new Error("Invalid lister type");
		}
		return this;
	},
	_on = {
		update:null,
		awake:null,
		start:null,
		fixedUpdate:null,
		load:null
	}
}