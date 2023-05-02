var errorAlertLogin = document.getElementById('errorAlertLogin');
var passwordBox = document.getElementById('password');
var eyeButton = document.getElementById('eyeButton');

errorAlertLogin.style.display = 'none';

const params = new URLSearchParams(window.location.search)
var isError = params.get('validationFail');
if(isError === 'true'){
    errorAlertLogin.style.display = 'block';
}
else{
    errorAlertLogin.style.display = 'none';
}

function viewPassword(){
    if (passwordBox.type === "password") {
        passwordBox.type = "text";
        eyeButton.className = "bi bi-eye"
    }
    else{
        passwordBox.type = "password"
        eyeButton.className = "bi bi-eye-slash"
    }
}