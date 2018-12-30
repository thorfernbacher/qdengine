let Input = {

};

window.addEventListener('beforeinput', (e) => {
	logMessage(`beforeinput event. you are about inputing "${e.data}"`);
  });