var listeningPort = 8080;
var uiDir = './public/';

var http = require('http');
var connect = require('connect');
var serveStatic = require('serve-static');
var app = connect();
app.use(serveStatic(uiDir));
var server = http.createServer(app);
server.listen(listeningPort);
console.log('Listening on port: http://localhost:' + listeningPort);