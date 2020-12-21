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


