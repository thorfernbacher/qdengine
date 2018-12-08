let ws,
id,
connectButton,
disconnectButton,
sendButton,
messageInputBox,
receiveBox,
localConnection, 
dataChannel;



function connectPeers() {
	receiveBox = document.getElementById('receivebox');
	// Create the local connection and its event listeners
	
	localConnection = new RTCPeerConnection();
	localConnection.ondatachannel =  dataChannelCallback; 
	
	localConnection.onicecandidate = ({candidate}) => {};
	startWS();
	
}
function startWS(desc) {
	ws = new WebSocket('ws://localhost/host');
	// event emmited when connected
	ws.onopen = function () {
		console.log('WebSocket connected');
		
	}
	// event emmited when receiving message 
	ws.onmessage = function ({data}) {
		let message = JSON.parse(data);
		if(message.type === 'id') {
			id = message.id;
			document.getElementById('idbox').append(id);
		} else if(message.type === 'offer') {
			let s = message.sdp.split('\n')[1].slice(4);
			s = s.slice(0, s.indexOf(' '));
			console.log(s);
			sendAnswer(message);
		} else if(message.candidate) {
			console.log('Adding ICE Candidate');
			localConnection.addIceCandidate(message);
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
		var txtNode = document.createTextNode(q - new Date().getTime());
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

// Handle status changes on the receiver's channel.

function handleStatusChange(event) {
	if (dataChannel) {
		let state = dataChannel.readyState;
		if (state === "open") {
			console.log('Connected');
			let o = JSON.stringify({ts: new Date().getTime()});
			dataChannel.send(o);
		} else {
			console.log("Disconnect");
		}
	}
}

window.addEventListener('load', connectPeers, false);
