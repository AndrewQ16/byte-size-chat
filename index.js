var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:127.0.0.1:27017/";

const dbName = "chat";

const client = new MongoClient(url, { useUnifiedTopology: true });


// gives access to files in our public folder
app.use(express.static('public'));

/**
 * 
 * NOTE: Eventually do caching of messages depending on when last accessed/used, just caching in general
 */

// socket.id : {name, room};
var connectedUsers = new Map();

 // Here we are defining event listeners for the socket once a 'connection' is established
io.on('connection', (socket) => {
    socket.on('new-user', (packet) => {
        
        connectedUsers.set(socket.id, {'name': packet.name, 'room': packet.room});
        socket.join(packet.room);
        /**
         * TODO: Send the most recent 15 msgs for that room here
         */

        // socket.broadcast will emit to everyone but the sender, then it's just .to(someRoom).emit()
        socket.broadcast.to(packet.room).emit('new-user', {'name': packet.name, 'room': packet.room});
        
        console.log(`${packet.name} has connected to room: "${packet.room}" w/ socket.id: ${socket.id}`);
        
        
    });

    
    socket.on('disconnect', () => {
        console.log(`${socket.id} has disconnected`);
        let user = connectedUsers.get(socket.id);

        io.emit('dc-user', {'socket_id': socket.id, 'name': user.name});
        connectedUsers.delete(socket.id);
        console.log(`${user.name} disconnected from room ${user.room}.`);
    });

    // When the client emits a message
    socket.on('chat message', (packet) => {
        
        // connect, see if a collection exists for a room, if not create it and insert, if it does then insert into it
        client.connect( async function(err, client) { 
            const db = client.db(dbName);
            
                
            await db.collection(packet.room).insertOne(
                {'name': packet.name, 'message': packet.msg, 'date': new Date()});
            // console.log(`Inserted msg into "${packet.room}" collection`);
            client.close()
            
        });

        io.to(packet.room).emit('chat message', packet);
    });
});



const port = 3000;
http.listen(port, () => {
    console.log(`listening on *:${port}`);
});

