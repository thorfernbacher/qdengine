controller = {
	connect(id) {
		id = messageInputBox.value;
		if(!id) id = '0000';
	  localConnection = new RTCPeerConnection();
	  sendChannel = localConnection.createDataChannel("sendChannel");
	  sendChannel.onopen = handleSendChannelStatusChange;
	  sendChannel.onclose = handleSendChannelStatusChange;
		sendChannel.onmessage = handleReceiveMessage;
		
		localConnection.onicecandidate = ({candidate}) => {
			if(candidate){
				console.log('sent candidate');
				ws.send(JSON.stringify(candidate));
			}
		};
		ws = new WebSocket(`ws://localhost/client?id=${id}`);
   
		ws.onopen = function () {
			console.log('websocket is connected ...');
			localConnection.createOffer()
			.then(offer => localConnection.setLocalDescription(offer))
			.then(() => {
				ws.send(JSON.stringify(localConnection.localDescription));
				console.log('Sent description');

			});
		}
		ws.onmessage = function (ev) {
			let message = JSON.parse(ev.data);
			console.log(message);
			if(message.type === 'id') {
				id = message.id;
				console.log(id);
			} else if(message.type === 'offer') {
				console.log('Received Offer: ', message);
				sendOffer(message);
			} else if (message.type == 'answer') {
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
	localConnection, // RTCPeerConnection for our "local" connection
	remoteConnection,
	sendChannel, // RTCDataChannel for the local (sender)
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
	/*
	function connectPeers() {
		//let id = messageInputBox.value;
		if(!id) id = '0000';
	  localConnection = new RTCPeerConnection();
	  sendChannel = localConnection.createDataChannel("sendChannel");
	  sendChannel.onopen = handleSendChannelStatusChange;
	  sendChannel.onclose = handleSendChannelStatusChange;
		sendChannel.onmessage = handleReceiveMessage;
		
		localConnection.onicecandidate = ({candidate}) => {
			if(candidate){
				console.log('sent candidate');
				ws.send(JSON.stringify(candidate));
			}
		};
		ws = new WebSocket(`ws://localhost/client?id=${id}`);
   
		ws.onopen = function () {
			console.log('websocket is connected ...');
			localConnection.createOffer()
			.then(offer => localConnection.setLocalDescription(offer))
			.then(() => {
				ws.send(JSON.stringify(localConnection.localDescription));
				console.log('Sent description');
			});
		}
		ws.onmessage = function (ev) {
			let message = JSON.parse(ev.data);
			console.log(message);
			if(message.type === 'id') {
				id = message.id;
				console.log(id);
			} else if(message.type === 'offer') {
				sendOffer(message);
			} else if (message.type == 'answer') {
				console.log("got ur message");

				localConnection.setRemoteDescription(message);
			}
		} 
	}
	*/
	function createLocalConnection() {
		return localConnection.createOffer()
		.then(offer => localConnection.setLocalDescription(offer))
		.then(() => startWS(localConnection.localDescription));
	}
	function startWS(desc) {
		console.log(desc);
		ws = new WebSocket(`ws://localhost/client?id=0000`);
    // event emmited when connected
		ws.onopen = function () {
			console.log('websocket is connected ...');
			// sending a send event to websocket server
			ws.send(JSON.stringify(desc));
		}

		// event emmited when receiving message 
		ws.onmessage = function (ev) {
			let message = JSON.parse(ev.data);
			console.log(message);
			if(message.type === 'id') {
				id = message.id;
				console.log(id);
			} else if(message.type === 'offer') {
				sendOffer(message);
			} else if (message.type == 'answer') {
				console.log("got ur message");

				localConnection.setRemoteDescription(message);
				//getConnectionDetails(localConnection);
			}
		}
	}
	function sendOffer(m) {
		localConnection.createAnswer()
		.then((o) => localConnection.setLocalDescription(o))
		.then(() => ws.send(JSON.stringify(localConnection.localDescription)));
	}

	function handleCreateDescriptionError(error) {
	  console.log("Unable to create an offer: " + error.toString());
	}
	
	function handleSendChannelStatusChange(event) {
	  if (sendChannel) {
		var state = sendChannel.readyState;
	  
			if (state === "open") {
				console.log("Connected");
				messageInputBox.disabled = true;
				messageInputBox.focus();
				disconnectButton.disabled = false;
				connectButton.disabled = true;
				window.addEventListener("keydown", (e) =>  sendChannel.send(e.key));
			} else {
				console.log("Disconnect");
				sendButton.disabled = true;
				connectButton.disabled = false;
				disconnectButton.disabled = true;
			}
	  }
	}
	// Handle onmessage events for the receiving channel.
	// These are the data messages sent by the sending channel.
	
	function handleReceiveMessage(event) {
		console.log('Got message');
	  var el = document.createElement("p");
	  var txtNode = document.createTextNode(event.data);
	  
	  el.appendChild(txtNode);
	  receiveBox.appendChild(el);
	}
	
	// Handle status changes on the receiver's channel.
	
	function handleReceiveChannelStatusChange(event) {
	  if (receiveChannel) {
		console.log("Receive channel's status has changed to " +
					receiveChannel.readyState);
	  }
	}
	
	// Set up an event listener which will run the startup
	// function once the page is done loading.
	window.addEventListener('load', startup, false);
