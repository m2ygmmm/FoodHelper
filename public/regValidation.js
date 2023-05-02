var passwordBox = document.getElementById('password');
var passwordBoxCheck = document.getElementById('passwordCheck');
var eyeButton = document.getElementById('eyeButton');
var passwordAlert = document.getElementById('passwordAlert');
var emailBox = document.getElementById('email');
var emailAlert = document.getElementById('emailAlert');
var errorAlert = document.getElementById('errorAlert');
var fnameBox = document.getElementById('fname');
var lnameBox = document.getElementById('lname');
var nameAlert = document.getElementById('nameAlert');
var submitBtn = document.getElementById('submitBtn');
var organizationNameBox = document.getElementById('organizationName');

passwordAlert.style.display = 'none';
emailAlert.style.display = 'none';
errorAlert.style.display = 'none';
nameAlert.style.display = 'none';
submitBtn.disabled = true;


fnameBox.onkeyup = function(){
    if (!/[^a-zA-Z]/.test(fnameBox.value)){
        nameAlert.style.display = 'none';
        fnameBox.style.color = 'green';
        submitBtn.disabled = false;
    }
    else{
        nameAlert.innerHTML = 'Please enter a name';
        nameAlert.style.display = 'block';
        fnameBox.style.color = 'red'
        submitBtn.disabled = true;

    }
}
lnameBox.onkeyup = function(){
    if (!/[^a-zA-Z]/.test(lnameBox.value)){
        nameAlert.style.display = 'none';
        lnameBox.style.color = 'green';
        submitBtn.disabled = false;

    }
    else{
        nameAlert.innerHTML = 'Please enter a name';
        nameAlert.style.display = 'block';
        lnameBox.style.color = 'red'
        submitBtn.disabled = true;
    }
}
organizationNameBox.onkeyup = function(){
    if (!/[^a-zA-Z]/.test(organizationNameBox.value)){
        nameAlert.style.display = 'none';
        organizationNameBox.style.color = 'green';
        submitBtn.disabled = false;

    }
    else{
        nameAlert.innerHTML = 'Please enter a name';
        nameAlert.style.display = 'block';
        organizationNameBox.style.color = 'red'
        submitBtn.disabled = true;
    }
}

emailBox.onkeyup = function(){
    var emailBoxValue = document.getElementById('email').value;
    const regexExp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/gi;
    var result = regexExp.test(emailBoxValue); 
    if(result == false){
        emailAlert.innerHTML = "Please enter a valid email address"
        emailAlert.style.display = 'block';
        submitBtn.disabled = true;
    }
    else{
        emailAlert.style.display = 'none';
        submitBtn.disabled = false;
    }
    
    
}

//Password length check
passwordBox.onkeyup = function(){
    var passwordBoxLength = document.getElementById('password').value;
    const regexExp = /^[a-zA-Z0-9!@#$%\^&*)(+=._-]*$/;
    var result = regexExp.test(passwordBoxLength); 
    if(result == false){
        document.getElementById('password').style.color = "red";
        passwordAlert.innerHTML = "Password cannot conatin spaces or special characters"
        passwordAlert.style.display = 'block';
        submitBtn.disabled = true;
    }
    if(passwordBoxLength.length <= 6){
        document.getElementById('password').style.color = "red";
        passwordAlert.innerHTML = "Password must contain more than six characters"
        passwordAlert.style.display = 'block';
        submitBtn.disabled = true;
    }
    else{
        document.getElementById('password').style.color = "green";
        passwordAlert.style.display = 'none';
        submitBtn.disabled = false;
    }
    if(passwordBoxLength.length >= 21){
        document.getElementById('password').style.color = "red";
        passwordAlert.innerHTML = "Password must not contain more than twenty characters"
        passwordAlert.style.display = 'block';
        submitBtn.disabled = true;
    }
    //Password is equal
    passwordBoxCheck.onkeyup = function(){
        var passwordBoxCheckLength = document.getElementById('passwordCheck').value;
        if(passwordBoxCheckLength != passwordBoxLength){
            document.getElementById('passwordCheck').style.color = "red";
            passwordAlert.innerHTML = " Passwords do not match"
            passwordAlert.style.display = 'block';
            submitBtn.disabled = true;
        }
        else{
            document.getElementById('passwordCheck').style.color = "green";
            passwordAlert.style.display = 'none';
            submitBtn.disabled = false;
        }
        
    }

}


function viewPassword(){
    if (passwordBox.type === "password" && passwordBoxCheck.type === "password") {
        passwordBox.type = "text";
        passwordBoxCheck.type = "text";
        eyeButton.className = "bi bi-eye"
    }
    else{
        passwordBox.type = "password"
        passwordBoxCheck.type = "password"
        eyeButton.className = "bi bi-eye-slash"
    }
}

const params = new URLSearchParams(window.location.search)
var isError = params.get('validationFail');
if(isError === 'true'){
    errorAlert.style.display = 'block';
}
else{
    errorAlert.style.display = 'none';
}