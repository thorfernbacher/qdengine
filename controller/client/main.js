controller = {
	connect(id) {
		id = messageInputBox.value;
		if(!id) id = '0000';
		localConnection = new RTCPeerConnection();
		dataChannel = localConnection.createDataChannel("sendChannel");
		dataChannel.onopen = handleStatusChange;
		dataChannel.onclose = handleStatusChange;
		dataChannel.onmessage = handleMessage;
		
		localConnection.onicecandidate = ({candidate}) => {
			if(candidate){
				console.log(candidate);
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
				statusElem.innerHTML = 'Received Answer';
				localConnection.setRemoteDescription(message);
			} else if(message.candidate) {
				statusElem.innerHTML = 'Adding ICE Candidate';
				localConnection.addIceCandidate(message)
				.catch(e => {
					console.error('ICE Candidate Error' + e.name);
				});
			}
		} 
	}	
};


let ws,
id,
connectButton,
sendButton,
messageInputBox,
receiveBox,
localConnection, 
dataChannel,
statusElem;


function startup() {
	connectButton = document.getElementById('connectButton');
	messageInputBox = document.getElementById('message');
	receiveBox = document.getElementById('receivebox');
	statusElem = document.getElementById('status');
	// Set event listeners for user interface widgets
	
	connectButton.addEventListener('click', controller.connect, false);
}

function handleStatusChange() {
	if (dataChannel) {
		var state = dataChannel.readyState;
		if (state === "open") {
			statusElem.innerHTML = 'Data Channel Open';
			messageInputBox.disabled = true;
			messageInputBox.focus();
			connectButton.disabled = true;
			document.addEventListener("click", (e) =>  {
				dataChannel.send(JSON.stringify({cd:new Date().getTime()+timeD}));
			});
		} else {
			statusElem.innerHTML = 'Data Channel Closed';
			connectButton.disabled = false;
			disconnectButton.disabled = true;
		}
	}
}
let timeD, t1, t2;
messageHanders = {
	ts(q) {
		t1 = new Date().getTime() - q;
		dataChannel.send(JSON.stringify({ts:new Date().getTime()}));
	},
	td(q) {
		t2 = q;
		timeD = (t2 - t1)/2;
		console.log('Time Difference: ' + timeD);
		var el = document.createElement("p");
		var txtNode = document.createTextNode('Time Difference ' + timeD);
		el.appendChild(txtNode);
		receiveBox.appendChild(el);
	}
};
function handleMessage({data}) {
	data = JSON.parse(data);
	
	for(let p in data) {
		if(messageHanders[p]) {
			messageHanders[p](data[p]);
		}
	}
}


window.addEventListener('load', startup, false);
