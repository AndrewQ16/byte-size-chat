const message_form = document.getElementById('new-message');
const socket = io();
const messages = document.getElementById('messages');

var name = "";
var room = "";

/**
 * When this client 'connect's to the server, emit a message to include this user's name
 */
socket.on('connect', ()=>{
    name = prompt("Please enter your name", "Unknown");
    room = prompt("Enter the room you'd like to join", "general");
    socket.emit('new-user', {'name': name, 'room': room});
    let connectedMsg = document.createElement('li');
    connectedMsg.innerText = `You (${name}) have connected`;
    messages.appendChild(connectedMsg);
    console.log(`emitted new-user: ${name}`);
});



/**
 * When a 'new-user' message is emitted from the server, display the message on the html
 */
socket.on('new-user', (userDetails) =>{
    let newUserMessage = document.createElement('li');
    newUserMessage.innerText = `${userDetails.name} has connected`;
    messages.appendChild(newUserMessage);
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
 * TODO: Retreive most recent 15 messages
 */
socket.on('recent-msgs', (packet) => {

});
