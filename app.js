const express = require('express');
const app = express();
const path = require('path');
const socket = require('socket.io');
const socketController = require('./socket-controller');

global.env = process.env.NODE_ENV || 'development';
const { port } = require(`./configuration/${env}`);

// Inititailize nanp
global.nanp = require('./nanp-script');
global.nanp.readFile();

// Static files path 
app.use(express.static('public'));
app.use('/output', express.static('public/output'));

// Controllers
app.get('/', (req, res) => res.sendFile(path.join(__dirname ,'/public', 'client.html')));
app.get('/socket.io.js', (req, res, next) => {
    return res.sendFile(__dirname + '/node_modules/socket.io-client/dist/socket.io.js');
}); 
app.get('/socket.io-file-client.js', (req, res, next) => {
    return res.sendFile(__dirname + '/node_modules/socket.io-file-client/socket.io-file-client.js');
});

// Initialize server 
const server = app.listen(port, () => console.log(`server started at port : ${port}`));

// Socket IO Events controller
const io = socket(server);
io.on('connection', socketController);

