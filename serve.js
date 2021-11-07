const http = require('http');
const connect = require('connect');
const serveStatic = require('serve-static');

const app = connect();
app.use('/fumen-for-mobile',serveStatic('dest'));

const server = http.createServer(app);
const port = 8080;
server.listen(port);

console.log(`Listening: http://localhost:${port}/fumen-for-mobile`);
