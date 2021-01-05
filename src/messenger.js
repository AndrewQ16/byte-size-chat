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

    // Keeps track of all currently online users
    const room_users = new Map();

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
         * When a user joins, inform all rooms that the user is a part of, that they are now online
         */
        socket.on('online', async (packet) =>{
            // Get user data to find rooms that they are a part of
            const user_info = await db.collection(env.process.USERS).findOne({'username': socket.user.username});
            const rooms = user_info.rooms;

            // emit every room with it's users to the current socket
            // and every room that the user is now online
            for(room of rooms){
                // If the room exists then add the user with it's online status or just create the room then do that
                if(!room_users.has(room)){
                    room_users.set(room, new Set());
                }
                room_users.get(room).add({'username': socket.user.username, 'status': true});
                
                const room_info = await(db.collection(env.process.CHAT_ROOM_USERS).findOne({'room': room}));
                const user_info = [];
                for(username of room_info.users){
                    if(room_users.get(room).has(username)){
                        user_info.push({'username': username, 'status': true});
                    } else {
                        user_info.push({'username': username, 'status': false});
                    }
                    
                }
                io.to(socket.id).emit('room', {'room': room_info.room, 'users': user_info});
                socket.to(room_info.room).emit('new-online', {'username': socket.user.username, 'room': room});
            }

            
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

