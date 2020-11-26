const message_form = document.getElementById('new-message');
const socket = io();
const messages = document.getElementById('messages');

var nickname = prompt("Please enter your nickname", "Unknown");

message_form.addEventListener('submit',(e)=> {
    e.preventDefault();
    let message = document.getElementById('m')
    if(message.value == ''){
        return;
    }
    socket.emit('chat message', message.value);
    message.value = '';
});

socket.on('chat message', function(msg) {
    let message = document.createElement('li');
    message.innerText = msg;
    console.log('message:' + message.innerText);
    messages.append(message);
});