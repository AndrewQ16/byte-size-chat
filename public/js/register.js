const form = document.getElementById('register_form');
const username_input = document.getElementById('username');
const email_input = document.getElementById('email');
const password_input = document.getElementById('password');


form.addEventListener('submit', handleSubmit);

async function handleSubmit(event) {
    event.preventDefault();
    const data = {
        'username': username_input.value,
        'email': email_input.value,
        'password': password_input.value
    }

    const response = await fetch('/auth/register', {
        method: 'POST',
        mode: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

}

/**
 * This function will check that the username isn't an empty field.
 * TODO: Should also check that the username is available
 */
function validUsername() {
    //toggle the red line for invalid user input
    if(username_input.value == ""){
        username_input.style.border = "0.1em solid red";
    } else{
        username_input.style.border = "";
    }
}

function validEmail(){
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if(!re.test(email_input.value)){
        email_input.style.border = "0.1em solid red";
    } else {
        email_input.style.border = "";
    }
}

function validPassword(){
    if(password_input.value.length < 8){
        password_input.style.border = "0.1em solid red";
    } else {
        password_input.style.border = "";
    }
}
