function checkPass(){
    var password = document.getElementById('password').value;
    var retype = document.getElementById('retype').value;
    var error = document.getElementById('retype_error');
    if(retype != password) {
        error.innerHTML= "Retype password does not match. Check again!";
        return false;
    } else {
        error.innerHTML="";
        return true;
    }
}