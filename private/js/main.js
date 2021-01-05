const message_form = document.getElementById('new-message');
const socket = io();
const messages = document.getElementById('messages');
const connectedUsers = document.getElementById('connectedUsers');

const username = localStorage.getItem('username');

const room_users = new Map();


/**
 * When this client 'connect's to the server, emit a message to include this user's name
 */
socket.on('connect', ()=>{
    
});

/**
 * Event for submitting a message on the form
 */
message_form.addEventListener('submit',(e)=> {
    e.preventDefault();
    let message = document.getElementById('m')
    // TODO: Trim the message
    if(message.value == ''){
        return;
    }
    socket.emit('chat message', {'name': name, 'msg': message.value, 'room': room});
    message.value = '';
});

/**
 * When there's a new user online, set active status
 */
socket.on('new-online', (packet) => {
    // Find the correct room key that the user is in and set the corresponding status to online
    // NOTE: The room should already exist
    room_users.get(packet.room).push({'username': packet.username, 'status': true});
});

/**
 * Receive {room: name, users: [all users of this room with their 'status' as well (online status = 'status')
 */
socket.on('room', (packet) => {
    room_users.set(packet.room, packet.users);

    // NOTE: The default active room is 'general'
});

/**
 * When the client receives a message display it.
 * TODO: Make sure the chat only appears in the appropriate place
 */
socket.on('chat message', (packet) => {
    let message = document.createElement('li');
    message.innerText = `${packet.name}: ${packet.msg}`;
    messages.append(message);
});

/**
 * When the client receives a disconnected user event
 */
socket.on('dc-user', (packet) => {
    let message = document.createElement('li');
    message.innerText = `${packet.name} has disconnected`;
    messages.append(message);
});

/**
 * TODO: When a "user-is-typing" event
 */
socket.on('user-typing', (packet) => {

});

/**
 * When recent messages are received, append them to the chat window
 */
socket.on('recent-msgs', (packet) => {
    for(let i = packet.length - 1; i > -1; --i){
        let message = document.createElement('li');
        message.innerText = `${packet[i].name}: ${packet[i].message}`;
        messages.append(message);
    }
});



