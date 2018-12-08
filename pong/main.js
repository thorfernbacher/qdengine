let ws,
id,
connectButton,
disconnectButton,
sendButton,
messageInputBox,
receiveBox,
localConnection, 
dataChannel,
receiveChannel; 



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

function sendMessage() {
	var message = messageInputBox.value;
	console.log('Sending Message: ', message);
	sendChannel.send(message);
	
	// Clear the input box and re-focus it, so that we're
	// ready for the next message.
	
	messageInputBox.value = "";
	messageInputBox.focus();
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
	ts(d) {
		t2 = d - new Date().getTime();
			
	},
	td(d) {

	}
};
Time = {
	difference: 0,
	sync() {
		
	}
}
function handleMessage({data}) {
	({ts, td} = data);
	var el = document.createElement("p");
	var d = new Date();
	var txtNode = document.createTextNode(event.data - d.getTime());
	
	el.appendChild(txtNode);
	receiveBox.appendChild(el);
}

// Handle status changes on the receiver's channel.

function handleStatusChange(event) {
	if (receiveChannel) {
		
		let state = receiveChannel.readyState;
		if (state === "open") {
			console.log('Connected');
			//localConnection.send();
		} else {
			console.log("Disconnect");
		}
		
	}
}

window.addEventListener('load', connectPeers, false);
