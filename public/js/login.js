const form = document.getElementById('login_form');
const username_input = document.getElementById('username');
const password_input = document.getElementById('password');


form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const data = {
        'username': username_input.value,
        'password': password_input.value
    }
    
    const response = await fetch('/auth/login', {
        method: 'POST',
        mode: 'same-origin',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        body: JSON.stringify(data)
    });
    console.log(`Will we redirect? ${response.redirected}`)

    if(response.redirected) {
        console.log(`Redirect to ${response.url}`);
        localStorage.setItem('username', username_input.value);
        window.location.href = response.url;
    }

});

