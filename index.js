var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

// gives access to files in our public folder
app.use(express.static('public'));

/**
 * Current objective:
 * 
 */
var connectedUsers = new Map();


 // Here we are defining event listeners for the socket once a 'connection' is established
io.on('connection', (socket) => {
    socket.on('new-user', (packet) => {
        connectedUsers.set(socket.id, {'name': packet.name});
        io.emit('new-user', {'name': packet.name});
        console.log(`${packet.name} has connected.`);
    });
    
    socket.on('disconnect', () => {

        let user = connectedUsers.get(socket.id);
        io.emit('dc-user', {'socket_id': socket.id, 'name': user.name});
        connectedUsers.delete(socket.id);
        console.log(`${user.name} disconnected.`);
    });

    // When the client emits a message
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
});



const port = 3000;
http.listen(port, () => {
    console.log(`listening on *:${port}`);
});
