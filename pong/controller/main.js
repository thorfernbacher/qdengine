controller = {
	connect(id) {
		id = messageInputBox.value;
		if(!id) id = '0000';
		localConnection = new RTCPeerConnection();
		dataChannel = localConnection.createDataChannel("sendChannel");
		dataChannel.onopen = handleStatusChange;
		dataChannel.onclose = handleStatusChange;
		dataChannel.onmessage = handleReceiveMessage;
		
		localConnection.onicecandidate = ({candidate}) => {
			if(candidate){
				console.log('sent candidate');
				ws.send(JSON.stringify(candidate));
			}
		};
		ws = new WebSocket(`ws://${window.location.hostname}/client?id=${id}`);
		
		ws.onopen = function () {
			console.log('WebSocket connected');
			localConnection.createOffer()
			.then(offer => localConnection.setLocalDescription(offer))
			.then(() => {
				ws.send(JSON.stringify(localConnection.localDescription));
				console.log('Sent description');
				
			});
		}
		
		ws.onmessage = function (ev) {
			let message = JSON.parse(ev.data);
			if (message.type == 'answer') {
				console.log('Received Answer: ', message);
				localConnection.setRemoteDescription(message);
			}
		}
	}
	
};

// Define "global" variables
let ws,
id,
connectButton,
disconnectButton,
sendButton,
messageInputBox,
receiveBox,
localConnection, 
dataChannel, // RTCDataChannel for the local (sender)
receiveChannel; // RTCDataChannel for the remote (receiver)

// Set things up, connect event listeners, etc.

function startup() {
	connectButton = document.getElementById('connectButton');
	disconnectButton = document.getElementById('disconnectButton');
	messageInputBox = document.getElementById('message');
	receiveBox = document.getElementById('receivebox');
	
	// Set event listeners for user interface widgets
	
	connectButton.addEventListener('click', controller.connect, false);
}

function handleStatusChange() {
	if (dataChannel) {
		var state = dataChannel.readyState;
		if (state === "open") {
			console.log("Connected");
			messageInputBox.disabled = true;
			messageInputBox.focus();
			disconnectButton.disabled = false;
			connectButton.disabled = true;
			document.addEventListener("click", (e) =>  {
				dataChannel.send({ts:new Date().getTime()});
			});
		} else {
			console.log("Disconnect");
			connectButton.disabled = false;
			disconnectButton.disabled = true;
		}
	}
}

function handleReceiveMessage(event) {
	console.log('Got message');
	var el = document.createElement("p");
	var txtNode = document.createTextNode(event.data);
	
	el.appendChild(txtNode);
	receiveBox.appendChild(el);
}


window.addEventListener('load', startup, false);
