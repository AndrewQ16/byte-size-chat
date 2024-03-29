/**
 * Handle Socket creation (Socket.io: Socket class)
 */
require('dotenv').config()

module.exports = (http, _db) => {
    const io = require('socket.io')(http);
    const db = _db;
    /**
     * NOTE: Eventually do caching of messages depending on when last accessed/used, just caching in general
     */

    // socket.id : {name, room};
    const connectedUsers = new Map();

    const roomUsers = new Map();
    const jwt = require('jsonwebtoken');
    const cookie = require('cookie');
    
    /**
     * Middleware for authenticating the user. 
     * TODO: Redirect to the login page or throw an authenticaion based error message
     */
    io.use((socket, next) => {
        let cookies = cookie.parse(socket.handshake.headers.cookie);
        jwt.verify(cookies['accessToken'], process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                console.log(err)
                throw err;
            };
            socket.user = user;
            console.log(socket.user);
            next();
        })
        
    });
    

    // Here we are defining event listeners for the socket once a 'connection' is established
    io.on('connection', (socket) => {
        
        /**
         * When a user (socket) connects, tell all the users in it's current room that it has joined.
         * And sends the user a list of all connected users to the room
         */
        socket.on('new-user', async (packet) => {
            connectedUsers.set(socket.id, {'name': packet.name, 'room': packet.room});
            socket.join(packet.room);        
            
            let retreivedMsgs = await db.collection(packet.room).find().sort({'date': -1}).limit(3).toArray();
            io.to(socket.id).emit('recent-msgs', retreivedMsgs);

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
        socket.on('chat message', async (packet) => {
            
            // We use an async function b/c inserting into the db is a Promise and may occur after the close()
            // thus we "await" it to keep that from occuring
    
            await db.collection(packet.room).insertOne(
                {'name': packet.name, 'message': packet.msg, 'date': new Date()});

            io.to(packet.room).emit('chat message', packet);
        });
    });

    /**
     * TODO: Add graceful shutdown support for Linux (POSIX) and Windows.
     * This is so that socket.io, express and mongodb can have their resources cleaned up.
     */

    return io;
}

