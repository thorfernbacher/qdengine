"use strict"
const express = require('express'),
controller = require('./controller.js'),
http = require('http'),
app = express();

app.use('/connection', controller.router);

app.use(express.static('.'));

let server = http
.createServer(app)
.listen(80, console.log('server started'));


server.on('upgrade', controller.websocket);