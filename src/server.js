var app = require('./app'),
	server = require('http').Server(app),
	io = require('socket.io')(server),
	config = require('../config');

var IO 		= require('../config/io');
exports.IO 	= new IO(app, io, server);
 
server.listen(config.port, function() {
  console.log('Server listening on port ' + config.port);
});