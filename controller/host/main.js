

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
	  sendButton = document.getElementById('sendButton');
	  messageInputBox = document.getElementById('message');
	  receiveBox = document.getElementById('receivebox');
  
	  // Set event listeners for user interface widgets
  
	  connectButton.addEventListener('click', connectPeers, false);
	  disconnectButton.addEventListener('click', disconnectPeers, false);
	  sendButton.addEventListener('click', sendMessage, false);
	}
	
	function connectPeers() {
	  // Create the local connection and its event listeners
	  
	  localConnection = new RTCPeerConnection();
	  
	  // Create the data channel and establish its event listeners
	  sendChannel = localConnection.createDataChannel("sendChannel");
	  sendChannel.onopen = handleSendChannelStatusChange;
		sendChannel.onclose = handleSendChannelStatusChange;
		sendChannel.ondatachannel = receiveChannelCallback;
	  
		startWS();
		/*
	  .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
	  .then(() => remoteConnection.createAnswer())
		.then(answer => remoteConnection.setLocalDescription(answer))
		.then(() => getRemoteDescription(remoteConnection.localDescription));
		*/
	 
	 
	}
	function createLocalConnection() {
		return localConnection.createOffer()
		.then(offer => localConnection.setLocalDescription(offer))
		.then(() => startWS(localConnection.localDescription));
	}
	function startWS(desc) {
		console.log(desc);
		ws = new WebSocket('ws://localhost/host');
    // event emmited when connected
    ws.onopen = function () {
        console.log('websocket is connected ...');
				// sending a send event to websocket server
				console.log(desc);
				//ws.send(JSON.stringify(desc));
    }
    // event emmited when receiving message 
    ws.onmessage = function (ev) {
				let message = JSON.parse(ev.data);
				console.log(message);
				if(message.type === 'id') {
					id = message.id;
					console.log(id);
				} else if(message.type === 'offer') {
					console.log('recieved message', message);
					sendAnswer(message);
					getConnectionDetails(localConnection)
					//.then((r) => console.log(r));
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
	function getRemoteDescription(desc) {
		localConnection.setRemoteDescription(desc)
		//.catch(handleCreateDescriptionError);
	}

	function getConnectionDetails(peerConnection){


		
		var connectionDetails = {};   // the final result object.
	
		if(window.chrome){  // checking if chrome
	
			var reqFields = [   'googLocalAddress',
													'googLocalCandidateType',   
													'googRemoteAddress',
													'googRemoteCandidateType'
											];
			return new Promise(function(resolve, reject){
				peerConnection.getStats(function(stats){
					console.log(stats.result());
					var filtered = stats.result().filter(function(e){return e.id.indexOf('Conn-audio')==0 && e.stat('googActiveConnection')=='true'})[0];
					if(!filtered) return reject('Something is wrong...');
					reqFields.forEach(function(e){connectionDetails[e.replace('goog', '')] = filtered.stat(e)});
					resolve(connectionDetails);
				});
			});
	
		}else{  // assuming it is firefox
			return peerConnection.getStats(null).then(function(stats){
					var selectedCandidatePair = stats[Object.keys(stats).filter(function(key){return stats[key].selected})[0]]
						, localICE = stats[selectedCandidatePair.localCandidateId]
						, remoteICE = stats[selectedCandidatePair.remoteCandidateId];
					connectionDetails.LocalAddress = [localICE.ipAddress, localICE.portNumber].join(':');
					connectionDetails.RemoteAddress = [remoteICE.ipAddress, remoteICE.portNumber].join(':');
					connectionDetails.LocalCandidateType = localICE.candidateType;
					connectionDetails.RemoteCandidateType = remoteICE.candidateType;
					return connectionDetails;
			});
	
		}
	}
	// Handle errors attempting to create a description;
	// this can happen both when creating an offer and when
	// creating an answer. In this simple example, we handle
	// both the same way.
	
	function handleCreateDescriptionError(error) {
	  console.log("Unable to create an offer: " + error.toString());
	}
	
	// Handle successful addition of the ICE candidate
	// on the "local" end of the connection.
	
	function handleLocalAddCandidateSuccess() {
	  connectButton.disabled = true;
	}
  
	// Handle successful addition of the ICE candidate
	// on the "remote" end of the connection.
	
	function handleRemoteAddCandidateSuccess() {
	  disconnectButton.disabled = false;
	}
  
	// Handle an error that occurs during addition of ICE candidate.
	
	function handleAddCandidateError() {
	  console.log("Oh noes! addICECandidate failed!");
	}
  
	// Handles clicks on the "Send" button by transmitting
	// a message to the remote peer.
	
	function sendMessage() {
	  var message = messageInputBox.value;
	  sendChannel.send(message);
	  
	  // Clear the input box and re-focus it, so that we're
	  // ready for the next message.
	  
	  messageInputBox.value = "";
	  messageInputBox.focus();
	}
	
	// Handle status changes on the local end of the data
	// channel; this is the end doing the sending of data
	// in this example.
	
	function handleSendChannelStatusChange(event) {
		console.log('boop');
	  if (sendChannel) {
		var state = sendChannel.readyState;
	  
			if (state === "open") {
				messageInputBox.disabled = false;
				messageInputBox.focus();
				sendButton.disabled = false;
				disconnectButton.disabled = false;
				connectButton.disabled = true;
			} else {
				messageInputBox.disabled = true;
				sendButton.disabled = true;
				connectButton.disabled = false;
				disconnectButton.disabled = true;
			}
	  }
	}
	
	// Called when the connection opens and the data
	// channel is ready to be connected to the remote.
	
	function receiveChannelCallback(event) {
	  receiveChannel = event.channel;
	  receiveChannel.onmessage = handleReceiveMessage;
	  receiveChannel.onopen = handleReceiveChannelStatusChange;
	  receiveChannel.onclose = handleReceiveChannelStatusChange;
	}
	
	// Handle onmessage events for the receiving channel.
	// These are the data messages sent by the sending channel.
	
	function handleReceiveMessage(event) {
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
	  
	  // Here you would do stuff that needs to be done
	  // when the channel's status changes.
	}
	
	// Close the connection, including data channels if they're open.
	// Also update the UI to reflect the disconnected status.
	
	function disconnectPeers() {
	
	  // Close the RTCDataChannels if they're open.
	  
	  sendChannel.close();
	  receiveChannel.close();
	  
	  // Close the RTCPeerConnections
	  
	  localConnection.close();
	  remoteConnection.close();
  
	  sendChannel = null;
	  receiveChannel = null;
	  localConnection = null;
	  remoteConnection = null;
	  
	  // Update user interface elements
	  
	  connectButton.disabled = false;
	  disconnectButton.disabled = true;
	  sendButton.disabled = true;
	  
	  messageInputBox.value = "";
	  messageInputBox.disabled = true;
	}
	
	// Set up an event listener which will run the startup
	// function once the page is done loading.
	
	window.addEventListener('load', startup, false);

	function connectController() {

	}
