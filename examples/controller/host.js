const ControllerHost = {
	min:1,
	max:Infinity,
	id:null,
	start() {
		ws = new WebSocket(`ws://${window.location.hostname}/host`);
		// event emmited when connected
		ws.onopen = function () {
			statusElem.innerHTML = 'WebSocket Connected';
		}
		// event emmited when receiving message 
		ws.onmessage = function ({data}) {
			let message = JSON.parse(data);
			if(message.type === 'id') {
				id = message.id;
				document.getElementById('idbox').append(id);
				statusElem.innerHTML = 'Waiting for Offer';
			} else if(message.type === 'offer') {
				statusElem.innerHTML = 'Sending Answer';
				sendAnswer(message);
			} else if(message.candidate) {
				console.log(message.candidate);
				statusElem.innerHTML = 'Added Candidate';
				localConnection.addIceCandidate(message)
				.catch(e => {
					console.error('ICE Candidate Error' + e.name);
				});
			}
			ControllerHost.onmessage(message);
		}
	},
	onmessage: m => {
		console.log('CH Message: '+ m);
	},
	onidassigned: id => {
		console.log('CH ID Assigned: ' + id);
	},
	onconnectMin() {
		console.log(controllers.count, '')
	},
	controllers: {
		list: [],
		count: 0,
		onicecandidate(controller, candidate) {

		}
	}
};
function Controller() {

}
Controller.prototype = {

}
let ws,
id,
connectButton,
disconnectButton,
sendButton,
messageInputBox,
receiveBox,
localConnection, 
dataChannel,
statusElem;



function connectPeers() {
	receiveBox = document.getElementById('receivebox');
	statusElem = document.getElementById('status');
	// Create the local connection and its event listeners
	
	localConnection = new RTCPeerConnection();
	localConnection.ondatachannel =  dataChannelCallback; 
	
	localConnection.onicecandidate = ({candidate}) => {
		if(candidate){
			statusElem
			ws.send(JSON.stringify(candidate));
		}
		
	};
	localConnection.onerror = e => {
		console.log(e);
	}
	startWS();
	
}
function startWS(desc) {
	ws = new WebSocket(`ws://${window.location.hostname}/host`);
	// event emmited when connected
	ws.onopen = function () {
		statusElem.innerHTML = 'WebSocket Connected';
	}
	// event emmited when receiving message 
	ws.onmessage = function ({data}) {
		let message = JSON.parse(data);
		if(message.type === 'id') {
			id = message.id;
			document.getElementById('idbox').append(id);
			statusElem.innerHTML = 'Waiting for Offer';
		} else if(message.type === 'offer') {
			statusElem.innerHTML = 'Sending Answer';
			sendAnswer(message);
		} else if(message.candidate) {
			console.log(message.candidate);
			statusElem.innerHTML = 'Added Candidate';
			localConnection.addIceCandidate(message)
			.catch(e => {
				console.error('ICE Candidate Error' + e.name);
			});
		}
	}
}
function sendAnswer(m) {
	localConnection.setRemoteDescription(m)
	.then(() => localConnection.createAnswer())
	.then(a => localConnection.setLocalDescription(a))
	.then(() => {
		ws.send(JSON.stringify(localConnection.localDescription));
		
	});
}


function dataChannelCallback(event) {
	console.log('Data Channel Added');
	dataChannel = event.channel;
	dataChannel.onmessage = handleMessage;
	dataChannel.onopen = handleStatusChange;
	dataChannel.onclose = handleStatusChange;
}
function Controller() {
	
}
messageHanders = {
	ts(q) {
		let t2 = new Date().getTime() - q;
		console.log(t2);
		dataChannel.send(JSON.stringify({td:t2}));
	},
	cd(q) {
		var el = document.createElement("p");
		var txtNode = document.createTextNode(new Date().getTime() - q);
		el.appendChild(txtNode);
		receiveBox.appendChild(el);
	}
};
function handleMessage({data}) {
	data = JSON.parse(data);
	var d = new Date();
	for(let p in data) {
		if(messageHanders[p]) {
			messageHanders[p](data[p]);
		}
	}
}

function handleStatusChange(event) {
	if (dataChannel) {
		let state = dataChannel.readyState;
		statusElem.innerHTML = 'Data Channel State: ' + state;
		console.log('Data Channel State: ' + state)
		if (state === "open") {
			let o = JSON.stringify({ts: new Date().getTime()});
			dataChannel.send(o);
		} 
	}
}

window.addEventListener('load', connectPeers, false);
