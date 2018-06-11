var empty = require('is-empty');

function IO(app, io, http) {
	var FS 			= require('fs');
	var pathIO 		= require('path').join(__dirname, "../src/app/io/");

	io.use(function(socket,next) {
		if(empty(socket.request._query['userId'])){
			return next(new Error('authentication failed'));
			console.log('authentication failed');
		}else{
			return next();
		}
	});

	io.on('connection', function(socket) {
		
		console.log('socket.io connected');
		FS.readdirSync(pathIO).forEach(function (file) {
			if (file === 'index.js') return;

			if (file.substr(-3) == '.js') {
				var routeIO 	= require(pathIO + file);
				routeIO.io(app, io, http, socket);
			}
		});
	});
}

var IO_prototype 	= IO.prototype;
IO_prototype.getIO 	= function () {
	return this;
}

module.exports 	= IO;