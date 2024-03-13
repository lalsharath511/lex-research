document.getElementById('signUpBtn').addEventListener('click', function() {
    redirectTo('/register');
});

document.getElementById('signInBtn').addEventListener('click', function() {
    redirectTo('/login');
});

function redirectTo(page) {
    window.location.href = page;
}