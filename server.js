"use strict"
const express = require('express'),
app = express();

app.use('/connection', require('./controller.js'));

app.use(express.static('.'));

app.listen(80);
