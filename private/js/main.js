const message_form = document.getElementById('new-message');
const socket = io();
const messages = document.getElementById('messages');
const connectedUsers = document.getElementById('connectedUsers');

// current name to display
var name = "";

// single active room
var room = "";

// room: Set of online users
const onlineUsers = new Map();


/**
 * When this client 'connect's to the server, emit a message to include this user's name
 */
socket.on('connect', ()=>{
    name = prompt("Please enter your name", "Unknown");
    room = prompt("Enter the room you'd like to join", "general");
    socket.emit('new-user', {'name': name, 'room': room});
    let connectedMsg = document.createElement('li');
    connectedMsg.innerText = name;
    connectedUsers.appendChild(connectedMsg);
    
    onlineUsers.set(room, new Set());
});

/**
 * When a 'new-user' message is emitted from the server, display the message on the html
 */
socket.on('new-user', (userDetails) =>{
    // Display connected users on the right
    let newUser = document.createElement('li');
    newUser.innerText = userDetails.name;
    connectedUsers.appendChild(newUser);
    onlineUsers.get(room).add(userDetails.name);
    console.log(`'new-user' emitted for: ${userDetails.name}`);
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
 * When the client receives a message
 */
socket.on('chat message', function(packet) {
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

/**
 * Getting all online users for a room and displaying it for the current users
 */
socket.on('current-users', (packet) => {
    for(user of packet){

        if(onlineUsers.get(room).has(user)){
            continue;
        }
        onlineUsers.get(room).add(user);
        let onlineUser = document.createElement('li');
        onlineUser.innerText = user;
        connectedUsers.appendChild(onlineUser);
        console.log("Added: " + user);
    }
});

