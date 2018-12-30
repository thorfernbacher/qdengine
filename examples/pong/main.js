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
function vec2(x, y) {
	if (!new.target) 
		return new vec2(x,y);

	this.x = x;
	this.y = y;

}
vec2.prototype = {
	mag() {
		return Math.sqrt(this.x*this.x + this.y*this.y);
	},
	norm() {
		let m = this.mag();
		if(m > 0) {
			return this.div(m);
		} else {
			return new vec2(0, 0);
		}
	},
	div(n) {
		if (n instanceof vec2) {
			return new vec2(
				this.x/n.x,
				this.y/n.y
			);
		} else {
			return new vec2(this.x/n, this.y/n);
		}
	},
	mul(n) {
		if (n instanceof vec2) {
			return new vec2(
				this.x*n.x,
				this.y*n.y
			);
		} else {
			return new vec2(this.x*n, this.y*n);
		}
	},
	add(n) {
		if (n instanceof vec2) {
			return new vec2(
				this.x+n.x,
				this.y+n.y
			);
		} else {
			return new vec2(this.x+n, this.y+n);
		}
	}
}
vec2.lerp = function(v0, v1, t) {
	return v0.mul(1 - t).add(v1.mul(t));
}
vec2.toBuffer = function(a) {
	let b = [];
	for(c of a) {
		b.push(c.x);
		b.push(c.y);
	}
}


function connectPeers() {
	receiveBox = document.getElementById('receivebox');
	statusElem = document.getElementById('status');
	// Create the local connection and its event listeners
	
	localConnection = new RTCPeerConnection();
	localConnection.ondatachannel =  dataChannelCallback; 
	
	localConnection.onicecandidate = ({candidate}) => {
		if(candidate){
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
	},
	i(q) {
		paddle1.position.y += q * canvas.height;
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

window.addEventListener('load', () => {
	connectPeers();
	canvas = document.getElementById('canvas');
	ctx = canvas.getContext('2d');
	window.requestAnimationFrame(draw);
}, false);

let canvas,
ctx,
ball = {
	position: vec2(200,250),
	velocity: vec2(5,0),
	size: vec2(50,50),

	draw() {
		checkCollition();
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(ball.position.x - ball.size.x/2,
					ball.position.y - ball.size.y/2,
					ball.size.x,
					ball.size.y);
		ball.position = ball.position.add(ball.velocity);
	}
},
//left paddle
paddle1 = {
	position:vec2(20,250),
	size:vec2(10, 150),
	velocity: vec2(0,0),
	draw() {
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(this.position.x - this.size.x/2,
					this.position.y - this.size.y/2,
					this.size.x,
					this.size.y);
		this.position = this.position.add(this.velocity);
	}
},
//right paddle
paddle2 = {
	position:vec2(680,250),
	size:vec2(10,150),
	velocity: vec2(0,0),
	draw() {
		ctx.fillStyle = "#FFFFFF";
		ctx.fillRect(this.position.x - this.size.x/2,
					this.position.y - this.size.y/2,
					this.size.x,
					this.size.y);
		this.position = this.position.add(this.velocity);
	}
};


function draw() {
	//ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "#000000";
	ctx.fillRect(0,0, canvas.width,canvas.height);
	ball.draw();
	paddle1.draw();
	paddle2.draw();
	window.requestAnimationFrame(draw);
}
function checkCollition() {
	if(ball.position.x - ball.size.x/2 > canvas.width || ball.position.x + ball.size.x/2 < 0) {
		//point score
		ball.velocity.x = ball.velocity.x * -1;
	}
	if(ball.position.y + ball.size.y/2 > canvas.height || ball.position.y - ball.size.y/2 < 0) {
		ball.velocity.y = ball.velocity.y * -1;
	}

	
	if(ball.position.x - ball.size.x/2 < paddle1.position.x + paddle1.size.x/2 &&  (ball.position.y - ball.size.y/2 <  paddle1.position.y + paddle1.size.y/2 && ball.position.y + ball.size.y/2 > paddle1.position.y - paddle1.size.y/2)) {
		ball.velocity.x = ball.velocity.x * -1;
	}
	if(ball.position.x + ball.size.x/2 > paddle2.position.x - paddle2.size.x/2 && (ball.position.y - ball.size.y/2 < paddle2.position.y + paddle2.size.y/2 && ball.position.y + ball.size.y/2 > paddle2.position.y - paddle2.size.y/2)) {
		ball.velocity.x = ball.velocity.x * -1;
	}
}
document.addEventListener('keydown', (event) => {
	if(event.key == 'ArrowUp') {
		paddle1.velocity.y = -1;
	} else if(event.key == 'ArrowDown') {
		paddle1.velocity.y = 1;
	}
	console.log(event.key);
});
document.addEventListener('keyup', (event) => {
	if(event.key == 'ArrowUp') {
		paddle1.velocity.y = 0;
	} else if(event.key == 'ArrowDown') {
		paddle1.velocity.y = 0;
	}
});