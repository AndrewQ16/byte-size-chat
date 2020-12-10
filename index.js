const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:127.0.0.1:27017/";

const dbName = "chat";

const client = new MongoClient(url, { useUnifiedTopology: true });

// gives access to files in our public folder
app.use(express.static('public'));

/**
 * NOTE: Eventually do caching of messages depending on when last accessed/used, just caching in general
 */

// socket.id : {name, room};
const connectedUsers = new Map();

const roomUsers = new Map();

 // Here we are defining event listeners for the socket once a 'connection' is established
io.on('connection', (socket) => {

    socket.on('new-user',(packet) => {
        connectedUsers.set(socket.id, {'name': packet.name, 'room': packet.room});
        socket.join(packet.room);

        client.connect(async function(err, client) {
            let db = client.db(dbName);

            let retreivedMsgs = await db.collection(packet.room).find().sort({'date': -1}).limit(3).toArray();
            
            io.to(socket.id).emit('recent-msgs', retreivedMsgs);
        });


        // Gets the current users in a room to emit back to the client
        if(!roomUsers.has(packet.room)){
            roomUsers.set(packet.room, new Set());
        } 
        io.to(socket.id).emit('current-users', Array.from(roomUsers.get(packet.room)));
        roomUsers.get(packet.room).add(packet.name);


        // socket.broadcast will emit to everyone but the sender, then it's just .to(someRoom).emit()
        socket.broadcast.to(packet.room).emit('new-user', {'name': packet.name, 'room': packet.room});
        
        console.log(`${packet.name} has connected to room: "${packet.room}" w/ socket.id: ${socket.id}`); 
    });

    /**
     * When a client disconnects, delete them from the connectedUsers map and emit to the users of that
     * channel that the user has disconnected
     */
    socket.on('disconnect', () => {
        // console.log(`${socket.id} has disconnected`);
        let user = connectedUsers.get(socket.id);

        io.emit('dc-user', {'socket_id': socket.id, 'name': user.name});
        connectedUsers.delete(socket.id);
        console.log(`${user.name} disconnected from room ${user.room}.`);
    });

    /**
     * When a chat message is received, save it to the DB, and emit to all sockets but the original sender
     */
    socket.on('chat message', (packet) => {
        
        // We use an async function b/c inserting into the db is a Promise and may occur after the close()
        // thus we "await" it to keep that from occuring
        client.connect( async function(err, client) { 
            let db = client.db(dbName);
    
            await db.collection(packet.room).insertOne(
                {'name': packet.name, 'message': packet.msg, 'date': new Date()});
   
        });

        io.to(packet.room).emit('chat message', packet);
    });
});

/**
 * TODO: Add graceful shutdown support for Linux (POSIX) and Windows.
 * This is so that socket.io, express and mongodb can have their resources cleaned up.
 */


/**
 * Starts up the http server
 */
const port = 3000;
http.listen(port, () => {
    console.log(`listening on *:${port}`);
});
