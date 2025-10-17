// jquery-auth.js

$(document).ready(function(){
    function getUsers() {
        return JSON.parse(localStorage.getItem('users')) || [];
    }

    function saveUsers(users) {
        localStorage.setItem('users',JSON.stringify(users));
    }

    //Registration
    $('#registrationForm').on('submit', function(e) {
        e.preventDefault();

        const name = $('#name').val().trim();
        const email = $('#email').val().trim();
        const password = $('#password').val().trim();

        const users = getUsers();
        const userExists = users.find(u => u.email === email);

        if(userExists) {
            alert('Email has already been registered!');
            return;
        }

        users.push({ name, email, password });
        saveUsers(users);
        alert('Registration successful! you can now log in.')
        window.location.href = 'login.html';
    });

    //Login
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();

        const email = $('#email').val().trim();
        const password = $('#password').val().trim();

        const users = getUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            alert('Invalid email or password!');
            return;
        }

        localStorage.setItem('currentUser', JSON.stringify(user));
        alert(`Welcome, ${user.name}.`)
        window.location.href = 'dashboard.html';
    });

});
