const message_form = document.getElementById('new-message');
const socket = io();
const messages = document.getElementById('messages');

var nickname = "";

/**
 * When this client 'connect's to the server, emit a message to include this user's nickname
 */
socket.on('connect', ()=>{
    nickname = prompt("Please enter your nickname", "Unknown");
    socket.emit('new-user', {'name': nickname});
    console.log(`emitted new-user: ${nickname}`);
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
 * Event for submitting on the form
 */
message_form.addEventListener('submit',(e)=> {
    e.preventDefault();
    let message = document.getElementById('m')
    // TODO: Trim the message
    if(message.value == ''){
        return;
    }
    socket.emit('chat message', {'name': nickname, 'msg': message.value});
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