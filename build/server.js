require('source-map-support').install(); var app = require('./app'),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    config = require('../config');

io.origins('*:*'); // for latest version

var IO = require('../config/io');
exports.IO = new IO(app, io, server);

server.listen(config.port, function () {
	console.log('Server listening on port ' + config.port);
});
//# sourceMappingURL=server.js.map
