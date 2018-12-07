'use strict'
const express = require('express'),
bodyParser = require('body-parser'),
router = express(),
url = require('url'),
WebSocketServer = require('ws').Server,
host = new WebSocketServer({noServer: true}),
client = new WebSocketServer({noServer: true});

let hosts = {};

host.on('connection', function (ws) {
	let id;
	ws.on('message', function (message) {
		message = JSON.parse(message);
		if(message.type == 'answer') {
			console.log('sent');
			hosts[ws.id].client.send(JSON.stringify(message));
		} 
	});
	for(let i = 0; i < 100; i++) {
		id = Math.floor(46656 + (Math.random() * 1632959)).toString(36);
		id = id.toLocaleUpperCase();
		if(hosts[id]) {
			continue;
		} else {
			id = '0000'; //only for testing
			console.log('Assigned ID: ' + id);
			hosts[id] = {host:ws, clients:[]};
			break;
		}
	}
	ws.id = id;
	ws.send(JSON.stringify({type: 'id', id}));
	console.log('Host WebSocket Connected');
});

client.on('connection', function (ws, req) {
	ws.on('message', function (message) {
		message = JSON.parse(message);
		if(message.type == 'offer') {
			hosts[ws.id].host.send(JSON.stringify(message));
		} else if(message.candidate) {
			hosts[ws.id].host.send(JSON.stringify(message));
		}
	});
	
	let id = url.parse(req.url, true).query.id;
	hosts[id].client = ws;
	ws.id = id;

	console.log('Client WebSocket Connected');
});




router.use(bodyParser.json());

router.post('/host', (req,res) => {
	
});
router.post('/client', (req,res) => {
	let id = req.body.id;
	console.log(req.body);
	if(hosts[id]) {
		hosts[id].ws.send(JSON.stringify(req.body.content));
		res.json(hosts[id].host);
	} else {
		res.json('error');
	}
});
router.get(express.static('.'));

module.exports = { 
	websocket(request, socket, head) {
		const pathname = url.parse(request.url).pathname;
		
		if (pathname === '/host') {
			host.handleUpgrade(request, socket, head, function done(ws) {
				host.emit('connection', ws, request);
			});
		} else if (pathname === '/client') {
			client.handleUpgrade(request, socket, head, function done(ws) {
				client.emit('connection', ws, request);
			});
		} else {
			socket.destroy();
		}
	},
	router
};