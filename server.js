/**
 * Module dependencies.
 */

var app = require('./app'),
    debug = require('debug')('VoteToEat:server'),
    http = require('http');
    socket = require('./sockets');

/**
 * Get port from environment and store in Express.
 */
//var port = normalizePort(process.env.PORT || process.env.OPENSHIFT_NODEJS_PORT || '3000');
var PORT = process.env.OPENSHIFT_NODEJS_PORT || 3000;
var IPADDRESS = process.env.OPENSHIFT_NODEJS_IP || 'localhost';
app.set('port', PORT);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

var io = require('socket.io').listen(server);
io.sockets.on('connection', socket);

server.listen(PORT, IPADDRESS);
server.on('error', onError);
server.on('listening', onListening);
console.log("Listening on: " + IPADDRESS + ":" + PORT);

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debug('Listening on ' + bind);
}
