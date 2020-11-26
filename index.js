const { fileURLToPath } = require('url');

var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
        console.log('message:' + msg);
        io.emit('chat message', msg);
    });
});



const port = 3000;
http.listen(port, () => {
    console.log(`listening on *:${port}`);
});
