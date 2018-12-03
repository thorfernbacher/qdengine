'use strict'
const express = require('express'),
bodyParser = require('body-parser'),
router = express(),
WebSocketServer = require('ws').Server,
wss = new WebSocketServer({port: 40510});

let hosts = {};

wss.on('connection', function (ws) {
  ws.on('message', function (message) {
	  message = JSON.parse(message);
	  if(message.type == 'offer') {
		let id;
		for(let i = 0; i < 100; i++) {
			id = Math.floor(46656 + (Math.random() * 1632959)).toString(36);
			id = id.toLocaleUpperCase();
			if(hosts[id]) {
				continue;
			} else {
				id = '0000';
				console.log('Assigned ID: ' + id);
				hosts[id] = {ws:ws, host:message};
				break;
			}
		}
		ws.send(JSON.stringify({type: 'id', id: id}));
		
	  }
  });
})



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
router.get(express.static('.'))
module.exports = router;