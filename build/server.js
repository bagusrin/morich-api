require('source-map-support').install(); var http = require('http');
var app = require('./app');
var port = '3000';

var config = require('../config');

var server = http.createServer(app);

server.listen(config.port, function () {
  console.log('Server listening on port ' + config.port);
});
//# sourceMappingURL=server.js.map
