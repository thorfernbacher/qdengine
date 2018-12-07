

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
	
	
	function connectPeers() {
		receiveBox = document.getElementById('receivebox');
	  // Create the local connection and its event listeners
	  
		localConnection = new RTCPeerConnection();
		localConnection.ondatachannel =  receiveChannelCallback; 
	
		localConnection.onicecandidate = ({candidate}) => {};
		startWS();
	 
	}
	function createLocalConnection() {
		return localConnection.createOffer()
		.then(offer => localConnection.setLocalDescription(offer))
		.then(() => startWS(localConnection.localDescription));
	}
	function startWS(desc) {
		ws = new WebSocket('ws://localhost/host');
    // event emmited when connected
    ws.onopen = function () {
        console.log('websocket is connected ...');
    }
    // event emmited when receiving message 
    ws.onmessage = function ({data}) {
				let message = JSON.parse(data);
				console.log(message);
				if(message.type === 'id') {
					id = message.id;
					document.getElementById('idbox').append(id);
				} else if(message.type === 'offer') {
					sendAnswer(message);
				} else if(message.candidate) {
						console.log('Adding IceCandidate');
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
  
	// Handles clicks on the "Send" button by transmitting
	// a message to the remote peer.
	
	function sendMessage() {
		var message = messageInputBox.value;
		console.log('Sending Message: ', message);
	  sendChannel.send(message);
	  
	  // Clear the input box and re-focus it, so that we're
	  // ready for the next message.
	  
	  messageInputBox.value = "";
	  messageInputBox.focus();
	}

	function receiveChannelCallback(event) {
	  receiveChannel = event.channel;
	  receiveChannel.onmessage = handleReceiveMessage;
	  receiveChannel.onopen = handleReceiveChannelStatusChange;
	  receiveChannel.onclose = handleReceiveChannelStatusChange;
	}
	
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
					receiveChannel.send("hello");
					
	  }
	}
	
	window.addEventListener('load', connectPeers, false);
