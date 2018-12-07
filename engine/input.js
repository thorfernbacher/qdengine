let Input = {
	keys:{

	},
	setDefaut(k) {
		for(key in k) {
			if(Input.keys[key]) {

			}
		}
	}
}
window.addEventListener('keydown', (e) => {
	if (!e.repeat)
		
	else
		console.log(`keydown event repeats. key property value is "${e.key}"`);
});